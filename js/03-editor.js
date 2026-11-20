/* ============ ÁREA DE TRABALHO ============ */
const VIEWS={write:['Escrever','pen'],board:['Planejar','grid'],codex:['Compêndio','book'],gallery:['Galeria','img'],style:['Estilo do livro','brush'],publish:['Publicar','out']};
async function openProject(id){
 let p=S.projects.find(x=>x.id===id);if(!p)return;
 S.P=clone(p);S.cache={};
 const s=S.P.settings=Object.assign(defaultSettings(S.P.type,S.P.title),S.P.settings||{});s.wm=Object.assign(defaultSettings(S.P.type,S.P.title).wm,s.wm||{});
 S.P.codex=S.P.codex||[];S.P.gallery=S.P.gallery||[];
 ensureOutline(S.P);const fo=bookOrder(S.P);S.cid=S.P.lastCh&&S.P.chapters.some(c=>c.id===S.P.lastCh)?S.P.lastCh:((fo[0]&&fo[0].id)||S.P.drafts[0]||null);
 S.exp.codex=S.P.type==='rpg';S.exp.page=((S.P.settings.print||{}).page)||'a4';S.exp.sel={};S.codexCat='Todos';S.codexQ='';S.imp=null;S.conv=null;
 loadProjectFonts();
 ensureOutline(S.P);
 $('#app').innerHTML=`<div class="ws">
  <aside class="rail">
   <button class="rback" data-act="home" title="Voltar para a Estante">${I('home')}<span>Estante</span></button>
   <input class="ptitle" id="ptitle" value="${esc(S.P.title)}" aria-label="Título do projeto">
   <button class="ik-rs hide-m" data-act="cmdk" title="Buscar ferramenta (Ctrl+K)">${I('search')}<span>Buscar</span><kbd>Ctrl K</kbd></button>
   <nav id="tabs">${railNav()}</nav>
   <div class="rfoot"><span class="status" id="status"></span><button class="ik-th" data-act="themeQuick" title="Tema do app (claro/escuro)">${I('brush')}</button>${FBAVAIL()&&window.INK&&INK.user?`<button class="ik-th" data-act="inkLogout" title="Sair da conta">${I('logout')}</button>`:''}</div>
  </aside><div id="view"></div></div>
  ${S.P.type==='rpg'?`<button id="dice-fab" data-act="dice" title="Rolar dados">🎲</button><div id="dice"></div>`:''}`;
 setStatus('ok');
 $('#ptitle').oninput=()=>{P().title=$('#ptitle').value;const t=$('.tproj .t');if(t)t.textContent=P().title;saveProject()};
 showView('write');
}
ACT.home=async()=>{await flushChapter();saveProject.flush();renderHome()};
ACT.openTableP=async()=>{const p=P();await flushChapter();saveProject.flush();openTable(p.id,{from:p.id,create:true,title:p.title})};
ACT.view=el=>showView(el.dataset.v);
async function showView(v){
 if(S.view==='write'&&v!=='write')await flushChapter();
 S.view=v;hideImgBar();
 ikHL(v);
 document.body.classList.remove('focus');
 const r=RENDER[v]();return r;
}
const RENDER={};

/* ---------- ESCREVER ---------- */
RENDER.write=async()=>{
 const p=P(),rpg=p.type==='rpg';
 $('#view').innerHTML=`<div class="write">
  <aside class="side" id="side">
   <div class="side-h"><b>Estrutura</b><span class="sp"></span><button class="btn sm" data-act="fAdd" title="Nova pasta">${I('folder')}</button><button class="btn sm primary" data-act="chAdd">${I('plus')}${rpg?'Seção':'Capítulo'}</button><button class="btn sm ghost show-m" data-act="side">×</button></div>
   <div class="tree" id="tree"></div>
   <div class="side-f" id="sidef"></div>
  </aside>
  <div class="scrim" id="scrim" data-act="side"></div>
  <section class="ed">
   <div class="toolbar" id="tb">
    <button class="tb show-m" data-act="side" title="Capítulos">${I('menu')}</button>
    <button class="tb" data-cmd="undo" title="Desfazer (Ctrl+Z)">${I('undo')}</button><button class="tb" data-cmd="redo" title="Refazer (Ctrl+Y)">${I('redo')}</button><span class="sep"></span>
    <select id="blk" class="hide-m" title="Estilo do bloco"><option value="p">Parágrafo</option><option value="h2">Título</option><option value="h3">Subtítulo</option><option value="blockquote">Citação</option></select>
    <button class="tb txt" data-cmd="bold" title="Negrito (Ctrl+B)">B</button><button class="tb txt" data-cmd="italic" title="Itálico (Ctrl+I)" style="font-style:italic">I</button><button class="tb txt hide-m" data-cmd="underline" title="Sublinhado (Ctrl+U)" style="text-decoration:underline">U</button><button class="tb txt hide-m" data-cmd="strikeThrough" title="Tachado" style="text-decoration:line-through">S</button>
    <span class="sep hide-m"></span><button class="tb ik-mb hide-m" id="tbCol" data-act="tbMenu" data-m="color" title="Cor do texto"><span class="ik-A">A<i class="bar"></i></span><i class="ik-cv">▼</i></button><button class="tb ik-mb hide-m" id="tbHl" data-act="tbMenu" data-m="hl" title="Realce (marca-texto)"><span class="ik-A">${I('hl')}<i class="bar"></i></span><i class="ik-cv">▼</i></button><button class="tb ik-mb ik-aa" data-act="tbMenu" data-m="fmt" title="Mais formatação: sobrescrito, maiúsculas…">Aa<i class="ik-cv">▼</i></button>
    <span class="sep hide-m"></span><button class="tb ik-mb hide-m" data-act="tbMenu" data-m="align" title="Alinhamento e recuo">${I('al')}<i class="ik-cv">▼</i></button><button class="tb hide-m" data-cmd="insertUnorderedList" title="Lista">${I('ul')}</button><button class="tb hide-m" data-cmd="insertOrderedList" title="Lista numerada">${I('ol')}</button>
    <span class="sep"></span>
    <button class="tb ik-mb" data-act="tbMenu" data-m="ins" title="Inserir imagem, cena, caixa, menção">${I('plus')}<span class="ik-tl">Inserir</span><i class="ik-cv">▼</i></button>
    <button class="tb ik-mb" id="tbCmt" data-act="tbMenu" data-m="rev" title="Comentários, versões">${I('check')}<span class="ik-tl">Revisar</span><i class="ik-cv">▼</i></button>
    <button class="tb ik-mb" data-act="tbMenu" data-m="view" title="Réguas, foco, notas, impressão">${I('eye')}<span class="ik-tl">Exibir</span><i class="ik-cv">▼</i></button>
    <span class="sp"></span>
    <button class="tb hide-m" data-act="findOpen" title="Localizar e substituir (Ctrl+F)">${I('search')}</button><button class="tb hide-m" data-act="notes" title="Notas e comentários">${I('notes')}</button>
   </div>
   <div class="stage"><div class="scroller" id="scroller">
    <article class="paper" id="paper">
     <div class="ch-kicker" id="kicker"></div>
     <input class="ch-title" id="chtitle" placeholder="Título do capítulo" aria-label="Título do capítulo">
     <div id="page" class="prose" spellcheck="true" lang="pt-BR"></div>
    </article></div><div class="wm-layer" id="wml"></div></div>
   <footer class="ed-f"><span id="cnt">0 palavras</span><span class="sp"></span><button class="btn sm" id="toBook" data-act="toBook" style="display:none">Mover para o livro →</button>
    <label class="row" style="gap:6px">Status <select id="chst">${Object.entries(STATUS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label></footer>
  </section>
  <aside class="notes" id="notes"><div class="in"><div class="row"><div class="seg nseg"><button data-nt="notes" class="on">📝 Notas</button><button data-nt="cmts">💬 Comentários <b id="cmN"></b></button></div><span class="sp"></span><button class="btn sm ghost" data-act="notes">×</button></div><div id="ntNotes" class="ntp"><p class="small muted" style="margin:0">Ideias, pendências, pistas — não aparecem na exportação.</p><textarea id="notesTa" placeholder="Anote aqui…"></textarea></div><div id="ntCmts" class="ntp" style="display:none"></div></div></aside>
 </div>`;
 applyEditorStyle();bindEditor();renderChList();bindTreeDnD();
 if(S.cid)await openChapter(S.cid,true);else showNoChapter();
};
function showNoChapter(){$('#paper').innerHTML=`<div class="empty"><div class="big">Nenhum capítulo ainda</div><p>Crie o primeiro e comece a escrever.</p><button class="btn primary" data-act="chAdd">${I('plus')} Criar capítulo</button></div>`}
function applyEditorStyle(){
 const s=P().settings,paper=$('#paper'),page=$('#page');if(!paper)return;
 paper.style.setProperty('--bf',fontStack(s.bodyFont));paper.style.setProperty('--hf',fontStack(s.headFont));
 paper.style.setProperty('--fs',s.fontSize+'px');paper.style.setProperty('--lh',s.lineHeight);paper.style.setProperty('--align',s.align);paper.style.setProperty('--pw',s.pageWidth+'px');
 if(page){page.classList.toggle('web',s.paraStyle==='web');page.classList.toggle('dropcap',!!s.dropcap)}
 renderWmLayer($('#wml'),s.wm.enabled&&s.wm.showInEditor);
}
/* estrutura: pastas, capítulos e rascunhos */
const cm=id=>P().chapters.find(c=>c.id===id);
function ensureOutline(p){
 const ids=new Set(p.chapters.map(c=>c.id)),seen=new Set();
 if(!Array.isArray(p.outline))p.outline=p.chapters.filter(c=>!(p.drafts||[]).includes(c.id)).map(c=>({t:'c',id:c.id}));
 p.drafts=Array.isArray(p.drafts)?p.drafts:[];
 const take=id=>ids.has(id)&&!seen.has(id)&&!!seen.add(id);
 p.outline=p.outline.filter(n=>{if(n&&n.t==='f'){n.items=(n.items||[]).filter(take);n.title=n.title||'Pasta';return true}return n&&take(n.id)});
 p.drafts=p.drafts.filter(take);
 p.chapters.forEach(c=>{if(!seen.has(c.id)){seen.add(c.id);p.outline.push({t:'c',id:c.id})}});
}
function bookOrder(p=P()){const out=[];(p.outline||[]).forEach(n=>{if(n.t==='f')n.items.forEach(id=>out.push({id,folder:n}));else out.push({id:n.id,folder:null})});return out}
function chNum(id){const i=bookOrder().findIndex(x=>x.id===id);return i<0?null:i+1}
function where(id){const p=P();if(p.drafts.includes(id))return{where:'drafts'};for(const n of p.outline){if(n.t==='c'&&n.id===id)return{where:'root'};if(n.t==='f'&&n.items.includes(id))return{where:'folder',fid:n.id,folder:n}}return{where:'root'}}
function detach(id){const p=P();let i=p.drafts.indexOf(id);if(i>=0){p.drafts.splice(i,1);return}
 for(let k=0;k<p.outline.length;k++){const n=p.outline[k];if(n.t==='c'&&n.id===id){p.outline.splice(k,1);return}if(n.t==='f'){i=n.items.indexOf(id);if(i>=0){n.items.splice(i,1);return}}}}
function placeChapter(id,dest){
 detach(id);const p=P();const b=dest.before;
 if(dest.where==='drafts'){const i=b?p.drafts.indexOf(b):-1;i>=0?p.drafts.splice(i,0,id):p.drafts.push(id);return}
 if(dest.where==='folder'){const f=p.outline.find(n=>n.t==='f'&&n.id===dest.fid);if(f){const i=b?f.items.indexOf(b):-1;i>=0?f.items.splice(i,0,id):f.items.push(id);f.open=true;return}}
 const i=b?p.outline.findIndex(n=>n.id===b):-1;const node={t:'c',id};i>=0?p.outline.splice(i,0,node):p.outline.push(node);
}
function moveWithin(id,d){const p=P(),w=where(id);let arr=w.where==='drafts'?p.drafts:w.where==='folder'?w.folder.items:null;
 if(!arr){const i=p.outline.findIndex(n=>n.t==='c'&&n.id===id),j=i+d;if(i<0||j<0||j>=p.outline.length)return;[p.outline[i],p.outline[j]]=[p.outline[j],p.outline[i]];return}
 const i=arr.indexOf(id),j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]]}
