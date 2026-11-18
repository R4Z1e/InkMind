/* ============ v31: revisor do escritor — ortografia (dicionários baixáveis), gramática e estilo para livros ============
   - Dicionários: dict/*.trie.gz, baixados sob pedido e guardados no aparelho (IndexedDB); lidos num Web Worker (js/lib/spell-worker.js)
   - Aceita automaticamente: dicionário do escritor, nomes da wiki/compêndio e palavras ignoradas do projeto
   - Regras de gramática e estilo pensadas para ficção em português (diálogos, crase, pleonasmos, ecos, clichês…)
   - Sublinhados com a CSS Custom Highlight API (não mexem no texto salvo) */
const RV_LANGS=[
 {k:'pt-BR',n:'Português (Brasil)',f:'dict/pt-BR.trie.gz',mb:'1,7 MB',lic:'VERO/LibreOffice · GPL-3.0'},
 {k:'pt-PT',n:'Português (Portugal)',f:'dict/pt-PT.trie.gz',mb:'0,2 MB',lic:'Hunspell pt_PT · LGPL-3.0'},
 {k:'en-US',n:'English (US)',f:'dict/en-US.trie.gz',mb:'0,3 MB',lic:'SCOWL/Hunspell · MIT'},
 {k:'es-ES',n:'Español',f:'dict/es-ES.trie.gz',mb:'0,25 MB',lic:'Hunspell es · LGPL-3.0'}];
const RV_CATS={sp:['Ortografia','#e5484d'],gr:['Gramática','#f2994a'],dl:['Diálogo','#a77bf3'],st:['Estilo','#4ea1ff']};

/* ---------- guardar os dicionários no aparelho ---------- */
const DictDB={mem:{},_db:null,
 open(){if(this._db)return this._db;this._db=new Promise((res,rej)=>{try{const r=indexedDB.open('inkmind-dicts',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});this._db.catch(()=>{});return this._db},
 async tx(mode,fn){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction('f',mode),s=t.objectStore('f'),q=fn(s);t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})},
 async get(k){if(this.mem[k])return this.mem[k];try{return await this.tx('readonly',s=>s.get(k))||null}catch{return null}},
 async put(k,v){this.mem[k]=v;try{await this.tx('readwrite',s=>s.put(v,k))}catch{}},
 async del(k){delete this.mem[k];try{await this.tx('readwrite',s=>s.delete(k))}catch{}},
 async has(k){if(this.mem[k])return true;try{return !!(await this.tx('readonly',s=>s.getKey(k)))}catch{return false}}};

/* ---------- worker de ortografia ---------- */
let RVW=null,RVN=0;const RVP={},RVLoaded={};
function rvWorker(){if(RVW)return RVW;try{RVW=new Worker(new URL('js/lib/spell-worker.js?v=31',document.baseURI).href);RVW.onmessage=e=>{const m=e.data,p=RVP[m.id];if(!p)return;delete RVP[m.id];m.ok?p.res(m):p.rej(new Error(m.error||'erro'))};RVW.onerror=e=>{console.warn('corretor',e);}}catch(e){console.warn('worker',e);RVW=null}return RVW}
function rvCall(msg,transfer){const w=rvWorker();if(!w)return Promise.reject(new Error('sem worker'));const id=++RVN;return new Promise((res,rej)=>{RVP[id]={res,rej};w.postMessage({...msg,id},transfer||[])})}
async function rvEnsure(lang){if(RVLoaded[lang])return RVLoaded[lang];const v=await DictDB.get('d:'+lang);if(!v)return false;
 const fmt=v.fmt||'gz',buf=v.buf||v;   // gz (site) ou txt (artefato do Claude, que não serve .gz)
 RVLoaded[lang]=(fmt==='txt'?rvCall({t:'load',lang,text:new TextDecoder().decode(buf)}):rvCall({t:'loadBuf',lang,buf:buf.slice(0)})).then(()=>true).catch(e=>{console.warn(e);delete RVLoaded[lang];return false});return RVLoaded[lang]}
