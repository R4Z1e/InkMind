/* ============ v34: modo telão — mostra num projetor/monitor/TV só o que os jogadores veem ============
   O mestre abre uma janela (ou outro aparelho) com ?telao=<mesa>. Essa janela entra como espectador:
   lê só os dados públicos da mesa (mapa com névoa, monstros visíveis, fichas do grupo), nunca o mapa do mestre,
   e não aparece como jogador. Funciona no site (Firebase). */
const telaoParam=()=>{const m=/[?&]telao=([\w-]{6,40})/.exec(location.search);return m?m[1]:''};
const telaoURL=gid=>(window.INK_SITE||SITE_URL())+'?telao='+encodeURIComponent(gid);

/* ---------- lado do mestre ---------- */
ACT.telao=async()=>{if(!T.gid)return;
 if(typeof IN_CLAUDE==='function'&&IN_CLAUDE()){await modal({title:'📺 Telão',body:'<p style="margin-top:0">O telão funciona no site do Inkmind (<b>r4z1e.github.io/InkMind</b>), onde a mesa fica online para outros aparelhos. Leve sua campanha para lá em Estante → 🚀 Levar para o site.</p>',actions:[{label:'OK',cls:'primary'}]});return}
 const url=telaoURL(T.gid),multi='getScreenDetails' in window,pub=T.game&&T.game.access==='public';
 const v=await modal({title:'📺 Telão para o grupo',wide:true,body:`<p style="margin-top:0">Mostra num projetor, TV ou segundo monitor <b>só o que os jogadores veem</b>: o mapa com a névoa, os heróis, os monstros à vista, a ordem de iniciativa e os dados rolando. Suas anotações, monstros escondidos e o mapa completo não aparecem.</p>
  <div class="tv-opts">
   <button class="tv-opt" data-v="here"><span>🖥</span><b>Abrir numa janela separada</b><small>Arraste a janela para o projetor e toque em “Tela cheia”.</small></button>
   ${multi?'<button class="tv-opt" data-v="screen"><span>📽</span><b>Abrir direto no outro monitor</b><small>Para computador com projetor ou monitor ligado (Chrome/Edge).</small></button>':''}
   <button class="tv-opt" data-v="other"><span>📱</span><b>Abrir em outro aparelho</b><small>Smart TV, notebook ligado ao projetor, tablet…</small></button>
  </div>
  <p class="small muted" style="margin-bottom:0">Dica: no Chrome, o menu ⋮ → <b>Transmitir</b> → “Transmitir guia” manda a janela do telão para um Chromecast ou TV.</p>`,
  onMount:ov=>$$('.tv-opt',ov).forEach(b=>b.onclick=()=>{ov._val=b.dataset.v;[...ov.querySelectorAll('.dlg-f button')].pop().click()}),
  actions:[{label:'Fechar',onClick:ov=>ov._val||null}]});
 if(v==='here'){const w=window.open(url,'inkmind-telao','popup,width=1280,height=760');if(!w)toast('O navegador bloqueou a janela. Permita pop-ups para este site e tente de novo.','err');return}
 if(v==='screen'){try{const d=await window.getScreenDetails();const s=d.screens.find(x=>x!==d.currentScreen)||d.screens.find(x=>!x.isPrimary);
   if(!s){toast('Só encontrei uma tela. Ligue o projetor ou monitor e tente de novo.');return}
   const w=window.open(url,'inkmind-telao',`popup,left=${s.availLeft},top=${s.availTop},width=${s.availWidth},height=${s.availHeight}`);if(!w)toast('O navegador bloqueou a janela. Permita pop-ups para este site.','err');else toast('Telão aberto no outro monitor. Toque em “⛶ Tela cheia” nele.')}
  catch(e){console.warn(e);toast('Sem permissão para usar o outro monitor. Use “Abrir numa janela separada”.')}return}
 if(v==='other')telaoOther(url,pub)};
async function telaoOther(url,pub){await modal({title:'📱 Telão em outro aparelho',body:`<p style="margin-top:0">No aparelho que vai para o projetor ou TV, abra este endereço:</p>
  <div class="row" style="gap:6px"><input readonly value="${esc(url)}" onclick="this.select()" style="flex:1;font-size:13px"><button class="btn sm" id="tvCp">Copiar</button></div>
  <div id="tvQr" class="tv-qr"></div>
  <p class="small muted" style="margin:10px 0 0">${pub?'A mesa é <b>pública</b>: o aparelho pode entrar como visitante (“Só quero jogar”).':'A mesa é <b>particular</b>: no aparelho do telão, entre com a <b>sua conta</b> (ou a de um jogador desta mesa).'} O telão não ocupa vaga de jogador.</p>`,
  onMount:ov=>{$('#tvCp',ov).onclick=async()=>{try{await navigator.clipboard.writeText(url);toast('Link copiado!')}catch{toast('Selecione e copie o link.')}};tvQr($('#tvQr',ov),url)},actions:[{label:'Fechar',cls:'primary'}]})}
