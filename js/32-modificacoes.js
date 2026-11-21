/* ============ v37: Últimas modificações (com aviso) ============
   Cada capítulo guarda as últimas mudanças em p.chapters[i].mods = [{id,at,by,name,snip,q,pos,gone}] (até 5).
   Uma "sessão" de escrita da mesma pessoa no mesmo capítulo (pausas < 15 min) vira uma entrada só.
   A lista fica embaixo de Rascunhos; mudanças de coautores ainda não vistas ganham selo e aviso,
   e clicar leva ao capítulo e ao trecho alterado. */
const MOD_MAX=5,MOD_SESS=15*60e3;
ICONS.clock=ICONS.clock||'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
S.modSess={};S.modNotified=null;S.modAll=false;
const modMe=()=>S.uid||'local';
/* texto simples de um HTML (inerte: <template> não carrega imagens nem roda nada) */
function modText(html){const t=document.createElement('template');t.innerHTML=String(html||'').replace(/(<\/(?:p|div|h[1-6]|li|blockquote|pre)>|<br\s*\/?>)/gi,'$1\n');return t.content.textContent||''}
const modNorm=s=>String(s||'').replace(/\s+/g,' ').trim();
function modDiff(a,b){const n=Math.min(a.length,b.length);let i=0;while(i<n&&a[i]===b[i])i++;let j=0;while(j<n-i&&a[a.length-1-j]===b[b.length-1-j])j++;return {i,endA:a.length-j,endB:b.length-j}}
function modCut(s,max){s=modNorm(s);if(s.length<=max)return s;const c=s.slice(0,max),k=c.lastIndexOf(' ');return (k>max*.6?c.slice(0,k):c)+'…'}
/* descreve a diferença entre o texto do começo da sessão e o atual */
function modDescribe(a,b){if(a===b)return null;const d=modDiff(a,b),add=b.slice(d.i,d.endB),gone=a.slice(d.i,d.endA);
 if(!modNorm(add)&&!modNorm(gone))return null;
 const pre=b.slice(Math.max(0,d.i-30),d.i).replace(/^\S*\s/,'');
 let snip,q;
 if(modNorm(add)){snip=(pre&&modNorm(add).length<70?'…'+modNorm(pre)+' ':'')+modCut(add,110);q=add.length>=10?add.slice(0,60):b.slice(Math.max(0,d.i-30),d.i+30)}
 else{snip=modCut(b.slice(Math.max(0,d.i-50),d.i+50),110)||'(capítulo esvaziado)';q=b.slice(Math.max(0,d.i-30),d.i+30)}
 return {snip,q:modNorm(q).slice(0,80),pos:b.length?+(d.i/b.length).toFixed(3):0,gone:modNorm(add)?'':modCut(gone,70)}}
function modRecord(cid,prevHtml,newHtml){const m=chMeta(cid);if(!m||prevHtml==null||prevHtml===newHtml)return;
 const prev=modText(prevHtml),now=modText(newHtml);if(prev===now)return;
 m.mods=Array.isArray(m.mods)?m.mods:[];let s=S.modSess[cid],e=s&&m.mods.find(x=>x.id===s.id);
 if(!e||e.by!==modMe()||Date.now()-e.at>MOD_SESS){s=S.modSess[cid]={id:uid(),base:prev};e=null}
 const d=modDescribe(s.base,now);
 if(!d){if(e){m.mods=m.mods.filter(x=>x.id!==e.id);delete S.modSess[cid]}return}
 if(!e){e={id:s.id,by:modMe()};m.mods.unshift(e)}
 Object.assign(e,{at:Date.now(),name:myName(),...d});if(!e.gone)delete e.gone;
 m.mods=m.mods.sort((x,y)=>y.at-x.at).slice(0,MOD_MAX);saveProject();modRefresh()}
{const _sv=saveChapterNow;saveChapterNow=function(...a){const page=$('#page'),cid=S.cid,will=S.chDirty&&page&&cid&&page.contentEditable==='true';
 const prev=will&&S.cache[cid]?S.cache[cid].html:null;const r=_sv.apply(this,a);
 if(will&&prev!=null&&S.cache[cid])try{modRecord(cid,prev,S.cache[cid].html)}catch(e){console.warn('modificações',e)}return r}}
