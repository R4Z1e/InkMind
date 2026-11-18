/* ============ v25: segredos do mapa de verdade ============
   Mesas no site (Firebase): o mapa completo fica em games/{id}/gmmaps (só o mestre lê) e os monstros/NPCs completos
   no documento secreto do mestre. O app do mestre publica para os jogadores só o que eles podem ver agora:
   games/{id}/maps = terreno, objetos, nomes, saques e portas das áreas visíveis (+1 casa de margem);
   game.chars = NPCs e monstros visíveis (ou no combate), sem inventário nem anotações. */
const SV=()=>ACL()&&!!(T.game&&T.game.sv);
const svSecSave=()=>{T._secDirty=true;secretSave()};
const NPC_PRIVATE=['inv','xp','notes','gm','gmNote','gmNotes','drops','secret'];
let PUBM={},PUBC='';
function svDilate(vis,w,h,r){const o=new Uint8Array(vis.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!vis[y*w+x])continue;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<w&&yy<h)o[yy*w+xx]=1}}return o}
const svPCs=mid=>(T.seats||[]).filter(s=>s.pos&&s.pos.m===mid).map(s=>({kind:'pc',id:s.uid,x:s.pos.x,y:s.pos.y}));
function svVis(m){try{return fogVis(m,svPCs(m.id))}catch(e){console.warn('visão',e);return new Uint8Array(m.w*m.h)}}   // null = sem névoa: tudo visível
function projMap(m){const vis=svVis(m),p=cl(m);p.sv=1;if(!vis)return p;
 const w=m.w,h=m.h,D=svDilate(vis,w,h,1),inD=(x,y)=>{x=Math.round(x);y=Math.round(y);return x>=0&&y>=0&&x<w&&y<h&&!!D[y*w+x]};
 const src=m.tiles||'';let t='';for(let i=0;i<w*h;i++)t+=D[i]?(src[i]||' '):' ';p.tiles=t;
 p.objs=(m.objs||[]).filter(o=>inD(o.x,o.y));p.labels=(m.labels||[]).filter(o=>inD(o.x,o.y));p.loot=(m.loot||[]).filter(o=>inD(o.x,o.y));
 if(m.links){p.links={};for(const k in m.links){const [x,y]=k.split(',').map(Number);if(inD(x,y))p.links[k]=cl(m.links[k])}}
 return p}
function stubMap(m){const n=(m.w|0)*(m.h|0);return{kind:'map',id:m.id,name:m.name,style:m.style,w:m.w,h:m.h,tiles:' '.repeat(n),objs:[],labels:[],loot:[],links:{},spawn:m.spawn||null,bg:null,fogOn:true,fog:'0'.repeat(n),vision:0,amb:m.amb||null,sv:1,stub:1}}
function svRelevant(){return new Set([T.game.activeMap,...(T.seats||[]).filter(s=>s.pos).map(s=>s.pos.m)].filter(Boolean))}
function projChars(){const rel=svRelevant(),vc={};const visAt=(mid,x,y)=>{const m=T.maps[mid];if(!m||!rel.has(mid))return false;if(!(mid in vc))vc[mid]=svVis(m);const v=vc[mid];return !v||!!v[Math.round(y)*m.w+Math.round(x)]};
 const cb=T.game.combat&&T.game.combat.on?new Set((T.game.combat.order||[]).filter(o=>o.kind!=='pc').map(o=>o.id)):new Set();
 const out=[];for(const c of T.game.chars||[]){const seen=!!(c.token&&c.token.m&&visAt(c.token.m,c.token.x,c.token.y));if(!seen&&!cb.has(c.id))continue;
  const p={};for(const k in c)if(!NPC_PRIVATE.includes(k))p[k]=cl(c[k]);if(!seen)delete p.token;out.push(p)}
 return out}
