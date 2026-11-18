"use strict";
/* ============ utilidades ============ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fmtK=n=>n>=1000?(n/1000).toFixed(n>=10000?0:1).replace('.',',')+'k':String(n);
const fmtN=n=>Number(n||0).toLocaleString('pt-BR');
const slug=s=>String(s||'arquivo').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-').toLowerCase().slice(0,60)||'arquivo';
const debounce=(fn,ms)=>{let t;const d=(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)};d.flush=()=>{clearTimeout(t);return fn()};d.cancel=()=>clearTimeout(t);return d};
function withTimeout(p,ms){return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej({code:'timeout'}),ms))])}
function countWords(t){const m=String(t||'').trim().match(/[\p{L}\p{N}'’-]+/gu);return m?m.length:0}
function htmlText(html){const d=document.createElement('div');d.innerHTML=html||'';return d.textContent||''}
const I=(n)=>`<svg class="ico" viewBox="0 0 24 24">${ICONS[n]||''}</svg>`;
const ICONS={
 undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
 redo:'<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
 al:'<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',ac:'<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
 ar:'<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',aj:'<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
 ul:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
 ol:'<path d="M10 6h10M10 12h10M10 18h10M4 4h1v4M4 8h2M4 14h2l-2 3h2"/>',
 quote:'<path d="M6 17c-1-1-2-3-2-5 0-3 2-5 5-6M14 17c-1-1-2-3-2-5 0-3 2-5 5-6"/>',
 img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
 clear:'<path d="M4 7V5h16v2M9 19h6M12 5l-2 14"/><path d="m3 3 18 18"/>',
 focus:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 notes:'<path d="M5 3h10l4 4v14H5z"/><path d="M9 11h6M9 15h6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 back:'<path d="M15 18l-6-6 6-6"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',up:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
 pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',book:'<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
 swap:'<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',brush:'<path d="M14 4l6 6-8 8-6-6z"/><path d="M6 12l-2 6 6-2"/>',
 out:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',scene:'<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>',
 box:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 10h8M8 14h5"/>',stat:'<path d="M4 4h16v16H4zM4 10h16M10 10v10"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
 bag:'<path d="M5 9h14l-1 11H6z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/>',
 dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.5-5 7-5s6.2 1.5 7 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.4 2.2 4 5"/>',
 spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
 tpl:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 table:'<path d="M3 8h18M5 8v11M19 8v11M8 4h8l2 4H6z"/>'
};

/* ============ estado ============ */
const S={uid:null,user:null,isAdmin:false,canWrite:null,homeFolder:'*',backend:'local',db:null,base:null,assets:null,downloads:null,prefs:{kind:'prefs',theme:'inkmind',accent:'',brandV:1},projects:[],P:null,cid:null,cache:{},view:'write',chDirty:false,codexCat:'Todos',codexQ:'',imp:null,conv:null,exp:{scope:'all',fmt:'pdf',page:'a5',title:true,toc:true,wm:true,codex:null,numbers:true,sel:{}}};
const P=()=>S.P;
const STATUS={rascunho:'Rascunho',revisao:'Em revisão',pronto:'Pronto'};
const GENRES=['Fantasia','Ficção científica','Terror','Romance','Mistério','Aventura','Drama','Histórico','Outro'];
const CATS={
 rpg:['Personagem','Criatura','Local','Item','Facção','Magia','Regra'],
 book:['Personagem','Local','Objeto','Grupo','Linha do tempo','Nota']
};
const CAT_ATTRS={
 'rpg:Personagem':['Classe','Raça','Nível','PV','CA','FOR','DES','CON','INT','SAB','CAR'],
 'rpg:Criatura':['Tipo','Nível/ND','PV','CA','Deslocamento','FOR','DES','CON','INT','SAB','CAR','Ataques'],
 'rpg:Local':['Região','Clima','Governante','Perigos'],
 'rpg:Item':['Tipo','Raridade','Peso','Valor','Efeito'],
 'rpg:Facção':['Líder','Objetivo','Aliados','Inimigos'],
 'rpg:Magia':['Escola','Nível','Alcance','Duração','Efeito'],
 'book:Personagem':['Idade','Papel na história','Aparência','Motivação','Medo'],
 'book:Local':['Região','Atmosfera','Importância'],
 'book:Objeto':['Dono','Origem','Importância'],
 'book:Grupo':['Líder','Objetivo','Membros'],
 'book:Linha do tempo':['Data/Época','Envolvidos']
};
const FONTS=[
 ['Literata','Serifa (leitura)','Literata:ital,wght@0,400;0,700;1,400'],
 ['Lora','Serifa (leitura)','Lora:ital,wght@0,400;0,700;1,400'],
 ['Merriweather','Serifa (leitura)','Merriweather:ital,wght@0,400;0,700;1,400'],
 ['EB Garamond','Serifa (leitura)','EB+Garamond:ital,wght@0,400;0,700;1,400'],
 ['Crimson Pro','Serifa (leitura)','Crimson+Pro:ital,wght@0,400;0,700;1,400'],
 ['Cormorant Garamond','Serifa (leitura)','Cormorant+Garamond:ital,wght@0,400;0,700;1,400'],
 ['Libre Baskerville','Serifa (leitura)','Libre+Baskerville:ital,wght@0,400;0,700;1,400'],
 ['Spectral','Serifa (leitura)','Spectral:ital,wght@0,400;0,700;1,400'],
 ['Alegreya','Serifa (leitura)','Alegreya:ital,wght@0,400;0,700;1,400'],
 ['Source Serif 4','Serifa (leitura)','Source+Serif+4:ital,wght@0,400;0,700;1,400'],
 ['Playfair Display','Títulos elegantes','Playfair+Display:ital,wght@0,400;0,700;1,400'],
 ['Cinzel','Fantasia & épico','Cinzel:wght@400;700'],
 ['Cinzel Decorative','Fantasia & épico','Cinzel+Decorative:wght@400;700'],
 ['MedievalSharp','Fantasia & épico','MedievalSharp'],
 ['Uncial Antiqua','Fantasia & épico','Uncial+Antiqua'],
 ['IM Fell English','Fantasia & épico','IM+Fell+English:ital@0;1'],
 ['Almendra','Fantasia & épico','Almendra:ital,wght@0,400;0,700;1,400'],
 ['Pirata One','Fantasia & épico','Pirata+One'],
 ['Metamorphous','Fantasia & épico','Metamorphous'],
 ['UnifrakturMaguntia','Gótica','UnifrakturMaguntia'],
 ['Grenze Gotisch','Gótica','Grenze+Gotisch:wght@400;700'],
 ['Creepster','Terror','Creepster'],
 ['Nosifer','Terror','Nosifer'],
 ['Orbitron','Ficção científica','Orbitron:wght@400;700'],
 ['Audiowide','Ficção científica','Audiowide'],
 ['Share Tech Mono','Ficção científica','Share+Tech+Mono'],
 ['Special Elite','Máquina de escrever','Special+Elite'],
 ['Courier Prime','Máquina de escrever','Courier+Prime:ital,wght@0,400;0,700;1,400'],
 ['Caveat','Manuscrita','Caveat:wght@400;700'],
 ['Dancing Script','Manuscrita','Dancing+Script:wght@400;700'],
 ['Amatic SC','Manuscrita','Amatic+SC:wght@400;700'],
 ['Inter','Sem serifa','Inter:wght@400;700'],
 ['Nunito','Sem serifa','Nunito:ital,wght@0,400;0,700;1,400']
];
const THEMES={inkmind:['Inkmind','#0d0912','#191222','#9d5cff'],'inkmind-claro':['Inkmind claro','#f3eee6','#fffdf9','#7b3fe4'],pergaminho:['Pergaminho','#ebe1cc','#fcf8ef','#8b3a2b'],noite:['Noite','#121419','#1d212b','#c9a45c'],claro:['Claro','#f2f2ef','#ffffff','#3651c9'],grimorio:['Grimório','#0d1714','#12201a','#d4a84a']};
const PAGES={a5:{fmt:'a5',w:148,h:210,l:'A5 (livro de bolso)'},'6x9':{fmt:[152.4,228.6],w:152.4,h:228.6,l:'6×9 pol. (KDP/gráfica)'},a4:{fmt:'a4',w:210,h:297,l:'A4'},letter:{fmt:'letter',w:215.9,h:279.4,l:'Carta (EUA)'}};
const LIB={
 mammoth:'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
 marked:'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js',
 html2pdf:'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
 jszip:'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
 docx:'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js',
 pdfjs:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
 pdfw:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
};
const _scripts={};
function loadScript(src){return _scripts[src]||(_scripts[src]=new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>{delete _scripts[src];rej(new Error('Falha ao carregar biblioteca'))};document.head.appendChild(s)}))}

