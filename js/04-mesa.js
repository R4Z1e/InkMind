/* ============ MESA DE JOGO (RPG ao vivo) ============ */
const T={unsub:[],zoom:1,grid:true,tool:'room',stamp:'🧰'};
const PT={sheet:['Ficha','user'],look:['Aparência','brush'],map:['Mapa','map'],bag:['Mochila','bag'],dice:['Dados','dice']};
const MT={tpl:['Modelo de ficha','tpl'],chars:['Personagens','users'],look:['Aparência e raças','brush'],maps:['Mapas','map'],skills:['Habilidades','spark'],items:['Itens','bag']};
const EMOJIS=['🛡️','⚔️','🏹','🧙','🗡️','🪓','🔮','🐺','🦊','🐉','💀','👑','🧝','🧛','🤖','🦉','🧌','👹'];
const COLORS=['#c0392b','#2e86de','#27ae60','#8e44ad','#e67e22','#16a085','#b7950b','#2c3e50'];
const STAMPS=['🧰','💰','💎','🔥','🕯️','🗿','⚰️','💀','🦴','🪨','🌲','🌳','🛏️','🪑','🛢️','📜','⚗️','🗝️','⚠️','🕸️','👹','🐉','🧟','🐺','⛲','🏺','🪤','⚔️','🚩','❓'];
const FTYPES={text:'Texto',number:'Número',attr:'Atributo (com mod.)',bar:'Barra de status',select:'Escolha (classe, raça…)',textarea:'Texto longo',check:'Marcador (sim/não)'};
const TPL_PRESETS={
 classico:['Clássico (fantasia)',[
  ['Identidade',[['Classe','select',{pick:true,choices:[
    ['Guerreiro','Combatente treinado em armas e armaduras.',{'Vida (PV)':'24','Mana (PM)':'4','Defesa':'16','FOR':'15','CON':'14','DES':'12','INT':'9','SAB':'10','CAR':'10'}],
    ['Mago','Estudioso das artes arcanas, frágil mas poderoso.',{'Vida (PV)':'12','Mana (PM)':'20','Defesa':'11','INT':'16','SAB':'13','FOR':'8','DES':'12','CON':'11','CAR':'10'}],
    ['Ladino','Ágil, furtivo e astuto.',{'Vida (PV)':'16','Mana (PM)':'8','Defesa':'14','DES':'16','CAR':'13','INT':'12','FOR':'10','CON':'11','SAB':'10'}],
    ['Clérigo','Servo de uma divindade: cura e protege.',{'Vida (PV)':'18','Mana (PM)':'14','Defesa':'15','SAB':'16','CON':'13','CAR':'12','FOR':'11','DES':'9','INT':'10'}]]}],
   ['Raça','select',{pick:true,choices:[
    ['Humano','Versáteis e ambiciosos.',{'FOR':'+1','DES':'+1','CON':'+1','INT':'+1','SAB':'+1','CAR':'+1','Deslocamento':'9 m'}],
    ['Elfo','Graciosos, de sentidos aguçados.',{'DES':'+2','INT':'+1','Deslocamento':'10 m'}],
    ['Meio-Elfo','Entre dois mundos, carismáticos.',{'CAR':'+2','DES':'+1','SAB':'+1'}],
    ['Anão','Resistentes e teimosos.',{'CON':'+2','FOR':'+1','Vida (PV)':'+2','Deslocamento':'7,5 m'}],
    ['Halfling','Pequenos, sortudos e corajosos.',{'DES':'+2','CAR':'+1','Deslocamento':'7,5 m'}],
    ['Gnomo','Curiosos e engenhosos.',{'INT':'+2','CON':'+1','Deslocamento':'7,5 m'}],
    ['Meio-Orc','Fortes e implacáveis.',{'FOR':'+2','CON':'+1'}],
    ['Orc','Ferozes e incansáveis.',{'FOR':'+2','CON':'+1','Vida (PV)':'+2'}],
    ['Tiefling','Herança infernal, chifres e olhos de brasa.',{'CAR':'+2','INT':'+1'}],
    ['Draconato','Sangue de dragão e sopro elemental.',{'FOR':'+2','CAR':'+1'}],
    ['Aasimar','Tocados pelos planos celestiais.',{'CAR':'+2','SAB':'+1'}],
    ['Golias','Gigantes das montanhas.',{'FOR':'+2','CON':'+1','Vida (PV)':'+2'}]]}],
   ['Antecedente','select',{pick:true,choices:[
    ['Nobre','Cresceu entre títulos e intrigas.',{'Perícias':'Diplomacia, História','Idiomas':'Comum, Élfico'}],
    ['Soldado','Serviu num exército.',{'Perícias':'Atletismo, Intimidação','Idiomas':'Comum'}],
    ['Eremita','Viveu isolado em busca de respostas.',{'Perícias':'Medicina, Religião','Idiomas':'Comum, Celestial'}],
    ['Criminoso','Conhece o submundo das cidades.',{'Perícias':'Furtividade, Enganação','Idiomas':'Comum, Gíria de ladrões'}]]}],
   ['Nível','number',{def:1}]]],
  ['Status',[['Vida (PV)','bar',{max:20,master:true}],['Mana (PM)','bar',{max:10,master:true}],['Defesa','number',{def:10}],['Deslocamento','text',{def:'9 m'}]]],
  ['Atributos',[['FOR','attr',{def:10}],['DES','attr',{def:10}],['CON','attr',{def:10}],['INT','attr',{def:10}],['SAB','attr',{def:10}],['CAR','attr',{def:10}]]],
  ['Perícias e talentos',[['Perícias','textarea'],['Idiomas','text']]],
  ['História',[['Aparência','textarea'],['História','textarea']]]]],
 simples:['Simples (narrativo)',[
  ['Identidade',[['Arquétipo','select',{pick:true,choices:[
    ['Guerreiro','Força e coragem.',{'Corpo':'4','Mente':'2','Espírito':'2','Vida':'14'}],['Sábio','Conhecimento e astúcia.',{'Corpo':'2','Mente':'4','Espírito':'2','Energia':'14'}],
    ['Místico','Fé e magia.',{'Corpo':'2','Mente':'2','Espírito':'4','Energia':'14'}],['Malandro','Lábia e sorte.',{'Corpo':'3','Mente':'3','Espírito':'2'}]]}],['Origem','text']]],
  ['Status',[['Vida','bar',{max:10,master:true}],['Energia','bar',{max:10,master:true}]]],
  ['Atributos',[['Corpo','number',{def:2}],['Mente','number',{def:2}],['Espírito','number',{def:2}]]],
  ['Notas',[['Traços','textarea'],['Objetivo','text']]]]],
 horror:['Horror investigativo',[
  ['Identidade',[['Ocupação','select',{pick:true,choices:[
    ['Detetive','Segue pistas que ninguém mais vê.',{'Perícias':'Investigar, Psicologia, Armas de fogo','Inteligência':'65'}],['Médico','Salva vidas, mesmo diante do impossível.',{'Perícias':'Medicina, Primeiros socorros, Ciência','Inteligência':'70'}],
    ['Jornalista','Sempre atrás da próxima história.',{'Perícias':'Persuadir, Biblioteca, Fotografia','Destreza':'55'}],['Professor','Conhece livros que não deveria.',{'Perícias':'Ocultismo, Línguas antigas, História','Poder':'60','Sanidade':'-5'}]]}],['Idade','number',{def:30}]]],
  ['Status',[['Vida','bar',{max:12,master:true}],['Sanidade','bar',{max:60,master:true}],['Sorte','number',{def:50}]]],
  ['Atributos',[['Força','number',{def:50}],['Destreza','number',{def:50}],['Inteligência','number',{def:50}],['Poder','number',{def:50}]]],
  ['Investigação',[['Perícias','textarea'],['Medos e traumas','textarea']]]]]
};
const ENT={
 skills:{title:'Habilidades',sub:'Magias, golpes e talentos que você concede aos personagens.',icon:'✨',empty:'Nenhuma habilidade ainda',emo:['✨','🔥','❄️','⚡','💥','🌀','🩸','🛡️','🌿','💀','👁️','🎯'],
  fields:[['name','Nome','text'],['icon','Ícone','emoji'],['type','Tipo','select',['Ativa','Passiva','Magia','Reação','Ritual']],['cost','Custo','text'],['range','Alcance','text'],['effect','Dano / efeito','text'],['desc','Descrição','textarea']]},
 items:{title:'Itens',sub:'Armas, poções e tesouros que vão para a mochila dos jogadores.',icon:'🎒',empty:'Nenhum item ainda',emo:['⚔️','🗡️','🏹','🛡️','🧪','💰','💎','📜','🗝️','💍','🍖','🔦'],
  fields:[['name','Nome','text'],['icon','Ícone','emoji'],['type','Tipo','select',['Arma','Armadura','Consumível','Equipamento','Tesouro','Chave/Missão','Outro']],['weight','Peso','number'],['value','Valor','text'],['effect','Dano / efeito','text'],['desc','Descrição','textarea']]}
};
const cl=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
function deepMerge(a,b){const o=(a&&typeof a==='object'&&!Array.isArray(a))?{...a}:{};for(const k in b){const bv=b[k];o[k]=(bv&&typeof bv==='object'&&!Array.isArray(bv)&&o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k]))?deepMerge(o[k],bv):cl(bv)}return o}
function presetTpl(k){const secs=TPL_PRESETS[k][1].map(([t,fs])=>({id:uid(),title:t,fields:fs.map(([label,type,o])=>({id:uid(),label,type,...cl(o||{})}))}));
 const byLabel={};secs.forEach(sc=>sc.fields.forEach(f=>byLabel[f.label]=f.id));
 secs.forEach(sc=>sc.fields.forEach(f=>{if(f.type==='select'){f.pick=f.pick!==false;f.choices=(f.choices||[]).map(([name,desc,set])=>{const o={};for(const l in set||{})if(byLabel[l])o[byLabel[l]]=set[l];return{id:uid(),name,desc:desc||'',set:o,skills:[],items:[]}})}}));
 return{sections:secs,base:{}}}
const tplFields=tpl=>(tpl&&tpl.sections||[]).flatMap(s=>s.fields||[]);
function fieldVal(f,vals){const v=vals?vals[f.id]:undefined;
 if(f.type==='bar'){const mx=+f.max||10;return v&&typeof v==='object'?{cur:+v.cur||0,max:+v.max||mx}:{cur:mx,max:mx}}
 if(v!==undefined&&v!==null)return v;if(f.type==='attr')return f.def??10;if(f.type==='number')return f.def??0;if(f.type==='check')return false;return f.def??''}
function defaultValues(tpl){const o={};tplFields(tpl).forEach(f=>o[f.id]=fieldVal(f,{}));return o}
const isMaster=()=>!!(T.game&&S.uid&&T.game.masterId===S.uid);
const mySeat=()=>T.seats.find(s=>s.uid===S.uid);
const itemById=id=>(T.game.items||[]).find(i=>i.id===id);
const modOf=v=>{const m=Math.floor((+v||0)/2-5);return(m>=0?'+':'')+m};

/* escrita compartilhada (uma por documento, com mesclagem) */
const SQ={};
function sharedWrite(path,op){
 const q=SQ[path]||(SQ[path]={run:false,op:null});
 if(op.patch&&q.op&&q.op.patch)q.op.patch=deepMerge(q.op.patch,op.patch);
 else if(op.patch&&q.op&&q.op.set)q.op.set=deepMerge(q.op.set,op.patch);
 else q.op=cl(op);
 if(!q.run)runShared(path);
}
async function runShared(path){
 const q=SQ[path];q.run=true;setStatus('saving');
 while(q.op){const op=q.op;q.op=null;const r=S.db.doc(path);
  try{if(op.set)await r.set(op.set);else if(op.patch)await r.update(op.patch);else if(op.del)await r.delete()}
  catch(e){console.warn('mesa',path,e);toast(e&&e.code==='invalid_argument'?'A mesa recusou essa alteração (sem permissão ou dado grande demais). '+(FBAVAIL()?'':'Jogadores precisam de acesso de Colaborador.'):e&&e.code==='resource_exhausted'?'Muitas alterações seguidas — aguarde um instante.':'Não foi possível salvar na mesa agora.','err');setStatus('err');q.run=false;return}}
 q.run=false;if(!Object.values(SQ).some(x=>x.run))setStatus('ok');
}
function seatPatch(u,patch){const s=T.seats.find(x=>x.uid===u);if(s)Object.assign(s,deepMerge(s,patch));sharedWrite('seats/'+u,{patch:{g:{[T.gid]:patch}}})}
function gamePatch(patch){T.game=deepMerge(T.game,patch);sharedWrite('games/'+T.gid,{patch})}

