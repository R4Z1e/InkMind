/* ============ v16: ferramentas do Word — localizar, link, cores, tabela, notas, quebra de página… ============ */
Object.assign(ICONS,{
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 tbl:'<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 10h18M3 14.5h18M9 5v14M15 5v14"/>',
 hl:'<path d="m14 4 6 6-8 8H8v-4z"/><path d="M4 21h9"/>',
 find:'<circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-5-5"/><path d="M8 10.5h5"/>',
 pgb:'<path d="M6 3v6h12V3M6 21v-6h12v6"/><path d="M3 12h3M9 12h2M13 12h2M18 12h3"/>',
 indR:'<path d="M4 5h16M10 10h10M10 14h10M4 19h16"/><path d="m4 9 3 3-3 3"/>',
 indL:'<path d="M4 5h16M10 10h10M10 14h10M4 19h16"/><path d="M7 9l-3 3 3 3"/>'
});

/* ---------- sanitização: cores, recuo, notas, quebra de página ---------- */
['pgbreak','fn','fnotes','fnp','fnh','fnr'].forEach(c=>OK_CLASSES.add(c));
if(!SAN.ALLOWED_ATTR.includes('title'))SAN.ALLOWED_ATTR.push('title');
if(!SAN.ALLOWED_ATTR.includes('id'))SAN.ALLOWED_ATTR.push('id');
let CLEAN_PASTE=false;
const COLRE='(#[0-9a-f]{3,8}|rgba?\\([\\d\\s.,%]+\\))';
if(window.DOMPurify){
 DOMPurify.removeHook('uponSanitizeAttribute');
 DOMPurify.addHook('uponSanitizeAttribute',(node,data)=>{
  if(data.attrName==='style'){const v=data.attrValue,out=[];
   const a=/text-align\s*:\s*(left|right|center|justify)/i.exec(v);if(a)out.push('text-align:'+a[1].toLowerCase());
   const w=/(?:^|;)\s*width\s*:\s*(\d{1,3})%/i.exec(v);if(w&&node.nodeName==='IMG')out.push('width:'+clamp(+w[1],5,100)+'%');
   if(!CLEAN_PASTE){
    const col=new RegExp('(?:^|;)\\s*color\\s*:\\s*'+COLRE,'i').exec(v);if(col&&node.nodeName==='SPAN')out.push('color:'+col[1]);
    const bg=new RegExp('background(?:-color)?\\s*:\\s*'+COLRE,'i').exec(v);if(bg&&node.nodeName==='SPAN'&&!/rgba\([^)]*,\s*0\s*\)/.test(bg[1]))out.push('background-color:'+bg[1]);
    const ml=/margin-left\s*:\s*(\d+(?:\.\d+)?)em/i.exec(v);if(ml&&/^(P|H[1-6]|BLOCKQUOTE)$/.test(node.nodeName)&&+ml[1]>0)out.push('margin-left:'+Math.min(+ml[1],10)+'em');
   }
   if(out.length)data.attrValue=out.join(';');else data.keepAttr=false;
  }
  if(data.attrName==='class'){const c=data.attrValue.split(/\s+/).filter(x=>OK_CLASSES.has(x));if(c.length)data.attrValue=c.join(' ');else data.keepAttr=false}
  if(data.attrName==='id'&&!/^[nr]-[\w-]+$/.test(data.attrValue))data.keepAttr=false;
 });
}
function cleanPaste(h){CLEAN_PASTE=true;try{return clean(h)}finally{CLEAN_PASTE=false}}
{const _p=proseCSS;proseCSS=function(s,root,px){return _p(s,root,px)+`
${root} a{color:inherit;text-decoration:underline}
${root} sup,${root} sub{line-height:0;font-size:.72em}
${root} hr.pgbreak{border:0;height:0;margin:0;break-after:page;page-break-after:always}${root} hr.pgbreak::before{content:none}
${root} table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.92em;line-height:1.4}${root} th,${root} td{border:1px solid rgba(110,100,90,.55);padding:.35em .55em;text-align:left;vertical-align:top}${root} th{background:rgba(120,100,80,.12);font-weight:700}${root} td p,${root} th p{text-indent:0;margin:0}
${root} .fnotes{margin-top:2em;padding-top:.6em;border-top:1px solid rgba(120,110,100,.5);font-size:.85em}${root} .fnotes .fnh{font-weight:700;text-indent:0;margin-bottom:.3em}${root} .fnotes .fnp{text-indent:0;margin:0 0 .25em;text-align:left}${root} .fnr a{text-decoration:none}
`}}

/* ---------- utilidades de seleção ---------- */
function edRange(){const page=$('#page'),s=getSelection();if(!page||!s.rangeCount)return null;const r=s.getRangeAt(0);return page.contains(r.commonAncestorContainer)?r:null}
function inEditorSel(){const r=edRange();return !!(r&&!r.collapsed&&document.activeElement===$('#page'))}
function blocksInRange(r){const page=$('#page');const out=[];$$('p,h1,h2,h3,h4,blockquote,li',page).forEach(b=>{if(r.intersectsNode(b)&&!b.closest('table,aside.statblock')&&!b.querySelector('p,h1,h2,h3,h4,li'))out.push(b)});return out}
const edCmd=(c,v=null)=>{restoreSel();document.execCommand('styleWithCSS',false,['foreColor','hiliteColor'].includes(c));document.execCommand(c,false,v);document.execCommand('styleWithCSS',false,false);markDirty();syncToolbar();saveSel()};

/* ---------- cor do texto e realce ---------- */
const TXT_COLORS=[['#c0392b','Vermelho'],['#d35400','Laranja'],['#b7950b','Dourado'],['#1e8449','Verde'],['#117a65','Verde-água'],['#2471a3','Azul'],['#7d3c98','Roxo'],['#a04070','Rosa'],['#7f8c8d','Cinza'],['#6e4b2a','Marrom']];
const HL_COLORS=[['#fff176','Amarelo'],['#a5d6a7','Verde'],['#90caf9','Azul'],['#f48fb1','Rosa'],['#ffcc80','Laranja'],['#ce93d8','Lilás']];
function stripStyleProp(prop){
 const mark='#010203';edCmd(prop==='color'?'foreColor':'hiliteColor',mark);
 const page=$('#page');$$('span[style]',page).forEach(sp=>{const v=sp.style.getPropertyValue(prop);if(/rgb\(1,\s*2,\s*3\)/.test(v)){sp.style.removeProperty(prop);if(!sp.getAttribute('style'))sp.replaceWith(...sp.childNodes)}});
 $$('font[color="#010203"]',page).forEach(f=>f.replaceWith(...f.childNodes));markDirty();
}
const swatches=(list,kind)=>list.map(([c,t])=>({g:`<span class="ik-swc" style="background:${c}"></span>`,t,run:()=>{S.prefs['last_'+kind]=c;edCmd(kind==='color'?'foreColor':'hiliteColor',c);updColorBtns()}}));
function updColorBtns(){const a=$('#tbCol i.bar'),h=$('#tbHl i.bar');if(a)a.style.background=S.prefs.last_color||'#c0392b';if(h)h.style.background=S.prefs.last_hl||'#fff176'}
TBM.color=()=>[...swatches(TXT_COLORS,'color'),'-',{i:'⊘',t:'Automático',d:'Volta à cor normal do texto',run:()=>stripStyleProp('color')}];
TBM.hl=()=>[...swatches(HL_COLORS,'hl'),'-',{i:'⊘',t:'Sem realce',run:()=>stripStyleProp('background-color')}];

