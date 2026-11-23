/* ============ v40: sem internet ============
   - O app abre sem internet (service worker + Firebase lendo do cache do aparelho, ver fb/src/shim.js).
   - Livro: o texto escrito sem internet NÃO vai direto para o capítulo na nuvem. Fica guardado neste aparelho
     (localStorage "ink.offj.<uid>") e, quando a internet volta, vira um rascunho "Capítulo (offline 23/11 07:10)".
     Capítulos criados sem internet vão inteiros para Rascunhos. No rascunho, uma faixa oferece
     "Substituir o capítulo original por este texto".
   - Mesa de RPG: as mudanças ficam na fila do Firestore e são enviadas sozinhas quando a internet volta;
     o app avisa "Enviando…" e "Mesa sincronizada".
   - Com internet, os capítulos do projeto aberto são lidos 1× por dia para ficarem disponíveis sem internet. */
const OFF=()=>navigator.onLine===false;
const offCloud=()=>!!(S.privCloud||(typeof colOn==='function'&&colOn()));
const offKey=()=>'ink.offj.'+(S.uid||'anon');
const offJ={load(){try{const j=JSON.parse(localStorage.getItem(offKey())||'null');return j&&j.e?j:{e:{},news:[]}}catch{return {e:{},news:[]}}},
 save(j){try{localStorage.setItem(offKey(),JSON.stringify(j));return true}catch(e){console.warn('[offline] sem espaço',e);return false}},
 put(key,val){const j=this.load(),o=j.e[key]||{t0:Date.now()};Object.assign(o,{val:clone(val),pid:val.pid,t:Date.now()});j.e[key]=o;return this.save(j)},
 get(key){return this.load().e[key]||null},
 markNew(pid,id){const j=this.load();if(!j.news.some(n=>n.id===id))j.news.push({pid,id,t:Date.now()});this.save(j)},
 count(){const j=this.load();return Object.keys(j.e).length+j.news.filter(n=>!j.e['c_'+n.id]).length},
 clear(){try{localStorage.removeItem(offKey())}catch{}}};
/* gravação e leitura dos capítulos: sem internet, vão para o diário deste aparelho */
const _offGet=Store.get.bind(Store),_offPut=Store.put.bind(Store);
Store.put=async function(key,val){if(OFF()&&offCloud()&&/^c_/.test(key)&&val&&offJ.put(key,val)){offUi();return}return _offPut(key,val)};
Store.get=async function(key){if(/^c_/.test(key)){const j=offJ.get(key);if(j&&j.val)return clone(j.val)}const r=await _offGet(key);
 if(!r&&OFF()&&/^c_/.test(key)){const m=P()&&(P().chapters||[]).find(c=>'c_'+c.id===key);if(m&&m.words>0&&!S.offWarned){S.offWarned=1;toast('Este capítulo não foi aberto neste aparelho com internet, então o texto dele não está disponível offline. O que você escrever aqui vai para Rascunhos.','err')}}return r};
{const _ca=ACT.chAdd;ACT.chAdd=async function(...a){const p=P(),before=new Set((p&&p.chapters||[]).map(c=>c.id));const r=await _ca.apply(this,a);
 if(OFF()&&offCloud()&&p)(p.chapters||[]).filter(c=>!before.has(c.id)).forEach(c=>offJ.markNew(p.id,c.id));offUi();return r}}
/* mesa: anota que houve mudança sem internet (o Firestore guarda e envia sozinho) */
{const _sw=sharedWrite;sharedWrite=function(...a){if(OFF())S.offGame=true;return _sw.apply(this,a)}}
/* aviso visual */
{const _st=setStatus;setStatus=function(s){_st.apply(this,arguments);const el=$('#status');if(!el)return;if(OFF()&&S.backend==='cloud'){el.classList.add('off');el.classList.remove('err');el.innerHTML='<span class="d"></span>Sem internet · salvo no aparelho'}else el.classList.remove('off')}}
function offUi(){document.body.classList.toggle('is-offline',OFF());let b=$('#offBanner');const n=offJ.count();
 if(OFF()&&S.backend==='cloud'){if(!b){document.body.insertAdjacentHTML('beforeend','<div id="offBanner" class="off-banner" role="status"></div>');b=$('#offBanner')}
  b.innerHTML=`📴 <b>Sem internet</b> — pode continuar. ${n?`${n} capítulo(s) guardado(s) neste aparelho; vão para <b>Rascunhos</b> quando a internet voltar.`:'O que você escrever fica neste aparelho e vai para <b>Rascunhos</b> quando a internet voltar.'}${T&&T.gid?' Mudanças na mesa são enviadas sozinhas.':''}<button class="ob-x" title="Esconder">✕</button>`;b.querySelector('.ob-x').onclick=()=>b.classList.add('min')}
 else if(b)b.remove();try{setStatus('ok')}catch{}}
