/* ============ v31: dicionário do escritor (dentro da Wiki do mundo / Compêndio) ============
   Palavras inventadas, nomes, termos e expressões do mundo da história. Ficam em p.dict.
   O corretor aceita todas; no texto, digitar @ também oferece as palavras do dicionário. */
const DICT_CLS=['Substantivo','Adjetivo','Verbo','Nome próprio','Lugar','Povo / raça','Expressão','Interjeição','Outro'];
const dictOf=(p=P())=>{if(!p)return[];if(!Array.isArray(p.dict))p.dict=[];return p.dict};
const dictWords=(p=P())=>dictOf(p).map(d=>d.w).filter(Boolean);
const nrmW=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

/* quantas vezes cada palavra aparece no livro (lê os capítulos guardados) */
async function dictUsage(p=P()){const words=dictOf(p);if(!words.length)return{};const out={};words.forEach(d=>out[d.id]=0);
 try{await flushChapter()}catch{}
 for(const c of p.chapters){let html='';try{html=(await getChapter(c.id)).html||''}catch{}const txt=nrmW(html.replace(/<[^>]+>/g,' '));
  for(const d of words){const w=nrmW(d.w);if(!w)continue;const re=new RegExp('(^|[^\\p{L}])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^\\p{L}])','gu');const m=txt.match(re);if(m)out[d.id]+=m.length}}
 return out}

function renderDict(){const p=P(),list=dictOf(p),q=nrmW(S.dictQ||''),rpg=p.type==='rpg';
 const shown=list.filter(d=>!q||nrmW(d.w+' '+(d.def||'')+' '+(d.cls||'')+' '+(d.notes||'')).includes(q)).sort((a,b)=>nrmW(a.w).localeCompare(nrmW(b.w),'pt'));
 const groups={};shown.forEach(d=>{const L=(nrmW(d.w)[0]||'#').toUpperCase();(groups[L]=groups[L]||[]).push(d)});
 const use=S.dictUse||{};
 $('#view').innerHTML=`<div class="scrollview"><div class="wrapc">
  ${cxModeTabs()}
  <div class="vh"><div class="grow"><h2>📖 Dicionário do escritor</h2><p>Palavras inventadas, nomes, termos e expressões ${rpg?'da campanha':'do seu mundo'}. O corretor aceita todas elas, e no texto é só digitar <b>@</b> para inserir uma.</p></div>
   <input id="dqq" placeholder="Buscar…" value="${esc(S.dictQ||'')}" style="max-width:200px"><button class="btn primary" data-act="dictNew">${I('plus')} Nova palavra</button></div>
  <div class="row wrap" style="gap:8px;margin-bottom:12px"><button class="btn sm" data-act="dictBulk">📋 Colar uma lista</button><button class="btn sm" data-act="dictGloss">⬇ Baixar glossário</button><button class="btn sm" data-act="dictCount">🔎 Ver uso no livro</button><span class="sp"></span><span class="small muted">${list.length} palavra(s)</span></div>
  ${shown.length?Object.keys(groups).sort((a,b)=>a.localeCompare(b,'pt')).map(L=>`<div class="dl-h">${esc(L)}</div><div class="dl-g">${groups[L].map(d=>`<div class="dl-w" data-act="dictEdit" data-id="${d.id}"><div class="dl-t"><b>${esc(d.w)}</b>${d.pron?` <span class="muted">/${esc(d.pron)}/</span>`:''}${d.cls?` <span class="pill">${esc(d.cls)}</span>`:''}${use[d.id]!=null?` <span class="pill ${use[d.id]?'on':''}">${use[d.id]?use[d.id]+'× no livro':'ainda não usada'}</span>`:''}</div>${d.def?`<div class="dl-d">${esc(d.def)}</div>`:''}${d.ex?`<div class="dl-e">“${esc(d.ex)}”</div>`:''}</div>`).join('')}</div>`).join('')
   :`<div class="empty"><div class="big">${list.length?'Nada encontrado':'Seu dicionário está vazio'}</div><p>${list.length?'Tente outra busca.':'Guarde aqui as palavras que você inventou — feitiços, povos, títulos, gírias, nomes de lugares — com o significado e um exemplo de uso. Você também pode selecionar uma palavra no texto e escolher <b>Revisar → Adicionar ao dicionário</b>.'}</p></div>`}
 </div></div>`;
 const qi=$('#dqq');qi.oninput=debounce(()=>{S.dictQ=qi.value;renderDict();const n=$('#dqq');n.focus();n.setSelectionRange(n.value.length,n.value.length)},250)}