function defaultSettings(type,title){return{
 bodyFont:type==='rpg'?'Alegreya':'Literata',headFont:type==='rpg'?'Cinzel':'Playfair Display',
 fontSize:18,lineHeight:1.7,paraStyle:type==='rpg'?'web':'book',align:'justify',dropcap:true,pageWidth:720,goal:type==='rpg'?20000:50000,customFonts:[],
 wm:{enabled:false,type:'text',text:'© '+(title||'Meu livro'),font:'Cinzel',color:'#6b4a33',opacity:.12,size:40,rotation:-30,mode:'tile',gap:110,showInEditor:true,image:null,imgScale:35}
}}

/* ============ sanitização ============ */
const OK_CLASSES=new Set(['scene','boxed','statblock','sb-sub','sb-abil']);
if(window.DOMPurify){
 DOMPurify.addHook('uponSanitizeAttribute',(node,data)=>{
  if(data.attrName==='style'){
   const a=/text-align\s*:\s*(left|right|center|justify)/i.exec(data.attrValue), w=/(?:^|;)\s*width\s*:\s*(\d{1,3})%/i.exec(data.attrValue);
   const out=[]; if(a)out.push('text-align:'+a[1].toLowerCase()); if(w&&node.nodeName==='IMG')out.push('width:'+clamp(+w[1],5,100)+'%');
   if(out.length)data.attrValue=out.join(';'); else data.keepAttr=false;
  }
  if(data.attrName==='class'){const c=data.attrValue.split(/\s+/).filter(x=>OK_CLASSES.has(x));if(c.length)data.attrValue=c.join(' ');else data.keepAttr=false}
 });
}
const SAN={ALLOWED_TAGS:['p','br','b','strong','i','em','u','s','strike','del','sup','sub','h1','h2','h3','h4','blockquote','ul','ol','li','hr','img','a','aside','div','table','thead','tbody','tr','th','td','figure','figcaption','span'],ALLOWED_ATTR:['src','alt','href','class','style','colspan']};
function clean(html){
 if(!window.DOMPurify){const d=document.createElement('div');d.textContent=htmlText(html);return d.innerHTML}
 let out=DOMPurify.sanitize(html||'',SAN);
 // desembrulha spans e divs simples
 const d=document.createElement('div');d.innerHTML=out;
 $$('span',d).forEach(s=>{if(!s.getAttribute('style'))s.replaceWith(...s.childNodes)});
 $$('div',d).forEach(x=>{if(!x.className){const p=document.createElement('p');if(x.getAttribute('style'))p.setAttribute('style',x.getAttribute('style'));if($$('p,h1,h2,h3,h4,ul,ol,blockquote,table,img,div,aside',x).length)x.replaceWith(...x.childNodes);else{p.append(...x.childNodes);x.replaceWith(p)}}});
 return d.innerHTML;
}
function txtToHtml(t){return String(t||'').replace(/\r/g,'').split(/\n{2,}|\n/).map(l=>l.trim()).filter(Boolean).map(l=>/^(\*\s*){3}$|^[-_*]{3,}$|^✦/.test(l)?'<hr class="scene">':'<p>'+esc(l)+'</p>').join('')}