addEventListener('offline',()=>{offUi();toast('📴 Sem internet. Pode continuar trabalhando — tudo fica guardado neste aparelho.')});
addEventListener('online',()=>{offUi();setTimeout(offSync,1200)});
/* quando a internet volta: capítulos → Rascunhos; mesa → aguarda o envio */
function offOutlineRemove(p,id){p.outline=(p.outline||[]).filter(n=>!(n.t==='c'&&n.id===id));(p.outline||[]).forEach(n=>{if(n.t==='f')n.items=(n.items||[]).filter(x=>x!==id)})}
const offWhen=t=>{const d=new Date(t);return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};
async function offSync(){if(S.offSyncing||OFF()||!S.uid)return;
 if(S.offGame&&window.INK&&INK.synced){S.offGame=false;toast('🔄 Internet de volta — enviando as mudanças da mesa…');INK.synced().then(ok=>toast(ok?'✓ Mesa sincronizada: as mudanças feitas sem internet foram enviadas.':'Algumas mudanças da mesa ainda não foram enviadas. Elas seguem na fila.',ok?'':'err'))}
 const J=offJ.load();if(!Object.keys(J.e).length&&!J.news.length)return;S.offSyncing=true;
 try{try{await flushChapter()}catch{}const J2=offJ.load(),groups={};
  for(const k in J2.e){const e=J2.e[k];(groups[e.pid]=groups[e.pid]||[]).push([k.slice(2),e])}
  J2.news.forEach(n=>{if(!J2.e['c_'+n.id])(groups[n.pid]=groups[n.pid]||[]).push([n.id,{pid:n.pid,t:n.t,val:null}])});
  const moved=[];let nNew=0,nCopy=0;
  for(const pid in groups){const open=S.P&&S.P.id===pid;let p=open?S.P:await _offGet('p_'+pid).catch(()=>null);if(!p)continue;p.drafts=Array.isArray(p.drafts)?p.drafts:[];p.chapters=p.chapters||[];
   for(const [cid,e] of groups[pid]){const meta=p.chapters.find(c=>c.id===cid),isNew=J2.news.some(n=>n.id===cid);
    if(isNew){if(e.val)await _offPut('c_'+cid,e.val);if(meta){if(!p.drafts.includes(cid)){if(open)detach(cid);else offOutlineRemove(p,cid);p.drafts.push(cid)}meta.off={t:e.t||Date.now()}}nNew++;moved.push({cid,title:meta?meta.title:'Rascunho',pid})}
    else if(e.val){const nid=uid(),title=`${meta?meta.title:'Capítulo'} (offline ${offWhen(e.t||Date.now())})`;await _offPut('c_'+nid,{...e.val,id:nid,pid,updatedAt:Date.now()});
     p.chapters.push({id:nid,title,status:'rascunho',words:countWords(modText(e.val.html||'')),off:{from:cid,t:e.t||Date.now()}});p.drafts.push(nid);nCopy++;moved.push({cid:nid,title,from:cid,pid});if(open)delete S.cache[cid]}}
   if(open)saveProject();else{p.updatedAt=Date.now();await _offPut('p_'+pid,p);const i=S.projects.findIndex(x=>x.id===pid);if(i>=0)S.projects[i]=clone(p)}}
  offJ.clear();
  if(S.P&&$('#page')){const cur=moved.find(m=>m.from===S.cid&&m.pid===S.P.id);if(cur){S.chDirty=false;await openChapter(cur.cid,true)}else{try{renderChList()}catch{}}}
  else if(!S.P)try{renderHome()}catch{}
  offUi();if(moved.length)offDone(moved,nNew,nCopy)}
 catch(e){console.warn('[offline] sincronizar',e);toast('Não consegui mandar o que foi feito sem internet para Rascunhos. Vou tentar de novo.','err');setTimeout(()=>{S.offSyncing=false;offSync()},20000)}
 finally{S.offSyncing=false}}
