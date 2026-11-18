/* ============ v28: economia de leituras e gravações (plano grátis do Firebase) ============
   Cota grátis por dia (projeto inteiro): 50 mil leituras, 20 mil gravações, 20 mil exclusões, 1 GiB guardado.
   - gravações do editor agrupadas: capítulo no máximo a cada 5 s, projeto a cada 15 s (tudo é enviado ao sair/esconder a aba)
   - presença só dentro da mesa (no shim) e Explorar escuta só as campanhas visíveis
   - listas que mudam pouco (Explorar, Mesas abertas, Minhas mesas, ocultos) ficam guardadas por alguns minutos */
const WGAP={c_:5000,cm_:5000,p_:15000},WDEF={};
const _qwRaw=queueWrite;
function wGap(key){const m=/^(c_|cm_|p_)/.exec(key);return m?WGAP[m[1]]:0}
queueWrite=function(key,val){
 const gap=S.backend==='cloud'&&!VISITOR()?wGap(key):0;const d=WDEF[key];
 if(val===null){if(d&&d.timer){clearTimeout(d.timer);d.timer=null}return _qwRaw(key,val)}
 if(!gap)return _qwRaw(key,val);
 const now=Date.now(),e=d||(WDEF[key]={last:0,timer:null,val:null,sig:''});
 const sig=/^p_/.test(key)&&val&&Array.isArray(val.chapters)?val.chapters.map(c=>c.id+':'+(c.title||'')).join('|')+'#'+(val.title||''):'';
 if(sig&&sig!==e.sig){e.sig=sig;if(e.timer){clearTimeout(e.timer);e.timer=null}e.last=now;return _qwRaw(key,val)}   // capítulo novo, apagado ou renomeado: grava já
 if(!e.timer&&now-e.last>=gap){e.last=now;if(sig)e.sig=sig;return _qwRaw(key,val)}
 e.val=clone(val);if(!e.timer)e.timer=setTimeout(()=>wFire(key),Math.max(250,gap-(now-e.last)))};
function wFire(key){const e=WDEF[key];if(!e||!e.timer)return;clearTimeout(e.timer);e.timer=null;e.last=Date.now();let v=e.val;e.val=null;if(S.P&&key==='p_'+S.P.id){v=clone(S.P);v.updatedAt=Date.now()}_qwRaw(key,v)}   // projeto aberto: manda sempre a versão mais nova
function flushWrites(){try{flushChapter()}catch{}try{saveProject.flush()}catch{}Object.keys(WDEF).forEach(wFire)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushWrites()});
addEventListener('pagehide',flushWrites);
{const _h=ACT.home;ACT.home=function(...a){flushWrites();return _h.apply(this,a)}}
{const _o=openProject;openProject=async function(...a){flushWrites();return _o.apply(this,a)}}
{const _b=buildBackup;buildBackup=async function(...a){flushWrites();await new Promise(r=>setTimeout(r,300));return _b.apply(this,a)}}
{const _pp=publishProject;publishProject=async function(...a){flushWrites();S._pubsAt=0;return _pp.apply(this,a)}}
{const _sp=colStart;colStart=async function(...a){flushWrites();return _sp.apply(this,a)}}
{const _st=colStop;colStop=async function(...a){flushWrites();return _st.apply(this,a)}}

/* listas guardadas por alguns minutos */
{const _mg=myGamesSnap;myGamesSnap=async function(){const k=S.uid;if(S._mgC&&S._mgC.k===k&&Date.now()-S._mgC.t<60000)return S._mgC.v;const v=await _mg.apply(this,arguments);S._mgC={k,t:Date.now(),v};return v}}
const mgDirty=()=>{S._mgC=null;S._mesasC=null};
{const _dg=deleteGame;deleteGame=async function(...a){mgDirty();return _dg.apply(this,a)}}
{const _ot=openTable;openTable=async function(...a){mgDirty();try{S.room&&S.room.watch&&S.room.watch([a[0]])}catch{}return _ot.apply(this,a)}}
{const _lh=loadHidden;loadHidden=async function(){if(S._hidAt&&Date.now()-S._hidAt<300000)return;await _lh.apply(this,arguments);S._hidAt=Date.now()}}
{const _mh=modHide;modHide=async function(...a){S._hidAt=0;S._mesasC=null;return _mh.apply(this,a)}}

/* presença: Explorar escuta só as campanhas que estão na tela */
function watchVisibleMasters(){try{if(!S.room||!S.room.watch)return;S.room.watch($$('[data-mo]').map(el=>el.dataset.mo))}catch{}}
{const _de2=drawExplore;drawExplore=function(...a){const r=_de2.apply(this,a);watchVisibleMasters();return r}}
{const _rh6=renderHome;renderHome=function(...a){try{S.room&&S.room.watch&&S.room.watch([])}catch{}return _rh6.apply(this,a)}}

/* consumo: painel de moderação mostra quanto este aparelho usou */
function usageHTML(){const u=window.INK&&INK.usage;if(!u)return'';const t=u.today,q=n=>fmtN(n||0);
 return `<div class="use-box"><b>📊 Consumo do Firebase neste aparelho hoje</b><div class="use-row"><span>Leituras <b>${q(t.r)}</b> <small>/ 50.000 do projeto</small></span><span>Gravações <b>${q(t.w)}</b> <small>/ 20.000</small></span><span>Exclusões <b>${q(t.d)}</b> <small>/ 20.000</small></span></div><p class="small muted" style="margin:6px 0 0">A cota grátis é do projeto inteiro (todos os usuários) e zera às 4h ou 5h da manhã (meia-noite na Califórnia). O total real fica no console do Firebase → Firestore → Uso.</p></div>`}
{const _dm=drawMod;drawMod=function(){_dm.apply(this,arguments);const box=$('#modBox');if(box&&!box.querySelector('.use-box'))box.insertAdjacentHTML('afterbegin',usageHTML())}}
