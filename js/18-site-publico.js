/* ============ v24: termos, privacidade, excluir conta, denúncias, moderação, app instalável ============ */
window.INK_ADMINS=window.INK_ADMINS||['inkmind17@gmail.com'];                      // e-mails dos administradores (moderação)
const LEGAL_BASE='https://r4z1e.github.io/InkMind/';
const legalURL=f=>(window.top===window&&/^https?:$/.test(location.protocol)&&!/claude|anthropic/.test(location.host)?f:LEGAL_BASE+f);
const isAdminU=()=>FBM()&&!!INK.user.email&&INK.emailVerified&&INK_ADMINS.map(x=>String(x).toLowerCase()).includes(String(INK.user.email).toLowerCase());
const isBlocked=uid=>!!(uid&&(S.prefs.blocked||{})[uid]);
S.hidden=new Set();
async function loadHidden(){if(!ACL()&&!VISITOR())return;try{const s=await S.db.collection('hidden').get();S.hidden=new Set(s.docs.map(d=>d.id))}catch(e){console.warn('ocultos',e)}}
const hidPub=(o,id)=>'pub__'+o+'__'+id,hidGame=id=>'game__'+id;

/* ---------- excluir conta ---------- */
ACT.inkDelete=async()=>{if(!(window.INK&&INK.user))return;const vis=VISITOR(),pw=INK.provider==='password';let typed='',pass='';
 const v=await modal({title:'🗑 Excluir minha conta',body:`<p style="margin-top:0">Isso apaga <b>para sempre</b>${vis?' o seu acesso de visitante e as fichas feitas com ele':': seus livros e campanhas, capítulos, versões e comentários, as mesas que você mestra (com mapas e notas), suas fichas nas mesas dos outros, suas publicações em Explorar, as imagens enviadas e o seu perfil'}. Não dá para desfazer.</p>
  ${vis?'':'<div class="notice">Quer guardar uma cópia antes? Em cada projeto, use <b>Publicar → Exportar → Baixar backup</b>.</div>'}
  <label class="f" style="margin-top:12px">Para confirmar, digite <b>EXCLUIR</b></label><input id="delT" autocomplete="off" placeholder="EXCLUIR">
  ${pw?'<label class="f" style="margin-top:10px">Sua senha</label><input id="delP" type="password" autocomplete="current-password">':INK.provider==='google.com'?'<p class="small muted" style="margin:10px 0 0">O Google vai pedir para você confirmar a conta.</p>':''}`,
  onMount:(ov)=>{const b=[...ov.querySelectorAll('.dlg-f button')].pop();const chk=()=>{b.disabled=typed.trim().toUpperCase()!=='EXCLUIR'||(pw&&!pass)};$('#delT',ov).oninput=e=>{typed=e.target.value;chk()};const p=$('#delP',ov);if(p)p.oninput=e=>{pass=e.target.value;chk()};chk()},
  actions:[{label:'Cancelar'},{label:'Excluir para sempre',cls:'primary danger',value:'del'}]});
 if(v!=='del')return;
 const b=busy('Excluindo a conta…');try{await INK.deleteAccount({password:pass},m=>b.set&&b.set(m));b.done();await modal({title:'Conta excluída',body:'<p>Seus dados foram apagados. Obrigado por ter usado o Inkmind.</p>',actions:[{label:'OK',cls:'primary'}]});location.reload()}
 catch(e){b.done();console.warn(e);toast(INK.errMsg?INK.errMsg(e):'Não foi possível excluir agora.','err')}};

