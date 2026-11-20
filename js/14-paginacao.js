/* ============ v14: paginação real (A4…), sumário com páginas, réguas e visualização de impressão ============ */
const MMPX=96/25.4;
const MARGINS={normal:['Normal — 2,5 × 3 cm',[25,30,25,30]],estreita:['Estreita — 1,5 cm',[15,15,15,15]],abnt:['ABNT — 3 × 2 cm',[30,20,20,30]],livro:['Livro — 2 × 1,7 cm',[20,17,22,17]],larga:['Larga — 2,5 × 5 cm',[25,50,25,50]]};
function prCfg(p=P()){const s=p.settings,pr=s.print=s.print||{},page=pr.page||'a4',pg=PAGES[page]||PAGES.a4,small=page==='a5'||page==='6x9',mg=pr.mg||(small?'livro':'normal');
 const m=(mg==='custom'&&Array.isArray(pr.m)&&pr.m.length===4?pr.m:(MARGINS[mg]||MARGINS.normal)[1]).map(v=>v*MMPX);
 return{page,pg,mg,mm:mg==='custom'&&pr.m?pr.m:(MARGINS[mg]||MARGINS.normal)[1],m,pt:+pr.pt||(small?10.5:12),header:!!pr.header,recto:!!pr.recto,spread:!!pr.spread,W:pg.w*MMPX,H:pg.h*MMPX,ind:s.indentEm??1.5}}
const PG_CSS=`.pg .pgfn{position:absolute;line-height:1.35;color:#1b1b1b}.pgfn .fnsep{width:32%;border-top:1px solid #999;margin:0 0 .35em}.pgfn p{margin:0 0 .18em;text-indent:0;text-align:left}.pgfn sup{font-size:.75em;line-height:0;margin-right:.15em}.pgc sup{line-height:0}.pg{position:relative;background:#fff;color:#1b1b1b;overflow:hidden;box-sizing:border-box;flex:none}.pg .pgc{position:absolute;overflow:hidden}.pg .pgh,.pg .pgf{position:absolute;left:0;right:0;text-align:center;font:9pt Georgia,serif;color:#777;letter-spacing:.04em}.pg .pgh{font-style:italic}
.pgc .split-b{text-indent:0!important}.pgc .split-b .dc{display:none}.pgc .tocl{display:flex;align-items:baseline;gap:6px;text-indent:0!important;margin:.4em 0!important;text-align:left!important}.pgc .tocl .tt{flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pgc .tocl .dots{flex:1 1 20px;border-bottom:1.5px dotted #999;transform:translateY(-.3em);min-width:12px}.pgc .tocl .pn{flex:none;min-width:2em;text-align:right}.pgc .tocl.tocpart{font-weight:700;margin-top:1em!important}.pgc .tocl.tocpart .dots,.pgc .tocl.tocpart .pn{visibility:hidden}
.pgc .tp-wrap{display:flex;flex-direction:column;justify-content:center}.pgc .pp-wrap{display:flex;flex-direction:column;justify-content:center}.pgc .pp-wrap .partpg{padding-top:0}.pgc .chead h1{margin-top:.2em}`;
const BLOCKS=new Set(['P','DIV','UL','OL','LI','BLOCKQUOTE','H1','H2','H3','H4','H5','H6','TABLE','FIGURE','ASIDE','SECTION','HR','IMG','PRE']);
const isTextual=el=>[...el.childNodes].every(n=>n.nodeType!==1||!BLOCKS.has(n.tagName));
function tNodes(el){const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const a=[];let n;while((n=w.nextNode()))a.push(n);return a}
function wordEnds(el){const out=[];tNodes(el).forEach((n,i)=>{const re=/\S+/g;let m;while((m=re.exec(n.data)))out.push([i,m.index,m.index+m[0].length])});return out}
function cutAt(el,k,ends,first){const c=el.cloneNode(true),tn=tNodes(c),r=document.createRange();
 if(first){r.setStart(tn[ends[k-1][0]],ends[k-1][2]);r.setEndAfter(c.lastChild);r.deleteContents()}else{r.setStart(c,0);r.setEnd(tn[ends[k][0]],ends[k][1]);r.deleteContents()}return c}
