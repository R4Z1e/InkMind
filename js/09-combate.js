/* ============ v8: regras jogáveis — combate, turnos, ações, XP ============ */
MT.rules=['Regras','dice'];
const XP_TABLE=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
const fById=id=>tplFields(T.game.template).find(f=>f.id===id);
const fLab=lab=>lab?tplFields(T.game.template).find(f=>f.label===lab):null;
const fByRe=(re,types)=>tplFields(T.game.template).find(f=>(!types||types.includes(f.type))&&re.test(f.label));
function autoRules(){const g=(re,t)=>(fByRe(re,t)||{}).id||'';
 return{hp:g(/vida|\bpv\b|\bhp\b|sa[uú]de/i,['bar']),mp:g(/mana|\bpm\b|energia|\bmp\b|foco|sanidade/i,['bar']),def:g(/defesa|\bca\b|armadura|esquiva/i,['number','attr','text']),speed:g(/desloc|movim|velocid/i,['text','number']),init:g(/^des\b|destreza|agilidade|reflexo|^des$/i,['attr','number']),level:g(/n[ií]vel/i,['number']),con:g(/^con\b|^con$|constitui|vigor/i,['attr','number'])}}
function RULES(){const a=autoRules(),r=(T.game&&T.game.rules)||{},o={...a};['hp','mp','def','speed','init','level','con'].forEach(k=>{if(r[k]!=null&&r[k]!=='')o[k]=r[k]==='-'?'':r[k]});
 return{...o,hpLv:r.hpLv??6,mpLv:r.mpLv??2,prof:r.prof!==false,moveLimit:r.moveLimit!==false,walls:r.walls!==false,oneAction:r.oneAction!==false,xp:r.xp!==false}}
const numMod=(f,v)=>{v=+v||0;if(!f)return 0;if(f.type==='attr')return Math.floor(v/2-5);return v<=20?v:Math.floor((v-50)/10)};
const fmtB=n=>n?(n>0?' + '+n:' − '+Math.abs(n)):'';
function actorRef(kind,id){if(kind==='pc'){const s=T.seats.find(x=>x.uid===id);return s?{kind,id,name:s.name||'Jogador',values:s.values||{},skills:s.skills||[],inv:s.inv||[],pos:s.pos,look:s.look,color:s.color,emoji:s.emoji,cond:s.cond||[],src:s}:null}
 const c=((T.game&&T.game.chars)||[]).find(x=>x.id===id);return c?{kind:'npc',id,name:c.name,values:c.values||{},skills:c.skills||[],inv:c.inv||[],pos:c.token,look:c.look,color:c.color,emoji:c.emoji,cond:[],src:c}:null}
const aVal=(a,fid)=>{const f=fid&&fById(fid);return f?fieldVal(f,a.values):null};
const hpOf=a=>aVal(a,RULES().hp);
const isDown=a=>!a||(a.kind==='npc'?(!!a.src.down||(hpOf(a)?hpOf(a).cur<=0:false)):(a.cond.includes('Caído')||a.cond.includes('Morto')));
const modBy=(a,label)=>{const f=fLab(label);return f?numMod(f,fieldVal(f,a.values)):0};
const lvlOf=a=>{const r=RULES();return Math.max(1,(r.level?+aVal(a,r.level):+(a.src&&a.src.lvl))||1)};
const profOf=a=>RULES().prof?2+Math.floor((lvlOf(a)-1)/4):0;
const defOf=a=>{const r=RULES();const b=r.def?(parseInt(aVal(a,r.def))||10):10;try{return defCalc(a,b)}catch{return b}};
function speedOf_v8(a){const r=RULES();if(!r.speed)return 6;const v=String(aVal(a,r.speed)||''),n=parseFloat(v.replace(',','.'));if(!n)return 6;if(/ft|p[eé]s/i.test(v))return Math.max(1,Math.round(n/5));if(/m\b|metro/i.test(v)||n>12)return Math.max(1,Math.round(n/1.5));return Math.round(n)}
const gdist=(p,q)=>Math.max(Math.abs(p.x-q.x),Math.abs(p.y-q.y));
const isAuto=atk=>!atk||String(atk).startsWith('—');
const attrOpts=()=>['— (acerta sempre)',...tplFields(T.game.template).filter(f=>f.type==='attr'||f.type==='number').map(f=>f.label)];
const barOpts=()=>{const b=tplFields(T.game.template).filter(f=>f.type==='bar').map(f=>f.label);return b.length?b:['Vida']};
/* campos de combate nos itens e habilidades */
ENT.items.fields.splice(ENT.items.fields.findIndex(f=>f[0]==='effect'),0,['dmg','Dano (dados — ex.: 1d8)','text'],['atk','Atributo do ataque','select',attrOpts],['range','Alcance (quadrados; vazio = corpo a corpo)','text'],['heal','Cura ao usar (dados — ex.: 2d4+2)','text'],['healBar','Restaura','select',barOpts]);
ENT.skills.fields.splice(ENT.skills.fields.findIndex(f=>f[0]==='effect'),0,['dmg','Dano (dados — ex.: 3d4)','text'],['heal','Cura (dados — ex.: 1d8)','text'],['atk','Atributo (teste de ataque / bônus de cura)','select',attrOpts],['mp','Custo em Mana/Energia','number']);
{const r=ENT.skills.fields.find(f=>f[0]==='range');if(r)r[1]='Alcance (quadrados; 0 = só em si mesmo)'}

/* ações disponíveis */
function actionsOf_v8(a){const L=[];
 (a.inv||[]).forEach(e=>{const it=itemById(e.item);if(!it)return;if(it.dmg)L.push({k:'w',id:it.id,ent:it,name:it.name,icon:it.icon,img:it.img});if(it.heal)L.push({k:'i',id:it.id,ent:it,inv:e.k,qty:e.qty,name:it.name,icon:it.icon,img:it.img})});
 (a.skills||[]).forEach(id=>{const sk=(T.game.skills||[]).find(x=>x.id===id);if(sk&&(sk.dmg||sk.heal))L.push({k:'s',id,ent:sk,name:sk.name,icon:sk.icon,img:sk.img})});
 if(!L.some(x=>x.k==='w')){const f=fByRe(/^for\b|^for$|força|corpo/i,['attr','number']);L.unshift({k:'u',name:'Ataque desarmado',icon:'👊',ent:{dmg:'1',atk:f?f.label:'—'}})}
 return L}