/* ---------- maiúsculas / minúsculas ---------- */
const CASES={up:['MAIÚSCULAS',t=>t.toLocaleUpperCase('pt-BR')],low:['minúsculas',t=>t.toLocaleLowerCase('pt-BR')],title:['Primeira Letra De Cada Palavra',t=>t.toLocaleLowerCase('pt-BR').replace(/(^|[^\p{L}’'])(\p{L})/gu,(m,a,b)=>a+b.toLocaleUpperCase('pt-BR'))],sent:['Primeira letra da frase',t=>t.toLocaleLowerCase('pt-BR').replace(/(^\s*|[.!?…]\s+)(\p{L})/gu,(m,a,b)=>a+b.toLocaleUpperCase('pt-BR'))]};
function changeCase(k){restoreSel();const r=edRange();if(!r||r.collapsed){toast('Selecione o texto primeiro.');return}const f=CASES[k][1];
 if(r.startContainer===r.endContainer&&r.startContainer.nodeType===3){document.execCommand('insertText',false,f(r.toString()));}
 else{const it=document.createTreeWalker(r.commonAncestorContainer,NodeFilter.SHOW_TEXT);const ns=[];let n;while(n=it.nextNode())if(r.intersectsNode(n))ns.push(n);
  ns.forEach(n=>{const s=n===r.startContainer?r.startOffset:0,e=n===r.endContainer?r.endOffset:n.data.length;n.data=n.data.slice(0,s)+f(n.data.slice(s,e))+n.data.slice(e)})}
 markDirty()}
let caseCycle=0;
function cycleCase(){const r=edRange();if(!r||r.collapsed)return;const t=r.toString();const k=t===t.toLocaleUpperCase('pt-BR')?'low':t===t.toLocaleLowerCase('pt-BR')?'title':'up';saveSel();changeCase(k)}

/* ---------- recuo ---------- */
function indentBy(d){restoreSel();const r=edRange();if(!r)return;
 if(r.startContainer.parentElement&&r.startContainer.parentElement.closest('li')||(r.startContainer.closest&&r.startContainer.closest('li'))){document.execCommand(d>0?'indent':'outdent');markDirty();return}
 blocksInRange(r).forEach(b=>{if(b.tagName==='LI')return;const cur=parseFloat(b.style.marginLeft)||0,n=clamp(cur+d*2,0,10);if(n)b.style.marginLeft=n+'em';else{b.style.removeProperty('margin-left');if(!b.getAttribute('style'))b.removeAttribute('style')}});markDirty()}

/* ---------- link ---------- */
function normUrl(u){u=String(u||'').trim();if(!u)return'';if(/^(https?:|mailto:|tel:)/i.test(u))return u;if(/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(u))return 'mailto:'+u;if(/^[\w-]+(\.[\w-]+)+(\/|$|\?)/.test(u))return 'https://'+u;if(/^#/.test(u))return u;return ''}
ACT.insLink=async(el,a0)=>{saveSel();const r=edRange();let a=a0||null;if(!a&&r){const pe=r.startContainer.nodeType===3?r.startContainer.parentElement:r.startContainer;a=pe&&pe.closest?pe.closest('#page a'):null}
 const sel=a?a.textContent:(r?r.toString():'');let T0=sel,U0=a?a.getAttribute('href'):'';
 const v=await modal({title:a?'Editar link':'Inserir link',body:`<label class="f">Texto que aparece</label><input id="lkT" value="${esc(sel)}" placeholder="ex.: site do autor"><label class="f" style="margin-top:10px">Endereço</label><input id="lkU" value="${esc(U0)}" placeholder="https://… ou e-mail"><p class="small muted" style="margin:8px 0 0">No livro impresso o link aparece sublinhado; no EPUB, Word e HTML ele é clicável.</p>`,
  onMount:(ov,close)=>{const t=$('#lkT',ov),u=$('#lkU',ov);t.oninput=()=>T0=t.value;u.oninput=()=>U0=u.value;[t,u].forEach(i=>i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();close('ok')}});setTimeout(()=>(sel?u:t).focus(),30)},
  actions:[{label:'Cancelar'},{label:a?'Salvar':'Inserir',cls:'primary',value:'ok'}]});
 if(v!=='ok')return;const url=normUrl(U0);if(!url){toast('Endereço inválido. Use algo como https://site.com ou um e-mail.','err');return}
 const text=(T0||'').trim()||url.replace(/^mailto:|^https?:\/\//,'');
 if(a){a.setAttribute('href',url);if(a.textContent!==text)a.textContent=text;markDirty();return}
 restoreSel();if(r&&!r.collapsed&&text===sel)document.execCommand('createLink',false,url);else document.execCommand('insertHTML',false,`<a href="${esc(url)}">${esc(text)}</a>&nbsp;`);markDirty();saveSel()};
function linkMenu(a){ikMenu(a,[{i:I('out'),t:'Abrir link',d:a.getAttribute('href'),run:()=>window.open(a.href,'_blank','noopener')},{i:I('pen'),t:'Editar link',run:()=>ACT.insLink(null,a)},{i:'⊘',t:'Remover link',d:'Mantém o texto',run:()=>{a.replaceWith(...a.childNodes);markDirty()}}],{title:'Link'})}

/* ---------- símbolos ---------- */
const SYMS=[['—','Travessão (diálogo)'],['–','Meia-risca'],['…','Reticências'],['«','Aspas angulares'],['»','Aspas angulares'],['“','Aspas curvas'],['”','Aspas curvas'],['‘','Aspas simples'],['’','Apóstrofo'],['•','Marcador'],['·','Ponto médio'],['§','Parágrafo'],['¶','Pilcrow'],['†','Adaga'],['‡','Adaga dupla'],['©','Copyright'],['®','Registrado'],['™','Marca'],['°','Grau'],['º','Ordinal'],['ª','Ordinal'],['±','Mais ou menos'],['×','Vezes'],['÷','Dividido'],['½','Meio'],['¼','Um quarto'],['¾','Três quartos'],['¹','Sobrescrito 1'],['²','Sobrescrito 2'],['³','Sobrescrito 3'],['€','Euro'],['£','Libra'],['¥','Iene'],['←','Seta'],['→','Seta'],['↑','Seta'],['↓','Seta'],['★','Estrela'],['☆','Estrela'],['✦','Estrela de cena'],['♥','Coração'],['♪','Nota musical'],['※','Marca de referência'],['¿','Interrogação invertida'],['¡','Exclamação invertida'],['∞','Infinito'],['≈','Aproximadamente'],['≠','Diferente']];
ACT.insSym=el=>{saveSel();ikMenu(el&&el.getBoundingClientRect?el:$('[data-m=ins]'),SYMS.map(([c,t])=>({g:`<span class="ik-sy">${c}</span>`,t:t+' '+c,run:()=>{restoreSel();document.execCommand('insertText',false,c);markDirty();saveSel()}})),{title:'Símbolos'})};

/* ---------- autocorreção (como no Word) ---------- */
function autoCorrect(e){if(S.prefs.noAuto||e.inputType!=='insertText'||!e.data)return;const s=getSelection();if(!s.isCollapsed||!s.rangeCount)return;const n=s.anchorNode,off=s.anchorOffset;if(!n||n.nodeType!==3)return;
 if(n.parentElement&&n.parentElement.closest('table,.statblock,code'))return;
 const before=n.data.slice(0,off).replace(/\u00a0/g,' ');let k=0,rep=null;const ch=e.data.slice(-1);
 if(ch==='-'&&/--$/.test(before)&&!/---$/.test(before)){k=2;rep='—'}
 else if(ch==='.'&&/\.\.\.$/.test(before)&&!/\.\.\.\.$/.test(before)){k=3;rep='…'}
 else if(ch===' '&&before==='- '){const blk=n.parentElement.closest('p,li,h2,h3,blockquote,div');if(blk&&blk.firstChild===n||blk&&blk.textContent.startsWith('- ')&&blk.firstChild===n){k=2;rep='— '}}
 else if(ch==='"'){const p=before.slice(-2,-1);k=1;rep=(!p||/[\s(\[{—–«“]/.test(p))?'“':'”'}
 else if(ch==="'"){const p=before.slice(-2,-1);k=1;rep=(!p||/[\s(\[{—–«“]/.test(p))?'‘':'’'}
 else if(ch===')'){const m=/\((c|r|tm)\)$/i.exec(before);if(m){k=m[0].length;rep={c:'©',r:'®',tm:'™'}[m[1].toLowerCase()]}}
 if(!rep)return;const r=document.createRange();r.setStart(n,off-k);r.setEnd(n,off);s.removeAllRanges();s.addRange(r);document.execCommand('insertText',false,rep)}

/* ---------- quebra de página ---------- */
ACT.insPgBreak=()=>{insertHTML('<hr class="pgbreak"><p><br></p>');toast('Quebra de página inserida — o texto seguinte começa numa nova folha.')};

/* ---------- tabela ---------- */
ACT.insTable=async()=>{saveSel();let R=3,C=3,H=true;
 const v=await modal({title:'Inserir tabela',body:`<div class="row" style="gap:12px"><div><label class="f">Linhas</label><input type="number" id="tbR" min="1" max="60" value="3" style="width:90px"></div><div><label class="f">Colunas</label><input type="number" id="tbC" min="1" max="10" value="3" style="width:90px"></div></div><label class="toggle" style="margin-top:12px"><input type="checkbox" id="tbH" checked><span class="sw"></span>Primeira linha como cabeçalho</label><p class="small muted" style="margin:8px 0 0">Dentro da tabela: <b>Tab</b> vai para a próxima célula (na última, cria uma linha nova). Uma barrinha aparece em cima da tabela para adicionar ou remover linhas e colunas.</p>`,
  onMount:ov=>{$('#tbR',ov).oninput=e=>R=clamp(+e.target.value||1,1,60);$('#tbC',ov).oninput=e=>C=clamp(+e.target.value||1,1,10);$('#tbH',ov).onchange=e=>H=e.target.checked},actions:[{label:'Cancelar'},{label:'Inserir',cls:'primary',value:'ok'}]});
 if(v!=='ok')return;const cell=t=>`<${t}><br></${t}>`;
 const head=H?`<thead><tr>${Array.from({length:C},(_,i)=>`<th>Coluna ${i+1}</th>`).join('')}</tr></thead>`:'';
 const body=`<tbody>${Array.from({length:H?Math.max(1,R-1):R},()=>`<tr>${Array.from({length:C},()=>cell('td')).join('')}</tr>`).join('')}</tbody>`;
 insertHTML(`<table>${head}${body}</table><p><br></p>`)};
function cellOf(n){const e=n&&(n.nodeType===3?n.parentElement:n);return e&&e.closest?e.closest('#page td,#page th'):null}
function caretTo(el,end){const r=document.createRange();r.selectNodeContents(el);r.collapse(!end);const s=getSelection();s.removeAllRanges();s.addRange(r)}
function tblOp(op){const r=edRange()||savedRange;const c=r&&cellOf(r.startContainer);if(!c)return;const tr=c.parentElement,tb=c.closest('table'),ci=[...tr.children].indexOf(c);
 const rows=[...tb.rows];
 if(op==='rowAdd'){const n=document.createElement('tr');for(let i=0;i<tr.children.length;i++){const d=document.createElement('td');d.innerHTML='<br>';n.appendChild(d)}if(tr.parentElement.tagName==='THEAD'){let b=tb.tBodies[0];if(!b){b=document.createElement('tbody');tb.appendChild(b)}b.insertBefore(n,b.firstChild)}else tr.after(n);caretTo(n.children[Math.min(ci,n.children.length-1)])}
 if(op==='colAdd'){rows.forEach(row=>{const ref=row.children[ci];const d=document.createElement(row.parentElement.tagName==='THEAD'?'th':'td');d.innerHTML=row.parentElement.tagName==='THEAD'?'Coluna':'<br>';ref?ref.after(d):row.appendChild(d)})}
 if(op==='rowDel'){if(rows.length<=1){tb.remove()}else{const nx=tr.nextElementSibling||tr.previousElementSibling;tr.remove();if(!tb.tHead||tb.tHead.rows.length===0)tb.tHead&&tb.tHead.remove();if(nx&&nx.children[ci])caretTo(nx.children[ci])}}
 if(op==='colDel'){if(tr.children.length<=1){tb.remove()}else rows.forEach(row=>{row.children[ci]&&row.children[ci].remove()})}
 if(op==='head'){if(tb.tHead){const h=tb.tHead,row=h.rows[0];const n=document.createElement('tr');[...row.children].forEach(x=>{const d=document.createElement('td');d.innerHTML=x.innerHTML;n.appendChild(d)});let b=tb.tBodies[0];if(!b){b=document.createElement('tbody');tb.appendChild(b)}b.insertBefore(n,b.firstChild);h.remove()}else{const first=rows[0];if(first){const h=document.createElement('thead'),n=document.createElement('tr');[...first.children].forEach(x=>{const d=document.createElement('th');d.innerHTML=x.innerHTML;n.appendChild(d)});h.appendChild(n);tb.insertBefore(h,tb.firstChild);first.remove()}}}
 if(op==='del'){const p=document.createElement('p');p.innerHTML='<br>';tb.replaceWith(p);caretTo(p)}
 markDirty();showTBar()}
let TBAR=null;
function showTBar(){const r=edRange();const c=r&&cellOf(r.startContainer);const tb=c&&c.closest('table');
 if(!tb){if(TBAR)TBAR.style.display='none';return}
 if(!TBAR){TBAR=document.createElement('div');TBAR.className='ik-tbar';TBAR.innerHTML=[['rowAdd','+ Linha','Adicionar linha abaixo'],['colAdd','+ Coluna','Adicionar coluna à direita'],['rowDel','− Linha','Remover linha'],['colDel','− Coluna','Remover coluna'],['head','Cabeçalho','Ligar/desligar linha de cabeçalho'],['del','🗑','Excluir tabela']].map(([k,l,t])=>`<button data-tb="${k}" title="${t}">${l}</button>`).join('');document.body.appendChild(TBAR);
  TBAR.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')e.preventDefault()});TBAR.addEventListener('click',e=>{const b=e.target.closest('[data-tb]');if(b){saveSel();tblOp(b.dataset.tb)}})}
 const rc=tb.getBoundingClientRect(),st=$('#scroller').getBoundingClientRect();TBAR.style.display='flex';let y=rc.top-TBAR.offsetHeight-6;if(y<st.top+2)y=Math.min(rc.bottom+6,st.bottom-40);TBAR.style.top=y+'px';TBAR.style.left=Math.max(8,Math.min(rc.left,innerWidth-TBAR.offsetWidth-8))+'px'}
document.addEventListener('selectionchange',()=>{if($('#page'))showTBar();else if(TBAR)TBAR.style.display='none'});

/* ---------- notas de rodapé ---------- */
function renumberNotes(){const page=$('#page');if(!page)return;const ns=$$('sup.fn',page);ns.forEach((s,i)=>{if(s.textContent!==String(i+1))s.textContent=i+1;s.contentEditable='false'});
 const box=$('#fnList');if(!box)return;box.style.display=ns.length?'':'none';box.innerHTML=ns.length?`<div class="fnl-h">Notas deste capítulo <span class="muted small">— no PDF e na impressão vão para o pé da página; no Word viram notas de rodapé</span></div>`+ns.map((s,i)=>`<p data-fni="${i}"><b>${i+1}.</b> ${esc(s.title||'(vazia)')}</p>`).join(''):''}
ACT.insNote=async(el,s0)=>{saveSel();let txt=s0?s0.title:'';
 const v=await modal({title:s0?'Editar nota':'Nota de rodapé',body:`<label class="f">Texto da nota</label><textarea id="fnT" rows="4" placeholder="Explicação, fonte, tradução…">${esc(txt)}</textarea><p class="small muted" style="margin:8px 0 0">O número é colocado onde está o cursor e se reorganiza sozinho. No PDF e na impressão a nota vai para o pé da página; no Word vira nota de rodapé; no EPUB e HTML fica no fim do capítulo.</p>`,
  onMount:ov=>{const t=$('#fnT',ov);t.oninput=()=>txt=t.value;setTimeout(()=>t.focus(),30)},actions:[{label:'Cancelar'},{label:s0?'Salvar':'Inserir nota',cls:'primary',value:'ok'}]});
 if(v!=='ok'||!txt.trim())return;
 if(s0){s0.title=txt.trim();markDirty();renumberNotes();return}
 restoreSel();const s=getSelection();if(!s.rangeCount)return;s.collapseToEnd();let r=s.getRangeAt(0);const page=$('#page');let host=r.startContainer.nodeType===3?r.startContainer.parentElement:r.startContainer;if(host===page){const pp=page.children[r.startOffset-1]||page.lastElementChild;if(pp&&/^(P|H[1-6]|LI|BLOCKQUOTE)$/.test(pp.tagName)){r=document.createRange();r.selectNodeContents(pp);r.collapse(false)}}const sp=document.createElement('sup');sp.className='fn';sp.contentEditable='false';sp.title=txt.trim();sp.textContent='0';r.insertNode(sp);const a2=document.createRange();a2.setStartAfter(sp);a2.collapse(true);s.removeAllRanges();s.addRange(a2);markDirty();renumberNotes();saveSel()};
function noteMenu(sp){ikMenu(sp,[{i:'📝',t:'Editar nota',d:(sp.title||'').slice(0,60),run:()=>ACT.insNote(null,sp)},{i:'⊘',t:'Remover nota',run:()=>{sp.remove();markDirty();renumberNotes()}}],{title:'Nota '+sp.textContent})}

/* ---------- contagem de palavras ---------- */
ACT.wordCount=async()=>{const page=$('#page');const r=edRange();const stat=t=>({w:countWords(t),c:t.replace(/\s/g,'').length,cs:t.replace(/\n/g,'').length});
 const sel=r&&!r.collapsed?stat(r.toString()):null;const ch=page?stat(page.innerText||''):null;const pars=page?$$('p',page).filter(p=>p.textContent.trim()).length:0;
 const b=busy('Contando o livro…');let bk={w:0,c:0,cs:0},n=0;try{for(const o of bookOrder()){const h=o.id===S.cid&&page?null:(await getChapter(o.id)).html;const t=h==null?(page.innerText||''):htmlText(h);const x=stat(t);bk.w+=x.w;bk.c+=x.c;bk.cs+=x.cs;n++}}finally{b.done()}
 const pc=prCfg(P()),wpp=Math.round(330*(12/pc.pt)**2*(pc.page==='a5'?.5:pc.page==='6x9'?.6:1));
 const row=(l,f)=>`<tr><th>${l}</th>${[sel,ch,bk].map(x=>`<td>${x?fmtN(f(x)):'—'}</td>`).join('')}</tr>`;
 await modal({title:'Contagem de palavras',body:`<table class="ik-wc"><tr><th></th><th>Seleção</th><th>Capítulo</th><th>Livro (${n})</th></tr>${row('Palavras',x=>x.w)}${row('Caracteres sem espaços',x=>x.c)}${row('Caracteres com espaços',x=>x.cs)}<tr><th>Parágrafos</th><td>—</td><td>${fmtN(pars)}</td><td>—</td></tr><tr><th>Páginas (estimativa)</th><td>—</td><td>${ch?Math.max(1,Math.ceil(ch.w/wpp)):'—'}</td><td>≈ ${Math.max(1,Math.ceil(bk.w/wpp))}</td></tr></table><p class="small muted" style="margin:10px 0 0">Estimativa em folha ${PAGES[pc.page].l}, ${String(pc.pt).replace('.',',')} pt. A contagem exata de páginas está em <a href="#" data-act="view" data-v="print">Publicar → Visualizar e PDF</a>.</p>`,actions:[{label:'Fechar',cls:'primary'}]})};

/* ---------- localizar e substituir ---------- */
const FD={q:'',rep:'',cs:false,ww:false,scope:'ch',idx:0,ranges:[]};
function fdRegex(){if(!FD.q)return null;const e=FD.q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp(FD.ww?`(?<![\\p{L}\\p{N}_])${e}(?![\\p{L}\\p{N}_])`:e,'gu'+(FD.cs?'':'i'))}
function findIn(root){const re=fdRegex();if(!re)return[];const BL=/^(P|LI|H[1-6]|BLOCKQUOTE|TD|TH|DIV|ASIDE|FIGCAPTION)$/;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest('sup.fn,.mention,[contenteditable=false]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
 let txt='',map=[],lastB=null,n;while(n=w.nextNode()){let b=n.parentElement;while(b&&b!==root&&!BL.test(b.tagName))b=b.parentElement;if(lastB&&b!==lastB){txt+='\u0001';map.push(null)}lastB=b;for(let i=0;i<n.data.length;i++)map.push([n,i]);txt+=n.data}
 const out=[];let m;while((m=re.exec(txt))){if(!m[0].length){re.lastIndex++;continue}const a=map[m.index],z=map[m.index+m[0].length-1];if(!a||!z)continue;const r=document.createRange();r.setStart(a[0],a[1]);r.setEnd(z[0],z[1]+1);out.push(r)}return out}
const HL_OK=!!(window.CSS&&CSS.highlights&&window.Highlight);
function fdPaint(){if(!HL_OK)return;try{CSS.highlights.set('ik-find',new Highlight(...FD.ranges));const c=FD.ranges[FD.idx];if(c)CSS.highlights.set('ik-cur',new Highlight(c));else CSS.highlights.delete('ik-cur')}catch{}}
function fdClearPaint(){if(HL_OK){CSS.highlights.delete('ik-find');CSS.highlights.delete('ik-cur')}}
function fdRun(keep){const page=$('#page');if(!page)return;FD.ranges=FD.scope==='ch'?findIn(page):[];if(!keep)FD.idx=0;FD.idx=Math.min(FD.idx,Math.max(0,FD.ranges.length-1));fdPaint();fdInfo();if(FD.scope==='book')fdBook()}
function fdInfo(){const i=$('#fdN');if(!i)return;if(FD.scope==='book'){return}i.textContent=!FD.q?'':FD.ranges.length?`${FD.idx+1} de ${FD.ranges.length}`:'Nenhum';i.classList.toggle('none',!!FD.q&&!FD.ranges.length)}
function fdShow(){const r=FD.ranges[FD.idx];if(!r)return;fdPaint();fdInfo();const sc=$('#scroller'),b=r.getBoundingClientRect(),s=sc.getBoundingClientRect();if(b.top<s.top+60||b.bottom>s.bottom-40)sc.scrollTop+=b.top-s.top-s.height/3;
 if(!HL_OK){const sl=getSelection();sl.removeAllRanges();sl.addRange(r)}}
function fdStep(d){if(!FD.ranges.length){fdRun();if(!FD.ranges.length)return}FD.idx=(FD.idx+d+FD.ranges.length)%FD.ranges.length;fdShow()}
function fdReplaceOne(){const r=FD.ranges[FD.idx];if(!r)return;const page=$('#page');page.focus();const s=getSelection();s.removeAllRanges();s.addRange(r);document.execCommand('insertText',false,FD.rep);markDirty();fdRun(true);if(FD.ranges.length)fdShow();$('#fdR')&&$('#fdR').focus()}
function replaceRanges(rs,text){for(let i=rs.length-1;i>=0;i--){const r=rs[i];r.deleteContents();if(text)r.insertNode(document.createTextNode(text))}}
async function fdReplaceAll(){if(!FD.q)return;
 if(FD.scope==='ch'){const page=$('#page'),rs=findIn(page);if(!rs.length){toast('Nada para substituir.');return}await loadSide(S.cid);snapshot(S.cid,page.innerHTML,'Antes de substituir “'+FD.q+'”');replaceRanges(rs,FD.rep);page.normalize();markDirty();fdRun();toast(`${rs.length} substituição(ões) neste capítulo. A versão anterior ficou salva em Revisar → Versões.`);return}
 const res=await fdBookScan();const tot=res.reduce((a,x)=>a+x.n,0);if(!tot){toast('Nada para substituir.');return}
 if(!await confirmDlg(`Substituir ${tot} ocorrência(s) de “${FD.q}” por “${FD.rep}” em ${res.filter(x=>x.n).length} capítulo(s)? Uma versão de cada capítulo é salva antes.`,'Substituir tudo'))return;
 const b=busy('Substituindo…');try{await flushChapter();for(const x of res){if(!x.n)continue;const d=await getChapter(x.id);const root=document.createElement('div');root.innerHTML=d.html;const rs=findIn(root);if(!rs.length)continue;await loadSide(x.id);snapshot(x.id,d.html,'Antes de substituir “'+FD.q+'”');replaceRanges(rs,FD.rep);root.normalize();const html=root.innerHTML;S.cache[x.id]={html,notes:d.notes||''};queueWrite('c_'+x.id,{kind:'chapter',pid:P().id,id:x.id,html,notes:d.notes||'',updatedAt:Date.now()});const c=cm(x.id);if(c)c.words=countWords(htmlText(html));
   if(x.id===S.cid&&$('#page')){$('#page').innerHTML=html;S.chDirty=false;renumberNotes()}}saveProject();renderChList()}finally{b.done()}
 toast(`${tot} substituição(ões) no livro.`);fdRun()}
async function fdBookScan(){await flushChapter();const p=P(),ids=[...bookOrder().map(o=>o.id),...(p.drafts||[])];const out=[];for(const id of ids){const d=await getChapter(id);const root=document.createElement('div');root.innerHTML=d.html||'';const rs=findIn(root);out.push({id,n:rs.length,ctx:rs[0]?ctxOf(rs[0]):''})}return out}
function ctxOf(r){const t=(r.startContainer.data||'');const a=Math.max(0,r.startOffset-30);return (a?'…':'')+t.slice(a,r.startOffset)+'⟦'+r.toString()+'⟧'+t.slice(r.startOffset+r.toString().length,r.startOffset+r.toString().length+40)+'…'}
let FDSEQ=0;
async function fdBook(){const box=$('#fdBk'),i=$('#fdN');if(!box)return;const seq=++FDSEQ;if(!FD.q){box.innerHTML='';i.textContent='';return}i.textContent='Buscando…';const res=await fdBookScan();if(seq!==FDSEQ)return;
 const hit=res.filter(x=>x.n),tot=hit.reduce((a,x)=>a+x.n,0);i.textContent=tot?`${tot} em ${hit.length} capítulo(s)`:'Nenhum';i.classList.toggle('none',!tot);
 box.innerHTML=hit.map(x=>{const c=cm(x.id);return `<button data-fdc="${x.id}"><b>${esc(chNum(x.id)?chNum(x.id)+'. ':'')}${esc(c?c.title:'')}</b><span class="muted">${x.n}×</span><small>${esc(x.ctx).replace('⟦','<mark>').replace('⟧','</mark>')}</small></button>`}).join('');
 $$('[data-fdc]',box).forEach(b=>b.onclick=async()=>{FD.scope='ch';await openChapter(b.dataset.fdc);fdOpen(false);fdRun();fdShow()})}
function fdOpen(rep){if(S.view!=='write'){showView('write').then(()=>fdOpen(rep));return}
 let pn=$('#ikFind');const r=edRange();const selT=r&&!r.collapsed?r.toString():'';if(selT&&selT.length<80&&!selT.includes('\n'))FD.q=selT;
 if(!pn){pn=document.createElement('div');pn.id='ikFind';pn.className='ik-find';
  pn.innerHTML=`<div class="ik-fr"><span class="ik-fi">${I('search')}<input id="fdQ" placeholder="Localizar" autocomplete="off"></span><span id="fdN" class="ik-fn"></span><button class="tb" id="fdPrev" title="Anterior (Shift+Enter)">↑</button><button class="tb" id="fdNext" title="Próximo (Enter)">↓</button>
   <span class="ik-fi"><input id="fdR" placeholder="Substituir por" autocomplete="off"></span><button class="btn sm" id="fdR1">Substituir</button><button class="btn sm" id="fdRA">Substituir tudo</button>
   <span class="ik-fo"><label title="Diferenciar maiúsculas de minúsculas"><input type="checkbox" id="fdCs"> Aa</label><label title="Só palavras inteiras"><input type="checkbox" id="fdWw"> Palavra inteira</label><select id="fdSc"><option value="ch">Este capítulo</option><option value="book">Livro inteiro</option></select></span><button class="tb" id="fdX" title="Fechar (Esc)">×</button></div><div class="ik-fbk" id="fdBk"></div>`;
  $('#tb').after(pn);
  const q=$('#fdQ',pn),rp=$('#fdR',pn);
  q.oninput=debounce(()=>{FD.q=q.value;fdRun()},180);rp.oninput=()=>FD.rep=rp.value;
  q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();fdStep(e.shiftKey?-1:1)}else if(e.key==='Escape'){fdClose()}};
  rp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();FD.scope==='ch'?fdReplaceOne():fdReplaceAll()}else if(e.key==='Escape'){fdClose()}};
  $('#fdPrev',pn).onclick=()=>fdStep(-1);$('#fdNext',pn).onclick=()=>fdStep(1);$('#fdR1',pn).onclick=()=>{if(FD.scope!=='ch'){toast('No livro inteiro use “Substituir tudo” ou abra um capítulo da lista.');return}fdReplaceOne()};$('#fdRA',pn).onclick=fdReplaceAll;
  $('#fdCs',pn).onchange=e=>{FD.cs=e.target.checked;fdRun()};$('#fdWw',pn).onchange=e=>{FD.ww=e.target.checked;fdRun()};$('#fdSc',pn).onchange=e=>{FD.scope=e.target.value;$('#fdBk').innerHTML='';fdRun()};$('#fdX',pn).onclick=fdClose}
 $('#fdQ').value=FD.q;$('#fdR').value=FD.rep;$('#fdCs').checked=FD.cs;$('#fdWw').checked=FD.ww;$('#fdSc').value=FD.scope;pn.classList.toggle('rep',!!rep||!!FD.rep);
 const q=$('#fdQ');setTimeout(()=>{(rep&&FD.q?$('#fdR'):q).focus();q.select()},20);fdRun();if(FD.ranges.length)fdShow()}
function fdClose(){const pn=$('#ikFind');if(pn)pn.remove();fdClearPaint();FD.ranges=[];const p=$('#page');if(p)p.focus()}
ACT.findOpen=()=>fdOpen(false);ACT.findRep=()=>fdOpen(true);

/* ---------- ortografia ---------- */
function applySpell(){const p=$('#page');if(p)p.spellcheck=!S.prefs.noSpell}

/* ---------- menus da barra (ampliados) ---------- */
{const base=TBM.fmt;TBM.fmt=()=>{const extra=[cmdIt('superscript','x²','Sobrescrito','Ctrl+Shift+='),cmdIt('subscript','x₂','Subscrito','Ctrl+='),{i:'Aa',t:'Maiúsculas e minúsculas…',d:'MAIÚSCULAS, minúsculas, Títulos',kb:'Shift+F3',run:()=>ikMenu($('[data-m=fmt]'),Object.entries(CASES).map(([k,[t]])=>({i:'',t,run:()=>changeCase(k)})),{title:'Maiúsculas e minúsculas'})}];
 if(!isPhone())return[...extra,'-',cmdIt('removeFormat',I('clear'),'Limpar formatação')];
 const b=base();const at=b.findIndex(x=>x&&x.t==='Tachado');b.splice(at+1,0,...extra,{i:'<b style="color:#c0392b">A</b>',t:'Cor do texto…',run:()=>ikMenu(null,TBM.color(),{title:'Cor do texto'})},{i:'🖍',t:'Realce…',run:()=>ikMenu(null,TBM.hl(),{title:'Realce'})});
 const al=b.findIndex(x=>x&&x.t==='Justificar');b.splice(al+1,0,{i:I('indR'),t:'Aumentar recuo',run:()=>indentBy(1)},{i:I('indL'),t:'Diminuir recuo',run:()=>indentBy(-1)});return b}}
{const base=TBM.align;TBM.align=()=>[...base(),'-',{i:I('indR'),t:'Aumentar recuo',kb:'Tab (em listas)',run:()=>indentBy(1)},{i:I('indL'),t:'Diminuir recuo',run:()=>indentBy(-1)}]}
{const base=TBM.ins;TBM.ins=()=>{const b=base();return[...b,'-',{i:I('link'),t:'Link',d:'Endereço da web ou e-mail',kb:'Ctrl+K',run:()=>ACT.insLink()},{i:I('tbl'),t:'Tabela',d:'Linhas e colunas',run:()=>ACT.insTable()},{i:'<b>¹</b>',t:'Nota de rodapé',d:'Número automático',kb:'Ctrl+Alt+F',run:()=>ACT.insNote()},{i:I('pgb'),t:'Quebra de página',d:'O texto seguinte começa numa nova folha',kb:'Ctrl+Enter',run:()=>ACT.insPgBreak()},{i:'Ω',t:'Símbolo',d:'— « » … © e outros',run:()=>ACT.insSym($('[data-m=ins]'))}]}}
{const base=TBM.rev;TBM.rev=()=>{const b=base();return[{i:I('search'),t:'Localizar',d:'No capítulo ou no livro inteiro',kb:'Ctrl+F',run:()=>fdOpen(false)},{i:'⇄',t:'Substituir',kb:'Ctrl+H',run:()=>fdOpen(true)},'-',...b,'-',{i:'#',t:'Contagem de palavras',d:'Seleção, capítulo e livro',run:()=>ACT.wordCount()},{i:'✓',t:'Verificação ortográfica',d:'Sublinha erros de digitação',on:!S.prefs.noSpell,run:()=>{S.prefs.noSpell=!S.prefs.noSpell;savePrefs();applySpell();toast(S.prefs.noSpell?'Verificação ortográfica desligada':'Verificação ortográfica ligada')}},{i:'✎',t:'AutoCorreção',d:'-- vira —, ... vira …, aspas curvas',on:!S.prefs.noAuto,run:()=>{S.prefs.noAuto=!S.prefs.noAuto;savePrefs();toast(S.prefs.noAuto?'AutoCorreção desligada':'AutoCorreção ligada')}}]}}
{const base=TBM.view;TBM.view=()=>[...base(),'-',{i:'⌨',t:'Atalhos de teclado',run:()=>ACT.kbHelp()}]}
const KB=[['Ctrl+B / I / U','Negrito, itálico, sublinhado'],['Ctrl+E / L / R / J','Centralizar, esquerda, direita, justificar'],['Ctrl+Shift+= / Ctrl+=','Sobrescrito / subscrito'],['Shift+F3','Alternar MAIÚSCULAS / minúsculas'],['Ctrl+K','Link (com texto selecionado) — sem seleção abre a busca de ferramentas'],['Ctrl+Enter','Quebra de página'],['Ctrl+Alt+F','Nota de rodapé'],['Ctrl+F / Ctrl+H','Localizar / substituir'],['Tab / Shift+Tab','Recuo em listas · próxima célula em tabelas'],['Ctrl+Z / Ctrl+Y','Desfazer / refazer'],['Ctrl+S','Salvar agora'],['@','Mencionar ficha ou capítulo'],['-- … "','AutoCorreção: —, …, aspas curvas; "- " no começo do parágrafo vira travessão']];
ACT.kbHelp=()=>modal({title:'Atalhos de teclado',body:`<table class="ik-wc kb">${KB.map(([k,d])=>`<tr><th><kbd>${esc(k)}</kbd></th><td>${esc(d)}</td></tr>`).join('')}</table><p class="small muted" style="margin:10px 0 0">No Mac, use ⌘ no lugar de Ctrl.</p>`,actions:[{label:'Fechar',cls:'primary'}]});

/* ---------- ligar no editor ---------- */
const _bindEditor16=bindEditor;bindEditor=function(){_bindEditor16();const page=$('#page');if(!page)return;applySpell();
 page.addEventListener('input',autoCorrect);
 page.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&page.contains(a)){e.preventDefault();if(e.ctrlKey||e.metaKey){window.open(a.href,'_blank','noopener');return}linkMenu(a);return}
  const f=e.target.closest('sup.fn');if(f){e.preventDefault();noteMenu(f)}});
 page.addEventListener('keydown',e=>{const k=e.key,mod=e.ctrlKey||e.metaKey;
  if(mod&&!e.shiftKey&&!e.altKey&&['e','l','r','j'].includes(k.toLowerCase())){e.preventDefault();edCmd({e:'justifyCenter',l:'justifyLeft',r:'justifyRight',j:'justifyFull'}[k.toLowerCase()]);return}
  if(mod&&k==='Enter'){e.preventDefault();ACT.insPgBreak();return}
  if(mod&&e.shiftKey&&(k==='+'||k==='='||e.code==='Equal')){e.preventDefault();edCmd('superscript');return}
  if(mod&&!e.shiftKey&&(k==='='||e.code==='Equal')){e.preventDefault();edCmd('subscript');return}
  if(mod&&e.altKey&&(k.toLowerCase()==='f'||e.code==='KeyF')){e.preventDefault();ACT.insNote();return}
  if(e.shiftKey&&k==='F3'){e.preventDefault();cycleCase();return}
  if(k==='Tab'){const r=edRange();if(!r)return;const c=cellOf(r.startContainer);
   if(c){e.preventDefault();const cells=$$('td,th',c.closest('table'));let i=cells.indexOf(c)+(e.shiftKey?-1:1);if(i>=cells.length){saveSel();tblOp('rowAdd');return}if(i<0)i=0;caretTo(cells[i],true);return}
   const li=(r.startContainer.nodeType===3?r.startContainer.parentElement:r.startContainer).closest('li');if(li){e.preventDefault();document.execCommand(e.shiftKey?'outdent':'indent');markDirty();return}}
 });
 const paper=$('#paper');if(paper&&!$('#fnList'))page.insertAdjacentHTML('afterend','<div id="fnList" class="fn-list" style="display:none"></div>');
 $('#fnList').addEventListener('click',e=>{const p=e.target.closest('[data-fni]');if(!p)return;const sp=$$('sup.fn',page)[+p.dataset.fni];if(sp){sp.scrollIntoView({block:'center'});noteMenu(sp)}});
 const cnt=$('#cnt');if(cnt){cnt.dataset.act='wordCount';cnt.title='Contagem de palavras detalhada';cnt.classList.add('ik-cnt')}
 updColorBtns();
};
const _markDirty16=markDirty;markDirty=function(){_markDirty16();renumberNotesT();if($('#ikFind')&&FD.q&&FD.scope==='ch')fdRunT()};
const renumberNotesT=debounce(renumberNotes,250),fdRunT=debounce(()=>fdRun(true),400);
const _openChapter16=openChapter;openChapter=async function(id,initial){await _openChapter16(id,initial);renumberNotes();applySpell();if($('#ikFind'))fdRun()};
{const _sv=showView;showView=function(v){if(v!=='write'){fdClearPaint();if(TBAR)TBAR.style.display='none'}return _sv(v)}}

/* atalhos globais: Ctrl+F / Ctrl+H no editor */
document.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;if(!mod||e.altKey||!S.P||S.view!=='write'||!$('#page')||$('.ov'))return;const k=e.key.toLowerCase();
 if(k==='f'&&!e.shiftKey){e.preventDefault();fdOpen(false)}else if(k==='h'&&!e.shiftKey){e.preventDefault();fdOpen(true)}},true);

/* ---------- exportação: notas, quebras e tabelas ---------- */
const _gather16=gather;gather=async function(){const chs=await _gather16();const f=S.view==='export'?S.exp.fmt:'pdf';
 chs.forEach(c=>{const d=document.createElement('div');d.innerHTML=c.html;let run=null;[...d.childNodes].forEach(n=>{if(n.nodeType===1&&BLOCKS.has(n.tagName)){run=null;return}if(n.nodeType===3&&!n.data.trim()){return}if(n.nodeType===8){n.remove();return}if(!run){run=document.createElement('p');n.before(run)}run.appendChild(n)});const ns=$$('sup.fn',d);ns.forEach((s,i)=>s.textContent=i+1);
  if(ns.length&&!['pdf','docx'].includes(f)){const notes=ns.map((s,i)=>{const t=s.getAttribute('title')||'';s.removeAttribute('title');s.className='fnr';s.innerHTML=(f==='html'||f==='epub')?`<a href="#n-${c.id}-${i+1}" id="r-${c.id}-${i+1}">${i+1}</a>`:`[${i+1}]`;return t});
   d.insertAdjacentHTML('beforeend',`<section class="fnotes"><p class="fnh">Notas</p>${notes.map((t,i)=>`<p class="fnp" id="n-${c.id}-${i+1}">${(f==='html'||f==='epub')?`<a href="#r-${c.id}-${i+1}">${i+1}.</a>`:`[${i+1}]`} ${esc(t)}</p>`).join('')}</section>`)}
  if(['md','txt'].includes(f))$$('hr.pgbreak',d).forEach(h=>h.remove());
  c.html=d.innerHTML});return chs};

/* ---------- busca de ferramentas: novos comandos ---------- */
{const _cl=cmdList;cmdList=function(){const L=_cl();if(ikCtx()!=='project')return L;
 const inW=fn=>async()=>{if(S.view!=='write')await showView('write');await new Promise(r=>setTimeout(r,60));fn()};
 const add=(t,d,fn,o)=>({g:'Escrever',t,d,run:inW(fn),...o});
 const items=[
  add('Localizar','No capítulo ou no livro inteiro (Ctrl+F)',()=>fdOpen(false),{i:I('search'),w:'Barra › Revisar',k:'procurar buscar texto palavra'}),
  add('Substituir','Trocar uma palavra por outra (Ctrl+H)',()=>fdOpen(true),{i:'⇄',w:'Barra › Revisar',k:'trocar nome personagem renomear'}),
  add('Inserir link','Endereço da web ou e-mail (Ctrl+K)',()=>ACT.insLink(),{i:I('link'),w:'Barra › Inserir',k:'hiperlink url site'}),
  add('Inserir tabela','',()=>ACT.insTable(),{i:I('tbl'),w:'Barra › Inserir',k:'quadro colunas linhas'}),
  add('Nota de rodapé','Número automático, vai para o pé da página',()=>ACT.insNote(),{i:'¹',w:'Barra › Inserir',k:'nota fim referencia fonte'}),
  add('Quebra de página','Começar numa nova folha (Ctrl+Enter)',()=>ACT.insPgBreak(),{i:I('pgb'),w:'Barra › Inserir',k:'nova pagina salto'}),
  add('Símbolos','Travessão, aspas, ©…',()=>ACT.insSym($('[data-m=ins]')),{i:'Ω',w:'Barra › Inserir',k:'caractere especial travessao'}),
  add('Cor do texto','',()=>ikMenu($('#tbCol')||null,TBM.color(),{title:'Cor do texto'}),{i:'<b style="color:#c0392b">A</b>',w:'Barra',k:'colorir fonte'}),
  add('Realce (marca-texto)','',()=>ikMenu($('#tbHl')||null,TBM.hl(),{title:'Realce'}),{i:I('hl'),w:'Barra',k:'destacar marcar amarelo'}),
  add('Sobrescrito','x²',()=>edCmd('superscript'),{i:'x²',w:'Barra › Aa'}),
  add('Subscrito','x₂',()=>edCmd('subscript'),{i:'x₂',w:'Barra › Aa'}),
  add('MAIÚSCULAS / minúsculas','Shift+F3',()=>ikMenu($('[data-m=fmt]'),Object.entries(CASES).map(([k,[t]])=>({t,run:()=>changeCase(k)})),{title:'Maiúsculas e minúsculas'}),{i:'Aa',w:'Barra › Aa',k:'caixa alta baixa'}),
  add('Aumentar recuo','',()=>indentBy(1),{i:I('indR'),w:'Barra › Alinhamento',k:'indentar'}),
  add('Diminuir recuo','',()=>indentBy(-1),{i:I('indL'),w:'Barra › Alinhamento'}),
  add('Contagem de palavras','Seleção, capítulo e livro',()=>ACT.wordCount(),{i:'#',w:'Barra › Revisar',k:'caracteres paginas estatistica'}),
  add('AutoCorreção','Ligar/desligar travessão e aspas automáticos',()=>{S.prefs.noAuto=!S.prefs.noAuto;savePrefs();toast(S.prefs.noAuto?'AutoCorreção desligada':'AutoCorreção ligada')},{i:'✎',w:'Barra › Revisar',k:'autocorrecao travessao aspas'}),
  add('Verificação ortográfica','Ligar/desligar',()=>{S.prefs.noSpell=!S.prefs.noSpell;savePrefs();applySpell();toast(S.prefs.noSpell?'Verificação ortográfica desligada':'Verificação ortográfica ligada')},{i:'✓',w:'Barra › Revisar',k:'ortografia corretor erros'}),
  add('Atalhos de teclado','',()=>ACT.kbHelp(),{i:'⌨',w:'Barra › Exibir',k:'teclas'})];
 let at=-1;L.forEach((x,i)=>{if(x.g==='Escrever')at=i});L.splice(at+1,0,...items);return L}}
