/* ============ v27: coautoria e leitores beta · levar projetos do Claude para o site ============ */
const COL_ROLES=['owner','edit','beta'];
const IN_CLAUDE=()=>!!window.claude&&!window.INK;
const COL_TTL=150000;   // trava do capítulo vale 2,5 min e é renovada a cada 60 s
const ROLE_LABEL={owner:'Dono',edit:'Coautor',beta:'Leitor beta'};
S.colP={};S.colK={};S.colBase={};
const colOn=()=>FBM()&&!VISITOR()&&!!S.db;
const colPath=(pid,key)=>'collab/'+pid+'/k/'+key;
const colRoleOf=pid=>{const c=S.colP[pid];return c?((c.members||{})[S.uid]||null):null};
const colRole=()=>S.P?colRoleOf(S.P.id):null;
const colCanEdit=()=>{const r=colRole();return r==='owner'||r==='edit'};
const rcode=n=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';const a=new Uint32Array(n);crypto.getRandomValues(a);for(const x of a)s+=A[x%A.length];return s};
function colPidOf(key,val){
 if(S.colK[key])return S.colK[key];
 let m=/^p_(.+)$/.exec(key);if(m)return S.colP[m[1]]?m[1]:null;
 if(val&&val.pid&&S.colP[val.pid])return val.pid;
 m=/^(?:c|v|cm)_(.+)$/.exec(key);if(!m)return null;const id=m[1];
 if(S.P&&S.colP[S.P.id]&&(S.P.chapters||[]).some(c=>c.id===id))return S.P.id;
 const p=(S.projects||[]).find(x=>S.colP[x.id]&&(x.chapters||[]).some(c=>c.id===id));return p?p.id:null}

/* fusão em 3 vias do projeto (base = última versão conhecida da nuvem) */
function colMergeArr(b,l,r,prefR){b=b||[];l=l||[];r=r||[];const bI=new Set(b.map(x=>x&&x.id)),lI=new Set(l.map(x=>x&&x.id)),rM=new Map(r.map(x=>[x&&x.id,x]));const out=[];
 for(const x of l){if(!x)continue;const id=x.id;if(bI.has(id)&&!rM.has(id))continue;out.push(rM.has(id)&&prefR&&prefR(id)?rM.get(id):x)}
 for(const x of r){if(!x||lI.has(x.id)||bI.has(x.id))continue;out.push(x)}return out}
function colMerge3(base,local,remote){if(!remote)return local;if(!local)return remote;base=base||{};
 const lockedByOther=id=>{const c=S.colP[local.id],l=c&&(c.locks||{})[id];return !!(l&&l.uid!==S.uid&&Date.now()-l.t<COL_TTL)};
 const out={...remote,...local};
 out.chapters=colMergeArr(base.chapters,local.chapters,remote.chapters,lockedByOther);
 ['codex','gallery'].forEach(k=>{if(remote[k]||local[k])out[k]=colMergeArr(base[k],local[k],remote[k])});
 delete out.col;try{ensureOutline(out)}catch{}return out}

/* armazenamento: chaves de projetos compartilhados vão para collab/{pid}/k */
{const _get=Store.get.bind(Store),_put=Store.put.bind(Store),_list=Store.list.bind(Store);
 Store.get=async function(key){const pid=colOn()&&colPidOf(key);if(!pid)return _get(key);S.colK[key]=pid;
  const s=await withTimeout(S.db.doc(colPath(pid,key)).get(),15000);return s.exists?clone(s.data()):null};
 Store.put=async function(key,val){const pid=colOn()&&colPidOf(key,val);if(!pid)return _put(key,val);S.colK[key]=pid;
  const r=colRoleOf(pid);if(r!=='owner'&&r!=='edit')return;   // leitor beta: não grava
  const ref=S.db.doc(colPath(pid,key));if(val===null)return ref.delete();
  let v=clone(val);delete v.col;
  if(key==='p_'+pid){let remote=null;try{const s=await ref.get();remote=s.exists?s.data():null}catch{}
   v=colMerge3(S.colBase[pid],v,remote);S.colBase[pid]=clone(v);
   if(S.P&&S.P.id===pid)colAdopt(v)}
  return ref.set(v)};
 Store.list=async function(){const own=await _list();if(!colOn())return own;let col=[];
  try{const s=await withTimeout(S.db.collection('collab').where('members.'+S.uid,'in',COL_ROLES).get(),15000);
   for(const d of s.docs){const c=d.data();S.colP[d.id]=c;try{const ps=await S.db.doc(colPath(d.id,'p_'+d.id)).get();if(ps.exists){const p=clone(ps.data());S.colBase[d.id]=clone(p);p.col={role:c.members[S.uid],owner:c.owner,ownerName:c.ownerName};col.push(p)}}catch(e){console.warn('projeto compartilhado',e)}}}
  catch(e){console.warn('compartilhados',e)}
  const ids=new Set(col.map(p=>p.id));return [...own.filter(p=>!ids.has(p.id)),...col]}}