function rangeOf(act){const n=parseInt(act.ent.range);if(!isNaN(n))return n;if(act.k==='s')return act.ent.heal&&!act.ent.dmg?1:12;return 1}
const isHealAct=act=>!!act.ent.heal&&!act.ent.dmg;
function tokensOnMap(mid){const L=[];T.seats.forEach(s=>{if(s.pos&&s.pos.m===mid)L.push(actorRef('pc',s.uid))});(T.game.chars||[]).forEach(c=>{if(c.token&&c.token.m===mid)L.push(actorRef('npc',c.id))});return L.filter(Boolean)}
const entIco=e=>e&&e.img?`<img src="${esc(e.img)}" class="act-img" alt="">`:`<span class="act-ic">${esc((e&&e.icon)||'⚔️')}</span>`;
const barMini=b=>b?`<span class="sbar"><i style="width:${b.max?clamp(b.cur/b.max*100,0,100):0}%"></i><em>${b.cur}/${b.max}</em></span>`:'';
async function pickTarget_v8(a,act,heal,rng){
 if(rng===0)return a;const m=a.pos&&T.maps[a.pos.m];if(!m){toast('Coloque o personagem no mapa primeiro.','err');return null}
 const L=tokensOnMap(m.id).filter(t=>heal?!(t.kind==='npc'&&isDown(t)):(t.id!==a.id&&!(t.kind==='npc'&&isDown(t)))).map(t=>({t,d:gdist(a.pos,t.pos)}))
  .sort((p,q)=>(heal?(p.t.kind==='pc'?0:1)-(q.t.kind==='pc'?0:1):(p.t.kind==='npc'?0:1)-(q.t.kind==='npc'?0:1))||p.d-q.d);
 if(!L.length){toast('Nenhum alvo no mapa.','err');return null}
 return modal({title:`${esc(act.icon||'')} ${esc(act.name)} — escolha o alvo`,body:`<p class="small muted" style="margin-top:0">Alcance: ${rng<=1?'corpo a corpo (1 quadrado)':rng+' quadrados'}${act.k!=='i'&&!isAuto(act.ent.atk)&&!heal?` · ataque: 1d20${fmtB(modBy(a,act.ent.atk)+profOf(a))} contra a Defesa do alvo`:''}</p>
  <div class="tg-list">${L.map(({t,d},i)=>`<button class="tg ${d>rng?'far':''}" data-i="${i}" ${d>rng?'disabled':''}>${avatarHTML(t,'tok')}<span class="grow"><b>${esc(t.name)}${t.id===a.id?' (você)':''}</b><small>${d>rng?'fora de alcance · ':''}${d} quadrado(s)${!heal&&t.kind==='npc'?' · Defesa '+defOf(t):''}</small>${barMini(hpOf(t))}</span></button>`).join('')}</div>`,
  onMount:(ov,close)=>$$('[data-i]',ov).forEach(b=>b.onclick=()=>close(L[+b.dataset.i].t)),actions:[{label:'Cancelar'}]})}
function expRoll(ex){ex=String(ex||'').replace(/\s+/g,'');try{return roll(ex)}catch{const n=parseInt(ex)||0;return{total:n,dice:[],expr:String(n)}}}
async function doAction_v8(a,act){
 const r=RULES(),ent=act.ent,heal=isHealAct(act),c=T.game.combat;
 if(c&&c.on&&c.order.some(o=>o.id===a.id)){if(curId()!==a.id){toast('Aguarde sua vez.');return}if(r.oneAction&&T.actedTk===c.tk){toast('Você já usou sua ação neste turno. Mova-se ou encerre o turno.');return}}
 if(isDown(a)){toast(a.name+' está fora de combate.','err');return}
 const cost=act.k==='s'?(+ent.mp||0):0,mpF=r.mp&&fById(r.mp);
 if(cost&&mpF&&aVal(a,r.mp).cur<cost){toast(`${mpF.label} insuficiente (precisa de ${cost}).`,'err');return}
 const rng=rangeOf(act),tg=await pickTarget(a,act,heal,rng);if(!tg)return;
 let res='hit',dice=[],txt='',amount=0;const atkLab=isAuto(ent.atk)?null:ent.atk;
 if(!heal&&atkLab){const d20=expRoll('1d20').dice[0].v,bonus=modBy(a,atkLab)+profOf(a),tot=d20+bonus,dv=defOf(tg);res=d20===20?'crit':d20===1?'fumble':tot>=dv?'hit':'miss';dice.push({f:20,v:d20});txt=`Ataque ${d20}${fmtB(bonus)} = ${tot} vs Defesa ${dv}`}
 if(res==='hit'||res==='crit'){let ex=String(heal?ent.heal:ent.dmg).replace(/\s/g,'');if(res==='crit')ex=ex.replace(/(\d*)d(\d+)/gi,(m,n,f)=>(2*(+n||1))+'d'+f);
  const dr=expRoll(ex),md=atkLab&&(act.k==='w'||act.k==='u'||heal)?modBy(a,atkLab):0;amount=Math.max(1,dr.total+md);dice.push(...(dr.dice||[]));txt+=(txt?' · ':'')+(heal?'Cura ':'Dano ')+ex+fmtB(md)+' = '+amount}
 const hpF=r.hp,barF=heal?(act.k==='i'?((fLab(ent.healBar)||{}).id||hpF):hpF):hpF,fx=[];
 if(amount&&barF)fx.push({kind:tg.kind,id:tg.id,fid:barF,delta:heal?amount:-amount});
 if(cost&&mpF)fx.push({kind:a.kind,id:a.id,fid:r.mp,delta:-cost});
 const verb=heal?(tg.id===a.id?`usou ${act.name} em si mesmo`:`usou ${act.name} em ${tg.name}`):`atacou ${tg.name} com ${act.name}`;
 const out=heal?`+${amount} ${barF?fById(barF).label:''}`:res==='miss'?'errou':res==='fumble'?'falha crítica':`${res==='crit'?'CRÍTICO! ':''}${amount} de dano`;
 const logTxt=`${heal?'💚':'⚔️'} ${a.name} ${verb}: ${out}`;
 if(act.k==='i'){const inv=cl(a.inv).map(e=>e.k===act.inv?{...e,qty:e.qty-1}:e).filter(e=>e.qty>0);if(a.kind==='pc')seatPatch(a.id,{inv});else gamePatch({chars:T.game.chars.map(x=>x.id===a.id?{...x,inv}:x)})}
 const e={id:uid(),t:Date.now(),e:txt||'',v:amount,big:res==='miss'?'ERROU':res==='fumble'?'FALHA':heal?'+'+amount:amount,d:'',l:`${act.name} → ${tg.name}`,dice:dice.slice(0,12),res,tg:tg.id,heal:heal?1:0};
 if(a.kind==='pc'){seatPatch(a.id,{rolls:[e,...(a.src.rolls||[])].slice(0,15)})}else gamePatch({mrolls:[{...e,n:a.name,npc:a.id},...(T.game.mrolls||[])].slice(0,20)});
 T.seenRolls.add(e.id);diceQueue({...e,who:a.name,look:a.look,color:a.color});missFloat(e);
 if(isMaster()){fx.forEach(masterDelta);logAdd(logTxt)}
 else{const mine=fx.filter(f=>f.kind==='pc'&&f.id===S.uid),others=fx.filter(f=>!(f.kind==='pc'&&f.id===S.uid));mine.forEach(selfDelta);pushAct({type:'fx',fx:others,txt:logTxt})}
 if(c&&c.on&&curId()===a.id)T.actedTk=c.tk;setTimeout(renderActBar,50)}
function pushAct(o){const s=mySeat();if(!s)return;seatPatch(S.uid,{acts:[{id:uid(),t:Date.now(),...o},...(s.acts||[])].slice(0,12)})}
function selfDelta(f){const s=mySeat(),fld=fById(f.fid);if(!s||!fld)return;const b=fieldVal(fld,s.values||{}),nb={cur:clamp(b.cur+f.delta,0,b.max),max:b.max},p={values:{[f.fid]:nb}};
 if(f.fid===RULES().hp){const cd=s.cond||[];if(nb.cur>0&&(cd.includes('Caído')||cd.includes('Estável'))){p.cond=cd.filter(x=>x!=='Caído'&&x!=='Estável');p.ds={s:0,f:0}}}seatPatch(S.uid,p)}