const _swSV=sharedWrite;
const publishView=debounce(()=>{if(!T.gid||!T.game||!isMaster()||!SV()||!T.gmReady)return;const gid=T.gid;
 if(T._pendChars&&T.secret){T.secret.chars=T._pendChars;T._pendChars=null;svSecSave()}
 const rel=svRelevant();
 for(const [mid,m] of Object.entries(T.maps||{})){const p=rel.has(mid)?projMap(m):stubMap(m),j=JSON.stringify(p);if(PUBM[gid+'/'+mid]!==j){PUBM[gid+'/'+mid]=j;_swSV('games/'+gid+'/maps/'+mid,{set:p})}}
 if(T.secret&&Array.isArray(T.secret.chars)){const pc=projChars(),j=gid+JSON.stringify(pc);if(PUBC!==j){PUBC=j;_swSV('games/'+gid,{patch:{chars:pc}})}}
},400);
sharedWrite=function(path,op){
 if(T.gid&&T.game&&op&&isMaster()&&SV()){
  const mm=/^games\/([^/]+)\/maps\/([^/]+)$/.exec(path);
  if(mm&&mm[1]===T.gid){_swSV.call(this,'games/'+mm[1]+'/gmmaps/'+mm[2],op);if(op.del){_swSV.call(this,path,{del:true});delete PUBM[mm[1]+'/'+mm[2]]}else publishView();return}
  if(path==='games/'+T.gid&&op.patch&&('chars' in op.patch)){const full=cl(op.patch.chars||[]);if(T.secret){T.secret.chars=full;svSecSave()}else T._pendChars=full;
   const rest={...op.patch};delete rest.chars;publishView();if(!Object.keys(rest).length)return;op={...op,patch:rest}}
 }
 return _swSV.call(this,path,op)};
function gmMapsSub(){if(!T.gid||T._gmSub===T.gid)return;T._gmSub=T.gid;T.gmReady=false;const gid=T.gid;
 T.unsub.push(S.db.collection('games/'+gid+'/gmmaps').onSnapshot(s=>{if(T.gid!==gid)return;const m={};s.docs.forEach(d=>{m[d.id]=cl(d.data())});T.gmMaps=m;T.gmReady=true;onTableData('maps')},e=>{console.warn('mapas do mestre',e);T._gmSub=null}))}
async function svMigrate(){if(!T.gid||T._svMig===T.gid||!T._mapsSeen||!T.secret||!T.game||T.game.sv||!isMaster()||!ACL())return;T._svMig=T.gid;const gid=T.gid;
 try{try{saveMapD.flush()}catch{}await new Promise(r=>setTimeout(r,400));if(T.gid!==gid)return;
  const maps=cl(T.maps||{});for(const [mid,m] of Object.entries(maps))await S.db.doc('games/'+gid+'/gmmaps/'+mid).set(m);
  T.secret={...T.secret,chars:cl(T.game.chars||[])};await S.db.doc(secretPath(gid)).set(cl(T.secret));
  await S.db.doc('games/'+gid).update({sv:1});T.game.sv=1;T.gmMaps=maps;gmMapsSub();T.gmReady=true;publishView();console.info('[inkmind] mesa protegida: segredos do mapa só com o mestre')}
 catch(e){console.warn('proteger mapa',e)}}
{const _otdSV=onTableData;onTableData=function(kind){
 if(kind==='maps'){T._mapsSeen=true;if(T.game&&isMaster()&&SV())T.maps=T.gmReady&&T.gmMaps?cl(T.gmMaps):{}}
 const r=_otdSV.apply(this,arguments);
 try{if(T.game&&T.gid&&ACL()&&isMaster()){if(SV()){gmMapsSub();publishView()}else svMigrate()}}catch(e){console.warn(e)}
 return r}}
{const _ctSV=closeTable;closeTable=function(){try{publishView.flush()}catch{}try{if(T._secDirty){T._secDirty=false;secretSave.flush()}}catch{}T._gmSub=null;T.gmReady=false;T.gmMaps=null;T._svMig=null;T._mapsSeen=false;T._pendChars=null;return _ctSV.apply(this,arguments)}}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&T.gid){try{publishView.flush()}catch{}try{if(T._secDirty){T._secDirty=false;secretSave.flush()}}catch{}}});
