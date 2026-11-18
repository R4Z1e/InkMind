/* ============ v12: backup completo (projeto + mesa de jogo + imagens) ============ */
async function readTable(gid,withSeats){if(!S.db||S.backend!=='cloud')return null;
 if(T.gid===gid&&T.game){try{saveMapD.flush()}catch{}const seats={};if(withSeats)T.seats.forEach(s=>{const{uid:u,gids,...rest}=s;seats[u]=cl(rest)});return{game:cl(T.game),maps:cl(T.maps),seats}}
 const g=await withTimeout(S.db.doc('games/'+gid).get(),15000);if(!g.exists)return null;const maps={};(await withTimeout(S.db.collection('games/'+gid+'/'+((g.data()||{}).sv&&ACL()?'gmmaps':'maps')).get(),15000)).docs.forEach(d=>maps[d.id]=d.data());
 const seats={};if(withSeats){try{(await withTimeout(S.db.collection('seats').where('gids','array-contains',gid).get(),15000)).docs.forEach(d=>{const x=(d.data()||{}).g||{};if(x[gid])seats[d.id]=x[gid]})}catch(e){console.warn(e)}}
 let gsec={};try{const sd=await S.db.doc('games/'+gid+'/secret/gm').get();if(sd.exists)gsec=sd.data()||{}}catch{}
 return{game:{...g.data(),...gsec},maps,seats}}
const BLOB_RE=/\/_blob\/[A-Za-z0-9_-]+/g;
async function buildBackup(pid,o,b){const src=(S.P&&S.P.id===pid)?S.P:S.projects.find(x=>x.id===pid);if(!src)throw new Error('Projeto não encontrado');
 if(S.P&&S.P.id===pid)await flushChapter();const p=cl(src);const chapters={};let i=0;
 for(const c of p.chapters){b&&b.set(`Lendo capítulos ${++i}/${p.chapters.length}…`);chapters[c.id]=await getChapter(c.id)}
 const cmts={};for(const c of p.chapters){try{const d=await Store.get('cm_'+c.id);if(d&&d.list&&d.list.length)cmts[c.id]=d.list}catch{}}
 const data={app:'inkmind',version:2,exportedAt:new Date().toISOString(),project:p,chapters};if(Object.keys(cmts).length)data.comments=cmts;
 if(o.table){b&&b.set('Lendo a mesa de jogo…');try{const t=await readTable(pid,o.seats);if(t)data.table=t}catch(e){console.warn(e);toast('Não consegui ler a mesa agora — o backup sai só com o projeto.','err')}}
 if(o.img){const urls=[...new Set(JSON.stringify(data).match(BLOB_RE)||[])];data.assets={};let k=0;for(const u of urls){b&&b.set(`Guardando imagens ${++k}/${urls.length}…`);try{const r=await fetch(u);if(r.ok)data.assets[u]=await fileToDataURL(await r.blob())}catch{}}}
 return data}
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
async function restoreAssets(data,b){const A=data.assets;delete data.assets;if(!A||!Object.keys(A).length)return data;let txt=JSON.stringify(data);const ent=Object.entries(A);let i=0;
 for(const [u,du] of ent){b&&b.set(`Restaurando imagens ${++i}/${ent.length}…`);let nu=null;
  try{const r=await fetch(u,{method:'GET'});if(r.ok&&(r.headers.get('content-type')||'').startsWith('image'))nu=u}catch{}
  if(!nu&&S.assets){try{const bl=await (await fetch(du)).blob();const up=await S.assets.upload(bl,{type:bl.type||'image/webp'});nu='/_blob/'+up.id}catch(e){console.warn(e)}}
  if(!nu)nu=du;if(nu!==u)txt=txt.replace(new RegExp(reEsc(u)+'(?![A-Za-z0-9_-])','g'),nu)}
 return JSON.parse(txt)}
async function writeTable(gid,t,o){const g={...cl(t.game),id:gid,masterId:S.uid,kind:'game',session:{...((t.game||{}).session||{}),on:false},combat:{...((t.game||{}).combat||{}),on:false},done:[],reqs:[],trans:null,restoredAt:Date.now()};if(o.title)g.title=o.title;const gsec={};['gmNotes','prep'].forEach(k=>{if(k in g){gsec[k]=g[k];delete g[k]}});['code','players','banned','access','sv'].forEach(k=>delete g[k]);
 await S.db.doc('games/'+gid).set(g);if(Object.keys(gsec).length){try{await S.db.doc('games/'+gid+'/secret/gm').set(gsec)}catch(e){console.warn('segredo',e)}}
 if(o.replace){try{const old=await S.db.collection('games/'+gid+'/maps').get();for(const d of old.docs)if(!(t.maps||{})[d.id])await S.db.doc('games/'+gid+'/maps/'+d.id).delete()}catch(e){console.warn(e)}}
 if(ACL()){try{const old=await S.db.collection('games/'+gid+'/gmmaps').get();for(const d of old.docs)await S.db.doc('games/'+gid+'/gmmaps/'+d.id).delete()}catch(e){console.warn(e)}if(T.gid===gid){T._svMig=null;T.gmMaps=null;T.gmReady=false}}
 for(const [mid,m] of Object.entries(t.maps||{}))await S.db.doc('games/'+gid+'/maps/'+mid).set(m);
 let ns=0;if(o.seats)for(const [u,entry] of Object.entries(t.seats||{})){if(!entry)continue;try{const ref=S.db.doc('seats/'+u),sn=await ref.get();if(sn.exists){const d=sn.data()||{};await ref.update({gids:[...new Set([...(d.gids||[]),gid])],g:{[gid]:entry}})}else await ref.set({uid:u,gids:[gid],g:{[gid]:entry}});ns++}catch(e){console.warn('ficha',u,e)}}
 return ns}