function renderChList(){
 const p=P(),box=$('#tree');if(!box)return;ensureOutline(p);let n=0;
 const li=(id,label)=>{const c=cm(id);if(!c)return'';return `<li class="ch ${id===S.cid?'on':''}" data-act="openCh" data-id="${id}" draggable="true" data-drag="c:${id}"><span class="n">${label}</span><span class="t">${esc(c.title||'Sem título')}</span><span class="dot st-${c.status||'rascunho'}" title="${STATUS[c.status||'rascunho']}"></span><span class="w">${fmtK(c.words||0)}</span><span class="ops"><button data-act="chMenu" data-id="${id}" title="Mover e opções">⋯</button></span></li>`};
 const items=p.outline.map(node=>node.t==='f'
  ?`<li class="tf ${node.open===false?'closed':''}"><div class="tf-h" data-act="fToggle" data-fid="${node.id}" draggable="true" data-drag="f:${node.id}" data-drop="f:${node.id}"><span class="caret">▾</span>${I('folder')}<span class="t">${esc(node.title)}</span><span class="cnt">${node.items.length}</span><span class="ops"><button data-act="chAdd" data-fid="${node.id}" title="Novo capítulo nesta pasta">+</button><button data-act="fMenu" data-fid="${node.id}" title="Opções da pasta">⋯</button></span></div><ul class="tl">${node.items.map(id=>li(id,++n)).join('')||`<li class="tempty" data-drop="f:${node.id}">Arraste capítulos para cá</li>`}</ul></li>`
  :li(node.id,++n)).join('');
 box.innerHTML=`<div class="tproj" data-drop="root">${I('book')}<span class="t">${esc(p.title)}</span></div>
  <ul class="tl root">${items||'<li class="tempty" data-drop="root">Nenhum capítulo ainda</li>'}</ul>
  <div class="td"><div class="td-h" data-drop="d">${I('notes')}<span class="t">Rascunhos</span><span class="cnt">${p.drafts.length}</span><button class="btn sm ghost" data-act="chAdd" data-draft="1" title="Novo rascunho" style="padding:2px 6px">${I('plus')}</button></div>
  <ul class="tl">${p.drafts.map(id=>li(id,'✎')).join('')||'<li class="tempty" data-drop="d">Ideias soltas e cenas avulsas — não entram no livro.</li>'}</ul></div>`;
 const total=bookOrder().reduce((a,o)=>a+((cm(o.id)||{}).words||0),0),g=p.settings.goal||0;
 $('#sidef').innerHTML=`<div class="row"><span><b style="color:var(--ink)">${fmtN(total)}</b> palavras no livro</span></div>
  ${g?`<div class="bar"><i style="width:${clamp(total/g*100,0,100)}%"></i></div>`:''}
  <div class="goal">Meta: <input type="number" id="goalIn" min="0" step="1000" value="${g}"> <span>${g?Math.round(total/g*100)+'%':''}</span></div>`;
 $('#goalIn').onchange=e=>{p.settings.goal=Math.max(0,+e.target.value||0);saveProject();renderChList()};
}
function bindTreeDnD(){
 const tree=$('#tree');if(!tree)return;let drag=null;
 const target=el=>el&&el.closest&&el.closest('.ch,[data-drop]');
 tree.addEventListener('dragstart',e=>{const el=e.target.closest('[data-drag]');if(!el)return;drag=el.dataset.drag;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',drag)}catch{}});
 tree.addEventListener('dragover',e=>{const t=target(e.target);if(!t||!drag)return;e.preventDefault();$$('.dragover',tree).forEach(x=>x!==t&&x.classList.remove('dragover'));t.classList.add('dragover')});
 tree.addEventListener('dragleave',e=>{const t=target(e.target);if(t&&!t.contains(e.relatedTarget))t.classList.remove('dragover')});
 tree.addEventListener('dragend',()=>{drag=null;$$('.dragover',tree).forEach(x=>x.classList.remove('dragover'))});
 tree.addEventListener('drop',e=>{const t=target(e.target);if(!t||!drag)return;e.preventDefault();t.classList.remove('dragover');const [k,id]=drag.split(':');drag=null;const p=P();
  if(k==='c'){
   if(t.classList.contains('ch')){const tid=t.dataset.id;if(tid===id)return;placeChapter(id,{...where(tid),before:tid})}
   else{const d=t.dataset.drop;if(d==='root')placeChapter(id,{where:'root'});else if(d==='d')placeChapter(id,{where:'drafts'});else if(d.startsWith('f:'))placeChapter(id,{where:'folder',fid:d.slice(2)})}
  }else if(k==='f'){
   let before=null;if(t.classList.contains('ch')){if(where(t.dataset.id).where!=='root')return;before=t.dataset.id}else if(t.dataset.drop.startsWith('f:'))before=t.dataset.drop.slice(2);else if(t.dataset.drop!=='root')return;
   if(before===id)return;const i=p.outline.findIndex(n=>n.id===id);if(i<0)return;const [node]=p.outline.splice(i,1);const j=before?p.outline.findIndex(n=>n.id===before):-1;j>=0?p.outline.splice(j,0,node):p.outline.push(node);
  }
  saveProject();renderChList();updateKicker()});
}
function updateKicker(){const p=P(),k=$('#kicker');if(!k||!S.cid)return;const w=where(S.cid);
 k.textContent=w.where==='drafts'?'Rascunho':(w.folder?w.folder.title+' · ':'')+(p.type==='rpg'?'Seção ':'Capítulo ')+chNum(S.cid);
 const b=$('#toBook');if(b)b.style.display=w.where==='drafts'?'':'none'}
ACT.toBook=()=>{if(!S.cid)return;placeChapter(S.cid,{where:'root'});saveProject();renderChList();updateKicker();toast('Movido para o livro')};
ACT.fToggle=el=>{const f=P().outline.find(n=>n.id===el.dataset.fid);if(!f)return;f.open=f.open===false;saveProject();renderChList()};
ACT.fAdd=async()=>{const t=await ask('Nova pasta','Nome da pasta (ex.: Parte I — O Chamado)');if(!t)return;const p=P();ensureOutline(p);p.outline.push({t:'f',id:uid(),title:t,open:true,items:[]});saveProject();renderChList()};
ACT.fMenu=async el=>{const p=P(),f=p.outline.find(n=>n.t==='f'&&n.id===el.dataset.fid);if(!f)return;
 const v=await modal({title:'📁 '+esc(f.title),body:`<div class="menu-list"><button class="btn" data-v="add">+ Novo capítulo aqui</button><button class="btn" data-v="ren">✎ Renomear</button><button class="btn" data-v="up">↑ Subir pasta</button><button class="btn" data-v="down">↓ Descer pasta</button><button class="btn danger" data-v="del">🗑 Excluir pasta</button></div>`,onMount:(ov,close)=>$$('[data-v]',ov).forEach(b=>b.onclick=()=>close(b.dataset.v)),actions:[{label:'Fechar'}]});
 if(!v)return;
 if(v==='add')return ACT.chAdd({dataset:{fid:f.id}});
 if(v==='ren'){const t=await ask('Renomear pasta','Nome',f.title);if(!t)return;f.title=t}
 else if(v==='up'||v==='down'){const i=p.outline.indexOf(f),j=i+(v==='up'?-1:1);if(j<0||j>=p.outline.length)return;[p.outline[i],p.outline[j]]=[p.outline[j],p.outline[i]]}
 else if(v==='del'){if(!await confirmDlg(`Excluir a pasta “${esc(f.title)}”? Os ${f.items.length} capítulo(s) dela vão para a raiz do livro, nada é apagado.`,'Excluir pasta'))return;p.outline.splice(p.outline.indexOf(f),1,...f.items.map(id=>({t:'c',id})))}
 saveProject();renderChList();updateKicker()};
ACT.chMenu=async el=>{const p=P(),id=el.dataset.id,c=cm(id);if(!c)return;const w=where(id);
 const opts=[['up','↑ Subir'],['down','↓ Descer'],...(w.where!=='root'?[['root','📖 Mover para a raiz do livro']]:[]),...p.outline.filter(n=>n.t==='f'&&!(w.where==='folder'&&w.fid===n.id)).map(n=>['f:'+n.id,'📁 Mover para “'+n.title+'”']),...(w.where!=='drafts'?[['drafts','📝 Mover para Rascunhos']]:[]),['del','🗑 Excluir']];
 const v=await modal({title:esc(c.title||'Capítulo'),body:`<div class="menu-list">${opts.map(([k,l])=>`<button class="btn ${k==='del'?'danger':''}" data-v="${esc(k)}">${esc(l)}</button>`).join('')}</div>`,onMount:(ov,close)=>$$('[data-v]',ov).forEach(b=>b.onclick=()=>close(b.dataset.v)),actions:[{label:'Fechar'}]});
 if(!v)return;if(v==='del')return deleteChapter(id);
 if(v==='up'||v==='down')moveWithin(id,v==='up'?-1:1);else if(v==='root')placeChapter(id,{where:'root'});else if(v==='drafts')placeChapter(id,{where:'drafts'});else if(v.startsWith('f:'))placeChapter(id,{where:'folder',fid:v.slice(2)});
 saveProject();renderChList();updateKicker()};
async function deleteChapter(id){
 const p=P(),c=cm(id);if(!c)return;
 if(!await confirmDlg(`Excluir “${esc(c.title)}”? O texto será apagado definitivamente.`))return;
 detach(id);p.chapters=p.chapters.filter(x=>x.id!==id);queueWrite('c_'+id,null);delete S.cache[id];saveProject();
 if(S.cid===id){S.chDirty=false;const nx=bookOrder()[0];S.cid=nx?nx.id:(p.drafts[0]||null);if(S.cid)await openChapter(S.cid,true);else{renderChList();showNoChapter()}}else renderChList();
}
async function getChapter(id){
 if(S.cache[id])return S.cache[id];
 let d=null;try{d=await Store.get('c_'+id)}catch(e){toast('Não foi possível carregar o capítulo agora.','err')}
 const r={html:d&&d.html||'',notes:d&&d.notes||''};S.cache[id]=r;return r;
}
async function openChapter(id,initial){
 if(!initial)await flushChapter();
 S.cid=id;P().lastCh=id;renderChList();closeSide();
 const p=P(),c=p.chapters.find(x=>x.id===id);if(!c)return;
 if(!$('#page')){await RENDER.write();return}
 const page=$('#page');page.contentEditable='false';page.innerHTML='<p class="muted">Carregando…</p>';
 const d=await getChapter(id);if(S.cid!==id||!$('#page'))return;
 page.innerHTML=d.html||'<p><br></p>';page.contentEditable='true';
 $('#chtitle').value=c.title||'';$('#chst').value=c.status||'rascunho';$('#notesTa').value=d.notes||'';
 updateKicker();updateCounts();$('#scroller').scrollTop=0;S.chDirty=false;
}
function closeSide(){$('#side')&&$('#side').classList.remove('open');$('#scrim')&&$('#scrim').classList.remove('open')}
ACT.side=()=>{$('#side').classList.toggle('open');$('#scrim').classList.toggle('open')};
ACT.openCh=el=>{if(el.dataset.id!==S.cid)openChapter(el.dataset.id);else closeSide()};
ACT.chAdd=async el=>{
 const p=P();await flushChapter();ensureOutline(p);
 const fid=el&&el.dataset&&el.dataset.fid,draft=el&&el.dataset&&el.dataset.draft;
 const id=uid();p.chapters.push({id,title:draft?'Rascunho':(p.type==='rpg'?'Nova seção':'Capítulo '+(bookOrder().filter(o=>{const m=chMeta(o.id);return !(m&&typeof m.kicker==='string')}).length+1)),status:'rascunho',words:0});
 placeChapter(id,draft?{where:'drafts'}:fid?{where:'folder',fid}:{where:'root'});
 S.cache[id]={html:'',notes:''};queueWrite('c_'+id,{kind:'chapter',pid:p.id,id,html:'',notes:''});saveProject();
 if(!$('#page')){S.cid=id;await RENDER.write()}else await openChapter(id);
 const t=$('#chtitle');if(t){t.focus();t.select()}
};
ACT.notes=()=>$('#notes').classList.toggle('open');
ACT.focusMode=()=>document.body.classList.toggle('focus');
function updateCounts(){
 const page=$('#page');if(!page)return;const t=page.innerText||'';const w=countWords(t);
 $('#cnt').textContent=`${fmtN(w)} palavras · ${fmtN(t.replace(/\s/g,'').length)} caracteres · ~${Math.max(1,Math.round(w/230))} min de leitura`;
 const c=P().chapters.find(x=>x.id===S.cid);if(c&&c.words!==w){c.words=w;const li=$(`.ch[data-id="${S.cid}"] .w`);if(li)li.textContent=fmtK(w)}
}
const scheduleSave=debounce(()=>saveChapterNow(),1100);
function markDirty(){S.chDirty=true;scheduleSave();updateCountsT()}
const updateCountsT=debounce(updateCounts,400);
function saveChapterNow(){
 const page=$('#page');if(!S.chDirty||!page||!S.cid||page.contentEditable!=='true')return;
 const html=page.innerHTML,notes=$('#notesTa').value;
 S.cache[S.cid]={html,notes};queueWrite('c_'+S.cid,{kind:'chapter',pid:P().id,id:S.cid,html,notes,updatedAt:Date.now()});
 S.chDirty=false;updateCounts();saveProject();
}
async function flushChapter(){scheduleSave.cancel();saveChapterNow()}
let savedRange=null;
function saveSel(){const s=getSelection();if(s.rangeCount){const r=s.getRangeAt(0);if($('#page')&&$('#page').contains(r.commonAncestorContainer))savedRange=r.cloneRange()}}
function restoreSel(){const page=$('#page');if(!page)return false;const sr=savedRange;if(document.activeElement!==page)page.focus();if(sr&&page.contains(sr.commonAncestorContainer)){savedRange=sr;const s=getSelection();s.removeAllRanges();s.addRange(sr);return true}
 const r=document.createRange();r.selectNodeContents(page);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r);return true}
function insertHTML(html){restoreSel();document.execCommand('insertHTML',false,html);markDirty();saveSel()}
function bindEditor(){
 const page=$('#page');
 try{document.execCommand('defaultParagraphSeparator',false,'p');document.execCommand('styleWithCSS',false,false)}catch{}
 page.addEventListener('input',markDirty);
 ['keyup','mouseup','focus'].forEach(ev=>page.addEventListener(ev,()=>{saveSel();syncToolbar()}));
 page.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();flushChapter();toast('Salvo')}
 });
 page.addEventListener('paste',async e=>{
  const cd=e.clipboardData;if(!cd)return;
  const files=[...cd.files].filter(f=>f.type.startsWith('image/'));
  e.preventDefault();
  if(files.length){for(const f of files)await insertImageFile(f);return}
  const h=cd.getData('text/html'),t=cd.getData('text/plain');
  document.execCommand('insertHTML',false,h?cleanPaste(h):txtToHtml(t));markDirty();
 });
 page.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('Files'))e.preventDefault()});
 page.addEventListener('drop',async e=>{
  const files=[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/'));if(!files.length)return;e.preventDefault();
  const r=document.caretRangeFromPoint?document.caretRangeFromPoint(e.clientX,e.clientY):null;if(r){savedRange=r}
  for(const f of files)await insertImageFile(f);
 });
 page.addEventListener('click',e=>{if(e.target.tagName==='IMG')showImgBar(e.target);else hideImgBar()});
 $('#scroller').addEventListener('scroll',hideImgBar);
 $('#tb').addEventListener('mousedown',e=>{if(e.target.closest('.tb'))e.preventDefault()});
 $('#tb').addEventListener('click',e=>{const b=e.target.closest('[data-cmd]');if(!b)return;restoreSel();document.execCommand(b.dataset.cmd,false,null);markDirty();syncToolbar()});
 $('#blk').onchange=e=>{restoreSel();const v=e.target.value;document.execCommand('formatBlock',false,v==='p'?'<p>':'<'+v+'>');markDirty();page.focus()};
 $('#chtitle').oninput=e=>{const c=P().chapters.find(x=>x.id===S.cid);if(!c)return;c.title=e.target.value;const li=$(`.ch[data-id="${S.cid}"] .t`);if(li)li.textContent=c.title||'Sem título';saveProject()};
 $('#chtitle').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();page.focus()}};
 $('#chst').onchange=e=>{const c=P().chapters.find(x=>x.id===S.cid);if(!c)return;c.status=e.target.value;saveProject();renderChList()};
 $('#notesTa').oninput=()=>{S.chDirty=true;scheduleSave()};
}
const syncToolbarT=debounce(()=>syncToolbar(),120);
function syncToolbar(){
 const page=$('#page');if(!page||document.activeElement!==page)return;
 ['bold','italic','underline','strikeThrough','justifyLeft','justifyCenter','justifyRight','justifyFull','insertUnorderedList','insertOrderedList'].forEach(c=>{const b=$(`#tb [data-cmd="${c}"]`);if(b)try{b.classList.toggle('on',document.queryCommandState(c))}catch{}});
 try{let v=String(document.queryCommandValue('formatBlock')||'p').toLowerCase().replace(/[<>]/g,'');if(!['h2','h3','blockquote'].includes(v))v='p';$('#blk').value=v}catch{}
}
async function insertImageFile(f){
 const b=busy('Enviando imagem…');
 try{const r=await storeImage(f);addToGallery(f.name,r);insertHTML(`<img src="${esc(r.src)}" alt="">`);}
 catch(e){toast(e.message||'Falha ao enviar imagem','err')}finally{b.done()}
}
function addToGallery(name,r){const p=P();if(p.gallery.some(g=>g.src===r.src))return;p.gallery.unshift({id:uid(),name:name||'imagem',src:r.src,assetId:r.assetId||null,w:r.w,h:r.h,added:Date.now()});saveProject()}
ACT.insImg=async()=>{saveSel();
 const p=P();
 if(p.gallery.length){
  const v=await modal({title:'Inserir imagem',wide:true,body:`<div class="row" style="margin-bottom:10px"><button class="btn primary" id="upNew">${I('up')} Enviar nova imagem</button><span class="muted small">ou escolha da galeria:</span></div><div class="gal" style="margin-top:0">${p.gallery.map(g=>`<button class="gi" data-src="${esc(g.src)}" style="cursor:pointer;padding:0"><div class="im"><img src="${esc(g.src)}" alt=""></div><div class="bd"><div class="nm">${esc(g.name)}</div></div></button>`).join('')}</div>`,
   onMount:(ov,close)=>{$('#upNew',ov).onclick=()=>close('__new');$$('.gi',ov).forEach(b=>b.onclick=()=>close(b.dataset.src))},actions:[{label:'Cancelar'}]});
  if(!v)return;if(v!=='__new'){insertHTML(`<img src="${esc(v)}" alt="">`);return}
 }
 const files=await pickFile('image/*',true);for(const f of files)await insertImageFile(f);
};
ACT.insScene=()=>insertHTML('<hr class="scene"><p><br></p>');
ACT.insBox=()=>insertHTML('<aside class="boxed"><p>'+(P().type==='rpg'?'Leia em voz alta: ':'')+'…</p></aside><p><br></p>');
ACT.insStat=async()=>{saveSel();
 const p=P();if(!p.codex.length){toast('O compêndio está vazio. Crie fichas na aba Compêndio.');return}
 const id=await modal({title:'Inserir ficha do compêndio',body:`<div class="cklist" style="max-height:340px">${p.codex.map(e=>`<label style="cursor:pointer"><input type="radio" name="sb" value="${e.id}"> <b>${esc(e.name)}</b> <span class="muted small">${esc(e.cat)}</span></label>`).join('')}</div>`,
  actions:[{label:'Cancelar'},{label:'Inserir',cls:'primary',onClick:ov=>{const r=$('input[name=sb]:checked',ov);return r?r.value:false}}]});
 const e=p.codex.find(x=>x.id===id);if(e)insertHTML(statblockHTML(e)+'<p><br></p>');
};
function statblockHTML(e){
 const ab=(e.attrs||[]).filter(([k,v])=>/^[A-ZÇ]{3}$/.test(k)&&v!=='');const other=(e.attrs||[]).filter(([k,v])=>!/^[A-ZÇ]{3}$/.test(k)&&v!=='');
 const mod=v=>{const n=parseInt(v,10);if(isNaN(n))return'';const m=Math.floor((n-10)/2);return ` (${m>=0?'+':''}${m})`};
 return `<aside class="statblock"><h4>${esc(e.name)}</h4><p class="sb-sub">${esc(e.cat)}${e.tags?' · '+esc(e.tags):''}</p>${other.map(([k,v])=>`<p><b>${esc(k)}</b> ${esc(v)}</p>`).join('')}${ab.length?`<table><tr>${ab.map(([k])=>`<th>${esc(k)}</th>`).join('')}</tr><tr>${ab.map(([,v])=>`<td>${esc(v)}${mod(v)}</td>`).join('')}</tr></table>`:''}${e.desc?e.desc.split(/\n+/).map(l=>`<p>${esc(l)}</p>`).join(''):''}</aside>`;
}
let selImg=null;
function showImgBar(img){selImg=img;$$('#page img.sel').forEach(i=>i.classList.remove('sel'));img.classList.add('sel');const r=img.getBoundingClientRect(),b=$('#imgbar');b.style.display='flex';b.style.left=clamp(r.left+r.width/2-b.offsetWidth/2,8,innerWidth-b.offsetWidth-8)+'px';b.style.top=Math.max(8,r.top-44)+'px'}
function hideImgBar(){$('#imgbar').style.display='none';if(selImg)selImg.classList.remove('sel');selImg=null}
$('#imgbar').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!selImg)return;const w=b.dataset.w;if(w==='del'){selImg.remove()}else{selImg.style.width=w+'%'}hideImgBar();markDirty()});