function pgOpts(){const x=S.exp;return{title:!!x.title,toc:!!x.toc,codex:!!x.codex&&P().codex.length>0,numbers:x.numbers!==false}}
async function paginate(chs,o,onProg){const p=P(),s=p.settings,c=prCfg(p),px=c.pt*96/72,CW=c.W-c.m[1]-c.m[3],CH=c.H-c.m[0]-c.m[2];
 let st=$('#pgStyle');if(!st){st=document.createElement('style');st.id='pgStyle';document.head.appendChild(st)}
 st.textContent=proseCSS({...s,indentEm:c.ind},'.pgc',px)+PG_CSS+`.pgc .tp-wrap img{max-height:${Math.round(CH*.55)}px}`+(s.align==='justify'?'.pgc .split-a{text-align-last:justify}':'');
 const host=document.createElement('div');host.className='pg-host';host.style.cssText='position:fixed;left:-40000px;top:0;width:'+Math.ceil(c.W)+'px';document.body.appendChild(host);
 const pages=[];let cur=null,blocks=0;
 const syncFn=()=>{if(!cur||!cur.nb)return;const refs=$$('sup.fn',cur.c);const k=refs.map(r=>r.textContent+'|'+(r.title||'')).join('§');if(k===cur.nk)return;cur.nk=k;cur.nb.innerHTML=refs.length?'<div class="fnsep"></div>'+refs.map(r=>`<p><sup>${esc(r.textContent)}</sup> ${esc(r.title||'')}</p>`).join(''):'';cur.nbH=refs.length?cur.nb.offsetHeight+6:0;cur.c.style.height=(CH-cur.nbH)+'px'};
 const newPage=(kind,info={})=>{if(cur)syncFn();const el=document.createElement('div');el.className='pg';el.style.width=c.W+'px';el.style.height=c.H+'px';const cc=document.createElement('div');cc.className='pgc';cc.style.cssText=`left:${c.m[3]}px;top:${c.m[0]}px;width:${CW}px;height:${CH}px`;el.appendChild(cc);const nb=document.createElement('div');nb.className='pgfn';nb.style.cssText=`left:${c.m[3]}px;bottom:${c.m[2]}px;width:${CW}px;font-size:${(px*.78).toFixed(2)}px;font-family:${fontStack(s.bodyFont).replace(/"/g,"'")}`;el.appendChild(nb);host.appendChild(el);cur={el,c:cc,nb,nk:'',kind,chap:info.chap||null,keep:null};pages.push(cur);return cur};
 const fits=()=>{syncFn();return cur.c.scrollHeight<=CH-(cur.nbH||0)+.5},empty=()=>!cur.c.firstChild;
 const splitText=(el,minLines)=>{const ends=wordEnds(el),n=ends.length;if(n<2)return null;let lo=1,hi=n-1,best=0;
  while(lo<=hi){const mid=(lo+hi)>>1,a=cutAt(el,mid,ends,true);a.classList.add('split-a');cur.c.appendChild(a);const ok=fits();a.remove();if(ok){best=mid;lo=mid+1}else hi=mid-1}
  if(!best)return null;const a=cutAt(el,best,ends,true);a.classList.add('split-a');cur.c.appendChild(a);const lh=parseFloat(getComputedStyle(a).lineHeight)||px*1.6,lines=Math.round(a.getBoundingClientRect().height/lh);a.remove();
  if(lines<minLines)return null;const b=cutAt(el,best,ends,false);b.classList.remove('split-a');b.classList.add('split-b');if(b.style)b.style.textIndent='';return[a,b]};
 const splitTable=el=>{const body=[...el.querySelectorAll(':scope>tbody>tr,:scope>tr')];if(body.length<2)return null;const head=el.tHead;const mk=rows=>{const t=el.cloneNode(false);if(head)t.appendChild(head.cloneNode(true));const tb=document.createElement('tbody');rows.forEach(r=>tb.appendChild(r.cloneNode(true)));t.appendChild(tb);return t};let best=0;for(let n=1;n<body.length;n++){const a=mk(body.slice(0,n));cur.c.appendChild(a);const ok=fits();a.remove();if(ok)best=n;else break}if(!best)return null;return[mk(body.slice(0,best)),mk(body.slice(best))]};
 const splitKids=el=>{const kids=[...el.children];if(kids.length<2)return null;let best=0;for(let n=1;n<kids.length;n++){const a=el.cloneNode(false);kids.slice(0,n).forEach(k=>a.appendChild(k.cloneNode(true)));cur.c.appendChild(a);const ok=fits();a.remove();if(ok)best=n;else break}
  if(!best)return null;const a=el.cloneNode(false),b=el.cloneNode(false);kids.slice(0,best).forEach(k=>a.appendChild(k.cloneNode(true)));kids.slice(best).forEach(k=>b.appendChild(k.cloneNode(true)));if(el.tagName==='OL')b.setAttribute('start',(+(el.getAttribute('start')||1))+best);return[a,b]};
 const place=async el=>{if(++blocks%25===0)await new Promise(r=>setTimeout(r,0));
  for(let g=0;g<800;g++){cur.c.appendChild(el);if(fits()){cur.keep=(/^H[1-6]$/.test(el.tagName)||el.classList.contains('chead'))?el:null;return}
   el.remove();const was=empty();let parts=null;
   if(el.tagName==='TABLE')parts=splitTable(el);else if(!el.classList.contains('statblock')&&!el.classList.contains('chead')&&!/^(FIGURE|HR|IMG|H1|H2|H3|H4|H5|H6)$/.test(el.tagName))parts=isTextual(el)?splitText(el,was?1:2):splitKids(el);
   if(parts){cur.c.appendChild(parts[0]);cur.keep=null;newPage(cur.kind,{chap:cur.chap});el=parts[1];continue}
   if(was){$$('img',el).concat(el.tagName==='IMG'?[el]:[]).forEach(i=>{i.style.maxHeight=(CH*.9)+'px';i.style.width='auto'});cur.c.appendChild(el);cur.keep=null;return}
   const k=cur.keep;let carry=null;if(k&&k===cur.c.lastElementChild&&cur.c.children.length>1){carry=k;k.remove()}
   newPage(cur.kind,{chap:cur.chap});if(carry){cur.c.appendChild(carry);cur.keep=carry}}};
 const frag=html=>{const d=document.createElement('div');d.innerHTML=html;const out=[];let run=null;[...d.childNodes].forEach(n=>{if(n.nodeType===1&&BLOCKS.has(n.tagName)){run=null;out.push(n)}else if(n.nodeType===3&&!n.data.trim()){}else{if(!run){run=document.createElement('p');out.push(run)}run.appendChild(n)}});return out};
 const full=(kind,html,cls,info={})=>{newPage(kind,info);const d=document.createElement('div');d.className=cls;d.style.minHeight=CH+'px';d.innerHTML=html;cur.c.appendChild(d)};
 if(o.title)full('title',titleHTML(),'tp-wrap');
 const partPg={};let appxPg=null;
 if(o.toc&&chs.length>1){newPage('toc');await place(Object.assign(document.createElement('h2'),{textContent:'Sumário'}));
  for(const ch of chs){if(ch.part){const e=document.createElement('p');e.className='tocl tocpart';e.dataset.tocp=ch.id;e.innerHTML=`<span class="tt">${esc(ch.part)}</span><span class="dots"></span><span class="pn">000</span>`;await place(e)}
   const e=document.createElement('p');e.className='tocl';e.dataset.toc=ch.id;e.innerHTML=`<span class="tt">${tocPre(ch)}${esc(ch.title)}</span><span class="dots"></span><span class="pn">000</span>`;await place(e)}
  if(o.codex){const e=document.createElement('p');e.className='tocl';e.dataset.toca='1';e.innerHTML=`<span class="tt">Apêndice — ${p.type==='rpg'?'Compêndio':'Wiki do mundo'}</span><span class="dots"></span><span class="pn">000</span>`;await place(e)}}
 for(let i=0;i<chs.length;i++){const ch=chs[i];onProg&&onProg((i+.5)/(chs.length+(o.codex?1:0)));
  if(ch.part){if(c.recto&&(pages.length+1)%2===0)newPage('blank');full('part',partHTML(ch.part),'pp-wrap');partPg[ch.id]=pages.length}
  if(c.recto&&(pages.length+1)%2===0)newPage('blank');newPage('chap',{chap:ch});
  const hd=document.createElement('div');hd.className='chead';hd.dataset.ch=ch.id;hd.innerHTML=`<div class="kicker">${esc(kickTxt(ch))}</div><h1>${esc(ch.title)}</h1>`;await place(hd);
  for(const el of frag(withDropcap(ch.html))){if(el.tagName==='HR'&&el.classList.contains('pgbreak')){if(!empty()){cur.keep=null;newPage('chap',{chap:ch})}continue}await place(el)}}
 if(o.codex){if(c.recto&&(pages.length+1)%2===0)newPage('blank');newPage('appx');appxPg=pages.length;await place(Object.assign(document.createElement('h1'),{textContent:p.type==='rpg'?'Compêndio':'Wiki do mundo'}));for(const el of frag(codexHTML()))await place(el)}
 syncFn();while(pages.length>1&&!pages[pages.length-1].c.firstChild){pages.pop().el.remove()}
 const starts={};pages.forEach((pg,i)=>{pg.el.dataset.n=i+1;$$('.chead',pg.c).forEach(h=>{starts[h.dataset.ch]=i+1;pg.opening=true})});
 $$('[data-toc]',host).forEach(e=>{e.querySelector('.pn').textContent=starts[e.dataset.toc]||''});$$('[data-tocp]',host).forEach(e=>{e.querySelector('.pn').textContent=partPg[e.dataset.tocp]||''});$$('[data-toca]',host).forEach(e=>{e.querySelector('.pn').textContent=appxPg||''});
 pages.forEach((pg,i)=>{const n=i+1;if(o.numbers&&!['title','blank','part'].includes(pg.kind)){const f=document.createElement('div');f.className='pgf';f.style.bottom=Math.max(10,c.m[2]*.42)+'px';f.textContent=n;pg.el.appendChild(f)}
  if(c.header&&!pg.opening&&['chap','appx'].includes(pg.kind)){const h=document.createElement('div');h.className='pgh';h.style.top=Math.max(10,c.m[0]*.42)+'px';h.textContent=n%2===0?p.title:(pg.chap?pg.chap.title:(p.type==='rpg'?'Compêndio':'Wiki do mundo'));pg.el.appendChild(h)}});
 onProg&&onProg(1);return{host,pages:pages.map(x=>x.el),starts,cfg:c}}