/* aplica no projeto aberto o que veio da nuvem */
function colAdopt(merged){if(!S.P||S.P.id!==merged.id)return;const before=JSON.stringify([S.P.chapters,S.P.outline,S.P.title]);
 ['chapters','outline','drafts','codex','gallery','title'].forEach(k=>{if(k in merged)S.P[k]=clone(merged[k])});try{ensureOutline(S.P)}catch{}
 if(before!==JSON.stringify([S.P.chapters,S.P.outline,S.P.title])){try{renderChList()}catch{}const t=$('#ptitle');if(t&&document.activeElement!==t)t.value=S.P.title}}

/* ---------- entrar / sair de um projeto compartilhado ---------- */
function colExit(){const c=S.col;if(!c)return;S.col=null;clearInterval(c.hb);(c.unsub||[]).forEach(u=>{try{u()}catch{}});if(c.chUnsub)try{c.chUnsub()}catch{}
 if(c.held&&S.colP[c.pid]){S.db.doc('collab/'+c.pid).update({locks:{[c.held]:DELV()}}).catch(()=>{})}
 $('#colFab')&&$('#colFab').remove();$('#colDrawer')&&$('#colDrawer').remove()}
function colEnter(pid){colExit();if(!S.colP[pid]||!colOn())return;const c=S.col={pid,unsub:[],held:null,notes:[]};
 c.unsub.push(S.db.doc('collab/'+pid).onSnapshot(s=>{if(!S.col||S.col.pid!==pid)return;if(!s.exists){toast('O dono parou de compartilhar este projeto.');colGone(pid);return}
  const d=s.data();S.colP[pid]=d;if(!(d.members||{})[S.uid]){toast('Você não participa mais deste projeto.');colGone(pid);return}colLockUI()},e=>{console.warn('colab',e);colGone(pid)}));
 c.unsub.push(S.db.doc(colPath(pid,'p_'+pid)).onSnapshot(s=>{if(!S.col||S.col.pid!==pid||!s.exists||!S.P||S.P.id!==pid)return;const remote=clone(s.data());
  if(JSON.stringify(remote)===JSON.stringify(S.colBase[pid]))return;const m=colMerge3(S.colBase[pid],S.P,remote);S.colBase[pid]=remote;colAdopt(m)},e=>console.warn('colab p',e)));
 c.unsub.push(S.db.collection('collab/'+pid+'/notes').onSnapshot(s=>{if(!S.col||S.col.pid!==pid)return;c.notes=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.t||0)-(b.t||0));colFab();colDrawDrawer()},e=>console.warn('notas',e)));
 c.hb=setInterval(()=>{if(S.col&&S.col.held)S.db.doc('collab/'+pid).update({locks:{[S.col.held]:{uid:S.uid,name:myName(),t:Date.now()}}}).catch(()=>{})},60000);
 colFab()}
function colGone(pid){colExit();delete S.colP[pid];S.projects=S.projects.filter(p=>p.id!==pid);if(S.P&&S.P.id===pid){S.P=null;renderHome()}}

/* trava por capítulo: um coautor escreve por vez em cada capítulo; os outros veem ao vivo */
async function colLockChapter(cid){const c=S.col;if(!c||!S.P||S.cid!==cid)return;
 if(c.held&&c.held!==cid){const old=c.held;c.held=null;S.db.doc('collab/'+c.pid).update({locks:{[old]:DELV()}}).catch(()=>{})}
 if(c.chUnsub){try{c.chUnsub()}catch{}c.chUnsub=null}
 const d=S.colP[c.pid],l=(d.locks||{})[cid],other=l&&l.uid!==S.uid&&Date.now()-l.t<COL_TTL;
 if(colCanEdit()&&!other){c.held=cid;c.ro=null;try{await S.db.doc('collab/'+c.pid).update({locks:{[cid]:{uid:S.uid,name:myName(),t:Date.now()}}})}catch(e){console.warn('trava',e)}colLockUI();return}
 c.ro={cid,by:other?l.name:null};colLockUI();
 c.chUnsub=S.db.doc(colPath(c.pid,'c_'+cid)).onSnapshot(s=>{if(!S.col||S.cid!==cid||!S.col.ro)return;const x=s.exists?s.data():{};const page=$('#page');if(page&&page.contentEditable!=='true'){page.innerHTML=x.html||'<p><br></p>';S.cache[cid]={html:x.html||'',notes:x.notes||''};try{updateCounts()}catch{}}},()=>{})}