/* abrir / fechar mesa */
function closeTable(){try{ambStop()}catch{}['reqcard','reqres'].forEach(i=>{const e=document.getElementById(i);if(e)e.remove()});if(T.gid)setPresence({gid:null,role:null});(T.unsub||[]).forEach(u=>{try{u()}catch{}});T.unsub=[];try{saveMapD.flush()}catch{}}
async function openTable(gid,opts={}){
 if(S.backend!=='cloud'||!S.uid){await modal({title:'Mesa de jogo',body:FBAVAIL()?'<p>A mesa de jogo funciona com a sua conta do Inkmind — assim mestre e jogadores veem tudo ao vivo, cada um no seu aparelho.</p>':'<p>A mesa de jogo funciona com o app aberto no claude.ai, com sua conta conectada — assim mestre e jogadores veem tudo ao vivo.</p>',actions:FBAVAIL()?[{label:'Agora não'},{label:'Entrar',cls:'primary',value:'in'}]:[{label:'Entendi',cls:'primary'}]}).then(v=>{if(v==='in')INK.login()});return}
 closeTable();
 Object.assign(T,{gid,entered:!!opts.from,playerOnly:false,tplTab:'fields',from:opts.from||null,game:null,maps:{},seats:[],mode:'player',tab:'sheet',mtab:'tpl',unsub:[],loaded:false,edit:null,undo:[],rect:null,dragTok:null,tplJ:'',shownMap:null,bgCache:{},view:'tabs',seenRolls:new Set(),seedS:false,seedG:false,lastTrans:null,sessAt:undefined,doorSeen:{},doorSeeded:false,transBusy:false,localDoor:0,hSeen:new Set(),hSeeded:false,qSeen:null,reqWatch:null,pendSeen:null,deathTk:null,hpPrev:{}});
 S.P=null;document.body.classList.remove('focus');
 $('#app').innerHTML=`<div class="tbl"><header class="tbl-h"><button class="btn ghost sm" data-act="tBack">${I('back')}<span class="hide-m">${opts.from?'Voltar ao projeto':'Estante'}</span></button><b class="tt" id="tTitle">Mesa de jogo</b><span class="mpill" id="tMaster" style="display:none"></span><span class="sp"></span><button class="btn sm" data-act="tInvite" title="Convidar jogadores (link e código)">👥<span class="hide-m"> Convidar</span></button><span id="tSessBtn"></span><div class="seg modesw" id="tMode"></div><span class="status hide-m" id="status"></span><button class="btn sm ghost" data-act="cmdk" title="Buscar ferramenta (Ctrl+K)">${I('search')}</button><button class="btn sm show-m" data-act="tStatus">${I('users')}</button></header><nav class="subtabs" id="tSub"></nav><div id="tBody" class="tbl-b"><div class="empty"><div class="spin" style="margin:0 auto 12px"></div>Conectando à mesa…</div></div><div class="scrim" id="tScrim" data-act="tStatus"></div></div>`;
 const ref=S.db.doc('games/'+gid);
 try{const snap=await withTimeout(ref.get(),15000);
  if(!snap.exists){
   if(opts.create){await ref.set({kind:'game',id:gid,title:opts.title||'Mesa',masterId:S.uid,createdAt:Date.now(),template:presetTpl('classico'),chars:[],skills:[],items:[],activeMap:null,mrolls:[]});T.needKit=true}
   else{$('#tBody').innerHTML='<div class="empty"><div class="big">Mesa não encontrada</div><p>Ela pode ter sido removida pelo mestre.</p></div>';return}
  }else if(opts.title&&snap.data().masterId===S.uid&&snap.data().title!==opts.title){ref.update({title:opts.title}).catch(()=>{})}
 }catch(e){console.warn(e);if(ACL()&&e&&/permission/i.test((e.code||'')+' '+(e.message||''))){renderAskJoin(gid);return}$('#tBody').innerHTML=`<div class="empty"><div class="big">Não consegui abrir a mesa</div><p>${e&&e.code==='invalid_argument'?'Só o dono do app pode criar mesas.':'Verifique sua conexão e tente de novo.'}</p></div>`;return}
 const err=e=>{console.warn('mesa',e);if(e&&e.code==='revoked')toast('Seu acesso à mesa mudou.','err')};
 T.unsub.push(ref.onSnapshot(s=>{if(!s.exists)return;T.game=cl(s.data());T.game.chars=T.game.chars||[];T.game.skills=T.game.skills||[];T.game.items=T.game.items||[];onTableData('game')},err));
 T.unsub.push(S.db.collection('games/'+gid+'/maps').onSnapshot(s=>{const m={};s.docs.forEach(d=>{m[d.id]=cl(d.data())});T.maps=m;onTableData('maps')},err));
 T.unsub.push(S.db.collection('seats').where('gids','array-contains',gid).onSnapshot(s=>{T.seats=s.docs.map(d=>{const x=d.data()||{};return{...cl((x.g||{})[gid]||{}),uid:d.id,gids:cl(x.gids||[])}});onTableData('seats')},err));
}
ACT.tBack=()=>{closeTable();const f=T.from;T.gid=null;if(f&&S.projects.some(p=>p.id===f))openProject(f);else renderHome()};
ACT.tStatus=()=>{const p=$('#tPanel');if(!p)return;p.classList.toggle('open');$('#tScrim').classList.toggle('open',p.classList.contains('open'))};
function onTableData(kind){
 seedRolls(kind);if(!T.game)return;
 if(!T.loaded){if(kind!=='game')return;T.loaded=true;T.mode=isMaster()?'master':'player';T.tplJ=JSON.stringify(T.game.template);$('#tTitle').textContent=T.game.title||'Mesa de jogo';
  if(!T.entered){renderLobby();return}setPresence({gid:T.gid,role:T.mode==='master'?'master':'player'});renderTableShell();renderTab();updateMasterPill();v7after();return}
 if(!T.entered){renderLobby();return}
 liveRefresh(kind);v7after();
}
function renderTableShell(){
 $('#tTitle').textContent=T.game.title||'Mesa de jogo';
 $('#tMode').innerHTML=T.view==='play'?'':isMaster()?`<button data-act="tMode" data-m="player" class="${T.mode==='player'?'on':''}">${I('user')}<span class="ik-ml"> Jogador</span></button><button data-act="tMode" data-m="master" class="${T.mode==='master'?'on':''}">${I('table')}<span class="ik-ml"> Mestre</span></button>`:`<button class="on">${I('user')}<span class="ik-ml"> Jogador</span></button>`;
 updateSessBtn();if(T.view==='play'){$('#tScrim').classList.remove('open');setStatus('ok');renderPlay();return}
 renderSubtabs();
 const b=$('#tBody');b.className='tbl-b '+T.mode;
 b.innerHTML=T.mode==='player'?'<main class="tmain" id="tMain"></main><aside class="stpanel right" id="tPanel"></aside>':'<aside class="stpanel left" id="tPanel"></aside><main class="tmain" id="tMain"></main>';
 $('#tScrim').classList.remove('open');setStatus('ok');renderPanel();
}
function renderSubtabs(){const tabs=T.mode==='player'?PT:MT,cur=T.mode==='player'?T.tab:T.mtab;$('#tSub').innerHTML=Object.entries(tabs).map(([k,v])=>`<button data-act="tTab" data-t="${k}" class="${cur===k?'on':''}">${I(v[1])}${v[0]}</button>`).join('')}
function renderTab(){if(!$('#tMain'))return;if(T.mode==='player')PR[T.tab]();else MR[T.mtab]()}
ACT.tMode=el=>{saveMapD.flush();T.mode=el.dataset.m;setPresence({gid:T.gid,role:T.mode==='master'?'master':'player'});renderTableShell();renderTab();updateMasterPill()};
ACT.tTab=el=>{saveMapD.flush();if(T.mode==='player')T.tab=el.dataset.t;else T.mtab=el.dataset.t;renderSubtabs();renderTab()};
function liveRefresh(kind){
 const tt=$('#tTitle');if(tt)tt.textContent=T.game.title||'Mesa de jogo';
 if(T.view==='play'){refreshPlay();return}
 renderPanel();
 const tj=JSON.stringify(T.game.template),tplChanged=tj!==T.tplJ;T.tplJ=tj;
 const main=$('#tMain');if(!main)return;const busyInput=main.contains(document.activeElement)&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
 if(T.mode==='player'){
  if(T.tab==='sheet'){if($('#joinBox')){if(mySeat())renderTab();return}if(!mySeat()||!$('#psheet')||(tplChanged&&!busyInput))renderTab();else updateSheetLive()}
  else if(T.tab==='map'){if(!$('#mapC')||T.shownMap!==T.game.activeMap)renderTab();else redrawPlay()}
  else if(T.tab==='bag'){if(!busyInput)renderTab()}
  else if(T.tab==='dice')renderDiceLog();
  else if(T.tab==='look'){if(!mySeat())renderTab()}
 }else if(T.mtab==='maps'){if(!T.edit&&Object.keys(T.maps).length)MR.maps();else redrawEditor()}
}

/* painel de status */
let panelSeq=0;
async function renderPanel(){
 const el=$('#tPanel');if(!el||!T.game)return;const seq=++panelSeq;const master=T.mode==='master';
 const bars=tplFields(T.game.template).filter(f=>f.type==='bar');
 let ps={};try{if(S.user&&S.user.profiles&&T.seats.length)ps=await S.user.profiles(T.seats.map(s=>s.uid))}catch{}
 if(seq!==panelSeq||!$('#tPanel'))return;
 const barRow=(who,v,npc)=>bars.map((f,i)=>{const b=fieldVal(f,v||{}),pct=b.max?clamp(b.cur/b.max*100,0,100):0;return `<div class="sb"><span class="lbl" title="${esc(f.label)}">${esc(f.label)}</span><div class="sbar c${i%5}" ${master?`data-act="tBarSet" data-uid="${who}" data-f="${f.id}" ${npc?'data-npc="1"':''} style="cursor:pointer"`:''}><i style="width:${pct}%"></i><em>${b.cur} / ${b.max}</em></div>${master?`<button class="mini" data-act="tBar" data-uid="${who}" data-f="${f.id}" data-d="-1" ${npc?'data-npc="1"':''}>−</button><button class="mini" data-act="tBar" data-uid="${who}" data-f="${f.id}" data-d="1" ${npc?'data-npc="1"':''}>+</button>`:''}</div>`}).join('');
 const npcs=master?(T.game.chars||[]).filter(c=>c.token&&c.token.m&&c.token.m===T.game.activeMap):[];
 el.innerHTML=`<div class="row"><h4>${master?'Controle de status':'Status da sessão'}</h4><span class="sp"></span><span class="pill">${T.seats.length} jogador(es)</span><button class="btn sm ghost show-m" data-act="tStatus">×</button></div>
  ${T.seats.length?'':`<p class="muted small" style="margin-top:10px">${master?(FBAVAIL()?'Nenhum jogador entrou ainda. <a href="#" data-act="tInvite">👥 Convide os jogadores</a> — mande o link pelo WhatsApp ou passe o código da mesa.':'Nenhum jogador entrou ainda. Compartilhe este app com eles como <b>Colaboradores</b> — a mesa aparece na estante deles.'):'Ninguém na mesa ainda.'}</p>`}
  ${T.seats.map(s=>`<div class="pc ${s.uid===S.uid?'me':''}"><div class="pc-h">${avatarHTML(s)}<div class="grow" style="min-width:0"><b>${S.room?`<span class="odot ${playerOnline(s.uid)?'on':''}" title="${playerOnline(s.uid)?'Conectado':'Fora da mesa'}"></span>`:''}${esc(s.name||'Sem nome')}</b><small>${esc((ps[s.uid]&&ps[s.uid].name)||'Jogador')}${s.uid===S.uid?' · você':''}</small></div>${master?`<button class="btn sm ghost" data-act="tPcMenu" data-uid="${s.uid}" title="Ações">⋯</button>`:''}</div>
   ${barRow(s.uid,s.values,false)}
   <div class="conds">${(s.cond||[]).map((c,i)=>`<span class="cond">${esc(c)}${master?`<button data-act="tCondRm" data-uid="${s.uid}" data-i="${i}" title="Remover">×</button>`:''}</span>`).join('')}${master?`<button class="cond add" data-act="tCondAdd" data-uid="${s.uid}">+ condição</button>`:''}</div></div>`).join('')}
  ${npcs.length?`<h4 style="margin-top:18px">NPCs no mapa</h4>${npcs.map(c=>`<div class="pc npc"><div class="pc-h">${avatarHTML(c)}<div class="grow"><b>${esc(c.name)}</b><small>NPC</small></div></div>${barRow(c.id,c.values,true)}</div>`).join('')}`:''}`;
}
function setBar(who,fid,npc,fn){
 const f=tplFields(T.game.template).find(x=>x.id===fid);if(!f)return;
 if(npc){const chars=T.game.chars.map(c=>{if(c.id!==who)return c;const b=fn(fieldVal(f,c.values||{}));let down=!!c.down;try{if(fid===RULES().hp)down=b.cur<=0}catch{}return{...c,values:{...(c.values||{}),[fid]:b},down}});gamePatch({chars})}
 else{const s=T.seats.find(x=>x.uid===who);if(!s)return;seatPatch(who,{values:{[fid]:fn(fieldVal(f,s.values||{}))}})}
 renderPanel();if(T.mode==='player'&&T.tab==='sheet')updateSheetLive();
}
ACT.tBar=(el,e)=>{const d=(+el.dataset.d)*(e&&e.shiftKey?5:1);setBar(el.dataset.uid,el.dataset.f,!!el.dataset.npc,b=>({cur:clamp(b.cur+d,0,b.max),max:b.max}))};
ACT.tBarSet=async el=>{const f=tplFields(T.game.template).find(x=>x.id===el.dataset.f);if(!f)return;const npc=!!el.dataset.npc;const src=npc?(T.game.chars.find(c=>c.id===el.dataset.uid)||{}).values:(T.seats.find(s=>s.uid===el.dataset.uid)||{}).values;const b=fieldVal(f,src||{});
 const v=await modal({title:esc(f.label),body:`<div class="row"><div class="grow"><label class="f">Atual</label><input type="number" id="bvC" value="${b.cur}"></div><div class="grow"><label class="f">Máximo</label><input type="number" id="bvM" value="${b.max}"></div></div>`,actions:[{label:'Cancelar'},{label:'Aplicar',cls:'primary',onClick:ov=>({cur:Math.max(0,+$('#bvC',ov).value||0),max:Math.max(1,+$('#bvM',ov).value||1)})}]});
 if(v)setBar(el.dataset.uid,el.dataset.f,npc,()=>v)};
ACT.tCondAdd=async el=>{const s=T.seats.find(x=>x.uid===el.dataset.uid);if(!s)return;const c=await ask('Nova condição','Ex.: Envenenado, Caído, Abençoado (+2)');if(!c)return;seatPatch(s.uid,{cond:[...(s.cond||[]),c.slice(0,40)]});renderPanel()};
ACT.tCondRm=el=>{const s=T.seats.find(x=>x.uid===el.dataset.uid);if(!s)return;const c=[...(s.cond||[])];c.splice(+el.dataset.i,1);seatPatch(s.uid,{cond:c});renderPanel()};
ACT.tPcMenu=async el=>{const s=T.seats.find(x=>x.uid===el.dataset.uid);if(!s)return;
 const v=await modal({title:esc(s.name||'Jogador'),body:`<div class="menu-list"><button class="btn" data-v="sheet">📄 Ver / editar ficha</button><button class="btn" data-v="look">🎭 Aparência</button><button class="btn" data-v="bag">🎒 Mochila (dar itens)</button><button class="btn" data-v="skill">✨ Habilidades</button><button class="btn" data-v="place">📍 Colocar no mapa ativo</button><button class="btn danger" data-v="kick">Remover da mesa</button></div>`,onMount:(ov,close)=>$$('[data-v]',ov).forEach(b=>b.onclick=()=>close(b.dataset.v)),actions:[{label:'Fechar'}]});
 if(v==='look'){const L=await lookModal(s.look||autoLook(s.values,s.name),'Aparência de '+esc(s.name),seatRaceLock(s));if(L){seatPatch(s.uid,{look:L});renderPanel();liveRefresh('seats')}return}
 if(v==='sheet')sheetModal(s.uid);else if(v==='bag')bagModal(s.uid);else if(v==='skill')skillModal(s.uid);
 else if(v==='place'){const m=T.maps[T.game.activeMap];if(!m){toast('Nenhum mapa ativo. Mostre um mapa aos jogadores primeiro.','err');return}const sp=m.spawn||{x:1,y:1};seatPatch(s.uid,{pos:{m:m.id,x:sp.x,y:sp.y}});toast('Token colocado no início do mapa');liveRefresh('seats')}
 else if(v==='kick'){if(!await confirmDlg(`Remover ${esc(s.name)} da mesa? A ficha fica guardada se a pessoa voltar.`,'Remover'))return;sharedWrite('seats/'+s.uid,{patch:{gids:(s.gids||[]).filter(g=>g!==T.gid)}});T.seats=T.seats.filter(x=>x.uid!==s.uid);renderPanel()}};