/* PDF a partir das páginas (o sumário bate com as páginas reais) */
async function exportPDF(chs,name,b){b.set('Carregando gerador de PDF…');await loadScript(LIB.html2pdf);const p=P(),s=p.settings,x=S.exp;
 b.set('Paginando…');const r=await paginate(chs,pgOpts(),f=>b.set('Paginando… '+Math.round(f*100)+'%'));const c=r.cfg,fmt=c.pg.fmt;
 try{await document.fonts.ready;await waitImgs(r.host);
  const links=[];r.pages.forEach((pg,i)=>{const pr=pg.getBoundingClientRect();$$('[data-toc],[data-tocp],[data-toca]',pg).forEach(e=>{const t=+e.querySelector('.pn').textContent;if(!t)return;const er=e.getBoundingClientRect();links.push({pg:i+1,to:t,x:(er.left-pr.left)/MMPX,y:(er.top-pr.top)/MMPX,w:er.width/MMPX,h:er.height/MMPX})})});
  const tiny=document.createElement('div');tiny.style.cssText='width:40px;height:20px;background:#fff';tiny.textContent='.';
  const pdf0=await html2pdf().set({margin:0,jsPDF:{unit:'mm',format:fmt,orientation:'portrait'},html2canvas:{scale:1,logging:false}}).from(tiny).toPdf().get('pdf');
  const pdf=pdf0;pdf.addPage(fmt,'portrait');pdf.deletePage(1);
  const scale=r.pages.length>250?1.5:2;
  for(let i=0;i<r.pages.length;i++){b.set(`Desenhando página ${i+1} de ${r.pages.length}…`);
   const cv=await html2pdf().set({margin:0,html2canvas:{scale,useCORS:true,backgroundColor:'#ffffff',logging:false},jsPDF:{unit:'mm',format:fmt,orientation:'portrait'}}).from(r.pages[i]).toCanvas().get('canvas');
   if(i>0)pdf.addPage(fmt,'portrait');pdf.setPage(i+1);pdf.addImage(cv.toDataURL('image/jpeg',.9),'JPEG',0,0,c.pg.w,c.pg.h,undefined,'FAST');cv.width=cv.height=1}
  links.forEach(l=>{try{pdf.setPage(l.pg);pdf.link(l.x,l.y,l.w,l.h,{pageNumber:l.to})}catch{}});
  if(x.wm&&s.wm.enabled){b.set('Aplicando marca d’água…');await watermarkPdf(pdf,s.wm,c.pg.w)}
  pdf.setProperties({title:p.title,author:p.author||'',creator:'Inkmind'});await saveFile(name+'.pdf',pdf.output('blob'));
  setTimeout(()=>toast(`PDF com ${r.pages.length} página(s)`),1200)}
 finally{r.host.remove()}}