function markBackup(pid){const now=Date.now();if(T.gid===pid&&T.game&&isMaster()){gamePatch({lastBackup:now});return}if(S.db&&S.backend==='cloud')S.db.doc('games/'+pid).update({lastBackup:now}).catch(()=>{})}
async function backupDialog(pid){const p=(S.P&&S.P.id===pid)?S.P:S.projects.find(x=>x.id===pid);if(!p){toast('Projeto da campanha não encontrado.','err');return}const rpg=p.type==='rpg'&&S.backend==='cloud';
 const v=await modal({title:'💾 Backup completo',body:`<p style="margin-top:0">Baixa um arquivo com <b>${esc(p.title)}</b>: projeto e capítulos${rpg?', e a mesa de jogo — mapas, personagens e monstros, itens, habilidades, regras, missões, loja, revelações e Notas do mestre':''}.</p>
  <label class="toggle"><input type="checkbox" id="bkI" checked><span class="sw"></span>Guardar as imagens dentro do arquivo (recomendado — o arquivo fica maior)</label>
  ${rpg?'<label class="toggle"><input type="checkbox" id="bkT" checked><span class="sw"></span>Incluir a mesa de jogo</label><label class="toggle"><input type="checkbox" id="bkS" checked><span class="sw"></span>Incluir as fichas dos jogadores</label>':''}
  <p class="small muted">Para restaurar: Estante → Restaurar backup (cria uma cópia), ou Mestre → Regras → Restaurar nesta mesa.</p>`,
  actions:[{label:'Cancelar'},{label:'Baixar backup',cls:'primary',onClick:ov=>({img:$('#bkI',ov).checked,table:!!($('#bkT',ov)&&$('#bkT',ov).checked),seats:!!($('#bkS',ov)&&$('#bkS',ov).checked)})}]});
 if(!v)return;const b=busy('Preparando backup…');try{const data=await buildBackup(pid,v,b);const json=JSON.stringify(data);await saveFile(slug(p.title)+(data.table?'-campanha':'')+'-backup.json',new Blob([json],{type:'application/json'}));if(data.table)markBackup(pid);
  const parts=[data.table?`mesa com ${Object.keys(data.table.maps||{}).length} mapa(s), ${(data.table.game.chars||[]).length} personagem(ns)`+(v.seats?` e ${Object.keys(data.table.seats||{}).length} ficha(s) de jogador`:''):'',data.assets?Object.keys(data.assets).length+' imagem(ns)':''].filter(Boolean);if(parts.length)setTimeout(()=>toast('Backup inclui: '+parts.join(' · ')),1200)}
 catch(e){console.warn(e);toast('Não consegui gerar o backup: '+(e.message||e),'err')}finally{b.done()}}