async function sheetModal(u){const s=T.seats.find(x=>x.uid===u);if(!s)return;
 await modal({title:'Ficha de '+esc(s.name),wide:true,body:`<label class="f">Nome do personagem</label><input id="smN" value="${esc(s.name)}"><div class="sheet" id="smS" style="margin-top:12px">${sheetHTML(T.game.template,s.values||{},{canMaster:true})}</div>`,
  onMount:ov=>{bindSheet($('#smS',ov),(fid,v)=>{seatPatch(u,{values:{[fid]:v}});renderPanel()});$('#smN',ov).oninput=debounce(()=>{seatPatch(u,{name:$('#smN',ov).value});renderPanel()},400)},actions:[{label:'Fechar',cls:'primary'}]})}
async function bagModal(u){const s=T.seats.find(x=>x.uid===u);if(!s)return;const inv=cl(s.inv||[]);const g=T.game;
 await modal({title:'Mochila de '+esc(s.name),body:`<div id="bmL"></div>${g.items.length?`<label class="f">Dar item</label><div class="row"><select id="bmS">${g.items.map(i=>`<option value="${i.id}">${esc(i.icon||'')} ${esc(i.name)}</option>`).join('')}</select><input type="number" id="bmQ" value="1" min="1" style="width:72px"><button class="btn primary" id="bmA">Dar</button></div>`:'<p class="muted small">Crie itens na aba Mestre → Itens para entregá-los.</p>'}`,
  onMount:ov=>{const save=()=>seatPatch(u,{inv:cl(inv)});const draw=()=>{$('#bmL',ov).innerHTML=inv.map((e,i)=>{const it=itemById(e.item);return it?`<div class="row invmini"><span class="grow">${esc(it.icon||'')} ${esc(it.name)}</span><input type="number" min="1" value="${e.qty}" data-q="${i}" style="width:72px"><button class="btn sm ghost" data-rm="${i}">✕</button></div>`:''}).join('')||'<p class="muted small">Mochila vazia.</p>';
    $$('[data-q]',ov).forEach(x=>x.onchange=()=>{inv[+x.dataset.q].qty=Math.max(1,+x.value||1);save()});$$('[data-rm]',ov).forEach(x=>x.onclick=()=>{inv.splice(+x.dataset.rm,1);save();draw()})};draw();
   const a=$('#bmA',ov);if(a)a.onclick=()=>{const id=$('#bmS',ov).value,q=Math.max(1,+$('#bmQ',ov).value||1);const ex=inv.find(e=>e.item===id);if(ex)ex.qty+=q;else inv.push({k:uid(),item:id,qty:q});save();draw();toast('Item entregue')}},
  actions:[{label:'Fechar',cls:'primary'}]})}
async function skillModal(u){const s=T.seats.find(x=>x.uid===u);if(!s)return;const g=T.game;
 const v=await modal({title:'Habilidades de '+esc(s.name),body:g.skills.length?g.skills.map(k=>`<label class="ckrow"><input type="checkbox" data-sk="${k.id}" ${(s.skills||[]).includes(k.id)?'checked':''}> ${esc(k.icon||'✨')} <b>${esc(k.name)}</b> <span class="muted small">${esc(k.type||'')}</span></label>`).join(''):'<p class="muted">Crie habilidades na aba Mestre → Habilidades.</p>',
  actions:[{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>$$('[data-sk]',ov).filter(i=>i.checked).map(i=>i.dataset.sk)}]});
 if(v){seatPatch(u,{skills:v});toast('Habilidades atualizadas')}}

/* ficha */
function sheetHTML(tpl,vals,opt={}){return(tpl.sections||[]).map(sec=>`<div class="card sheet-sec"><h3>${esc(sec.title)}</h3><div class="sf-grid">${(sec.fields||[]).map(f=>fieldHTML(f,vals,opt)).join('')||'<span class="muted small">Seção vazia.</span>'}</div></div>`).join('')||'<p class="muted">O mestre ainda não montou a ficha.</p>'}
function bindSheet(root,onChange){
 const h=e=>{const t=e.target.closest('[data-f]');if(!t||!root.contains(t))return;const f=tplFields(T.game.template).find(x=>x.id===t.dataset.f);if(!f)return;let val;const box=t.closest('[data-fid]');
  if(f.type==='bar'){const cur=Math.max(0,+box.querySelector('[data-p=cur]').value||0),max=Math.max(1,+box.querySelector('[data-p=max]').value||1);val={cur,max};box.querySelector('.sbar i').style.width=clamp(cur/max*100,0,100)+'%';box.querySelector('.sbar em').textContent=cur+' / '+max}
  else if(f.type==='check')val=t.checked;
  else if(f.type==='number'||f.type==='attr'){val=t.value===''?'':+t.value;if(f.type==='attr')box.querySelector('.mod').textContent=modOf(t.value)}
  else val=t.value;
  onChange(f.id,val)};
 root.addEventListener('input',h);root.addEventListener('change',e=>{if(e.target.type==='checkbox'||e.target.tagName==='SELECT')h(e)});
}
function skillsHTML(ids){const L=(ids||[]).map(id=>T.game.skills.find(s=>s.id===id)).filter(Boolean);
 return L.length?L.map(s=>`<div class="invi">${entIcon(s,'✨')}<div class="grow"><b>${esc(s.name)}</b><small>${esc([s.type,s.cost&&('Custo: '+s.cost),s.range&&('Alcance: '+s.range),s.effect].filter(Boolean).join(' · '))}</small>${s.desc?`<p>${esc(s.desc)}</p>`:''}</div></div>`).join(''):'<p class="muted small">Nenhuma habilidade ainda — o mestre concede durante a campanha.</p>'}
const tokenPickerHTML=(e,c)=>`<div class="row" style="align-items:flex-start;gap:12px"><span class="tok big" id="tkPrev" style="background:${esc(c)}">${esc(e)}</span><div class="grow"><div class="emo-grid">${EMOJIS.map(x=>`<button type="button" class="${x===e?'on':''}" data-tke="${x}">${x}</button>`).join('')}</div><div class="col-grid">${COLORS.map(x=>`<button type="button" class="${x===c?'on':''}" data-tkc="${x}" style="background:${x}" aria-label="cor"></button>`).join('')}</div></div></div>`;
function bindTokenPicker(root,o){
 $$('[data-tke]',root).forEach(b=>b.onclick=()=>{o.emoji=b.dataset.tke;$$('[data-tke]',root).forEach(x=>x.classList.toggle('on',x===b));$('#tkPrev',root).textContent=o.emoji});
 $$('[data-tkc]',root).forEach(b=>b.onclick=()=>{o.color=b.dataset.tkc;$$('[data-tkc]',root).forEach(x=>x.classList.toggle('on',x===b));$('#tkPrev',root).style.background=o.color});
}

/* ---- abas do JOGADOR ---- */
const PR={};
ACT.tTokenEdit=async()=>{const s=mySeat();if(!s)return;const o={emoji:s.emoji,color:s.color};
 const v=await modal({title:'Ícone no mapa',body:tokenPickerHTML(o.emoji,o.color),onMount:ov=>bindTokenPicker(ov,o),actions:[{label:'Cancelar'},{label:'Salvar',cls:'primary',value:true}]});
 if(v){seatPatch(S.uid,{emoji:o.emoji,color:o.color});renderTab();renderPanel()}};
PR.map=()=>{const g=T.game,m=T.maps[g.activeMap];T.shownMap=g.activeMap;
 if(!m){$('#tMain').innerHTML=`<div class="empty"><div class="big">Nenhum mapa aberto</div><p>${isMaster()?'Crie um mapa em Mestre → Mapas e toque em “Mostrar aos jogadores”.':'O mestre ainda não revelou o mapa desta cena.'}</p></div>`;return}
 const s=mySeat(),placed=s&&s.pos&&s.pos.m===m.id;
 $('#tMain').innerHTML=`<div class="mapview"><div class="mapbar"><b>${esc(m.name)}</b><span class="sp"></span>${s&&!placed?'<button class="btn sm primary" data-act="tPlace">Colocar meu token</button>':''}${placed?'<button class="btn sm" data-act="tFind">Achar meu token</button>':''}</div>
  <div class="mapscroll ${m.style==='dark'?'darkbg':''}" id="mapScroll"><div class="mapstack"><canvas id="mapC"></canvas><canvas id="tokC" class="tokc"></canvas></div></div><p class="small muted mapHint">${m.fogOn&&!isMaster()?'Áreas escuras ainda não foram reveladas. ':''}Arraste ${isMaster()?'qualquer token':'o seu token'} para mover · arraste o fundo para navegar.</p></div>`;
 bindMapCanvas($('#mapC'),$('#mapScroll'),{map:()=>T.maps[T.game.activeMap],redraw:redrawPlay,editor:false});redrawPlay();
};
function redrawPlay(){const m=T.maps[T.game.activeMap],cv=$('#mapC');if(!m||!cv||(T.mode!=='player'&&T.view!=='play'))return;const tokens=mapTokens(m),fm=isMaster()?'master':'player',bgr=()=>{T.playKey=null;redrawPlay()},bi=bgImg(m,bgr);
 const key=JSON.stringify([m,T.zoom,m.fogOn&&m.vision?tokens.filter(t=>t.kind==='pc').map(t=>[t.x,t.y]):0,!!bi]);
 if(key!==T.playKey||!cv._cell){drawMap(cv,m,{cell:28*T.zoom,grid:true,tokens,noTokens:true,bgImg:bi,fogMode:fm});T.playKey=key}tlSync($('#tokC'),cv,m,tokens,fm)}
ACT.tPlace=()=>{const m=T.maps[T.game.activeMap];if(!m)return;const sp=m.spawn||{x:1,y:1};seatPatch(S.uid,{pos:{m:m.id,x:sp.x,y:sp.y}});renderTab();setTimeout(()=>ACT.tFind(),60)};
ACT.tFind=()=>{const s=mySeat(),sc=$('#mapScroll'),cv=$('#mapC'),m=T.maps[T.game.activeMap];if(!s||!s.pos||!sc||!cv||!m)return;const c=cv.getBoundingClientRect().width/m.w;sc.scrollTo({left:s.pos.x*c-sc.clientWidth/2+20,top:s.pos.y*c-sc.clientHeight/2+20,behavior:'smooth'})};
ACT.tZoom=el=>{T.zoom=clamp(T.zoom+(+el.dataset.d)*.25,.3,2.5);if(T.view==='play'){T.playKey=null;redrawPlay()}else if(T.mode==='master')redrawEditor();else redrawPlay()};
PR.bag=()=>{const s=mySeat();if(!s)return renderJoin();
 const items=(s.inv||[]).map(e=>({e,it:itemById(e.item)})).filter(x=>x.it),weight=items.reduce((a,x)=>a+(+x.it.weight||0)*x.e.qty,0);
 $('#tMain').innerHTML=`<div class="tpad narrow"><div class="vh"><div class="grow"><h2>Mochila</h2><p>Itens entregues pelo mestre durante a aventura.</p></div></div>
  <div class="row wrap" style="margin-bottom:12px"><label class="row" style="gap:6px">💰 Moedas <input type="number" id="pCoins" value="${+s.coins||0}" style="width:110px"></label><span class="sp"></span><span class="pill">Peso total: ${weight}</span></div>
  ${items.length?items.map(({e,it})=>`<div class="invi">${entIcon(it,'🎒')}<div class="grow"><b>${esc(it.name)}</b> <span class="pill">×${e.qty}</span><small>${esc([it.type,it.effect,it.weight?('peso '+it.weight):'',it.value?('valor '+it.value):''].filter(Boolean).join(' · '))}</small>${it.desc?`<p>${esc(it.desc)}</p>`:''}</div><div style="display:flex;flex-direction:column;gap:4px">${MOD('equip')&&it.slot&&it.slot!=='—'?`<button class="btn sm ${e.eq?'primary':''}" data-act="tEquip" data-k="${e.k}">${e.eq?'✓ Equipado':'Equipar'}</button>`:''}<button class="btn sm" data-act="tUse" data-k="${e.k}">Usar</button><button class="btn sm ghost" data-act="tDrop" data-k="${e.k}">Descartar</button></div></div>`).join(''):'<div class="empty"><div class="big">Mochila vazia</div><p>O mestre entrega itens durante a aventura.</p></div>'}</div>`;
 $('#pCoins').oninput=debounce(()=>seatPatch(S.uid,{coins:+$('#pCoins').value||0}),500);
};
ACT.tUse=el=>{const s=mySeat();if(!s)return;const inv=cl(s.inv||[]);const e=inv.find(x=>x.k===el.dataset.k);if(!e)return;const it=itemById(e.item);e.qty--;seatPatch(S.uid,{inv:inv.filter(x=>x.qty>0)});toast('Usou: '+(it?it.name:'item'));renderTab()};
ACT.tDrop=async el=>{const s=mySeat();if(!s)return;if(!await confirmDlg('Descartar este item da mochila?','Descartar'))return;seatPatch(S.uid,{inv:(s.inv||[]).filter(x=>x.k!==el.dataset.k)});renderTab()};
PR.dice=()=>{const s=mySeat(),attrs=tplFields(T.game.template).filter(f=>f.type==='attr');
 $('#tMain').innerHTML=`<div class="tpad narrow"><div class="card dicecard"><div class="res" id="dRes">—</div><div class="det" id="dDet">Role e todos na mesa verão o resultado.</div>
  <div class="dq">${[4,6,8,10,12,20,100].map(n=>`<button class="btn" data-roll="1d${n}">d${n}</button>`).join('')}<button class="btn" data-roll="2d6">2d6</button></div>
  <div class="row"><input id="dExp" placeholder="Ex.: 1d20+5, 4d6, 2d8-1"><button class="btn primary" id="dGo">Rolar</button></div>
  ${s&&attrs.length?`<label class="f">Teste de atributo (1d20 + modificador)</label><div class="row wrap">${attrs.map(f=>{const m=modOf(fieldVal(f,s.values||{}));return `<button class="btn sm" data-roll="1d20${m}" data-lbl="${esc(f.label)}">${esc(f.label)} ${m}</button>`}).join('')}</div>`:''}
  ${!s&&!isMaster()?'<p class="small muted" style="margin-top:10px">Entre na mesa (aba Ficha) para compartilhar suas rolagens.</p>':''}</div>
  <div class="card" style="margin-top:14px"><h3>Rolagens da mesa</h3><div id="dLog" class="dlog"></div></div></div>`;
 const go=(ex,l)=>tRoll(ex,l);$$('[data-roll]').forEach(b=>b.onclick=()=>go(b.dataset.roll,b.dataset.lbl));$('#dGo').onclick=()=>go($('#dExp').value);$('#dExp').onkeydown=e=>{if(e.key==='Enter')go(e.target.value)};
 renderDiceLog();
};
function tRoll(expr,label,secret){let r;try{r=roll(expr)}catch{toast('Expressão inválida. Use algo como 2d6+3.','err');return}
 const dr=$('#dRes'),dd=$('#dDet');if(dr)dr.textContent=r.total;if(dd)dd.textContent=(label?label+' · ':'')+r.expr+' → '+r.detail;
 const e={id:uid(),t:Date.now(),e:r.expr,v:r.total,d:r.detail,l:label||'',dice:(r.dice||[]).slice(0,12)},s=mySeat();
 if(secret){diceQueue({...e,who:'🤫 Mestre — rolagem secreta',color:'#3b2f55'});return}
 T.seenRolls&&T.seenRolls.add(e.id);diceQueue({...e,who:s?(s.name||'Jogador'):'Mestre',look:s&&s.look,color:s?s.color:'#8b3a2b'});
 if(s)seatPatch(S.uid,{rolls:[e,...(s.rolls||[])].slice(0,15)});else if(isMaster())gamePatch({mrolls:[e,...(T.game.mrolls||[])].slice(0,20)});
 renderDiceLog()}