/* visualização de impressão */
let PVSEQ=0;const pvSave=debounce(()=>{saveProject();repaginate()},450);
RENDER.print=async()=>{const p=P(),x=S.exp,c=prCfg(p);if(!x.page||!PAGES[x.page])x.page=c.page;
 const tg=(id,l,v,dis)=>`<label class="toggle"><input type="checkbox" id="${id}" ${v?'checked':''} ${dis?'disabled':''}><span class="sw"></span>${l}</label>`;
 const cmv=(i)=>(c.mm[i]/10).toFixed(1).replace('.',',');
 $('#view').innerHTML=`<div class="pv"><aside class="pv-side"><h3 style="margin-top:0">🖨 Impressão</h3><p class="small muted" style="margin-top:0">Exatamente como fica no PDF e no papel. O sumário mostra a página onde cada capítulo começa.</p>
  <label class="f">Página</label><select id="pvPg">${Object.entries(PAGES).map(([k,v])=>`<option value="${k}" ${c.page===k?'selected':''}>${v.l} — ${v.w}×${v.h} mm</option>`).join('')}</select>
  <label class="f">Margens</label><select id="pvMg">${Object.entries(MARGINS).map(([k,v])=>`<option value="${k}" ${c.mg===k?'selected':''}>${v[0]}</option>`).join('')}<option value="custom" ${c.mg==='custom'?'selected':''}>Personalizada</option></select>
  <div class="pv-m4" id="pvM4" style="${c.mg==='custom'?'':'display:none'}">${['Superior','Direita','Inferior','Esquerda'].map((l,i)=>`<label class="small">${l} (cm)<input type="number" step="0.1" min="0.5" max="8" value="${(c.mm[i]/10).toFixed(1)}" data-mi="${i}"></label>`).join('')}</div>
  <div class="row"><div class="grow"><label class="f">Fonte do texto (pt)</label><input type="number" id="pvPt" min="8" max="18" step="0.5" value="${c.pt}"></div><div class="grow"><label class="f">Recuo do parágrafo (cm)</label><input type="number" id="pvInd" min="0" max="4" step="0.1" value="${(c.ind*c.pt*.03528).toFixed(1)}"></div></div>
  <div class="pv-tg">${tg('pvTi','Página de título',x.title)}${tg('pvToc','Sumário com números de página',x.toc)}${tg('pvNum','Numerar páginas',x.numbers!==false)}${tg('pvHd','Cabeçalho (livro / capítulo)',c.header)}${tg('pvRe','Capítulos sempre em página ímpar',c.recto)}${tg('pvCx','Apêndice: '+(p.type==='rpg'?'compêndio':'wiki do mundo'),x.codex,!p.codex.length)}${tg('pvWm','Marca d’água',x.wm&&p.settings.wm.enabled,!p.settings.wm.enabled)}</div>
  <label class="f">Conteúdo</label><div class="seg" id="pvSc"><button data-v="all" class="${x.scope!=='cur'?'on':''}">Livro inteiro</button><button data-v="cur" class="${x.scope==='cur'?'on':''}">Capítulo atual</button></div>
  <div id="pvStarts" class="pv-starts"></div>
  <div class="pv-act"><button class="btn primary" id="pvPdf">⬇ Gerar PDF</button><button class="btn" id="pvPrint">🖨 Imprimir</button></div></aside>
  <section class="pv-main"><div class="pv-bar"><b id="pvInfo">Paginando…</b><span class="sp"></span><label class="small">Ir para <input type="number" id="pvGo" min="1" style="width:64px"></label><button class="btn sm" data-z="-1">−</button><span id="pvZv" class="small" style="min-width:42px;text-align:center"></span><button class="btn sm" data-z="1">+</button><button class="btn sm" data-z="0">Ajustar</button><button class="btn sm ${c.spread?'on':''}" id="pvSp" title="Páginas lado a lado">📖</button></div>
  <div class="pv-scroll" id="pvScroll"><div class="pv-pages" id="pvPages"></div></div></section></div>`;
 const s=p.settings,pr=s.print;const set=(k,v)=>{pr[k]=v;pvSave()};
 $('#pvPg').onchange=e=>{pr.page=e.target.value;x.page=pr.page;if(!pr.mg||pr.mg==='normal'||pr.mg==='livro')pr.mg=(pr.page==='a5'||pr.page==='6x9')?'livro':'normal';RENDER.print();pvSave()};
 $('#pvMg').onchange=e=>{const v=e.target.value;if(v==='custom')pr.m=prCfg().mm.slice();pr.mg=v;$('#pvM4').style.display=v==='custom'?'':'none';$$('#pvM4 [data-mi]').forEach(i=>i.value=(prCfg().mm[+i.dataset.mi]/10).toFixed(1));pvSave()};
 $$('#pvM4 [data-mi]').forEach(i=>i.oninput=()=>{pr.m=pr.m||prCfg().mm.slice();pr.m[+i.dataset.mi]=clamp((+i.value||1)*10,5,80);pvSave()});
 $('#pvPt').oninput=e=>set('pt',clamp(+e.target.value||12,8,18));
 $('#pvInd').oninput=e=>{const cm=clamp(+e.target.value||0,0,4),pt=prCfg().pt;s.indentEm=Math.round(cm/(pt*.03528)*100)/100;pvSave()};
 const bx=(id,fn)=>{$('#'+id).onchange=e=>{fn(e.target.checked);pvSave()}};
 bx('pvTi',v=>x.title=v);bx('pvToc',v=>x.toc=v);bx('pvNum',v=>x.numbers=v);bx('pvHd',v=>pr.header=v);bx('pvRe',v=>pr.recto=v);bx('pvCx',v=>x.codex=v);bx('pvWm',v=>x.wm=v);
 $$('#pvSc button').forEach(b=>b.onclick=()=>{x.scope=b.dataset.v;$$('#pvSc button').forEach(y=>y.classList.toggle('on',y===b));repaginate()});
 $$('[data-z]').forEach(b=>b.onclick=()=>{const d=+b.dataset.z;S.pvZoom=d===0?null:clamp((S.pvZoom||pvFit())+d*.1,.2,2);pvZoomApply()});
 $('#pvSp').onclick=()=>{pr.spread=!pr.spread;$('#pvSp').classList.toggle('on',pr.spread);saveProject();pvLayout()};
 $('#pvGo').onchange=e=>pvGoto(+e.target.value);
 $('#pvPdf').onclick=async()=>{const chs=await gather();if(!chs.length){toast('Nada para exportar.','err');return}const b=busy('Gerando PDF…');try{await exportPDF(chs,slug(p.title)+(x.scope==='cur'?'-'+slug(chs[0].title):''),b)}catch(e){console.error(e);toast('Falha ao gerar o PDF: '+(e.message||e),'err')}finally{b.done()}};
 $('#pvPrint').onclick=printPages;
 $('#pvPages').onclick=e=>{const t=e.target.closest('[data-toc],[data-tocp],[data-toca]');if(t){const n=+t.querySelector('.pn').textContent;if(n)pvGoto(n)}};
 repaginate()};