/* ============ Firebase (versão do GitHub) ============ */
window.INK_FB=window.INK_FB||{apiKey:'AIzaSyAmuRcFjERV-dDY-lLj9Zy8NsF2xTsfFOo',authDomain:'inkmind-5c1ee.firebaseapp.com',projectId:'inkmind-5c1ee',storageBucket:'inkmind-5c1ee.firebasestorage.app',messagingSenderId:'1073024919939',appId:'1:1073024919939:web:4ba951f6f38b1721506eb6'};
const FBM=()=>!!(window.INK&&INK.mode==='firebase'&&INK.user);
const FBAVAIL=()=>!!(window.INK_FB&&INK_FB.apiKey)&&(!window.claude||!!window.INK);
const CLOUD_NEED=()=>FBAVAIL()?'entrando na sua conta do Inkmind':'com o app aberto no claude.ai';
/* ============ armazenamento ============ */
const LS='escritas:';
let lsOK=true;try{localStorage.setItem(LS+'t','1');localStorage.removeItem(LS+'t')}catch{lsOK=false}
const mem={};
const Store={
 async init(){
  if(!window.claude&&window.INK_FB&&INK_FB.apiKey){try{const m=await import(new URL(INK_FB.src||'./inkmind-fb.js',document.baseURI).href);m.start(INK_FB)}catch(e){console.warn('[inkmind] firebase',e);setTimeout(()=>toast('Não foi possível conectar à nuvem agora — usando o modo local deste navegador.','err'),1500)}}
  const use=n=>(window.claude&&typeof claude.use==='function')?Promise.resolve(claude.use(n)).catch(()=>null):Promise.resolve(null);
  const [db,user,assets,downloads,room,sample]=await Promise.all([use('db'),use('user'),use('assets'),use('downloads'),use('room'),use('sample')]);S.room=room;S.sample=sample;
  S.assets=assets;S.downloads=downloads;S.user=user;
  let id=null;try{id=user?await user.id():null}catch{}
  S.uid=id;try{S.me=user?await user.me():null}catch{}try{S.isAdmin=user?!!(await user.canEdit()):false;S.canWrite=user?await user.can('data.write'):null}catch{}
  if(db&&id){S.db=db;S.base='data/users/'+id;S.backend='cloud'}
  S.privCloud=S.backend==='cloud'&&!(S.me&&S.me.anon);
 },
 async list(){
  if(S.privCloud){const snap=await withTimeout(S.db.collection(S.base).where('kind','==','project').get(),15000);return snap.docs.map(d=>clone(d.data()))}
  const out=[];
  if(lsOK){for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(LS+'p_'))try{out.push(JSON.parse(localStorage.getItem(k)))}catch{}}}
  else Object.keys(mem).filter(k=>k.startsWith('p_')).forEach(k=>out.push(clone(mem[k])));
  return out;
 },
 async get(key){
  if(S.privCloud){const s=await withTimeout(S.db.doc(S.base+'/'+key).get(),15000);return s.exists?clone(s.data()):null}
  if(lsOK){const v=localStorage.getItem(LS+key);return v?JSON.parse(v):null}
  return mem[key]?clone(mem[key]):null;
 },
 async put(key,val){
  if(S.privCloud){const r=S.db.doc(S.base+'/'+key);return val===null?r.delete():r.set(val)}
  if(lsOK){if(val===null)localStorage.removeItem(LS+key);else localStorage.setItem(LS+key,JSON.stringify(val));return}
  if(val===null)delete mem[key];else mem[key]=clone(val);
 }
};
const WQ={};
function queueWrite(key,val){
 const q=WQ[key]||(WQ[key]={running:false,has:false,val:null});
 q.val=val===null?null:clone(val);q.has=true;
 if(!q.running)runQ(key);
}
async function runQ(key){
 const q=WQ[key];q.running=true;setStatus('saving');
 while(q.has){
  const v=q.val;q.has=false;
  try{await Store.put(key,v)}
  catch(e){
   let tries=0;
   if(e&&e.code==='unavailable'&&tries++<1){await sleep(600+Math.random()*800);try{await Store.put(key,v);continue}catch(e2){e=e2}}
   console.warn('save',key,e);
   const msg=(e&&(e.code==='invalid_argument'))?'Este conteúdo ficou grande demais para salvar (limite ~250 KB por capítulo). Divida o capítulo ou use imagens da Galeria.'
    :(e&&e.code==='quota_exceeded')?'Espaço de armazenamento cheio. Exclua projetos antigos.'
    :(e&&e.name==='QuotaExceededError')?'O armazenamento do navegador encheu. Use imagens menores ou exporte um backup.'
    :'Não foi possível salvar agora. Tentaremos de novo na próxima alteração.';
   toast(msg,'err');setStatus('err');q.running=false;return;
  }
 }
 q.running=false;
 if(!Object.values(WQ).some(x=>x.running))setStatus('ok');
}
function setStatus(s){
 const el=$('#status');if(!el)return;
 el.classList.toggle('saving',s==='saving');el.classList.toggle('err',s==='err');
 el.innerHTML='<span class="d"></span>'+(s==='saving'?'Salvando…':s==='err'?'Erro ao salvar':(VISITOR()?'Visitante':S.backend==='cloud'?'Salvo na nuvem':(lsOK?'Salvo neste navegador':'Sem armazenamento')));
}
const saveProject=debounce(()=>{const p=P();if(!p)return;p.updatedAt=Date.now();queueWrite('p_'+p.id,p);const i=S.projects.findIndex(x=>x.id===p.id);if(i>=0)S.projects[i]=clone(p)},700);
function savePrefs(){queueWrite('prefs',S.prefs)}