function renderDiceLog(){const el=$('#dLog');if(!el)return;
 const all=[...T.seats.flatMap(s=>(s.rolls||[]).map(r=>({...r,who:s.name||'Jogador'}))),...(T.game.mrolls||[]).map(r=>({...r,who:'Mestre'}))].sort((a,b)=>b.t-a.t).slice(0,40);
 el.innerHTML=all.map(r=>`<div><b>${r.v}</b> · <span>${esc(r.who)}</span> ${r.l?`<span class="pill">${esc(r.l)}</span>`:''} <span class="muted small">${esc(r.e)} ${esc(r.d)} · ${new Date(r.t).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div>`).join('')||'<p class="muted small">Nenhuma rolagem ainda.</p>'}

/* ---- abas do MESTRE ---- */
const MR={};
function saveTpl(){gamePatch({template:cl(T.game.template)})}
const saveTplD=debounce(saveTpl,700);
ACT.tplPreset=async el=>{if(!await confirmDlg('Substituir o modelo atual por “'+TPL_PRESETS[el.dataset.k][0]+'”? Valores já preenchidos pelos jogadores em campos removidos deixam de aparecer.','Substituir'))return;T.game.template=presetTpl(el.dataset.k);saveTpl();MR.tpl()};
ACT.tplSec=async el=>{const L=T.game.template.sections,i=+el.dataset.si,op=el.dataset.op;
 if(op==='add')L.push({id:uid(),title:'Nova seção',fields:[{id:uid(),label:'Novo campo',type:'text'}]});
 else if(op==='del'){if(L[i].fields.length&&!await confirmDlg(`Excluir a seção “${esc(L[i].title)}” e seus campos?`))return;L.splice(i,1)}
 else{const j=i+(op==='up'?-1:1);if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]]}
 saveTpl();MR.tpl()};
ACT.tplField=el=>{const sec=T.game.template.sections[+el.dataset.si],F=sec.fields,i=+el.dataset.fi,op=el.dataset.op;
 if(op==='add')F.push({id:uid(),label:'Novo campo',type:'text'});else if(op==='del')F.splice(i,1);else{const j=i+(op==='up'?-1:1);if(j<0||j>=F.length)return;[F[i],F[j]]=[F[j],F[i]]}
 saveTpl();MR.tpl();if(op==='add'){const r=$$(`.tfield[data-si="${el.dataset.si}"] input[data-k=label]`).pop();if(r){r.focus();r.select()}}};
MR.chars=()=>{const g=T.game,used=id=>T.seats.find(s=>s.from===id);
 $('#tMain').innerHTML=`<div class="tpad"><div class="vh"><div class="grow"><h2>Personagens</h2><p>Heróis prontos para os jogadores escolherem e NPCs/inimigos da campanha.</p></div><button class="btn primary" data-act="chrEdit">${I('plus')} Novo personagem</button></div>
  ${g.chars.length?`<div class="ent-list">${g.chars.map(c=>`<button class="ent" data-act="chrEdit" data-id="${c.id}">${avatarHTML(c,'tok big')}<b>${esc(c.name)}</b><small>${c.kind==='npc'?'NPC / inimigo':'Pronto para jogadores'}${used(c.id)?' · em uso por '+esc(used(c.id).name):''}${c.token?' · no mapa':''}</small></button>`).join('')}</div>`:'<div class="empty"><div class="big">Nenhum personagem</div><p>Crie heróis prontos para os jogadores ou os vilões da história.</p></div>'}</div>`;
};
ACT.chrEdit=el=>editChar(el.dataset.id||null);
async function editChar(id){
 const g=T.game,isNew=!id;const c=isNew?{id:uid(),name:'',kind:'pregen',emoji:'🧝',color:COLORS[1],values:defaultValues(g.template),skills:[],inv:[],token:null}:cl(g.chars.find(x=>x.id===id));if(!c)return;
 c.values=c.values||{};c.skills=c.skills||[];c.inv=c.inv||[];
 const res=await modal({title:isNew?'Novo personagem':esc(c.name),wide:true,body:`<div class="row wrap"><div class="grow"><label class="f">Nome</label><input id="cN" value="${esc(c.name)}" maxlength="60"></div><div style="min-width:200px"><label class="f">Tipo</label><select id="cK"><option value="pregen">Pronto para jogadores</option><option value="npc">NPC / inimigo</option></select></div><div style="width:140px"><label class="f">XP ao derrotar</label><input type="number" id="cXp" min="0" value="${+c.xp||0}"></div></div>
  <div class="row wrap" style="margin-top:12px;align-items:center"><span id="cLookPrev">${avatarHTML(c,'tok big')}</span><button class="btn" id="cLook" type="button">🎭 Criar / editar aparência</button><span class="small muted">Sem aparência, o token usa o ícone abaixo.</span></div>
  <label class="f">Ícone do token</label>${tokenPickerHTML(c.emoji,c.color)}
  <div class="sheet" id="cSheet" style="margin-top:14px">${sheetHTML(g.template,c.values,{canMaster:true})}</div>
  <div class="card"><h3>Habilidades</h3>${g.skills.map(s=>`<label class="ckrow"><input type="checkbox" data-sk="${s.id}" ${c.skills.includes(s.id)?'checked':''}> ${esc(s.icon||'✨')} ${esc(s.name)}</label>`).join('')||'<p class="muted small">Crie habilidades na aba Habilidades.</p>'}</div>
  <div class="card" style="margin-top:14px"><h3>Itens iniciais</h3><div id="cInv"></div>${g.items.length?`<div class="row" style="margin-top:8px"><select id="cItS">${g.items.map(i=>`<option value="${i.id}">${esc(i.icon||'')} ${esc(i.name)}</option>`).join('')}</select><button class="btn sm" id="cItA">Adicionar</button></div>`:'<p class="muted small">Crie itens na aba Itens.</p>'}</div>
  <label class="toggle"><input type="checkbox" id="cTok" ${c.token?'checked':''}><span class="sw"></span>Mostrar token no mapa ativo</label>`,
  onMount:ov=>{$('#cK',ov).value=c.kind||'pregen';bindTokenPicker(ov,c);$('#cLook',ov).onclick=async()=>{const L=await lookModal(c.look||autoLook(c.values,c.name||$('#cN',ov).value),'Aparência — '+esc($('#cN',ov).value||'personagem'));if(L){c.look=L;$('#cLookPrev',ov).innerHTML=avatarHTML(c,'tok big')}};bindSheet($('#cSheet',ov),(fid,v)=>{c.values[fid]=v});
   const drawInv=()=>{$('#cInv',ov).innerHTML=c.inv.map((e,i)=>{const it=itemById(e.item);return `<div class="row invmini"><span class="grow">${esc(it?it.icon:'❔')} ${esc(it?it.name:'Item removido')}</span><input type="number" min="1" value="${e.qty}" data-q="${i}" style="width:72px"><button class="btn sm ghost" data-rmi="${i}">✕</button></div>`}).join('')||'<p class="muted small">Nenhum item.</p>';
    $$('[data-q]',ov).forEach(i=>i.oninput=()=>{c.inv[+i.dataset.q].qty=Math.max(1,+i.value||1)});$$('[data-rmi]',ov).forEach(b=>b.onclick=()=>{c.inv.splice(+b.dataset.rmi,1);drawInv()})};drawInv();
   const a=$('#cItA',ov);if(a)a.onclick=()=>{c.inv.push({k:uid(),item:$('#cItS',ov).value,qty:1});drawInv()};
   ov._sync=()=>{c.xp=+$('#cXp',ov).value||0;c.name=$('#cN',ov).value.trim()||'Sem nome';c.kind=$('#cK',ov).value;c.skills=$$('[data-sk]',ov).filter(i=>i.checked).map(i=>i.dataset.sk);const tk=$('#cTok',ov).checked;
    if(tk&&!(c.token&&c.token.m===g.activeMap)){const m=T.maps[g.activeMap];if(m){const sp=m.spawn||{x:1,y:1};c.token={m:m.id,x:clamp(sp.x+2,0,m.w-1),y:sp.y}}else{c.token=null;toast('Não há mapa ativo — mostre um mapa aos jogadores primeiro.')}}if(!tk)c.token=null}},
  actions:[...(isNew?[]:[{label:I('trash')+' Excluir',cls:'danger',value:'del'}]),{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>{ov._sync();return 'save'}}]});
 if(!res)return;let chars;
 if(res==='del'){if(!await confirmDlg(`Excluir “${esc(c.name)}”?`))return;chars=g.chars.filter(x=>x.id!==c.id)}else chars=isNew?[...g.chars,c]:g.chars.map(x=>x.id===c.id?c:x);
 gamePatch({chars});MR.chars();renderPanel();
}
function entTab(kind){const L=T.game[kind]||[],E=ENT[kind];
 $('#tMain').innerHTML=`<div class="tpad"><div class="vh"><div class="grow"><h2>${E.title}</h2><p>${E.sub}</p></div><button class="btn primary" data-act="entEdit" data-k="${kind}">${I('plus')} Novo</button></div>
  ${L.length?`<div class="ent-list">${L.map(e=>`<button class="ent" data-act="entEdit" data-k="${kind}" data-id="${e.id}">${entIcon(e,E.icon)}<b>${esc(e.name)}</b><small>${esc([e.type,e.cost,e.effect].filter(Boolean).join(' · '))}</small></button>`).join('')}</div>`:`<div class="empty"><div class="big">${E.empty}</div><p>Depois de criar, entregue aos personagens pelo painel de status (⋯).</p></div>`}</div>`}
MR.skills=()=>entTab('skills');MR.items=()=>entTab('items');
ACT.entEdit=el=>editEnt(el.dataset.k,el.dataset.id||null);
async function editEnt(kind,id){
 const E=ENT[kind],L=T.game[kind]||[],isNew=!id;const e=isNew?{id:uid(),icon:E.icon,type:E.fields.find(f=>f[0]==='type')[3][0]}:cl(L.find(x=>x.id===id));if(!e)return;
 const imgRow=S.assets?`<label class="f">Imagem (opcional — substitui o ícone)</label><div class="row wrap"><span id="enImg">${e.img?`<img src="${esc(e.img)}" class="en-img" alt="">`:''}</span><button type="button" class="btn sm" id="enUp">${I('up')} Enviar</button><button type="button" class="btn sm" id="enGen">🎨 Gerar com IA</button>${e.img?'<button type="button" class="btn sm ghost danger" id="enRm">Remover</button>':''}</div>`:'';
 const body=imgRow+E.fields.map(([k,l,t,opts])=>`<label class="f">${l}</label>`+(t==='textarea'?`<textarea data-e="${k}" rows="4">${esc(e[k]||'')}</textarea>`
  :t==='select'?`<select data-e="${k}">${(typeof opts==='function'?opts():opts).map(o=>`<option ${e[k]===o?'selected':''}>${o}</option>`).join('')}</select>`
  :t==='emoji'?`<div class="row" style="align-items:flex-start"><input data-e="${k}" value="${esc(e[k]||'')}" style="width:64px;font-size:22px;text-align:center"><div class="emo-grid">${E.emo.map(x=>`<button type="button" data-emo="${x}">${x}</button>`).join('')}</div></div>`
  :`<input data-e="${k}" ${t==='number'?'type="number"':''} value="${esc(e[k]??'')}">`)).join('');
 const v=await modal({title:isNew?'Novo — '+E.title:esc(e.name),body,onMount:ov=>{$$('[data-emo]',ov).forEach(b=>b.onclick=()=>{$('[data-e=icon]',ov).value=b.dataset.emo});const setI=src=>{e.img=src;$('#enImg',ov).innerHTML=src?`<img src="${esc(src)}" class="en-img" alt="">`:''};const u=$('#enUp',ov);if(u)u.onclick=async()=>{const [f]=await pickFile('image/*');if(!f)return;const b=busy('Enviando…');try{setI((await storeImage(f)).src)}catch(er){toast(er.message,'err')}finally{b.done()}};const gg=$('#enGen',ov);if(gg)gg.onclick=async()=>{const r=await genImage();if(r)setI(r.src)};const rm=$('#enRm',ov);if(rm)rm.onclick=()=>{setI(null);rm.remove()}},
  actions:[...(isNew?[]:[{label:I('trash')+' Excluir',cls:'danger',value:'del'}]),{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>{$$('[data-e]',ov).forEach(i=>e[i.dataset.e]=i.type==='number'?(i.value===''?'':+i.value):i.value);e.name=(e.name||'').trim()||'Sem nome';return 'save'}}]});
 if(!v)return;let nl;if(v==='del'){if(!await confirmDlg(`Excluir “${esc(e.name)}”?`))return;nl=L.filter(x=>x.id!==e.id)}else nl=isNew?[...L,e]:L.map(x=>x.id===e.id?e:x);
 gamePatch({[kind]:nl});entTab(kind);
}

/* ---- MAPAS: dois estilos (masmorra clássica e fantasia sombria), névoa de guerra ---- */
const MAP_STYLES={classic:['🗺️ Masmorra clássica','Traço preto e branco com hachuras, como papel de mestre'],dark:['🌲 Fantasia sombria','Terrenos pintados, florestas, montanhas e muros em relevo']};
const SOLID=new Set(['w','k']);
const walkable=ch=>!!ch&&ch!==' '&&!SOLID.has(ch);
function tileAt(m,x,y){return(x<0||y<0||x>=m.w||y>=m.h)?' ':(m.tiles[y*m.w+x]||' ')}
const MTOOLS=[
 ['Desenho'],['hand','✋','Mover'],['room','⬜','Sala'],['floor','🪨','Piso'],['erase','🧽','Apagar'],['door','🚪','Porta'],['stairs','🪜','Escada'],['pit','🕳️','Buraco'],
 ['Terrenos'],['grass','🌿','Grama'],['road','🟤','Estrada'],['cobble','🔳','Calçada'],['wood','🪵','Madeira'],['sand','🏜️','Areia'],['snow','❄️','Neve'],['water','🌊','Água'],['swamp','🐸','Pântano'],['lava','🔥','Lava'],
 ['Obstáculos'],['forest','🌲','Floresta'],['mount','⛰️','Montanha'],['house','🏠','Casa'],['wall','🧱','Muro'],['pillar','⬛','Coluna'],
 ['Detalhes'],['stamp','🧰','Objetos'],['text','🔤','Texto'],['spawn','⭐','Início'],['link','🔗','Ligar porta'],
 ['Névoa'],['reveal','🔦','Revelar'],['hide','🌫️','Ocultar']
];
const TOOLCH={floor:'f',erase:' ',door:'d',pillar:'w',water:'a',grass:'g',lava:'l',wood:'b',stairs:'s',pit:'p',road:'r',cobble:'c',sand:'n',snow:'v',swamp:'z',forest:'t',mount:'m',house:'h',wall:'k'};
const EMOJI_FONT='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hash2=(i,j)=>(Math.imul(i+1,73856093)^Math.imul(j+1,19349663))>>>0;
const mapDpr=()=>Math.min(2,window.devicePixelRatio||1);