function colLockUI(){const c=S.col;const page=$('#page');if(!c||!page)return;let bar=$('#colBar');
 const role=colRole();let msg='',cls='';
 if(role==='beta'){msg='📖 Você é <b>leitor beta</b>: lê e deixa comentários em 💬. O texto atualiza sozinho.';cls='cb-beta'}
 else if(c.ro){const d=S.colP[c.pid],l=(d.locks||{})[c.ro.cid],still=l&&l.uid!==S.uid&&Date.now()-l.t<COL_TTL;
  if(!still&&colCanEdit()&&S.cid===c.ro.cid){c.ro=null;page.contentEditable='true';colLockChapter(S.cid);return}
  msg=`✍️ <b>${esc((l&&l.name)||c.ro.by||'Outra pessoa')}</b> está escrevendo neste capítulo agora. Você acompanha ao vivo e pode editar assim que ela terminar.`;cls='cb-busy'}
 else{const d=S.colP[c.pid],others=Object.entries(d.locks||{}).filter(([k,l])=>l.uid!==S.uid&&Date.now()-l.t<COL_TTL).map(([k,l])=>{const ch=S.P.chapters.find(x=>x.id===k);return `${esc(l.name)} (${esc(ch?ch.title:'outro capítulo')})`});
  msg=`👥 Projeto compartilhado${others.length?' · escrevendo agora: '+others.join(', '):''}`;cls='cb-ok'}
 if(role==='beta'||c.ro)page.contentEditable='false';
 if(!bar){page.insertAdjacentHTML('beforebegin','<div id="colBar" class="col-bar"></div>');bar=$('#colBar')}
 bar.className='col-bar '+cls;bar.innerHTML=msg}
{const _oc=openChapter;openChapter=async function(id,initial){if(S.col&&S.col.held!==id)delete S.cache[id];const r=await _oc.apply(this,arguments);if(S.col&&S.cid===id)await colLockChapter(id);return r}}
{const _op=openProject;openProject=async function(id){colExit();const r=await _op.apply(this,arguments);if(S.P&&S.colP[S.P.id]&&colOn()){colEnter(S.P.id);if(S.cid&&$('#page'))colLockChapter(S.cid)}return r}}
{const _rw=RENDER.write;RENDER.write=async function(...a){const r=await _rw.apply(this,a);if(S.col&&S.cid)colLockChapter(S.cid);colFab();return r}}
{const _hm=ACT.home;ACT.home=function(...a){colExit();return _hm.apply(this,a)}}
addEventListener('pagehide',()=>{if(S.col&&S.col.held){try{S.db.doc('collab/'+S.col.pid).update({locks:{[S.col.held]:DELV()}})}catch{}}});

/* ---------- comentários dos leitores ---------- */
function colFab(){if(!S.col||!S.P||!$('#page')){$('#colFab')&&$('#colFab').remove();return}const n=(S.col.notes||[]).filter(x=>x.cid===S.cid&&!x.done).length;let f=$('#colFab');
 if(!f){document.body.insertAdjacentHTML('beforeend','<button id="colFab" class="col-fab" data-act="colNotes" title="Comentários dos leitores e coautores">💬<span></span></button>');f=$('#colFab')}
 f.querySelector('span').textContent=n?String(n):''}
ACT.colNotes=()=>{let d=$('#colDrawer');if(d){d.remove();return}let quote='';try{const s=getSelection();if(s.rangeCount&&$('#page').contains(s.getRangeAt(0).commonAncestorContainer))quote=String(s).trim().slice(0,300)}catch{}
 document.body.insertAdjacentHTML('beforeend',`<aside id="colDrawer" class="col-drawer"><div class="cd-h"><b>💬 Comentários deste capítulo</b><button class="btn sm ghost" data-act="colNotes">✕</button></div><div class="cd-l" id="cdList"></div>
  <form class="cd-f" id="cdForm">${quote?`<blockquote class="cd-q" id="cdQ">“${esc(quote)}”</blockquote>`:'<p class="small muted" style="margin:0 0 6px">Dica: selecione um trecho do texto antes de abrir para citá-lo.</p>'}<textarea id="cdT" rows="3" maxlength="1500" placeholder="O que você achou? Algo confuso, um erro, uma ideia…"></textarea><button class="btn primary sm" type="submit">Enviar comentário</button></form></aside>`);
 $('#cdForm').onsubmit=async e=>{e.preventDefault();const t=$('#cdT').value.trim();if(!t)return;try{await S.db.collection('collab/'+S.col.pid+'/notes').doc().set({by:S.uid,name:myName(),cid:S.cid,quote,text:t,t:Date.now(),done:false});$('#cdT').value='';const q=$('#cdQ');if(q)q.remove();quote=''}catch(err){console.warn(err);toast('Não foi possível enviar agora.','err')}};
 colDrawDrawer()};
function colDrawDrawer(){const box=$('#cdList');if(!box||!S.col)return;const ns=(S.col.notes||[]).filter(x=>x.cid===S.cid),ed=colCanEdit();
 box.innerHTML=ns.length?ns.map(n=>`<div class="cd-n ${n.done?'done':''}"><div class="cd-nh"><b>${esc(n.name||'—')}</b><small class="muted">${new Date(n.t||0).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</small><span class="sp"></span>${ed?`<button class="btn sm ghost" data-cdd="${n.id}" title="${n.done?'Reabrir':'Marcar como resolvido'}">${n.done?'↺':'✓'}</button>`:''}${ed||n.by===S.uid?`<button class="btn sm ghost" data-cdx="${n.id}" title="Apagar">🗑</button>`:''}</div>${n.quote?`<blockquote class="cd-q">“${esc(n.quote)}”</blockquote>`:''}<div class="cd-t">${esc(n.text)}</div></div>`).join(''):'<p class="muted small">Nenhum comentário neste capítulo ainda.</p>';
 $$('[data-cdd]',box).forEach(b=>b.onclick=()=>{const n=ns.find(x=>x.id===b.dataset.cdd);S.db.doc('collab/'+S.col.pid+'/notes/'+n.id).update({done:!n.done}).catch(()=>toast('Sem permissão.','err'))});
 $$('[data-cdx]',box).forEach(b=>b.onclick=()=>S.db.doc('collab/'+S.col.pid+'/notes/'+b.dataset.cdx).delete().catch(()=>toast('Sem permissão.','err')))}
{const _rcl=renderChList;renderChList=function(...a){const r=_rcl.apply(this,a);try{colFab();if($('#colDrawer'))colDrawDrawer();if(S.col&&!$('#colBar')&&$('#page'))colLockUI()}catch{}return r}}

