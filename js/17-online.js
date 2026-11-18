/* ============ v18: Firebase — entrar/sair e aviso na Estante ============ */
ACT.inkLogin=()=>{if(window.INK)INK.login();else location.reload()};
ACT.inkLogout=async()=>{if(!(window.INK&&INK.user))return;const vis=VISITOR();if(await confirmDlg(vis?'Sair do modo visitante? As fichas feitas como visitante ficam presas a este acesso — para guardar, crie uma conta antes de sair.':'Sair da sua conta neste aparelho? Seus projetos continuam salvos na nuvem.',vis?'Sair mesmo assim':'Sair'))INK.logout()};
{const _rh=renderHome;renderHome=function(...a){const r=_rh.apply(this,a);if(FBAVAIL()&&!FBM()&&!document.getElementById('inkLocal')){const h=document.querySelector('.hero');if(h)h.insertAdjacentHTML('afterend',`<div class="notice" id="inkLocal" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 16px"><span style="flex:1;min-width:200px">☁ Você está <b>sem conta</b>: os projetos ficam só neste navegador. Entre para salvar na nuvem, usar em qualquer aparelho e jogar na mesa ao vivo.</span><button class="btn primary sm" data-act="inkLogin">Entrar ou criar conta</button></div>`)}return r}}


/* ============ v20: mesa online — convite por link/código, minhas mesas ============ */
async function myGamesSnap(){
 const out=new Map();
 try{(await S.db.collection('games').where('masterId','==',S.uid).get()).docs.forEach(d=>out.set(d.id,d))}catch(e){console.warn(e)}
 try{const ms=await S.db.doc('seats/'+S.uid).get();const gids=ms.exists?(ms.data().gids||[]):[];
  await Promise.all(gids.filter(g=>!out.has(g)).map(async g=>{try{const d=await S.db.doc('games/'+g).get();if(d.exists)out.set(g,d)}catch{}}))}catch{}
 return {docs:[...out.values()]};
}
const SITE_URL=()=>/^https?:$/.test(location.protocol)&&!/claude\.ai|claudeusercontent|anthropic/.test(location.host)?location.origin+location.pathname:'https://r4z1e.github.io/InkMind/';
const inviteLink=gid=>SITE_URL()+'?mesa='+encodeURIComponent(gid);
function parseMesa(t){t=String(t||'').trim();if(!t)return'';const m=/[?&#]mesa=([\w-]+)/.exec(t);if(m)return m[1];const c=/^[\w-]{6,40}$/.exec(t);return c?c[0]:''}
ACT.tInvite=async()=>{if(ACL()&&isMaster())return playersModal();const gid=T.gid;if(!gid)return;if(ACL()&&gAccess()==='private'){toast('Só o mestre pode convidar para uma mesa particular.');return}const link=inviteLink((T.game&&T.game.code)||gid),title=(T.game&&T.game.title)||'Mesa';
 const copy=async(txt,what)=>{try{await navigator.clipboard.writeText(txt);toast(what+' copiado!')}catch{prompt('Copie:',txt)}};
 await modal({title:'👥 Convidar jogadores',body:`<p style="margin-top:0">Mande o <b>link</b> para os jogadores (WhatsApp, Discord…). Ao abrir, eles entram na conta do Inkmind e caem direto nesta mesa.</p>
  <label class="f">Link da mesa</label><div class="row" style="gap:6px"><input id="ivL" value="${esc(link)}" readonly style="flex:1;min-width:0"><button class="btn" id="ivLc">Copiar</button></div>
  <label class="f" style="margin-top:12px">Ou passe o código</label><div class="row" style="gap:6px"><input id="ivC" value="${esc((T.game&&T.game.code)||gid)}" readonly style="flex:1;min-width:0;font:600 16px ui-monospace,monospace;letter-spacing:.06em"><button class="btn" id="ivCc">Copiar</button></div>
  <p class="small muted" style="margin:8px 0 0">Com o código: na Estante, toque em <b>Entrar numa mesa</b> e cole. Depois de entrar uma vez, a mesa fica em <b>Minhas mesas</b>.</p>`,
  onMount:ov=>{$('#ivLc',ov).onclick=()=>copy(link,'Link');$('#ivCc',ov).onclick=()=>copy((T.game&&T.game.code)||gid,'Código');$('#ivL',ov).onfocus=e=>e.target.select();$('#ivC',ov).onfocus=e=>e.target.select()},
  actions:[...(navigator.share?[{label:'Compartilhar…',value:'share'}]:[]),{label:'Pronto',cls:'primary'}]}).then(v=>{if(v==='share')navigator.share({title:'Inkmind — '+title,text:`Vem jogar “${title}” comigo no Inkmind! 🎲`,url:link}).catch(()=>{})})};
ACT.joinByCode=async()=>{if(S.backend!=='cloud'||!S.uid){openTable('x');return}
 const t=await ask('Entrar numa mesa','Cole o link ou o código que o mestre mandou');if(!t)return;const gid=parseMesa(t);
 if(!gid){toast('Não reconheci esse link ou código.','err');return}
 goMesa(gid,false)};
{const _lm=loadMesas;loadMesas=async function(...a){const r=await _lm.apply(this,a);const vh=document.querySelector('#mesas .vh');if(vh&&!vh.querySelector('[data-act=joinByCode]'))vh.insertAdjacentHTML('beforeend','<button class="btn" data-act="joinByCode">🎲 Entrar numa mesa</button>');return r}}
{const _rh2=renderHome;renderHome=function(...a){const r=_rh2.apply(this,a);
 if(!S._mesaParam){S._mesaParam=1;const g=parseMesa(location.search);if(g){try{history.replaceState(null,'',location.pathname)}catch{}setTimeout(()=>goMesa(g,true),300)}}
 return r}}


/* ============ v21: mesa pública/particular, entrada controlada, segredos do mestre ============ */
const ACL=()=>FBM();
const SECRET_KEYS=['gmNotes','prep'];
const secretPath=gid=>'games/'+gid+'/secret/gm';
const CODE_CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode=()=>{const a=new Uint8Array(6);crypto.getRandomValues(a);return [...a].map(x=>CODE_CH[x%CODE_CH.length]).join('')};
const gPlayers=(g=T.game)=>Object.keys((g&&g.players)||{}).filter(u=>(g.players||{})[u]===true);
const isMember=(g=T.game)=>!!g&&(g.masterId===S.uid||!!(g.players||{})[S.uid]);
const gAccess=(g=T.game)=>(g&&g.access)||(g&&g.published?'public':'legacy');
const gMax=(g=T.game)=>(g&&g.maxPlayers)||99;
const DELV=()=>window.INK&&INK.DEL;
const aclErr=m=>Object.assign(new Error(m),{code:'acl'});

/* ---------- segredos do mestre (notas e revelações preparadas) ---------- */
const secretSave=debounce(()=>{if(!T.gid||!T.secret||!isMaster())return;S.db.doc(secretPath(T.gid)).set(cl(T.secret)).catch(e=>{console.warn('segredo',e);toast('Não foi possível salvar as notas do mestre agora.','err')})},500);
{const _sw=sharedWrite;sharedWrite=function(path,op){
 if(T.gid&&path==='games/'+T.gid&&op&&op.patch&&T.game&&isMaster()){const sec={},rest={};for(const k in op.patch)(SECRET_KEYS.includes(k)?sec:rest)[k]=op.patch[k];
  if(Object.keys(sec).length){T.secret={...(T.secret||{}),...cl(sec)};secretSave()}
  if(!Object.keys(rest).length)return;op={...op,patch:rest}}
 return _sw.call(this,path,op)}}
function secretInit(){if(!T.gid||!T.game||!isMaster()||T._secGid===T.gid)return;T._secGid=T.gid;T.secret=null;const gid=T.gid;
 T.unsub.push(S.db.doc(secretPath(gid)).onSnapshot(async sd=>{if(T.gid!==gid)return;
  if(!sd.exists){const leg={};SECRET_KEYS.forEach(k=>{const v=T.game[k];if(v&&(typeof v==='string'?v.trim():v.length))leg[k]=cl(v)});
   T.secret=leg;if(Object.keys(leg).length){try{await S.db.doc(secretPath(gid)).set(leg);await S.db.doc('games/'+gid).update({gmNotes:'',prep:[]})}catch(e){console.warn('migrar segredos',e)}}}
  else T.secret=sd.data()||{};
  Object.assign(T.game,T.secret);if(T.loaded&&T.entered)try{liveRefresh('game')}catch{}},e=>console.warn('segredo',e)))}

/* ---------- controle de entrada (mestre) ---------- */
async function aclMigrate(gid){const g=T.game;if(!g||g.access)return;
 const players={};try{(await S.db.collection('seats').where('gids','array-contains',gid).get()).docs.forEach(d=>{if(d.id!==S.uid)players[d.id]=true})}catch{}
 const code=newCode(),access=(g.published||window.INK_TEST_PUBLIC)?'public':'private',maxPlayers=Math.max(5,Object.keys(players).length);
 await S.db.doc('games/'+gid).update({access,maxPlayers,code,players});
 Object.assign(T.game,{access,maxPlayers,code,players});
 await writeInvite(code,gid)}
function writeInvite(code,gid){const g=T.game||{};return S.db.doc('invites/'+code).set({gid,title:g.title||'Mesa',masterId:S.uid,masterName:myName(),access:gAccess(g),t:Date.now()}).catch(e=>console.warn('convite',e))}
function aclInit(){if(!ACL()||!T.gid||!T.game||T._aclGid===T.gid)return;T._aclGid=T.gid;const gid=T.gid;
 if(isMaster()){
  if(!T.game.access)aclMigrate(gid).then(updInvBtn).catch(e=>console.warn('acl',e));
  T.joinReqs=[];T._seenReq=new Set();let first=true;
  T.unsub.push(S.db.collection('games/'+gid+'/requests').onSnapshot(s=>{if(T.gid!==gid)return;
   T.joinReqs=s.docs.map(d=>({uid:d.id,...d.data()})).filter(r=>(r.status||'pending')==='pending').sort((a,b)=>(a.t||0)-(b.t||0));
   T.joinReqs.forEach(r=>{if(!T._seenReq.has(r.uid)){T._seenReq.add(r.uid);if(!first){toast('🙋 '+(r.name||'Alguém')+' pediu para entrar na mesa.');notifyReq(r)}}});first=false;
   updInvBtn();if($('#plBox'))drawPlayers()},e=>console.warn('pedidos',e)))}
 updInvBtn()}
function updInvBtn(){const b=$('.tbl-h [data-act=tInvite]');if(!b||!T.game)return;
 if(!ACL()){return}
 if(isMaster()){const n=(T.joinReqs||[]).length;b.innerHTML=`👥<span class="hide-m"> Jogadores</span>${n?`<span class="ik-badge">${n}</span>`:''}`;b.title='Jogadores, convite e tipo de mesa';b.style.display=''}
 else b.style.display=gAccess()==='private'?'none':''}
{const _otd=onTableData;onTableData=function(kind){if(kind==='game'&&T.game){if(T.secret)Object.assign(T.game,T.secret);secretInit();aclInit();updInvBtn()}return _otd.apply(this,arguments)}}

/* ---------- painel de jogadores (mestre) ---------- */
let PL_NAMES={};
async function playersModal(){if(!T.game)return;
 try{PL_NAMES=await S.user.profiles([...gPlayers(),...Object.keys(T.game.banned||{}),...(T.joinReqs||[]).map(r=>r.uid)])||{}}catch{PL_NAMES={}}
 await modal({title:'👥 Jogadores da mesa',wide:true,body:'<div id="plBox"></div>',onMount:()=>drawPlayers(),actions:[{label:'Fechar',cls:'primary'}]})}
function drawPlayers(){const box=$('#plBox');if(!box||!T.game)return;const g=T.game,pub=gAccess()!=='private',ps=gPlayers(),mx=gMax(),code=g.code||T.gid,link=inviteLink(code),reqs=T.joinReqs||[],ban=Object.keys(g.banned||{}).filter(u=>g.banned[u]);
 const nm=u=>esc((PL_NAMES[u]&&PL_NAMES[u].name)||((T.seats.find(s=>s.uid===u)||{}).name)||'Jogador');
 box.innerHTML=`<div class="pl-acc">
   <label class="pl-opt ${pub?'on':''}"><input type="radio" name="plAcc" value="public" ${pub?'checked':''}><b>🌍 Pública</b><small>Aparece em Explorar → Mesas abertas. Qualquer pessoa com conta entra sozinha até lotar.</small></label>
   <label class="pl-opt ${!pub?'on':''}"><input type="radio" name="plAcc" value="private" ${!pub?'checked':''}><b>🔒 Particular</b><small>Só com o convite, e você aprova cada pedido de entrada.</small></label></div>
  <div class="row" style="gap:10px;align-items:center;margin:14px 0 4px;flex-wrap:wrap"><label class="f" style="margin:0">Máximo de jogadores</label><input type="number" id="plMax" min="1" max="12" value="${Math.min(mx,12)}" style="width:80px"><span class="pill">${ps.length} / ${Math.min(mx,12)} na mesa</span>${ps.length>=mx?'<span class="pill" style="color:#e0645a">Lotada</span>':''}</div>
  <p class="small muted" style="margin:0 0 14px">${pub?'Quando lotar, a mesa some de Mesas abertas e ninguém mais entra até alguém sair ou você aumentar o limite.':'O limite vale também para os pedidos que você aprovar.'}</p>
  <h4 class="pl-h">Convite</h4>
  <div class="row" style="gap:6px"><input id="plLink" value="${esc(link)}" readonly style="flex:1;min-width:0"><button class="btn" id="plCopyL">Copiar link</button></div>
  <div class="row" style="gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap"><span class="small muted">Código:</span><b class="pl-code">${esc(code)}</b><button class="btn sm" id="plCopyC">Copiar</button>${navigator.share?'<button class="btn sm" id="plShare">Compartilhar…</button>':''}<span class="sp"></span><button class="btn sm ghost" id="plNew" title="O link e o código antigos param de funcionar">↻ Gerar novo código</button></div>
  ${!pub||reqs.length?`<h4 class="pl-h">Pedidos de entrada ${reqs.length?`<span class="ik-badge">${reqs.length}</span>`:''}</h4>${reqs.length?reqs.map(r=>`<div class="pl-row"><span class="pl-av">🙋</span><b>${esc(r.name||'Jogador')}</b><span class="sp"></span><button class="btn sm primary" data-ok="${esc(r.uid)}">Aprovar</button><button class="btn sm ghost" data-no="${esc(r.uid)}">Recusar</button></div>`).join(''):'<p class="small muted">Nenhum pedido no momento.</p>'}`:''}
  <h4 class="pl-h">Na mesa</h4>${ps.length?ps.map(u=>`<div class="pl-row"><span class="pl-dot ${playerOnline(u)?'on':''}" title="${playerOnline(u)?'Conectado agora':'Desconectado'}"></span><b>${nm(u)}</b><span class="sp"></span><button class="btn sm ghost" data-rm="${esc(u)}">Remover</button></div>`).join(''):'<p class="small muted">Ninguém entrou ainda — mande o convite.</p>'}
  ${ban.length?`<h4 class="pl-h">Removidos</h4>${ban.map(u=>`<div class="pl-row"><span class="pl-av">🚫</span><span>${nm(u)}</span><span class="sp"></span><button class="btn sm ghost" data-unban="${esc(u)}">Permitir de novo</button></div>`).join('')}`:''}`;
 const copy=async(t,w)=>{try{await navigator.clipboard.writeText(t);toast(w+' copiado!')}catch{prompt('Copie:',t)}};
 $$('input[name=plAcc]',box).forEach(r=>r.onchange=()=>setAccess(r.value));
 $('#plMax',box).onchange=e=>{const v=clamp(parseInt(e.target.value)||1,1,12);gamePatch({maxPlayers:v});updInvite();drawPlayers()};
 $('#plCopyL',box).onclick=()=>copy(link,'Link');$('#plCopyC',box).onclick=()=>copy(code,'Código');
 const sh=$('#plShare',box);if(sh)sh.onclick=()=>navigator.share({title:'Inkmind — '+(g.title||'Mesa'),text:`Vem jogar “${g.title||'Mesa'}” comigo no Inkmind! 🎲 Código: ${code}`,url:link}).catch(()=>{});
 $('#plNew',box).onclick=regenCode;
 $$('[data-ok]',box).forEach(b=>b.onclick=()=>approveReq(b.dataset.ok));
 $$('[data-no]',box).forEach(b=>b.onclick=()=>denyReq(b.dataset.no));
 $$('[data-rm]',box).forEach(b=>b.onclick=()=>removePlayer(b.dataset.rm));
 $$('[data-unban]',box).forEach(b=>b.onclick=async()=>{await S.db.doc('games/'+T.gid).update({banned:{[b.dataset.unban]:DELV()}});delete (T.game.banned||{})[b.dataset.unban];drawPlayers()})}
function updInvite(){if(T.game&&T.game.code)writeInvite(T.game.code,T.gid)}
async function setAccess(a){gamePatch({access:a});T.game.access=a;updInvite();updInvBtn();drawPlayers();toast(a==='public'?'Mesa pública: aparece em Explorar → Mesas abertas.':'Mesa particular: só entra quem você aprovar.')}
async function regenCode(){if(!await confirmDlg('Gerar um novo código? O link e o código antigos param de funcionar. Quem já está na mesa continua nela.','Gerar novo'))return;
 const old=T.game.code,code=newCode();await writeInvite(code,T.gid);gamePatch({code});T.game.code=code;if(old)S.db.doc('invites/'+old).delete().catch(()=>{});drawPlayers();toast('Novo código: '+code)}
async function approveReq(uid){const g=T.game,ps=gPlayers();
 if(ps.length>=gMax()){if(!await confirmDlg(`A mesa está lotada (${ps.length}/${gMax()}). Aprovar mesmo assim aumenta o limite para ${ps.length+1}.`,'Aprovar'))return;gamePatch({maxPlayers:ps.length+1})}
 await S.db.doc('games/'+T.gid).update({players:{[uid]:true},banned:{[uid]:DELV()}});T.game.players={...(g.players||{}),[uid]:true};if(T.game.banned)delete T.game.banned[uid];
 S.db.doc('games/'+T.gid+'/requests/'+uid).delete().catch(()=>{});drawPlayers();toast('Jogador aprovado.')}
async function denyReq(uid){await S.db.doc('games/'+T.gid+'/requests/'+uid).update({status:'denied'}).catch(e=>console.warn(e));T.joinReqs=(T.joinReqs||[]).filter(r=>r.uid!==uid);updInvBtn();drawPlayers()}
async function removePlayer(uid){const nm=(PL_NAMES[uid]&&PL_NAMES[uid].name)||'este jogador';
 if(!await confirmDlg(`Remover ${nm} da mesa? Ele não consegue mais abrir a mesa nem entrar de novo (dá para permitir depois). A ficha dele fica guardada.`,'Remover'))return;
 await S.db.doc('games/'+T.gid).update({players:{[uid]:DELV()},banned:{[uid]:true}});if(T.game.players)delete T.game.players[uid];T.game.banned={...(T.game.banned||{}),[uid]:true};drawPlayers();toast(nm+' foi removido da mesa.')}

/* ---------- entrar na mesa (jogador) ---------- */
async function aclJoin(){const g=T.game;if(!g||isMaster()||(g.players||{})[S.uid])return;
 if((g.banned||{})[S.uid])throw aclErr('O mestre removeu você desta mesa.');
 if(gAccess(g)==='private')throw aclErr('Esta mesa é particular: peça para o mestre aprovar sua entrada.');
 if(gPlayers(g).length>=gMax(g))throw aclErr(`A mesa está lotada (${gPlayers(g).length}/${gMax(g)}).`);
 try{await S.db.doc('games/'+T.gid).update({players:{[S.uid]:true}});g.players={...(g.players||{}),[S.uid]:true}}
 catch(e){console.warn(e);throw aclErr('Não deu para entrar: a mesa lotou ou fechou para novos jogadores.')}}
{const _rl=renderLobby;renderLobby=function(){const r=_rl.apply(this,arguments);if(!ACL()||!T.game||isMaster())return r;
 const g=T.game,btn=$('#tLobby [data-act=tEnter][data-as=player]'),n=gPlayers(g).length,mx=gMax(g);let note='';
 if((g.banned||{})[S.uid]){note='🚫 O mestre removeu você desta mesa.';if(btn)btn.disabled=true}
 else if(!isMember(g)&&gAccess(g)!=='legacy'&&n>=mx){note=`Mesa lotada (${n}/${mx}). Tente de novo quando abrir uma vaga.`;if(btn)btn.disabled=true}
 else if(!isMember(g)&&gAccess(g)==='public')note=`🌍 Mesa pública · ${n}/${mx} jogadores`;
 if(note&&btn)btn.insertAdjacentHTML('beforebegin',`<p class="pl-note">${note}</p>`);return r}}
function renderAskJoin(gid,st){T.gid=gid;const inv=T.inv||{};const b=$('#tBody');if(!b)return;const ib=$('.tbl-h [data-act=tInvite]');if(ib)ib.style.display='none';const tt=$('#tTitle');if(tt&&inv.title)tt.textContent=inv.title;b.className='tbl-b lobby';
 const status=st||T._askSt||'none';
 b.innerHTML=`<main class="tmain"><div class="tpad narrow" id="tAsk"><div class="card lobby"><div class="lobby-ic">🔒</div><h2>${esc(inv.title||'Mesa particular')}</h2>${inv.masterName?`<p class="muted">Mestre: ${esc(inv.masterName)}</p>`:''}
  <p>Esta mesa é <b>particular</b>: o mestre precisa aprovar sua entrada.</p>
  ${status==='pending'?'<div class="mstat on"><span class="d"></span>Pedido enviado — aguardando o mestre aprovar…</div><button class="btn ghost" data-act="reqJoinCancel" style="width:100%;margin-top:8px">Cancelar pedido</button>'
   :status==='denied'?'<div class="notice">O mestre recusou o pedido.</div><button class="btn" data-act="reqJoin" style="width:100%;margin-top:8px">Pedir de novo</button>'
   :`<button class="btn primary" data-act="reqJoin" style="width:100%;padding:13px;font-size:15px">🙋 Pedir para entrar</button>`}
  <p class="small muted" style="margin-top:12px">Quando o mestre aprovar, a mesa abre sozinha aqui.</p></div></div></main>`;
 if(T._askGid!==gid){T._askGid=gid;let had=false;const ref=S.db.doc('games/'+gid+'/requests/'+S.uid);
  const un=ref.onSnapshot(async s=>{if(T.gid!==gid||!$('#tAsk'))return;
   if(s.exists){had=true;T._askSt=(s.data()||{}).status||'pending';renderAskJoin(gid,T._askSt)}
   else if(had){had=false;let ok=false;try{ok=(await S.db.doc('games/'+gid).get()).exists}catch{}if(ok){toast('Você foi aprovado! 🎉');sysNotify('Inkmind','Você foi aprovado na mesa “'+(inv.title||'')+'”! 🎉','ok-'+gid);T._askGid=null;T._askSt=null;openTable(gid,{inv})}else{T._askSt='none';renderAskJoin(gid,'none')}}
   else{T._askSt='none';renderAskJoin(gid,'none')}},()=>{});
  T.unsub.push(un)}}
ACT.reqJoin=async()=>{const gid=T.gid;const ref=S.db.doc('games/'+gid+'/requests/'+S.uid);try{await ref.delete().catch(()=>{});await ref.set({name:myName(),t:Date.now(),status:'pending'});toast('Pedido enviado ao mestre.')}catch(e){console.warn(e);toast('Não foi possível enviar o pedido agora.','err')}};
ACT.reqJoinCancel=async()=>{try{await S.db.doc('games/'+T.gid+'/requests/'+S.uid).delete()}catch{}};

/* ---------- abrir pelo convite (código ou link) ---------- */
async function resolveMesa(tok){if(!tok)return null;
 try{const iv=await S.db.doc('invites/'+tok).get();if(iv.exists){const d=iv.data();return{gid:d.gid,inv:d}}}catch{}
 try{const g=await S.db.doc('games/'+tok).get();if(g.exists)return{gid:tok}}catch(e){if(/permission/i.test((e.code||'')+(e.message||'')))return{gid:tok}}
 return null}
async function goMesa(tok,fromLink){if(S.backend!=='cloud'||!S.uid){openTable(tok);return}
 const b=busy('Procurando a mesa…');let r=null;try{r=await resolveMesa(tok)}finally{b.done()}
 if(!r){toast(fromLink?'A mesa do convite não foi encontrada. Peça um novo link ao mestre.':'Mesa não encontrada. Confira o código com o mestre.','err');return}
 openTable(r.gid,{inv:r.inv})}
{const _ot=openTable;openTable=function(gid,opts={}){const r=_ot.call(this,gid,opts);T.inv=opts.inv||null;T._askGid=null;T._askSt=null;T._secGid=null;T._aclGid=null;T.joinReqs=[];return r}}

/* ---------- Explorar: mesas abertas ---------- */
{const _re=renderExplore;renderExplore=async function(...a){const r=await _re.apply(this,a);if(!ACL())return r;
 const list=$('#exList');if(!list||$('#exMesas'))return r;
 list.insertAdjacentHTML('beforebegin','<section id="exMesas" class="ex-mesas"><h3>🎲 Mesas abertas</h3><p class="small muted">Mesas públicas com vaga. Entre, crie seu personagem e jogue.</p><div class="mesa-grid" id="exMesaList"><p class="muted small">Carregando…</p></div></section>');
 try{let gs;if(S._mesasC&&Date.now()-S._mesasC.t<120000)gs=cl(S._mesasC.v);else{const s=await S.db.collection('games').where('access','==','public').get();gs=s.docs.map(d=>({id:d.id,...d.data()}));S._mesasC={t:Date.now(),v:cl(gs)}}
  const ps=await S.user.profiles(gs.map(g=>g.masterId));
  gs=gs.filter(g=>!isBlocked(g.masterId)&&!S.hidden.has(hidGame(g.id))).sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0)).slice(0,24);
  $('#exMesaList').innerHTML=gs.length?gs.map(g=>{const n=gPlayers(g).length,mx=gMax(g),full=n>=mx,me=g.masterId===S.uid||!!(g.players||{})[S.uid];
   return `<div class="mesa ${full&&!me?'full':''}" data-gid="${esc(g.id)}" data-mid="${esc(g.masterId||'')}" data-mname="${esc((ps[g.masterId]&&ps[g.masterId].name)||'')}" data-title="${esc(g.title||'Mesa')}" ${full&&!me?'':`data-act="openTable" data-id="${esc(g.id)}" role="button" tabindex="0"`}><span class="mz">🎲</span><b>${esc(g.title||'Mesa')}</b><small>Mestre: ${esc((ps[g.masterId]&&ps[g.masterId].name)||'—')}</small><small>${me?'Você está nesta mesa':full?`Lotada (${n}/${mx})`:`${n}/${mx} jogadores · vaga aberta`}</small></div>`}).join(''):'<p class="muted small">Nenhuma mesa pública no momento. Que tal abrir a sua? Na mesa, toque em 👥 Jogadores → Pública.</p>'}
 catch(e){console.warn(e);$('#exMesaList').innerHTML='<p class="muted small">Não foi possível carregar as mesas agora.</p>'}
 return r}}