function masterDelta_v8(f){const fld=fById(f.fid);if(!fld)return;const hpId=RULES().hp;
 if(f.kind==='npc'){const c=T.game.chars.find(x=>x.id===f.id);if(!c)return;const b=fieldVal(fld,c.values||{}),nb={cur:clamp(b.cur+f.delta,0,b.max),max:b.max},down=f.fid===hpId?nb.cur<=0:!!c.down;
  gamePatch({chars:T.game.chars.map(x=>x.id===c.id?{...x,values:{...(x.values||{}),[f.fid]:nb},down}:x)});if(down&&!c.down)logAdd(`💀 ${c.name} foi derrotado!`)}
 else{const s=T.seats.find(x=>x.uid===f.id);if(!s)return;const b=fieldVal(fld,s.values||{}),nb={cur:clamp(b.cur+f.delta,0,b.max),max:b.max},p={values:{[f.fid]:nb}};
  if(f.fid===hpId){const cd=s.cond||[];if(nb.cur<=0&&!cd.includes('Caído')){p.cond=[...cd,'Caído'];logAdd(`🩸 ${s.name} caiu inconsciente!`)}else if(nb.cur>0&&cd.includes('Caído'))p.cond=cd.filter(x=>x!=='Caído')}seatPatch(s.uid,p)}}
function logAdd(txt,k){if(!isMaster()||!txt)return;gamePatch({log:[{id:uid(),t:Date.now(),txt:String(txt).slice(0,300),k:k||''},...(T.game.log||[])].slice(0,60)})}
function processActs_v8(){if(!isMaster()||!T.game)return;const done=new Set(T.game.done||[]),now=Date.now();let ch=false;
 T.seats.forEach(s=>(s.acts||[]).slice().reverse().forEach(a=>{if(!a.id||done.has(a.id))return;done.add(a.id);ch=true;if(now-a.t>20*60e3)return;
  if(a.type==='fx'){(a.fx||[]).forEach(masterDelta);if(a.txt)logAdd(a.txt)}
  else if(a.type==='end'){if(curId()===s.uid){logAdd(`⏭ ${s.name} encerrou o turno`);nextTurn()}}}));
 if(ch)gamePatch({done:[...done].slice(-150)})}

/* combate: iniciativa, turnos, rodadas */
const curId=()=>{const c=T.game&&T.game.combat;return c&&c.on&&c.order&&c.order[c.turn]?c.order[c.turn].id:null};
const curEntry=()=>{const c=T.game.combat;return c&&c.on?c.order[c.turn]:null};
ACT.cbStart=async()=>{const m=T.maps[T.game.activeMap];if(!m){toast('Mostre um mapa aos jogadores primeiro.','err');return}
 const L=tokensOnMap(m.id).filter(t=>!isDown(t)||(MOD('death')&&t.kind==='pc'&&t.cond.includes('Caído')&&!t.cond.includes('Morto')&&!t.cond.includes('Estável')));if(!L.length){toast('Não há personagens no mapa.','err');return}
 const sel=await modal({title:'⚔️ Iniciar combate',body:`<p class="small muted" style="margin-top:0">Quem entra no combate? Cada um rola 1d20${RULES().init?' + '+esc(fById(RULES().init).label):''} de iniciativa.</p>${L.map(t=>`<label class="ckrow"><input type="checkbox" data-id="${t.id}" checked> ${avatarHTML(t,'tok')} <b>${esc(t.name)}</b> <span class="muted small">${t.kind==='pc'?'herói':'inimigo / NPC'}</span></label>`).join('')}`,
  actions:[{label:'Cancelar'},{label:'Rolar iniciativa',cls:'primary',onClick:ov=>$$('[data-id]',ov).filter(i=>i.checked).map(i=>i.dataset.id)}]});
 if(!sel||!sel.length)return;const ini=RULES().init,f=ini&&fById(ini);
 const order=L.filter(t=>sel.includes(t.id)).map(t=>{const d=expRoll('1d20').dice[0].v,md=f?numMod(f,fieldVal(f,t.values)):0;return{id:t.id,kind:t.kind,name:t.name,init:d+md,d,md}}).sort((p,q)=>q.init-p.init||q.md-p.md);
 const first=actorRef(order[0].kind,order[0].id);
 gamePatch({combat:{on:true,id:uid(),tk:uid(),at:Date.now(),round:1,turn:0,order,start:first&&first.pos?{x:first.pos.x,y:first.pos.y}:null,result:''}});
 logAdd('⚔️ Combate! Iniciativa: '+order.map(o=>`${o.name} ${o.init}`).join(', '));combatFx();refreshPlay()};
function nextTurn_v8(){const c=cl(T.game.combat);if(!c||!c.on)return;const n=c.order.length,alive=o=>{const a=actorRef(o.kind,o.id);return a&&!isDown(a)};
 const foes=c.order.filter(o=>o.kind==='npc'),pcs=c.order.filter(o=>o.kind==='pc');
 if(foes.length&&!foes.some(alive)&&c.result!=='win'){c.result='win';logAdd('🏆 Vitória! Todos os inimigos foram derrotados.')}
 else if(pcs.length&&!pcs.some(alive)&&c.result!=='lose'){c.result='lose';logAdd('☠️ Todos os heróis caíram…')}
 let i=c.turn;for(let k=0;k<n;k++){i=(i+1)%n;if(i===0){c.round++}if(alive(c.order[i]))break}
 c.turn=i;const a=actorRef(c.order[i].kind,c.order[i].id);c.start=a&&a.pos?{x:a.pos.x,y:a.pos.y}:null;c.tk=uid();gamePatch({combat:c});refreshPlay()}
ACT.cbNext=()=>{const e=curEntry();if(e)logAdd(`⏭ Fim do turno de ${e.name}`);nextTurn()};
ACT.cbEnd=async()=>{const c=T.game.combat;if(!c||!c.on)return;
 const dead=c.order.filter(o=>o.kind==='npc').map(o=>actorRef('npc',o.id)).filter(a=>a&&isDown(a)),xp=dead.reduce((s,a)=>s+(+a.src.xp||0),0),pcs=c.order.filter(o=>o.kind==='pc'&&T.seats.some(s=>s.uid===o.id));
 const v=await modal({title:'Fim do combate',body:`<p>${dead.length?`Inimigos derrotados: <b>${dead.map(a=>esc(a.name)).join(', ')}</b>.`:'Nenhum inimigo derrotado.'}</p>${RULES().xp&&pcs.length?`<label class="f">XP total para dividir entre ${pcs.length} herói(s)</label><input type="number" id="ceXp" value="${xp}" min="0"><p class="small muted">Cada um recebe ${pcs.length?Math.floor(xp/pcs.length):0} XP (o valor muda se você editar).</p>`:''}<label class="toggle"><input type="checkbox" id="ceRm" ${dead.length?'checked':''}><span class="sw"></span>Tirar os inimigos derrotados do mapa</label>`,
  actions:[{label:'Cancelar'},{label:'Encerrar combate',cls:'primary',onClick:ov=>({xp:+(($('#ceXp',ov)||{}).value||0),rm:$('#ceRm',ov).checked})}]});
 if(!v)return;if(v.rm){const ids=new Set(dead.map(a=>a.id));gamePatch({chars:T.game.chars.filter(x=>!(ids.has(x.id)&&x.clone)).map(x=>ids.has(x.id)?{...x,token:null}:x)})}
 gamePatch({combat:{...cl(c),on:false,tk:uid()}});logAdd('🕊 Fim do combate.');
 if(v.xp>0&&pcs.length)giveXP(pcs.map(o=>o.id),Math.floor(v.xp/pcs.length));refreshPlay()};