/* ===== estilo clássico ===== */
let _hatch=null;
function hatchPat(ctx){if(!_hatch){const c=document.createElement('canvas');c.width=c.height=9;const x=c.getContext('2d');x.strokeStyle='#5d564c';x.lineWidth=1.1;x.beginPath();x.moveTo(-2,11);x.lineTo(11,-2);x.moveTo(-2,2);x.lineTo(2,-2);x.moveTo(7,11);x.lineTo(11,7);x.stroke();_hatch=c}return ctx.createPattern(_hatch,'repeat')}
const TFILL={f:'#fbfaf6',d:'#fbfaf6',s:'#fbfaf6',p:'#fbfaf6',b:'#e6cfa3',a:'#a8cfe8',g:'#c6e0a8',l:'#f2a056',w:'#35302b',k:'#35302b',r:'#ece0c6',c:'#ebe8e1',n:'#f1e5c2',v:'#f7f9fb',z:'#cbd6b2',t:'#cfe2b8',m:'#e6e0d3',h:'#fbfaf6'};
function decorClassic(x,t,X,Y,c,i,j){x.save();const R=rng(hash2(i,j));
 if(t==='b'){x.strokeStyle='#c19a63';x.lineWidth=1;x.beginPath();for(let k=1;k<3;k++){x.moveTo(X,Y+k*c/3);x.lineTo(X+c,Y+k*c/3)}x.stroke()}
 else if(t==='a'){x.strokeStyle='#5f9cc8';x.lineWidth=1.2;x.beginPath();for(let k=0;k<2;k++){const yy=Y+c*(.35+k*.32);x.moveTo(X+c*.15,yy);x.quadraticCurveTo(X+c*.32,yy-c*.12,X+c*.5,yy);x.quadraticCurveTo(X+c*.68,yy+c*.12,X+c*.85,yy)}x.stroke()}
 else if(t==='g'||t==='z'){x.strokeStyle=t==='z'?'#5e7a45':'#6f9c4a';x.lineWidth=1.2;x.beginPath();[[.3,.45],[.68,.72],[.72,.32]].forEach(([a,b])=>{const px=X+a*c,py=Y+b*c;x.moveTo(px-c*.08,py);x.lineTo(px-c*.12,py-c*.14);x.moveTo(px,py);x.lineTo(px,py-c*.17);x.moveTo(px+c*.08,py);x.lineTo(px+c*.12,py-c*.14)});x.stroke();if(t==='z'){x.fillStyle='#8fb0a8';x.beginPath();x.ellipse(X+c*.35,Y+c*.75,c*.18,c*.08,0,0,7);x.fill()}}
 else if(t==='l'){x.fillStyle='#d9542a';[[.32,.38,.12],[.7,.66,.14]].forEach(([a,b,r])=>{x.beginPath();x.arc(X+a*c,Y+b*c,r*c,0,7);x.fill()});x.fillStyle='#ffd27a';x.beginPath();x.arc(X+c*.62,Y+c*.3,c*.06,0,7);x.fill()}
 else if(t==='s'){x.strokeStyle='#3a342d';x.lineWidth=1.3;x.beginPath();for(let k=1;k<5;k++){x.moveTo(X+c*.15,Y+k*c/5);x.lineTo(X+c*.85,Y+k*c/5)}x.stroke()}
 else if(t==='p'){x.fillStyle='#1c1916';x.beginPath();x.arc(X+c/2,Y+c/2,c*.34,0,7);x.fill()}
 else if(t==='w'||t==='k'){x.strokeStyle='#5a534a';x.lineWidth=1;x.beginPath();x.moveTo(X+3,Y+3);x.lineTo(X+c-3,Y+c-3);x.moveTo(X+c-3,Y+3);x.lineTo(X+3,Y+c-3);x.stroke()}
 else if(t==='r'||t==='n'||t==='v'){x.fillStyle=t==='v'?'#b9c4cf':'#a8957a';for(let k=0;k<5;k++){x.beginPath();x.arc(X+R()*c,Y+R()*c,c*.035,0,7);x.fill()}}
 else if(t==='c'){x.strokeStyle='#9a958c';x.lineWidth=1;for(let k=0;k<4;k++){x.beginPath();x.ellipse(X+(k%2*.5+.25)*c,Y+(Math.floor(k/2)*.5+.25)*c,c*.2,c*.17,0,0,7);x.stroke()}}
 else if(t==='t'){x.strokeStyle='#2f4a22';x.fillStyle='#9fc483';x.lineWidth=1.4;[[.35,.4,.24],[.66,.62,.22]].forEach(([a,b,r])=>{x.beginPath();x.arc(X+a*c,Y+b*c,r*c,0,7);x.fill();x.stroke()})}
 else if(t==='m'){x.strokeStyle='#3a342d';x.lineWidth=1.5;x.fillStyle='#d2cbbd';x.beginPath();x.moveTo(X+c*.08,Y+c*.88);x.lineTo(X+c*.42,Y+c*.18);x.lineTo(X+c*.62,Y+c*.55);x.lineTo(X+c*.74,Y+c*.38);x.lineTo(X+c*.94,Y+c*.88);x.closePath();x.fill();x.stroke()}
 else if(t==='h'){x.strokeStyle='#1c1916';x.lineWidth=1.6;x.fillStyle='#e0d6c2';x.fillRect(X+c*.14,Y+c*.2,c*.72,c*.62);x.strokeRect(X+c*.14,Y+c*.2,c*.72,c*.62);x.beginPath();x.moveTo(X+c*.14,Y+c*.51);x.lineTo(X+c*.86,Y+c*.51);x.stroke()}
 x.restore()}
function drawClassic(x,m,cell,o,bg){const W=m.w*cell,H=m.h*cell;
 x.fillStyle='#efeadf';x.fillRect(0,0,W,H);
 if(bg){x.globalAlpha=m.bg.op??1;x.drawImage(bg,0,0,W,H);x.globalAlpha=1}
 if(!bg){x.save();x.fillStyle=hatchPat(x);for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(tileAt(m,i,j)!==' ')continue;let near=false;for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1;dx++)if(walkable(tileAt(m,i+dx,j+dy))){near=true;break}if(near)x.fillRect(i*cell,j*cell,cell,cell)}x.restore()}
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){const t=tileAt(m,i,j);if(t===' ')continue;x.fillStyle=TFILL[t]||'#fff';x.fillRect(i*cell,j*cell,cell,cell);decorClassic(x,t,i*cell,j*cell,cell,i,j)}
 if(o.grid!==false){x.strokeStyle='rgba(60,50,40,.16)';x.lineWidth=1;x.beginPath();for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!bg&&!walkable(tileAt(m,i,j)))continue;x.rect(i*cell+.5,j*cell+.5,cell,cell)}x.stroke()}
 x.strokeStyle='#1c1916';x.lineWidth=Math.max(2,cell*.13);x.lineCap='round';x.beginPath();
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!walkable(tileAt(m,i,j)))continue;const X=i*cell,Y=j*cell;
  if(!walkable(tileAt(m,i,j-1))){x.moveTo(X,Y);x.lineTo(X+cell,Y)}if(!walkable(tileAt(m,i,j+1))){x.moveTo(X,Y+cell);x.lineTo(X+cell,Y+cell)}
  if(!walkable(tileAt(m,i-1,j))){x.moveTo(X,Y);x.lineTo(X,Y+cell)}if(!walkable(tileAt(m,i+1,j))){x.moveTo(X+cell,Y);x.lineTo(X+cell,Y+cell)}}
 x.stroke();
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(tileAt(m,i,j)!=='d')continue;const X=i*cell,Y=j*cell,hor=walkable(tileAt(m,i-1,j))&&walkable(tileAt(m,i+1,j)),dw=cell*.26,dl=cell*.86;
  x.fillStyle='#8a5a2e';x.strokeStyle='#1c1916';x.lineWidth=Math.max(1.5,cell*.06);x.beginPath();if(hor)x.rect(X+cell/2-dw/2,Y+(cell-dl)/2,dw,dl);else x.rect(X+(cell-dl)/2,Y+cell/2-dw/2,dl,dw);x.fill();x.stroke()}
}