/* ---------- denunciar e bloquear ---------- */
const REPORT_REASONS=[['hate','Ódio, discriminação ou violência'],['harass','Assédio, ameaça ou exposição de dados pessoais'],['sexual','Conteúdo sexual explícito'],['minor','Conteúdo envolvendo menores de idade'],['spam','Spam, golpe ou link perigoso'],['copyright','Cópia de obra de outra pessoa'],['other','Outro motivo']];
const reasonLabel=k=>(REPORT_REASONS.find(r=>r[0]===k)||[,'—'])[1];
async function reportDlg(target){if(!(window.INK&&INK.user)){toast('Entre para denunciar.');return}
 let reason='',txt='';
 const v=await modal({title:'⚑ Denunciar',body:`<p style="margin-top:0">Denunciando: <b>${esc(target.title||'conteúdo')}</b>${target.ownerName?` de ${esc(target.ownerName)}`:''}. A moderação analisa cada denúncia; quem foi denunciado não sabe quem denunciou.</p>
  <div class="rp-list">${REPORT_REASONS.map(([k,l])=>`<label class="rp-opt"><input type="radio" name="rpR" value="${k}"> ${esc(l)}</label>`).join('')}</div>
  <label class="f" style="margin-top:10px">Detalhes (opcional)</label><textarea id="rpT" rows="3" maxlength="1500" placeholder="O que aconteceu? Em qual capítulo ou momento?"></textarea>`,
  onMount:ov=>{const b=[...ov.querySelectorAll('.dlg-f button')].pop();b.disabled=true;$$('input[name=rpR]',ov).forEach(r=>r.onchange=()=>{reason=r.value;b.disabled=false});$('#rpT',ov).oninput=e=>txt=e.target.value},
  actions:[{label:'Cancelar'},{label:'Enviar denúncia',cls:'primary',value:'ok'}]});
 if(v!=='ok'||!reason)return;
 try{await S.db.collection('reports').doc().set({by:S.uid,byName:myName(),target:{type:target.type,id:target.id,owner:target.owner||null,title:String(target.title||'').slice(0,120)},reason,text:String(txt||'').slice(0,1500),t:Date.now(),status:'open'});
  const blk=target.owner&&target.owner!==S.uid&&!isBlocked(target.owner)?await confirmDlg('Denúncia enviada. Obrigado! Quer também bloquear '+(target.ownerName||'essa pessoa')+'? Você deixa de ver as publicações e mesas dela.','Bloquear'):false;
  if(blk)blockUser(target.owner,target.ownerName)}
 catch(e){console.warn(e);toast('Não foi possível enviar a denúncia agora.','err')}}
function blockUser(uid,name){if(!uid||uid===S.uid)return;S.prefs.blocked={...(S.prefs.blocked||{}),[uid]:name||'Pessoa'};savePrefs();toast((name||'Pessoa')+' foi bloqueado. Você pode desbloquear em Conta → Pessoas bloqueadas.');if($('#exList'))renderExplore()}
ACT.blockedList=async()=>{const b=S.prefs.blocked||{};const ids=Object.keys(b);
 await modal({title:'🚫 Pessoas bloqueadas',body:ids.length?`<div id="blkBox">${ids.map(u=>`<div class="pl-row"><span>${esc(b[u])}</span><span class="sp"></span><button class="btn sm ghost" data-ub="${esc(u)}">Desbloquear</button></div>`).join('')}</div>`:'<p class="muted">Você não bloqueou ninguém.</p>',
  onMount:ov=>$$('[data-ub]',ov).forEach(x=>x.onclick=()=>{const nb={...(S.prefs.blocked||{})};delete nb[x.dataset.ub];S.prefs.blocked=nb;savePrefs();x.closest('.pl-row').remove();toast('Desbloqueado.')}),actions:[{label:'Fechar',cls:'primary'}]})};
function moreMenu(el,t){const its=[];
 if(t.owner!==S.uid)its.push({i:'⚑',t:'Denunciar',d:t.type==='game'?'Mesa com conteúdo impróprio':'Publicação imprópria',run:()=>reportDlg(t)});
 if(t.owner&&t.owner!==S.uid)its.push({i:'🚫',t:'Bloquear '+(t.ownerName||(t.type==='game'?'mestre':'autor')),d:'Deixa de ver o que essa pessoa publica',run:()=>blockUser(t.owner,t.ownerName)});
 if(isAdminU()){const hid=S.hidden.has(t.type==='game'?hidGame(t.id):hidPub(t.owner,t.id));its.push('-',{i:'🛡',t:hid?'Reexibir (moderação)':'Ocultar (moderação)',run:()=>modHide(t,!hid)})}
 if(!its.length)return;ikMenu(el,its,{title:t.title})}
