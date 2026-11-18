/* ============ ESTANTE ============ */
function coverStyle(p){const h=[...(p.title||'x')].reduce((a,c)=>a+c.charCodeAt(0),0);const pal=[['#5b2a1e','#a8573b'],['#1f3a4a','#3f7a8c'],['#2e2a45','#6a5a9a'],['#263b2a','#5f8a5b'],['#4a2a3a','#9a4a6a'],['#3a3020','#8a6a3a'],['#1c1c28','#4a4a6a']][h%7];return `background:linear-gradient(150deg,${pal[1]},${pal[0]})`}
function renderHome(){
 S.P=null;S.cid=null;document.body.classList.remove('focus');
 const folders=S.prefs.shelf||(S.prefs.shelf=[]);let hf=S.homeFolder||'*';if(hf!=='*'&&!folders.includes(hf))hf=S.homeFolder='*';
 const all=[...S.projects].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
 const ps=hf==='*'?all:all.filter(p=>(p.shelf||'')===hf);const cnt=f=>all.filter(p=>(p.shelf||'')===f).length;
 const nCh=p=>p.chapters.length-(p.drafts||[]).length;
 $('#app').innerHTML=`<div class="home">
  <header class="home-h"><div class="brand"><img class="brand-wm" src="img/wordmark.webp" alt="Inkmind"></div><div class="sp"></div>
   <span class="pill hide-m">${VISITOR()?'🎲 Visitante':S.backend==='cloud'?'☁ Sincronizado na sua conta':(lsOK?'💾 Salvo neste navegador':'⚠ Sem armazenamento')}</span>
   <button class="btn sm ghost" data-act="cmdk" title="Buscar (Ctrl+K)">${I('search')}</button><button class="btn sm" data-act="importBackup">${I('up')}<span class="hide-m">Restaurar backup</span></button>
   <button class="btn sm" data-act="themeQuick" title="Tema">${I('brush')}</button>${accountChip()}
  </header>
  ${S.prefs.banner===false?`<div class="homewrap hb-show"><button class="btn sm ghost" data-act="bannerShow">🖼 Mostrar imagem do Inkmind</button></div>`:`<div class="homewrap"><div class="hbanner"><img src="img/banner.webp" alt="Inkmind — Escreva, publique, jogue e viva suas histórias"><button class="hb-x" data-act="bannerHide" title="Ocultar imagem">×</button></div></div>`}
  <section class="hero"><h1>Sua estante</h1><p>Livros, campanhas e mundos inteiros — escreva, organize e exporte do seu jeito.</p>
   <div class="row wrap"><button class="btn primary" data-act="newProject" data-type="book">${I('book')} Novo livro</button><button class="btn" data-act="newProject" data-type="rpg">🎲 Nova campanha de RPG</button><button class="btn" data-act="explore">🔎 Explorar livros e RPGs</button><button class="btn" data-act="learn">🎓 Aprender a jogar</button></div></section>
  ${S.prefs.tutDone?'':`<div class="homewrap"><div class="learn-cta"><span class="lc-ic">🎲</span><div class="grow"><b>Novo em RPG de mesa?</b><small>Tutorial interativo de 10 minutos: crie um herói, role os dados e vença seu primeiro combate. Depois aprenda a ser mestre — do básico ao avançado.</small></div><div class="row wrap"><button class="btn primary" data-act="learn" data-lt="tut">Começar tutorial</button><button class="btn" data-act="learn" data-lt="gm">Quero ser mestre</button></div></div></div>`}
  <div class="homewrap"><div class="chips shelf-chips"><button class="chip ${hf==='*'?'on':''}" data-act="hf" data-f="*">Todos <span style="opacity:.6">${all.length}</span></button>${folders.map(f=>`<button class="chip ${hf===f?'on':''}" data-act="hf" data-f="${esc(f)}">📁 ${esc(f)} <span style="opacity:.6">${cnt(f)}</span></button>`).join('')}<button class="chip" data-act="hfNew">+ Pasta</button>${hf!=='*'?`<button class="chip" data-act="hfRen">Renomear</button><button class="chip" data-act="hfDel" style="color:#c0392b">Excluir pasta</button>`:''}</div></div>
  <div class="shelf">
   ${ps.map(p=>`<div class="book" data-act="open" data-id="${p.id}"><button class="bk-menu" data-act="pMenu" data-id="${p.id}" title="Mover para pasta">⋯</button>
     <div class="cover ${p.cover?'hasimg':''}" style="${coverStyle(p)}">${p.cover?`<img src="${esc(p.cover)}" alt="">`:''}<div class="ct" style="font-family:${fontStack(p.settings&&p.settings.headFont||'Fraunces')}">${esc(p.title)}</div>${p.author?`<div class="ca">${esc(p.author)}</div>`:''}</div>
     <div class="book-meta"><b>${esc(p.title)}</b><span class="pill">${p.type==='rpg'?'🎲 RPG':'📖 Livro'}</span><span class="pill">${nCh(p)} ${p.type==='rpg'?'seções':'cap.'}</span><span class="pill">${fmtK(p.chapters.reduce((a,c)=>a+(c.words||0),0))} palavras</span>${p.shelf&&hf==='*'?`<span class="pill">📁 ${esc(p.shelf)}</span>`:''}</div></div>`).join('')}
   <button class="newbook" data-act="newProject" data-type="book"><div><span class="big">+</span>Começar uma nova história</div></button>
  </div><div id="mesas"></div></div>`;
 ps.forEach(p=>p.settings&&loadFont(p.settings.headFont));
 loadMesas();
}
async function ask(title,label,value=''){
 return modal({title,body:`<label class="f">${label}</label><input id="askIn" value="${esc(value)}" maxlength="80">`,
  onMount:ov=>{const i=$('#askIn',ov);i.onkeydown=e=>{if(e.key==='Enter')$('.dlg-f .primary',ov).click()};setTimeout(()=>{i.focus();i.select()},40)},
  actions:[{label:'Cancelar'},{label:'OK',cls:'primary',onClick:ov=>$('#askIn',ov).value.trim()||false}]});
}
function saveShelfProject(p){p.updatedAt=Date.now();queueWrite('p_'+p.id,p)}
ACT.hf=el=>{S.homeFolder=el.dataset.f;renderHome()};
ACT.hfNew=async()=>{const n=await ask('Nova pasta','Nome da pasta (ex.: Fantasia, Contos, Campanhas)');if(!n)return;if(!S.prefs.shelf.includes(n))S.prefs.shelf.push(n);savePrefs();S.homeFolder=n;renderHome()};
ACT.hfRen=async()=>{const old=S.homeFolder;const n=await ask('Renomear pasta','Nome',old);if(!n||n===old)return;S.prefs.shelf=S.prefs.shelf.map(f=>f===old?n:f);S.projects.filter(p=>p.shelf===old).forEach(p=>{p.shelf=n;saveShelfProject(p)});savePrefs();S.homeFolder=n;renderHome()};
ACT.hfDel=async()=>{const f=S.homeFolder;if(!await confirmDlg(`Excluir a pasta “${esc(f)}”? Os projetos dela continuam na estante, só saem da pasta.`,'Excluir pasta'))return;S.prefs.shelf=S.prefs.shelf.filter(x=>x!==f);S.projects.filter(p=>p.shelf===f).forEach(p=>{p.shelf='';saveShelfProject(p)});savePrefs();S.homeFolder='*';renderHome()};
ACT.pMenu=async el=>{const p=S.projects.find(x=>x.id===el.dataset.id);if(!p)return;const fs=S.prefs.shelf||[];
 const v=await modal({title:esc(p.title),body:`<div class="menu-list">${fs.map(f=>`<button class="btn ${p.shelf===f?'primary':''}" data-v="${esc(f)}">📁 ${esc(f)}</button>`).join('')}<button class="btn ${!p.shelf?'primary':''}" data-v="__none">Sem pasta</button><button class="btn" data-v="__new">+ Nova pasta…</button><button class="btn danger" data-v="__del" style="margin-top:8px">🗑 Excluir projeto</button></div>`,
  onMount:(ov,close)=>$$('[data-v]',ov).forEach(b=>b.onclick=()=>close(b.dataset.v)),actions:[{label:'Fechar'}]});
 if(!v)return;if(v==='__del'){if(await deleteProject(p.id))renderHome();return}let f=v;if(v==='__new'){f=await ask('Nova pasta','Nome da pasta');if(!f)return;if(!fs.includes(f)){S.prefs.shelf.push(f);savePrefs()}}if(v==='__none')f='';
 p.shelf=f;saveShelfProject(p);renderHome();toast(f?'Movido para “'+f+'”':'Removido da pasta')};