/* ============ imagens e arquivos ============ */
function fileToDataURL(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})}
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Imagem não pôde ser lida'));i.src=src})}
function canvasBlob(c,type,q){return new Promise(r=>c.toBlob(r,type,q))}
async function downscale(src,maxDim,type='image/webp',q=.85){
 const img=await loadImg(src);const k=Math.min(1,maxDim/Math.max(img.naturalWidth,img.naturalHeight));
 const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);
 const x=c.getContext('2d');if(type==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}x.drawImage(img,0,0,c.width,c.height);
 return {blob:await canvasBlob(c,type,q),w:c.width,h:c.height};
}
/* guarda uma imagem e devolve {src,w,h} */
async function storeImage(file){
 const okTypes=['image/png','image/jpeg','image/gif','image/webp','image/svg+xml'];
 if(file.type&&!file.type.startsWith('image/'))throw new Error('Isso não parece uma imagem.');
 const url=URL.createObjectURL(file);
 try{
  let img;try{img=await loadImg(url)}catch{throw new Error('Formato de imagem não suportado pelo navegador (tente PNG, JPG ou WEBP).')}
  const W=img.naturalWidth,H=img.naturalHeight;
  if(S.assets){
   let blob=file,type=file.type;
   if(!okTypes.includes(type)||file.size>8e6||Math.max(W,H)>3200){const r=await downscale(url,3200,'image/webp',.88);blob=r.blob;type='image/webp'}
   const up=await S.assets.upload(blob,{type});
   return {src:'/_blob/'+up.id,assetId:up.id,w:W,h:H};
  }
  const r=await downscale(url,1400,'image/webp',.8);
  return {src:await fileToDataURL(r.blob),w:r.w,h:r.h};
 }finally{URL.revokeObjectURL(url)}
}
function pickFile(accept,multiple=false){return new Promise(res=>{const i=$('#filepick');i.value='';i.accept=accept||'';i.multiple=multiple;i.onchange=()=>res([...i.files]);i.click()})}
async function saveFile(name,data){
 if(S.downloads){
  try{await S.downloads.save({filename:name,data});toast('Arquivo pronto: '+name)}
  catch(e){if(e&&e.code==='declined')return;if(e&&e.code==='rate_limited'){toast('Já existe um download aguardando confirmação.','err');return}toast('Não foi possível baixar: '+(e&&e.message||e&&e.code||'erro'),'err')}
  return;
 }
 try{const blob=data instanceof Blob?data:new Blob([data]);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);toast('Download iniciado: '+name)}
 catch{toast('Downloads não estão disponíveis nesta visualização.','err')}
}