/* coautoria: as listas de modificações dos dois lados se somam (ninguém apaga a do outro) */
{const _m3=colMerge3;colMerge3=function(base,local,remote){const out=_m3.apply(this,arguments);if(!out||!local||!remote)return out;
 const idx=p=>new Map(((p&&p.chapters)||[]).map(c=>[c.id,c]));const L=idx(local),R=idx(remote);
 for(const c of out.chapters||[]){const all=[...((L.get(c.id)||{}).mods||[]),...((R.get(c.id)||{}).mods||[])];if(!all.length)continue;
  const by=new Map();for(const x of all){if(!x||!x.id)continue;const o=by.get(x.id);if(!o||(x.at||0)>(o.at||0))by.set(x.id,x)}
  c.mods=[...by.values()].sort((a,b)=>b.at-a.at).slice(0,MOD_MAX)}
 return out}}
/* lista e "vistas" */
function modList(p){p=p||P();if(!p)return [];const out=[];for(const c of p.chapters||[])for(const e of c.mods||[])if(e&&e.at)out.push({...e,cid:c.id,title:c.title||'Sem título',draft:(p.drafts||[]).includes(c.id)});return out.sort((a,b)=>b.at-a.at)}
const modSeenAll=()=>{try{return JSON.parse(localStorage['ink.modSeen.'+modMe()]||'{}')}catch{return {}}};
function modSeen(pid){const a=modSeenAll();return a[pid]||{t:0,e:{}}}
function modSeenSave(pid,v){const a=modSeenAll();const ks=Object.keys(v.e||{});if(ks.length>150)ks.slice(0,ks.length-150).forEach(k=>delete v.e[k]);a[pid]=v;try{localStorage['ink.modSeen.'+modMe()]=JSON.stringify(a)}catch{}}
function modUnread(p){p=p||P();if(!p)return [];const s=modSeen(p.id),me=modMe();return modList(p).filter(e=>e.by!==me&&e.at>s.t&&!((s.e||{})[e.id]>=e.at))}
function modWhen(t){const d=new Date(t),now=new Date(),hm=d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 const day=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime(),dd=(day(now)-day(d))/864e5;
 return dd===0?'hoje, '+hm:dd===1?'ontem, '+hm:d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})+', '+hm}
function modBoxHTML(){const p=P(),all=modList(p),un=new Set(modUnread(p).map(e=>e.id)),me=modMe();const open=localStorage['ink.modOpen']!=='0';
 const show=S.modAll?all:all.slice(0,8);
 const li=e=>`<li class="mod ${un.has(e.id)?'unread':''}" data-act="modGo" data-cid="${e.cid}" data-mid="${e.id}" title="Ir para este trecho">
  <div class="mod-h"><span class="mod-c">${e.draft?'✎ ':''}${esc(e.title)}</span><span class="mod-t">${esc(modWhen(e.at))}</span></div>
  <div class="mod-s">${e.gone?`<span class="mod-del">apagou “${esc(e.gone)}”</span> · perto de `:''}“${esc(e.snip||'')}”</div>
  <div class="mod-by">${e.by===me?'por você':'por <b>'+esc(e.name||'Coautor')+'</b>'}</div></li>`;
 return `<div class="td tm ${open?'':'closed'}" id="modBox"><div class="td-h tm-h" data-act="modToggle">${I('clock')}<span class="t" title="Últimas modificações">Últimas modificações</span>${un.size?`<span class="mod-badge" title="Mudanças de coautores que você ainda não viu">${un.size}</span>`:''}${un.size?`<button class="btn sm ghost tm-ok" data-act="modSeenAll" title="Marcar todas como vistas">✓</button>`:''}<span class="caret">▾</span></div>
  <ul class="tl mod-l">${show.map(li).join('')||'<li class="tempty">As mudanças no texto aparecem aqui, com data, hora e quem fez.</li>'}${all.length>8?`<li class="mod-more"><button class="btn sm ghost" data-act="modMore">${S.modAll?'Mostrar menos':'Ver todas ('+all.length+')'}</button></li>`:''}</ul></div>`}
