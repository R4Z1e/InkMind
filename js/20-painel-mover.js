/* ============ v26: painel de status retrátil e ajustável · ferramenta Mover no editor de mapa ============ */
const STW_KEY='ink-stw',STC_KEY='ink-stc';
const stGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch{return d}};
const stSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const stDesk=()=>matchMedia('(min-width:861px)').matches;
function stApply(){const b=$('#tBody');if(!b||!$('#tPanel'))return;const side=T.mode==='player'?'right':'left';
 const w=clamp(+stGet(STW_KEY+'-'+side,side==='right'?300:310)||300,220,560),col=stGet(STC_KEY+'-'+side,'0')==='1';
 b.style.setProperty('--stw',w+'px');b.classList.toggle('stc',col);b.dataset.side=side;
 let h=b.querySelector(':scope>.st-grip');if(!h){b.insertAdjacentHTML('beforeend',`<div class="st-grip" title="Arraste para ajustar a largura · duplo clique volta ao padrão"></div><button class="st-tog" data-act="stToggle"></button>`);h=b.querySelector(':scope>.st-grip');stGrip(h)}
 const t=b.querySelector(':scope>.st-tog');t.innerHTML=col?(side==='right'?'‹':'›')+'<span>📊 Status da mesa</span>':(side==='right'?'›':'‹');t.title=col?'Mostrar o painel de status':'Recolher o painel de status';t.classList.toggle('col',col)}
function stGrip(h){h.addEventListener('pointerdown',e=>{if(!stDesk())return;e.preventDefault();const b=$('#tBody'),side=b.dataset.side,r=b.getBoundingClientRect();try{h.setPointerCapture(e.pointerId)}catch{}b.classList.add('st-drag');
  const mv=ev=>{const w=clamp(Math.round(side==='right'?r.right-ev.clientX:ev.clientX-r.left),220,560);b.style.setProperty('--stw',w+'px');stSet(STW_KEY+'-'+side,w)};
  const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);b.classList.remove('st-drag');try{if(T.view==='play'||T.mtab==='maps')redrawEditor()}catch{}};
  h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)});
 h.addEventListener('dblclick',()=>{const b=$('#tBody'),side=b.dataset.side;stSet(STW_KEY+'-'+side,side==='right'?300:310);stApply()})}
ACT.stToggle=()=>{const b=$('#tBody');if(!b)return;const side=b.dataset.side||'right',k=STC_KEY+'-'+side;stSet(k,stGet(k,'0')==='1'?'0':'1');stApply();try{if(T.mode==='master'&&T.mtab==='maps')redrawEditor()}catch{}};
{const _rts=renderTableShell;renderTableShell=function(){const r=_rts.apply(this,arguments);try{if(T.view!=='play')stApply()}catch(e){console.warn(e)}return r}}

/* ---- Mover objetos, textos, início e saques no editor de mapa ---- */
{const i=MTOOLS.findIndex(t=>t[0]==='hand');if(i>=0)MTOOLS[i]=['hand','✋','Navegar'];const j=MTOOLS.findIndex(t=>t[0]==='stamp');if(j>=0&&!MTOOLS.some(t=>t[0]==='move'))MTOOLS.splice(j,0,['move','✥','Mover'])}
function mvHit(m,x,y){
 const ob=[...(m.objs||[])].reverse().find(o=>o.x===x&&o.y===y);if(ob)return{k:'obj',it:ob};
 const lt=(m.loot||[]).find(o=>o.x===x&&o.y===y);if(lt)return{k:'loot',it:lt};
 if(m.spawn&&m.spawn.x===x&&m.spawn.y===y)return{k:'spawn',it:m.spawn};
 const lb=[...(m.labels||[])].reverse().find(l=>l.y===y&&Math.abs(x-l.x)<=Math.max(0,Math.round(String(l.t||'').length*.15)));if(lb)return{k:'label',it:lb};
 return null}
{const _ed=editorDown;editorDown=function(m,x,y){if(T.tool!=='move')return _ed.apply(this,arguments);
 const h=mvHit(m,x,y);if(!h){T.mv=null;toast('Clique e arraste um objeto, texto, ⭐ início ou saque para mudar de lugar.');return}
 pushUndo(m);T.mv={...h,ox:x-h.it.x,oy:y-h.it.y,x0:h.it.x,y0:h.it.y,moved:false}}}
{const _em=editorMove;editorMove=function(m,x,y){if(T.tool!=='move')return _em.apply(this,arguments);const v=T.mv;if(!v)return;
 const nx=clamp(x-v.ox,0,m.w-1),ny=clamp(y-v.oy,0,m.h-1);if(nx===v.it.x&&ny===v.it.y)return;v.it.x=nx;v.it.y=ny;v.moved=true}}
{const _eu=editorUp;editorUp=function(m){if(T.tool!=='move')return _eu.apply(this,arguments);const v=T.mv;T.mv=null;if(!v)return;
 if(v.moved){if(v.k==='obj')m.objs=m.objs.filter(o=>o===v.it||!(o.x===v.it.x&&o.y===v.it.y));mapDirty();return}
 T.undo.pop();if(v.k==='label')mvEditLabel(m,v.it)}}
async function mvEditLabel(m,l){const r=await modal({title:'🔤 Texto no mapa',body:`<label class="f">Texto</label><input id="mlT" maxlength="40" value="${esc(l.t||'')}">`,onMount:ov=>{const i=$('#mlT',ov);i.focus();i.select()},
  actions:[{label:'Apagar',value:'del'},{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>({t:$('#mlT',ov).value.trim()})}]});
 if(!r)return;pushUndo(m);if(r==='del'||!r.t)m.labels=m.labels.filter(x=>x!==l);else l.t=r.t.slice(0,40);mapDirty();redrawEditor()}
{const _mt=ACT.mTool;ACT.mTool=function(el){const r=_mt.apply(this,arguments);const c=$('#mapC');if(c)c.classList.toggle('mover',T.tool==='move');if(T.tool==='move')toast('Mover: arraste objetos, textos, ⭐ início ou saques. Clique num texto para editar.');return r}}