function decorateExplore(){if(!(ACL()||VISITOR()))return;
 $$('#exList .book[data-o]').forEach(c=>{if(c.querySelector('.ex-more'))return;const p=(S.pubs||[]).find(x=>x.owner===c.dataset.o&&x.id===c.dataset.id)||{};
  c.insertAdjacentHTML('beforeend','<button class="ex-more" title="Mais opções">⋯</button>');c.querySelector('.ex-more').onclick=e=>{e.stopPropagation();moreMenu(e.currentTarget,{type:'pub',id:c.dataset.id,owner:c.dataset.o,ownerName:p.author,title:p.title})}});
 $$('#exMesaList .mesa').forEach(c=>{if(c.querySelector('.ex-more')||!c.dataset.gid)return;
  c.insertAdjacentHTML('beforeend','<button class="ex-more" title="Mais opções">⋯</button>');c.querySelector('.ex-more').onclick=e=>{e.stopPropagation();moreMenu(e.currentTarget,{type:'game',id:c.dataset.gid,owner:c.dataset.mid,ownerName:c.dataset.mname,title:c.dataset.title})}})}
{const _de=drawExplore;drawExplore=function(...a){const all=S.pubs;if(all&&(ACL()||VISITOR()))S.pubs=all.filter(p=>!isBlocked(p.owner)&&!S.hidden.has(hidPub(p.owner,p.id)));try{return _de.apply(this,a)}finally{S.pubs=all;decorateExplore()}}}
{const _re2=renderExplore;renderExplore=async function(...a){await loadHidden();const r=await _re2.apply(this,a);decorateExplore();return r}}
{const _rl3=renderLobby;renderLobby=function(){const r=_rl3.apply(this,arguments);if(!(ACL()||VISITOR())||!T.game||isMaster())return r;const card=$('#tLobby .card');if(card&&!card.querySelector('.rp-link'))card.insertAdjacentHTML('beforeend',`<p class="rp-link"><a href="#" data-act="reportTable">⚑ Denunciar esta mesa</a></p>`);return r}}
ACT.reportTable=async()=>{const g=T.game;if(!g)return;let mn='';try{mn=((await S.user.profiles([g.masterId]))[g.masterId]||{}).name||''}catch{}reportDlg({type:'game',id:T.gid,owner:g.masterId,ownerName:mn,title:g.title})};

{const _rr=renderReader;renderReader=async function(...a){const r=await _rr.apply(this,a);const nav=$('#rdPaper .rd-nav');if(nav&&(ACL()||VISITOR())&&RD.owner!==S.uid&&!$('#rdPaper .rp-link'))nav.insertAdjacentHTML('afterend','<p class="rp-link"><a href="#" data-act="reportBook">⚑ Denunciar esta publicação</a></p>');return r}}
ACT.reportBook=()=>{if(!RD.book)return;reportDlg({type:'pub',id:RD.pid,owner:RD.owner,ownerName:RD.book.author,title:RD.book.title})};
/* ---------- moderação (administradores) ---------- */
async function modHide(t,hide){const id=t.type==='game'?hidGame(t.id):hidPub(t.owner,t.id);
 try{if(hide){await S.db.doc('hidden/'+id).set({type:t.type,id:t.id,owner:t.owner||null,title:String(t.title||'').slice(0,120),by:S.uid,t:Date.now()});S.hidden.add(id);
   if(t.type==='game'){try{await S.db.doc('games/'+t.id).update({access:'private'})}catch(e){console.warn('fechar mesa',e)}}}
  else{await S.db.doc('hidden/'+id).delete();S.hidden.delete(id)}
  toast(hide?'Conteúdo ocultado de Explorar.':'Conteúdo visível de novo.');if($('#exList'))renderExplore();if($('#modBox'))drawMod()}
 catch(e){console.warn(e);toast('Sem permissão de moderação (confira o e-mail de administrador).','err')}}