function giveXP(uids,amt){const r=RULES();uids.forEach(u=>{const s=T.seats.find(x=>x.uid===u);if(!s)return;const xp=(+s.xp||0)+amt,a=actorRef('pc',u);let lv=lvlOf(a);const p={xp};const vals={};let up=0;
  while(lv<20&&xp>=XP_TABLE[lv]){lv++;up++}
  if(up){if(r.level)vals[r.level]=lv;else p.lvl=lv;const conF=r.con&&fById(r.con),cm=conF?numMod(conF,fieldVal(conF,s.values||{})):0;
   if(r.hp){const b=fieldVal(fById(r.hp),s.values||{}),mx=b.max+up*Math.max(1,(+r.hpLv||0)+cm);vals[r.hp]={cur:mx,max:mx}}
   if(r.mp){const b=fieldVal(fById(r.mp),s.values||{}),mx=b.max+up*(+r.mpLv||0);vals[r.mp]={cur:mx,max:mx}}
   p.values=vals;p.cond=(s.cond||[]).filter(x=>x!=='Caído'&&x!=='Estável');if(MOD('levelup'))p.pend=(+s.pend||0)+up;logAdd(`⭐ ${s.name} subiu para o nível ${lv}!`)}
  seatPatch(u,p)});logAdd(`✨ ${amt} XP para ${uids.map(u=>(T.seats.find(s=>s.uid===u)||{}).name).filter(Boolean).join(', ')}`)}
ACT.cbXp=async()=>{if(!T.seats.length){toast('Ninguém na mesa ainda.');return}
 const v=await modal({title:'⭐ Dar experiência',body:`<label class="f">XP para cada herói</label><input type="number" id="gxV" value="100" min="1">${T.seats.map(s=>`<label class="ckrow"><input type="checkbox" data-u="${s.uid}" checked> ${avatarHTML(s,'tok')} <b>${esc(s.name)}</b> <span class="muted small">Nível ${lvlOf(actorRef('pc',s.uid))} · ${+s.xp||0} XP</span></label>`).join('')}<p class="small muted">Tabela de níveis do D&D: 300 XP para o nível 2, 900 para o 3, 2.700 para o 4… Ao subir de nível a Vida máxima aumenta (${RULES().hpLv} + CON) e a Mana (${RULES().mpLv}).</p>`,
  actions:[{label:'Cancelar'},{label:'Dar XP',cls:'primary',onClick:ov=>({v:+$('#gxV',ov).value||0,u:$$('[data-u]',ov).filter(i=>i.checked).map(i=>i.dataset.u)})}]});
 if(v&&v.v>0&&v.u.length){giveXP(v.u,v.v);toast('XP entregue')}};
ACT.cbRest=async()=>{const v=await modal({title:'🏕 Descanso',body:'<p><b>Curto</b>: cada herói recupera metade da Vida e da Mana máximas.</p><p><b>Longo</b>: todos recuperam tudo e quem estava caído se levanta.</p>',actions:[{label:'Cancelar'},{label:'Descanso curto',value:'s'},{label:'Descanso longo',cls:'primary',value:'l'}]});
 if(!v)return;const r=RULES();T.seats.forEach(s=>{const vals={};[r.hp,r.mp].filter(Boolean).forEach(fid=>{const b=fieldVal(fById(fid),s.values||{});vals[fid]={cur:v==='l'?b.max:Math.min(b.max,b.cur+Math.ceil(b.max/2)),max:b.max}});
  const p={values:vals};const hb=vals[r.hp];if(hb&&hb.cur>0){p.cond=(s.cond||[]).filter(x=>v==='l'?x==='Morto':(x!=='Caído'&&x!=='Estável'));p.ds={s:0,f:0}}seatPatch(s.uid,p)});logAdd(v==='l'?'🏕 O grupo fez um descanso longo e recuperou tudo.':'☕ O grupo fez um descanso curto.');refreshPlay()};
ACT.cbSpawn=async()=>{const m=T.maps[T.game.activeMap];if(!m){toast('Mostre um mapa aos jogadores primeiro.','err');return}const base=(T.game.chars||[]).filter(c=>c.kind==='npc'&&!c.clone);
 if(!base.length){toast('Crie inimigos em Mestre → Personagens (tipo NPC / inimigo) ou adicione o conteúdo inicial em Regras.','err');return}
 const v=await modal({title:'👹 Colocar inimigos no mapa',body:`<div class="tg-list">${base.map(c=>{const a=actorRef('npc',c.id),h=hpOf(a);return `<div class="tg">${avatarHTML(c,'tok')}<span class="grow"><b>${esc(c.name)}</b><small>${h?'Vida '+h.max+' · ':''}Defesa ${defOf(a)} · ${+c.xp||0} XP</small></span><input type="number" min="0" max="12" value="0" data-q="${c.id}" style="width:64px"></div>`}).join('')}</div><p class="small muted">Eles aparecem perto do ⭐ Início do mapa; arraste para posicionar.</p>`,
  actions:[{label:'Cancelar'},{label:'Colocar',cls:'primary',onClick:ov=>$$('[data-q]',ov).map(i=>({id:i.dataset.q,n:clamp(+i.value||0,0,12)})).filter(x=>x.n)}]});
 if(!v||!v.length)return;const occ=new Set(tokensOnMap(m.id).map(t=>t.pos.x+','+t.pos.y)),sp=m.spawn||{x:1,y:1},r=RULES(),chars=[...T.game.chars];
 const free=()=>{for(let rad=2;rad<30;rad++)for(let dy=-rad;dy<=rad;dy++)for(let dx=-rad;dx<=rad;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==rad)continue;const x=sp.x+dx+2,y=sp.y+dy;if(x<0||y<0||x>=m.w||y>=m.h||occ.has(x+','+y))continue;if(!m.bg&&!walkable(tileAt(m,x,y)))continue;occ.add(x+','+y);return{x,y}}return{x:sp.x,y:sp.y}};
 v.forEach(({id,n})=>{const c=base.find(x=>x.id===id);const same=chars.filter(x=>x.clone===id&&x.token).length;for(let k=0;k<n;k++){const cc=cl(c);cc.id=uid();cc.clone=id;cc.down=false;cc.name=c.name+(n+same>1?' '+(same+k+1):'');const p=free();cc.token={m:m.id,x:p.x,y:p.y};if(r.hp){const b=fieldVal(fById(r.hp),cc.values||{});cc.values={...(cc.values||{}),[r.hp]:{cur:b.max,max:b.max}}}chars.push(cc)}});
 gamePatch({chars});logAdd('👹 Inimigos surgiram: '+v.map(x=>x.n+'× '+base.find(c=>c.id===x.id).name).join(', '));refreshPlay()};
