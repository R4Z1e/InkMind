/* ============ v15: organização — menus agrupados, busca de ferramentas, celular ============ */
Object.assign(ICONS,{
 search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
 check:'<path d="M4 12.5 9 17.5 20 6.5"/>',
 more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
 home:'<path d="M3 11 12 4l9 7"/><path d="M6 10v10h12V10"/>'
});
const isPhone=()=>window.matchMedia('(max-width:860px)').matches;
const fakeEl=(d={})=>({dataset:d,closest:()=>null,classList:{contains:()=>false,toggle(){},add(){},remove(){}}});

/* ---------- menu lateral agrupado ---------- */
const RAIL_GROUPS=[[null,['write','board']],['Mundo',['codex','gallery']],['Livro pronto',['style','publish']]];
const SUBG=[{g:'publish',v:['print','export','convert']},{g:'gallery',v:['gallery','imgconv']}];
const SUBL={print:'👁 Visualizar e PDF',export:'⬇ Exportar',convert:'⬆ Importar',gallery:'🖼 Imagens',imgconv:'⇄ Converter imagem'};
const groupOf=v=>{const g=SUBG.find(x=>x.v.includes(v));return g?g.g:v};
function mobileMain(p=P()){return p.type==='rpg'?['write','codex','table','publish']:['write','board','codex','publish']}
function railNav(){
 const p=P(),rpg=p.type==='rpg',mm=mobileMain(p);
 const btn=k=>`<button data-act="view" data-v="${k}" class="${mm.includes(k)?'':'ik-rx'}">${I(VIEWS[k][1])}<span>${VIEWS[k][0]}</span></button>`;
 return `<button class="show-m ik-homeb" data-act="home" title="Voltar para a Estante">${I('home')}<span>Estante</span></button>`+RAIL_GROUPS.map(([g,vs])=>(g?`<div class="rsep">${g}</div>`:'')+vs.map(btn).join('')).join('')+
  (rpg?`<div class="rsep">Jogo</div><button data-act="openTableP" class="${mm.includes('table')?'':'ik-rx'}">${I('table')}<span>Mesa de jogo</span></button>`:'')+
  `<button class="show-m ik-more" data-act="moreM">${I('more')}<span>Mais</span></button>`;
}
function ikHL(v){const g=groupOf(v),mm=S.P?mobileMain():[];$$('#tabs button[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===g));const more=$('#tabs .ik-more');if(more)more.classList.toggle('on',!mm.includes(g))}
const _showView15=showView;
showView=function(v){if(v==='publish')v=S.pubLast||'print';if(groupOf(v)==='publish')S.pubLast=v;return _showView15(v)};
function subWrap(cur){
 const sg=SUBG.find(x=>x.v.includes(cur));const v=$('#view');if(!sg||!v||v.querySelector(':scope>.ik-subw'))return;
 const kids=[...v.childNodes];
 v.innerHTML=`<div class="ik-subw"><nav class="ik-sub">${sg.v.map(k=>`<button data-act="view" data-v="${k}" class="${k===cur?'on':''}">${SUBL[k]}</button>`).join('')}</nav><div class="ik-subb"></div></div>`;
 const b=v.querySelector('.ik-subb');kids.forEach(n=>b.appendChild(n));
}
['print','export','gallery'].forEach(k=>{const f=RENDER[k];RENDER[k]=function(...a){const r=f.apply(this,a);if(S.view===k)subWrap(k);return r}});
{const f=RENDER.convert;RENDER.convert=function(...a){const r=f.apply(this,a);const img=S.view==='imgconv';
 const v=$('#view'),cards=v?$$('.grid2>.card',v):[];
 if(cards.length===2){cards[img?0:1].style.display='none';cards[0].parentElement.classList.add('ik-one')}
 const h=v&&v.querySelector('.vh h2'),pp=v&&v.querySelector('.vh p');
 if(h)h.textContent=img?'Converter imagem':'Importar documento';
 if(pp)pp.textContent=img?'Converta entre PNG, JPG e WEBP, redimensione e aplique sua marca d’água.':'Traga textos do Word, Markdown, PDF, HTML ou .txt — o app divide em capítulos automaticamente.';
 subWrap(img?'imgconv':'convert');return r}}
RENDER.imgconv=()=>RENDER.convert();
ACT.gConv=el=>{const g=gItem(el);if(!g)return;S.conv={src:g.src,name:g.name};showView('imgconv')};
{const f=RENDER.style;RENDER.style=function(...a){const r=f.apply(this,a);const vh=$('#view .vh');
 $$('#view .card').forEach(c=>{const h=c.querySelector('h3');if(h&&/Tema do aplicativo/.test(h.textContent))c.style.display='none'});
 const h2=vh&&vh.querySelector('h2');if(h2)h2.textContent='Estilo do livro';
 if(vh&&!$('#view .ik-hint'))vh.insertAdjacentHTML('afterend',`<div class="notice ik-hint">Aqui fica o visual do livro (fontes, tema, capitular, marca d’água). <b>Folha, margens, tamanho da fonte na impressão e sumário</b> ficam em <a href="#" data-act="view" data-v="print">Publicar → Visualizar e PDF</a>. O tema do aplicativo (claro/escuro) fica em <a href="#" data-act="themeQuick">🎨 Tema do app</a>.</div>`);return r}}

ACT.moreM=async()=>{const p=P(),mm=mobileMain(p),rpg=p.type==='rpg';
 const its=[];
 RAIL_GROUPS.forEach(([,vs])=>vs.forEach(k=>{if(!mm.includes(k))its.push({i:I(VIEWS[k][1]),t:VIEWS[k][0],d:{board:'Capítulos por status, sinopses e meta',gallery:'Imagens, capa e conversor',style:'Fontes, tema, marca d’água',codex:'Fichas e wiki do mundo'}[k]||'',run:()=>showView(k),on:groupOf(S.view)===k})}));
 if(rpg&&!mm.includes('table'))its.push({i:I('table'),t:'Mesa de jogo',run:()=>ACT.openTableP()});its.push({i:I('users'),t:S.colP[p.id]?'Compartilhado':'Compartilhar',d:'Coautores e leitores beta',run:()=>ACT.colShare()});
 its.push('-');
 its.push({i:I('search'),t:'Buscar ferramenta',d:'Ache qualquer função pelo nome',run:()=>ACT.cmdk()});
 its.push({i:I('brush'),t:'Tema do app',d:'Claro, escuro e cor de destaque',run:()=>ACT.themeQuick(fakeEl())});
 its.push({i:I('pen'),t:'Renomear projeto',d:p.title,run:async()=>{const t=await ask('Renomear projeto','Título',p.title);if(!t)return;p.title=t;const pt=$('#ptitle');if(pt)pt.value=t;saveProject();toast('Projeto renomeado')}});
 its.push({i:I('back'),t:'Voltar à Estante',run:()=>ACT.home()});
 if(FBAVAIL()&&window.INK&&INK.user)its.push({i:I('logout'),t:'Sair da conta',d:(INK.user.email||'Visitante'),run:()=>ACT.inkLogout()});
 ikMenu(null,its,{title:'Mais',sheet:true});
};

/* ---------- menus (popover no computador, painel inferior no celular) ---------- */
let IKM=null;
function ikClose(){if(IKM){IKM.pop.remove();IKM.scrim.remove();document.removeEventListener('keydown',IKM.kd,true);IKM=null}}
function ikMenu(anchor,items,o={}){
 ikClose();
 const sheet=o.sheet||isPhone();
 const scrim=document.createElement('div');scrim.className='ik-scrim'+(sheet?' dim':'');
 const pop=document.createElement('div');pop.className='ik-pop'+(sheet?' sheet':'');pop.setAttribute('role','menu');
 const list=items.filter(x=>x&&(x==='-'||!x.hide));
 pop.innerHTML=(o.title?`<h5>${esc(o.title)}</h5>`:'')+list.map((x,i)=>x==='-'?'<div class="ik-sep"></div>':x.g?`${i===0||!list[i-1].g?`<div class="ik-grid ${o.title==='Símbolos'?'sym':''}">`:''}<button class="ik-gc" data-i="${i}" title="${esc(x.t)}">${x.g}</button>${!list[i+1]||!list[i+1].g?'</div>':''}`:`<button class="ik-it ${x.on?'on':''}" data-i="${i}" role="menuitem"><span class="ic">${x.i||''}</span><span class="tx">${esc(x.t)}${x.d?`<small>${esc(x.d)}</small>`:''}</span>${x.on?`<span class="ck">${I('check')}</span>`:''}${x.kb?`<kbd>${x.kb}</kbd>`:''}</button>`).join('');
 document.body.append(scrim,pop);
 if(!sheet&&anchor){const r=anchor.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;let x=Math.min(r.left,innerWidth-w-8),y=r.bottom+6;if(y+h>innerHeight-8)y=Math.max(8,r.top-h-6);pop.style.left=Math.max(8,x)+'px';pop.style.top=y+'px'}
 else if(!sheet){pop.style.left=Math.max(8,(innerWidth-pop.offsetWidth)/2)+'px';pop.style.top='15vh'}
 pop.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')e.preventDefault()});
 pop.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b)return;e.stopPropagation();const it=list[+b.dataset.i];ikClose();if(it&&it.run)it.run()});
 scrim.addEventListener('pointerdown',e=>{e.preventDefault();ikClose()});
 const kd=e=>{if(!IKM)return;const bs=$$('.ik-it',pop);let k=bs.indexOf(document.activeElement);
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();ikClose()}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();k=e.key==='ArrowDown'?(k+1)%bs.length:(k-1+bs.length)%bs.length;bs[k]&&bs[k].focus()}};
 document.addEventListener('keydown',kd,true);
 IKM={pop,scrim,kd,anchor};
 if(anchor)anchor.classList.add('open');
 IKM.done=()=>{if(anchor)anchor.classList.remove('open')};
 return pop;
}
const _ikClose=ikClose;ikClose=function(){if(IKM&&IKM.done)IKM.done();_ikClose()};