let MOD_R=[];
ACT.modPanel=async()=>{if(!isAdminU())return;await loadHidden();try{const s=await S.db.collection('reports').where('status','==','open').get();MOD_R=s.docs.map(d=>({rid:d.id,...d.data()})).sort((a,b)=>(b.t||0)-(a.t||0))}catch(e){console.warn(e);MOD_R=[];toast('Não consegui ler as denúncias (permissão).','err')}
 await modal({title:'🛡 Moderação',wide:true,body:'<div id="modBox"></div>',onMount:()=>drawMod(),actions:[{label:'Fechar',cls:'primary'}]})};
function drawMod(){const box=$('#modBox');if(!box)return;
 box.innerHTML=`<h4 class="pl-h">Denúncias abertas ${MOD_R.length?`<span class="ik-badge">${MOD_R.length}</span>`:''}</h4>${MOD_R.length?MOD_R.map((r,i)=>{const tg=r.target||{},hid=S.hidden.has(tg.type==='game'?hidGame(tg.id):hidPub(tg.owner,tg.id));
  return `<div class="mod-r"><div class="mod-h"><b>${tg.type==='game'?'🎲 Mesa':'📖 Publicação'}: ${esc(tg.title||tg.id||'')}</b>${hid?'<span class="pill">oculto</span>':''}<span class="sp"></span><small class="muted">${new Date(r.t||0).toLocaleString('pt-BR')}</small></div>
   <div class="small"><b>${esc(reasonLabel(r.reason))}</b>${r.text?` — ${esc(r.text)}`:''}</div><div class="small muted">Denunciado por ${esc(r.byName||'—')}</div>
   <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" data-mro="${i}">Abrir</button><button class="btn sm ${hid?'':'primary'}" data-mh="${i}">${hid?'Reexibir':tg.type==='game'?'Ocultar e fechar a mesa':'Ocultar'}</button><button class="btn sm ghost" data-mx="${i}">Arquivar denúncia</button></div></div>`}).join(''):'<p class="muted small">Nenhuma denúncia aberta. 🎉</p>'}
  <h4 class="pl-h">Ocultos</h4>${S.hidden.size?[...S.hidden].map(h=>{const [ty,a,b2]=h.split('__');return `<div class="pl-row"><span>${ty==='game'?'🎲':'📖'} ${esc(b2||a)}</span><span class="sp"></span><button class="btn sm ghost" data-uh="${esc(h)}">Reexibir</button></div>`}).join(''):'<p class="muted small">Nada oculto.</p>'}`;
 $$('[data-mro]',box).forEach(b=>b.onclick=()=>{const tg=MOD_R[+b.dataset.mro].target||{};$('.ov')&&$('.ov').remove();if(tg.type==='game')openTable(tg.id);else renderReader(tg.owner,tg.id,0)});
 $$('[data-mh]',box).forEach(b=>b.onclick=()=>{const tg=MOD_R[+b.dataset.mh].target||{};modHide(tg,!S.hidden.has(tg.type==='game'?hidGame(tg.id):hidPub(tg.owner,tg.id)))});
 $$('[data-mx]',box).forEach(b=>b.onclick=async()=>{const r=MOD_R[+b.dataset.mx];try{await S.db.doc('reports/'+r.rid).update({status:'resolved',resolvedAt:Date.now()});MOD_R=MOD_R.filter(x=>x!==r);drawMod()}catch(e){toast('Sem permissão.','err')}});
 $$('[data-uh]',box).forEach(b=>b.onclick=async()=>{try{await S.db.doc('hidden/'+b.dataset.uh).delete();S.hidden.delete(b.dataset.uh);drawMod()}catch{toast('Sem permissão.','err')}})}

/* ---------- app instalável (PWA) e avisos ---------- */
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const canInstall=()=>window.top===window&&!isStandalone()&&!/claude|anthropic/.test(location.host)&&(!!S.installEvt||isIOS());
addEventListener('beforeinstallprompt',e=>{e.preventDefault();S.installEvt=e;updInstallBtn()});
addEventListener('appinstalled',()=>{S.installEvt=null;updInstallBtn();toast('Inkmind instalado! Procure o ícone na tela inicial.')});
if(window.top===window&&'serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')&&!/claude|anthropic/.test(location.host))navigator.serviceWorker.register('sw.js').catch(()=>{});
function updInstallBtn(){const h=$('.home-h');if(!h)return;let b=h.querySelector('[data-act=installApp]');if(canInstall()){if(!b){const acct=h.querySelector('.acct');(acct||h.lastElementChild).insertAdjacentHTML('beforebegin','<button class="btn sm" data-act="installApp" title="Instalar o Inkmind como aplicativo">📲<span class="hide-m"> Instalar app</span></button>')}}else if(b)b.remove()}
ACT.installApp=async()=>{if(S.installEvt){const e=S.installEvt;S.installEvt=null;e.prompt();try{await e.userChoice}catch{}updInstallBtn();return}
 await modal({title:'📲 Instalar o Inkmind',body:isIOS()?'<ol style="margin-top:0;line-height:1.8"><li>Abra este site no <b>Safari</b>.</li><li>Toque em <b>Compartilhar</b> (o quadrado com a seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.</li></ol><p class="small muted">O ícone do Inkmind aparece na tela inicial e abre em tela cheia, como um aplicativo.</p>':'<p style="margin-top:0">No menu do navegador (⋮), escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</p>',actions:[{label:'Entendi',cls:'primary'}]})};
{const _rh4=renderHome;renderHome=function(...a){const r=_rh4.apply(this,a);updInstallBtn();return r}}
async function sysNotify(title,body,tag){try{if(!('Notification' in window)||Notification.permission!=='granted'||!document.hidden)return;const reg=await navigator.serviceWorker.getRegistration();if(reg)reg.showNotification(title,{body,tag,icon:'img/icon-192.png',badge:'img/icon-192.png'});else new Notification(title,{body,tag,icon:'img/icon-192.png'})}catch{}}
function notifyReq(r){sysNotify('Inkmind — pedido de entrada',(r.name||'Alguém')+' pediu para entrar em “'+((T.game&&T.game.title)||'sua mesa')+'”.','req-'+r.uid)}
ACT.notifOn=async()=>{if(!('Notification' in window)){toast('Este navegador não mostra avisos.');return}const p=await Notification.requestPermission();toast(p==='granted'?'Pronto! Você recebe um aviso quando alguém pedir para entrar (com o Inkmind aberto, mesmo em segundo plano).':'Avisos não permitidos. Dá para mudar nas configurações do navegador.');if($('#plBox'))drawPlayers()};
{const _dp=drawPlayers;drawPlayers=function(){_dp.apply(this,arguments);const box=$('#plBox');if(!box||!('Notification' in window)||box.querySelector('.pl-notif'))return;const on=Notification.permission==='granted';
 box.insertAdjacentHTML('beforeend',`<div class="pl-notif">${on?'🔔 Avisos ligados neste aparelho: você é avisado de pedidos de entrada mesmo com o Inkmind em segundo plano.':'<button class="btn sm" data-act="notifOn">🔔 Avisar neste aparelho quando alguém pedir para entrar</button>'}</div>`)}}

/* ---------- menu da conta: links legais, bloqueados, moderação, instalar, excluir ---------- */
function acctExtra(){const its=[];
 if(isAdminU())its.push({i:'🛡',t:'Moderação',d:'Denúncias e conteúdo oculto',run:()=>ACT.modPanel()});
 if(Object.keys(S.prefs.blocked||{}).length)its.push({i:'🚫',t:'Pessoas bloqueadas',run:()=>ACT.blockedList()});
 if(canInstall())its.push({i:'📲',t:'Instalar app',d:'Ícone na tela inicial',run:()=>ACT.installApp()});
 its.push({i:'📄',t:'Termos de uso',run:()=>window.open(legalURL('termos.html'),'_blank','noopener')},{i:'🔒',t:'Política de privacidade',run:()=>window.open(legalURL('privacidade.html'),'_blank','noopener')});
 return its}