function pvFit(){const sc=$('#pvScroll'),c=prCfg();if(!sc)return 1;const sp=c.spread?2:1;return clamp((sc.clientWidth-48)/(c.W*sp+(sp-1)*16),.2,1.5)}
function pvZoomApply(){const z=S.pvZoom||pvFit(),box=$('#pvPages');if(!box)return;box.style.zoom=z;const zv=$('#pvZv');if(zv)zv.textContent=Math.round(z*100)+'%'}
function pvLayout(){const box=$('#pvPages');if(!box)return;const c=prCfg();box.classList.toggle('spread',c.spread);$$('.pv-gap',box).forEach(g=>g.remove());if(c.spread&&box.firstChild){const g=document.createElement('div');g.className='pvp pv-gap';g.style.width=c.W+'px';box.prepend(g)}pvZoomApply()}
function pvGoto(n){const el=$(`#pvPages .pvp[data-n="${n}"]`);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
async function repaginate(){const box=$('#pvPages');if(!box)return;const seq=++PVSEQ;const info=$('#pvInfo');if(info)info.textContent='Paginando…';
 const chs=await gather();if(seq!==PVSEQ)return;if(!chs.length){box.innerHTML='<div class="empty"><div class="big">Nada para mostrar</div><p>Escreva um capítulo primeiro.</p></div>';if(info)info.textContent='0 páginas';return}
 const r=await paginate(chs,pgOpts(),f=>{if(seq===PVSEQ&&info)info.textContent='Paginando… '+Math.round(f*100)+'%'});if(seq!==PVSEQ){r.host.remove();return}
 const p=P(),c=r.cfg;box.innerHTML='';r.pages.forEach((pg,i)=>{const w=document.createElement('div');w.className='pvp';w.dataset.n=i+1;w.appendChild(pg);const l=document.createElement('div');l.className='pv-n';l.textContent=i+1;w.appendChild(l);box.appendChild(w)});r.host.remove();
 if(S.exp.wm&&p.settings.wm.enabled){const ov=document.createElement('div');await renderWmLayer(ov,true);$$('.pg',box).forEach(pg=>{const o=document.createElement('div');o.className='pg-wm';o.style.cssText=ov.style.cssText;pg.appendChild(o)})}
 pvLayout();if(info)info.textContent=`${r.pages.length} página${r.pages.length>1?'s':''} · ${c.pg.l.split(' (')[0]} · ${c.pt} pt`;
 const go=$('#pvGo');if(go)go.max=r.pages.length;
 const stl=$('#pvStarts');if(stl)stl.innerHTML=`<label class="f">Onde cada capítulo começa</label>${chs.map(ch=>`<button class="pv-st" data-go="${r.starts[ch.id]||''}"><span>${p.type==='rpg'||!ch.n?'':ch.n+'. '}${esc(ch.title)}</span><b>p. ${r.starts[ch.id]||'—'}</b></button>`).join('')}`;
 $$('[data-go]',stl).forEach(b=>b.onclick=()=>pvGoto(+b.dataset.go))}
async function printPages(){const pages=$$('#pvPages .pg');if(!pages.length){toast('Espere a paginação terminar.');return}const c=prCfg();const ifr=document.createElement('iframe');ifr.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0';document.body.appendChild(ifr);
 try{const d=ifr.contentDocument;d.open();d.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(P().title)}</title>${$$('link[rel=stylesheet]').map(l=>l.outerHTML).join('')}<style>${($('#pgStyle')||{}).textContent||''}${PG_CSS}@page{size:${c.pg.w}mm ${c.pg.h}mm;margin:0}html,body{margin:0;background:#fff}.pg{break-after:page;page-break-after:always}.pg:last-child{break-after:auto}.pg-wm{position:absolute;inset:0;pointer-events:none}</style></head><body>${pages.map(p=>p.outerHTML).join('')}</body></html>`);d.close();
  await new Promise(r=>setTimeout(r,900));ifr.contentWindow.focus();ifr.contentWindow.print()}catch(e){console.warn(e);toast('A impressão foi bloqueada nesta janela. Use “Gerar PDF” e imprima o arquivo.','err')}setTimeout(()=>ifr.remove(),120000)}
ACT.printPrev=()=>showView('print');
/* réguas no editor (layout de página) */
function applyRuler(){const paper=$('#paper'),sc=$('#scroller');if(!paper||!sc)return;const on=!!S.prefs.ruler,btn=$('#tbRul');if(btn)btn.classList.toggle('on',on);let hr=$('#hrul');
 if(!on){paper.classList.remove('printlay');paper.style.zoom='';paper.style.padding='';paper.style.minHeight='';paper.style.removeProperty('--pgw');if(hr)hr.remove();$$('.vrul,.pbreak',paper).forEach(e=>e.remove());return}
 const c=prCfg(),z=clamp((sc.clientWidth-70)/c.W,.35,1.25);paper.classList.add('printlay');paper.style.setProperty('--pgw',c.W+'px');paper.style.padding=`${c.m[0]}px ${c.m[1]}px ${c.m[2]}px ${c.m[3]}px`;paper.style.setProperty('--fs',(c.pt*96/72)+'px');paper.style.setProperty('--ind',c.ind+'em');paper.style.minHeight=c.H+'px';paper.style.zoom=z;
 if(!hr){hr=document.createElement('canvas');hr.id='hrul';hr.className='hrul';sc.prepend(hr);bindHR(hr)}drawHR(hr,c,z);
 let vr=$('.vrul',paper);if(!vr){vr=document.createElement('div');vr.className='vrul';paper.appendChild(vr)}drawGuides()}
function drawHR(cv,c,z,drag){const dpr=window.devicePixelRatio||1,W=c.W*z,H=24;cv.style.width=W+'px';cv.style.height=H+'px';cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);
 const mm=drag?drag.mm:c.mm,ind=drag&&drag.ind!=null?drag.ind:c.ind*c.pt*.3528,L=mm[3]*MMPX*z,R=W-mm[1]*MMPX*z;
 x.fillStyle='#cfc8db';x.fillRect(0,0,W,H);x.fillStyle='#fbfaf7';x.fillRect(L,0,R-L,H);x.strokeStyle='#8a80a0';x.fillStyle='#4a4060';x.font='10px Inter,sans-serif';x.textAlign='center';x.textBaseline='top';
 for(let m=0;m<=c.pg.w;m++){const px=m*MMPX*z,rel=m-mm[3];const big=rel%10===0,half=rel%5===0;if(!big&&z<.55&&!half)continue;x.beginPath();x.moveTo(px+.5,H);x.lineTo(px+.5,H-(big?8:half?5:3));x.stroke();if(big&&rel!==0)x.fillText(String(Math.abs(rel/10)),px,3)}
 const tri=(px,up,col)=>{x.fillStyle=col;x.beginPath();if(up){x.moveTo(px,H-9);x.lineTo(px-6,H);x.lineTo(px+6,H)}else{x.moveTo(px,9);x.lineTo(px-6,0);x.lineTo(px+6,0)}x.closePath();x.fill()};
 tri(L,true,'#6b5a9a');tri(R,true,'#6b5a9a');tri(L+ind*MMPX*z,false,'#e8731f');
 if(drag&&drag.tip){x.fillStyle='rgba(30,20,50,.85)';const t=drag.tip,w=x.measureText(t).width+12;const tx=clamp(drag.px-w/2,0,W-w);x.fillRect(tx,0,w,14);x.fillStyle='#fff';x.textAlign='left';x.fillText(t,tx+6,2)}}