ACT.pAct=async el=>{const kind=el.dataset.k,a=el.dataset.npc?actorRef('npc',el.dataset.npc):actorRef('pc',S.uid);if(!a)return;
 const L=actionsOf(a).filter(x=>kind==='atk'?(x.k==='w'||x.k==='u'):kind==='skill'?x.k==='s':x.k==='i');
 if(!L.length){toast(kind==='skill'?'Nenhuma habilidade de combate. O mestre pode conceder em ⋯ → Habilidades.':kind==='item'?'Nenhum item utilizável na mochila.':'Sem ataques.');return}
 const pick=L.length===1&&kind==='atk'?L[0]:await modal({title:kind==='atk'?'⚔️ Atacar':kind==='skill'?'✨ Habilidades':'🧪 Usar item',body:`<div class="tg-list">${L.map((x,i)=>{const e=x.ent,heal=isHealAct(x),cost=x.k==='s'?+e.mp||0:0;return `<button class="tg" data-i="${i}">${entIco(x)}<span class="grow"><b>${esc(x.name)}${x.qty?' ×'+x.qty:''}</b><small>${heal?'Cura '+esc(e.heal):'Dano '+esc(e.dmg)}${!heal&&!isAuto(e.atk)?' · '+esc(e.atk):!heal?' · acerta sempre':''}${cost?` · custa ${cost} ${RULES().mp?esc(fById(RULES().mp).label):'Mana'}`:''} · alcance ${rangeOf(x)===0?'si mesmo':rangeOf(x)}</small></span></button>`}).join('')}</div>`,
  onMount:(ov,close)=>$$('[data-i]',ov).forEach(b=>b.onclick=()=>close(L[+b.dataset.i])),actions:[{label:'Cancelar'}]});
 if(pick)doAction(a,pick)};
ACT.pEnd=()=>{const c=T.game.combat;if(!c||!c.on||curId()!==S.uid)return;if(isMaster()){nextTurn();return}pushAct({type:'end'});T.endSent=c.tk;renderActBar();toast('Turno encerrado')};
ACT.pFeed=()=>{const f=$('#feed');if(!f)return;f.classList.toggle('open');if(f.classList.contains('open')){T.feedSeen=Date.now();renderFeed();const i=$('#feedIn');if(i&&innerWidth>760)i.focus()}renderFeedBadge()};
function sendChat(txt){txt=String(txt||'').trim().slice(0,280);if(!txt)return;const s=mySeat();if(s)seatPatch(S.uid,{chat:[{id:uid(),t:Date.now(),txt},...(s.chat||[])].slice(0,15)});else if(isMaster())logAdd('🗣 Mestre: '+txt,'chat');renderFeed()}
function feedItems(){const L=[...(T.game.log||[]).map(l=>({t:l.t,h:esc(l.txt),k:l.k||'log'})),...T.seats.flatMap(s=>(s.chat||[]).map(c=>({t:c.t,h:`<b>${esc(s.name||'Jogador')}:</b> ${esc(c.txt)}`,k:'chat'}))),
 ...T.seats.flatMap(s=>(s.rolls||[]).filter(r=>!r.tg).map(r=>({t:r.t,h:`🎲 ${esc(s.name||'Jogador')}${r.l?' · '+esc(r.l):''}: <b>${r.v}</b> <span class="muted">${esc(r.e)}</span>`,k:'roll'})))];return L.sort((a,b)=>b.t-a.t).slice(0,80)}
function renderFeed(){const el=$('#feedL');if(!el)return;el.innerHTML=feedItems().map(i=>`<div class="fi ${i.k}"><span class="ft">${new Date(i.t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>${i.h}</div>`).join('')||'<p class="muted small">Nada ainda. Combates, ações e mensagens aparecem aqui.</p>'}
function renderFeedBadge(){const b=$('#feedB');if(!b)return;const open=$('#feed')&&$('#feed').classList.contains('open');if(open)T.feedSeen=Date.now();const n=open?0:feedItems().filter(i=>i.t>(T.feedSeen||0)&&i.k!=='roll').length;b.textContent=n?String(Math.min(n,9)):'';b.style.display=n?'':'none'}

/* barras da tela de jogo */
function renderTurns(){const el=$('#turns');if(!el)return;const c=T.game.combat;if(!c||!c.on){el.innerHTML='';el.style.display='none';return}el.style.display='';
 el.innerHTML=`<span class="tr-round">Rodada ${c.round}</span>${c.order.map((o,i)=>{const a=actorRef(o.kind,o.id),dn=isDown(a);return `<span class="tr ${i===c.turn?'on':''} ${dn?'dn':''} k-${o.kind}" title="${esc(o.name)} · iniciativa ${o.init}">${a?avatarHTML(a,'tav'):'❔'}<em>${o.init}</em></span>`}).join('')}`}
function renderActBar_v8(){const el=$('#actbar');if(!el||!T.game)return;const c=T.game.combat,on=c&&c.on,cur=curEntry(),s=mySeat(),me=isMaster();let h='';
 if(s){const a=actorRef('pc',S.uid),inC=on&&c.order.some(o=>o.id===S.uid),my=inC&&cur&&cur.id===S.uid,wait=inC&&!my,acted=my&&RULES().oneAction&&T.actedTk===c.tk,dn=isDown(a);
  const dis=wait||acted||dn?'disabled':'';
  h+=`<div class="ab-grp">${inC?`<span class="ab-info ${my?'my':''}">${dn?'🩸 Caído':my?(T.endSent===c.tk?'⏳ Encerrando…':'⭐ Sua vez!'):'⏳ Vez de '+esc(cur?cur.name:'—')}</span>`:''}
   <button class="btn ab" data-act="pAct" data-k="atk" ${dis}>⚔️<span>Atacar</span></button><button class="btn ab" data-act="pAct" data-k="skill" ${dis}>✨<span>Habilidade</span></button><button class="btn ab" data-act="pAct" data-k="item" ${dis}>🧪<span>Item</span></button><button class="btn ab" data-act="pDice">🎲<span>Teste</span></button>
   ${my?`<button class="btn ab primary" data-act="pEnd" ${T.endSent===c.tk?'disabled':''}>⏭<span>Encerrar turno</span></button>`:''}
   ${my&&RULES().moveLimit?`<span class="ab-info">👣 ${speedOf(a)} quadrados${acted?' · ação usada':''}</span>`:''}</div>`}
 if(me){const npc=on&&cur&&cur.kind==='npc'?actorRef('npc',cur.id):null,acted=npc&&RULES().oneAction&&T.actedTk===c.tk;
  h+=`<div class="ab-grp gm">${on?`<button class="btn ab primary" data-act="cbNext">⏭<span>Próximo turno</span></button><button class="btn ab" data-act="cbSpawn">👹<span>Inimigos</span></button><button class="btn ab danger" data-act="cbEnd">🏳<span>Fim do combate</span></button>`
   :`<button class="btn ab primary" data-act="cbStart">⚔️<span>Iniciar combate</span></button><button class="btn ab" data-act="cbSpawn">👹<span>Inimigos</span></button><button class="btn ab" data-act="cbXp">⭐<span>Dar XP</span></button><button class="btn ab" data-act="cbRest">🏕<span>Descanso</span></button>`}${s?'':'<button class="btn ab" data-act="pDice">🎲<span>Dados</span></button>'}
   ${npc?`<span class="ab-info my">${esc(npc.name)}:</span><button class="btn ab" data-act="pAct" data-k="atk" data-npc="${npc.id}" ${acted?'disabled':''}>⚔️<span>Atacar</span></button><button class="btn ab" data-act="pAct" data-k="skill" data-npc="${npc.id}" ${acted?'disabled':''}>✨<span>Habilidade</span></button><span class="ab-info">👣 ${speedOf(npc)}</span>`:''}</div>`}
 if(!s&&!me)h='<span class="ab-info">Entre na mesa pela aba Ficha para jogar.</span>';
 el.innerHTML=h}