async function tvQr(el,text){try{if(!window.qrcode)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');const q=qrcode(0,'M');q.addData(text);q.make();el.innerHTML=q.createSvgTag({cellSize:5,margin:2,scalable:true});el.insertAdjacentHTML('beforeend','<small class="muted">Aponte a câmera do aparelho</small>')}catch{el.remove()}}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
{const _rp2=renderPlay;renderPlay=function(){const r=_rp2.apply(this,arguments);if(isMaster()&&!T.screen){const pb=$('#tSub .play-bar');if(pb&&!pb.querySelector('[data-act=telao]'))(pb.querySelector('[data-act=pTabs]')||pb.lastElementChild).insertAdjacentHTML('beforebegin','<button class="btn sm" data-act="telao" title="Mostrar no projetor/TV só o que os jogadores veem">📺<span class="hide-m"> Telão</span></button>')}
 if(T.screen)telaoAfterPlay();return r}}
{const _cl5=cmdList;cmdList=function(){const L=_cl5.apply(this,arguments);if(ikCtx()==='table'&&isMaster()&&!T.screen)L.push({g:'Mesa',t:'Telão (projetor ou TV)',d:'Mostra só o que os jogadores veem',run:()=>ACT.telao(),i:'📺',w:'Sessão › Telão',k:'projetor tv monitor transmitir tela espelhar chromecast'});return L}}
{const _rts3=renderTableShell;renderTableShell=function(){const r=_rts3.apply(this,arguments);try{if(isMaster()&&!T.screen&&!(typeof IN_CLAUDE==='function'&&IN_CLAUDE())){const h=$('.tbl-h');const inv=h&&h.querySelector('[data-act=tInvite]');if(h&&!h.querySelector('[data-act=telao]')&&inv)inv.insertAdjacentHTML('afterend','<button class="btn sm hide-m" data-act="telao" title="Telão: mostrar no projetor/TV só o que os jogadores veem">📺<span class="hide-m"> Telão</span></button>')}}catch{}return r}}

/* ---------- lado do telão ---------- */
async function startTelao(gid){if(S._tv)return;S._tv=1;document.body.classList.add('telao');document.title='Telão — Inkmind';
 if(!(window.INK&&INK.user)){return}
 S.uid0=S.uid;S.uid='telao~'+S.uid;   // espectador: nunca é o mestre nem ocupa vaga de jogador
 T.screen=true;try{await openTable(gid,{})}catch(e){console.warn(e)}
 telaoCtl();try{if('wakeLock' in navigator){const lock=()=>navigator.wakeLock.request('screen').catch(()=>{});lock();document.addEventListener('visibilitychange',()=>{if(!document.hidden)lock()})}}catch{}}
{const _rl4=renderLobby;renderLobby=function(){if(!T.screen)return _rl4.apply(this,arguments);T.entered=true;T.mode='player';T.playerOnly=true;T.view='play';renderTableShell()}}
{const _rts2=renderTableShell;renderTableShell=function(){if(T.screen){T.view='play';T.mode='player'}return _rts2.apply(this,arguments)}}
{const _hs=handleSession;handleSession=function(){const r=_hs.apply(this,arguments);if(T.screen&&T.view!=='play'){T.view='play';renderTableShell()}return r}}
{const _raj=renderAskJoin;renderAskJoin=function(gid,st){if(!T.screen)return _raj.apply(this,arguments);const b=$('#tBody');if(b)b.innerHTML=`<div class="tv-wait"><img src="img/wordmark.webp" alt="Inkmind"><h2>Este aparelho não tem acesso à mesa</h2><p>Entre com a conta do mestre ou de um jogador desta mesa — ou peça ao mestre para deixar a mesa pública.</p><button class="btn primary" data-act="inkLogout">Trocar de conta</button></div>`}}
function telaoAfterPlay(){const g=T.game||{},mid=g.activeMap;if(mid&&T._tvMap!==mid){T._tvMap=mid;setTimeout(()=>{try{mzFit()}catch{}},80)}
 if(!mid){const b=$('#play .play-map .empty');if(b)b.innerHTML=`<div class="tv-wait"><img src="img/wordmark.webp" alt="Inkmind"><h2>${esc(g.title||'Mesa de jogo')}</h2><p>${(g.session||{}).on?'O mestre ainda não mostrou o mapa.':'A sessão vai começar em breve…'}</p></div>`}}
function telaoCtl(){if($('#tvCtl'))return;document.body.insertAdjacentHTML('beforeend',`<div id="tvCtl" class="tv-ctl"><span class="tv-t">📺 Telão</span><button data-act="tvFull">⛶ Tela cheia</button><button data-act="mzFit">⤢ Ajustar mapa</button><button data-act="tvSnd" id="tvSnd">${sndOn()?'🔊':'🔇'}</button><button data-act="tvExit">✕ Sair</button></div>`);
 let t=null;const show=()=>{document.body.classList.add('tv-show');clearTimeout(t);t=setTimeout(()=>document.body.classList.remove('tv-show'),3200)};
 ['mousemove','pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,show,{passive:true}));show();
 addEventListener('keydown',e=>{if((e.key==='f'||e.key==='F')&&!e.target.closest('input,textarea'))ACT.tvFull()})}
ACT.tvFull=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>toast('Este navegador não deixou usar a tela cheia. No projetor, use a tecla F11.'))}catch{}};
ACT.tvSnd=()=>{try{ACT.pSound()}catch{}const b=$('#tvSnd');if(b)b.textContent=sndOn()?'🔊':'🔇'};
ACT.tvExit=()=>{try{window.close()}catch{}setTimeout(()=>{location.href=location.pathname},200)};
{const _rh7=renderHome;renderHome=function(...a){const gid=telaoParam();if(gid&&!S._tv&&window.INK&&INK.user){setTimeout(()=>startTelao(gid),0);return}return _rh7.apply(this,a)}}