/* ===== estilo fantasia sombria: texturas pintadas geradas na hora ===== */
const TEXDEF={g:'#3c5a2c',r:'#634a32',c:'#2c2a27',f:'#262320',b:'#4a3220',a:'#1b3646',z:'#2c3824',n:'#a88c5a',v:'#cfd5db',l:'#3f1206',k:'#4f4b45',x:'#1a1816'};
const TEXC={},SPRC={};
function tex(type,cell){
 const k=mapDpr(),key=type+'_'+cell+'_'+k;if(TEXC[key])return TEXC[key];
 const S=Math.max(24,Math.round(cell*3*k)),u=S/96,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),R=rng(type.charCodeAt(0)*7919+13);
 const wrap=fn=>{for(const dx of[-S,0,S])for(const dy of[-S,0,S]){x.save();x.translate(dx,dy);fn();x.restore()}};
 const ell=(cx,cy,rx,ry,rot,col,a=1)=>wrap(()=>{x.globalAlpha=a;x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,Math.max(.5,rx),Math.max(.5,ry),rot,0,Math.PI*2);x.fill()});
 const ln=(x1,y1,x2,y2,col,w,a=1)=>wrap(()=>{x.globalAlpha=a;x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke()});
 const rect=(rx,ry,rw,rh,col,a=1)=>wrap(()=>{x.globalAlpha=a;x.fillStyle=col;x.fillRect(rx,ry,rw,rh)});
 const pick=a=>a[Math.floor(R()*a.length)];
 const spots=(n,cols,r0,r1,a)=>{for(let i=0;i<n;i++){const r=(r0+R()*(r1-r0))*u;ell(R()*S,R()*S,r,r*(.5+R()*.6),R()*3,pick(cols),a)}};
 x.fillStyle=TEXDEF[type]||'#333';x.fillRect(0,0,S,S);
 switch(type){
  case'g':spots(60,['#4a6a34','#2f4626','#3a5530','#56753b'],4,13,.55);for(let i=0;i<300;i++){const px=R()*S,py=R()*S,l=(2+R()*4)*u,dx=(R()-.5)*2*u,col=R()<.55?'#6c8c48':'#24361d';ln(px,py,px+dx,py-l,col,.8*u,.75)}spots(14,['#8a8a3a','#9a6a8a','#c9c070'],.6,1.1,.8);break;
  case'r':spots(60,['#57412c','#77593e','#6b5137','#4d3a28'],3,11,.6);spots(120,['#8a7058','#3a2b1e','#9a8468'],.5,1.5,.8);for(let i=0;i<10;i++){const px=R()*S,py=R()*S;ln(px,py,px+(R()-.5)*20*u,py+(R()-.5)*6*u,'#4a3625',1.2*u,.5)}break;
  case'c':{const n=6,cs=S/n;for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){const off=(gy%2)*cs/2,cx=gx*cs+off+cs/2+(R()-.5)*cs*.14,cy=gy*cs+cs/2+(R()-.5)*cs*.14,rx=cs*.45,ry=cs*.41,rot=(R()-.5)*.5,col=pick(['#6a6761','#5c5954','#75716b','#625e57']);ell(cx+u,cy+1.4*u,rx,ry,rot,'#1c1a18',.85);ell(cx,cy,rx,ry,rot,col);ell(cx-rx*.2,cy-ry*.3,rx*.5,ry*.32,rot,'#8f8a82',.35)}break}
  case'f':{const n=3,cs=S/n;for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){const col=pick(['#4a4640','#433f3a','#524d46','#3e3a35']);rect(gx*cs+1.2*u,gy*cs+1.2*u,cs-2.4*u,cs-2.4*u,col);rect(gx*cs+1.2*u,gy*cs+1.2*u,cs-2.4*u,1.6*u,'#6a645b',.45)}spots(40,['#5a554d','#33302b'],2,7,.35);for(let i=0;i<6;i++){const px=R()*S,py=R()*S;let a=px,b=py;for(let s=0;s<3;s++){const na=a+(R()-.5)*12*u,nb=b+(R()-.5)*12*u;ln(a,b,na,nb,'#1f1c19',.9*u,.7);a=na;b=nb}}break}
  case'b':{const rows=6,rh=S/rows;for(let r=0;r<rows;r++){let xx=-R()*S/2;while(xx<S){const w=(30+R()*40)*u,col=pick(['#6b4a2b','#5f4126','#73502f','#583b22']);rect(xx,r*rh+.8*u,w-1.2*u,rh-1.6*u,col);for(let g=0;g<3;g++){const gy=r*rh+(.25+R()*.5)*rh;ln(xx+2*u,gy,xx+w-4*u,gy+(R()-.5)*2*u,'#3d2814',.6*u,.45)}ell(xx+3*u,r*rh+rh/2,.9*u,.9*u,0,'#1e140b',.8);xx+=w}}break}
  case'a':spots(50,['#22465a','#15303f','#1f3d50'],8,22,.6);for(let i=0;i<70;i++){const px=R()*S,py=R()*S,w=(4+R()*8)*u;wrap(()=>{x.globalAlpha=.55;x.strokeStyle=R()<.8?'#3d6a80':'#86b6c8';x.lineWidth=.9*u;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+w/2,py-2*u,px+w,py);x.stroke()})}break;
  case'z':spots(45,['#25301f','#3a4a2a','#2a3a2c'],6,16,.7);spots(22,['#1a2724','#203430'],8,15,.85);for(let i=0;i<60;i++){const px=R()*S,py=R()*S;ln(px,py,px+(R()-.5)*2*u,py-(3+R()*5)*u,'#6a7a3c',.8*u,.8)}break;
  case'n':spots(70,['#a2855a','#bea06e','#977a4e'],4,12,.5);spots(140,['#7f6640','#d2b98a'],.4,1.1,.7);for(let i=0;i<14;i++){const py=R()*S;wrap(()=>{x.globalAlpha=.25;x.strokeStyle='#8a6f45';x.lineWidth=u;x.beginPath();x.moveTo(0,py);x.bezierCurveTo(S*.3,py-4*u,S*.6,py+4*u,S,py);x.stroke()})}break;
  case'v':spots(60,['#c2c9d1','#e6eaee','#b3bcc6'],5,15,.55);spots(60,['#ffffff'],.6,1.4,.8);break;
  case'l':spots(30,['#5e1a0a','#2e0c04','#4f1508'],6,16,.75);for(let i=0;i<9;i++){let a=R()*S,b=R()*S;const pts=[[a,b]];for(let s=0;s<5;s++){a+=(R()-.5)*18*u;b+=(R()-.5)*18*u;pts.push([a,b])}wrap(()=>{x.lineJoin='round';x.lineCap='round';x.shadowColor='#ff5a00';x.shadowBlur=8*u;x.strokeStyle='#ff6a1a';x.lineWidth=2.4*u;x.beginPath();pts.forEach(([p,q],z)=>z?x.lineTo(p,q):x.moveTo(p,q));x.stroke();x.shadowBlur=0;x.strokeStyle='#ffd36a';x.lineWidth=.8*u;x.stroke()})}break;
  case'k':{const rows=4,rh=S/rows;for(let r=0;r<rows;r++){const off=(r%2)*S/8;for(let q=0;q<4;q++){const col=pick(['#57534c','#4c4842','#605b53']);rect(q*S/4+off+u,r*rh+u,S/4-2*u,rh-2*u,col);rect(q*S/4+off+u,r*rh+u,S/4-2*u,1.4*u,'#77716a',.5)}}spots(30,['#3a3732','#6b665e'],1,4,.35);break}
  case'x':spots(40,['#211e1b','#141210'],5,14,.7);break;
 }
 TEXC[key]=c;return c;
}
function texPat(x,type,cell){const p=x.createPattern(tex(type,cell),'repeat');try{p.setTransform(new DOMMatrix().scale(1/mapDpr()))}catch{}return p}
function sprite(kind,v,cell){
 const k=mapDpr(),key=kind+v+'_'+cell+'_'+k;if(SPRC[key])return SPRC[key];
 const sz=Math.round(cell*1.6*k),c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),R=rng(kind.charCodeAt(0)*31+v*977),u=sz/100;
 if(kind==='tree'){const blobs=[];const n=6+Math.floor(R()*3);for(let i=0;i<n;i++){const a=R()*Math.PI*2,d=R()*14*u;blobs.push([50*u+Math.cos(a)*d,46*u+Math.sin(a)*d*.8,(15+R()*9)*u])}
  x.fillStyle='rgba(0,0,0,.38)';x.beginPath();x.ellipse(56*u,66*u,30*u,16*u,0,0,7);x.fill();
  x.fillStyle='#3a2716';x.fillRect(47*u,52*u,6*u,16*u);
  const hue=Math.abs(v)%3;const dark=['#14260f','#1a2c12','#102010'][hue],mid=['#2e4f22','#3a5a26','#294a26'][hue],light=['#5a8a3c','#6b8f3e','#4f7f45'][hue];
  blobs.forEach(([bx,by,r])=>{x.fillStyle=dark;x.beginPath();x.arc(bx,by+2*u,r+1.5*u,0,7);x.fill()});
  blobs.forEach(([bx,by,r])=>{const g=x.createRadialGradient(bx-r*.35,by-r*.4,r*.1,bx,by,r);g.addColorStop(0,light);g.addColorStop(.55,mid);g.addColorStop(1,dark);x.fillStyle=g;x.beginPath();x.arc(bx,by,r,0,7);x.fill()});
  for(let i=0;i<16;i++){x.fillStyle='rgba(160,200,110,.25)';x.beginPath();x.arc((30+R()*40)*u,(28+R()*30)*u,(1+R()*2)*u,0,7);x.fill()}}
 else if(kind==='mount'){x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.ellipse(54*u,74*u,40*u,13*u,0,0,7);x.fill();
  const peaks=[[50,14+R()*8,34],[28,36+R()*8,24],[74,32+R()*8,24]];
  peaks.sort((a,b)=>a[1]-b[1]).reverse().forEach(([px,py,w])=>{px*=u;py*=u;w*=u;const base=74*u;
   x.fillStyle='#4a4640';x.beginPath();x.moveTo(px-w,base);x.lineTo(px,py);x.lineTo(px+w,base);x.closePath();x.fill();
   x.fillStyle='#7b766d';x.beginPath();x.moveTo(px-w,base);x.lineTo(px,py);x.lineTo(px+w*.12,base);x.closePath();x.fill();
   x.fillStyle='#d9dde0';x.beginPath();x.moveTo(px,py);x.lineTo(px-w*.28,py+(base-py)*.28);x.lineTo(px-w*.05,py+(base-py)*.22);x.lineTo(px+w*.1,py+(base-py)*.3);x.lineTo(px+w*.26,py+(base-py)*.26);x.closePath();x.fill();
   x.strokeStyle='#1f1d1a';x.lineWidth=1.4*u;x.beginPath();x.moveTo(px-w,base);x.lineTo(px,py);x.lineTo(px+w,base);x.stroke()})}
 else if(kind==='house'){const roof=[['#8a3a28','#5a2318'],['#6a4a2a','#43301a'],['#4c5560','#2f363e']][v%3];
  x.fillStyle='rgba(0,0,0,.42)';x.fillRect(26*u,30*u,58*u,52*u);
  x.fillStyle='#3a2a1c';x.fillRect(20*u,60*u,56*u,14*u);
  const g=x.createLinearGradient(0,22*u,0,62*u);g.addColorStop(0,roof[0]);g.addColorStop(1,roof[1]);x.fillStyle=g;x.beginPath();x.moveTo(16*u,62*u);x.lineTo(24*u,22*u);x.lineTo(72*u,22*u);x.lineTo(80*u,62*u);x.closePath();x.fill();
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=u;for(let i=0;i<6;i++){const yy=(26+i*6.5)*u;x.beginPath();x.moveTo(20*u,yy);x.lineTo(76*u,yy);x.stroke()}
  x.strokeStyle='#e8b98a';x.globalAlpha=.35;x.lineWidth=1.6*u;x.beginPath();x.moveTo(24*u,23*u);x.lineTo(72*u,23*u);x.stroke();x.globalAlpha=1;
  x.fillStyle='#2b2520';x.fillRect(62*u,14*u,7*u,12*u);x.fillStyle='#f5c26b';x.fillRect(30*u,64*u,6*u,6*u);x.fillStyle='#24180f';x.fillRect(44*u,62*u,8*u,12*u)}
 SPRC[key]=c;return c;
}
const GROUND_ORDER=['x','a','z','l','n','v','r','g','c','f','b'];
const BASE_OF={d:'f',s:'f',p:'f',t:'g',m:'r',h:'r',w:'f',k:'f'};
function drawDark(x,m,cell,o,bg){
 const W=m.w*cell,H=m.h*cell,gt=(i,j)=>{const t=tileAt(m,i,j);return t===' '?' ':(BASE_OF[t]||t)};
 x.fillStyle='#0d0b0a';x.fillRect(0,0,W,H);
 if(bg){x.globalAlpha=m.bg.op??1;x.drawImage(bg,0,0,W,H);x.globalAlpha=1}
 const autoWall=(i,j)=>{if(tileAt(m,i,j)!==' '||bg)return false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=tileAt(m,i+dx,j+dy);if(t!==' '&&!SOLID.has(t))return true}return false};
 const isWall=(i,j)=>{const t=tileAt(m,i,j);return SOLID.has(t)||autoWall(i,j)};
 if(!bg){x.fillStyle=texPat(x,'x',cell);x.fillRect(0,0,W,H)}
 const e=cell*.17,rr=cell*.4;
 for(const T of GROUND_ORDER){if(T==='x')continue;let any=false;x.beginPath();
  for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(gt(i,j)!==T)continue;any=true;const ex=e*(.7+(hash2(i,j)%7)/10);if(x.roundRect)x.roundRect(i*cell-ex,j*cell-ex,cell+2*ex,cell+2*ex,rr);else x.rect(i*cell-ex,j*cell-ex,cell+2*ex,cell+2*ex)}
  if(any){x.fillStyle=texPat(x,T,cell);x.fill();if(T==='a'||T==='l'||T==='z'){x.save();x.clip();x.strokeStyle=T==='l'?'rgba(255,140,40,.25)':'rgba(0,0,0,.35)';x.lineWidth=cell*.18;x.stroke();x.restore()}}}
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){const t=tileAt(m,i,j),X=i*cell,Y=j*cell;
  if(t==='d'){const hor=walkable(tileAt(m,i-1,j))&&walkable(tileAt(m,i+1,j)),dw=cell*.3,dl=cell*.9;x.save();x.fillStyle='rgba(0,0,0,.45)';x.fillRect(X+(hor?cell/2-dw/2+2:(cell-dl)/2+2),Y+(hor?(cell-dl)/2+3:cell/2-dw/2+3),hor?dw:dl,hor?dl:dw);
   const g=x.createLinearGradient(X,Y,X+cell,Y+cell);g.addColorStop(0,'#7a5030');g.addColorStop(1,'#4a2e18');x.fillStyle=g;if(hor)x.fillRect(X+cell/2-dw/2,Y+(cell-dl)/2,dw,dl);else x.fillRect(X+(cell-dl)/2,Y+cell/2-dw/2,dl,dw);
   x.fillStyle='#22201e';if(hor){x.fillRect(X+cell/2-dw/2,Y+cell*.3,dw,cell*.06);x.fillRect(X+cell/2-dw/2,Y+cell*.64,dw,cell*.06)}else{x.fillRect(X+cell*.3,Y+cell/2-dw/2,cell*.06,dw);x.fillRect(X+cell*.64,Y+cell/2-dw/2,cell*.06,dw)}x.restore()}
  else if(t==='s'){for(let k=0;k<5;k++){const sh=50+k*22;x.fillStyle=`rgb(${sh},${sh-4},${sh-10})`;x.fillRect(X+cell*.1,Y+cell*(.1+k*.16),cell*.8,cell*.14)}x.fillStyle='rgba(0,0,0,.4)';x.fillRect(X+cell*.1,Y+cell*.1,cell*.06,cell*.8)}
  else if(t==='p'){const g=x.createRadialGradient(X+cell/2,Y+cell/2,1,X+cell/2,Y+cell/2,cell*.48);g.addColorStop(0,'#000');g.addColorStop(.7,'#050403');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(X,Y,cell,cell)}
 }
 const fronts=[];
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!isWall(i,j))continue;const X=i*cell,Y=j*cell,below=isWall(i,j+1),auto=!SOLID.has(tileAt(m,i,j));
  x.fillStyle=texPat(x,'k',cell);x.fillRect(X,Y,cell,cell);if(auto){x.fillStyle='rgba(10,8,6,.35)';x.fillRect(X,Y,cell,cell)}
  if(!below&&j<m.h-1)fronts.push([X,Y,auto]);
  if(!isWall(i,j-1)){x.fillStyle='rgba(255,240,210,.12)';x.fillRect(X,Y,cell,cell*.08)}}
 fronts.forEach(([X,Y,auto])=>{const fy=Y+cell,fh=cell*.42;const g=x.createLinearGradient(0,fy,0,fy+fh);g.addColorStop(0,auto?'#2e2a26':'#3a3631');g.addColorStop(1,'#171513');x.fillStyle=g;x.fillRect(X,fy,cell,fh);
  x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=1;x.beginPath();x.moveTo(X,fy+fh*.5);x.lineTo(X+cell,fy+fh*.5);x.moveTo(X+cell*.5,fy);x.lineTo(X+cell*.5,fy+fh*.5);x.stroke();
  const sg=x.createLinearGradient(0,fy+fh,0,fy+fh+cell*.3);sg.addColorStop(0,'rgba(0,0,0,.45)');sg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=sg;x.fillRect(X,fy+fh,cell,cell*.3)});
 if(o.grid!==false){x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=1;x.beginPath();for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!walkable(tileAt(m,i,j))&&!bg)continue;x.rect(i*cell+.5,j*cell+.5,cell,cell)}x.stroke()}
 const sp=cell*1.6;
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){const t=tileAt(m,i,j),X=i*cell,Y=j*cell,hv=hash2(i,j);
  if(t==='t'){const n=1+(hv%2);for(let q=0;q<n;q++){const ox=n===1?0:(q?.18:-.18)*cell,oy=n===1?0:(q?.12:-.14)*cell,s=(n===1?1:.8)*sp;x.drawImage(sprite('tree',(hv>>>(q*3))%6,cell),X+cell/2-s/2+ox,Y+cell/2-s*.55+oy,s,s)}}
  else if(t==='m')x.drawImage(sprite('mount',hv%4,cell),X+cell/2-sp/2,Y+cell/2-sp*.62,sp,sp);
  else if(t==='h')x.drawImage(sprite('house',hv%3,cell),X+cell/2-sp*.48,Y+cell/2-sp*.5,sp,sp)}
 const v=x.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');x.fillStyle=v;x.fillRect(0,0,W,H);
}

/* ===== desenho comum ===== */
function fogVis_v8(m,tokens){if(!m.fogOn)return null;const n=m.w*m.h,f=m.fog||'',vis=new Uint8Array(n);for(let i=0;i<n;i++)vis[i]=f[i]==='1'?1:0;
 const R=+m.vision||0;if(R>0)(tokens||[]).filter(t=>t.kind==='pc').forEach(t=>{const cx=Math.round(t.x),cy=Math.round(t.y);for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){if(dx*dx+dy*dy>R*R+.6)continue;const xx=cx+dx,yy=cy+dy;if(xx>=0&&yy>=0&&xx<m.w&&yy<m.h)vis[yy*m.w+xx]=1}});return vis}
