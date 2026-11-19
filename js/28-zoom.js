/* ============ v33: zoom do mapa (editor e sessão) — botões flutuantes, pinça no celular, Ctrl+roda no PC ============ */
const MZ_MIN=.25,MZ_MAX=3;
const mzMap=()=>{try{return T.view==='play'||T.mode==='player'?T.maps[T.game.activeMap]:T.edit}catch{return null}};
function mzRedraw(){if(T.view==='play'){T.playKey=null;redrawPlay()}else if(T.mode==='master')redrawEditor();else redrawPlay()}
/* muda o zoom mantendo parado o ponto sob o dedo/cursor (ou o centro da tela) */
function mzSet(z,fx,fy){const sc=$('#mapScroll'),cv=$('#mapC');z=clamp(Math.round(z*100)/100,MZ_MIN,MZ_MAX);if(!sc||!cv){T.zoom=z;return}
 const r=sc.getBoundingClientRect(),cr=cv.getBoundingClientRect();if(fx==null){fx=r.left+r.width/2;fy=r.top+r.height/2}
 const ux=(fx-cr.left)/Math.max(1,cr.width),uy=(fy-cr.top)/Math.max(1,cr.height);   // posição relativa no mapa
 T.zoom=z;mzRedraw();
 const c2=cv.getBoundingClientRect();sc.scrollLeft+=(c2.left+ux*c2.width)-fx;sc.scrollTop+=(c2.top+uy*c2.height)-fy;mzLabel()}
function mzFit(){const sc=$('#mapScroll'),m=mzMap();if(!sc||!m)return;const pad=44;const z=Math.min((sc.clientWidth-pad)/(m.w*28),(sc.clientHeight-pad)/(m.h*28));mzSet(z);sc.scrollLeft=0;sc.scrollTop=0}
ACT.tZoom=el=>mzSet(T.zoom+(+el.dataset.d)*(T.zoom>=1?.25:.15));
ACT.mzIn=()=>mzSet(T.zoom*1.25);ACT.mzOut=()=>mzSet(T.zoom/1.25);ACT.mzFit=()=>mzFit();ACT.mz100=()=>mzSet(1);
function mzLabel(){const l=$('#mzCtl .mz-v');if(l)l.textContent=Math.round(T.zoom*100)+'%'}
function mzEnsure(){const sc=$('#mapScroll');if(!sc)return;const host=sc.parentElement;if(!host)return;host.classList.add('mz-host');
 if(!host.querySelector(':scope>#mzCtl'))host.insertAdjacentHTML('beforeend',`<div id="mzCtl" class="mz-ctl" role="group" aria-label="Zoom do mapa"><button data-act="mzOut" title="Afastar (Ctrl + roda do mouse)">−</button><button class="mz-v" data-act="mz100" title="Voltar para 100%">100%</button><button data-act="mzIn" title="Aproximar (Ctrl + roda do mouse)">+</button><button data-act="mzFit" title="Ver o mapa inteiro">⤢</button></div>`);
 mzLabel();mzPlace();if(!sc._mz){sc._mz=1;mzBind(sc)}}
/* fica no canto da área do mapa (não em cima das dicas embaixo dele) */
function mzPlace(){const sc=$('#mapScroll'),c=$('#mzCtl');if(!sc||!c)return;const h=c.parentElement.getBoundingClientRect(),r=sc.getBoundingClientRect();c.style.bottom=Math.max(8,h.bottom-r.bottom+12)+'px';c.style.right=Math.max(8,h.right-r.right+12)+'px'}
addEventListener('resize',debounce(mzPlace,150));
{const _re=redrawEditor;redrawEditor=function(){const r=_re.apply(this,arguments);try{mzEnsure()}catch{}return r}}
{const _rp=redrawPlay;redrawPlay=function(){const r=_rp.apply(this,arguments);try{mzEnsure()}catch{}return r}}

/* pinça (dois dedos) e Ctrl + roda */
function mzBind(sc){const pts=new Map();let pz=null,blocked=new Set(),undo0=0;
 const dist=()=>{const [a,b]=[...pts.values()];return Math.hypot(a.x-b.x,a.y-b.y)},mid=()=>{const [a,b]=[...pts.values()];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
 sc.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;if(!pts.size)undo0=(T.undo||[]).length;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2){e.stopImmediatePropagation();e.preventDefault();
   // o primeiro dedo pode ter começado a desenhar: desfaz esse começo
   if(T.mode==='master'&&T.view!=='play'&&T.edit&&(T.undo||[]).length>undo0){const s=T.undo.pop();try{Object.assign(T.edit,JSON.parse(s))}catch{}}
   T.dragTok=null;pts.forEach((v,k)=>blocked.add(k));const cv=$('#mapC'),tc=$('#tokC'),m=mid();
   pz={d0:dist(),z0:T.zoom,w:cv?cv.getBoundingClientRect().width:0,h:cv?cv.getBoundingClientRect().height:0,fx:m.x,fy:m.y,s:1,tw:tc?tc.style.width:'',th:tc?tc.style.height:''};
   if(T.mode==='master'&&T.view!=='play')redrawEditor()}
  else if(pz){e.stopImmediatePropagation();blocked.add(e.pointerId)}},{capture:true,passive:false});
 sc.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.get(e.pointerId).x=e.clientX;pts.get(e.pointerId).y=e.clientY;
  if(blocked.has(e.pointerId))e.stopImmediatePropagation();
  if(pz&&pts.size===2){e.preventDefault();const s=clamp(dist()/Math.max(1,pz.d0),MZ_MIN/pz.z0,MZ_MAX/pz.z0);pz.s=s;
   // prévia rápida: só estica o desenho; o mapa é redesenhado ao soltar
   const cv=$('#mapC'),tc=$('#tokC');if(cv){cv.style.width=pz.w*s+'px';cv.style.height=pz.h*s+'px'}if(tc){tc.style.width=pz.w*s+'px';tc.style.height=pz.h*s+'px'}const st=cv&&cv.parentElement;if(st&&st.classList.contains('mapstack')){st.style.width=pz.w*s+'px';st.style.height=pz.h*s+'px'}}},{capture:true,passive:false});
 const end=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(blocked.has(e.pointerId)){e.stopImmediatePropagation();blocked.delete(e.pointerId)}
  if(pz&&pts.size<2){const p=pz;pz=null;const st=$('#mapC')&&$('#mapC').parentElement;if(st&&st.classList.contains('mapstack')){st.style.width='';st.style.height=''}
   const cv=$('#mapC');if(cv){cv.style.width=p.w+'px';cv.style.height=p.h+'px'}mzSet(p.z0*p.s,p.fx,p.fy)}};
 sc.addEventListener('pointerup',end,{capture:true});sc.addEventListener('pointercancel',end,{capture:true});
 sc.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();const f=Math.exp(-e.deltaY*(e.deltaMode===1?.05:.0025));mzSet(T.zoom*f,e.clientX,e.clientY)},{passive:false});
 // gesto nativo do Safari (trackpad/iPhone)
 sc.addEventListener('gesturestart',e=>e.preventDefault());sc.addEventListener('gesturechange',e=>e.preventDefault())}
