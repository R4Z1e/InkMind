/* ============ v36: prévia de impressão no celular ============
   O painel de ajustes vira uma faixa que recolhe (toque em "Ajustes de impressão") e que dá para
   arrastar pela alça para ficar do tamanho que a pessoa quiser. A folha ganha pinça com dois dedos. */
const PV_MOB=()=>matchMedia('(max-width:760px)').matches;
const pvSt=()=>{try{return JSON.parse(localStorage['ink.pvSide']||'null')||{min:true}}catch{return {min:true}}};
const pvStSave=v=>{try{localStorage['ink.pvSide']=JSON.stringify(v)}catch{}};
{const _r=RENDER.print;RENDER.print=function(...a){const r=_r.apply(this,a);try{pvSideUI()}catch(e){console.error(e)}return r}}
function pvSum(){const c=prCfg();const pg=PAGES[c.page],mg=c.mg==='custom'?'Personalizada':(MARGINS[c.mg]||['—'])[0].split(' — ')[0];return `${pg?pg.l:''} · ${mg} · ${c.pt} pt`}
function pvApply(st){const pv=$('.pv'),side=$('.pv-side');if(!pv||!side)return;pv.classList.toggle('pv-min',!!st.min);side.style.maxHeight=(!st.min&&st.h)?st.h+'px':'';const f=$('#pvFold');if(f)f.setAttribute('aria-expanded',String(!st.min));setTimeout(()=>{if(!S.pvZoom)pvZoomApply()},50)}
function pvSideUI(){const pv=$('.pv'),side=$('.pv-side'),main=$('.pv-main');if(!pv||!side||!main||$('#pvFold'))return;
 side.insertAdjacentHTML('afterbegin',`<button class="pv-fold" id="pvFold" aria-expanded="false"><span>🖨 Ajustes de impressão</span><span class="pv-sum" id="pvSumT">${esc(pvSum())}</span><span class="chev">▾</span></button>`);
 main.insertAdjacentHTML('afterbegin','<div class="pv-grip" id="pvGrip" title="Arraste para aumentar ou diminuir os ajustes · toque para recolher"><span></span></div>');
 const st=pvSt();pvApply(st);
 side.addEventListener('change',()=>{const t=$('#pvSumT');if(t)t.textContent=pvSum()});side.addEventListener('input',()=>{const t=$('#pvSumT');if(t)t.textContent=pvSum()});
 const toggle=()=>{const s=pvSt();s.min=!s.min;pvStSave(s);pvApply(s);if(!s.min)side.scrollTop=0};
 $('#pvFold').onclick=toggle;
 const g=$('#pvGrip');let y0=0,h0=0,moved=false,on=false;
 g.addEventListener('pointerdown',e=>{on=true;moved=false;y0=e.clientY;h0=side.getBoundingClientRect().height;try{g.setPointerCapture(e.pointerId)}catch{}e.preventDefault()});
 g.addEventListener('pointermove',e=>{if(!on)return;const dy=e.clientY-y0;if(Math.abs(dy)>5)moved=true;if(!moved)return;const h=h0+dy,s=pvSt();
  if(h<90){if(!s.min){s.min=true;pvStSave(s);pvApply(s)}}else{s.min=false;s.h=Math.round(clamp(h,120,innerHeight*.8));pvStSave(s);pvApply(s)}});
 const up=()=>{if(!on)return;on=false;if(!moved)toggle();else if(!S.pvZoom)pvZoomApply()};g.addEventListener('pointerup',up);g.addEventListener('pointercancel',()=>{on=false});
 pvPinch()}
/* pinça com dois dedos na folha (o zoom gira em volta dos dedos) */
function pvPinch(){const sc=$('#pvScroll');if(!sc||sc._pinch)return;sc._pinch=1;let d0=0,z0=1,cx=0,cy=0;
 const mid=t=>[(t[0].clientX+t[1].clientX)/2,(t[0].clientY+t[1].clientY)/2],dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 sc.addEventListener('touchstart',e=>{if(e.touches.length===2){d0=dist(e.touches);z0=S.pvZoom||pvFit();const r=sc.getBoundingClientRect(),[mx,my]=mid(e.touches);cx=mx-r.left;cy=my-r.top}},{passive:true});
 sc.addEventListener('touchmove',e=>{if(e.touches.length!==2||!d0)return;e.preventDefault();const zOld=S.pvZoom||pvFit(),z=clamp(z0*dist(e.touches)/d0,.2,2.5);if(Math.abs(z-zOld)<.005)return;
  const px=(sc.scrollLeft+cx)/zOld,py=(sc.scrollTop+cy)/zOld;S.pvZoom=z;pvZoomApply();sc.scrollLeft=px*z-cx;sc.scrollTop=py*z-cy},{passive:false});
 const end=e=>{if(e.touches.length<2)d0=0};sc.addEventListener('touchend',end);sc.addEventListener('touchcancel',end)}
addEventListener('resize',()=>{if(S.view==='print'&&!S.pvZoom)pvZoomApply()});