/* animações de combate visíveis para todos */
function banner(html,cls,ms=1900){const d=document.createElement('div');d.className='cb-banner '+(cls||'');d.innerHTML=html;document.body.appendChild(d);setTimeout(()=>d.classList.add('out'),ms);setTimeout(()=>d.remove(),ms+600)}
function combatFx(){const c=T.game.combat||{},k=T.cbSeen||(T.cbSeen={});
 if(k.init===undefined){k.init=true;k.id=c.id;k.tk=c.tk;k.res=c.result;k.on=!!c.on;if(!(c.on&&Date.now()-c.at<12000))return}
 if(c.on&&c.id!==k.id){k.id=c.id;k.tk=c.tk;k.on=true;k.res='';sThud(0,.9);sClack(.05);
  banner(`<div class="cb-t">⚔️ Combate!</div><div class="cb-s">Ordem de iniciativa</div><div class="cb-init">${c.order.map((o,i)=>{const a=actorRef(o.kind,o.id);return `<span style="animation-delay:${.25+i*.15}s">${a?avatarHTML(a,'tav'):''}<b>${esc(o.name)}</b><em>${o.init}</em></span>`}).join('')}</div>`,'big',2600+c.order.length*150);setTimeout(()=>turnBanner(c),3000+c.order.length*150);return}
 if(c.on&&c.tk!==k.tk){k.tk=c.tk;turnBanner(c)}
 if(c.result&&c.result!==k.res){k.res=c.result;if(c.result==='win'){sChime(0,true);banner('<div class="cb-t">🏆 Vitória!</div><div class="cb-s">Todos os inimigos foram derrotados</div>','big win',2600)}else{sChime(0,false);banner('<div class="cb-t">☠️ Derrota…</div><div class="cb-s">Todos os heróis caíram</div>','big lose',2600)}}
 if(!c.on&&k.on){k.on=false;banner('<div class="cb-t">🕊 Fim do combate</div>','',1600)}
 if(c.on)k.on=true}
function turnBanner(c){const o=c.order[c.turn];if(!o)return;const a=actorRef(o.kind,o.id),mine=o.id===S.uid;if(mine){sChime(0,true)}else sClack(0);
 banner(`${a?avatarHTML(a,'tav'):''}<div><div class="cb-s">Rodada ${c.round}</div><div class="cb-t">${mine?'Sua vez!':'Vez de '+esc(o.name)}</div></div>`,'turn'+(mine?' mine':''),1500);if(mine&&navigator.vibrate)try{navigator.vibrate(120)}catch{}}
function floatAt(id,text,cls){const run=()=>{const tc=$('#tokC'),s=TL.toks[id];if(!tc||!s)return;const cell=TL.cell||28,d=document.createElement('div');d.className='dmgf '+(cls||'');d.textContent=text;d.style.left=((s.x+.5)*cell)+'px';d.style.top=(s.y*cell)+'px';d.style.fontSize=Math.max(14,Math.round(cell*.62))+'px';tc.parentElement.appendChild(d);setTimeout(()=>d.remove(),1700);if(cls==='hurt'){s.hitT=performance.now();sThud(0,.5);if(!TL.raf)TL.raf=requestAnimationFrame(tlFrame)}};
 if(diceBusy)setTimeout(run,1350);else run()}
function missFloat(r){if(r&&r.tg&&(r.res==='miss'||r.res==='fumble'))floatAt(r.tg,r.res==='miss'?'Errou!':'Falha!','miss');else if(r&&r.tg&&r.res==='crit')floatAt(r.tg,'Crítico!','crit')}
function hpWatch(){const m=T.maps[T.game.activeMap],hp=RULES().hp;if(!m||!hp)return;const prev=T.hpPrev||(T.hpPrev={});tokensOnMap(m.id).forEach(a=>{const b=hpOf(a);if(!b)return;const p=prev[a.id];prev[a.id]=b.cur;if(p==null||p===b.cur)return;const d=b.cur-p;floatAt(a.id,(d>0?'+':'')+d,d<0?'hurt':'heal');if(d>0)sChime(.1,true)})}
function levelWatch(){const s=mySeat();if(!s)return;const lv=lvlOf(actorRef('pc',S.uid));if(T.myLvl&&lv>T.myLvl){sChime(0,true);sChime(.35,true);banner(`<div class="cb-t">⭐ Nível ${lv}!</div><div class="cb-s">${esc(s.name)} ficou mais forte — Vida e Mana aumentaram</div>`,'big win',2800)}T.myLvl=lv}
function v8after(){if(!T.game)return;try{processActs();combatFx();hpWatch();levelWatch();renderFeedBadge();if($('#feed')&&$('#feed').classList.contains('open'))renderFeed()}catch(e){console.warn('v8',e)}}
/* movimento: turno, deslocamento e paredes */
const _mv8=moveToken;
moveToken=function(tk,mid,x,y){if(!isMaster()&&tk.kind==='pc'){const m=T.maps[mid],c=T.game.combat,r=RULES();
  if(r.walls&&m&&!(m.bg&&m.bg.src)&&!walkable(tileAt(m,x,y))){toast('Não dá para andar aí.');return}
  if(c&&c.on&&c.order.some(o=>o.id===tk.id)){if(curId()!==tk.id){toast('Aguarde sua vez para se mover.');return}
   if(r.moveLimit&&c.start){const sp=speedOf(actorRef('pc',tk.id)),d=gdist(c.start,{x,y});if(d>sp){toast(`Deslocamento máximo: ${sp} quadrados por turno.`);return}}}}
 _mv8(tk,mid,x,y)};
function tlPre_v8(x,cell,now,m){const c=T.game&&T.game.combat;if(!c||!c.on||!c.start||!RULES().moveLimit)return;const e=curEntry();if(!e)return;const mine=e.id===S.uid||(isMaster()&&e.kind==='npc');if(!mine)return;
 const a=actorRef(e.kind,e.id);if(!a||!a.pos||a.pos.m!==m.id)return;const sp=speedOf(a),x0=Math.max(0,c.start.x-sp),y0=Math.max(0,c.start.y-sp),x1=Math.min(m.w-1,c.start.x+sp),y1=Math.min(m.h-1,c.start.y+sp);
 x.save();x.fillStyle='rgba(245,197,66,.10)';x.strokeStyle='rgba(245,197,66,.55)';x.lineWidth=2;x.setLineDash([6,5]);x.fillRect(x0*cell,y0*cell,(x1-x0+1)*cell,(y1-y0+1)*cell);x.strokeRect(x0*cell,y0*cell,(x1-x0+1)*cell,(y1-y0+1)*cell);x.restore()}