/* ---------- compartilhar ---------- */
const colLink=(code)=>SITE_URL()+'?colab='+code;
ACT.colShare=async()=>{const p=P();if(!p)return;
 if(!colOn()){await modal({title:'👥 Compartilhar',body:`<p style="margin-top:0">${VISITOR()?'Crie uma conta para escrever junto com outras pessoas.':IN_CLAUDE()?'A escrita a várias mãos funciona no site do Inkmind (com conta). Leve seus projetos para lá em Estante → 🚀 Levar para o site.':'Entre na sua conta do Inkmind para compartilhar.'}</p>`,actions:[{label:'OK',cls:'primary'}]});return}
 const c=S.colP[p.id];
 if(!c){const v=await modal({title:'👥 Escrever junto',body:`<p style="margin-top:0">Convide pessoas para <b>${esc(p.title)}</b>:</p><ul style="line-height:1.7;margin-top:0"><li><b>Coautores</b> escrevem e editam com você. Cada capítulo é editado por uma pessoa de cada vez; os outros acompanham ao vivo.</li><li><b>Leitores beta</b> leem e deixam comentários (💬), sem mexer no texto.</li></ul><p class="small muted">O projeto passa a ficar num espaço compartilhado. Você continua sendo o dono e pode remover pessoas a qualquer momento.</p>`,actions:[{label:'Cancelar'},{label:'Compartilhar',cls:'primary',value:'go'}]});
  if(v!=='go')return;const b=busy('Preparando o compartilhamento…');try{await colStart(p,b)}catch(e){console.warn(e);toast('Não foi possível compartilhar agora.','err');b.done();return}b.done()}
 colShareDlg()};
async function colStart(p,b){await flushChapter();try{saveProject.flush()}catch{}await new Promise(r=>setTimeout(r,600));
 const pid=p.id,me=myName(),codes={edit:rcode(8),beta:rcode(8)};
 const keys=['p_'+pid,...p.chapters.flatMap(c=>['c_'+c.id,'v_'+c.id,'cm_'+c.id])];
 const doc={pid,owner:S.uid,ownerName:me,title:p.title,type:p.type,members:{[S.uid]:'owner'},names:{[S.uid]:me},locks:{},codes,banned:{},t:Date.now()};
 await S.db.doc('collab/'+pid).set(doc);S.colP[pid]=doc;
 for(const [role,code] of Object.entries(codes))await S.db.doc('cinv/'+code).set({pid,role,owner:S.uid,title:p.title});
 let i=0;for(const k of keys){b&&b.set(`Copiando ${++i}/${keys.length}…`);let d=null;if(k==='p_'+pid){d=clone(S.P&&S.P.id===pid?S.P:p);delete d.col}else{try{const s=await S.db.doc(S.base+'/'+k).get();d=s.exists?s.data():null}catch{}}
  if(d){await S.db.doc(colPath(pid,k)).set(d);S.colK[k]=pid}}
 S.colBase[pid]=clone(S.P&&S.P.id===pid?S.P:p);delete S.colBase[pid].col;
 for(const k of keys){try{await S.db.doc(S.base+'/'+k).delete()}catch{}}
 const col={role:'owner',owner:S.uid,ownerName:me};if(S.P&&S.P.id===pid)S.P.col=col;const sp=S.projects.find(x=>x.id===pid);if(sp)sp.col=col;
 if(S.P&&S.P.id===pid){colEnter(pid);if(S.cid&&$('#page'))colLockChapter(S.cid)}}