/* ---------- MARCA D'ÁGUA ---------- */
async function wmItem(wm,ratio=2){
 let bw,bh,draw;
 if(wm.type==='image'&&wm.image){
  let img;try{img=await loadImg(wm.image)}catch{return null}
  bw=(wm.imgScale||35)/100*400;bh=bw*img.naturalHeight/img.naturalWidth;
  draw=x=>x.drawImage(img,-bw/2,-bh/2,bw,bh);
 }else{
  const lines=String(wm.text||'').split('\n').filter(Boolean);if(!lines.length)return null;
  const font=`600 ${wm.size}px ${fontStack(wm.font)}`;try{await document.fonts.load(font,lines.join(''))}catch{}
  const m=document.createElement('canvas').getContext('2d');m.font=font;
  bw=Math.max(...lines.map(l=>m.measureText(l).width));bh=lines.length*wm.size*1.2;
  draw=x=>{x.font=font;x.fillStyle=wm.color;x.textAlign='center';x.textBaseline='middle';lines.forEach((l,i)=>x.fillText(l,0,(i-(lines.length-1)/2)*wm.size*1.2))};
 }
 const t=(wm.rotation||0)*Math.PI/180,RW=Math.abs(bw*Math.cos(t))+Math.abs(bh*Math.sin(t)),RH=Math.abs(bw*Math.sin(t))+Math.abs(bh*Math.cos(t));
 return {bw,bh,RW,RH,render:(gap=0)=>{
  const c=document.createElement('canvas');c.width=Math.ceil((RW+gap)*ratio);c.height=Math.ceil((RH+gap)*ratio);
  const x=c.getContext('2d');x.scale(ratio,ratio);x.translate((RW+gap)/2,(RH+gap)/2);x.rotate(t);x.globalAlpha=clamp(wm.opacity,0,1);draw(x);
  return c}};
}
const WM_POS={center:'center center','br':'right 28px bottom 28px','bl':'left 28px bottom 28px','tr':'right 28px top 28px','tl':'left 28px top 28px'};
let wmSeq=0;
async function renderWmLayer(el,on,wmOverride){
 if(!el)return;const seq=++wmSeq;const wm=wmOverride||P().settings.wm;
 if(!on){el.style.backgroundImage='none';return}
 const it=await wmItem(wm,2);if(seq!==wmSeq&&!wmOverride)return;
 if(!it){el.style.backgroundImage='none';return}
 const tile=wm.mode==='tile',gap=tile?(+wm.gap||0):0,c=it.render(gap);
 el.style.backgroundImage=`url(${c.toDataURL('image/png')})`;
 el.style.backgroundSize=`${(it.RW+gap)}px ${(it.RH+gap)}px`;
 el.style.backgroundRepeat=tile?'repeat':'no-repeat';
 el.style.backgroundPosition=tile?'center top':WM_POS[wm.mode]||'center';
}
async function watermarkCanvas(ctx,W,H,wm){
 const k=W/800,it=await wmItem(wm,k);if(!it)return;
 if(wm.mode==='tile'){const c=it.render(+wm.gap||0);const pat=ctx.createPattern(c,'repeat');ctx.save();ctx.fillStyle=pat;ctx.fillRect(0,0,W,H);ctx.restore();return}
 const c=it.render(0),w=c.width,h=c.height,m=28*k;
 const pos={center:[(W-w)/2,(H-h)/2],br:[W-w-m,H-h-m],bl:[m,H-h-m],tr:[W-w-m,m],tl:[m,m]}[wm.mode]||[(W-w)/2,(H-h)/2];
 ctx.drawImage(c,pos[0],pos[1]);
}
async function watermarkPdf(pdf,wm,pageWmm){
 const k=pageWmm/(P().settings.pageWidth*0.2646)*0.2646; // mm por px do editor
 const it=await wmItem(wm,3);if(!it)return;
 const tile=wm.mode==='tile',gap=tile?(+wm.gap||0):0;const c=it.render(gap),url=c.toDataURL('image/png');
 const w=(it.RW+gap)*k,h=(it.RH+gap)*k,n=pdf.internal.getNumberOfPages(),PW=pdf.internal.pageSize.getWidth(),PH=pdf.internal.pageSize.getHeight(),m=10;
 for(let i=1;i<=n;i++){pdf.setPage(i);
  if(tile){for(let y=0;y<PH;y+=h)for(let x=0;x<PW;x+=w)pdf.addImage(url,'PNG',x,y,w,h,'wm','FAST')}
  else{const pos={center:[(PW-w)/2,(PH-h)/2],br:[PW-w-m,PH-h-m],bl:[m,PH-h-m],tr:[PW-w-m,m],tl:[m,m]}[wm.mode]||[(PW-w)/2,(PH-h)/2];pdf.addImage(url,'PNG',pos[0],pos[1],w,h,'wm','FAST')}
 }
}

/* ---------- COMPÊNDIO ---------- */
RENDER.codex=()=>{
 const p=P(),cats=CATS[p.type]||CATS.book;
 const q=S.codexQ.toLowerCase();
 const list=p.codex.filter(e=>(S.codexCat==='Todos'||e.cat===S.codexCat)&&(!q||(e.name+' '+(e.tags||'')+' '+(e.desc||'')).toLowerCase().includes(q)));
 $('#view').innerHTML=`<div class="scrollview"><div class="wrapc">
  <div class="vh"><div class="grow"><h2>${p.type==='rpg'?'Compêndio':'Wiki do mundo'}</h2><p>${p.type==='rpg'?'Personagens, criaturas, locais, itens e regras da sua campanha.':'Personagens, lugares e tudo o que dá vida à sua história.'}</p></div>
   <input id="cxq" placeholder="Buscar…" value="${esc(S.codexQ)}" style="max-width:220px"><button class="btn primary" data-act="cxNew">${I('plus')} Nova ficha</button></div>
  <div class="chips">${['Todos',...cats].map(c=>`<button class="chip ${S.codexCat===c?'on':''}" data-act="cxCat" data-c="${esc(c)}">${esc(c)} <span style="opacity:.6">${c==='Todos'?p.codex.length:p.codex.filter(e=>e.cat===c).length}</span></button>`).join('')}</div>
  ${list.length?`<div class="cx-grid">${list.map(e=>`<div class="cx" data-act="cxEdit" data-id="${e.id}"><div class="im">${e.img?`<img src="${esc(e.img)}" alt="">`:esc((e.name||'?')[0].toUpperCase())}</div><div class="bd"><div class="nm">${esc(e.name)}</div><span class="pill">${esc(e.cat)}</span>${e.tags?` <span class="small muted">${esc(e.tags)}</span>`:''}<div class="at">${(e.attrs||[]).filter(a=>a[1]).slice(0,4).map(a=>`<span class="pill">${esc(a[0])}: ${esc(a[1])}</span>`).join('')}</div></div></div>`).join('')}</div>`
   :`<div class="empty"><div class="big">${p.codex.length?'Nada encontrado':'Comece seu compêndio'}</div><p>${p.codex.length?'Tente outra busca ou categoria.':'Crie fichas para manter tudo consistente — e insira-as direto nos capítulos.'}</p></div>`}
 </div></div>`;
 const qi=$('#cxq');qi.oninput=debounce(()=>{S.codexQ=qi.value;RENDER.codex();const n=$('#cxq');n.focus();n.setSelectionRange(n.value.length,n.value.length)},250);
};
ACT.cxCat=el=>{S.codexCat=el.dataset.c;RENDER.codex()};
ACT.cxNew=()=>editEntry(null);
ACT.cxEdit=el=>editEntry(el.dataset.id);
async function editEntry(id){
 const p=P(),cats=catsOf(p);
 const isNew=!id;const e=isNew?{id:uid(),cat:S.codexCat!=='Todos'?S.codexCat:cats[0],name:'',img:null,tags:'',attrs:[],desc:''}:clone(p.codex.find(x=>x.id===id));
 if(isNew)e.attrs=catAttrsOf(p,e.cat).map(k=>[k,'']);
 const attrsHTML=()=>e.attrs.map((a,i)=>`<div class="attr-row"><input data-k="${i}" value="${esc(a[0])}" placeholder="Atributo"><input data-v="${i}" value="${esc(a[1])}" placeholder="Valor"><button class="btn sm ghost" data-rm="${i}">✕</button></div>`).join('');
 const res=await modal({title:isNew?'Nova ficha':esc(e.name),wide:true,body:`<div class="ent-grid">
   <div><div class="ent-img" id="eImg">${e.img?`<img src="${esc(e.img)}" alt="">`:'Toque para<br>adicionar imagem'}</div><button class="btn sm" id="eGen" style="margin-top:6px;width:100%">🎨 Gerar com IA</button>${e.img?'<button class="btn sm ghost" id="eImgRm" style="margin-top:6px;width:100%">Remover imagem</button>':''}</div>
   <div><div class="row"><div class="grow"><label class="f">Nome</label><input id="eName" value="${esc(e.name)}" placeholder="Nome"></div><div style="width:170px"><label class="f">Categoria</label><select id="eCat">${cats.map(c=>`<option ${c===e.cat?'selected':''}>${esc(c)}</option>`).join('')}</select></div></div>
   <label class="f">Etiquetas</label><input id="eTags" value="${esc(e.tags)}" placeholder="ex.: aliado, capítulo 3, norte">
   <label class="f">Atributos</label><div id="eAttrs">${attrsHTML()}</div><button class="btn sm" id="eAdd">${I('plus')} Atributo</button> <button class="btn sm ghost" id="eDef" title="Novas fichas desta categoria começam com estes atributos">Usar como padrão da categoria</button>
   <label class="f">Descrição</label><textarea id="eDesc" rows="6" placeholder="História, aparência, comportamento, regras…">${esc(e.desc)}</textarea>${isNew?'':'<label class="f">Aparece em</label><div id="eRefs" class="refs small muted">Procurando nos capítulos…</div>'}</div></div>`,
  onMount:(ov,close)=>{
   const sync=()=>{$$('[data-k]',ov).forEach(i=>e.attrs[i.dataset.k][0]=i.value);$$('[data-v]',ov).forEach(i=>e.attrs[i.dataset.v][1]=i.value);e.name=$('#eName',ov).value;e.tags=$('#eTags',ov).value;e.desc=$('#eDesc',ov).value};
   const bindAttrs=()=>$$('[data-rm]',ov).forEach(b=>b.onclick=()=>{sync();e.attrs.splice(+b.dataset.rm,1);$('#eAttrs',ov).innerHTML=attrsHTML();bindAttrs()});bindAttrs();
   $('#eAdd',ov).onclick=()=>{sync();e.attrs.push(['','']);$('#eAttrs',ov).innerHTML=attrsHTML();bindAttrs();$$('[data-k]',ov).pop().focus()};
   $('#eCat',ov).onchange=ev=>{sync();e.cat=ev.target.value;const empty=e.attrs.every(a=>!a[1]);if(empty){e.attrs=catAttrsOf(p,e.cat).map(k=>[k,'']);$('#eAttrs',ov).innerHTML=attrsHTML();bindAttrs()}};
   $('#eImg',ov).onclick=async()=>{const [f]=await pickFile('image/*');if(!f)return;const b=busy('Enviando imagem…');try{const r=await storeImage(f);e.img=r.src;addToGallery(f.name,r);$('#eImg',ov).innerHTML=`<img src="${esc(r.src)}" alt="">`}catch(er){toast(er.message,'err')}finally{b.done()}};
   $('#eGen',ov).onclick=async()=>{const r=await genImage();if(r){e.img=r.src;$('#eImg',ov).innerHTML=`<img src="${esc(r.src)}" alt="">`}};
   const rm=$('#eImgRm',ov);if(rm)rm.onclick=()=>{e.img=null;$('#eImg',ov).innerHTML='Toque para<br>adicionar imagem';rm.remove()};
   ov._sync=sync;if(!isNew)fillRefs($('#eRefs',ov),e,close);
   $('#eDef',ov).onclick=()=>{sync();p.catAttrs=p.catAttrs||{};p.catAttrs[e.cat]=e.attrs.map(a=>a[0]).filter(Boolean);saveProject();toast('Novas fichas de “'+e.cat+'” começam com estes atributos')};
  },
  actions:[...(isNew?[]:[{label:I('trash')+' Excluir',cls:'danger',value:'del'},{label:'Inserir no capítulo',value:'ins',onClick:ov=>{ov._sync();return 'ins'}}]),{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>{ov._sync();return 'save'}}]});
 if(!res)return;
 if(res==='del'){if(!await confirmDlg(`Excluir a ficha “${esc(e.name)}”?`))return;p.codex=p.codex.filter(x=>x.id!==e.id);saveProject();RENDER.codex();return}
 return finishEntry(e,isNew,res);
}
function finishEntry(e,isNew,res){
 e.name=(e.name||'').trim()||'Sem nome';e.attrs=e.attrs.filter(a=>a[0]||a[1]);
 const p=P();const i=p.codex.findIndex(x=>x.id===e.id);if(i>=0)p.codex[i]=e;else p.codex.unshift(e);saveProject();
 if(res==='ins'){showView('write').then(()=>{savedRange=null;insertHTML(statblockHTML(e)+'<p><br></p>');toast('Ficha inserida no fim do capítulo')});return}
 RENDER.codex();toast('Ficha salva');
}