async function loadMesas(){
 const box=$('#mesas');if(!box||S.backend!=='cloud')return;
 try{const snap=await withTimeout(myGamesSnap(),15000);let mine=[];try{const ms=await S.db.doc('seats/'+S.uid).get();if(ms.exists)mine=ms.data().gids||[]}catch{}
  const gs=snap.docs.map(d=>d.data()).filter(g=>g&&g.kind==='game'&&(g.masterId===S.uid||mine.includes(g.id)));if(!$('#mesas'))return;
  const ps=S.user&&S.user.profiles?await S.user.profiles(gs.map(g=>g.masterId).filter(Boolean)):{};
  $('#mesas').innerHTML=`<section class="mesas"><div class="vh"><div class="grow"><h2>Minhas mesas</h2><p>Campanhas que você mestra ou em que já entrou. Para achar outras, use 🔎 Explorar.</p></div></div>
   ${gs.length?`<div class="mesa-grid">${gs.map(g=>`<div class="mesa" data-act="openTable" data-id="${esc(g.id)}" role="button" tabindex="0">${g.masterId===S.uid?`<button class="mesa-del" data-act="mesaDel" data-id="${esc(g.id)}" title="Excluir mesa">🗑</button>`:''}<span class="mz">🎲</span><b>${esc(g.title||'Mesa')}</b><small>${g.masterId===S.uid?'Você é o mestre':'Mestre: '+esc(ps[g.masterId]&&ps[g.masterId].name||'—')}</small></div>`).join('')}</div>`:'<p class="muted">Nenhuma mesa ainda. Crie uma campanha de RPG e abra a “Mesa de jogo”, ou encontre uma em <a href="#" data-act="explore">Explorar</a>.</p>'}</section>`;
 }catch(e){console.warn('mesas',e)}
}
ACT.openTable=el=>openTable(el.dataset.id);
ACT.themeQuick=async()=>{
 await modal({title:'Aparência do Inkmind',body:themePickerHTML()+`<label class="toggle" style="margin-top:12px"><input type="checkbox" id="bnT" ${S.prefs.banner===false?'':'checked'}><span class="sw"></span>Mostrar a imagem do Inkmind na estante</label>`,onMount:ov=>{bindThemePicker(ov);$('#bnT',ov).onchange=e=>{S.prefs.banner=e.target.checked;savePrefs();if(!S.P&&!T.gid&&$('.shelf'))renderHome()}},actions:[{label:'Fechar',cls:'primary'}]});
};
ACT.bannerHide=()=>{S.prefs.banner=false;savePrefs();renderHome();toast('Imagem oculta. Para ver de novo, toque em “Mostrar imagem do Inkmind”.')};
ACT.bannerShow=()=>{S.prefs.banner=true;savePrefs();renderHome()};
function themePickerHTML(){return `<div class="themes">${Object.entries(THEMES).map(([k,v])=>`<button class="theme-sw ${S.prefs.theme===k?'on':''}" data-theme="${k}"><div class="tp" style="background:${v[1]}"><i style="background:${v[2]}"></i><i style="background:${v[3]};flex:.4"></i></div><span>${v[0]}</span></button>`).join('')}</div>
 <label class="f">Cor de destaque</label><div class="row"><input type="color" id="accentC" value="${S.prefs.accent||getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#8b3a2b'}"><button class="btn sm" id="accentReset">Padrão do tema</button></div>`}