function cxModeTabs(){const m=S.cxMode||'wiki',rpg=P().type==='rpg';return `<div class="seg cx-mode" id="cxMode"><button data-cm="wiki" class="${m==='wiki'?'on':''}">📇 ${rpg?'Fichas':'Wiki do mundo'}</button><button data-cm="dict" class="${m==='dict'?'on':''}">📖 Dicionário <span style="opacity:.6">${dictOf().length}</span></button></div>`}
{const _rc=RENDER.codex;RENDER.codex=function(){if(S.cxMode==='dict'){renderDict();bindCxMode();return}const r=_rc.apply(this,arguments);const w=$('#view .wrapc');if(w&&!$('#cxMode'))w.insertAdjacentHTML('afterbegin',cxModeTabs());bindCxMode();return r}}
function bindCxMode(){$$('#cxMode [data-cm]').forEach(b=>b.onclick=()=>{S.cxMode=b.dataset.cm;RENDER.codex()})}

async function dictEditDlg(d,o={}){const p=P(),isNew=!d;d=d||{id:uid(),w:o.w||'',cls:'',pron:'',def:'',ex:o.ex||'',notes:''};
 const v=await modal({title:isNew?'📖 Nova palavra':'📖 '+esc(d.w),body:`<label class="f">Palavra ou expressão</label><input id="dwW" value="${esc(d.w)}" maxlength="60" placeholder="Ex.: Valdrann, sombraluz, juramento de cinzas">
  <div class="row wrap" style="gap:10px"><div class="grow"><label class="f">Classe</label><select id="dwC"><option value="">—</option>${DICT_CLS.map(c=>`<option ${d.cls===c?'selected':''}>${c}</option>`).join('')}</select></div><div class="grow"><label class="f">Pronúncia (opcional)</label><input id="dwP" value="${esc(d.pron||'')}" maxlength="60" placeholder="val-DRÁN"></div></div>
  <label class="f">Significado</label><textarea id="dwD" rows="3" maxlength="1000" placeholder="O que é, de onde vem…">${esc(d.def||'')}</textarea>
  <label class="f">Exemplo de uso</label><input id="dwE" value="${esc(d.ex||'')}" maxlength="240" placeholder="Uma frase do livro com a palavra">
  <label class="f">Notas (só para você)</label><textarea id="dwN" rows="2" maxlength="1000">${esc(d.notes||'')}</textarea>`,
  onMount:ov=>{const i=$('#dwW',ov);i.focus();i.select()},
  actions:[...(isNew?[]:[{label:'Apagar',value:'del'}]),{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>{const w=$('#dwW',ov).value.trim();if(!w){toast('Escreva a palavra.');return false}return{w,cls:$('#dwC',ov).value,pron:$('#dwP',ov).value.trim(),def:$('#dwD',ov).value.trim(),ex:$('#dwE',ov).value.trim(),notes:$('#dwN',ov).value.trim()}}}]});
 if(!v)return null;const list=dictOf(p);
 if(v==='del'){if(!await confirmDlg('Apagar “'+esc(d.w)+'” do dicionário?','Apagar'))return null;p.dict=list.filter(x=>x.id!==d.id)}
 else{const dup=list.find(x=>x.id!==d.id&&nrmW(x.w)===nrmW(v.w));if(dup){toast('“'+dup.w+'” já está no dicionário.');return null}Object.assign(d,v,{t:Date.now()});if(isNew)list.push(d)}
 saveProject();try{rvUserWords&&rvUserWords()}catch{}if(S.view==='codex')RENDER.codex();return d}
ACT.dictNew=()=>dictEditDlg(null);
ACT.dictEdit=el=>{const d=dictOf().find(x=>x.id===el.dataset.id);if(d)dictEditDlg(d)};
ACT.dictBulk=async()=>{const v=await modal({title:'📋 Colar uma lista de palavras',body:'<p style="margin-top:0" class="small muted">Uma por linha. Se quiser, escreva o significado depois de um traço: <code>sombraluz — luz que não projeta sombra</code></p><textarea id="dbT" rows="10" placeholder="Valdrann — a capital do norte\nsombraluz\nkethari — povo das montanhas"></textarea>',actions:[{label:'Cancelar'},{label:'Adicionar',cls:'primary',onClick:ov=>$('#dbT',ov).value}]});
 if(!v)return;const list=dictOf(),have=new Set(list.map(d=>nrmW(d.w)));let n=0;
 v.split('\n').map(l=>l.trim()).filter(Boolean).forEach(l=>{const m=/^(.+?)\s*[—–-]\s+(.+)$/.exec(l),w=(m?m[1]:l).trim().slice(0,60);if(!w||have.has(nrmW(w)))return;have.add(nrmW(w));list.push({id:uid(),w,cls:'',pron:'',def:m?m[2].trim():'',ex:'',notes:'',t:Date.now()});n++});
 saveProject();toast(n?`${n} palavra(s) adicionada(s).`:'Nenhuma palavra nova.');RENDER.codex()};
