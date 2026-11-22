/* ============ v32: relatar problema / sugestão e registro automático de erros (fase de testes) ============
   Tudo vai para a coleção feedback/{id} do Firestore, que só a moderação lê (painel 🛡 Moderação → Relatos).
   Erros automáticos: no máximo 5 por sessão e 15 por dia neste aparelho, sem repetir a mesma mensagem. */
const APP_V='v39';
const FB_LOG=[];   // últimas mensagens de aviso/erro, anexadas ao relato
{const keep=(lv,a)=>{try{FB_LOG.push(new Date().toTimeString().slice(0,8)+' '+lv+' '+a.map(x=>x instanceof Error?(x.message||String(x)):typeof x==='object'?JSON.stringify(x):String(x)).join(' ').slice(0,300));if(FB_LOG.length>25)FB_LOG.shift()}catch{}};
 const w=console.warn.bind(console),e=console.error.bind(console);console.warn=(...a)=>{keep('aviso',a);w(...a)};console.error=(...a)=>{keep('erro',a);e(...a)}}
const fbCan=()=>!!(S.db&&window.INK&&INK.user&&S.backend==='cloud');
function fbCtx(){let where='Estante';try{if(T.gid&&$('.tbl'))where='Mesa: '+(T.view==='play'?'sessão':T.mode==='master'?'mestre · '+(T.mtab||''):'jogador · '+(T.tab||''));else if(S.P)where=(S.P.type==='rpg'?'Campanha':'Livro')+' · '+(S.view||'')}catch{}
 const st=window.matchMedia&&matchMedia('(display-mode: standalone)').matches;
 return{v:APP_V,where,ua:navigator.userAgent.slice(0,220),scr:innerWidth+'×'+innerHeight+' @'+(window.devicePixelRatio||1),app:st?'instalado':'navegador',claude:typeof IN_CLAUDE==='function'&&IN_CLAUDE(),visitante:typeof VISITOR==='function'&&VISITOR(),lang:navigator.language}}
async function fbSend(d){if(!fbCan())throw new Error('sem conta');const doc={by:S.uid,name:(()=>{try{return myName()}catch{return''}})(),kind:d.kind,text:String(d.text||'').slice(0,3000),ctx:fbCtx(),log:FB_LOG.slice(-15).join('\n').slice(0,4000),err:d.err||null,img:d.img||null,t:Date.now(),status:'open'};
 await S.db.collection('feedback').doc().set(doc)}

/* ---------- relato manual ---------- */
ACT.feedback=async(o={})=>{if(!fbCan()){toast(IN_CLAUDE&&IN_CLAUDE()?'Os relatos funcionam no site do Inkmind (r4z1e.github.io/InkMind).':'Entre (pode ser como visitante) para enviar um relato.');return}
 let kind=o.kind||'bug',img=null;
 const v=await modal({title:'🐞 Relatar problema ou sugestão',body:`<div class="seg" id="fbK" style="margin-bottom:10px"><button data-k="bug" class="${kind==='bug'?'on':''}">🐞 Problema</button><button data-k="idea" class="${kind==='idea'?'on':''}">💡 Sugestão</button></div>
  <label class="f" id="fbL">${kind==='idea'?'Qual é a sua ideia?':'O que aconteceu? O que você estava tentando fazer?'}</label><textarea id="fbT" rows="5" maxlength="3000" placeholder="${kind==='idea'?'Ex.: seria ótimo poder…':'Ex.: cliquei em Rolar e o dado não apareceu para os outros jogadores.'}">${esc(o.text||'')}</textarea>
  <div class="row" style="gap:8px;margin-top:8px;align-items:center"><button class="btn sm" id="fbImg">📷 Anexar print da tela</button><span class="small muted" id="fbImgN"></span></div>
  <p class="small muted" style="margin:10px 0 0">Junto vão: a tela em que você está, o aparelho, o tamanho da tela e a versão do app (${APP_V}). Nada do texto dos seus livros é enviado.</p>`,
  onMount:ov=>{$$('#fbK button',ov).forEach(b=>b.onclick=()=>{kind=b.dataset.k;$$('#fbK button',ov).forEach(x=>x.classList.toggle('on',x===b));$('#fbL',ov).textContent=kind==='idea'?'Qual é a sua ideia?':'O que aconteceu? O que você estava tentando fazer?'});
   $('#fbImg',ov).onclick=async()=>{const [f]=await pickFile('image/*');if(!f)return;$('#fbImgN',ov).textContent='Enviando imagem…';try{const up=await S.assets.upload(f,{type:f.type});img='/_blob/'+up.id;$('#fbImgN',ov).textContent='✓ '+f.name}catch(e){console.warn(e);$('#fbImgN',ov).textContent='Não consegui anexar (a imagem é opcional).'}};
   setTimeout(()=>$('#fbT',ov).focus(),50)},
  actions:[{label:'Cancelar'},{label:'Enviar',cls:'primary',onClick:ov=>{const t=$('#fbT',ov).value.trim();if(t.length<4){toast('Conte um pouco do que aconteceu.');return false}return t}}]});
 if(!v)return;try{await fbSend({kind,text:v,img,err:o.err||null});toast('Obrigado! Seu relato chegou. 🙌')}catch(e){console.warn(e);toast('Não consegui enviar agora. Tente de novo em instantes.','err')}};