function tlRing(x,t,cx,cy,r,now){if(curId()!==t.id)return;const p=(Math.sin(now/260)+1)/2;x.save();x.strokeStyle=`rgba(255,214,90,${.55+.4*p})`;x.lineWidth=Math.max(2,r*.14);x.shadowColor='#ffd65a';x.shadowBlur=12;x.beginPath();x.ellipse(cx,cy+r*.82,r*(1+.12*p),r*.36*(1+.12*p),0,0,Math.PI*2);x.stroke();x.restore()}
function tlPost_v8(x,t,s,cx,cy,r,now,cell){
 if(s.hitT&&now-s.hitT<450){x.save();x.globalAlpha=.55*(1-(now-s.hitT)/450);x.fillStyle='#ff2a1a';x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill();x.restore()}
 if(t.down){x.save();x.strokeStyle='rgba(180,20,20,.9)';x.lineWidth=Math.max(2,r*.16);x.lineCap='round';x.beginPath();x.moveTo(cx-r*.55,cy-r*.55);x.lineTo(cx+r*.55,cy+r*.55);x.moveTo(cx+r*.55,cy-r*.55);x.lineTo(cx-r*.55,cy+r*.55);x.stroke();x.restore();return}
 const c=T.game&&T.game.combat;if(!t.hp||!(c&&c.on)&&t.hp.cur>=t.hp.max)return;const w=r*1.6,h=Math.max(3,cell*.1),bx=cx-w/2,by=cy-r-h-3,p=t.hp.max?clamp(t.hp.cur/t.hp.max,0,1):0;
 x.fillStyle='rgba(0,0,0,.7)';x.fillRect(bx-1,by-1,w+2,h+2);x.fillStyle=p>.5?'#4caf50':p>.25?'#e0a030':'#d03a2a';x.fillRect(bx,by,w*p,h)}

/* regras (aba do mestre) e conteúdo inicial */
MR.rules=()=>{const r=RULES(),raw=T.game.rules||{},F=tplFields(T.game.template),opt=(k,types,label)=>`<div><label class="f">${label}</label><select data-rk="${k}"><option value="-" ${r[k]===''?'selected':''}>— não usar —</option>${F.filter(f=>types.includes(f.type)).map(f=>`<option value="${f.id}" ${r[k]===f.id?'selected':''}>${esc(f.label)}</option>`).join('')}</select></div>`,tg=(k,l,d)=>`<label class="toggle"><input type="checkbox" data-rt="${k}" ${r[k]?'checked':''}><span class="sw"></span><span><b>${l}</b><br><span class="small muted">${d}</span></span></label>`;
 $('#tMain').innerHTML=`<div class="tpad narrow"><div class="vh"><div class="grow"><h2>Regras do jogo</h2><p>O básico de todo RPG: iniciativa, turnos, ataque contra Defesa, dano, cura, descanso e experiência. O app detecta os campos da sua ficha — ajuste se precisar.</p></div></div>
  <div class="card"><h3>Como uma rodada funciona</h3><ol class="howto"><li><b>Iniciar sessão</b> (topo da mesa) leva todos para a Tela de jogo.</li><li><b>👹 Inimigos</b> coloca monstros no mapa; <b>⚔️ Iniciar combate</b> rola a iniciativa (1d20 + atributo) e define a ordem.</li><li>Na sua vez você pode <b>mover-se</b> até o seu deslocamento e fazer <b>uma ação</b>: atacar, usar habilidade ou item. Depois, <b>Encerrar turno</b>.</li><li><b>Ataque</b>: 1d20 + atributo + proficiência contra a Defesa do alvo. 20 natural é crítico (dados de dano dobrados); 1 natural sempre erra.</li><li>Dano e cura são aplicados automaticamente. Com 0 de Vida o herói fica <b>Caído</b> e o inimigo é <b>derrotado</b>.</li><li>No fim do combate o XP dos inimigos é dividido; ao alcançar a tabela de XP o personagem <b>sobe de nível</b>. <b>🏕 Descanso</b> recupera Vida e Mana.</li></ol></div>
  <div class="card" style="margin-top:14px"><h3>Campos da ficha usados pelas regras</h3><div class="rgrid">${opt('hp',['bar'],'Vida')}${opt('mp',['bar'],'Mana / energia')}${opt('def',['number','attr','text'],'Defesa (CA)')}${opt('speed',['text','number'],'Deslocamento')}${opt('init',['attr','number'],'Iniciativa usa')}${opt('level',['number'],'Nível')}${opt('con',['attr','number'],'Vida extra por nível usa')}</div>
   <div class="rgrid" style="margin-top:8px"><div><label class="f">Vida por nível (+ modificador)</label><input type="number" data-rn="hpLv" value="${r.hpLv}"></div><div><label class="f">Mana por nível</label><input type="number" data-rn="mpLv" value="${r.mpLv}"></div></div></div>
  <div class="card" style="margin-top:14px"><h3>Opções</h3>${tg('prof','Bônus de proficiência','+2 nos ataques (sobe com o nível, como no D&D).')}${tg('oneAction','Uma ação por turno','Atacar, usar habilidade ou item conta como a ação do turno.')}${tg('moveLimit','Limitar movimento no combate','Na sua vez, mova-se até o deslocamento (9 m = 6 quadrados).')}${tg('walls','Paredes bloqueiam','Jogadores não andam em paredes, muros ou fora do mapa (mapas de imagem são livres).')}${tg('xp','Experiência e níveis','Dividir XP dos inimigos derrotados e subir de nível.')}</div>
  <div class="card" style="margin-top:14px"><h3>Conteúdo inicial</h3><p class="small muted">Armas, poções, magias e um pequeno bestiário (Goblin, Lobo, Esqueleto, Orc, Ogro), já com dano, cura, Defesa e XP. Também equipa as classes da ficha clássica (Guerreiro, Mago, Ladino, Clérigo). Itens com o mesmo nome não são duplicados.</p><button class="btn primary" data-act="kitAdd">➕ Adicionar conteúdo inicial</button></div></div>`;
 const save=debounce(()=>{const o={...(T.game.rules||{})};$$('[data-rk]').forEach(s=>o[s.dataset.rk]=s.value);$$('[data-rn]').forEach(i=>o[i.dataset.rn]=+i.value||0);$$('[data-rt]').forEach(i=>o[i.dataset.rt]=i.checked);gamePatch({rules:o});toast('Regras salvas')},500);
 $$('[data-rk],[data-rn],[data-rt]').forEach(i=>i.onchange=save)};