/* ---------- DADOS ---------- */
const diceHist=[];
ACT.dice=()=>{const d=$('#dice');if(!d.classList.contains('open')){renderDice()}d.classList.toggle('open')};
function renderDice(last){
 const d=$('#dice');d.innerHTML=`<div class="row"><b style="font:600 15px var(--disp)">Rolador de dados</b><span class="sp"></span><button class="btn sm ghost" data-act="dice">×</button></div>
  <div class="res">${last?last.total:'—'}</div><div class="det">${last?esc(last.expr+' → '+last.detail):'Ex.: 1d20+5, 4d6, 2d8-1'}</div>
  <div class="dq">${[4,6,8,10,12,20,100].map(n=>`<button class="btn sm" data-roll="1d${n}">d${n}</button>`).join('')}<button class="btn sm" data-roll="4d6">4d6</button></div>
  <div class="row"><input id="dexp" placeholder="2d6+3" value="${esc(last?last.expr:'')}"><button class="btn primary" id="dgo">Rolar</button></div>
  <div class="dhist">${diceHist.slice(0,12).map(h=>`<div><b style="color:var(--ink)">${h.total}</b> · ${esc(h.expr)} <span>${esc(h.detail)}</span></div>`).join('')||'Nenhuma rolagem ainda.'}</div>`;
 const go=ex=>{try{const r=roll(ex);diceHist.unshift(r);renderDice(r)}catch{toast('Expressão inválida. Use algo como 2d6+3.','err')}};
 $$('[data-roll]',d).forEach(b=>b.onclick=()=>go(b.dataset.roll));
 $('#dgo',d).onclick=()=>go($('#dexp',d).value);$('#dexp',d).onkeydown=e=>{if(e.key==='Enter')go(e.target.value)};
}
function roll(expr){
 const s=String(expr).replace(/\s+/g,'').toLowerCase();
 if(!/^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/.test(s))throw new Error('inv');
 let total=0;const parts=[],dice=[];const rnd=n=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return 1+(a[0]%n)};
 s.replace(/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g,(m,sg,n,f,sg2,c)=>{
  if(f){const cnt=clamp(+n||1,1,100),fc=clamp(+f,2,1000);const rs=Array.from({length:cnt},()=>rnd(fc));rs.forEach(v=>dice.push({f:fc,v}));const sum=rs.reduce((a,b)=>a+b,0);total+=sg==='-'?-sum:sum;parts.push(`${sg||''}${cnt}d${fc}[${rs.join(',')}]`)}
  else{const v=+c;total+=sg2==='-'?-v:v;parts.push((sg2||'+')+v)}return m});
 return {expr:s,total,detail:parts.join(' '),dice};
}

/* ---------- GALERIA ---------- */
RENDER.gallery=()=>{
 const p=P();
 $('#view').innerHTML=`<div class="scrollview"><div class="wrapc">
  <div class="vh"><div class="grow"><h2>Galeria</h2><p>Ilustrações, mapas, retratos e capas do projeto.</p></div><button class="btn primary" data-act="genImg">🎨 Gerar com IA</button></div>
  <div class="drop" id="gdrop"><b>Arraste imagens aqui</b> ou toque para enviar<br><span class="small">PNG, JPG, WEBP, GIF ou SVG · imagens grandes são otimizadas automaticamente</span></div>
  ${p.gallery.length?`<div class="gal">${p.gallery.map(g=>`<div class="gi"><div class="im"><img src="${esc(g.src)}" alt="" loading="lazy"></div><div class="bd"><div class="nm" title="${esc(g.name)}">${esc(g.name)}${p.cover===g.src?' · <b>capa</b>':''}</div>
   <div class="acts"><button class="btn sm" data-act="gIns" data-id="${g.id}" title="Inserir no capítulo atual">Inserir</button><button class="btn sm" data-act="gCover" data-id="${g.id}">Capa</button><button class="btn sm" data-act="gConv" data-id="${g.id}" title="Converter / marca d'água">Converter</button><button class="btn sm ghost danger" data-act="gDel" data-id="${g.id}" title="Remover da galeria">${I('trash')}</button></div></div></div>`).join('')}</div>`:'<div class="empty"><div class="big">Galeria vazia</div><p>As imagens que você inserir nos capítulos ou fichas também aparecem aqui.</p></div>'}
 </div></div>`;
 bindDrop($('#gdrop'),'image/*',true,async files=>{const b=busy('Enviando…');let n=0;for(const f of files){try{b.set(`Enviando ${++n} de ${files.length}…`);const r=await storeImage(f);addToGallery(f.name,r)}catch(e){toast(f.name+': '+e.message,'err')}}b.done();RENDER.gallery()});
};
function bindDrop(el,accept,multiple,cb){
 el.onclick=async()=>{const fs=await pickFile(accept,multiple);if(fs.length)cb(fs)};
 el.ondragover=e=>{e.preventDefault();el.classList.add('over')};el.ondragleave=()=>el.classList.remove('over');
 el.ondrop=e=>{e.preventDefault();el.classList.remove('over');const fs=[...e.dataTransfer.files];if(fs.length)cb(multiple?fs:[fs[0]])};
}
const gItem=el=>P().gallery.find(g=>g.id===el.dataset.id);
ACT.gIns=async el=>{const g=gItem(el);if(!g)return;await showView('write');savedRange=null;insertHTML(`<img src="${esc(g.src)}" alt="">`);toast('Imagem inserida no fim do capítulo')};
ACT.gCover=el=>{const g=gItem(el);if(!g)return;P().cover=g.src;saveProject();RENDER.gallery();toast('Capa definida')};
ACT.gDel=async el=>{const g=gItem(el);if(!g)return;if(!await confirmDlg('Remover esta imagem da galeria? Ela continua nos capítulos onde já foi usada.','Remover'))return;P().gallery=P().gallery.filter(x=>x.id!==g.id);if(P().cover===g.src)P().cover=null;saveProject();RENDER.gallery()};
ACT.gConv=el=>{const g=gItem(el);if(!g)return;S.conv={src:g.src,name:g.name};showView('convert')};

