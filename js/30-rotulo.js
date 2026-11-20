/* ============ v35: rótulo do capítulo editável ("Capítulo 1" → "Prólogo", "Epílogo", "Interlúdio"… ou nada) ============
   Fica em p.chapters[i].kicker (texto; "" = sem rótulo). Capítulos com rótulo próprio não entram na contagem:
   Prólogo, Capítulo 1, Capítulo 2… Vale no editor, no sumário, no PDF/Word/EPUB/TXT/Markdown e no leitor de Explorar. */
const chMeta=id=>{const p=P();return p&&(p.chapters||[]).find(c=>c.id===id)};
const chKick=c=>(c&&typeof c.kicker==='string')?c.kicker:undefined;
function kickTxt(c){if(c&&c.kick!=null)return c.kick;if(P()&&P().type==='rpg')return '';return c&&c.n?'Capítulo '+c.n:''}
function tocPre(c){if(c&&c.kick!=null)return '';if(P()&&P().type==='rpg')return '';return c&&c.n?c.n+'. ':''}
chNum=function(id){const o=bookOrder();let n=0;for(const x of o){const m=chMeta(x.id);const custom=m&&typeof m.kicker==='string';if(x.id===id)return custom?null:n+1;if(!custom)n++}return null};
const KICK_SUG=['Prólogo','Epílogo','Interlúdio','Introdução','Parte única','Nota do autor','Agradecimentos'];
{const _uk=updateKicker;updateKicker=function(){_uk.apply(this,arguments);const k=$('#kicker'),m=S.cid&&chMeta(S.cid);if(!k||!m)return;const w=where(S.cid);if(w.where==='drafts')return;
 if(typeof m.kicker==='string'){k.textContent=(w.folder?w.folder.title+' · ':'')+m.kicker;k.classList.toggle('kick-empty',!m.kicker);if(!m.kicker)k.textContent='+ rótulo'}else k.classList.remove('kick-empty');
 k.classList.add('kick-ed');k.title='Clique para mudar (ex.: Prólogo, Epílogo) ou deixar sem rótulo';if(!k._ked){k._ked=1;k.addEventListener('click',kickEdit)}}}
function kickEdit(){const k=$('#kicker'),m=S.cid&&chMeta(S.cid);if(!k||!m||k.isContentEditable||where(S.cid).where==='drafts')return;if($('#page')&&$('#page').contentEditable==='false'&&typeof colCanEdit==='function'&&S.col&&!colCanEdit())return;
 const auto=(P().type==='rpg'?'Seção ':'Capítulo '),cur=typeof m.kicker==='string'?m.kicker:k.textContent.replace(/^.* · /,'');
 k.textContent=cur;k.contentEditable='true';k.classList.remove('kick-empty');k.focus();const r=document.createRange();r.selectNodeContents(k);const s=getSelection();s.removeAllRanges();s.addRange(r);
 const pop=document.createElement('div');pop.className='kick-pop';pop.innerHTML=KICK_SUG.map(x=>`<button data-k="${esc(x)}">${esc(x)}</button>`).join('')+`<button data-k="" class="kp-none">Sem rótulo</button><button data-auto="1" class="kp-auto">↺ Número automático</button>`;
 k.insertAdjacentElement('afterend',pop);let done=false;
 const finish=(val,autoN)=>{if(done)return;done=true;pop.remove();k.contentEditable='false';
  if(autoN)delete m.kicker;else{const v=String(val).replace(/\s+/g,' ').trim().slice(0,40);if(/^(cap[ií]tulo|se[cç][aã]o)\s*\d+$/i.test(v))delete m.kicker;else m.kicker=v}
  saveProject();try{renderChList()}catch{}updateKicker()};
 pop.addEventListener('mousedown',e=>e.preventDefault());pop.addEventListener('pointerdown',e=>e.preventDefault());
 pop.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.auto)finish('',true);else finish(b.dataset.k,false)});
 const kd=e=>{if(e.key==='Enter'){e.preventDefault();finish(k.textContent)}else if(e.key==='Escape'){e.preventDefault();done=true;pop.remove();k.contentEditable='false';updateKicker()}};
 k.addEventListener('keydown',kd);k.addEventListener('blur',()=>{setTimeout(()=>finish(k.textContent),120)},{once:true})}