function colShareDlg(){const p=P(),c=S.colP[p.id];if(!c)return;const role=colRoleOf(p.id),own=role==='owner';
 const mem=Object.entries(c.members||{}).sort((a,b)=>COL_ROLES.indexOf(a[1])-COL_ROLES.indexOf(b[1]));
 const linkRow=(r,l,d)=>`<div class="col-link"><div><b>${l}</b><div class="small muted">${d}</div></div><div class="row" style="gap:6px"><input readonly value="${esc(colLink(c.codes[r]))}" onclick="this.select()"><button class="btn sm" data-cpy="${esc(colLink(c.codes[r]))}">Copiar</button></div></div>`;
 modal({title:'👥 Compartilhado: '+esc(p.title),wide:true,body:`${own?linkRow('edit','✍️ Link para coautores','Quem abrir pode escrever e editar')+linkRow('beta','📖 Link para leitores beta','Quem abrir pode ler e comentar'):''}
  <h4 class="pl-h">Pessoas</h4>${mem.map(([u,r])=>`<div class="pl-row"><span>${esc((c.names||{})[u]||'Pessoa')}${u===S.uid?' (você)':''}</span><span class="pill">${ROLE_LABEL[r]||r}</span><span class="sp"></span>${own&&u!==S.uid?`<button class="btn sm ghost" data-crm="${esc(u)}">Remover</button>`:''}</div>`).join('')}
  <p class="small muted" style="margin-top:12px">Precisa de conta no Inkmind para entrar (visitantes não). ${own?'Gerar novos links desativa os antigos.':''}</p>`,
  onMount:ov=>{$$('[data-cpy]',ov).forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.cpy);toast('Link copiado!')}catch{b.previousElementSibling.select();toast('Selecione e copie o link.')}});
   $$('[data-crm]',ov).forEach(b=>b.onclick=async()=>{const u=b.dataset.crm;if(!await confirmDlg('Remover '+esc((c.names||{})[u]||'esta pessoa')+' do projeto?','Remover'))return;try{await S.db.doc('collab/'+p.id).update({members:{[u]:DELV()},names:{[u]:DELV()},banned:{[u]:true}});b.closest('.pl-row').remove();toast('Removido.')}catch(e){toast('Não foi possível remover.','err')}})},
  actions:own?[{label:'Gerar novos links',value:'new'},{label:'Parar de compartilhar',value:'stop'},{label:'Fechar',cls:'primary'}]:[{label:'Sair do projeto',value:'leave'},{label:'Fechar',cls:'primary'}]}).then(async v=>{
  if(v==='new'){const codes={edit:rcode(8),beta:rcode(8)};try{for(const [role,code] of Object.entries(codes))await S.db.doc('cinv/'+code).set({pid:p.id,role,owner:S.uid,title:p.title});for(const code of Object.values(c.codes||{}))await S.db.doc('cinv/'+code).delete().catch(()=>{});await S.db.doc('collab/'+p.id).update({codes,banned:{}});S.colP[p.id]={...S.colP[p.id],codes};toast('Links novos gerados.');colShareDlg()}catch(e){console.warn(e);toast('Não foi possível agora.','err')}}
  if(v==='stop')colStop(p);if(v==='leave')colLeave(p.id)})}
async function colStop(p){if(!await confirmDlg('Parar de compartilhar “'+esc(p.title)+'”? O projeto volta a ser só seu e os coautores e leitores perdem o acesso. Os comentários dos leitores são apagados.','Parar de compartilhar'))return;
 const b=busy('Trazendo o projeto de volta…');const pid=p.id;try{await flushChapter();try{saveProject.flush()}catch{}await new Promise(r=>setTimeout(r,600));
  const c=S.colP[pid];colExit();const ks=await S.db.collection('collab/'+pid+'/k').get();
  for(const d of ks.docs){const v=d.data();if(d.id==='p_'+pid)delete v.col;await S.db.doc(S.base+'/'+d.id).set(v)}
  for(const d of ks.docs)await S.db.doc(colPath(pid,d.id)).delete();
  try{const ns=await S.db.collection('collab/'+pid+'/notes').get();for(const d of ns.docs)await S.db.doc('collab/'+pid+'/notes/'+d.id).delete()}catch{}
  for(const code of Object.values((c&&c.codes)||{}))await S.db.doc('cinv/'+code).delete().catch(()=>{});
  await S.db.doc('collab/'+pid).delete();delete S.colP[pid];Object.keys(S.colK).forEach(k=>{if(S.colK[k]===pid)delete S.colK[k]});
  if(S.P&&S.P.id===pid){delete S.P.col;S.cache={}}const sp=S.projects.find(x=>x.id===pid);if(sp)delete sp.col;toast('O projeto voltou a ser só seu.');if(S.P&&S.P.id===pid)openProject(pid)}
 catch(e){console.warn(e);toast('Não foi possível agora.','err')}finally{b.done()}}
async function colLeave(pid){if(!await confirmDlg('Sair deste projeto? Você perde o acesso até receber um novo convite.','Sair'))return;
 try{colExit();await S.db.doc('collab/'+pid).update({members:{[S.uid]:DELV()},names:{[S.uid]:DELV()}});toast('Você saiu do projeto.');colGone(pid)}catch(e){console.warn(e);toast('Não foi possível sair agora.','err')}}
{const _dp=deleteProject;deleteProject=async function(id){const c=S.colP[id];if(!c||!colOn())return _dp.apply(this,arguments);
 if(colRoleOf(id)!=='owner'){await colLeave(id);return false}
 const ok=await _dp.apply(this,arguments);if(ok){colExit();try{const ns=await S.db.collection('collab/'+id+'/notes').get();for(const d of ns.docs)await S.db.doc('collab/'+id+'/notes/'+d.id).delete()}catch{}
  try{const ks=await S.db.collection('collab/'+id+'/k').get();for(const d of ks.docs)await S.db.doc(colPath(id,d.id)).delete()}catch{}
  for(const code of Object.values(c.codes||{}))await S.db.doc('cinv/'+code).delete().catch(()=>{});await S.db.doc('collab/'+id).delete().catch(()=>{});delete S.colP[id]}return ok}}