/* ---------- barra do editor em grupos ---------- */
const cmdIt=(c,i,t,kb)=>({i,t,kb,run:()=>{restoreSel();document.execCommand(c,false,null);markDirty();syncToolbar()}});
const TBM={
 align:()=>[cmdIt('justifyLeft',I('al'),'Alinhar à esquerda'),cmdIt('justifyCenter',I('ac'),'Centralizar'),cmdIt('justifyRight',I('ar'),'Alinhar à direita'),cmdIt('justifyFull',I('aj'),'Justificar')],
 fmt:()=>[...[['p','Parágrafo','¶'],['h2','Título','H1'],['h3','Subtítulo','H2'],['blockquote','Citação','❝']].map(([v,t,i])=>({i:`<b style="font-size:13px">${i}</b>`,t,run:()=>{restoreSel();document.execCommand('formatBlock',false,v==='p'?'<p>':'<'+v+'>');markDirty();const b=$('#blk');if(b)b.value=v}})),'-',cmdIt('underline','<u>U</u>','Sublinhado','Ctrl+U'),cmdIt('strikeThrough','<s>S</s>','Tachado'),'-',cmdIt('justifyLeft',I('al'),'Alinhar à esquerda'),cmdIt('justifyCenter',I('ac'),'Centralizar'),cmdIt('justifyRight',I('ar'),'Alinhar à direita'),cmdIt('justifyFull',I('aj'),'Justificar'),'-',cmdIt('insertUnorderedList',I('ul'),'Lista'),cmdIt('insertOrderedList',I('ol'),'Lista numerada'),'-',cmdIt('removeFormat',I('clear'),'Limpar formatação')],
 ins:()=>{const rpg=P().type==='rpg';return[
  {i:I('img'),t:'Imagem',d:'Do computador ou da Galeria',run:()=>ACT.insImg(fakeEl())},
  {i:I('scene'),t:'Quebra de cena',d:'Separador ✦ ✦ ✦ entre cenas',run:()=>ACT.insScene(fakeEl())},
  {i:I('box'),t:rpg?'Caixa de leitura em voz alta':'Caixa de destaque',d:rpg?'Texto que o mestre lê para o grupo':'Bloco em destaque no texto',run:()=>ACT.insBox(fakeEl())},
  rpg&&{i:I('tpl'),t:'Ficha do compêndio',d:'Monstro, NPC ou item no texto',run:()=>ACT.insStat(fakeEl())},
  {i:'<b>@</b>',t:'Menção',d:'Ficha ou capítulo — ou digite @ no texto',run:()=>ACT.insMention(fakeEl()),hide:!(S.P&&S.P.type==='rpg')}]},
 rev:()=>{const n=(S.cmts&&S.cmts[S.cid]||[]).filter(c=>!c.res).length;return[
  {i:'💬',t:'Comentar trecho',d:'Selecione um trecho antes',run:()=>ACT.cmtAdd(fakeEl())},
  {i:'🗂',t:'Ver comentários'+(n?` (${n})`:''),d:'Abertos e resolvidos',run:()=>openNotesTab('cmts')},
  {i:'🕘',t:'Versões do capítulo',d:'Salvar e restaurar versões',run:()=>ACT.history(fakeEl())},
  '-',cmdIt('removeFormat',I('clear'),'Limpar formatação')]},
 view:()=>[
  {i:'📏',t:'Réguas e página',d:'Margens e folha como na impressão',on:!!S.prefs.ruler,run:()=>ACT.ruler(fakeEl())},
  {i:I('focus'),t:'Modo foco',d:'Esconde menus enquanto escreve',on:document.body.classList.contains('focus'),hide:isPhone(),run:()=>ACT.focusMode()},
  {i:I('notes'),t:'Notas e comentários',d:'Painel lateral do capítulo',run:()=>ACT.notes()},
  '-',{i:'🖨',t:'Visualizar impressão',d:'Páginas, sumário e PDF',run:()=>showView('print')}]
};
ACT.tbMenu=el=>{const k=el.dataset.m;if(IKM&&IKM.anchor===el){ikClose();return}saveSel&&saveSel();ikMenu(el,TBM[k](),{title:{align:'Alinhamento',fmt:'Formatar',ins:'Inserir',rev:'Revisar',view:'Exibir'}[k]})};