function rvUserWords(){const p=P();if(!p||!RVW)return;const ws=new Set();dictWords(p).forEach(w=>{ws.add(w);w.split(/[\s-]+/).forEach(x=>x&&ws.add(x))});
 (p.codex||[]).forEach(e=>{if(e.name){ws.add(e.name);e.name.split(/[\s,.'’()-]+/).forEach(x=>x&&ws.add(x))}});((p.rvIgnore||{}).words||[]).forEach(w=>ws.add(w));rvCall({t:'user',words:[...ws]}).catch(()=>{})}
const rvLang=()=>{const p=P();return (p&&p.lang)||S.prefs.spellLang||'pt-BR'};

/* ---------- gerenciador de dicionários ---------- */
async function rvDownload(L,onP){let fmt='gz',r=null;try{r=await fetch(new URL(L.f,document.baseURI).href)}catch{}
 if(!r||!r.ok){fmt='txt';r=await fetch(new URL(L.f.replace(/\.gz$/,'.txt'),document.baseURI).href)}if(!r.ok)throw new Error('HTTP '+r.status);
 const total=+r.headers.get('content-length')||0,rd=r.body.getReader(),parts=[];let got=0;
 for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;onP&&onP(total?got/total:0,got)}
 const buf=new Uint8Array(got);let o=0;for(const p of parts){buf.set(p,o);o+=p.length}
 await DictDB.put('d:'+L.k,{fmt,buf:buf.buffer});delete RVLoaded[L.k];return true}
ACT.rvDicts=async()=>{const have={};for(const L of RV_LANGS)have[L.k]=await DictDB.has('d:'+L.k);const cur=rvLang();
 await modal({title:'📚 Dicionários do corretor',wide:true,body:`<p style="margin-top:0">Baixe o dicionário do idioma em que você escreve. Ele fica guardado neste aparelho e funciona sem internet. O corretor também aceita as palavras do seu <b>Dicionário do escritor</b> e os nomes da sua wiki.</p>
  <div id="rvDl">${RV_LANGS.map(L=>`<div class="rv-dict" data-k="${L.k}"><div class="grow"><b>${L.n}</b><div class="small muted">${L.mb} · ${L.lic}</div><div class="rv-prog" style="display:none"><i></i></div></div>
   ${have[L.k]?`<label class="small rv-use"><input type="radio" name="rvL" value="${L.k}" ${cur===L.k?'checked':''}> usar neste projeto</label><span class="pill on">✓ baixado</span><button class="btn sm ghost" data-rvrm="${L.k}">Remover</button>`:`<button class="btn sm primary" data-rvdl="${L.k}">Baixar</button>`}</div>`).join('')}</div>
  <p class="small muted" style="margin-top:12px">Os dicionários vêm de projetos livres (LibreOffice/VERO, Hunspell e cspell), cada um com a sua licença — veja <a href="dict/LEIA-ME.md" target="_blank" rel="noopener">dict/LEIA-ME.md</a>.</p>`,
  onMount:ov=>{$$('[data-rvdl]',ov).forEach(b=>b.onclick=async()=>{const L=RV_LANGS.find(x=>x.k===b.dataset.rvdl),row=b.closest('.rv-dict'),pg=$('.rv-prog',row);b.disabled=true;b.textContent='Baixando…';pg.style.display='';
    try{await rvDownload(L,f=>{pg.firstElementChild.style.width=Math.round(f*100)+'%'});const p=P();if(p&&!p.lang){p.lang=L.k;saveProject()}S.prefs.spellLang=S.prefs.spellLang||L.k;savePrefs();toast(L.n+' pronto para usar!');$('.ov')&&$('.ov').remove();ACT.rvDicts();if($('#rvPanel'))rvRun()}
    catch(e){console.warn(e);b.disabled=false;b.textContent='Tentar de novo';toast('Não consegui baixar agora. Confira a internet.','err')}});
   $$('[data-rvrm]',ov).forEach(b=>b.onclick=async()=>{await DictDB.del('d:'+b.dataset.rvrm);delete RVLoaded[b.dataset.rvrm];rvCall({t:'unload',lang:b.dataset.rvrm}).catch(()=>{});toast('Dicionário removido deste aparelho.');$('.ov')&&$('.ov').remove();ACT.rvDicts()});
   $$('input[name=rvL]',ov).forEach(r=>r.onchange=()=>{const p=P();if(p){p.lang=r.value;saveProject()}S.prefs.spellLang=r.value;savePrefs();if($('#rvPanel'))rvRun()})},
  actions:[{label:'Fechar',cls:'primary'}]})};

/* ---------- texto do capítulo com mapa de posições ---------- */
function rvCollect(page){const segs=[];let text='',lastBlock=null;
 const tw=document.createTreeWalker(page,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const el=n.parentElement;if(!el||el.closest('.mention,sup,.fnref,.pgbreak,figcaption,.cmt-mark'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
 for(let n=tw.nextNode();n;n=tw.nextNode()){const b=n.parentElement.closest('p,h1,h2,h3,h4,li,blockquote,td,th,div')||page;if(lastBlock&&b!==lastBlock)text+='\n';lastBlock=b;segs.push({node:n,start:text.length,end:text.length+n.data.length});text+=n.data}
 return{text,segs}}
function rvRange(col,s,e){const find=pos=>{let lo=0,hi=col.segs.length-1;while(lo<=hi){const m=(lo+hi)>>1,g=col.segs[m];if(pos<g.start)hi=m-1;else if(pos>g.end)lo=m+1;else return[g.node,pos-g.start]}return null};
 const a=find(s),b=find(e);if(!a||!b)return null;try{const r=document.createRange();r.setStart(a[0],a[1]);r.setEnd(b[0],b[1]);return r}catch{return null}}

/* ---------- regras (português, foco em ficção) ---------- */
const DICENDI='disse|diz|dizia|perguntou|pergunta|respondeu|responde|gritou|grita|murmurou|murmura|falou|fala|sussurrou|sussurra|exclamou|retrucou|comentou|continuou|explicou|insistiu|afirmou|repetiu|completou|resmungou|berrou|choramingou|riu|sorriu|concordou|protestou|acrescentou|interrompeu|admitiu|confessou|avisou|ordenou|implorou|suspirou|indagou';
const RV_RULES=[
 // [id, cat, regex (flags gu), mensagem, sugestão(match)->string|string[], explicação]
 ['rep','gr',/(?<![\p{L}])(\p{L}+)\s+\1(?![\p{L}])/giu,'Palavra repetida',m=>[m[1]],'A mesma palavra aparece duas vezes seguidas.'],
 ['anivel','gr',/\ba nível de\b/giu,'“A nível de” é condenado pela norma',()=>['em nível de','no nível de'],'Prefira “em nível de” (ou reescreva).'],
 ['apartir','gr',/\bà partir\b/giu,'Sem crase antes de verbo',()=>['a partir'],'Não há crase antes de verbo.'],
 ['crasepron','gr',/\bà (ele|ela|eles|elas|você|vocês|mim|ti|nós|vós|todos|todas|alguém|ninguém|cada|esta|essa|isso|isto|aquilo|qualquer|uma|um)\b/giu,'Sem crase antes de pronome ou artigo indefinido',m=>['a '+m[1]],'“À” é a + a; não se usa antes de pronomes pessoais, indefinidos e “um/uma”.'],
 ['crasemasc','gr',/\bà (pé|cavalo|prazo|bordo|lápis|caneta|óleo|vapor)\b/giu,'Sem crase antes de palavra masculina',m=>['a '+m[1]],'Antes de palavra masculina não há crase.'],
 ['asvezes','gr',/\bas vezes\b(?!\s+(?:que|em que))/giu,'Locução com crase',()=>['às vezes'],'Com sentido de “de vez em quando”, escreve-se “às vezes”.'],
 ['amedida','gr',/\ba (medida|beira|frente|procura|espera|mercê|custa) (que|de|do|da|dos|das)\b/giu,'Locução com crase',m=>['à '+m[1]+' '+m[2]],'Locuções femininas como “à medida que”, “à beira de”, “à procura de” levam crase.'],
 ['afim','gr',/\bafim de\b/giu,'“A fim de” (finalidade)',()=>['a fim de'],'“Afim” significa “semelhante”; para finalidade, use “a fim de”.'],
 ['derrepente','gr',/\bderrepente\b/giu,'Escreve-se separado',()=>['de repente'],''],
 ['concerteza','gr',/\bconcerteza\b/giu,'Escreve-se separado',()=>['com certeza'],''],
 ['fazem','gr',/\bfazem (dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|muitos|muitas|alguns|algumas|vários|várias|poucos|poucas|\d+) (anos|dias|meses|semanas|horas|minutos|séculos|décadas|noites)\b/giu,'Tempo decorrido: verbo no singular',m=>['faz '+m[1]+' '+m[2]],'“Fazer” indicando tempo não tem sujeito: “faz dois anos”.'],
 ['houveram','gr',/\bhouveram\b/giu,'“Haver” (existir) não vai ao plural',()=>['houve'],'Com sentido de existir/acontecer: “houve muitos problemas”.'],
 ['haviam','gr',/\bhaviam (muitos|muitas|vários|várias|poucos|poucas|alguns|algumas|dois|duas|três|tantos|tantas|outros|outras)\b/giu,'“Haver” (existir) não vai ao plural',m=>['havia '+m[1]],'Com sentido de existir: “havia muitas pessoas”.'],
 ['menas','gr',/\bmenas\b/giu,'“Menos” não varia',()=>['menos'],''],
 ['maispior','gr',/\bmais (pior|melhor)\b/giu,'Redundância',m=>[m[1]],'“Pior” e “melhor” já são comparativos.'],
 ['portraz','gr',/\b(por|para|pra) traz\b/giu,'“Trás” (lugar) leva acento e s',m=>[m[1]+' trás'],'“Traz” é do verbo trazer.'],
 ['agentevamos','gr',/\ba gente (vamos|fomos|somos|estamos|temos|íamos|éramos|fizemos|podemos)\b/giu,'“A gente” pede verbo na 3ª pessoa do singular',m=>({vamos:'a gente vai',fomos:'a gente foi',somos:'a gente é',estamos:'a gente está',temos:'a gente tem',íamos:'a gente ia',éramos:'a gente era',fizemos:'a gente fez',podemos:'a gente pode'})[m[1].toLowerCase()],'Ou troque por “nós”, mantendo o verbo.'],
 ['nemsequer','gr',/\bnem se quer\b/giu,'“Sequer” é uma palavra só',()=>['nem sequer'],''],
 ['paramim','gr',/\bpara mim (fazer|ir|ver|dizer|falar|sair|entrar|ficar|ser|ter|poder|saber|comer|beber|ler|escrever|levar|trazer|pegar|dar|encontrar|matar|lutar)\b/giu,'Sujeito de infinitivo: “eu”',m=>['para eu '+m[1]],'“Para mim fazer” → “para eu fazer” (mim não faz nada).'],
 ['porqueq','gr',/\b(porque|por que)\s*\?/giu,'No fim da pergunta: “por quê?”',()=>['por quê?'],'Em final de frase, “quê” é tônico e leva acento.'],
 ['malhumor','gr',/\bmal (humorado|humorada|educado|educada|criado|criada|agradecido|agradecida|intencionado|intencionada|encarado|encarada)\b/giu,'Com hífen',m=>['mal-'+m[1]],'Antes de vogal ou h, “mal” se liga com hífen.'],
 ['mausinal','gr',/\b(um|o|que) mal (sinal|exemplo|cheiro|tempo|pressentimento|presságio|hábito|gosto|caráter|negócio|momento|aluno|homem|rei|mago)\b/giu,'“Mau” (adjetivo), oposto de “bom”',m=>[m[1]+' mau '+m[2]],'“Mal” é o oposto de “bem”; “mau”, de “bom”.'],
 // espaços e pontuação
 ['espaco2','gr',/(?<=\S) {2,}(?=\S)/gu,'Espaço duplo',()=>[' '],''],
 ['espacoantes','gr',/(?<=\p{L}) +([,.;:!?…])/gu,'Espaço antes da pontuação',m=>[m[1]],''],
 ['semespaco','gr',/(?<=\p{Ll}{2})([,;:!?])(?=\p{L})/gu,'Falta espaço depois da pontuação',m=>[m[1]+' '],''],
 ['virgula2','gr',/,{2,}/gu,'Vírgula repetida',()=>[','],''],
 // diálogo
 ['travessao','dl',/^[ \t]*(?:-|–)\s+(?=\S)/gmu,'Diálogo: use travessão (—)',()=>['— '],'Em livros, a fala começa com travessão longo (—), não hífen.'],
 ['travesp','dl',/^[ \t]*—(?=\p{L})/gmu,'Diálogo: espaço depois do travessão',()=>['— '],'O costume editorial no Brasil é “— Fala”, com espaço.'],
 ['tagponto','dl',new RegExp('\\.\\s+—\\s+('+DICENDI+')\\b','giu'),'Diálogo: sem ponto antes do verbo de fala',m=>[' — '+m[1]],'“— Vamos embora — disse ele.” O ponto sai; ponto de interrogação e exclamação ficam.'],
 ['retic','dl',/(?<!\.)\.{3}(?!\.)|\. \. \./gu,'Reticências tipográficas',()=>['…'],'Um caractere só (…) evita quebras feias na impressão.'],
 ['excl','st',/[!?]{3,}|!{2,}/gu,'Pontuação em excesso',m=>[m[0].includes('?')?'?!':'!'],'Em livro, uma exclamação basta: deixe a emoção para as palavras.'],
 // estilo (ficção)
 ['pleon','st',/\b((?:sub|sob)\p{L}* (?:para|pra) cima|desc\p{L}* (?:para|pra) baixo|entr\p{L}* (?:para|pra) dentro|sa[ií]\p{L}* (?:para|pra) fora|elo de ligação|encarar de frente|surpresa inesperada|outra alternativa|planejar antecipadamente|repetir de novo|monopólio exclusivo|há (?:\p{L}+|\d+) (?:anos|dias|meses|semanas|horas|minutos) atrás|criar novos?|ganhar grátis|certeza absoluta|abertura inaugural|habitat natural|panorama geral|hemorragia de sangue)\b/giu,'Pleonasmo (redundância)',m=>{const t=m[0];const r=t.replace(/ (?:para|pra) (cima|baixo|dentro|fora)$/i,'').replace(/ de ligação$/i,'').replace(/ de frente$/i,'').replace(/ inesperada$/i,'').replace(/^outra /i,'').replace(/ antecipadamente$/i,'').replace(/ de novo$/i,'').replace(/ exclusivo$/i,'').replace(/ atrás$/i,'').replace(/ grátis$/i,'').replace(/ absoluta$/i,'').replace(/ inaugural$/i,'').replace(/ natural$/i,'').replace(/ geral$/i,'').replace(/ de sangue$/i,'');return r!==t?[r]:[]},'A segunda parte repete a ideia da primeira.'],
 ['cliche','st',/\b(de repente|um arrepio (?:percorreu|subiu)|frio na espinha|o sangue (?:gelou|congelou)|o coração (?:disparou|acelerou)|suspirou aliviad[oa]|como num passe de mágica|no fundo do coração|olhos marejados|sorriso de orelha a orelha|em (?:uma )?fração de segundos?|como se não houvesse amanhã|silêncio ensurdecedor|tempestade de emoções|pela primeira vez na vida|soltou o ar que nem sabia que estava prendendo)\b/giu,'Clichê',()=>[],'Expressão muito usada: uma imagem nova costuma ter mais força.'],
];
// \b do JavaScript só entende letras sem acento: troca por uma fronteira de palavra que conhece "à", "você", "ção"…
const RV_UB='(?:(?<![\\p{L}\\p{N}])(?=[\\p{L}\\p{N}])|(?<=[\\p{L}\\p{N}])(?![\\p{L}\\p{N}]))';
RV_RULES.forEach(r=>{const f=r[2].flags.includes('u')?r[2].flags:r[2].flags+'u';r[2]=new RegExp(r[2].source.split('\\b').join(RV_UB),f)});
const RV_STOP=new Set('a o as os um uma uns umas de da do das dos em na no nas nos por para pra com sem que se e é era foi ser estar ele ela eles elas eu tu você nós vocês me te lhe lhes seu sua seus suas meu minha meus minhas mais mas como quando onde já não sim muito muita muitos muitas tudo todo toda todos todas isso isto aquilo esse essa este esta aquele aquela ao aos à às pelo pela pelos pelas num numa até depois antes então ainda também só bem mal havia tinha ter fazer disse'.split(' '));
function rvStyle(text,out){const paras=text.split('\n');let base=0;
 for(const para of paras){
  // advérbios em -mente: aviso quando 3+ no mesmo parágrafo
  const adv=[...para.matchAll(/\p{L}{4,}mente(?!\p{L})/giu)];if(adv.length>=3)adv.forEach(m=>out.push({s:base+m.index,e:base+m.index+m[0].length,cat:'st',rule:'mente',msg:`${adv.length} advérbios em “-mente” neste parágrafo`,sug:[],why:'Muitos advérbios seguidos deixam o texto pesado; um verbo mais preciso costuma resolver.'}));
  // frases longas
  for(const m of para.matchAll(/[^.!?…]+[.!?…]*/gu)){const n=(m[0].match(/\p{L}+/gu)||[]).length;if(n>45)out.push({s:base+m.index,e:base+m.index+Math.min(m[0].length,60),cat:'st',rule:'longa',msg:`Frase longa (${n} palavras)`,sug:[],why:'Frases muito longas cansam; experimente dividir.'})}
  // ecos: palavra repetida perto (até 12 palavras)
  const ws=[...para.matchAll(/\p{L}{5,}/gu)],last={};ws.forEach((m,i)=>{const k=m[0].toLowerCase();if(RV_STOP.has(k))return;if(last[k]!=null&&i-last[k]<=12)out.push({s:base+m.index,e:base+m.index+m[0].length,cat:'st',rule:'eco',msg:`Eco: “${m[0]}” repetida perto`,sug:[],why:'A mesma palavra a poucas palavras de distância chama atenção. Use um sinônimo ou reescreva.'});last[k]=i});
  base+=para.length+1}}
function rvGrammar(text){const out=[];for(const [id,cat,re,msg,sugf,why] of RV_RULES){re.lastIndex=0;for(const m of text.matchAll(re)){let sug=[];try{const v=sugf(m);sug=(Array.isArray(v)?v:[v]).filter(x=>x!=null)}catch{}
 // mantém maiúscula inicial
 if(sug.length&&/^\p{Lu}/u.test(m[0].trim()))sug=sug.map(x=>x?x[0].toUpperCase()+x.slice(1):x);
 out.push({s:m.index,e:m.index+m[0].length,cat,rule:id,msg,sug,why,orig:m[0]})}}
 rvStyle(text,out);
 // mistura de estilos de diálogo
 const tv=(text.match(/^[ \t]*—/gm)||[]).length,aspas=(text.match(/^[ \t]*[“"]/gm)||[]).length;if(tv&&aspas){const m=/^[ \t]*[“"]/m.exec(text);out.push({s:m.index,e:m.index+1,cat:'dl',rule:'mix',msg:'Diálogos com travessão e com aspas no mesmo capítulo',sug:[],why:'Escolha um só jeito de marcar as falas para manter o padrão do livro.'})}
 return out}
const lev=(a,b)=>{if(Math.abs(a.length-b.length)>2)return 9;const d=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]};

/* ---------- execução ---------- */
const RV={issues:[],col:null,cats:{sp:1,gr:1,dl:1,st:1},busy:false,lang:null,dict:false};
async function rvRun(){const page=$('#page'),p=P();if(!page||!p||!$('#rvPanel'))return;if(RV.busy){RV.again=true;return}RV.busy=true;
 try{const col=rvCollect(page),text=col.text,lang=rvLang(),pt=lang.startsWith('pt');let issues=[];RV.col=col;RV.lang=lang;
  const ign=p.rvIgnore||{},ignK=new Set(ign.keys||[]),ignR=new Set(ign.rules||[]);
  // ortografia
  RV.dict=await rvEnsure(lang);
  if(RV.dict){rvUserWords();const toks=[...text.matchAll(/[\p{L}][\p{L}\p{M}'’-]*[\p{L}]|[\p{L}]/gu)].filter(m=>!/^\p{Lu}{2,6}$/u.test(m[0])&&m[0].length>1);
   const uniq=[...new Set(toks.map(m=>m[0].replace(/’/g,"'")))];const {bad}=await rvCall({t:'check',lang,words:uniq});
   // palavras com hífen: aceita se todas as partes existem
   const badSet=new Set(bad);const hy=bad.filter(w=>w.includes('-'));if(hy.length){const parts=[...new Set(hy.flatMap(w=>w.split('-')).filter(Boolean))];const r=await rvCall({t:'check',lang,words:parts});const bp=new Set(r.bad);hy.forEach(w=>{if(w.split('-').filter(Boolean).every(x=>!bp.has(x)))badSet.delete(w)})}
   const names=[...new Set([...(p.codex||[]).map(e=>e.name),...dictWords(p)].flatMap(n=>String(n||'').split(/[\s,.'’()-]+/)).filter(x=>x&&x.length>=3))];
   for(const m of toks){const w=m[0].replace(/’/g,"'");if(!badSet.has(w))continue;const near=/^\p{Lu}/u.test(w)?names.find(n=>n!==w&&lev(n.toLowerCase(),w.toLowerCase())<=(n.length>=7?2:1)):null;
    issues.push({s:m.index,e:m.index+m[0].length,cat:'sp',rule:'sp',word:w,msg:near?`Parece o nome “${near}” do seu mundo`:'Palavra não encontrada no dicionário',sug:near?[near]:null,why:near?'Grafia diferente de um nome da wiki ou do dicionário do escritor.':''})}}
  if(pt){const g=rvGrammar(text);issues=issues.filter(x=>x.cat!=='sp'||!g.some(y=>y.cat==='gr'&&y.s<=x.s&&y.e>=x.e));issues.push(...g)}
  issues=issues.filter(x=>!ignR.has(x.rule)&&!ignK.has(x.rule+':'+(x.word||text.slice(x.s,x.e)).toLowerCase())).sort((a,b)=>a.s-b.s);
  // remove sobreposições do mesmo tipo
  RV.issues=issues.filter((x,i)=>!issues.slice(0,i).some(y=>y.cat===x.cat&&y.s<x.e&&x.s<y.e&&y.rule===x.rule));
  rvPaint();rvDraw()}
 catch(e){console.warn('revisor',e)}finally{RV.busy=false;if(RV.again){RV.again=false;setTimeout(rvRun,50)}}}
function rvPaint(){if(!window.CSS||!CSS.highlights||typeof Highlight==='undefined')return;Object.keys(RV_CATS).forEach(k=>CSS.highlights.delete('rv-'+k));if(!$('#rvPanel')||!RV.col)return;
 const by={};RV.issues.forEach(x=>{if(!RV.cats[x.cat])return;const r=rvRange(RV.col,x.s,x.e);if(r)(by[x.cat]=by[x.cat]||[]).push(r)});Object.entries(by).forEach(([k,rs])=>CSS.highlights.set('rv-'+k,new Highlight(...rs)))}
function rvClear(){if(window.CSS&&CSS.highlights)Object.keys(RV_CATS).forEach(k=>CSS.highlights.delete('rv-'+k))}

/* ---------- painel ---------- */
ACT.rvOpen=async()=>{if(S.view!=='write')await showView('write');let d=$('#rvPanel');if(d){d.remove();rvClear();return}
 document.body.insertAdjacentHTML('beforeend',`<aside id="rvPanel" class="rv-panel"><div class="rv-h"><b>✍️ Revisão do capítulo</b><span class="sp"></span><button class="btn sm ghost" data-act="rvDicts" title="Dicionários">📚</button><button class="btn sm ghost" data-act="rvOpen" title="Fechar">✕</button></div><div class="rv-chips" id="rvChips"></div><div class="rv-l" id="rvList"><p class="muted small">Revisando…</p></div><div class="rv-f"><label class="small"><input type="checkbox" id="rvLive" ${S.prefs.rvLive!==false?'checked':''}> Revisar enquanto escrevo</label><button class="btn sm" id="rvAgain">↻ Revisar de novo</button></div></aside>`);
 $('#rvLive').onchange=e=>{S.prefs.rvLive=e.target.checked;savePrefs()};$('#rvAgain').onclick=()=>rvRun();rvRun()};
function rvDraw(){const box=$('#rvList'),ch=$('#rvChips');if(!box)return;const L=RV_LANGS.find(x=>x.k===RV.lang);
 const cnt={};RV.issues.forEach(x=>cnt[x.cat]=(cnt[x.cat]||0)+1);
 ch.innerHTML=Object.entries(RV_CATS).map(([k,[l,c]])=>`<button class="chip ${RV.cats[k]?'on':''}" data-rvc="${k}"><i class="rv-dot" style="background:${c}"></i>${l} <span style="opacity:.7">${cnt[k]||0}</span></button>`).join('');
 $$('[data-rvc]',ch).forEach(b=>b.onclick=()=>{RV.cats[b.dataset.rvc]=!RV.cats[b.dataset.rvc];rvPaint();rvDraw()});
 const shown=RV.issues.filter(x=>RV.cats[x.cat]);const txt=RV.col?RV.col.text:'';
 const top=!RV.dict?`<div class="rv-note">📚 ${L?`O dicionário de ${L.n} ainda não foi baixado neste aparelho.`:'Nenhum dicionário escolhido.'} Sem ele, a revisão olha só gramática, diálogos e estilo. <a href="#" data-act="rvDicts">Baixar dicionário</a></div>`:'';
 box.innerHTML=top+(shown.length?shown.slice(0,150).map((x,i)=>{const a=Math.max(0,x.s-28),pre=txt.slice(a,x.s).replace(/\n/g,' '),mid=txt.slice(x.s,x.e),pos=txt.slice(x.e,x.e+28).replace(/\n/g,' ');const idx=RV.issues.indexOf(x);
  return `<div class="rv-i" data-rvi="${idx}"><div class="rv-m"><i class="rv-dot" style="background:${RV_CATS[x.cat][1]}"></i><b>${esc(x.msg)}</b></div><div class="rv-x">${a>0?'…':''}${esc(pre)}<mark>${esc(mid)}</mark>${esc(pos)}…</div>${x.why?`<div class="small muted">${esc(x.why)}</div>`:''}
   <div class="rv-a"><span class="rv-sug" data-sg="${idx}">${(x.sug||[]).map(s=>`<button class="btn sm primary" data-fix="${idx}" data-v="${esc(s)}">${s.trim()?esc(s):'(apagar)'}</button>`).join('')}${x.cat==='sp'&&!x.sug?'<span class="small muted">buscando sugestões…</span>':''}</span>
   ${x.cat==='sp'?`<button class="btn sm" data-add="${idx}">📖 Adicionar ao dicionário</button>`:''}<button class="btn sm ghost" data-ign="${idx}">Ignorar</button>${x.cat!=='sp'?`<button class="btn sm ghost" data-ignr="${idx}" title="Não mostrar mais este tipo de aviso neste projeto">Desligar regra</button>`:''}</div></div>`}).join('')+(shown.length>150?`<p class="small muted">Mostrando 150 de ${shown.length}.</p>`:'')
  :`<div class="empty" style="padding:24px 8px"><div class="big">Tudo certo ✨</div><p class="small">Nada para revisar ${Object.values(RV.cats).some(v=>!v)?'nos tipos selecionados':'neste capítulo'}.</p></div>`);
 $$('[data-rvi]',box).forEach(el=>el.onclick=e=>{if(e.target.closest('button,a'))return;const x=RV.issues[+el.dataset.rvi];const r=x&&rvRange(RV.col,x.s,x.e);if(!r)return;const s=getSelection();s.removeAllRanges();s.addRange(r);const b=r.getBoundingClientRect(),sc=$('#scroller');if(sc&&b)sc.scrollBy({top:b.top-sc.getBoundingClientRect().top-140,behavior:'smooth'})});
 $$('[data-fix]',box).forEach(b=>b.onclick=()=>rvFix(+b.dataset.fix,b.dataset.v));
 $$('[data-add]',box).forEach(b=>b.onclick=()=>{const x=RV.issues[+b.dataset.add];dictEditDlg(null,{w:x.word}).then(d=>{if(d){toast('“'+d.w+'” entrou no dicionário.');rvRun()}})});
 $$('[data-ign]',box).forEach(b=>b.onclick=()=>{const x=RV.issues[+b.dataset.ign],p=P();p.rvIgnore=p.rvIgnore||{};if(x.cat==='sp'){p.rvIgnore.words=[...new Set([...(p.rvIgnore.words||[]),x.word])]}else{p.rvIgnore.keys=[...new Set([...(p.rvIgnore.keys||[]),x.rule+':'+txt.slice(x.s,x.e).toLowerCase()])]}saveProject();rvRun()});
 $$('[data-ignr]',box).forEach(b=>b.onclick=()=>{const x=RV.issues[+b.dataset.ignr],p=P();p.rvIgnore=p.rvIgnore||{};p.rvIgnore.rules=[...new Set([...(p.rvIgnore.rules||[]),x.rule])];saveProject();toast('Regra desligada neste projeto. Para religar: Revisar → Revisão do capítulo → ⚙.');rvRun()});
 // sugestões de ortografia sob demanda
 shown.slice(0,60).forEach(x=>{if(x.cat!=='sp'||x.sug)return;rvCall({t:'suggest',lang:RV.lang,word:x.word}).then(r=>{x.sug=r.list||[];const el=$(`[data-sg="${RV.issues.indexOf(x)}"]`);if(el)el.innerHTML=x.sug.length?x.sug.map(s=>`<button class="btn sm primary" data-fix="${RV.issues.indexOf(x)}" data-v="${esc(s)}">${esc(s)}</button>`).join(''):'<span class="small muted">sem sugestões</span>';$$('[data-fix]',el).forEach(b=>b.onclick=()=>rvFix(+b.dataset.fix,b.dataset.v))}).catch(()=>{})})}
function rvFix(i,val){const x=RV.issues[i];if(!x||!RV.col)return;const r=rvRange(RV.col,x.s,x.e);if(!r)return;const page=$('#page');if(!page||page.contentEditable!=='true'){toast('Este capítulo está só para leitura.');return}
 const s=getSelection();s.removeAllRanges();s.addRange(r);page.focus();
 // mantém o resto do trecho quando a sugestão cobre só parte (ex.: espaço)
 document.execCommand('insertText',false,val);try{markDirty()}catch{}setTimeout(rvRun,60)}
/* revisa sozinho enquanto escreve (painel aberto) */
const rvLiveT=debounce(()=>{if($('#rvPanel')&&S.prefs.rvLive!==false)rvRun()},1600);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='page')rvLiveT()},true);
{const _oc2=openChapter;openChapter=async function(...a){const r=await _oc2.apply(this,a);if($('#rvPanel'))setTimeout(rvRun,200);return r}}
{const _sv4=showView;showView=function(v){if(v!=='write'){const d=$('#rvPanel');if(d)d.remove();rvClear()}return _sv4.apply(this,arguments)}}
{const _h2=ACT.home;ACT.home=function(...a){const d=$('#rvPanel');if(d)d.remove();rvClear();return _h2.apply(this,a)}}
/* religar regras desligadas */
ACT.rvRules=async()=>{const p=P(),off=(p.rvIgnore||{}).rules||[];const name=id=>{const r=RV_RULES.find(x=>x[0]===id);return r?r[3]:({mente:'Advérbios em -mente',longa:'Frases longas',eco:'Ecos (palavras repetidas perto)',mix:'Mistura de estilos de diálogo'})[id]||id};
 await modal({title:'⚙ Regras desligadas',body:off.length?off.map(id=>`<div class="pl-row"><span>${esc(name(id))}</span><span class="sp"></span><button class="btn sm" data-on="${esc(id)}">Religar</button></div>`).join('')+`<p class="small muted" style="margin-top:10px">Palavras ignoradas: ${((p.rvIgnore||{}).words||[]).length} · <a href="#" id="rvClrW">limpar</a></p>`:'<p class="muted">Nenhuma regra desligada.</p>',
  onMount:ov=>{$$('[data-on]',ov).forEach(b=>b.onclick=()=>{p.rvIgnore.rules=(p.rvIgnore.rules||[]).filter(x=>x!==b.dataset.on);saveProject();b.closest('.pl-row').remove();rvRun()});const c=$('#rvClrW',ov);if(c)c.onclick=e=>{e.preventDefault();p.rvIgnore.words=[];p.rvIgnore.keys=[];saveProject();toast('Lista de ignoradas limpa.');rvRun()}},actions:[{label:'Fechar',cls:'primary'}]})};
{const _rd2=rvDraw;rvDraw=function(){_rd2.apply(this,arguments);const h=$('#rvPanel .rv-h');if(h&&!h.querySelector('[data-act=rvRules]'))h.querySelector('[data-act=rvDicts]').insertAdjacentHTML('beforebegin','<button class="btn sm ghost" data-act="rvRules" title="Regras desligadas">⚙</button>')}}

/* menus e busca */
{const _rv2=TBM.rev;TBM.rev=()=>{const b=_rv2();return [{i:'✍️',t:'Revisão do capítulo',d:'Ortografia, gramática, diálogos e estilo',run:()=>ACT.rvOpen()},{i:'📚',t:'Dicionários do corretor',d:'Baixar português, inglês, espanhol',run:()=>ACT.rvDicts()},'-',...b]}}
{const _cl3=cmdList;cmdList=function(){const L=_cl3.apply(this,arguments);if(ikCtx()!=='project')return L;
 L.push({g:'Escrever',t:'Revisão do capítulo',d:'Ortografia, gramática, diálogos e estilo para livros',run:()=>ACT.rvOpen(),i:'✍️',w:'Barra › Revisar',k:'corretor gramatica ortografia revisar erros'},
  {g:'Escrever',t:'Dicionários do corretor',d:'Baixar dicionários de português, inglês e espanhol',run:()=>ACT.rvDicts(),i:'📚',w:'Barra › Revisar',k:'corretor baixar idioma'});return L}}