ACT.dictCount=async()=>{const b=busy('Procurando no livro…');try{S.dictUse=await dictUsage()}finally{b.done()}RENDER.codex()};
ACT.dictGloss=()=>{const p=P(),list=dictOf(p).slice().sort((a,b)=>nrmW(a.w).localeCompare(nrmW(b.w),'pt'));if(!list.length){toast('O dicionário está vazio.');return}
 const md=`# Glossário — ${p.title}\n\n`+list.map(d=>`**${d.w}**${d.pron?` /${d.pron}/`:''}${d.cls?` _(${d.cls.toLowerCase()})_`:''}${d.def?` — ${d.def}`:''}${d.ex?`\n> ${d.ex}`:''}`).join('\n\n')+'\n';
 saveFile((p.title||'glossario').replace(/[^\p{L}\p{N} _-]+/gu,'').trim()+' - glossário.md',md)};
/* adicionar a palavra selecionada no texto */
ACT.dictAddSel=()=>{let w='';try{const s=getSelection();if(s.rangeCount&&$('#page')&&$('#page').contains(s.getRangeAt(0).commonAncestorContainer))w=String(s).trim()}catch{}
 if(!w&&typeof savedRange!=='undefined'&&savedRange)w=String(savedRange.toString()).trim();
 if(!w){toast('Selecione uma palavra no texto primeiro.');return}if(w.length>60){toast('Selecione só a palavra ou a expressão.');return}
 const have=dictOf().find(d=>nrmW(d.w)===nrmW(w));if(have){dictEditDlg(have);return}
 let ex='';try{const s=getSelection(),n=s.anchorNode,t=(n&&(n.parentElement||n).closest('p,h2,h3,li,blockquote')||{}).innerText||'';ex=t.length<=240?t.trim():''}catch{}
 dictEditDlg(null,{w,ex}).then(d=>{if(d)toast('“'+d.w+'” entrou no dicionário.')})};

/* @ no texto: também oferece as palavras do dicionário (entram como texto comum) */
{const _mcd=mentionCandidates;mentionCandidates=function(q){const base=_mcd.apply(this,arguments)||[];const n=nrmW(q);
 const dw=dictOf().filter(d=>!n||nrmW(d.w).includes(n)).sort((a,b)=>(nrmW(a.w).startsWith(n)?0:1)-(nrmW(b.w).startsWith(n)?0:1)).slice(0,4).map(d=>({k:'dw',id:d.id,name:d.w,sub:'📖 '+(d.cls||'Dicionário')}));
 return [...base.slice(0,Math.max(3,8-dw.length)),...dw]}}
{const _mp=mentionPick;mentionPick=function(){const it=MN&&MN.items&&MN.items[MN.idx];if(!it||it.k!=='dw')return _mp.apply(this,arguments);
 const r=document.createRange();try{r.setStart(MN.node,MN.start);r.setEnd(MN.node,MN.end);r.deleteContents()}catch{}const tn=document.createTextNode(it.name+' ');r.insertNode(tn);
 const s=getSelection(),r2=document.createRange();r2.setStart(tn,tn.length);r2.collapse(true);s.removeAllRanges();s.addRange(r2);mentionClose();markDirty()}}

/* menus e busca */
{const _rv=TBM.rev;TBM.rev=()=>{const b=_rv();const add=[{i:'📖',t:'Adicionar ao dicionário',d:'A palavra selecionada vai para o dicionário do escritor',run:()=>ACT.dictAddSel()}];const i=b.findIndex(x=>x&&x.t==='Localizar');return [...add,...b]}}
{const _cl2=cmdList;cmdList=function(){const L=_cl2.apply(this,arguments);if(ikCtx()!=='project')return L;
 L.push({g:'Mundo',t:'Dicionário do escritor',d:'Palavras inventadas, termos e nomes',run:async()=>{S.cxMode='dict';await showView('codex')},i:'📖',w:'Wiki › Dicionário',k:'glossario palavras inventadas termos'},
  {g:'Mundo',t:'Nova palavra no dicionário',d:'',run:()=>ACT.dictNew(),i:'📖',w:'Wiki › Dicionário',k:'glossario'},
  {g:'Escrever',t:'Adicionar seleção ao dicionário',d:'Selecione a palavra antes',run:()=>ACT.dictAddSel(),i:'📖',w:'Barra › Revisar',k:'glossario palavra inventada'});
 dictOf().forEach(d=>L.push({g:'Dicionário',t:d.w,d:d.def||d.cls||'',run:()=>dictEditDlg(d),i:'📖',dyn:1}));return L}}