/* ---------- mesa: abas do mestre em grupos ---------- */
MT.mods=['Mecânicas','spark'];MT.camp=['Campanha','folder'];MT.look=['Aparência','brush'];
const MTG=[['Preparar',['tpl','chars','look','maps','skills','items']],['Mesa',['rules','mods','camp','guide']]];
const _renderSubtabs15=renderSubtabs;
renderSubtabs=function(){
 if(T.mode==='player')return _renderSubtabs15();
 const cur=T.mtab,used=MTG.flatMap(x=>x[1]),rest=Object.keys(MT).filter(k=>!used.includes(k));
 const b=k=>`<button data-act="tTab" data-t="${k}" class="${cur===k?'on':''}">${I(MT[k][1])}${MT[k][0]}</button>`;
 $('#tSub').innerHTML=MTG.map(([g,ks],i)=>`${i?'<span class="ik-sgs"></span>':''}<span class="ik-sg">${g}</span>`+ks.filter(k=>MT[k]).map(b).join('')).join('')+rest.map(b).join('');
 const on=$('#tSub .on');if(on&&on.scrollIntoView)try{on.scrollIntoView({block:'nearest',inline:'nearest'})}catch{}
};
const _mrRules15=MR.rules;
function mrPart(part){
 _mrRules15();const pad=$('#tMain .tpad');if(!pad)return;
 $$(':scope>.card',pad).forEach(c=>{const h=(c.querySelector('h3')||{}).textContent||'';const k=/Mecânicas da mesa/.test(h)?'mods':/Aventura pronta|Backup da campanha/.test(h)?'camp':'rules';c.style.display=k===part?'':'none'});
 const h2=pad.querySelector('.vh h2'),p=pad.querySelector('.vh p');
 if(part==='mods'){h2.textContent='Mecânicas da mesa';p.textContent='Ligue só os sistemas que combinam com o seu jogo — dá para mudar a qualquer momento, inclusive no meio da campanha.'}
 if(part==='camp'){h2.textContent='Campanha';p.textContent='Comece com uma aventura pronta e guarde cópias de segurança de tudo.'}
}
MR.rules=()=>mrPart(['mods','camp'].includes(T.mtab)?T.mtab:'rules');
MR.mods=()=>mrPart('mods');MR.camp=()=>mrPart('camp');