/* ============ v22: modo visitante — só joga em mesas abertas ============ */
const VISITOR=()=>!!(window.INK&&INK.mode==='firebase'&&INK.isAnon);
function visitorBlock(what){toast('Visitantes só jogam em mesas abertas. Crie uma conta grátis para '+(what||'escrever e mestrar')+'.');setTimeout(()=>{if(window.INK)INK.login()},900)}
['newProject','importBackup','openTableP'].forEach(k=>{const f=ACT[k];if(!f)return;ACT[k]=function(...a){if(VISITOR())return visitorBlock(k==='openTableP'?'ser mestre':k==='importBackup'?'restaurar projetos':'criar livros e campanhas');return f.apply(this,a)}});
{const _op=openProject;openProject=async function(...a){if(VISITOR())return visitorBlock('escrever');return _op.apply(this,a)}}
{const _rh3=renderHome;renderHome=function(...a){const r=_rh3.apply(this,a);if(!VISITOR())return r;
 const home=document.querySelector('.home');if(!home)return r;home.classList.add('visitor');
 home.querySelectorAll('.shelf,.newbook,[data-act=newProject],[data-act=importBackup],[data-act=hf],[data-act=hfNew],.chip,#inkLocal').forEach(e=>e.style.display='none');
 const hero=home.querySelector('.hero');if(hero){const h=hero.querySelector('h1'),p=hero.querySelector('p');if(h)h.textContent='Olá, '+((S.me&&S.me.name)||'visitante')+'!';if(p)p.textContent='Você está como visitante: entre em mesas abertas, crie seu personagem e jogue.';
  if(!$('#visCard')){const anchor=home.querySelector('.learn-cta')||hero;anchor.insertAdjacentHTML(anchor===hero?'afterend':'beforebegin',`<div class="card vis-card" id="visCard"><div class="vis-ic">🎲</div><div class="grow"><b>Modo visitante</b><p>Você pode jogar em <b>mesas públicas</b>. Para escrever livros, criar mesas, mestrar ou entrar em mesas particulares, crie uma conta grátis — suas fichas continuam com você.</p></div><div class="vis-act"><button class="btn primary" data-act="explore">🎲 Ver mesas abertas</button><button class="btn" data-act="joinByCode">Tenho um código</button><button class="btn ghost" data-act="inkLogin">Criar conta</button></div></div>`)}}
 return r}}
{const _lm2=loadMesas;loadMesas=async function(...a){const r=await _lm2.apply(this,a);if(VISITOR()){const vh=document.querySelector('#mesas .vh p');if(vh)vh.textContent='Mesas em que você entrou como visitante.';document.querySelectorAll('#mesas p.muted').forEach(p=>{if(/Nenhuma mesa/.test(p.textContent))p.innerHTML='Você ainda não entrou em nenhuma mesa. Veja as <a href="#" data-act="explore">mesas abertas</a> ou use o código que o mestre mandou.'})}return r}}
{const _ra=renderAskJoin;renderAskJoin=function(gid,st){if(!VISITOR())return _ra.apply(this,arguments);T.gid=gid;const inv=T.inv||{};const b=$('#tBody');if(!b)return;const ib=$('.tbl-h [data-act=tInvite]');if(ib)ib.style.display='none';
 b.className='tbl-b lobby';b.innerHTML=`<main class="tmain"><div class="tpad narrow" id="tAsk"><div class="card lobby"><div class="lobby-ic">🔒</div><h2>${esc(inv.title||'Mesa particular')}</h2>${inv.masterName?`<p class="muted">Mestre: ${esc(inv.masterName)}</p>`:''}<p>Esta mesa é <b>particular</b>. Visitantes jogam só em mesas públicas — crie uma conta grátis para pedir para entrar.</p><button class="btn primary" data-act="inkLogin" style="width:100%;padding:13px;font-size:15px">Criar conta grátis</button><button class="btn ghost" data-act="explore" style="width:100%;margin-top:8px">Ver mesas abertas</button></div></div></main>`}}
{const _aj=aclJoin;aclJoin=async function(){const g=T.game;if(VISITOR()&&g&&!isMaster()&&!(g.players||{})[S.uid]&&gAccess(g)!=='public')throw aclErr('Visitantes só entram em mesas públicas. Crie uma conta grátis para jogar nesta mesa.');return _aj.apply(this,arguments)}}
{const _rl2=renderLobby;renderLobby=function(){const r=_rl2.apply(this,arguments);if(!VISITOR()||!T.game||isMember())return r;
 if(gAccess()!=='public'){const btn=$('#tLobby [data-act=tEnter][data-as=player]');if(btn){btn.disabled=true;if(!$('#tLobby .pl-note'))btn.insertAdjacentHTML('beforebegin','<p class="pl-note">Visitantes jogam só em mesas públicas. <a href="#" data-act="inkLogin">Criar conta</a></p>')}}return r}}