ACT.backup=()=>backupDialog(P().id);
ACT.tblBackup=()=>backupDialog(T.gid);
ACT.importBackup=async()=>{
 const [f]=await pickFile('.json,application/json');if(!f)return;let data;
 try{data=JSON.parse(await f.text());if(!['escritas','inkmind'].includes(data.app)||!data.project)throw 0}catch{toast('Arquivo de backup inválido.','err');return}
 let withTable=false,withSeats=false;
 if(data.table){if(S.backend!=='cloud')toast('Este backup tem uma mesa de jogo; ela só pode ser restaurada '+CLOUD_NEED()+'. Restaurando só o projeto.');
  else{const v=await modal({title:'Restaurar backup',body:`<p style="margin-top:0">“${esc(data.project.title)}” será restaurado como um <b>novo projeto</b> na sua estante.</p><label class="toggle"><input type="checkbox" id="riT" checked><span class="sw"></span>Restaurar também a mesa de jogo (${Object.keys(data.table.maps||{}).length} mapa(s), ${(data.table.game.chars||[]).length} personagem(ns))</label>${Object.keys(data.table.seats||{}).length?`<label class="toggle"><input type="checkbox" id="riS" checked><span class="sw"></span>Devolver as fichas aos jogadores (${Object.keys(data.table.seats).length}) — eles verão a mesa restaurada em “Minhas mesas”</label>`:''}`,actions:[{label:'Cancelar'},{label:'Restaurar',cls:'primary',onClick:ov=>({t:$('#riT',ov).checked,s:!!($('#riS',ov)&&$('#riS',ov).checked)})}]});
   if(!v)return;withTable=v.t;withSeats=v.t&&v.s}}
 const b=busy('Restaurando…');
 try{data=await restoreAssets(data,b);const p=data.project;const oldChs=data.chapters||{};
  p.id=uid();p.kind='project';p.title=p.title+(S.projects.some(x=>x.title===p.title)?' (cópia)':'');
  const idmap={};p.chapters=p.chapters.map(c=>{const nid=uid();idmap[c.id]=nid;const d=oldChs[c.id]||{};queueWrite('c_'+nid,{kind:'chapter',pid:p.id,id:nid,html:d.html||'',notes:d.notes||''});return{...c,id:nid}});
  if(Array.isArray(p.outline))p.outline=p.outline.map(n=>n.t==='f'?{...n,id:uid(),items:(n.items||[]).map(i=>idmap[i]).filter(Boolean)}:{t:'c',id:idmap[n.id]}).filter(n=>n.t==='f'||n.id);
  p.drafts=Array.isArray(p.drafts)?p.drafts.map(i=>idmap[i]).filter(Boolean):[];
  p.settings=Object.assign(defaultSettings(p.type,p.title),p.settings||{});p.lastCh=null;delete p.published;Object.entries(data.comments||{}).forEach(([o,list])=>{const nid=idmap[o];if(nid)queueWrite('cm_'+nid,{kind:'comments',pid:p.id,cid:nid,list})});
  S.projects.push(clone(p));queueWrite('p_'+p.id,p);
  let ns=0;if(withTable&&data.table){b.set('Restaurando a mesa de jogo…');ns=await writeTable(p.id,data.table,{seats:withSeats,title:p.title})}
  renderHome();toast('Backup restaurado: '+p.title+(withTable?' · mesa restaurada'+(ns?` com ${ns} ficha(s)`:''):''))}
 catch(e){console.warn(e);toast('Não consegui restaurar: '+(e.message||'erro'),'err')}finally{b.done()}};
ACT.tblRestore=async()=>{if(!isMaster())return;const [f]=await pickFile('.json,application/json');if(!f)return;let data;
 try{data=JSON.parse(await f.text());if(!data.table||!data.table.game)throw 0}catch{toast('Esse arquivo não tem uma mesa de jogo.','err');return}
 const nS=Object.keys(data.table.seats||{}).length;
 const v=await modal({title:'Restaurar nesta mesa',body:`<p style="margin-top:0"><b>Tudo nesta mesa será substituído</b> pelo backup de ${esc(new Date(data.exportedAt||Date.now()).toLocaleString('pt-BR'))}: mapas, personagens, monstros, itens, habilidades, regras, missões, loja e notas. A sessão e o combate em andamento serão encerrados.</p>${nS?`<label class="toggle"><input type="checkbox" id="rtS" checked><span class="sw"></span>Restaurar também as fichas dos jogadores (${nS})</label>`:''}<p class="small muted">Dica: baixe um backup do estado atual antes, se quiser poder voltar.</p>`,
  actions:[{label:'Cancelar'},{label:'Substituir tudo',cls:'danger',onClick:ov=>({s:!!($('#rtS',ov)&&$('#rtS',ov).checked)})}]});
 if(!v)return;const b=busy('Restaurando a mesa…');
 try{data=await restoreAssets(data,b);const ns=await writeTable(T.gid,data.table,{replace:true,seats:v.s,title:T.game.title});T.view='tabs';toast('Mesa restaurada'+(ns?` com ${ns} ficha(s)`:''));setTimeout(()=>{if(T.gid){renderTableShell();renderTab()}},600)}
 catch(e){console.warn(e);toast('Não consegui restaurar: '+(e.message||'erro'),'err')}finally{b.done()}};
const _mrRulesV11=MR.rules;
MR.rules=()=>{_mrRulesV11();const pad=$('#tMain .tpad');if(!pad)return;const lb=T.game.lastBackup;
 pad.insertAdjacentHTML('beforeend',`<div class="card" style="margin-top:14px"><h3>💾 Backup da campanha</h3><p class="small muted" style="margin-top:0">Um arquivo com tudo: projeto, capítulos, mapas, personagens, monstros, itens, regras, missões, loja, Notas do mestre, fichas dos jogadores e imagens. Guarde no seu computador ou na nuvem.</p><p class="small">${lb?'Último backup: <b>'+esc(new Date(lb).toLocaleString('pt-BR'))+'</b>':'<b>Nenhum backup ainda.</b>'}</p><div class="row wrap"><button class="btn primary" data-act="tblBackup">⬇ Baixar backup</button><button class="btn" data-act="tblRestore">⬆ Restaurar nesta mesa</button></div></div>`)};
const _sessEnd12=ACT.sessEnd;ACT.sessEnd=async()=>{const was=T.game&&T.game.session&&T.game.session.on;await _sessEnd12();const lb=T.game&&T.game.lastBackup;if(was&&T.game&&!(T.game.session&&T.game.session.on)&&(!lb||Date.now()-lb>7*864e5))setTimeout(()=>toast('Dica: guarde um backup da campanha em Mestre → Campanha → 💾 Backup.'),1500)};