/* ---------- ferramentas do mestre por seção ---------- */
const GM_GROUPS=()=>[
 ['Cena',[['gmShow','🖼','Mostrar ao grupo','handouts'],['gmAmb','🔊','Som ambiente','sound'],['pDiaryOpen','📖','Diário e notas','quests']]],
 ['Regras e combate',[['gmCond','🌀','Condição','cond'],['pDice','🎲','Dados'+(MOD('secret')?' / secreta':''),''],['cbRest','🏕','Descanso',''],['cbXp','⭐','Dar XP','']]],
 ['Recompensas',[['gmChest','📦','Baú de tesouro','loot'],['gmShop','🏪','Loja','shop']]],
 ['Campanha',[['tblBackup','💾','Backup','']]]
].map(([g,xs])=>[g,xs.filter(x=>!x[3]||MOD(x[3]))]).filter(([,xs])=>xs.length);
ACT.gmTools=async()=>{
 const v=await modal({title:'🧰 Ferramentas do mestre',body:GM_GROUPS().map(([g,xs])=>`<div class="ik-gh">${g}</div><div class="gm-grid">${xs.map(([k,i,l])=>`<button class="gm-t" data-k="${k}"><span>${i}</span>${l}</button>`).join('')}</div>`).join('')+`<p class="small muted" style="margin:12px 0 0">Dica: <b>Ctrl+K</b> acha qualquer ferramenta pelo nome.</p>`,onMount:(ov,close)=>$$('[data-k]',ov).forEach(b=>b.onclick=()=>close(b.dataset.k)),actions:[{label:'Fechar'}]});
 if(v&&ACT[v])ACT[v](fakeEl())};