function bindHR(cv){let st=null;const geo=()=>{const c=prCfg(),z=parseFloat($('#paper').style.zoom)||1;return{c,z}};
 const hit=e=>{const{c,z}=geo(),r=cv.getBoundingClientRect(),px=e.clientX-r.left,W=c.W*z,L=c.mm[3]*MMPX*z,R=W-c.mm[1]*MMPX*z,I=L+c.ind*c.pt*.3528*MMPX*z;if(Math.abs(px-I)<7&&e.clientY-r.top<12)return'ind';if(Math.abs(px-L)<7)return'L';if(Math.abs(px-R)<7)return'R';return null};
 cv.onpointermove=e=>{if(!st){cv.style.cursor=hit(e)?'ew-resize':'default';return}const{c,z}=geo(),r=cv.getBoundingClientRect(),px=clamp(e.clientX-r.left,0,c.W*z),mmv=px/(MMPX*z),mm=st.mm.slice();let ind=st.ind,tip='';
  if(st.k==='L'){mm[3]=clamp(mmv,5,c.pg.w-mm[1]-40);tip='Margem esquerda '+(mm[3]/10).toFixed(1).replace('.',',')+' cm'}else if(st.k==='R'){mm[1]=clamp(c.pg.w-mmv,5,c.pg.w-mm[3]-40);tip='Margem direita '+(mm[1]/10).toFixed(1).replace('.',',')+' cm'}else{ind=clamp(mmv-mm[3],0,40);tip='Recuo '+(ind/10).toFixed(1).replace('.',',')+' cm'}
  st.mm=mm;st.ind=ind;drawHR(cv,c,z,{mm,ind,tip,px})};
 cv.onpointerdown=e=>{const k=hit(e);if(!k)return;const{c}=geo();st={k,mm:c.mm.slice(),ind:c.ind*c.pt*.3528};cv.setPointerCapture(e.pointerId)};
 cv.onpointerup=()=>{if(!st)return;const p=P(),pr=p.settings.print=p.settings.print||{},c=prCfg();if(st.k==='ind')p.settings.indentEm=Math.round(st.ind/(c.pt*.3528)*100)/100;else{pr.mg='custom';pr.m=st.mm.map(v=>Math.round(v))}st=null;saveProject();applyRuler();toast('Formatação de página atualizada — vale para a impressão e o PDF')}}