/* ---------- CONVERSOR ---------- */
RENDER.convert=()=>{
 const c=S.conv||{};
 $('#view').innerHTML=`<div class="scrollview"><div class="wrapc">
  <div class="vh"><div class="grow"><h2>Conversor</h2><p>Traga textos de outros programas e prepare imagens no formato certo.</p></div></div>
  <div class="grid2">
   <div class="card"><h3>📄 Documento → capítulos</h3><p class="muted small">Word (.docx), Markdown (.md), texto (.txt), HTML ou PDF. O conteúdo é dividido em capítulos automaticamente.</p>
    <div class="drop" id="ddrop"><b>Escolher arquivo</b> ou arraste aqui</div>
    <div id="impRes"></div></div>
   <div class="card"><h3>🖼 Conversor de imagem</h3><p class="muted small">Converta entre PNG, JPG e WEBP, redimensione e aplique sua marca d'água.</p>
    ${c.src?'':`<div class="drop" id="idrop"><b>Escolher imagem</b> ou arraste aqui</div>`}
    <div id="convBox"></div></div>
  </div></div></div>`;
 bindDrop($('#ddrop'),'.docx,.md,.markdown,.txt,.html,.htm,.pdf',false,fs=>importDoc(fs[0]));
 if($('#idrop'))bindDrop($('#idrop'),'image/*',false,async fs=>{const f=fs[0];S.conv={src:URL.createObjectURL(f),name:f.name,file:f};RENDER.convert()});
 if(S.imp)renderImport();
 if(c.src)renderConv();
};
async function importDoc(f){
 const ext=(f.name.split('.').pop()||'').toLowerCase();const b=busy('Lendo '+f.name+'…');
 try{
  let html='';
  if(ext==='docx'){await loadScript(LIB.mammoth);const r=await mammoth.convertToHtml({arrayBuffer:await f.arrayBuffer()});html=r.value}
  else if(ext==='md'||ext==='markdown'){await loadScript(LIB.marked);html=marked.parse(await f.text())}
  else if(ext==='html'||ext==='htm'){const d=new DOMParser().parseFromString(await f.text(),'text/html');html=d.body?d.body.innerHTML:''}
  else if(ext==='pdf'){html=await pdfToHtml(f,b)}
  else html=txtToHtml(await f.text());
  // imagens embutidas → armazenamento
  const d=document.createElement('div');d.innerHTML=clean(html);
  const imgs=$$('img',d).filter(i=>/^data:image\//.test(i.getAttribute('src')||''));
  for(let i=0;i<imgs.length;i++){b.set(`Guardando imagens (${i+1}/${imgs.length})…`);try{const blob=await (await fetch(imgs[i].src)).blob();const r=await storeImage(new File([blob],'imagem-'+(i+1)+'.png',{type:blob.type}));imgs[i].src=r.src;addToGallery(f.name.replace(/\.\w+$/,'')+' – img '+(i+1),r)}catch{imgs[i].remove()}}
  S.imp={name:f.name.replace(/\.\w+$/,''),html:d.innerHTML,mode:'auto'};renderImport();
 }catch(e){console.error(e);toast('Não consegui ler este arquivo: '+(e.message||e),'err')}finally{b.done()}
}
async function pdfToHtml(f,b){
 await loadScript(LIB.pdfjs);await loadScript(LIB.pdfw);
 const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;
 const paras=[];
 for(let n=1;n<=pdf.numPages;n++){
  b.set(`Lendo página ${n} de ${pdf.numPages}…`);
  const pg=await pdf.getPage(n);const tc=await pg.getTextContent();
  const lines=[];let cur=null;
  tc.items.forEach(it=>{if(!('str' in it))return;const y=Math.round(it.transform[5]),h=Math.abs(it.transform[3])||10;
   if(!cur||Math.abs(cur.y-y)>h*.5){cur={y,h,t:''};lines.push(cur)}cur.t+=it.str;if(it.hasEOL)cur=null});
  const ls=lines.filter(l=>l.t.trim());const gaps=ls.slice(1).map((l,i)=>Math.abs(ls[i].y-l.y)).sort((a,b)=>a-b);const med=gaps[Math.floor(gaps.length/2)]||14;
  let buf='';ls.forEach((l,i)=>{const gap=i?Math.abs(ls[i-1].y-l.y):0;if(i&&gap>med*1.45&&buf){paras.push(buf.trim());buf=''}buf+=(buf&&!buf.endsWith('-')?' ':'')+l.t.trim();if(buf.endsWith('-'))buf=buf.slice(0,-1)});
  if(buf.trim())paras.push(buf.trim());
 }
 return paras.map(t=>'<p>'+esc(t)+'</p>').join('');
}
const CH_RE=/^\s*(cap[íi]tulo|chapter|parte|pr[óo]logo|ep[íi]logo|interl[úu]dio)\b.{0,70}$/i;
function splitChapters(html,mode,name){
 const d=document.createElement('div');d.innerHTML=html;const out=[];let cur=null;
 const isHead=el=>{const t=el.tagName;if(mode==='none')return false;if(t==='H1')return true;if(mode!=='h1'&&t==='H2')return true;if((t==='P'||t==='H3'||t==='H2')&&CH_RE.test(el.textContent)&&el.textContent.length<90)return true;return false};
 [...d.childNodes].forEach(n=>{
  if(n.nodeType===1&&isHead(n)){cur={title:n.textContent.trim().slice(0,120),html:''};out.push(cur);return}
  if(!cur){if(n.nodeType===3&&!n.textContent.trim())return;cur={title:out.length?'Sem título':name,html:''};out.push(cur)}
  cur.html+=n.nodeType===1?n.outerHTML:(n.textContent.trim()?'<p>'+esc(n.textContent)+'</p>':'');
 });
 return out.filter(c=>c.html.trim()||out.length===1);
}
function renderImport(){
 const im=S.imp,box=$('#impRes');if(!box||!im)return;
 const modeEff=im.mode==='auto'?'h12':im.mode;const chs=splitChapters(im.html,modeEff,im.name);
 box.innerHTML=`<label class="f">Dividir em capítulos por</label>
  <div class="seg" id="impSeg">${[['h12','Títulos (H1/H2)'],['h1','Só H1'],['none','Não dividir']].map(([k,l])=>`<button data-m="${k}" class="${modeEff===k?'on':''}">${l}</button>`).join('')}</div>
  <p class="small muted" style="margin:10px 0 0">${chs.length} capítulo(s) · ${fmtN(countWords(htmlText(im.html)))} palavras detectadas em <b>${esc(im.name)}</b></p>
  <div class="chprev">${chs.slice(0,40).map((c,i)=>`<div><b>${i+1}. ${esc(c.title)}</b><br><span class="small muted">${esc(htmlText(c.html).slice(0,140))}…</span></div>`).join('')}${chs.length>40?`<div class="muted small">… e mais ${chs.length-40}</div>`:''}</div>
  <label class="toggle"><input type="checkbox" id="impFolder" ${chs.length>1?'checked':''}><span class="sw"></span>Colocar numa nova pasta “${esc(im.name)}”</label>
  <div class="row" style="margin-top:12px"><button class="btn ghost" id="impCancel">Descartar</button><span class="sp"></span><button class="btn primary" id="impGo">Importar ${chs.length} capítulo(s)</button></div>`;
 $$('#impSeg button').forEach(b=>b.onclick=()=>{im.mode=b.dataset.m;renderImport()});
 $('#impCancel').onclick=()=>{S.imp=null;box.innerHTML=''};
 $('#impGo').onclick=()=>{
  const p=P();let big=0;ensureOutline(p);let fid=null;if($('#impFolder').checked){fid=uid();p.outline.push({t:'f',id:fid,title:im.name,open:true,items:[]})}
  chs.forEach(c=>{const id=uid();if(c.html.length>240000)big++;p.chapters.push({id,title:c.title,status:'rascunho',words:countWords(htmlText(c.html))});placeChapter(id,fid?{where:'folder',fid}:{where:'root'});S.cache[id]={html:c.html,notes:''};queueWrite('c_'+id,{kind:'chapter',pid:p.id,id,html:c.html,notes:''})});
  saveProject();S.imp=null;toast(`${chs.length} capítulo(s) importado(s)`);if(big)toast(big+' capítulo(s) muito longo(s) podem não salvar — divida-os.','err');
  S.cid=p.chapters[p.chapters.length-chs.length].id;showView('write');
 };
}
function renderConv(){
 const c=S.conv,box=$('#convBox');if(!box)return;
 c.fmt=c.fmt||'image/webp';c.q=c.q||.9;c.wm=c.wm??P().settings.wm.enabled;
 box.innerHTML=`<div class="conv-prev"><canvas id="convC"></canvas></div>
  <div class="row wrap" style="margin-top:10px"><div class="grow"><label class="f">Formato</label><select id="cvF"><option value="image/png">PNG (sem perda, transparência)</option><option value="image/jpeg">JPG (fotos, menor)</option><option value="image/webp">WEBP (moderno, leve)</option></select></div>
  <div style="width:130px"><label class="f">Largura máx. (px)</label><input type="number" id="cvW" min="16" max="8000" placeholder="original" value="${c.maxW||''}"></div></div>
  <label class="f">Qualidade <span id="cvQo">${Math.round(c.q*100)}%</span></label><input type="range" id="cvQ" min="0.4" max="1" step="0.05" value="${c.q}">
  <label class="toggle"><input type="checkbox" id="cvWm" ${c.wm?'checked':''}><span class="sw"></span>Aplicar marca d'água do projeto <a href="#" data-act="view" data-v="style" class="small">(configurar)</a></label>
  <p class="small muted" id="cvInfo"></p>
  <div class="row wrap"><button class="btn ghost" id="cvClose">Outra imagem</button><span class="sp"></span><button class="btn" id="cvGal">Salvar na galeria</button><button class="btn primary" id="cvDl">${I('dl')} Baixar</button></div>`;
 $('#cvF').value=c.fmt;
 const upd=debounce(drawConv,200);
 $('#cvF').onchange=e=>{c.fmt=e.target.value;upd()};$('#cvW').oninput=e=>{c.maxW=+e.target.value||0;upd()};
 $('#cvQ').oninput=e=>{c.q=+e.target.value;$('#cvQo').textContent=Math.round(c.q*100)+'%';upd()};$('#cvWm').onchange=e=>{c.wm=e.target.checked;upd()};
 $('#cvClose').onclick=()=>{S.conv=null;RENDER.convert()};
 $('#cvDl').onclick=async()=>{const blob=await convBlob();if(blob)saveFile(slug(c.name.replace(/\.\w+$/,''))+'.'+({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'})[c.fmt],blob)};
 $('#cvGal').onclick=async()=>{const blob=await convBlob();if(!blob)return;const b=busy('Salvando…');try{const r=await storeImage(new File([blob],c.name,{type:c.fmt}));addToGallery(c.name.replace(/\.\w+$/,'')+(c.wm?' (marca d’água)':''),r);toast('Salvo na galeria')}catch(e){toast(e.message,'err')}finally{b.done()}};
 drawConv();
}
async function renderConvCanvas(){
 const c=S.conv;const img=await loadImg(c.src);const k=c.maxW?Math.min(1,c.maxW/img.naturalWidth):1;
 const W=Math.max(1,Math.round(img.naturalWidth*k)),H=Math.max(1,Math.round(img.naturalHeight*k));
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 if(c.fmt==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,W,H)}x.drawImage(img,0,0,W,H);
 if(c.wm)await watermarkCanvas(x,W,H,P().settings.wm);return cv;
}
async function drawConv(){
 const c=S.conv;try{const cv=await renderConvCanvas();const t=$('#convC');if(!t)return;t.width=cv.width;t.height=cv.height;t.getContext('2d').drawImage(cv,0,0);
  const blob=await canvasBlob(cv,c.fmt,c.q);$('#cvInfo').textContent=`${cv.width}×${cv.height}px · ~${blob?(blob.size/1024).toFixed(0):'?'} KB`;}
 catch(e){toast('Não consegui abrir esta imagem.','err')}
}
async function convBlob(){try{const cv=await renderConvCanvas();return await canvasBlob(cv,S.conv.fmt,S.conv.q)}catch{toast('Falha ao converter.','err');return null}}

/* ---------- ESTILO ---------- */
RENDER.style=()=>{
 const s=P().settings,wm=s.wm;
 const sl=(id,label,min,max,step,val,unit='')=>`<label class="f">${label}</label><div class="slider-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><output id="${id}o">${val}${unit}</output></div>`;
 $('#view').innerHTML=`<div class="scrollview"><div class="wrapc">
  <div class="vh"><div class="grow"><h2>Estilo</h2><p>Tipografia, marca d'água e aparência — tudo aplicado ao editor e às exportações.</p></div></div>
  <div class="style-wrap"><div style="display:flex;flex-direction:column;gap:18px">
   <div class="card"><h3>Tema do aplicativo</h3><p class="muted small">Vale para todos os projetos.</p>${themePickerHTML()}</div>
   <div class="card"><h3>Tipografia</h3>
    <label class="f">Fonte do texto</label><button class="fontbtn" data-act="pickFont" data-k="bodyFont" style="font-family:${fontStack(s.bodyFont)}">${esc(s.bodyFont)} <small>trocar</small></button>
    <label class="f">Fonte dos títulos</label><button class="fontbtn" data-act="pickFont" data-k="headFont" style="font-family:${fontStack(s.headFont)}">${esc(s.headFont)} <small>trocar</small></button>
    ${sl('stFs','Tamanho do texto',13,26,1,s.fontSize,'px')}${sl('stLh','Entrelinha',1.2,2.4,.05,s.lineHeight)}${sl('stPw','Largura da página',520,980,10,s.pageWidth,'px')}
    <label class="f">Parágrafos</label><div class="seg" id="stPara"><button data-v="book" class="${s.paraStyle==='book'?'on':''}">Livro (recuo)</button><button data-v="web" class="${s.paraStyle==='web'?'on':''}">Blocos (espaço)</button></div>
    <label class="f">Alinhamento</label><div class="seg" id="stAl">${[['left','Esquerda'],['justify','Justificado'],['center','Centro']].map(([k,l])=>`<button data-v="${k}" class="${s.align===k?'on':''}">${l}</button>`).join('')}</div>
    <label class="toggle"><input type="checkbox" id="stDc" ${s.dropcap?'checked':''}><span class="sw"></span>Letra capitular no início do capítulo</label>
   </div>
   <div class="card"><h3>Fontes personalizadas</h3><p class="muted small">Envie arquivos .ttf, .otf, .woff ou .woff2 — elas aparecem no seletor de fontes.</p>
    <button class="btn" data-act="upFont">${I('up')} Enviar fonte</button>
    <div class="fontlist">${s.customFonts.map((f,i)=>`<div><span class="grow" style="font-family:'${esc(f.name)}';font-size:18px">${esc(f.name)}</span><button class="btn sm ghost danger" data-act="rmFont" data-i="${i}">${I('trash')}</button></div>`).join('')}</div>
   </div>
   <div class="card"><h3>Marca d'água</h3><p class="muted small">Proteja seus PDFs, imagens e prévias.</p>
    <label class="toggle"><input type="checkbox" id="wmOn" ${wm.enabled?'checked':''}><span class="sw"></span><b>Ativar marca d'água</b></label>
    <div id="wmOpts" style="${wm.enabled?'':'opacity:.45;pointer-events:none'}">
    <div class="seg" id="wmType"><button data-v="text" class="${wm.type==='text'?'on':''}">Texto</button><button data-v="image" class="${wm.type==='image'?'on':''}">Imagem / logo</button></div>
    <div id="wmText" style="${wm.type==='text'?'':'display:none'}">
     <label class="f">Texto (use Enter para mais de uma linha)</label><textarea id="wmT" rows="2" style="min-height:0">${esc(wm.text)}</textarea>
     <div class="row"><div class="grow"><label class="f">Fonte</label><button class="fontbtn" data-act="pickFont" data-k="wm.font" style="font-family:${fontStack(wm.font)};font-size:15px">${esc(wm.font)} <small>trocar</small></button></div><div><label class="f">Cor</label><input type="color" id="wmC" value="${wm.color}"></div></div>
     ${sl('wmS','Tamanho',12,140,1,wm.size,'px')}
    </div>
    <div id="wmImg" style="${wm.type==='image'?'':'display:none'}">
     <label class="f">Imagem (PNG com fundo transparente funciona melhor)</label>
     <div class="row">${wm.image?`<img src="${esc(wm.image)}" style="height:48px;max-width:120px;object-fit:contain;background:var(--panel2);border-radius:6px">`:''}<button class="btn sm" data-act="wmImgUp">${I('up')} ${wm.image?'Trocar':'Enviar'} imagem</button></div>
     ${sl('wmIs','Tamanho da imagem',5,150,1,wm.imgScale,'%')}
    </div>
    ${sl('wmO','Opacidade',.02,.8,.01,wm.opacity)}${sl('wmR','Rotação',-90,90,1,wm.rotation,'°')}
    <label class="f">Posição</label><select id="wmM">${[['tile','Mosaico (repetida)'],['center','Centro'],['br','Canto inferior direito'],['bl','Canto inferior esquerdo'],['tr','Canto superior direito'],['tl','Canto superior esquerdo']].map(([k,l])=>`<option value="${k}" ${wm.mode===k?'selected':''}>${l}</option>`).join('')}</select>
    <div id="wmGapW" style="${wm.mode==='tile'?'':'display:none'}">${sl('wmG','Espaçamento do mosaico',0,400,5,wm.gap,'px')}</div>
    <label class="toggle"><input type="checkbox" id="wmEd" ${wm.showInEditor?'checked':''}><span class="sw"></span>Mostrar também no editor</label>
    </div>
   </div>
  </div>
  <div class="preview-sticky"><div class="small muted" style="margin-bottom:8px">Prévia</div>
   <div class="prev-paper" id="prevPaper"><div class="ch-kicker">Capítulo 1</div><div class="ch-title" style="margin-bottom:22px">O Despertar</div>
    <div class="prose" id="prevProse"><p>A névoa ainda cobria o vale quando Elara abriu os olhos. O velho grimório repousava sobre seu peito, as páginas tremulando como asas de mariposa sob uma brisa que não existia.</p><p>— Você também ouviu? — sussurrou Tavish, a mão já no cabo da espada.</p><p>Ela assentiu. Lá embaixo, entre as ruínas da torre, algo antigo havia despertado. E chamava pelo nome dela.</p><hr class="scene"><p>Três dias depois, a cidade de Vel'Thar fechou seus portões.</p></div>
    <div class="wmp" id="prevWm"></div></div></div>
  </div></div></div>`;
 bindThemePicker($('#view'));
 const s2=()=>{saveProject();updStylePreview()};
 const bindSl=(id,fn,unit='')=>{const i=$('#'+id);i.oninput=()=>{$('#'+id+'o').textContent=i.value+unit;fn(+i.value);s2()}};
 bindSl('stFs',v=>s.fontSize=v,'px');bindSl('stLh',v=>s.lineHeight=v);bindSl('stPw',v=>s.pageWidth=v,'px');
 bindSl('wmS',v=>wm.size=v,'px');bindSl('wmIs',v=>wm.imgScale=v,'%');bindSl('wmO',v=>wm.opacity=v);bindSl('wmR',v=>wm.rotation=v,'°');bindSl('wmG',v=>wm.gap=v,'px');
 const seg=(id,fn)=>$$('#'+id+' button').forEach(b=>b.onclick=()=>{$$('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));fn(b.dataset.v);s2()});
 seg('stPara',v=>s.paraStyle=v);seg('stAl',v=>s.align=v);
 seg('wmType',v=>{wm.type=v;$('#wmText').style.display=v==='text'?'':'none';$('#wmImg').style.display=v==='image'?'':'none'});
 $('#stDc').onchange=e=>{s.dropcap=e.target.checked;s2()};
 $('#wmOn').onchange=e=>{wm.enabled=e.target.checked;$('#wmOpts').style.cssText=wm.enabled?'':'opacity:.45;pointer-events:none';s2()};
 $('#wmT').oninput=e=>{wm.text=e.target.value;s2()};$('#wmC').oninput=e=>{wm.color=e.target.value;s2()};
 $('#wmM').onchange=e=>{wm.mode=e.target.value;$('#wmGapW').style.display=wm.mode==='tile'?'':'none';s2()};
 $('#wmEd').onchange=e=>{wm.showInEditor=e.target.checked;s2()};
 updStylePreview();
};
const updStylePreview=debounce(()=>{
 const s=P().settings,pp=$('#prevPaper'),pr=$('#prevProse');if(!pp)return;
 pp.style.setProperty('--bf',fontStack(s.bodyFont));pp.style.setProperty('--hf',fontStack(s.headFont));pp.style.setProperty('--fs',s.fontSize+'px');pp.style.setProperty('--lh',s.lineHeight);pp.style.setProperty('--align',s.align);
 pr.classList.toggle('web',s.paraStyle==='web');pr.classList.toggle('dropcap',!!s.dropcap);
 renderWmLayer($('#prevWm'),s.wm.enabled,s.wm);
},60);
ACT.pickFont=async el=>{
 const k=el.dataset.k,s=P().settings;const cur=k==='wm.font'?s.wm.font:s[k];
 const v=await pickFont(cur);if(!v)return;
 if(k==='wm.font')s.wm.font=v;else s[k]=v;loadFont(v);saveProject();RENDER.style();
};
function pickFont(cur){
 const s=P().settings;FONTS.forEach(f=>loadFont(f[0]));
 const groups={};if(s.customFonts.length)groups['Suas fontes']=s.customFonts.map(f=>f.name);FONTS.forEach(f=>(groups[f[1]]=groups[f[1]]||[]).push(f[0]));
 return modal({title:'Escolher fonte',wide:true,body:`<input id="fpq" placeholder="Buscar fonte…" style="margin-bottom:4px">${Object.entries(groups).map(([g,fs])=>`<div class="fp-group"><div class="fp-cat">${esc(g)}</div><div class="fp-grid">${fs.map(n=>`<button class="fp-item ${n===cur?'on':''}" data-f="${esc(n)}"><span class="s" style="font-family:${fontStack(n)}">O dragão despertou</span><small>${esc(n)}</small></button>`).join('')}</div></div>`).join('')}`,
  onMount:(ov,close)=>{$$('.fp-item',ov).forEach(b=>b.onclick=()=>close(b.dataset.f));$('#fpq',ov).oninput=e=>{const q=e.target.value.toLowerCase();$$('.fp-item',ov).forEach(b=>b.style.display=b.dataset.f.toLowerCase().includes(q)?'':'none');$$('.fp-group',ov).forEach(g=>g.style.display=$$('.fp-item',g).some(b=>b.style.display!=='none')?'':'none')}},
  actions:[{label:'Cancelar'}]});
}
ACT.upFont=async()=>{
 const [f]=await pickFile('.ttf,.otf,.woff,.woff2');if(!f)return;
 const ext=f.name.split('.').pop().toLowerCase();const type={ttf:'font/ttf',otf:'font/otf',woff:'font/woff',woff2:'font/woff2'}[ext];if(!type){toast('Formato de fonte não suportado.','err');return}
 let name=f.name.replace(/\.\w+$/,'').replace(/[-_]+/g,' ').replace(/[^\w\sÀ-ÿ]/g,'').trim().slice(0,40)||'Minha fonte';
 const s=P().settings;if(s.customFonts.some(x=>x.name===name))name+=' 2';
 const b=busy('Enviando fonte…');
 try{
  let src;
  if(S.assets){const up=await S.assets.upload(f,{type});src='/_blob/'+up.id}
  else{if(S.backend==='cloud'&&f.size>150000)throw new Error('Fonte grande demais para salvar aqui (máx. 150 KB sem armazenamento de arquivos).');src=await fileToDataURL(new File([f],f.name,{type}))}
  const ff=new FontFace(name,`url(${src})`);await ff.load();document.fonts.add(ff);loadedFonts.add(name);
  s.customFonts.push({name,src});saveProject();RENDER.style();toast('Fonte “'+name+'” adicionada');
 }catch(e){toast(e.message||'Não consegui carregar essa fonte.','err')}finally{b.done()}
};
ACT.rmFont=async el=>{const s=P().settings,f=s.customFonts[+el.dataset.i];if(!f||!await confirmDlg(`Remover a fonte “${esc(f.name)}”?`,'Remover'))return;s.customFonts.splice(+el.dataset.i,1);['bodyFont','headFont'].forEach(k=>{if(s[k]===f.name)s[k]=defaultSettings(P().type)[k]});if(s.wm.font===f.name)s.wm.font='Cinzel';saveProject();RENDER.style()};
ACT.wmImgUp=async()=>{const [f]=await pickFile('image/png,image/webp,image/svg+xml,image/jpeg');if(!f)return;const b=busy('Enviando…');try{const r=await storeImage(f);P().settings.wm.image=r.src;P().settings.wm.type='image';saveProject();RENDER.style()}catch(e){toast(e.message,'err')}finally{b.done()}};

/* ---------- EXPORTAR ---------- */
const FMTS={pdf:['PDF','Pronto para imprimir ou enviar, com marca d’água'],docx:['Word (.docx)','Para editoras, revisão e Google Docs'],epub:['EPUB','E-book para Kindle, Kobo, Apple Livros'],md:['Markdown','Texto simples formatado'],html:['Página HTML','Para publicar na web'],txt:['Texto (.txt)','Só o texto, sem formatação']};
RENDER.export=()=>{
 const p=P(),x=S.exp;
 $('#view').innerHTML=`<div class="scrollview"><div class="wrapc">
  <div class="vh"><div class="grow"><h2>Exportar</h2><p>Gere o arquivo final do seu ${p.type==='rpg'?'livro de RPG':'livro'} ou faça um backup.</p></div></div>
  <div class="grid2">
   <div style="display:flex;flex-direction:column;gap:18px">
    <div class="card"><h3>Formato</h3><div class="grid3" style="margin-top:10px">${Object.entries(FMTS).map(([k,v])=>`<button class="fmt ${x.fmt===k?'on':''}" data-act="expFmt" data-f="${k}"><b>${v[0]}</b><small>${v[1]}</small></button>`).join('')}</div></div>
    <div class="card"><h3>O que exportar</h3>
     <div class="seg" id="exScope" style="margin-top:8px"><button data-v="all" class="${x.scope==='all'?'on':''}">Tudo</button><button data-v="cur" class="${x.scope==='cur'?'on':''}">Capítulo atual</button><button data-v="sel" class="${x.scope==='sel'?'on':''}">Escolher</button></div>
     <div id="exSel" style="margin-top:10px;${x.scope==='sel'?'':'display:none'}"><div class="cklist">${bookOrder().map((o,i)=>{const c=cm(o.id);return `<label><input type="checkbox" data-c="${c.id}" ${x.sel[c.id]!==false?'checked':''}> ${i+1}. ${esc(c.title)}${o.folder?` <span class="muted small">· ${esc(o.folder.title)}</span>`:''}</label>`}).join('')}</div></div>
     <label class="toggle"><input type="checkbox" id="exTitle" ${x.title?'checked':''}><span class="sw"></span>Página de título (com capa)</label>
     <label class="toggle"><input type="checkbox" id="exToc" ${x.toc?'checked':''}><span class="sw"></span>Sumário</label>
     <label class="toggle"><input type="checkbox" id="exCodex" ${x.codex?'checked':''}><span class="sw"></span>Incluir ${p.type==='rpg'?'compêndio':'wiki do mundo'} como apêndice</label>
     <div id="exPdfOpts" style="${x.fmt==='pdf'?'':'display:none'}">
      <label class="toggle"><input type="checkbox" id="exNum" ${x.numbers?'checked':''}><span class="sw"></span>Numerar páginas</label>
      <label class="f">Tamanho da página</label><select id="exPage">${Object.entries(PAGES).map(([k,v])=>`<option value="${k}" ${x.page===k?'selected':''}>${v.l}</option>`).join('')}</select><button class="btn" data-act="printPrev" style="width:100%;margin-top:10px">👁 Visualizar impressão — margens, fonte e sumário</button><p class="small muted" style="margin:6px 0 0">No PDF o sumário traz a página onde cada capítulo começa.</p>
     </div>
     <div id="exWmOpt" style="${['pdf','html'].includes(x.fmt)?'':'display:none'}"><label class="toggle"><input type="checkbox" id="exWm" ${x.wm?'checked':''} ${p.settings.wm.enabled?'':'disabled'}><span class="sw"></span>Aplicar marca d'água ${p.settings.wm.enabled?'':'<span class="small muted">(ative em Estilo)</span>'}</label></div>
     <button class="btn primary" data-act="doExport" style="width:100%;margin-top:12px;padding:12px">${I('dl')} Gerar ${FMTS[x.fmt][0]}</button>
    </div>
   </div>
   <div style="display:flex;flex-direction:column;gap:18px">
    <div class="card pubcard"><h3>🌍 Publicar</h3><p class="muted small">${p.type==='rpg'?'Coloca a campanha na busca de RPG: jogadores leem o livro da campanha e entram na mesa quando você estiver conectado.':'Coloca o livro na Biblioteca: quem usa o Inkmind pode encontrar e ler. Rascunhos não são publicados.'}</p>
     ${S.backend!=='cloud'?`<div class="notice">Publicar só funciona ${CLOUD_NEED()}.${FBAVAIL()?' <a href="#" data-act="inkLogin">Entrar</a>':''}</div>`:`<div class="row wrap"><button class="btn primary" data-act="pubDo">${p.published?'🔄 Atualizar publicação':'🌍 Publicar agora'}</button>${p.published?'<button class="btn ghost" data-act="explore">Ver na Biblioteca</button><button class="btn ghost danger" data-act="pubUndo">Despublicar</button>':''}</div>${p.published?`<p class="small muted" style="margin-bottom:0">Publicado em ${new Date(p.published.at).toLocaleString('pt-BR')}. Mudanças novas só aparecem depois de atualizar.</p>`:''}`}</div>
    <div class="card"><h3>Dados do livro</h3>
     <div class="row" style="align-items:flex-start;gap:14px;margin-top:8px"><div style="width:110px;flex:none"><div class="cover ${p.cover?'hasimg':''}" style="${coverStyle(p)};padding:10px;cursor:pointer" data-act="setCover">${p.cover?`<img src="${esc(p.cover)}" alt="">`:''}<div class="ct" style="font-size:13px;font-family:${fontStack(p.settings.headFont)}">${esc(p.title)}</div></div><div class="small muted" style="text-align:center;margin-top:4px">toque p/ trocar capa</div></div>
     <div class="grow"><label class="f" style="margin-top:0">Autor(a)</label><input id="exAuthor" value="${esc(p.author||'')}"><label class="f">Gênero</label><select id="exGenre">${GENRES.map(g=>`<option ${p.genre===g?'selected':''}>${g}</option>`).join('')}</select></div></div>
     <label class="f">Sinopse</label><textarea id="exSyn" rows="4" placeholder="Um parágrafo que faça o leitor querer abrir o livro…">${esc(p.synopsis||'')}</textarea>
    </div>
    <div class="card"><h3>Backup e projeto</h3><p class="muted small">Um arquivo .json com todo o projeto e as imagens — em campanhas de RPG, também a mesa de jogo inteira (mapas, personagens, missões e fichas).</p>
     <div class="row wrap"><button class="btn" data-act="backup">${I('dl')} Baixar backup</button><button class="btn ghost danger" data-act="delProject">${I('trash')} Excluir projeto</button></div></div>
   </div>
  </div></div></div>`;
 $$('#exScope button').forEach(b=>b.onclick=()=>{x.scope=b.dataset.v;$$('#exScope button').forEach(y=>y.classList.toggle('on',y===b));$('#exSel').style.display=x.scope==='sel'?'':'none'});
 $$('#exSel input').forEach(i=>i.onchange=()=>{x.sel[i.dataset.c]=i.checked});
 const ck=(id,k)=>{$('#'+id).onchange=e=>x[k]=e.target.checked};ck('exTitle','title');ck('exToc','toc');ck('exCodex','codex');ck('exNum','numbers');ck('exWm','wm');
 $('#exPage').onchange=e=>{x.page=e.target.value;const pr=P().settings.print=P().settings.print||{};pr.page=x.page;saveProject()};
 $('#exAuthor').oninput=e=>{p.author=e.target.value;saveProject()};$('#exGenre').onchange=e=>{p.genre=e.target.value;saveProject()};$('#exSyn').oninput=e=>{p.synopsis=e.target.value;saveProject()};
};
ACT.expFmt=el=>{S.exp.fmt=el.dataset.f;RENDER.export()};
ACT.setCover=async()=>{const p=P();
 const v=await modal({title:'Capa',wide:true,body:`<div class="row" style="margin-bottom:10px"><button class="btn primary" id="cvUp">${I('up')} Enviar imagem</button><button class="btn" id="cvGen">🎨 Gerar com IA</button>${p.cover?'<button class="btn ghost" id="cvRm">Remover capa</button>':''}</div>${p.gallery.length?`<div class="small muted">Ou escolha da galeria:</div><div class="gal" style="margin-top:8px">${p.gallery.map(g=>`<button class="gi" data-src="${esc(g.src)}" style="padding:0;cursor:pointer"><div class="im"><img src="${esc(g.src)}" alt=""></div></button>`).join('')}</div>`:''}`,
  onMount:(ov,close)=>{$('#cvUp',ov).onclick=()=>close('__up');$('#cvGen',ov).onclick=()=>close('__gen');const r=$('#cvRm',ov);if(r)r.onclick=()=>close('__rm');$$('.gi',ov).forEach(b=>b.onclick=()=>close(b.dataset.src))},actions:[{label:'Cancelar'}]});
 if(!v)return;if(v==='__gen'){const r=await genImage();if(!r)return;p.cover=r.src}else if(v==='__rm')p.cover=null;else if(v==='__up'){const [f]=await pickFile('image/*');if(!f)return;const b=busy('Enviando…');try{const r=await storeImage(f);addToGallery(f.name,r);p.cover=r.src}catch(e){toast(e.message,'err');return}finally{b.done()}}else p.cover=v;
 saveProject();RENDER.export();
};
ACT.backup=async()=>{
 const p=P();const b=busy('Preparando backup…');try{const chapters={};for(const c of p.chapters)chapters[c.id]=await getChapter(c.id);await saveFile(slug(p.title)+'-backup.json',JSON.stringify({app:'inkmind',version:1,exportedAt:new Date().toISOString(),project:p,chapters},null,1))}finally{b.done()}
};
ACT.delProject=async()=>{const id=P().id;await flushChapter();if(await deleteProject(id)){S.P=null;renderHome()}};
async function deleteProject(id){
 const p=(S.P&&S.P.id===id)?S.P:S.projects.find(x=>x.id===id);if(!p)return false;
 let hasGame=false;if(p.type==='rpg'&&S.backend==='cloud'){try{const g=await withTimeout(S.db.doc('games/'+p.id).get(),8000);hasGame=g.exists&&g.data().masterId===S.uid}catch{}}
 if(!await confirmDlg(`Excluir “${esc(p.title)}” e seus ${p.chapters.length} capítulo(s)${hasGame?', junto com a <b>mesa de jogo</b> (fichas, mapas, personagens e itens)':''}? Isso não pode ser desfeito.<br><br><span class="small muted">Dica: em Exportar → Backup você guarda uma cópia antes.</span>`,'Excluir projeto'))return false;
 if(S.P&&S.P.id===id){saveProject.cancel();scheduleSave.cancel();S.chDirty=false}
 if(p.published)await unpublishProject(p,true);
 p.chapters.forEach(c=>queueWrite('c_'+c.id,null));queueWrite('p_'+p.id,null);
 if(hasGame)await deleteGame(p.id);
 S.projects=S.projects.filter(x=>x.id!==id);toast('Projeto excluído');return true;
}
async function deleteGame(gid){try{const ms=await S.db.collection('games/'+gid+'/maps').get();for(const d of ms.docs)await S.db.doc('games/'+gid+'/maps/'+d.id).delete();if(ACL()){try{const gm=await S.db.collection('games/'+gid+'/gmmaps').get();for(const d of gm.docs)await S.db.doc('games/'+gid+'/gmmaps/'+d.id).delete()}catch{}try{await S.db.doc('games/'+gid+'/secret/gm').delete()}catch{}}await S.db.doc('games/'+gid).delete()}catch(e){console.warn(e);toast('Não consegui apagar a mesa de jogo agora.','err')}}
ACT.mesaDel=async el=>{if(!await confirmDlg('Excluir esta mesa de jogo? Mapas, personagens, itens e o modelo de ficha serão apagados. As fichas dos jogadores ficam guardadas com eles.','Excluir mesa'))return;await deleteGame(el.dataset.id);toast('Mesa excluída');loadMesas()};

async function gather(){
 const p=P(),x=S.exp;ensureOutline(p);let list=bookOrder();
 if(x.scope==='cur')list=list.some(o=>o.id===S.cid)?list.filter(o=>o.id===S.cid):(S.cid?[{id:S.cid,folder:null}]:[]);
 if(x.scope==='sel')list=list.filter(o=>x.sel[o.id]!==false);
 const out=[];let lastF=null;
 for(const o of list){const c=cm(o.id);if(!c)continue;const d=await getChapter(o.id);const fid=o.folder?o.folder.id:null;
  out.push({id:o.id,n:chNum(o.id)||'',kick:chKick(c),title:c.title||'Sem título',html:clean(d.html||''),part:(x.scope!=='cur'&&fid&&fid!==lastF)?o.folder.title:null});lastF=fid}
 return out;
}
function partHTML(t){return `<div class="partpg"><div class="pk">✦</div><div class="pt">${esc(t)}</div></div>`}
function codexHTML(){const p=P();const cats=catsOf(p);return cats.map(cat=>{const es=p.codex.filter(e=>e.cat===cat);if(!es.length)return'';return `<h2>${esc(cat)}</h2>`+es.map(e=>(e.img?`<img src="${esc(e.img)}" alt="" style="width:40%">`:'')+statblockHTML(e)).join('')}).join('')}
function proseCSS(s,root,px){return `
${root}{font-family:${fontStack(s.bodyFont)};font-size:${px}px;line-height:${s.lineHeight};color:#1b1b1b;background:#fff}
${root} p{margin:0;text-indent:${s.paraStyle==='book'?(s.indentEm??1.5)+'em':'0'};${s.paraStyle==='web'?'margin-bottom:.8em;':''}text-align:${s.align}}
${root} h1,${root} h2,${root} h3,${root} h4{font-family:${fontStack(s.headFont)};line-height:1.25;font-weight:600;page-break-after:avoid}
${root} h1{font-size:2em;text-align:center;margin:.2em 0 1.4em}${root} h2{font-size:1.4em;margin:1.4em 0 .6em}${root} h3{font-size:1.15em;margin:1.2em 0 .5em}
${root} .kicker{text-align:center;text-transform:uppercase;letter-spacing:.22em;font-size:.72em;color:#777;margin-top:3em}
${root} .dc{float:left;font-family:${fontStack(s.headFont)};font-size:3.3em;line-height:.85;padding:.04em .08em 0 0;color:#8b3a2b}
${root} blockquote{margin:1em 1.5em;font-style:italic}${root} blockquote p{text-indent:0}
${root} hr{border:0;text-align:center;margin:1.2em 0;height:1.4em}${root} hr::before{content:'* * *';color:#888;letter-spacing:.4em}
${root} img{max-width:100%;height:auto;display:block;margin:1em auto}
${root} .boxed{display:block;border:1px solid #c9b9a0;border-left:4px solid #8b3a2b;background:#f6f0e6;padding:.8em 1em;margin:1em 0;font-style:italic}${root} .boxed p{text-indent:0}
${root} .statblock{display:block;border-top:3px solid #8b3a2b;border-bottom:3px solid #8b3a2b;background:#f7f2ea;padding:.7em .9em;margin:1em 0;font-family:Helvetica,Arial,sans-serif;font-size:.8em;line-height:1.4;page-break-inside:avoid}
${root} .statblock h4{margin:0;color:#8b3a2b;font-size:1.4em}${root} .statblock p{text-indent:0;margin:.25em 0;text-align:left}${root} .statblock .sb-sub{font-style:italic;color:#666}
${root} .statblock table{width:100%;border-collapse:collapse;text-align:center;margin:.4em 0}${root} .statblock th{color:#8b3a2b;font-size:.85em}
${root} .titlepage{text-align:center}${root} .titlepage .t{font-family:${fontStack(s.headFont)};font-size:2.6em;line-height:1.1;margin:1.2em 0 .3em}${root} .titlepage .a{font-size:1.2em;color:#555}${root} .titlepage img{max-height:60%;max-width:80%;box-shadow:0 2px 10px rgba(0,0,0,.2)}${root} .titlepage .syn{font-style:italic;color:#555;max-width:80%;margin:2em auto 0;text-indent:0;text-align:center}
${root} .partpg{text-align:center;padding-top:30%}${root} .partpg .pk{color:#8b3a2b;letter-spacing:.4em}${root} .partpg .pt{font-family:${fontStack(s.headFont)};font-size:2.3em;line-height:1.15;margin-top:.4em}
${root} .toc h2{text-align:center}${root} .toc p{text-indent:0;margin:.35em 0;text-align:left}
`}
function titleHTML(){const p=P();return `<div class="titlepage">${p.cover?`<img src="${esc(p.cover)}" alt="">`:''}<div class="t">${esc(p.title)}</div>${p.author?`<div class="a">${esc(p.author)}</div>`:''}${p.synopsis?`<p class="syn">${esc(p.synopsis)}</p>`:''}</div>`}
function tocHTML(chs){return `<div class="toc"><h2>Sumário</h2>${chs.map(c=>(c.part?`<p style="margin-top:.9em"><b>${esc(c.part)}</b></p>`:'')+`<p>${tocPre(c)}${esc(c.title)}</p>`).join('')}${S.exp.codex&&P().codex.length?`<p>Apêndice — ${P().type==='rpg'?'Compêndio':'Wiki do mundo'}</p>`:''}</div>`}
function withDropcap(html){
 if(!P().settings.dropcap)return html;const d=document.createElement('div');d.innerHTML=html;const p=d.firstElementChild;if(!p||p.tagName!=='P')return html;
 const w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);let tn;while((tn=w.nextNode())&&!tn.textContent.trim());if(!tn)return html;
 const m=/^(\s*)([«"“'—–-]*\s?[\p{L}\p{N}])/u.exec(tn.textContent);if(!m)return html;
 const sp=document.createElement('span');sp.className='dc';sp.textContent=m[2];const rest=document.createTextNode(tn.textContent.slice(m[0].length));
 tn.replaceWith(sp,rest);p.style.textIndent='0';return d.innerHTML}
function chapterHTML(c){return `<section class="chapter"><div class="kicker">${esc(kickTxt(c))}</div><h1>${esc(c.title)}</h1>${withDropcap(c.html)}</section>`}
ACT.doExport=async()=>{
 const x=S.exp;await flushChapter();
 const chs=await gather();if(!chs.length){toast('Nenhum capítulo selecionado.','err');return}
 const b=busy('Gerando '+FMTS[x.fmt][0]+'…');
 try{
  const name=slug(P().title)+(x.scope==='cur'?'-'+slug(chs[0].title):'');
  if(x.fmt==='pdf')await exportPDF(chs,name,b);
  else if(x.fmt==='docx')await exportDOCX(chs,name,b);
  else if(x.fmt==='epub')await exportEPUB(chs,name,b);
  else if(x.fmt==='html')await exportHTML(chs,name);
  else if(x.fmt==='md')await saveFile(name+'.md',buildMD(chs));
  else await saveFile(name+'.txt',buildTXT(chs));
 }catch(e){console.error(e);toast('Falha ao gerar o arquivo: '+(e.message||e),'err')}finally{b.done()}
};
async function waitImgs(root){await Promise.all($$('img',root).map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})))}
async function exportPDF_v1(chs,name,b){
 b.set('Carregando gerador de PDF…');await loadScript(LIB.html2pdf);
 const p=P(),s=p.settings,x=S.exp,pg=PAGES[x.page]||PAGES.a5;const margin=[20,17,22,17];
 const wpx=Math.round((pg.w-margin[1]-margin[3])*3.7795),hpx=Math.round((pg.h-margin[0]-margin[2])*3.7795);
 const host=document.createElement('div');host.style.cssText=`position:fixed;left:-20000px;top:0;width:${wpx}px`;document.body.appendChild(host);
 const st=document.createElement('style');st.textContent=proseCSS(s,'.pdfr',Math.round(s.fontSize*.78*10)/10)+`.pdfr{width:${wpx}px}.pdfr .titlepage{min-height:${hpx-4}px;padding-top:12%}`;host.appendChild(st);
 const parts=[];if(x.title)parts.push(titleHTML());if(x.toc&&chs.length>1)parts.push(tocHTML(chs));chs.forEach(c=>{if(c.part)parts.push(partHTML(c.part));parts.push(chapterHTML(c))});if(x.codex&&p.codex.length)parts.push(`<h1>${p.type==='rpg'?'Compêndio':'Wiki do mundo'}</h1>`+codexHTML());
 const els=parts.map(h=>{const d=document.createElement('div');d.className='pdfr';d.innerHTML=h;host.appendChild(d);return d});
 try{
  await document.fonts.ready;await waitImgs(host);
  const maxH=Math.max(...els.map(e=>e.scrollHeight));const scale=clamp(15000/maxH,1,2);
  const opt={margin,image:{type:'jpeg',quality:.94},html2canvas:{scale,useCORS:true,backgroundColor:'#ffffff',logging:false},jsPDF:{unit:'mm',format:pg.fmt,orientation:'portrait'},pagebreak:{mode:['avoid-all','css','legacy']}};
  b.set('Montando páginas (1/'+els.length+')…');
  let w=html2pdf().set(opt).from(els[0]).toPdf();
  for(let i=1;i<els.length;i++){const el=els[i],k=i;w=w.get('pdf').then(pdf=>{b.set(`Montando páginas (${k+1}/${els.length})…`);pdf.addPage()}).from(el).toContainer().toCanvas().toPdf()}
  const pdf=await w.get('pdf');
  if(x.wm&&s.wm.enabled){b.set('Aplicando marca d’água…');await watermarkPdf(pdf,s.wm,pg.w)}
  if(x.numbers){const n=pdf.internal.getNumberOfPages(),PW=pdf.internal.pageSize.getWidth(),PH=pdf.internal.pageSize.getHeight();for(let i=(x.title?2:1);i<=n;i++){pdf.setPage(i);pdf.setFont('times','normal');pdf.setFontSize(9);pdf.setTextColor(110);pdf.text(String(i),PW/2,PH-9,{align:'center'})}}
  pdf.setProperties({title:p.title,author:p.author||'',creator:'Inkmind'});
  await saveFile(name+'.pdf',pdf.output('blob'));
 }finally{host.remove()}
}
async function imgBytes(src){
 try{const r=await fetch(src);const blob=await r.blob();let type=blob.type;let buf=await blob.arrayBuffer();
  if(!/png|jpe?g|gif/.test(type)){const u=URL.createObjectURL(blob);const d=await downscale(u,2000,'image/png');URL.revokeObjectURL(u);buf=await d.blob.arrayBuffer();type='image/png'}
  const u2=URL.createObjectURL(new Blob([buf],{type}));const im=await loadImg(u2);URL.revokeObjectURL(u2);
  return {buf,type,w:im.naturalWidth,h:im.naturalHeight};}catch{return null}
}
async function exportDOCX(chs,name,b){
 b.set('Carregando gerador de Word…');await loadScript(LIB.docx);const D=window.docx,p=P(),s=p.settings,x=S.exp;const FN={n:0,map:{}};const hex=v=>{if(!v)return undefined;v=v.trim();let m=/^#([0-9a-f]{3})$/i.exec(v);if(m)return m[1].split('').map(c=>c+c).join('').toUpperCase();m=/^#([0-9a-f]{6})/i.exec(v);if(m)return m[1].toUpperCase();m=/rgba?\((\d+)\D+(\d+)\D+(\d+)/.exec(v);if(m)return [m[1],m[2],m[3]].map(n=>(+n).toString(16).padStart(2,'0')).join('').toUpperCase();return undefined};
 const sz=Math.round(s.fontSize*.78*.75*2);
 const runsOf=async(node,f={})=>{const out=[];for(const n of node.childNodes){
   if(n.nodeType===3){if(n.textContent)out.push(new D.TextRun({text:n.textContent.replace(/\s+/g,' '),bold:f.b,italics:f.i,underline:f.u?{}:undefined,strike:f.s,color:f.c,shading:f.h?{type:D.ShadingType.CLEAR,color:'auto',fill:f.h}:undefined,superScript:f.sup,subScript:f.sub}))}
   else if(n.nodeType===1){const t=n.tagName;
    if(t==='BR')out.push(new D.TextRun({text:'',break:1}));
    else if(t==='IMG'){const im=await imgBytes(n.getAttribute('src'));if(im){const W=Math.min(430,im.w);out.push(new D.ImageRun({data:im.buf,transformation:{width:W,height:Math.round(W*im.h/im.w)}}))}}
    else if(t==='SUP'&&n.classList.contains('fn')){const id=++FN.n;FN.map[id]={children:[new D.Paragraph({children:[new D.TextRun(n.getAttribute('title')||'')]})]};out.push(new D.FootnoteReferenceRun(id))}
    else if(t==='A'&&n.getAttribute('href')&&/^(https?:|mailto:)/i.test(n.getAttribute('href'))){out.push(new D.ExternalHyperlink({link:n.getAttribute('href'),children:await runsOf(n,{...f,u:true,c:'0563C1'})}))}
    else{const st=(n.getAttribute&&n.getAttribute('style'))||'',cm=/(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(st),bm=/background-color\s*:\s*([^;]+)/i.exec(st);out.push(...await runsOf(n,{...f,b:f.b||t==='B'||t==='STRONG'||t==='TH',i:f.i||t==='I'||t==='EM',u:f.u||t==='U',s:f.s||t==='S'||t==='STRIKE'||t==='DEL',sup:f.sup||t==='SUP',sub:f.sub||t==='SUB',c:(cm&&hex(cm[1]))||f.c,h:(bm&&hex(bm[1]))||f.h}))}}}return out};
 const AL={center:D.AlignmentType.CENTER,right:D.AlignmentType.RIGHT,justify:D.AlignmentType.JUSTIFIED,left:D.AlignmentType.LEFT};
 const align=el=>{const m=/text-align:(\w+)/.exec(el.getAttribute&&el.getAttribute('style')||'');return AL[m?m[1]:s.align]};
 const indent=s.paraStyle==='book'?{firstLine:400}:undefined,spacing=s.paraStyle==='web'?{after:160}:undefined;
 const blocks=async(html)=>{const d=document.createElement('div');d.innerHTML=html;const out=[];
  const walk=async(el,ctx={})=>{for(const n of el.childNodes){
   if(n.nodeType===3){if(n.textContent.trim())out.push(new D.Paragraph({children:[new D.TextRun(n.textContent)]}));continue}
   if(n.nodeType!==1)continue;const t=n.tagName;
   if(t==='P'||t==='FIGCAPTION'){const ml=/margin-left:\s*([\d.]+)em/.exec(n.getAttribute('style')||'');out.push(new D.Paragraph({children:await runsOf(n,ctx.i?{i:true}:{}),alignment:align(n),indent:ctx.box?{left:500}:ml?{...(indent||{}),left:Math.round(+ml[1]*240)}:indent,spacing}))}
   else if(t==='H1'||t==='H2')out.push(new D.Paragraph({children:await runsOf(n),heading:D.HeadingLevel.HEADING_2}));
   else if(t==='H3'||t==='H4')out.push(new D.Paragraph({children:await runsOf(n),heading:D.HeadingLevel.HEADING_3}));
   else if(t==='BLOCKQUOTE'){const q=n.querySelector('p')?null:n;if(q)out.push(new D.Paragraph({children:await runsOf(n,{i:true}),indent:{left:700,right:700}}));else await walk(n,{i:true,box:true})}
   else if(t==='UL'||t==='OL'){let k=0;for(const li of n.children){k++;out.push(new D.Paragraph({children:[...(t==='OL'?[new D.TextRun(k+'. ')]:[]),...await runsOf(li)],bullet:t==='UL'?{level:0}:undefined,indent:t==='OL'?{left:400}:undefined}))}}
   else if(t==='HR'&&n.classList.contains('pgbreak'))out.push(new D.Paragraph({children:[new D.PageBreak()]}));
   else if(t==='HR')out.push(new D.Paragraph({children:[new D.TextRun('*   *   *')],alignment:D.AlignmentType.CENTER,spacing:{before:200,after:200}}));
   else if(t==='IMG'){const r=await runsOf({childNodes:[n]});out.push(new D.Paragraph({children:r,alignment:D.AlignmentType.CENTER}))}
   else if(t==='TABLE'){const rows=[];for(const tr of n.querySelectorAll('tr')){const cells=[];for(const td of tr.children){const ps=[...td.querySelectorAll(':scope>p')];const kids=ps.length?await Promise.all(ps.map(async q=>new D.Paragraph({children:await runsOf(q,{b:td.tagName==='TH'})}))):[new D.Paragraph({children:await runsOf(td,{b:td.tagName==='TH'})})];cells.push(new D.TableCell({children:kids,shading:td.tagName==='TH'?{type:D.ShadingType.CLEAR,color:'auto',fill:'EFE9E1'}:undefined,margins:{top:60,bottom:60,left:100,right:100}}))}if(cells.length)rows.push(new D.TableRow({children:cells,tableHeader:tr.parentElement.tagName==='THEAD'}))}if(rows.length){out.push(new D.Table({rows,width:{size:100,type:D.WidthType.PERCENTAGE}}));out.push(new D.Paragraph({children:[]}))}}
   else if(t==='ASIDE'||t==='DIV'||t==='FIGURE'||t==='SECTION'){await walk(n,{...ctx,box:true})}
   else out.push(new D.Paragraph({children:await runsOf(n)}));
  }};await walk(d);return out};
 const children=[];
 if(x.title){if(p.cover){const im=await imgBytes(p.cover);if(im){const W=320;children.push(new D.Paragraph({children:[new D.ImageRun({data:im.buf,transformation:{width:W,height:Math.round(W*im.h/im.w)}})],alignment:D.AlignmentType.CENTER}))}}
  children.push(new D.Paragraph({children:[new D.TextRun({text:p.title,size:56,font:s.headFont,bold:true})],alignment:D.AlignmentType.CENTER,spacing:{before:p.cover?400:2400,after:300}}));
  if(p.author)children.push(new D.Paragraph({children:[new D.TextRun({text:p.author,size:30})],alignment:D.AlignmentType.CENTER}));
  if(p.synopsis)children.push(new D.Paragraph({children:[new D.TextRun({text:p.synopsis,italics:true})],alignment:D.AlignmentType.CENTER,spacing:{before:600}}))}
 if(x.toc&&chs.length>1){children.push(new D.Paragraph({children:[new D.TextRun('Sumário')],heading:D.HeadingLevel.HEADING_2,pageBreakBefore:true}));chs.forEach(c=>children.push(new D.Paragraph({children:[new D.TextRun((p.type==='rpg'?'':c.n+'. ')+c.title)]})))}
 for(let i=0;i<chs.length;i++){const c=chs[i];b.set(`Convertendo capítulo ${i+1}/${chs.length}…`);
  if(c.part)children.push(new D.Paragraph({children:[new D.TextRun({text:c.part,size:52,font:s.headFont,bold:true})],alignment:D.AlignmentType.CENTER,pageBreakBefore:true,spacing:{before:3000}}));
  if(kickTxt(c))children.push(new D.Paragraph({children:[new D.TextRun({text:kickTxt(c).toUpperCase(),size:18,color:'777777'})],alignment:D.AlignmentType.CENTER,pageBreakBefore:i>0||x.title||x.toc,spacing:{before:1200}}));
  children.push(new D.Paragraph({children:[new D.TextRun(c.title)],heading:D.HeadingLevel.HEADING_1,pageBreakBefore:p.type==='rpg'&&(i>0||x.title||x.toc)}));
  children.push(...await blocks(c.html));}
 if(x.codex&&p.codex.length){children.push(new D.Paragraph({children:[new D.TextRun(p.type==='rpg'?'Compêndio':'Wiki do mundo')],heading:D.HeadingLevel.HEADING_1,pageBreakBefore:true}));children.push(...await blocks(codexHTML()))}
 const doc=new D.Document({creator:p.author||'Inkmind',title:p.title,footnotes:FN.map,
  styles:{default:{document:{run:{font:s.bodyFont,size:sz}},heading1:{run:{font:s.headFont,size:sz*2,bold:true},paragraph:{alignment:D.AlignmentType.CENTER,spacing:{after:480}}},heading2:{run:{font:s.headFont,size:Math.round(sz*1.5),bold:true},paragraph:{spacing:{before:320,after:160}}},heading3:{run:{font:s.headFont,size:Math.round(sz*1.2),bold:true}}}},
  sections:[{properties:{},children}]});
 await saveFile(name+'.docx',await D.Packer.toBlob(doc));
}
async function exportEPUB(chs,name,b){
 b.set('Carregando gerador de e-book…');await loadScript(LIB.jszip);const p=P(),s=p.settings,x=S.exp;
 const zip=new JSZip();zip.file('mimetype','application/epub+zip',{compression:'STORE'});
 zip.file('META-INF/container.xml','<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
 const imgs=[];const imgMap={};
 const addImg=async src=>{if(imgMap[src])return imgMap[src];const im=await imgBytes(src);if(!im)return null;const ext=im.type.includes('png')?'png':im.type.includes('gif')?'gif':'jpg';const fn='images/img'+(imgs.length+1)+'.'+ext;imgs.push({fn,type:ext==='jpg'?'image/jpeg':'image/'+ext});zip.file('OEBPS/'+fn,im.buf);imgMap[src]=fn;return fn};
 const xser=new XMLSerializer();
 const toX=async html=>{const d=document.createElement('div');d.innerHTML=html;for(const i of $$('img',d)){const fn=await addImg(i.getAttribute('src'));if(fn){i.setAttribute('src',fn);i.removeAttribute('style')}else i.remove()}return [...d.childNodes].map(n=>xser.serializeToString(n)).join('')};
 const page=(title,body)=>`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-BR" xml:lang="pt-BR"><head><meta charset="UTF-8"/><title>${esc(title)}</title><link rel="stylesheet" type="text/css" href="style.css"/></head><body class="bk">${body}</body></html>`;
 zip.file('OEBPS/style.css',proseCSS(s,'.bk','16').replace('font-size:16px','')+'.bk{background:none;color:inherit}');
 const files=[];
 if(x.title){const body=await toX(titleHTML());files.push({id:'title',fn:'title.xhtml',title:'Capa'});zip.file('OEBPS/title.xhtml',page(p.title,body))}
 for(let i=0;i<chs.length;i++){b.set(`Convertendo capítulo ${i+1}/${chs.length}…`);const c=chs[i];if(c.part){const pf=`part${i+1}.xhtml`;files.push({id:'part'+(i+1),fn:pf,title:c.part});zip.file('OEBPS/'+pf,page(c.part,await toX(partHTML(c.part))))}const fn=`ch${i+1}.xhtml`;files.push({id:'ch'+(i+1),fn,title:c.title});zip.file('OEBPS/'+fn,page(c.title,await toX(chapterHTML(c))))}
 if(x.codex&&p.codex.length){files.push({id:'codex',fn:'codex.xhtml',title:p.type==='rpg'?'Compêndio':'Wiki do mundo'});zip.file('OEBPS/codex.xhtml',page('Apêndice',await toX(`<h1>${p.type==='rpg'?'Compêndio':'Wiki do mundo'}</h1>`+codexHTML())))}
 zip.file('OEBPS/nav.xhtml',page('Sumário',`<nav epub:type="toc" id="toc"><h2>Sumário</h2><ol>${files.filter(f=>f.id!=='title').map(f=>`<li><a href="${f.fn}">${esc(f.title)}</a></li>`).join('')}</ol></nav>`));
 const coverImg=p.cover&&imgMap[p.cover]?imgs.find(i=>i.fn===imgMap[p.cover]):null;
 const bid='urn:uuid:'+(crypto.randomUUID?crypto.randomUUID():uid());
 zip.file('OEBPS/content.opf',`<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bid" xml:lang="pt-BR"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bid">${bid}</dc:identifier><dc:title>${esc(p.title)}</dc:title><dc:language>pt-BR</dc:language>${p.author?`<dc:creator>${esc(p.author)}</dc:creator>`:''}${p.synopsis?`<dc:description>${esc(p.synopsis)}</dc:description>`:''}<meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/,'Z')}</meta>${coverImg?'<meta name="cover" content="img-cover"/>':''}</metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="style.css" media-type="text/css"/>${files.map(f=>`<item id="${f.id}" href="${f.fn}" media-type="application/xhtml+xml"/>`).join('')}${imgs.map((im,i)=>`<item id="${coverImg===im?'img-cover':'img'+i}" href="${im.fn}" media-type="${im.type}"${coverImg===im?' properties="cover-image"':''}/>`).join('')}</manifest>
<spine>${files.map(f=>`<itemref idref="${f.id}"/>`).join('')}</spine></package>`);
 await saveFile(name+'.epub',await zip.generateAsync({type:'blob',mimeType:'application/epub+zip'}));
}
async function exportHTML(chs,name){
 const p=P(),s=p.settings,x=S.exp;let wmCss='';
 if(x.wm&&s.wm.enabled){const it=await wmItem(s.wm,2);if(it){const g=s.wm.mode==='tile'?(+s.wm.gap||0):0;const url=it.render(g).toDataURL('image/png');wmCss=`body::after{content:'';position:fixed;inset:0;pointer-events:none;background:url(${url}) ${s.wm.mode==='tile'?'repeat':'no-repeat'};background-size:${it.RW+g}px ${it.RH+g}px;background-position:${s.wm.mode==='tile'?'center top':WM_POS[s.wm.mode]}}`}}
 const fonts=[s.bodyFont,s.headFont].map(n=>FONTS.find(f=>f[0]===n)).filter(Boolean).map(f=>'family='+f[2]).join('&');
 const body=(x.title?titleHTML()+'<hr class="pg">':'')+(x.toc&&chs.length>1?tocHTML(chs)+'<hr class="pg">':'')+chs.map(c=>(c.part?partHTML(c.part)+'<hr class="pg">':'')+chapterHTML(c)).join('<hr class="pg">')+(x.codex&&p.codex.length?'<hr class="pg"><h1>'+(p.type==='rpg'?'Compêndio':'Wiki do mundo')+'</h1>'+codexHTML():'');
 const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)}</title>${fonts?`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}&display=swap">`:''}<style>body{margin:0;background:#f4efe6}main{max-width:${s.pageWidth}px;margin:40px auto;background:#fff;padding:60px 70px;box-shadow:0 4px 30px rgba(0,0,0,.08)}@media(max-width:700px){main{margin:0;padding:30px 20px}}hr.pg{border:0;height:1px;background:#e5ddd0;margin:4em 0}hr.pg::before{content:none}${proseCSS(s,'main',s.fontSize)}${wmCss}</style></head><body><main>${body}</main></body></html>`;
 await saveFile(name+'.html',html);
}
function htmlToMd(html){
 const d=document.createElement('div');d.innerHTML=html;
 const inl=n=>[...n.childNodes].map(c=>{if(c.nodeType===3)return c.textContent.replace(/\s+/g,' ');if(c.nodeType!==1)return'';const t=c.tagName,i=inl(c);
  if(t==='B'||t==='STRONG')return i.trim()?`**${i.trim()}**`:'';if(t==='I'||t==='EM')return i.trim()?`*${i.trim()}*`:'';if(t==='S'||t==='STRIKE'||t==='DEL')return `~~${i}~~`;if(t==='BR')return'  \n';if(t==='A')return `[${i}](${c.getAttribute('href')||''})`;if(t==='IMG')return `![${c.getAttribute('alt')||''}](${c.getAttribute('src')})`;return i}).join('');
 const blk=n=>[...n.childNodes].map(c=>{if(c.nodeType===3)return c.textContent.trim()?c.textContent.trim()+'\n\n':'';if(c.nodeType!==1)return'';const t=c.tagName;
  if(/^H[1-4]$/.test(t))return '#'.repeat(+t[1]+1)+' '+inl(c).trim()+'\n\n';if(t==='P')return inl(c).trim()+'\n\n';if(t==='HR')return '* * *\n\n';
  if(t==='BLOCKQUOTE')return blk(c).trim().split('\n').map(l=>'> '+l).join('\n')+'\n\n';
  if(t==='UL'||t==='OL')return [...c.children].map((li,i)=>(t==='OL'?(i+1)+'. ':'- ')+inl(li).trim()).join('\n')+'\n\n';
  if(t==='IMG')return inl({childNodes:[c]})+'\n\n';
  if(t==='TABLE'){const rows=[...c.querySelectorAll('tr')].map(tr=>'| '+[...tr.children].map(x=>x.textContent.trim()).join(' | ')+' |');if(rows.length)rows.splice(1,0,'|'+rows[0].split('|').slice(1,-1).map(()=>' --- |').join(''));return rows.join('\n')+'\n\n'}
  if(t==='ASIDE'&&c.classList.contains('boxed'))return blk(c).trim().split('\n').map(l=>'> '+l).join('\n')+'\n\n';
  return blk(c)}).join('');
 return blk(d).replace(/\n{3,}/g,'\n\n');
}
function buildMD(chs){const p=P(),x=S.exp;let md='';if(x.title){md+=`# ${p.title}\n\n`;if(p.author)md+=`*${p.author}*\n\n`;if(p.synopsis)md+=`> ${p.synopsis}\n\n`}
 chs.forEach(c=>{if(c.part)md+=`\n# ${c.part}\n\n`;md+=`\n## ${tocPre(c)}${c.title}\n\n`+htmlToMd(c.html)});if(x.codex&&p.codex.length)md+=`\n## ${p.type==='rpg'?'Compêndio':'Wiki do mundo'}\n\n`+htmlToMd(codexHTML());return md.trim()+'\n'}
function buildTXT(chs){const p=P(),x=S.exp;const tx=h=>{const d=document.createElement('div');d.innerHTML=h.replace(/<hr[^>]*>/g,'<p>* * *</p>');$$('p,h1,h2,h3,h4,li,tr,blockquote',d).forEach(e=>e.append('\n\n'));return d.textContent.replace(/\n{3,}/g,'\n\n').trim()};
 let t='';if(x.title)t+=p.title.toUpperCase()+'\n'+(p.author?p.author+'\n':'')+'\n';chs.forEach(c=>{if(c.part)t+=`\n\n\n${c.part.toUpperCase()}\n${'#'.repeat(Math.min(60,c.part.length))}\n`;t+=`\n\n${kickTxt(c)?kickTxt(c).toUpperCase()+'\n':''}${c.title}\n${'='.repeat(Math.min(60,c.title.length))}\n\n`+tx(c.html)});return t.trim()+'\n'}