function drawFog(x,m,cell,vis,mode,cv){
 const dpr=cv.width/(m.w*cell),fc=document.createElement('canvas');fc.width=cv.width;fc.height=cv.height;const fx=fc.getContext('2d');fx.setTransform(dpr,0,0,dpr,0,0);fx.fillStyle='#06070b';fx.beginPath();
 for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++)if(!vis[j*m.w+i])fx.rect(i*cell-.5,j*cell-.5,cell+1,cell+1);fx.fill();
 x.save();x.setTransform(1,0,0,1,0,0);x.globalAlpha=mode==='master'?.55:1;
 if('filter' in x){x.filter=`blur(${Math.round(cell*dpr*.32)}px)`;x.drawImage(fc,0,0);x.filter='none'}else x.drawImage(fc,0,0);
 x.restore();
 if(mode==='player'){x.fillStyle='#06070b';x.beginPath();const ins=cell*.22;for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++)if(!vis[j*m.w+i])x.rect(i*cell+ins,j*cell+ins,cell-2*ins,cell-2*ins);x.fill()}
 else{x.save();x.strokeStyle='rgba(140,170,255,.35)';x.lineWidth=1;x.setLineDash([3,4]);x.beginPath();for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(vis[j*m.w+i])continue;const X=i*cell,Y=j*cell;if(j>0&&vis[(j-1)*m.w+i]){x.moveTo(X,Y);x.lineTo(X+cell,Y)}if(j<m.h-1&&vis[(j+1)*m.w+i]){x.moveTo(X,Y+cell);x.lineTo(X+cell,Y+cell)}if(i>0&&vis[j*m.w+i-1]){x.moveTo(X,Y);x.lineTo(X,Y+cell)}if(i<m.w-1&&vis[j*m.w+i+1]){x.moveTo(X+cell,Y);x.lineTo(X+cell,Y+cell)}}x.stroke();x.restore()}
}
function drawMap(cv,m,o={}){
 const cell=Math.max(6,Math.min(Math.round(o.cell||28),Math.floor(4000/Math.max(m.w,m.h)))),W=m.w*cell,H=m.h*cell,dpr=Math.max(.5,Math.min(mapDpr(),Math.sqrt(15e6/(W*H))));
 if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px'}
 const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);
 const bg=(m.bg&&o.bgImg)||null,dark=m.style==='dark';
 if(dark)drawDark(x,m,cell,o,bg);else drawClassic(x,m,cell,o,bg);
 x.textAlign='center';x.textBaseline='middle';x.font=`${Math.round(cell*.7)}px ${EMOJI_FONT}`;
 x.save();if(dark){x.shadowColor='rgba(0,0,0,.7)';x.shadowBlur=4;x.shadowOffsetY=2}(m.objs||[]).forEach(ob=>{if(ob.src){const im=pimg(ob.src);if(im){const k=Math.min(cell*.92/im.naturalWidth,cell*.92/im.naturalHeight);const w=im.naturalWidth*k,h=im.naturalHeight*k;x.drawImage(im,(ob.x+.5)*cell-w/2,(ob.y+.5)*cell-h/2,w,h)}}else x.fillText(ob.k,(ob.x+.5)*cell,(ob.y+.56)*cell)});x.restore();
 x.font=`600 ${Math.round(cell*.46)}px ${fontStack('Cinzel')}`;x.lineJoin='round';(m.labels||[]).forEach(l=>{const lx=(l.x+.5)*cell,ly=(l.y+.5)*cell;x.lineWidth=4;x.strokeStyle=dark?'rgba(0,0,0,.85)':'rgba(255,255,255,.92)';x.strokeText(l.t,lx,ly);x.fillStyle=dark?'#f1e4c4':'#2a2017';x.fillText(l.t,lx,ly)});
 if(o.showSpawn&&m.spawn){x.font=`${Math.round(cell*.62)}px ${EMOJI_FONT}`;x.fillText('⭐',(m.spawn.x+.5)*cell,(m.spawn.y+.55)*cell)}
 if(o.showSpawn&&m.links){x.font=`${Math.round(cell*.42)}px ${EMOJI_FONT}`;Object.entries(m.links).forEach(([k,L])=>{const [lx,ly]=k.split(',').map(Number);x.save();x.strokeStyle='#e8b04a';x.lineWidth=2;x.setLineDash([4,3]);x.strokeRect(lx*cell+2,ly*cell+2,cell-4,cell-4);x.restore();x.fillText('🔗',(lx+.78)*cell,(ly+.22)*cell);if(L.to===m.id&&L.tx!=null){x.fillText('🎯',(L.tx+.5)*cell,(L.ty+.5)*cell);x.save();x.strokeStyle='rgba(232,176,74,.7)';x.setLineDash([3,5]);x.beginPath();x.moveTo((lx+.5)*cell,(ly+.5)*cell);x.lineTo((L.tx+.5)*cell,(L.ty+.5)*cell);x.stroke();x.restore()}})}
 const vis=o.fogMode?fogVis(m,o.tokens):null;cv._cell=cell;cv._vis=vis;
 if(vis)drawFog(x,m,cell,vis,o.fogMode,cv);
 if(o.preview){const r=o.preview,x0=Math.min(r.x0,r.x1),y0=Math.min(r.y0,r.y1);x.save();x.setLineDash([6,4]);x.strokeStyle='#e74c3c';x.lineWidth=2;x.fillStyle='rgba(231,76,60,.14)';const rw=(Math.abs(r.x1-r.x0)+1)*cell,rh=(Math.abs(r.y1-r.y0)+1)*cell;x.fillRect(x0*cell,y0*cell,rw,rh);x.strokeRect(x0*cell,y0*cell,rw,rh);x.restore()}
 if(!o.noTokens)(o.tokens||[]).forEach(t=>{let tx=t.x,ty=t.y;if(T.dragTok&&T.dragTok.id===t.id){tx=T.dragTok.x;ty=T.dragTok.y}
  if(vis&&o.fogMode==='player'&&t.kind==='npc'){const ci=Math.round(ty)*m.w+Math.round(tx);if(!vis[ci])return}
  const cx=(tx+.5)*cell,cy=(ty+.5)*cell,r=cell*.42;
  x.save();x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=6;x.shadowOffsetY=2;x.fillStyle=t.color;x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.fill();x.restore();
  x.lineWidth=Math.max(2,cell*.08);x.strokeStyle=t.mine?'#f5c542':'#fff';x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.stroke();
  x.font=`${Math.round(cell*.5)}px ${EMOJI_FONT}`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#000';x.fillText(t.emoji,cx,cy+cell*.02);
  if(t.name){const nm=t.name.slice(0,14),ny=cy+r+cell*.22;x.font=`600 ${Math.max(9,Math.round(cell*.3))}px Inter,sans-serif`;x.lineWidth=3;x.strokeStyle=dark?'rgba(0,0,0,.9)':'rgba(255,255,255,.95)';x.strokeText(nm,cx,ny);x.fillStyle=dark?'#fff':'#1c1916';x.fillText(nm,cx,ny)}});
}
function tokHp(v){try{const id=RULES().hp,f=id&&fById(id);return f?fieldVal(f,v||{}):null}catch{return null}}
function mapTokens(m){const tk=[];
 T.seats.forEach(s=>{if(s.pos&&s.pos.m===m.id)tk.push({kind:'pc',id:s.uid,x:s.pos.x,y:s.pos.y,emoji:s.emoji||'🙂',color:s.color||'#888',name:s.name||'',mine:s.uid===S.uid,look:s.look||null,hp:tokHp(s.values),down:(s.cond||[]).includes('Caído')||(s.cond||[]).includes('Morto'),cond:s.cond||[]})});
 (T.game.chars||[]).forEach(c=>{if(c.token&&c.token.m===m.id)tk.push({kind:'npc',id:c.id,x:c.token.x,y:c.token.y,emoji:c.emoji||'👤',color:c.color||'#555',name:c.name||'',look:c.look||null,hp:tokHp(c.values),down:!!c.down,cond:c.cond||[]})});
 return tk}
function bgImg(m,redraw){if(!m.bg||!m.bg.src)return null;const c=T.bgCache||(T.bgCache={});const im=c[m.bg.src];if(im)return im.complete&&im.naturalWidth?im:null;const n=new Image();n.onload=()=>redraw();n.src=m.bg.src;c[m.bg.src]=n;return null}
function moveToken(tk,mid,x,y){
 if(tk.kind==='pc')seatPatch(tk.id,{pos:{m:mid,x,y}});
 else gamePatch({chars:T.game.chars.map(c=>c.id===tk.id?{...c,token:{m:mid,x,y}}:c)});
}
function bindMapCanvas(cv,scroll,ctx){
 let st=null;
 const at=e=>{const r=cv.getBoundingClientRect(),c=r.width/ctx.map().w;return{x:(e.clientX-r.left)/c,y:(e.clientY-r.top)/c}};
 cv.addEventListener('pointerdown',e=>{const m=ctx.map();if(!m)return;const p=at(e);try{cv.setPointerCapture(e.pointerId)}catch{}
  const tool=ctx.editor?T.tool:'hand';
  if(tool==='hand'){const tk=mapTokens(m).reverse().find(t=>Math.hypot(t.x+.5-p.x,t.y+.5-p.y)<.55&&(t.mine||isMaster()));
   if(tk){st={k:'tok',tk,ox:p.x-tk.x,oy:p.y-tk.y};T.dragTok={id:tk.id,x:tk.x,y:tk.y};if(!TL.raf)TL.raf=requestAnimationFrame(tlFrame);return}
   st={k:'pan',sx:e.clientX,sy:e.clientY,l:scroll.scrollLeft,t:scroll.scrollTop};return}
  st={k:'tool'};editorDown(m,Math.floor(p.x),Math.floor(p.y));ctx.redraw()});
 cv.addEventListener('pointermove',e=>{if(!st)return;const p=at(e);
  if(st.k==='pan'){scroll.scrollLeft=st.l-(e.clientX-st.sx);scroll.scrollTop=st.t-(e.clientY-st.sy)}
  else if(st.k==='tok'){T.dragTok={id:st.tk.id,x:p.x-st.ox,y:p.y-st.oy};if(!TL.raf)TL.raf=requestAnimationFrame(tlFrame)}
  else{editorMove(ctx.map(),Math.floor(p.x),Math.floor(p.y));ctx.redraw()}});
 const up=()=>{if(!st)return;const m=ctx.map();
  if(st.k==='tok'&&T.dragTok&&m){const x=clamp(Math.round(T.dragTok.x),0,m.w-1),y=clamp(Math.round(T.dragTok.y),0,m.h-1);const tk=st.tk;tk.x=x;tk.y=y;moveToken(tk,m.id,x,y);T.dragTok=null;ctx.redraw();renderPanel()}
  else if(st.k==='tool'&&m){editorUp(m);ctx.redraw()}st=null};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
}
function setTile(m,x,y,ch){if(x<0||y<0||x>=m.w||y>=m.h)return;const i=y*m.w+x;if(m.tiles[i]===ch)return;m.tiles=m.tiles.slice(0,i)+ch+m.tiles.slice(i+1)}
function setFog(m,x,y,v){if(!m.fog||m.fog.length!==m.w*m.h)m.fog='0'.repeat(m.w*m.h);const f=m.fog.split('');let ch=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=m.w||yy>=m.h)continue;const i=yy*m.w+xx;if(f[i]!==v){f[i]=v;ch=true}}if(ch){m.fog=f.join('');mapDirty()}}
function pushUndo(m){T.undo.push(JSON.stringify({w:m.w,h:m.h,tiles:m.tiles,objs:m.objs,labels:m.labels,spawn:m.spawn,links:m.links||{},bg:m.bg,style:m.style,fog:m.fog,fogOn:m.fogOn,vision:m.vision}));if(T.undo.length>40)T.undo.shift()}
const isFogTool=t=>t==='reveal'||t==='hide';
function editorDown(m,x,y){const t=T.tool;pushUndo(m);T.lastCell=[x,y];
 if(t==='room'){T.rect={x0:x,y0:y,x1:x,y1:y};return}
 if(t==='stamp'){m.objs=m.objs.filter(o=>!(o.x===x&&o.y===y));if(String(T.stamp).startsWith('img:')){const st=(T.game.stamps||[]).find(z=>'img:'+z.id===T.stamp);if(st)m.objs.push({id:uid(),k:'',src:st.src,x,y})}else m.objs.push({id:uid(),k:T.stamp,x,y});mapDirty();return}
 if(t==='text'){ask('Texto no mapa','Rótulo (ex.: Sala do Trono, 1, Cripta)').then(v=>{if(v){m.labels.push({id:uid(),t:v.slice(0,40),x,y});mapDirty();redrawEditor()}});return}
 if(t==='spawn'){m.spawn={x,y};mapDirty();return}
 if(t==='link'){if(T.linkPending&&m.links&&m.links[T.linkPending]){m.links[T.linkPending].tx=x;m.links[T.linkPending].ty=y;T.linkPending=null;mapDirty();toast('Ponto de chegada definido 🎯');return}
  if(tileAt(m,x,y)!=='d'){toast('Clique sobre uma porta 🚪 do mapa');return}linkDoor(m,x,y);return}
 paint(m,x,y)}
function paint(m,x,y){const t=T.tool;
 if(isFogTool(t)){if(!m.fogOn){toast('Ative a névoa no botão 🌫 Névoa primeiro.');return}setFog(m,x,y,t==='reveal'?'1':'0');return}
 if(t==='erase'){const n=m.objs.length+m.labels.length;m.objs=m.objs.filter(o=>!(o.x===x&&o.y===y));m.labels=m.labels.filter(l=>!(l.x===x&&l.y===y));if(n!==m.objs.length+m.labels.length){mapDirty();return}}
 const ch=TOOLCH[t];if(ch!==undefined){setTile(m,x,y,ch);mapDirty()}}
function editorMove(m,x,y){if(T.tool==='room'&&T.rect){T.rect.x1=clamp(x,0,m.w-1);T.rect.y1=clamp(y,0,m.h-1);return}
 if(TOOLCH[T.tool]===undefined&&!isFogTool(T.tool))return;const [x0,y0]=T.lastCell||[x,y];if(x0===x&&y0===y)return;
 const n=Math.max(Math.abs(x-x0),Math.abs(y-y0));for(let k=1;k<=n;k++)paint(m,Math.round(x0+(x-x0)*k/n),Math.round(y0+(y-y0)*k/n));T.lastCell=[x,y]}
function editorUp(m){if(T.tool==='room'&&T.rect){const r=T.rect,x0=Math.min(r.x0,r.x1),x1=Math.max(r.x0,r.x1),y0=Math.min(r.y0,r.y1),y1=Math.max(r.y0,r.y1);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=tileAt(m,x,y),edge=(x===x0||x===x1||y===y0||y===y1)&&x1-x0>=2&&y1-y0>=2;setTile(m,x,y,c==='d'?'d':(edge&&c!==' '&&c!=='f'?'k':'f'))}T.rect=null;mapDirty()}}
function mapDirty(){T.mapDirty=true;saveMapD()}
const saveMapD=debounce(()=>{const m=T.edit;if(!m||!T.mapDirty||!T.gid)return;T.mapDirty=false;T.maps[m.id]=cl(m);sharedWrite('games/'+T.gid+'/maps/'+m.id,{set:cl(m)})},900);
function redrawEditor(){const m=T.edit,cv=$('#mapC');if(!m||!cv||T.mode!=='master'||T.mtab!=='maps'||T.view==='play')return;const toks=mapTokens(m);drawMap(cv,m,{cell:28*T.zoom,grid:T.grid,tokens:toks,noTokens:true,showSpawn:true,preview:T.rect,bgImg:bgImg(m,redrawEditor),fogMode:'master'});tlSync($('#tokC'),cv,m,toks,'master')}
function newMapObj(name,style,start,w,h){const m={kind:'map',id:uid(),name,style,w,h,tiles:' '.repeat(w*h),objs:[],labels:[],spawn:{x:6,y:6},bg:null,fogOn:false,fog:'',vision:0};
 if(start==='field'){m.tiles='g'.repeat(w*h);m.spawn={x:Math.floor(w/2),y:Math.floor(h/2)}}
 else if(start==='room'){for(let y=4;y<=9;y++)for(let x=4;x<=12;x++)setTile(m,x,y,'f')}
 return m}
function sampleMap(style){const m={w:12,h:7,style,tiles:' '.repeat(84),objs:[{k:'💰',x:3,y:3}],labels:[],spawn:null};
 for(let y=1;y<=5;y++)for(let x=1;x<=5;x++)setTile(m,x,y,'f');setTile(m,6,3,'d');for(let y=0;y<7;y++)for(let x=7;x<12;x++)setTile(m,x,y,'g');
 [[8,1],[9,1],[11,2],[10,5],[11,6]].forEach(([a,b])=>setTile(m,a,b,'t'));setTile(m,10,3,'h');setTile(m,11,0,'m');[[7,3],[8,3],[8,4],[9,4]].forEach(([a,b])=>setTile(m,a,b,'r'));[[7,6],[8,6],[7,5]].forEach(([a,b])=>setTile(m,a,b,'a'));return m}