/* ============ v23: botão de sair da conta ============ */
ICONS.logout='<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M9 16l-4-4 4-4"/><path d="M5 12h11"/>';
{const _acc=ACT.account;ACT.account=function(el,...a){
 if(FBAVAIL()&&window.INK&&INK.user&&el&&el.classList&&el.classList.contains('acct')){const vis=VISITOR(),u=INK.user;
  return ikMenu(el,[
   {i:I('pen'),t:'Minha conta',d:'Apelido, ícone e senha do app',run:()=>_acc.call(this,{dataset:{}})},
   ...(vis?[{i:'✨',t:'Criar conta grátis',d:'Escrever, criar mesas e mestrar',run:()=>INK.login()}]:[]),
   {i:I('brush'),t:'Tema do app',run:()=>ACT.themeQuick({dataset:{}})},
   ...acctExtra(),
   '-',{i:I('logout'),t:'Sair da conta',d:vis?'Sai do modo visitante':'Neste aparelho',run:()=>ACT.inkLogout()},{i:'🗑',t:'Excluir minha conta',d:'Apaga seus dados para sempre',run:()=>ACT.inkDelete()}],{title:vis?'Visitante · '+((S.me&&S.me.name)||''):(u.email||(S.me&&S.me.name)||'Conta')})}
 return _acc.call(this,el,...a)}}