/* ---------- erros automáticos ---------- */
const FB_ERR={sent:new Set(),n:0,last:null};
const fbNoise=m=>!m||/ResizeObserver loop|Script error\.?$|Non-Error promise rejection|NetworkError|Failed to fetch|Load failed|The operation was aborted|AbortError|chrome-extension|moz-extension|safari-extension|play\(\) request was interrupted|NotAllowedError|QuotaExceeded/i.test(m);
function fbDay(){const k='ink-err-'+new Date().toISOString().slice(0,10);let n=0;try{n=+localStorage.getItem(k)||0;localStorage.setItem(k,n+1)}catch{}return n}
function fbAuto(msg,stack,src){msg=String(msg||'').slice(0,400);if(fbNoise(msg)||(src&&/extension:\/\//.test(src)))return;const key=msg.slice(0,120);if(FB_ERR.sent.has(key)||FB_ERR.n>=5)return;FB_ERR.sent.add(key);FB_ERR.n++;
 FB_ERR.last={msg,stack:String(stack||'').slice(0,1500),src:String(src||'').slice(0,200)};fbBanner();
 if(!fbCan()||fbDay()>=15)return;fbSend({kind:'error',text:'(erro automático)',err:FB_ERR.last}).catch(()=>{})}
addEventListener('error',e=>{if(e&&e.message)fbAuto(e.message,e.error&&e.error.stack,e.filename+':'+e.lineno+':'+e.colno)});
addEventListener('unhandledrejection',e=>{const r=e&&e.reason;const m=r&&(r.message||r.code)||String(r||'');if(r&&/permission|unavailable|timeout|deadline|offline|revoked|declined/i.test((r.code||'')+' '+m))return;fbAuto('Promise: '+m,r&&r.stack,'')});
function fbBanner(){if($('#fbBan'))return;document.body.insertAdjacentHTML('beforeend',`<div id="fbBan" class="fb-ban"><span>⚠️ Algo deu errado aqui. O erro foi registrado.</span><button class="btn sm" data-act="fbBanRel">Contar o que houve</button><button class="btn sm ghost" data-act="fbBanX">✕</button></div>`);setTimeout(()=>{const b=$('#fbBan');if(b)b.remove()},15000)}
ACT.fbBanRel=()=>{$('#fbBan')&&$('#fbBan').remove();ACT.feedback({kind:'bug',err:FB_ERR.last})};
ACT.fbBanX=()=>{$('#fbBan')&&$('#fbBan').remove()};

/* ---------- onde aparece ---------- */
{const _ae=acctExtra;acctExtra=function(){const its=_ae.apply(this,arguments);const i=its.findIndex(x=>x&&x.t==='Termos de uso');const it={i:'🐞',t:'Relatar problema ou sugestão',d:'Fale com a equipe do Inkmind',run:()=>ACT.feedback()};if(i>=0)its.splice(i,0,it);else its.push(it);return its}}
{const _cl4=cmdList;cmdList=function(){const L=_cl4.apply(this,arguments);L.push({g:'Ajuda',t:'Relatar problema ou sugestão',d:'Algo deu errado? Tem uma ideia?',run:()=>ACT.feedback(),i:'🐞',w:'Conta',k:'erro bug ajuda suporte ideia sugestao contato'});return L}}
{const _mm2=ACT.moreM;ACT.moreM=async function(...a){const r=_mm2.apply(this,a);setTimeout(()=>{const pop=$('.ik-pop');if(!pop||pop.querySelector('[data-fbm]'))return;const b=document.createElement('button');b.className='ik-it';b.dataset.fbm=1;b.innerHTML='<span class="ic">🐞</span><span class="tx">Relatar problema ou sugestão</span>';b.onclick=()=>{ikClose();ACT.feedback()};pop.appendChild(b)},30);return r}}

/* ---------- painel da moderação ---------- */
let FB_R=[];
{const _mp=ACT.modPanel;ACT.modPanel=async function(...a){try{const s=await S.db.collection('feedback').where('status','==','open').get();FB_R=s.docs.map(d=>({id:d.id,...d.data()})).sort((x,y)=>(y.t||0)-(x.t||0))}catch(e){console.warn('relatos',e);FB_R=[]}return _mp.apply(this,a)}}
{const _dm2=drawMod;drawMod=function(){_dm2.apply(this,arguments);const box=$('#modBox');if(!box||box.querySelector('.fb-sec'))return;
 const kinds={bug:['🐞','Problema'],idea:['💡','Sugestão'],error:['⚠️','Erro automático']};const cnt=k=>FB_R.filter(x=>x.kind===k).length;
 const html=`<div class="fb-sec"><h4 class="pl-h">Relatos dos testadores ${FB_R.length?`<span class="ik-badge">${FB_R.length}</span>`:''}</h4><p class="small muted" style="margin:0 0 8px">${cnt('bug')} problema(s) · ${cnt('idea')} sugestão(ões) · ${cnt('error')} erro(s) automático(s)</p>
  ${FB_R.length?FB_R.slice(0,60).map((r,i)=>{const k=kinds[r.kind]||['•',r.kind];const c=r.ctx||{};return `<details class="fb-r"><summary><b>${k[0]} ${esc(k[1])}</b> · ${esc(r.name||'—')} · <small class="muted">${new Date(r.t||0).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</small><div class="small">${esc(r.kind==='error'?(r.err&&r.err.msg)||'':r.text).slice(0,140)}</div></summary>
   ${r.kind!=='error'?`<p style="white-space:pre-wrap;margin:6px 0">${esc(r.text)}</p>`:''}${r.img?`<a href="${esc(r.img)}" target="_blank" rel="noopener"><img src="${esc(r.img)}" class="fb-img" alt="print"></a>`:''}
   <div class="small muted">📍 ${esc(c.where||'')} · ${esc(c.app||'')} · ${esc(c.scr||'')} · ${esc(c.v||'')}${c.visitante?' · visitante':''}</div><div class="small muted">${esc(c.ua||'')}</div>
   ${r.err?`<pre class="fb-pre">${esc(r.err.msg||'')}\n${esc(r.err.src||'')}\n${esc(r.err.stack||'')}</pre>`:''}${r.log?`<details><summary class="small muted">Registro do app</summary><pre class="fb-pre">${esc(r.log)}</pre></details>`:''}
   <div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" data-fbok="${i}">✓ Resolvido</button><button class="btn sm ghost" data-fbdel="${i}">Apagar</button></div></details>`}).join(''):'<p class="muted small">Nenhum relato aberto.</p>'}</div>`;
 const use=box.querySelector('.use-box');if(use)use.insertAdjacentHTML('afterend',html);else box.insertAdjacentHTML('afterbegin',html);
 $$('[data-fbok]',box).forEach(b=>b.onclick=async()=>{const r=FB_R[+b.dataset.fbok];try{await S.db.doc('feedback/'+r.id).update({status:'done'});FB_R=FB_R.filter(x=>x!==r);box.querySelector('.fb-sec').remove();drawMod()}catch{toast('Sem permissão.','err')}});
 $$('[data-fbdel]',box).forEach(b=>b.onclick=async()=>{const r=FB_R[+b.dataset.fbdel];try{await S.db.doc('feedback/'+r.id).delete();FB_R=FB_R.filter(x=>x!==r);box.querySelector('.fb-sec').remove();drawMod()}catch{toast('Sem permissão.','err')}})}}