function modRefresh(){const t=$('#tree');if(!t||!P())return;const old=$('#modBox');const html=modBoxHTML();if(old)old.outerHTML=html;else t.insertAdjacentHTML('beforeend',html);modBadges();modNotify()}
function modBadges(){const n=P()?modUnread().length:0;$$('[data-act=side].show-m').forEach(b=>{let d=b.querySelector('.mod-dot');if(n&&!d){b.insertAdjacentHTML('beforeend','<span class="mod-dot"></span>');d=b.querySelector('.mod-dot')}if(d){if(n)d.textContent=n>9?'9+':String(n);else d.remove()}})}
/* aviso quando chega uma mudança nova de outra pessoa enquanto o projeto está aberto */
function modNotify(){const p=P();if(!p)return;const un=modUnread(p),key=e=>e.id+'@'+e.at;
 if(!S.modNotified||S.modNotified.pid!==p.id){S.modNotified={pid:p.id,ids:new Set(un.map(e=>e.id))};return}
 const fresh=un.filter(e=>!S.modNotified.ids.has(e.id));fresh.forEach(e=>S.modNotified.ids.add(e.id));if(!fresh.length)return;
 const e=fresh[0],more=fresh.length-1;$('#modToast')&&$('#modToast').remove();
 document.body.insertAdjacentHTML('beforeend',`<div class="mod-toast" id="modToast" role="status"><button class="mt-go" data-act="modGo" data-cid="${e.cid}" data-mid="${e.id}"><b>✍️ ${esc(e.name||'Coautor')}</b> alterou <b>${esc(e.title)}</b>${more?` (+${more})`:''}<small>“${esc(modCut(e.snip||'',70))}” · toque para ver</small></button><button class="mt-x" title="Fechar">✕</button></div>`);
 const t=$('#modToast');t.querySelector('.mt-x').onclick=()=>t.remove();setTimeout(()=>{if(t.isConnected)t.remove()},9000)}
{const _rcl=renderChList;renderChList=function(...a){const r=_rcl.apply(this,a);try{modRefresh()}catch(e){console.warn(e)}return r}}
ACT.modToggle=()=>{const b=$('#modBox');if(!b)return;b.classList.toggle('closed');try{localStorage['ink.modOpen']=b.classList.contains('closed')?'0':'1'}catch{}};
ACT.modMore=()=>{S.modAll=!S.modAll;modRefresh()};
ACT.modSeenAll=()=>{const p=P();if(!p)return;modSeenSave(p.id,{t:Date.now(),e:{}});modRefresh()};
/* ir até o trecho */
ACT.modGo=async el=>{const cid=el.dataset.cid,mid=el.dataset.mid,p=P();if(!p)return;$('#modToast')&&$('#modToast').remove();
 const e=modList(p).find(x=>x.id===mid&&x.cid===cid);if(!e){toast('Esse trecho não existe mais.');return}
 const s=modSeen(p.id);s.e=s.e||{};s.e[mid]=e.at;modSeenSave(p.id,s);
 if(S.view!=='write'||!$('#page')){S.cid=cid;await showView('write')}
 if(S.cid!==cid)await openChapter(cid);else closeSide();
 await new Promise(r=>setTimeout(r,120));modFocus(e);modRefresh()};
function modFocus(e){const page=$('#page');if(!page)return;const map=[];let str='';const w=document.createTreeWalker(page,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){const t=n.nodeValue;for(let i=0;i<t.length;i++)if(!/\s/.test(t[i])){str+=t[i];map.push([n,i])}}
 const q=String(e.q||'').replace(/\s+/g,'');let k=q?str.indexOf(q):-1;
 if(k<0&&q.length>16)k=str.indexOf(q.slice(0,16));
 let target=null;
 if(k>=0){const a=map[k],b=map[Math.min(map.length-1,k+(k===str.indexOf(q)?q.length:16)-1)];const r=document.createRange();r.setStart(a[0],a[1]);r.setEnd(b[0],b[1]+1);
  try{if(window.Highlight&&CSS.highlights){CSS.highlights.set('ink-mod',new Highlight(r));clearTimeout(S.modHl);S.modHl=setTimeout(()=>CSS.highlights.delete('ink-mod'),4500)}}catch{}
  target=a[0].parentElement}
 else if(map.length){const a=map[Math.min(map.length-1,Math.floor((e.pos||0)*map.length))];target=a[0].parentElement;toast('O trecho mudou desde então — mostrando a região aproximada.')}
 if(target){const blk=target.closest('p,h1,h2,h3,h4,blockquote,li,div')||target;blk.scrollIntoView({block:'center',behavior:'smooth'});blk.classList.add('mod-flash');setTimeout(()=>blk.classList.remove('mod-flash'),2200)}}
/* selo na Estante: projetos com mudanças de coautores ainda não vistas */
{const _rh=renderHome;renderHome=function(...a){const r=_rh.apply(this,a);try{for(const p of S.projects||[]){const n=modUnread(p).length;if(!n)continue;const b=$(`.book[data-id="${p.id}"]`);if(b&&!b.querySelector('.mod-pbadge'))b.insertAdjacentHTML('beforeend',`<span class="mod-pbadge" title="${n} mudança(s) de coautores desde a sua última visita">✍️ ${n}</span>`)}}catch{}return r}}