/* ---------- busca de ferramentas (Ctrl+K) ---------- */
function ikCtx(){return $('.tbl')&&T.gid?'table':S.P?'project':'home'}
function cmdList(){
 const L=[],add=(g,t,d,run,o={})=>L.push({g,t,d,run,...o}),c=ikCtx();
 const go=v=>async()=>{await showView(v)};
 const inW=(act,d)=>async()=>{if(S.view!=='write')await showView('write');await new Promise(r=>setTimeout(r,60));ACT[act]&&ACT[act](fakeEl(d||{}))};
 if(c==='project'){const p=P(),rpg=p.type==='rpg';
  add('Ir para','Escrever','Editor de capítulos',go('write'),{i:I('pen'),w:'Menu'});
  add('Ir para','Planejar','Capítulos por status, sinopses e meta',go('board'),{i:I('grid'),w:'Menu',k:'quadro kanban status sinopse meta'});
  add('Ir para','Compêndio','Personagens, lugares, wiki e linha do tempo',go('codex'),{i:I('book'),w:'Menu › Mundo',k:'wiki fichas personagens lugares linha do tempo tabela'});
  add('Ir para','Galeria','Imagens do projeto e capa',go('gallery'),{i:I('img'),w:'Menu › Mundo',k:'imagens fotos capa ilustração'});
  add('Ir para','Estilo do livro','Fontes, tema, capitular e marca d’água',go('style'),{i:I('brush'),w:'Menu › Livro pronto',k:'fonte tipografia tema aparência capitular marca dagua'});
  add('Publicar','Visualizar impressão','Páginas, sumário automático, margens',go('print'),{i:I('eye'),w:'Publicar',k:'pdf sumario indice imprimir a4 a5 margens paginas numeracao cabecalho'});
  add('Publicar','Gerar PDF','Igual à visualização de impressão',async()=>{await showView('print');setTimeout(()=>{const b=$('#pvPdf');b&&b.click()},300)},{i:'📄',w:'Publicar › Visualizar e PDF'});
  add('Publicar','Imprimir','Mandar para a impressora',async()=>{await showView('print');setTimeout(()=>{const b=$('#pvPrint');b&&b.click()},300)},{i:'🖨',w:'Publicar › Visualizar e PDF'});
  add('Publicar','Sumário automático','Ligar/desligar e ver números de página',go('print'),{i:'📑',w:'Publicar › Visualizar e PDF',k:'indice toc'});
  Object.entries(FMTS).forEach(([k,v])=>add('Publicar','Exportar '+v[0],v[1],async()=>{S.exp.fmt=k;await showView('export')},{i:I('dl'),w:'Publicar › Exportar arquivos'}));
  add('Publicar','Importar documento','Word, Markdown, PDF ou texto → capítulos',go('convert'),{i:I('up'),w:'Publicar › Importar documento',k:'docx word abrir trazer'});
  add('Projeto','Converter imagem','PNG, JPG, WEBP, tamanho e marca d’água',go('imgconv'),{i:I('swap'),w:'Galeria › Converter imagem',k:'redimensionar'});
  add('Projeto','Gerar imagem com IA','Ilustração para a galeria',async()=>{await showView('gallery');ACT.genImg()},{i:'🎨',w:'Galeria'});
  add('Projeto','Backup do projeto','Arquivo com tudo para guardar',()=>ACT.backup(fakeEl()),{i:'💾',w:'Publicar › Exportar arquivos',k:'salvar copia seguranca'});
  add('Escrever',rpg?'Nova seção':'Novo capítulo','',inW('chAdd'),{i:I('plus'),w:'Escrever › Estrutura'});
  add('Escrever','Novo rascunho','Ideias soltas que não entram no livro',inW('chAdd',{draft:'1'}),{i:I('notes'),w:'Escrever › Rascunhos'});
  add('Escrever','Nova pasta (ato / parte)','',inW('fAdd'),{i:I('folder'),w:'Escrever › Estrutura'});
  add('Escrever','Inserir imagem','',inW('insImg'),{i:I('img'),w:'Barra › Inserir'});
  add('Escrever','Quebra de cena','✦ ✦ ✦',inW('insScene'),{i:I('scene'),w:'Barra › Inserir'});
  add('Escrever',rpg?'Caixa de leitura em voz alta':'Caixa de destaque','',inW('insBox'),{i:I('box'),w:'Barra › Inserir'});
  if(rpg)add('Escrever','Inserir ficha do compêndio','',inW('insStat'),{i:I('tpl'),w:'Barra › Inserir',k:'statblock monstro'});
  add('Escrever','Mencionar ficha ou capítulo','Também dá para digitar @',inW('insMention'),{i:'<b>@</b>',w:'Barra › Inserir',k:'link mencao'});
  add('Escrever','Comentar trecho','Selecione o trecho antes',inW('cmtAdd'),{i:'💬',w:'Barra › Revisar',k:'comentario nota revisao'});
  add('Escrever','Ver comentários','',async()=>{if(S.view!=='write')await showView('write');openNotesTab('cmts')},{i:'🗂',w:'Barra › Revisar'});
  add('Escrever','Versões do capítulo','Histórico, restaurar',inW('history'),{i:'🕘',w:'Barra › Revisar',k:'historico desfazer backup'});
  add('Escrever','Réguas e página','Margens como no Word',inW('ruler'),{i:'📏',w:'Barra › Exibir',k:'regua margem recuo'});
  add('Escrever','Modo foco','Esconde menus',inW('focusMode'),{i:I('focus'),w:'Barra › Exibir',k:'tela cheia distração'});
  add('Escrever','Notas do capítulo','',async()=>{if(S.view!=='write')await showView('write');openNotesTab('notes')},{i:I('notes'),w:'Barra › Exibir'});
  add('Mundo','Nova ficha no compêndio','Personagem, lugar, item…',async()=>{await showView('codex');ACT.cxNew()},{i:I('plus'),w:'Compêndio',k:'personagem lugar criar'});
  add('Mundo','Nova categoria do compêndio','',async()=>{await showView('codex');ACT.cxCatNew&&ACT.cxCatNew(fakeEl())},{i:I('plus'),w:'Compêndio'});
  if(rpg)add('Jogo','Abrir mesa de jogo','Mapa, fichas e sessão ao vivo',()=>ACT.openTableP(),{i:I('table'),w:'Menu › Jogo',k:'rpg sessao jogar'});
  bookOrder(p).forEach((o,i)=>{const ch=cm(o.id);if(ch)add('Capítulos',`${i+1}. ${ch.title||'Sem título'}`,o.folder?o.folder.title:'',async()=>{await showView('write');openChapter(ch.id)},{i:'📄',dyn:1})});
  (p.drafts||[]).forEach(id=>{const ch=cm(id);if(ch)add('Capítulos',ch.title||'Rascunho','Rascunho',async()=>{await showView('write');openChapter(ch.id)},{i:'📝',dyn:1})});
  (p.codex||[]).forEach(e=>add('Compêndio',e.name||'Sem nome',e.cat||'',()=>editEntry(e.id),{i:'📇',dyn:1}));
 }
 if(c==='table'){const m=isMaster(),play=T.view==='play',on=T.game&&T.game.session&&T.game.session.on;
  if(m)add('Sessão',on?'Encerrar sessão':'Iniciar sessão',on?'Todos voltam para as abas':'Leva todos para a tela de jogo',()=>ACT[on?'sessEnd':'sessStart'](fakeEl()),{i:on?'⏹':'▶',w:'Topo da mesa'});
  if(!play){
   if(m)Object.entries(MT).forEach(([k,v])=>add('Mestre',v[0],'',()=>{if(T.mode!=='master')ACT.tMode(fakeEl({m:'master'}));ACT.tTab(fakeEl({t:k}))},{i:I(v[1]),w:'Mestre › '+(MTG.find(x=>x[1].includes(k))||['Abas'])[0],k:{mods:'modulos modulo condicoes loja saque',camp:'backup restaurar aventura pronta',guide:'aprender ensinar',rules:'regras combate iniciativa xp',tpl:'ficha modelo campos atributos'}[k]||''}));
   Object.entries(PT).forEach(([k,v])=>add('Jogador',v[0],'',()=>{if(T.mode!=='player')ACT.tMode(fakeEl({m:'player'}));ACT.tTab(fakeEl({t:k}))},{i:I(v[1]),w:'Jogador'}));
  }
  if(m)GM_GROUPS().forEach(([g,xs])=>xs.forEach(([k,i,l])=>add('Ferramentas do mestre',l,g,()=>ACT[k](fakeEl()),{i,w:'🧰 Ferramentas › '+g})));
  if(m&&!play)add('Ferramentas do mestre','Restaurar backup nesta mesa','',()=>ACT.tblRestore(fakeEl()),{i:I('up'),w:'Mestre › Campanha'});
  add('Mesa','Sair da mesa','',()=>ACT.tBack(),{i:I('back'),w:'Topo da mesa'});
 }
 if(c==='home'){
  add('Criar','Novo livro','',()=>ACT.newProject(fakeEl({type:'book'})),{i:I('book'),w:'Estante'});
  add('Criar','Nova campanha de RPG','',()=>ACT.newProject(fakeEl({type:'rpg'})),{i:'🎲',w:'Estante'});
  add('Criar','Restaurar backup','Abrir um arquivo de backup',()=>ACT.importBackup(fakeEl()),{i:I('up'),w:'Estante'});
  (S.projects||[]).forEach(p=>add('Projetos',p.title||'Sem título',p.type==='rpg'?'Campanha de RPG':'Livro',()=>openProject(p.id),{i:p.type==='rpg'?'🎲':'📖',dyn:1}));
 }
 if(c!=='home')add('Geral','Estante','Todos os seus projetos',async()=>{if(c==='table')ACT.tBack();else ACT.home()},{i:I('home')});
 add('Geral','Aprender a jogar RPG','Tutorial, regras e guia do mestre',()=>ACT.learn(fakeEl()),{i:'🎓',k:'tutorial ensinar novato mestre'});
 add('Geral','Explorar livros e RPGs','Publicados pela comunidade',()=>ACT.explore(),{i:'🔎'});
 add('Geral','Tema do app','Claro, escuro e cores',()=>ACT.themeQuick(fakeEl()),{i:I('brush'),k:'cor escuro claro'});
 add('Geral','Minha conta','Nome, avatar',()=>ACT.account(fakeEl()),{i:I('user')});
 return L;
}
ACT.cmdk=()=>{
 ikClose();if($('.ik-ov'))return;
 const all=cmdList(),ov=document.createElement('div');ov.className='ik-ov';
 ov.innerHTML=`<div class="ik-pal" role="dialog" aria-label="Buscar ferramenta"><div class="ik-q">${I('search')}<input id="ikQ" placeholder="Buscar ferramenta, capítulo ou ficha…" autocomplete="off"><button class="btn sm ghost" data-x>Esc</button></div><div class="ik-l" id="ikL"></div><div class="ik-f"><span>↑↓ navegar</span><span>Enter abrir</span><span>Esc fechar</span></div></div>`;
 document.body.appendChild(ov);
 let sel=0,shown=[];
 const close=()=>{ov.remove();document.removeEventListener('keydown',kd,true)};
 const draw=()=>{const q=nrm($('#ikQ',ov).value.trim()),ws=q.split(/\s+/).filter(Boolean);
  if(!ws.length)shown=all.filter(x=>!x.dyn);
  else{shown=all.map(x=>{const t=nrm(x.t),h=[t,nrm(x.d),nrm(x.k),nrm(x.g),nrm(x.w)].join(' ');if(!ws.every(w=>h.includes(w)))return null;let s=0;if(t.startsWith(ws[0]))s+=3;else if(t.includes(ws[0]))s+=2;if(!x.dyn)s+=.5;return[s,x]}).filter(Boolean).sort((a,b)=>b[0]-a[0]).map(a=>a[1])}
  shown=shown.slice(0,80);sel=Math.min(sel,Math.max(0,shown.length-1));
  let g=null,h='';shown.forEach((x,i)=>{if(!ws.length&&x.g!==g){g=x.g;h+=`<div class="ik-g">${esc(g)}</div>`}h+=`<button class="ik-it ${i===sel?'sel':''}" data-i="${i}"><span class="ic">${x.i||''}</span><span class="tx">${esc(x.t)}${x.d?`<small>${esc(x.d)}</small>`:''}</span>${x.w?`<span class="wh">${esc(x.w)}</span>`:ws.length?`<span class="wh">${esc(x.g)}</span>`:''}</button>`});
  $('#ikL',ov).innerHTML=h||`<p class="muted" style="padding:14px">Nada encontrado para “${esc($('#ikQ',ov).value)}”.</p>`;
  const s=$('#ikL .sel',ov);if(s)s.scrollIntoView({block:'nearest'})};
 const run=i=>{const x=shown[i];if(!x)return;close();Promise.resolve().then(()=>x.run())};
 const kd=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}else if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(shown.length-1,sel+1);draw()}else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);draw()}else if(e.key==='Enter'){e.preventDefault();e.stopPropagation();run(sel)}};
 document.addEventListener('keydown',kd,true);
 $('#ikQ',ov).oninput=()=>{sel=0;draw()};
 ov.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b){e.stopPropagation();run(+b.dataset.i);return}if(e.target===ov||e.target.closest('[data-x]'))close()});
 draw();setTimeout(()=>$('#ikQ',ov).focus(),20);
};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&(e.key==='k'||e.key==='K')){e.preventDefault();e.stopPropagation();if(typeof inEditorSel==='function'&&inEditorSel()&&!$('.ov')){ACT.insLink();return}if($('.ik-ov'))$('.ik-ov').remove();else ACT.cmdk()}},true);

/* ---------- abrir projeto: dica única ---------- */
const _openProject15=openProject;
openProject=async function(id){const r=await _openProject15(id);if(S.P&&!S.prefs.tip15){S.prefs.tip15=1;savePrefs();setTimeout(()=>toast(isPhone()?'Menu reorganizado: o que não está na barra de baixo fica em “Mais”. 🔍 acha qualquer ferramenta.':'Menu reorganizado em grupos. Use 🔍 Buscar ferramenta (Ctrl+K) para achar qualquer função.'),900)}return r};
window.addEventListener('resize',()=>{if(IKM&&!IKM.pop.classList.contains('sheet')&&isPhone())ikClose()});