const ALIAS={FOR:/^for\b|^for$|força|corpo/i,DES:/^des\b|^des$|destreza|agilidade|corpo/i,CON:/^con\b|^con$|constitui|vigor|corpo/i,INT:/^int\b|^int$|intelig|mente/i,SAB:/^sab\b|^sab$|sabedoria|poder|esp[ií]rito|mente/i,CAR:/^car\b|^car$|carisma/i};
const attrLab=k=>{const f=fByRe(ALIAS[k],['attr','number']);return f?f.label:'— (acerta sempre)'};
function addStarterKit(){const g=T.game,r=RULES(),items=cl(g.items||[]),skills=cl(g.skills||[]),chars=cl(g.chars||[]),hpL=r.hp?fById(r.hp).label:'Vida',mpL=r.mp?fById(r.mp).label:hpL;
 const I0=(name,icon,type,o)=>{let e=items.find(x=>x.name===name);if(!e){e={id:uid(),name,icon,type,weight:'',value:'',desc:'',...o};items.push(e)}return e.id};
 const S0=(name,icon,type,o)=>{let e=skills.find(x=>x.name===name);if(!e){e={id:uid(),name,icon,type,cost:'',...o};skills.push(e)}return e.id};
 const it={espada:I0('Espada longa','⚔️','Arma',{dmg:'1d8',atk:attrLab('FOR'),effect:'1d8 + FOR',weight:3,value:'15 po'}),cajado:I0('Cajado','🪄','Arma',{dmg:'1d6',atk:attrLab('FOR'),effect:'1d6 + FOR',weight:4,value:'2 po'}),adaga:I0('Adaga','🗡️','Arma',{dmg:'1d4',atk:attrLab('DES'),effect:'1d4 + DES',weight:1,value:'2 po'}),
  arco:I0('Arco curto','🏹','Arma',{dmg:'1d6',atk:attrLab('DES'),range:'16',effect:'1d6 + DES, alcance 16',weight:2,value:'25 po'}),maca:I0('Maça','🔨','Arma',{dmg:'1d6',atk:attrLab('FOR'),effect:'1d6 + FOR',weight:4,value:'5 po'}),machado:I0('Machado grande','🪓','Arma',{dmg:'1d12',atk:attrLab('FOR'),effect:'1d12 + FOR',weight:7,value:'30 po'}),
  pocao:I0('Poção de cura','🧪','Consumível',{heal:'2d4+2',healBar:hpL,effect:'Recupera 2d4+2 de '+hpL,weight:.5,value:'50 po'}),eter:I0('Poção de mana','🔵','Consumível',{heal:'2d4',healBar:mpL,effect:'Recupera 2d4 de '+mpL,weight:.5,value:'50 po'}),
  garra:I0('Garras e presas','🐾','Arma',{dmg:'2d4',atk:attrLab('FOR'),effect:'Ataque natural'}),cimitarra:I0('Cimitarra','🗡️','Arma',{dmg:'1d6',atk:attrLab('DES'),effect:'1d6 + DES',weight:3,value:'25 po'}),clava:I0('Clava gigante','🪵','Arma',{dmg:'2d8',atk:attrLab('FOR'),effect:'2d8 + FOR',weight:10})};
 const sk={missil:S0('Mísseis mágicos','✨','Magia',{dmg:'3d4',atk:'— (acerta sempre)',mp:3,range:'24',effect:'3d4, nunca erra'}),fogo:S0('Raio de fogo','🔥','Magia',{dmg:'1d10',atk:attrLab('INT'),mp:0,range:'24',effect:'1d10, sem custo'}),cura:S0('Curar ferimentos','🌿','Magia',{heal:'1d8',atk:attrLab('SAB'),mp:2,range:'1',effect:'Cura 1d8 + SAB ao tocar'}),
  chama:S0('Chama sagrada','☀️','Magia',{dmg:'1d8',atk:attrLab('SAB'),mp:0,range:'12',effect:'1d8, sem custo'}),golpe:S0('Golpe poderoso','💥','Ativa',{dmg:'2d8',atk:attrLab('FOR'),mp:2,range:'1',effect:'2d8 corpo a corpo'}),furtivo:S0('Ataque furtivo','🗡️','Ativa',{dmg:'3d6',atk:attrLab('DES'),mp:2,range:'1',effect:'3d6 corpo a corpo'}),folego:S0('Segundo fôlego','🛡️','Ativa',{heal:'1d10',atk:'— (acerta sempre)',mp:2,range:'0',effect:'Recupera 1d10 em si mesmo'})};
 const tpl=cl(g.template),cls=tplFields(tpl).find(f=>f.type==='select'&&/classe|arqu[eé]tipo|ocupa/i.test(f.label));let linked=0;
 const kit={guerreiro:[[it.espada,1],[it.pocao,2]],mago:[[it.cajado,1],[it.eter,1],[it.pocao,1]],ladino:[[it.adaga,2],[it.arco,1],[it.pocao,1]],'clérigo':[[it.maca,1],[it.pocao,1]],clerigo:[[it.maca,1],[it.pocao,1]],'sábio':[[it.cajado,1],[it.eter,1]],'místico':[[it.maca,1],[it.pocao,1]],malandro:[[it.adaga,1],[it.arco,1]]};
 const ksk={guerreiro:[sk.golpe,sk.folego],mago:[sk.missil,sk.fogo],ladino:[sk.furtivo],'clérigo':[sk.cura,sk.chama],clerigo:[sk.cura,sk.chama],'sábio':[sk.missil,sk.fogo],'místico':[sk.cura,sk.chama],malandro:[sk.furtivo]};
 if(cls)(cls.choices||[]).forEach(c=>{const k=String(c.name).toLowerCase();if(kit[k]&&!(c.items||[]).length){c.items=kit[k].map(([item,qty])=>({item,qty}));linked++}if(ksk[k]&&!(c.skills||[]).length){c.skills=ksk[k].slice();linked++}});
 const F=tplFields(tpl),vals=o=>{const v=defaultValues(tpl);if(r.hp)v[r.hp]={cur:o.hp,max:o.hp};if(r.def){const f=F.find(x=>x.id===r.def);v[r.def]=f&&f.type==='text'?String(o.def):o.def}Object.entries(o.a||{}).forEach(([k,n])=>{const f=fByRe(ALIAS[k],['attr','number']);if(f)v[f.id]=f.type==='attr'?n:Math.max(1,Math.round((n-6)/3))});return v};
 const M=[['Goblin','👺','#5b8a3a',{hp:7,def:15,a:{FOR:8,DES:14,CON:10}},[it.cimitarra],50],['Lobo','🐺','#6b6f78',{hp:11,def:13,a:{FOR:12,DES:15,CON:12}},[it.garra],50],['Esqueleto','💀','#c9c2b0',{hp:13,def:13,a:{FOR:10,DES:14,CON:15}},[it.cimitarra,it.arco],50],['Orc','👹','#4d6b2f',{hp:15,def:13,a:{FOR:16,DES:12,CON:16}},[it.machado],100],['Ogro','🧌','#8a6a3a',{hp:59,def:11,a:{FOR:19,DES:8,CON:16}},[it.clava],450]];
 let nm=0;M.forEach(([name,emoji,color,st,weap,xp])=>{if(chars.some(c=>c.name===name&&!c.clone))return;chars.push({id:uid(),name,kind:'npc',emoji,color,values:vals(st),skills:[],inv:weap.map(item=>({k:uid(),item,qty:1})),token:null,xp});nm++});
 gamePatch({items,skills,chars,template:tpl,kit:true});return{linked,nm}}
ACT.kitAdd=()=>{const r=addStarterKit();toast(`Conteúdo inicial adicionado${r.nm?` · ${r.nm} monstros`:''}${r.linked?' · classes equipadas':''}`)};