/* ============ fontes ============ */
const loadedFonts=new Set();
function loadFont(name){
 if(!name||loadedFonts.has(name))return;
 const f=FONTS.find(x=>x[0]===name);
 if(f){loadedFonts.add(name);const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+f[2]+'&display=swap';document.head.appendChild(l);return}
 const p=P();const c=p&&p.settings.customFonts.find(x=>x.name===name);
 if(c){loadedFonts.add(name);try{const ff=new FontFace(c.name,`url(${c.src})`);ff.load().then(x=>document.fonts.add(x)).catch(()=>toast('Não consegui carregar a fonte '+c.name,'err'))}catch{}}
}
function fontStack(n){const f=FONTS.find(x=>x[0]===n);const fb=f&&/Sem serifa|ficção|Terror/i.test(f[1])?'sans-serif':'serif';return `"${n}", ${fb}`}
function loadProjectFonts(){const s=P().settings;s.customFonts.forEach(c=>loadFont(c.name));[s.bodyFont,s.headFont,s.wm.font].forEach(loadFont)}

/* ============ UI básicos ============ */
function toast(msg,kind){const t=document.createElement('div');t.className='toast '+(kind||'');t.textContent=msg;$('#toasts').appendChild(t);setTimeout(()=>t.remove(),kind==='err'?5200:2800)}
function modal({title,body,actions=[],wide=false,onMount}){
 return new Promise(res=>{
  const ov=document.createElement('div');ov.className='ov';
  ov.innerHTML=`<div class="dlg ${wide?'wide':''}" role="dialog"><div class="dlg-h"><h3>${title}</h3><button class="x" aria-label="Fechar">×</button></div><div class="dlg-b">${body}</div><div class="dlg-f"></div></div>`;
  const close=v=>{ov.remove();document.removeEventListener('keydown',kd);res(v)};
  const kd=e=>{if(e.key==='Escape')close(undefined)};document.addEventListener('keydown',kd);
  $('.x',ov).onclick=()=>close(undefined);
  ov.addEventListener('mousedown',e=>{if(e.target===ov)close(undefined)});
  actions.forEach(a=>{const b=document.createElement('button');b.className='btn '+(a.cls||'');b.innerHTML=a.label;b.onclick=async()=>{const v=a.onClick?await a.onClick(ov):a.value;if(v===false)return;close(v)};$('.dlg-f',ov).appendChild(b)});
  document.body.appendChild(ov);onMount&&onMount(ov,close);
  const f=$('input:not([type=checkbox]):not([type=radio]):not([type=file]),textarea',ov);if(f&&window.innerWidth>860)setTimeout(()=>{if(!ov.contains(document.activeElement))f.focus()},30);
 });
}
const confirmDlg=(msg,ok='Excluir')=>modal({title:'Tem certeza?',body:`<p>${msg}</p>`,actions:[{label:'Cancelar',value:false},{label:ok,cls:'primary',value:true}]});
function busy(msg){const b=document.createElement('div');b.className='busy';b.innerHTML=`<div class="bx"><div class="spin"></div><span>${esc(msg)}</span></div>`;document.body.appendChild(b);return{set:m=>{$('span',b).textContent=m},done:()=>b.remove()}}
function applyTheme(){
 document.documentElement.dataset.theme=THEMES[S.prefs.theme]?S.prefs.theme:'inkmind';
 document.documentElement.style.setProperty('--accent',S.prefs.accent||'');
 if(!S.prefs.accent)document.documentElement.style.removeProperty('--accent');
}

/* ============ ações (delegação) ============ */
const ACT={};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const f=ACT[el.dataset.act];if(f){e.preventDefault();e.stopPropagation();f(el,e)}});