const drawGuides=debounce(()=>{const paper=$('#paper');if(!paper||!paper.classList.contains('printlay'))return;const c=prCfg(),CH=c.H-c.m[0]-c.m[2],vr=$('.vrul',paper);$$('.pbreak',paper).forEach(e=>e.remove());const h=paper.scrollHeight;
 if(vr){vr.style.height=h+'px';vr.innerHTML=''}const n=Math.floor((h-c.m[0]-c.m[2]-1)/CH);
 for(let k=1;k<=n;k++){const y=c.m[0]+k*CH,g=document.createElement('div');g.className='pbreak';g.style.top=y+'px';g.innerHTML=`<span>≈ página ${k+1}</span>`;paper.appendChild(g)}
 if(vr){let html='';const mmTot=h/MMPX;for(let m=10;m<mmTot;m+=10)html+=`<i style="top:${m*MMPX}px">${Math.round(m/10)}</i>`;vr.innerHTML=html+`<b style="height:${c.m[0]}px"></b>`}},250);
ACT.ruler=()=>{S.prefs.ruler=!S.prefs.ruler;savePrefs();applyRuler();if(S.prefs.ruler)toast('Réguas ligadas: a página do editor agora tem o tamanho, as margens e a fonte da impressão. Arraste os marcadores da régua para ajustar.')};
const _applyEditorStyle14=applyEditorStyle;applyEditorStyle=function(){_applyEditorStyle14();const paper=$('#paper');if(paper)paper.style.setProperty('--ind',(P().settings.indentEm??1.5)+'em');applyRuler()};
window.addEventListener('resize',debounce(()=>{if($('#paper'))applyRuler();if($('#pvPages')&&!S.pvZoom)pvZoomApply()},200));
const _markDirty14=markDirty;markDirty=function(){_markDirty14();if(S.prefs.ruler)drawGuides()};
const _openChapter14=openChapter;openChapter=async function(id,initial){await _openChapter14(id,initial);if(S.prefs.ruler)setTimeout(drawGuides,60)};