function offDone(moved,nNew,nCopy){$('#offDone')&&$('#offDone').remove();const first=moved[0];
 document.body.insertAdjacentHTML('beforeend',`<div class="mod-toast off-done" id="offDone" role="status"><button class="mt-go"><b>📝 Internet de volta</b> — ${moved.length===1?`“${esc(first.title)}” foi para Rascunhos`:`${moved.length} capítulos foram para Rascunhos`}.<small>${nCopy?'O capítulo original não foi mexido. Abra o rascunho para comparar e substituir, se quiser.':'Capítulos criados sem internet estão em Rascunhos.'} · toque para abrir</small></button><button class="mt-x" title="Fechar">✕</button></div>`);
 const t=$('#offDone');t.querySelector('.mt-x').onclick=()=>t.remove();t.querySelector('.mt-go').onclick=async()=>{t.remove();if(!S.P||S.P.id!==first.pid){await openProject(first.pid)}if(S.view!=='write')await showView('write');await openChapter(first.cid)};setTimeout(()=>{if(t.isConnected)t.remove()},20000)}
/* faixa no rascunho escrito sem internet */
function offBar(){$('#offBar')&&$('#offBar').remove();const p=P(),m=p&&S.cid&&(p.chapters||[]).find(c=>c.id===S.cid);if(!m||!m.off)return;const k=$('#kicker');if(!k)return;
 const orig=m.off.from&&p.chapters.find(c=>c.id===m.off.from);
 k.insertAdjacentHTML('beforebegin',`<div class="off-bar" id="offBar">📴 <span>${orig?`Escrito sem internet a partir de <b>“${esc(orig.title)}”</b> em ${offWhen(m.off.t)}.`:`Criado sem internet em ${offWhen(m.off.t)}.`}</span>${orig?`<button class="btn sm primary" id="offRep">Substituir o capítulo original por este texto</button><button class="btn sm" id="offOrig">Abrir original</button>`:''}<button class="btn sm ghost" id="offKeep" title="Esconder este aviso">Manter como rascunho</button></div>`);
 const keep=$('#offKeep');if(keep)keep.onclick=()=>{delete m.off;saveProject();offBar()};
 const oo=$('#offOrig');if(oo)oo.onclick=()=>openChapter(orig.id);
 const rp=$('#offRep');if(rp)rp.onclick=async()=>{if(!await confirmDlg(`Trocar o texto de “${orig.title}” pelo texto escrito sem internet? O rascunho some depois.`,'Substituir'))return;
  await flushChapter();const d=await getChapter(S.cid),draftId=S.cid;S.cache[orig.id]={html:d.html,notes:d.notes};queueWrite('c_'+orig.id,{kind:'chapter',pid:p.id,id:orig.id,html:d.html,notes:d.notes,updatedAt:Date.now()});
  orig.words=m.words;detach(draftId);p.chapters=p.chapters.filter(c=>c.id!==draftId);delete S.cache[draftId];queueWrite('c_'+draftId,null);saveProject();S.chDirty=false;await openChapter(orig.id,true);toast('Capítulo atualizado com o texto escrito sem internet.')}}
{const _uk=updateKicker;updateKicker=function(...a){const r=_uk.apply(this,a);try{offBar()}catch(e){console.warn(e)}return r}}
/* deixa os capítulos do projeto aberto disponíveis sem internet (1× por dia, só projetos da conta) */
{const _op=openProject;openProject=async function(...a){const r=await _op.apply(this,a);try{offUi();offPrefetch()}catch{}return r}}
async function offPrefetch(){const p=P();if(!p||OFF()||!S.privCloud||(typeof colOn==='function'&&colOn()&&typeof colPidOf==='function'&&colPidOf('p_'+p.id,p)))return;
 const k='ink.offPre.'+p.id,today=new Date().toISOString().slice(0,10);try{if(localStorage.getItem(k)===today)return}catch{}
 setTimeout(async()=>{const ids=(p.chapters||[]).map(c=>c.id).filter(id=>!S.cache[id]).slice(0,80);for(const id of ids){if(OFF()||!S.P||S.P.id!==p.id)return;try{await _offGet('c_'+id)}catch{}await sleep(150)}try{localStorage.setItem(k,today)}catch{}},4000)}
/* ao abrir o app com internet e algo pendente deste aparelho */
{const _rh=renderHome;let once=false;renderHome=function(...a){const r=_rh.apply(this,a);try{offUi();if(!once&&!OFF()&&offJ.count()){once=true;setTimeout(offSync,1500)}}catch{}return r}}
/* "Últimas modificações" não registra o texto offline no capítulo original (ele não foi mexido) */
{const _mr=modRecord;modRecord=function(...a){if(OFF()&&offCloud())return;return _mr.apply(this,a)}}