/* entrar por convite: ?colab=CÓDIGO */
async function colJoin(code){code=String(code||'').trim().toUpperCase();if(!code)return;
 if(!colOn()){if(VISITOR())try{sessionStorage.setItem('ink-colab',code)}catch{}await modal({title:'👥 Convite para escrever junto',body:`<p style="margin-top:0">${VISITOR()?'Visitantes só jogam. <b>Crie uma conta grátis</b> para participar deste projeto.':'Entre na sua conta para aceitar o convite.'}</p>`,actions:[{label:'Agora não'},...(VISITOR()?[{label:'Criar conta',cls:'primary',value:'up'}]:[])]}).then(v=>{if(v==='up')ACT.inkLogin()});return}
 let iv=null;try{const s=await S.db.doc('cinv/'+code).get();iv=s.exists?s.data():null}catch{}
 if(!iv){toast('Este convite não vale mais. Peça um link novo.','err');return}
 if(S.colP[iv.pid]){const r=colRoleOf(iv.pid);if(r==='owner'||(r===iv.role)){openProject(iv.pid);return}}
 const v=await modal({title:'👥 Convite',body:`<p style="margin-top:0">Você foi convidado para <b>${esc(iv.title||'um projeto')}</b> como <b>${ROLE_LABEL[iv.role]||iv.role}</b>.</p><p class="small muted">${iv.role==='edit'?'Você poderá escrever e editar capítulos junto com o autor.':'Você poderá ler e deixar comentários.'}</p>`,actions:[{label:'Agora não'},{label:'Aceitar',cls:'primary',value:'ok'}]});
 if(v!=='ok')return;const b=busy('Entrando…');
 try{await S.db.doc('collab/'+iv.pid).update({members:{[S.uid]:iv.role},names:{[S.uid]:myName()},jc:code});S.projects=await Store.list();b.done();renderHome();if(S.projects.some(p=>p.id===iv.pid))openProject(iv.pid);toast('Pronto! Você entrou em “'+(iv.title||'projeto')+'”.')}
 catch(e){b.done();console.warn(e);toast('Não foi possível entrar. Talvez o dono tenha removido você ou trocado o link.','err')}}