MR.maps=()=>{const g=T.game,ids=Object.keys(T.maps).sort((a,b)=>String(T.maps[a].name).localeCompare(String(T.maps[b].name)));
 if(!T.edit||!T.maps[T.edit.id]){const first=g.activeMap&&T.maps[g.activeMap]?g.activeMap:ids[0];T.edit=first?cl(T.maps[first]):null;T.undo=[]}
 const m=T.edit;let skip=false;
 const tools=m?MTOOLS.map(t=>{if(t.length===1){skip=t[0]==='Névoa'&&!m.fogOn;return skip?'':`<div class="mgrp">${t[0]}</div>`}if(skip)return'';const[k,ic,l]=t;return `<button class="mtool ${T.tool===k?'on':''}" data-act="mTool" data-t="${k}" title="${l}"><span>${ic}</span><small>${l}</small></button>`}).join(''):'';
 $('#tMain').innerHTML=`<div class="mapview editor"><div class="mapbar">
  ${ids.length?`<select id="mSel" title="Mapa">${ids.map(id=>`<option value="${id}" ${m&&m.id===id?'selected':''}>${esc(T.maps[id].name)}${g.activeMap===id?' 👁':''}</option>`).join('')}</select>`:''}
  <button class="btn sm" data-act="mNew">${I('plus')} Novo mapa</button>
  ${m?`<select id="mStyle" title="Estilo visual">${Object.entries(MAP_STYLES).map(([k,v])=>`<option value="${k}" ${(m.style||'classic')===k?'selected':''}>${v[0]}</option>`).join('')}</select>
  <button class="btn sm ${m.fogOn?'primary':''}" data-act="mFog">🌫 Névoa${m.fogOn?' ✓':''}</button>
  <button class="btn sm" data-act="mUndo">↶ Desfazer</button>
  <button class="btn sm" data-act="mMore">⋯ Mais</button><span class="sp"></span>
  <button class="btn sm ${g.activeMap===m.id?'':'primary'}" data-act="mActive">${g.activeMap===m.id?'✓ Visível aos jogadores':'👁 Mostrar aos jogadores'}</button>`:''}</div>
  ${m?`<div class="medit"><div class="mtools">${tools}</div>
   <div class="mcol"><div class="stamps" id="mStamps" style="${T.tool==='stamp'?'':'display:none'}">${STAMPS.map(e=>`<button class="${T.stamp===e?'on':''}" data-act="mStamp" data-e="${e}">${e}</button>`).join('')}${(g.stamps||[]).map(st=>`<button class="${T.stamp==='img:'+st.id?'on':''}" data-act="mStamp" data-e="img:${st.id}" title="${esc(st.name)}"><img src="${esc(st.src)}" alt=""></button>`).join('')}${S.assets?`<button data-act="stampUp" title="Enviar objetos próprios">⬆</button>`:''}</div>
   <div class="mapscroll ${m.style==='dark'?'darkbg':''}" id="mapScroll"><div class="mapstack"><canvas id="mapC" class="${T.tool==='hand'?'hand':''}"></canvas><canvas id="tokC" class="tokc"></canvas></div></div>
   <p class="small muted mapHint">${m.fogOn?'Névoa ligada: áreas escurecidas estão ocultas dos jogadores — use 🔦 Revelar. ':''}Sala: arraste para desenhar · paredes aparecem sozinhas · ✋ Navegar arrasta tokens e o mapa · ✥ Mover muda objetos e textos de lugar.</p></div></div>`
  :`<div class="empty"><div class="big">Nenhum mapa ainda</div><p>Desenhe masmorras no traço clássico ou regiões pintadas com florestas, montanhas e vilas.</p><button class="btn primary" data-act="mNew">${I('plus')} Criar primeiro mapa</button></div>`}</div>`;
 if(m){const sel=$('#mSel');if(sel)sel.onchange=e=>{saveMapD.flush();T.edit=cl(T.maps[e.target.value]);T.undo=[];MR.maps()};
  $('#mStyle').onchange=e=>{pushUndo(m);m.style=e.target.value;mapDirty();MR.maps()};
  bindMapCanvas($('#mapC'),$('#mapScroll'),{map:()=>T.edit,redraw:redrawEditor,editor:true});redrawEditor()}
};
ACT.mTool=el=>{T.tool=el.dataset.t;$$('.mtool').forEach(b=>b.classList.toggle('on',b===el));const st=$('#mStamps');if(st)st.style.display=T.tool==='stamp'?'':'none';$('#mapC').classList.toggle('hand',T.tool==='hand')};
ACT.mStamp=el=>{T.stamp=el.dataset.e;$$('#mStamps button').forEach(b=>b.classList.toggle('on',b===el))};
ACT.mNew=async()=>{saveMapD.flush();const n=Object.keys(T.maps).length+1;
 const v=await modal({title:'Novo mapa',wide:true,body:`<label class="f">Nome</label><input id="nmN" value="Mapa ${n}" maxlength="60">
  <label class="f">Estilo</label><div class="typepick">${Object.entries(MAP_STYLES).map(([k,v],i)=>`<label><input type="radio" name="nmS" value="${k}" ${i===0?'checked':''}><canvas class="stylecv" data-st="${k}"></canvas><span class="tt">${v[0]}</span><span class="small muted">${v[1]}</span></label>`).join('')}</div>
  <div class="row wrap"><div class="grow"><label class="f">Começar com</label><select id="nmT"><option value="room">Uma sala de pedra</option><option value="field">Campo aberto (grama)</option><option value="empty">Vazio</option></select></div>
  <div class="grow"><label class="f">Tamanho</label><select id="nmZ"><option value="30x20">Pequeno 30×20</option><option value="40x30">Médio 40×30</option><option value="60x40">Grande 60×40</option><option value="80x60">Enorme 80×60</option><option value="100x80">Região 100×80</option><option value="120x100">Reino 120×100</option><option value="150x150">Continente 150×150</option></select></div></div>`,
  onMount:ov=>{$$('.stylecv',ov).forEach(cv=>drawMap(cv,sampleMap(cv.dataset.st),{cell:22}));$$('input[name=nmS]',ov).forEach(r=>r.onchange=()=>{$('#nmT',ov).value=r.value==='dark'?'field':'room'})},
  actions:[{label:'Cancelar'},{label:'Criar mapa',cls:'primary',onClick:ov=>{const [w,h]=$('#nmZ',ov).value.split('x').map(Number);return{name:$('#nmN',ov).value.trim()||'Mapa '+n,style:$('input[name=nmS]:checked',ov).value,start:$('#nmT',ov).value,w,h}}}]});
 if(!v)return;const m=newMapObj(v.name,v.style,v.start,v.w,v.h);T.maps[m.id]=cl(m);T.edit=cl(m);T.undo=[];T.tool=v.style==='dark'&&v.start==='field'?'forest':'room';
 sharedWrite('games/'+T.gid+'/maps/'+m.id,{set:cl(m)});if(!T.game.activeMap)gamePatch({activeMap:m.id});MR.maps();toast('Mapa criado — escolha uma ferramenta e desenhe')};
ACT.mFog=async()=>{const m=T.edit;if(!m)return;
 const v=await modal({title:'🌫 Névoa de guerra',body:`<p class="muted small" style="margin-top:0">Esconde o mapa dos jogadores até você revelar. Use 🔦 Revelar e 🌫️ Ocultar na barra de ferramentas (arraste para pintar). Você continua vendo tudo, com as áreas ocultas escurecidas.</p>
  <label class="toggle"><input type="checkbox" id="fgOn" ${m.fogOn?'checked':''}><span class="sw"></span><b>Ativar névoa neste mapa</b></label>
  <label class="f">Visão dos jogadores — revela automaticamente ao redor dos tokens</label><select id="fgV">${[[0,'Sem visão automática'],[2,'2 quadrados (tocha fraca)'],[3,'3 quadrados'],[4,'4 quadrados (tocha)'],[6,'6 quadrados (lanterna)'],[8,'8 quadrados (dia claro)']].map(([k,l])=>`<option value="${k}" ${(+m.vision||0)===k?'selected':''}>${l}</option>`).join('')}</select>
  <div class="row wrap" style="margin-top:14px"><button class="btn" data-fg="1">🔦 Revelar tudo</button><button class="btn" data-fg="0">🌫 Cobrir tudo</button></div>`,
  onMount:ov=>$$('[data-fg]',ov).forEach(b=>b.onclick=()=>{pushUndo(m);m.fogOn=true;$('#fgOn',ov).checked=true;m.fog=b.dataset.fg.repeat(m.w*m.h);mapDirty();redrawEditor();toast(b.dataset.fg==='1'?'Mapa todo revelado':'Mapa todo coberto')}),
  actions:[{label:'Cancelar'},{label:'Aplicar',cls:'primary',onClick:ov=>{pushUndo(m);m.fogOn=$('#fgOn',ov).checked;m.vision=+$('#fgV',ov).value;if(m.fogOn&&(!m.fog||m.fog.length!==m.w*m.h))m.fog='0'.repeat(m.w*m.h);mapDirty();return true}}]});
 if(v){if(m.fogOn&&!isFogTool(T.tool))T.tool='reveal';MR.maps();toast(m.fogOn?'Névoa ativada — revele as áreas com 🔦':'Névoa desativada')}};
ACT.mMore=async()=>{const m=T.edit;if(!m)return;
 const v=await modal({title:esc(m.name),body:`<div class="menu-list"><button class="btn" data-v="ren">✎ Renomear</button><button class="btn" data-v="size">📐 Tamanho</button><button class="btn" data-v="bg">🖼 Imagem de fundo</button><button class="btn" data-v="grid">${T.grid?'▦ Esconder grade':'▦ Mostrar grade'}</button><button class="btn" data-v="png">${I('dl')} Baixar como PNG</button><button class="btn danger" data-v="del">🗑 Excluir mapa</button></div>`,onMount:(ov,close)=>$$('[data-v]',ov).forEach(b=>b.onclick=()=>close(b.dataset.v)),actions:[{label:'Fechar'}]});
 ({ren:ACT.mRen,size:ACT.mSize,bg:ACT.mBg,grid:ACT.mGrid,png:ACT.mPng,del:ACT.mDel})[v]?.()};
ACT.mRen=async()=>{const m=T.edit;if(!m)return;const n=await ask('Renomear mapa','Nome',m.name);if(!n)return;m.name=n;mapDirty();saveMapD.flush();MR.maps()};
ACT.mSize=async()=>{const m=T.edit;if(!m)return;
 const v=await modal({title:'Tamanho do mapa',body:`<div class="row"><div class="grow"><label class="f">Largura (quadrados)</label><input type="number" id="mw" value="${m.w}" min="5" max="150"></div><div class="grow"><label class="f">Altura</label><input type="number" id="mh" value="${m.h}" min="5" max="150"></div></div><p class="small muted">Máximo 150 × 150. Reduzir corta o que estiver fora.</p>`,actions:[{label:'Cancelar'},{label:'Aplicar',cls:'primary',onClick:ov=>({w:clamp(+$('#mw',ov).value||m.w,5,150),h:clamp(+$('#mh',ov).value||m.h,5,150)})}]});
 if(!v)return;pushUndo(m);const fill=m.style==='dark'&&m.tiles.split('').filter(c=>c==='g').length>m.w*m.h/2?'g':' ';let t='',f='';const of=m.fog||'';
 for(let j=0;j<v.h;j++)for(let i=0;i<v.w;i++){const inside=i<m.w&&j<m.h;t+=inside?tileAt(m,i,j):fill;f+=inside?(of[j*m.w+i]||'0'):'0'}
 m.tiles=t;if(m.fogOn)m.fog=f;m.w=v.w;m.h=v.h;m.objs=m.objs.filter(o=>o.x<m.w&&o.y<m.h);m.labels=m.labels.filter(o=>o.x<m.w&&o.y<m.h);if(m.spawn)m.spawn={x:Math.min(m.spawn.x,m.w-1),y:Math.min(m.spawn.y,m.h-1)};mapDirty();redrawEditor()};
ACT.mBg=async()=>{const m=T.edit;if(!m)return;
 const v=await modal({title:'Imagem de fundo',body:`<p class="muted small">Use um mapa pronto (battlemap) como fundo e desenhe por cima. Com fundo, as paredes automáticas somem.</p>${m.bg?`<label class="f">Opacidade</label><input type="range" id="bgOp" min="0.1" max="1" step="0.05" value="${m.bg.op??1}">`:''}`,
  actions:[...(m.bg?[{label:'Remover fundo',cls:'danger',value:'rm'}]:[]),{label:'🎨 Gerar com IA',value:'gen'},{label:m.bg?'Trocar imagem':'Enviar imagem',value:'up'},{label:'OK',cls:'primary',onClick:ov=>{const r=$('#bgOp',ov);if(r&&m.bg){m.bg.op=+r.value;mapDirty();redrawEditor()}return 'ok'}}]});
 if(v==='rm'){pushUndo(m);m.bg=null;mapDirty();redrawEditor()}
 if(v==='gen'){if(!S.assets){toast('Envio de imagens indisponível nesta visualização.','err');return}const r=await genImage();if(r){pushUndo(m);m.bg={src:r.src,op:1};mapDirty();redrawEditor()}}
 if(v==='up'){if(!S.assets){toast('Envio de imagens indisponível nesta visualização.','err');return}const [f]=await pickFile('image/*');if(!f)return;const b=busy('Enviando…');try{const r=await storeImage(f);pushUndo(m);m.bg={src:r.src,op:1};mapDirty();redrawEditor()}catch(e){toast(e.message,'err')}finally{b.done()}}};
ACT.mUndo=()=>{const s=T.undo.pop();if(!s||!T.edit){toast('Nada para desfazer');return}const prevStyle=T.edit.style,prevFog=T.edit.fogOn;Object.assign(T.edit,JSON.parse(s));mapDirty();if(prevStyle!==T.edit.style||prevFog!==T.edit.fogOn)MR.maps();else redrawEditor()};
ACT.mGrid=()=>{T.grid=!T.grid;redrawEditor()};
ACT.mPng=async()=>{const m=T.edit;if(!m)return;const c=document.createElement('canvas');drawMap(c,m,{cell:48,grid:T.grid,bgImg:bgImg(m,()=>{})});const blob=await canvasBlob(c,'image/png');if(blob)saveFile(slug(m.name)+'.png',blob)};
ACT.mDel=async()=>{const m=T.edit;if(!m||!await confirmDlg(`Excluir o mapa “${esc(m.name)}”?`))return;sharedWrite('games/'+T.gid+'/maps/'+m.id,{del:true});delete T.maps[m.id];if(T.game.activeMap===m.id)gamePatch({activeMap:null});T.edit=null;T.mapDirty=false;MR.maps()};
ACT.mActive=()=>{const m=T.edit;if(!m)return;saveMapD.flush();const on=T.game.activeMap===m.id;gamePatch({activeMap:on?null:m.id});MR.maps();toast(on?'Mapa escondido dos jogadores':'Os jogadores agora veem “'+m.name+'”')};