function bindThemePicker(root){
 $$('.theme-sw',root).forEach(b=>b.onclick=()=>{S.prefs.theme=b.dataset.theme;S.prefs.accent='';applyTheme();savePrefs();$$('.theme-sw',root).forEach(x=>x.classList.toggle('on',x===b));const c=$('#accentC',root);if(c)c.value=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()});
 const c=$('#accentC',root);if(c)c.oninput=debounce(()=>{S.prefs.accent=c.value;applyTheme();savePrefs()},150);
 const r=$('#accentReset',root);if(r)r.onclick=()=>{S.prefs.accent='';applyTheme();savePrefs();c.value=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()};
}
ACT.newProject=async el=>{
 const t=el.dataset.type||'book';
 const v=await modal({title:'Novo projeto',body:`
  <div class="typepick"><label><input type="radio" name="tp" value="book" ${t==='book'?'checked':''}><span class="tt">📖 Livro</span><span class="small muted">Romance, conto, novela — com capítulos e wiki do mundo.</span></label>
  <label><input type="radio" name="tp" value="rpg" ${t==='rpg'?'checked':''}><span class="tt">🎲 RPG</span><span class="small muted">Campanha, aventura ou sistema — com compêndio, fichas e dados.</span></label></div>
  <label class="f">Título</label><input id="np-t" placeholder="Ex.: As Crônicas de Vel'Thar" maxlength="120">
  <div class="row"><div class="grow"><label class="f">Autor(a)</label><input id="np-a" placeholder="Seu nome ou pseudônimo"></div>
  <div class="grow"><label class="f">Gênero</label><select id="np-g">${GENRES.map(g=>`<option>${g}</option>`).join('')}</select></div></div>
  <label class="f">Começar com</label><select id="np-m"></select><p class="small muted" id="np-md" style="margin:4px 0 0"></p>`,
  onMount:ov=>{const desc=()=>{const tp=$('input[name=tp]:checked',ov).value,t=PTPL[tp].find(x=>x.id===$('#np-m',ov).value);$('#np-md',ov).textContent=t?t.d:''};const fill=()=>{const tp=$('input[name=tp]:checked',ov).value;$('#np-m',ov).innerHTML=PTPL[tp].map(t=>`<option value="${t.id}">${esc(t.n)}</option>`).join('');desc()};fill();$$('input[name=tp]',ov).forEach(r=>r.addEventListener('change',fill));$('#np-m',ov).onchange=desc},
  actions:[{label:'Cancelar'},{label:'Criar projeto',cls:'primary',onClick:ov=>({title:$('#np-t',ov).value.trim()||'Sem título',author:$('#np-a',ov).value.trim(),genre:$('#np-g',ov).value,type:$('input[name=tp]:checked',ov).value,tpl:$('#np-m',ov).value})}]});
 if(!v)return;
 const p={kind:'project',id:uid(),shelf:(S.homeFolder&&S.homeFolder!=='*')?S.homeFolder:'',outline:null,drafts:[],title:v.title,author:v.author,genre:v.genre,type:v.type,synopsis:'',cover:null,createdAt:Date.now(),updatedAt:Date.now(),chapters:[],codex:[],gallery:[],settings:defaultSettings(v.type,v.title),lastCh:null};
 if(!applyTemplate(p,v.tpl)){const first=v.type==='rpg'?['Introdução','Regras do Mundo','Aventura Inicial']:['Capítulo 1'];
 first.forEach(t=>{const id=uid();p.chapters.push({id,title:t,status:'rascunho',words:0});queueWrite('c_'+id,{kind:'chapter',pid:p.id,id,html:'',notes:''})})}
 S.projects.push(clone(p));queueWrite('p_'+p.id,p);
 openProject(p.id);
};
ACT.open=el=>openProject(el.dataset.id);
ACT.importBackup=async()=>{
 const [f]=await pickFile('.json,application/json');if(!f)return;
 try{
  const data=JSON.parse(await f.text());if(!['escritas','inkmind'].includes(data.app)||!data.project)throw 0;
  const p=data.project;const oldChs=data.chapters||{};
  p.id=uid();p.kind='project';p.title=p.title+(S.projects.some(x=>x.title===p.title)?' (cópia)':'');
  const idmap={};p.chapters=p.chapters.map(c=>{const nid=uid();idmap[c.id]=nid;const d=oldChs[c.id]||{};queueWrite('c_'+nid,{kind:'chapter',pid:p.id,id:nid,html:d.html||'',notes:d.notes||''});return{...c,id:nid}});
  if(Array.isArray(p.outline))p.outline=p.outline.map(n=>n.t==='f'?{...n,id:uid(),items:(n.items||[]).map(i=>idmap[i]).filter(Boolean)}:{t:'c',id:idmap[n.id]}).filter(n=>n.t==='f'||n.id);
  p.drafts=Array.isArray(p.drafts)?p.drafts.map(i=>idmap[i]).filter(Boolean):[];
  p.settings=Object.assign(defaultSettings(p.type,p.title),p.settings||{});p.lastCh=null;
  S.projects.push(clone(p));queueWrite('p_'+p.id,p);renderHome();toast('Backup restaurado: '+p.title);
 }catch{toast('Arquivo de backup inválido.','err')}
};