const parseColab=t=>{const m=/[?&#]colab=([A-Za-z0-9]{6,12})/.exec(String(t||''));return m?m[1]:''};

/* ---------- levar do Claude para o site (e importar vários de uma vez) ---------- */
async function restoreProjectData(data,withTable,withSeats,b){
 data=await restoreAssets(data,b);const p=data.project;const oldChs=data.chapters||{};
 p.id=uid();p.kind='project';delete p.col;p.title=p.title+(S.projects.some(x=>x.title===p.title)?' (cópia)':'');
 const idmap={};p.chapters=(p.chapters||[]).map(c=>{const nid=uid();idmap[c.id]=nid;const d=oldChs[c.id]||{};queueWrite('c_'+nid,{kind:'chapter',pid:p.id,id:nid,html:d.html||'',notes:d.notes||''});return{...c,id:nid}});
 if(Array.isArray(p.outline))p.outline=p.outline.map(n=>n.t==='f'?{...n,id:uid(),items:(n.items||[]).map(i=>idmap[i]).filter(Boolean)}:{t:'c',id:idmap[n.id]}).filter(n=>n.t==='f'||n.id);
 p.drafts=Array.isArray(p.drafts)?p.drafts.map(i=>idmap[i]).filter(Boolean):[];
 p.settings=Object.assign(defaultSettings(p.type,p.title),p.settings||{});p.lastCh=null;delete p.published;
 Object.entries(data.comments||{}).forEach(([o,list])=>{const nid=idmap[o];if(nid)queueWrite('cm_'+nid,{kind:'comments',pid:p.id,cid:nid,list})});
 S.projects.push(clone(p));queueWrite('p_'+p.id,p);
 let ns=0;if(withTable&&data.table&&S.backend==='cloud'){b&&b.set('Restaurando a mesa de “'+p.title+'”…');ns=await writeTable(p.id,data.table,{seats:withSeats,title:p.title})}
 return{p,ns}}
async function importBundle(bundle){const items=(bundle.items||[]).filter(x=>x&&x.project);if(!items.length){toast('Nenhum projeto encontrado no arquivo.','err');return false}
 if(VISITOR()||(FBAVAIL()&&!FBM())){toast('Entre com uma conta (não visitante) para importar seus projetos.','err');return false}
 const cloud=S.backend==='cloud',nT=items.filter(x=>x.table).length;
 const v=await modal({title:'🚀 Importar do Claude',wide:true,body:`<p style="margin-top:0">Escolha o que trazer. Cada um entra como um <b>projeto novo</b> na sua estante.</p><div class="imp-list">${items.map((x,i)=>`<label class="ckrow"><input type="checkbox" data-ii="${i}" checked> <b>${esc(x.project.title||'Sem título')}</b> <span class="muted small">${x.project.type==='rpg'?'🎲 RPG':'📖 Livro'} · ${(x.project.chapters||[]).length} capítulo(s)${x.table?' · mesa com '+Object.keys(x.table.maps||{}).length+' mapa(s)':''}</span></label>`).join('')}</div>
  ${nT&&cloud?'<label class="toggle" style="margin-top:10px"><input type="checkbox" id="ibT" checked><span class="sw"></span>Trazer também as mesas de jogo (mapas, personagens, fichas)</label>':''}`,
  actions:[{label:'Cancelar'},{label:'Importar',cls:'primary',onClick:ov=>({sel:$$('[data-ii]',ov).filter(i=>i.checked).map(i=>+i.dataset.ii),t:!!($('#ibT',ov)&&$('#ibT',ov).checked)})}]});
 if(!v||!v.sel.length)return false;const b=busy('Importando…');let n=0;
 try{for(const i of v.sel){b.set(`Importando ${n+1}/${v.sel.length}: ${items[i].project.title}…`);await restoreProjectData(clone(items[i]),v.t,v.t,b);n++}
  renderHome();toast(`Pronto! ${n} projeto(s) importado(s).`);return true}
 catch(e){console.warn(e);toast('Parou no meio: '+(e.message||'erro')+'. '+n+' projeto(s) importado(s).','err');renderHome();return n>0}finally{b.done()}}
ACT.importBackup=async()=>{const [f]=await pickFile('.json,application/json');if(!f)return;let data;
 try{data=JSON.parse(await f.text());if(!['escritas','inkmind'].includes(data.app)||!(data.project||data.kind==='bundle'))throw 0}catch{toast('Arquivo de backup inválido.','err');return}
 if(data.kind==='bundle'){importBundle(data);return}
 let withTable=false,withSeats=false;
 if(data.table){if(S.backend!=='cloud')toast('Este backup tem uma mesa de jogo; ela só pode ser restaurada '+CLOUD_NEED()+'. Restaurando só o projeto.');
  else{const v=await modal({title:'Restaurar backup',body:`<p style="margin-top:0">“${esc(data.project.title)}” será restaurado como um <b>novo projeto</b> na sua estante.</p><label class="toggle"><input type="checkbox" id="riT" checked><span class="sw"></span>Restaurar também a mesa de jogo (${Object.keys(data.table.maps||{}).length} mapa(s), ${(data.table.game.chars||[]).length} personagem(ns))</label>${Object.keys(data.table.seats||{}).length?'<label class="toggle"><input type="checkbox" id="riS" checked><span class="sw"></span>Incluir as fichas dos jogadores</label>':''}`,
   actions:[{label:'Cancelar'},{label:'Restaurar',cls:'primary',onClick:ov=>({t:$('#riT',ov).checked,s:!!($('#riS',ov)&&$('#riS',ov).checked)})}]});
   if(!v)return;withTable=v.t;withSeats=v.t&&v.s}}
 const b=busy('Restaurando…');try{const {p,ns}=await restoreProjectData(data,withTable,withSeats,b);renderHome();toast('Backup restaurado: '+p.title+(withTable?' · mesa restaurada'+(ns?` com ${ns} ficha(s)`:''):''))}
 catch(e){console.warn(e);toast('Não consegui restaurar: '+(e.message||'erro'),'err')}finally{b.done()}};
async function buildBundle(b){const items=[];let i=0;for(const p of S.projects){b&&b.set(`Juntando ${++i}/${S.projects.length}: ${p.title}…`);try{items.push(await buildBackup(p.id,{table:p.type==='rpg',seats:true,img:true},b))}catch(e){console.warn('backup',p.title,e)}}
 return{app:'inkmind',kind:'bundle',version:3,exportedAt:new Date().toISOString(),items}}
ACT.toSite=async()=>{if(!S.projects.length){toast('Sua estante está vazia.');return}
 const v=await modal({title:'🚀 Levar para o site do Inkmind',body:`<p style="margin-top:0">O site tem conta própria, escrita a várias mãos, app instalável e mesas online abertas para qualquer pessoa.</p><p>Vamos juntar seus <b>${S.projects.length} projeto(s)</b> (com capítulos, mesas e imagens) e abrir o site. Lá, entre na sua conta e confirme a importação.</p><p class="small muted">Nada é apagado daqui do Claude.</p>`,actions:[{label:'Cancelar'},{label:'Juntar e abrir o site',cls:'primary',value:'go'}]});
 if(v!=='go')return;const SITE=window.INK_SITE||SITE_URL();let w=null;try{w=window.open(SITE+'?importar=claude','_blank')}catch{}
 const b=busy('Juntando seus projetos…');let bundle;try{bundle=await buildBundle(b)}catch(e){b.done();toast('Não consegui juntar os projetos.','err');return}b.done();
 const origin=new URL(SITE).origin;let got=false;
 const onMsg=e=>{if(!w||e.source!==w||!e.data)return;if(e.data.t==='ink-ready'&&!got){try{w.postMessage({t:'ink-bundle',bundle},origin)}catch(err){console.warn(err)}}if(e.data.t==='ink-got'){got=true;removeEventListener('message',onMsg);$('.ov')&&$('.ov').remove();toast('O site recebeu seus projetos! Confirme por lá. 🎉')}};
 addEventListener('message',onMsg);
 const fn='inkmind-tudo-'+new Date().toISOString().slice(0,10)+'.json';
 const r=await modal({title:'🚀 Quase lá',body:`<ol style="margin-top:0;line-height:1.8"><li>${w?'O site abriu em outra aba.':'Abra o site: <a href="'+esc(SITE)+'?importar=arquivo" target="_blank" rel="noopener">'+esc(SITE.replace(/^https:\/\//,''))+'</a>'}</li><li>Entre na sua conta (Google ou e-mail).</li><li>${w?'Os projetos chegam sozinhos: é só confirmar.':'Escolha o arquivo baixado em <b>Restaurar backup</b>.'}</li></ol>
  <p class="small muted">Se não chegarem em alguns segundos, baixe o arquivo e, no site, use <b>Estante → Restaurar backup</b>.</p>`,actions:[{label:'Baixar arquivo',value:'dl'},{label:'Fechar',cls:'primary'}]});
 if(r==='dl')saveFile(fn,JSON.stringify(bundle))};
/* no site: ?importar=claude (recebe da aba do Claude) ou ?importar=arquivo */
function impParam(){const m=/[?&]importar=(claude|arquivo)/.exec(location.search);return m?m[1]:''}
function impReceive(){if(S._impRx)return;S._impRx=1;const op=window.opener;let done=false,tries=0;
 if(!op){impAskFile();return}
 const onMsg=async e=>{if(e.source!==op||!e.data||e.data.t!=='ink-bundle'||done)return;done=true;removeEventListener('message',onMsg);try{op.postMessage({t:'ink-got'},'*')}catch{}
  try{history.replaceState(null,'',location.pathname)}catch{}importBundle(e.data.bundle)};
 addEventListener('message',onMsg);
 const ping=()=>{if(done||++tries>40)return;try{op.postMessage({t:'ink-ready'},'*')}catch{}setTimeout(ping,1000)};ping();
 setTimeout(()=>{if(!done){removeEventListener('message',onMsg);impAskFile()}},42000)}
function impAskFile(){modal({title:'🚀 Importar do Claude',body:'<p style="margin-top:0">No Inkmind do Claude, toque em <b>🚀 Levar para o site → Baixar arquivo</b>. Depois escolha o arquivo aqui.</p>',actions:[{label:'Agora não'},{label:'Escolher arquivo',cls:'primary',value:'f'}]}).then(v=>{try{history.replaceState(null,'',location.pathname)}catch{}if(v==='f')ACT.importBackup()})}

/* ---------- pontos de entrada ---------- */
{const _rh5=renderHome;renderHome=function(...a){const r=_rh5.apply(this,a);
 try{
  if(IN_CLAUDE()&&S.projects.length&&!$('#toSiteCard')){const anchor=$('.home .learn-cta')||$('.home .hero');if(anchor)anchor.insertAdjacentHTML('afterend',`<div class="card tosite" id="toSiteCard"><div class="ts-ic">🚀</div><div class="grow"><b>Levar seus projetos para o site</b><div class="small muted">Escrita a várias mãos, leitores beta, app no celular e mesas abertas para qualquer pessoa.</div></div><button class="btn primary sm" data-act="toSite">Levar para o site</button></div>`)}
  $$('.book[data-id]').forEach(el=>{const c=S.colP[el.dataset.id];if(!c||el.querySelector('.col-badge'))return;const r=colRoleOf(el.dataset.id);el.insertAdjacentHTML('beforeend',`<span class="col-badge ${r}">${r==='beta'?'📖 Leitura beta':r==='edit'?'✍️ Coautoria':'👥 Compartilhado'}</span>`)});
  if(!S._colParam){S._colParam=1;let code=parseColab(location.search);if(!code&&colOn()){try{code=sessionStorage.getItem('ink-colab')||'';sessionStorage.removeItem('ink-colab')}catch{}}if(code){try{history.replaceState(null,'',location.pathname)}catch{}setTimeout(()=>colJoin(code),400)}}
  if(!S._impParam&&!IN_CLAUDE()){S._impParam=1;const ip=impParam();if(ip==='claude')setTimeout(impReceive,400);else if(ip==='arquivo')setTimeout(impAskFile,400)}
 }catch(e){console.warn(e)}return r}}
{const _rn=railNav;railNav=function(){let h=_rn.apply(this,arguments);if(!S.P)return h;const c=S.colP[S.P.id];
 const btn=`<button data-act="colShare" class="ik-rx">${I('users')}<span>${c?'Compartilhado':'Compartilhar'}</span></button>`;
 return h.replace('<button class="show-m ik-more"',btn+'<button class="show-m ik-more"')}}
