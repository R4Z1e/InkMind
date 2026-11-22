/* ============ v4: escolhas pré-definidas na ficha ============ */
function ensureChoices(f){if(f.type!=='select')return[];if(!Array.isArray(f.choices)){f.choices=String(f.options||'').split(',').map(s=>s.trim()).filter(Boolean).map(n=>({id:uid(),name:n,desc:'',set:{},skills:[],items:[]}));delete f.options}if(f.pick===undefined)f.pick=true;return f.choices}
const choiceById=(f,v)=>v?ensureChoices(f).find(c=>c.id===v||c.name===v):null;
const isRel=s=>/^[+-]\d+([.,]\d+)?$/.test(String(s).trim());
const numOf=s=>parseFloat(String(s).replace(',','.'))||0;
function applySet(tpl,v,set){const F=tplFields(tpl);for(const fid in set||{}){const f=F.find(x=>x.id===fid),raw=set[fid];if(!f||raw===''||raw===null||raw===undefined)continue;
 if(f.type==='bar'){const cur=fieldVal(f,v),max=Math.max(1,isRel(raw)?cur.max+numOf(raw):numOf(raw));v[fid]={cur:max,max}}
 else if(f.type==='number'||f.type==='attr'){const cur=+fieldVal(f,v)||0;v[fid]=isRel(raw)?cur+numOf(raw):numOf(raw)}
 else if(f.type==='check')v[fid]=raw===true||raw==='sim';
 else if(f.type!=='select')v[fid]=raw}}
function buildValues(tpl,picks){const v=defaultValues(tpl);Object.assign(v,cl(tpl.base||{}));const skills=new Set(),inv=[];
 tplFields(tpl).filter(f=>f.type==='select').forEach(f=>{const c=choiceById(f,picks[f.id]);if(!c)return;v[f.id]=c.id;applySet(tpl,v,c.set);(c.skills||[]).forEach(s=>skills.add(s));(c.items||[]).forEach(it=>inv.push({k:uid(),item:it.item,qty:it.qty||1}))});
 return{values:v,skills:[...skills],inv}}
function choiceSummary(tpl,c){const F=tplFields(tpl);const parts=Object.entries(c.set||{}).filter(([,v])=>v!==''&&v!=null).map(([fid,v])=>{const f=F.find(x=>x.id===fid);if(!f)return'';return `${f.label} ${f.type==='bar'?(isRel(v)?v:'máx '+v):(v===true?'✓':v)}`}).filter(Boolean);
 const sk=(c.skills||[]).map(id=>(T.game.skills||[]).find(s=>s.id===id)).filter(Boolean).map(s=>(s.icon||'✨')+' '+s.name);
 const it=(c.items||[]).map(e=>{const i=itemById(e.item);return i?(i.icon||'🎒')+' '+i.name+(e.qty>1?' ×'+e.qty:''):''}).filter(Boolean);
 return[...parts,...sk,...it]}
function fieldHTML(f,vals,opt){
 const ro=opt.ro||(f.master&&!opt.canMaster&&f.type==='bar'),dis=ro?'disabled':'',v=fieldVal(f,vals),lab=`<label>${esc(f.label)}</label>`;
 switch(f.type){
  case'bar':{const pct=v.max?clamp(v.cur/v.max*100,0,100):0;return `<div class="sf sf-bar" data-fid="${f.id}">${lab}<div class="sbar big"><i style="width:${pct}%"></i><em>${v.cur} / ${v.max}</em></div>${ro?'':`<div class="row"><input type="number" data-f="${f.id}" data-p="cur" value="${v.cur}"><span class="muted">/</span><input type="number" data-f="${f.id}" data-p="max" value="${v.max}"></div>`}</div>`}
  case'attr':return `<div class="sf sf-attr" data-fid="${f.id}">${lab}<input type="number" data-f="${f.id}" value="${esc(v)}" ${dis}><span class="mod">${modOf(v)}</span></div>`;
  case'number':return `<div class="sf" data-fid="${f.id}">${lab}<input type="number" data-f="${f.id}" value="${esc(v)}" ${dis}></div>`;
  case'textarea':return `<div class="sf wide" data-fid="${f.id}">${lab}${ro?`<div class="ro-val ro-long" data-ro="1">${esc(v)||'—'}</div>`:`<textarea data-f="${f.id}" rows="3">${esc(v)}</textarea>`}</div>`;
  case'select':{const ch=ensureChoices(f),cur=choiceById(f,v);if(ro)return `<div class="sf sf-choice" data-fid="${f.id}">${lab}<div class="ro-val" data-ro="1">${esc(cur?cur.name:'—')}</div>${cur&&cur.desc?`<small class="muted">${esc(cur.desc)}</small>`:''}</div>`;
   return `<div class="sf" data-fid="${f.id}">${lab}<select data-f="${f.id}"><option value="">—</option>${ch.map(c=>`<option value="${c.id}" ${cur&&cur.id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>`}
  case'check':return `<div class="sf" data-fid="${f.id}"><label class="toggle" style="margin:22px 0 0"><input type="checkbox" data-f="${f.id}" ${v?'checked':''} ${dis}><span class="sw"></span>${esc(f.label)}</label></div>`;
  default:return `<div class="sf" data-fid="${f.id}">${lab}${ro?`<div class="ro-val" data-ro="1">${esc(v)||'—'}</div>`:`<input data-f="${f.id}" value="${esc(v)}">`}</div>`;
 }
}
function updateSheetLive(){
 const s=mySeat(),root=$('#psheet');if(!s||!root)return;
 tplFields(T.game.template).forEach(f=>{const box=root.querySelector(`[data-fid="${f.id}"]`);if(!box)return;const v=fieldVal(f,s.values||{});
  if(f.type==='bar'){box.querySelector('.sbar i').style.width=(v.max?clamp(v.cur/v.max*100,0,100):0)+'%';box.querySelector('.sbar em').textContent=v.cur+' / '+v.max;return}
  const r=box.querySelector('[data-ro]');if(r){r.textContent=f.type==='select'?((choiceById(f,v)||{}).name||'—'):(String(v)||'—');return}
  const i=box.querySelector('[data-f]');if(!i)return;if(f.type==='check')i.checked=!!v;else if(String(i.value)!==String(v))i.value=v;if(f.type==='attr')box.querySelector('.mod').textContent=modOf(v)});
 const sk=$('#pskills');if(sk)sk.innerHTML=skillsHTML(s.skills);
 const n=$('#psName');if(n&&n!==document.activeElement&&n.value!==s.name)n.value=s.name||'';
}
MR.tpl=()=>{const tpl=T.game.template;tpl.sections=tpl.sections||[];tplFields(tpl).forEach(ensureChoices);const chf=tplFields(tpl).filter(f=>f.type==='select');
 if(!T.tplTab||(T.tplTab!=='fields'&&T.tplTab!=='base'&&!chf.some(f=>f.id===T.tplTab)))T.tplTab='fields';
 const tab=T.tplTab;
 const head=`<div class="vh"><div class="grow"><h2>Modelo de ficha</h2><p>Você define tudo. O jogador só escreve o <b>nome</b> e escolhe entre as opções que você liberar (como classe e raça) — o resto vem pronto.</p></div></div>
  <div class="tpltabs"><button data-act="tplTab" data-t="fields" class="${tab==='fields'?'on':''}">🧩 Campos</button><button data-act="tplTab" data-t="base" class="${tab==='base'?'on':''}">📋 Valores iniciais</button>${chf.map(f=>`<button data-act="tplTab" data-t="${f.id}" class="${tab===f.id?'on':''}">${esc(f.label)} <span class="cnt">${f.choices.length}</span></button>`).join('')}</div>`;
 let body='';
 if(tab==='fields'){
  const extra=f=>f.type==='bar'?`<input type="number" data-k="max" value="${f.max||10}" title="Valor máximo" placeholder="máx">`:f.type==='select'?`<button class="btn sm" data-act="tplTab" data-t="${f.id}">${f.choices.length} opções ›</button>`:(f.type==='number'||f.type==='attr')?`<input type="number" data-k="def" value="${f.def??''}" placeholder="padrão">`:`<input data-k="def" value="${esc(f.def??'')}" placeholder="padrão">`;
  body=`<div class="row wrap" style="margin-bottom:14px"><span class="small muted">Começar de um modelo pronto:</span>${Object.entries(TPL_PRESETS).map(([k,v])=>`<button class="btn sm" data-act="tplPreset" data-k="${k}">${v[0]}</button>`).join('')}</div>
  <div class="tpl-grid"><div id="tplEd">${tpl.sections.map((sec,si)=>`<div class="card tsec"><div class="row"><input class="tsec-t" data-si="${si}" value="${esc(sec.title)}"><button class="mini" data-act="tplSec" data-op="up" data-si="${si}" title="Subir">↑</button><button class="mini" data-act="tplSec" data-op="down" data-si="${si}" title="Descer">↓</button><button class="mini" data-act="tplSec" data-op="del" data-si="${si}" title="Excluir seção">✕</button></div>
   ${sec.fields.map((f,fi)=>`<div class="tfield" data-si="${si}" data-fi="${fi}"><input data-k="label" value="${esc(f.label)}" placeholder="Nome do campo"><select data-k="type">${Object.entries(FTYPES).map(([k,l])=>`<option value="${k}" ${f.type===k?'selected':''}>${l}</option>`).join('')}</select>${extra(f)}${f.type==='select'?`<label class="lockck" title="O jogador escolhe ao entrar na mesa"><input type="checkbox" data-k="pick" ${f.pick?'checked':''}>🙋</label>`:'<span></span>'}<span class="tfo"><button class="mini" data-act="tplField" data-op="up" data-si="${si}" data-fi="${fi}">↑</button><button class="mini" data-act="tplField" data-op="down" data-si="${si}" data-fi="${fi}">↓</button><button class="mini" data-act="tplField" data-op="del" data-si="${si}" data-fi="${fi}">✕</button></span></div>`).join('')}
   <button class="btn sm" data-act="tplField" data-op="add" data-si="${si}">${I('plus')} Campo</button></div>`).join('')}
   <button class="btn" data-act="tplSec" data-op="add">${I('plus')} Nova seção</button>
   <p class="small muted">🙋 = o jogador escolhe essa opção ao entrar (ex.: classe, raça). Sem 🙋, você mesmo define pelo painel de status.</p></div>
  <div><div class="small muted" style="margin-bottom:8px">Prévia — como o jogador verá (somente leitura)</div><div class="sheet" id="tplPrev"></div></div></div>`;
 }else if(tab==='base'){
  body=`<div class="notice" style="background:var(--panel2);border-color:var(--line)">Valores que <b>todo</b> personagem recebe antes das escolhas. Depois, cada opção escolhida (classe, raça…) ajusta esses números.</div><div class="sheet" id="tplBase">${sheetHTML({sections:tpl.sections.map(s=>({...s,fields:s.fields.filter(f=>f.type!=='select')}))},Object.assign(defaultValues(tpl),tpl.base||{}),{canMaster:true})}</div>`;
 }else{
  const f=chf.find(x=>x.id===tab);
  body=`<div class="row wrap" style="margin-bottom:12px"><p class="muted" style="margin:0" class="grow">Cada opção de <b>${esc(f.label)}</b> pode definir valores, dar habilidades e itens. Números com <b>+</b> ou <b>−</b> somam (ex.: +2); sem sinal, substituem.</p><span class="sp"></span><label class="toggle" style="margin:0"><input type="checkbox" id="chPick" ${f.pick?'checked':''}><span class="sw"></span>Jogador escolhe ao entrar</label><button class="btn primary" data-act="chOpt" data-fid="${f.id}">${I('plus')} Nova opção</button></div>
   ${f.choices.length?`<div class="ent-list">${f.choices.map(c=>`<button class="ent" data-act="chOpt" data-fid="${f.id}" data-cid="${c.id}"><b>${esc(c.name)}</b><small>${esc(c.desc||'')}</small><div class="at">${choiceSummary(tpl,c).slice(0,8).map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</div></button>`).join('')}</div>`:`<div class="empty"><div class="big">Nenhuma opção ainda</div><p>Crie as opções de ${esc(f.label)} (ex.: Guerreiro, Mago, Ladino…).</p></div>`}`;
 }
 $('#tMain').innerHTML=`<div class="tpad">${head}${body}</div>`;
 if(tab==='fields'){tplPreview();
  $('#tplEd').addEventListener('input',e=>{const t=e.target;
   if(t.classList.contains('tsec-t')){tpl.sections[+t.dataset.si].title=t.value}
   else{const row=t.closest('.tfield');if(!row)return;const f=tpl.sections[+row.dataset.si].fields[+row.dataset.fi],k=t.dataset.k;
    if(k==='pick')f.pick=t.checked;else if(k==='max')f.max=Math.max(1,+t.value||1);else if(k==='def')f.def=t.type==='number'?(t.value===''?undefined:+t.value):t.value;else f[k]=t.value;
    if(k==='type'){delete f.def;if(f.type==='bar'){f.master=true;f.max=f.max||10}if(f.type==='select')ensureChoices(f);saveTpl();MR.tpl();return}}
   saveTplD();tplPreview()});
 }else if(tab==='base'){bindSheet($('#tplBase'),(fid,v)=>{tpl.base=tpl.base||{};tpl.base[fid]=v;saveTplD()})}
 else{$('#chPick').onchange=e=>{chf.find(x=>x.id===tab).pick=e.target.checked;saveTpl()}}
};
function tplPreview(){const el=$('#tplPrev');if(el)el.innerHTML=sheetHTML(T.game.template,buildValues(T.game.template,{}).values,{ro:true})}
ACT.tplTab=el=>{T.tplTab=el.dataset.t;MR.tpl()};
ACT.chOpt=async el=>{const tpl=T.game.template,f=tplFields(tpl).find(x=>x.id===el.dataset.fid);if(!f)return;ensureChoices(f);
 const isNew=!el.dataset.cid,c=isNew?{id:uid(),name:'',desc:'',set:{},skills:[],items:[]}:cl(f.choices.find(x=>x.id===el.dataset.cid));if(!c)return;c.set=c.set||{};c.skills=c.skills||[];c.items=c.items||[];
 const others=tplFields(tpl).filter(x=>x.type!=='select');const g=T.game;
 const inp=x=>{const v=c.set[x.id]??'';if(x.type==='check')return `<select data-s="${x.id}"><option value="" ${v===''?'selected':''}>não muda</option><option value="sim" ${v===true||v==='sim'?'selected':''}>sim</option><option value="nao" ${v==='nao'||v===false?'selected':''}>não</option></select>`;
  if(x.type==='textarea')return `<textarea data-s="${x.id}" rows="2" placeholder="não muda">${esc(v)}</textarea>`;
  return `<input data-s="${x.id}" value="${esc(v)}" placeholder="${x.type==='bar'?'máx ou +N':x.type==='number'||x.type==='attr'?'valor ou +N':'não muda'}">`};
 const res=await modal({title:(isNew?'Nova opção — ':'')+esc(f.label),wide:true,body:`<div class="row wrap"><div class="grow"><label class="f">Nome</label><input id="coN" value="${esc(c.name)}" placeholder="Ex.: Guerreiro" maxlength="60"></div></div>
  <label class="f">Descrição (o jogador lê antes de escolher)</label><textarea id="coD" rows="2">${esc(c.desc)}</textarea>
  <h4 style="margin:16px 0 4px">Valores desta opção</h4><p class="small muted" style="margin:0 0 6px">Deixe em branco o que não muda. +2 soma, 15 substitui.</p>
  <div class="co-grid">${others.map(x=>`<div class="${x.type==='textarea'?'wide':''}"><label class="f" style="margin-top:4px">${esc(x.label)}</label>${inp(x)}</div>`).join('')}</div>
  <div class="grid2" style="margin-top:14px"><div class="card"><h3>Habilidades concedidas</h3>${g.skills.map(s=>`<label class="ckrow"><input type="checkbox" data-sk="${s.id}" ${c.skills.includes(s.id)?'checked':''}> ${esc(s.icon||'✨')} ${esc(s.name)}</label>`).join('')||'<p class="muted small">Crie em Mestre → Habilidades.</p>'}</div>
  <div class="card"><h3>Itens iniciais</h3><div id="coInv"></div>${g.items.length?`<div class="row" style="margin-top:8px"><select id="coItS">${g.items.map(i=>`<option value="${i.id}">${esc(i.icon||'')} ${esc(i.name)}</option>`).join('')}</select><button class="btn sm" id="coItA">Adicionar</button></div>`:'<p class="muted small">Crie em Mestre → Itens.</p>'}</div></div>`,
  onMount:ov=>{const draw=()=>{$('#coInv',ov).innerHTML=c.items.map((e,i)=>{const it=itemById(e.item);return `<div class="row invmini"><span class="grow">${esc(it?it.icon:'❔')} ${esc(it?it.name:'Item removido')}</span><input type="number" min="1" value="${e.qty||1}" data-q="${i}" style="width:70px"><button class="btn sm ghost" data-rm="${i}">✕</button></div>`}).join('')||'<p class="muted small">Nenhum.</p>';
    $$('[data-q]',ov).forEach(x=>x.oninput=()=>{c.items[+x.dataset.q].qty=Math.max(1,+x.value||1)});$$('[data-rm]',ov).forEach(x=>x.onclick=()=>{c.items.splice(+x.dataset.rm,1);draw()})};draw();
   const a=$('#coItA',ov);if(a)a.onclick=()=>{c.items.push({item:$('#coItS',ov).value,qty:1});draw()};
   ov._sync=()=>{c.name=$('#coN',ov).value.trim()||'Sem nome';c.desc=$('#coD',ov).value.trim();c.set={};$$('[data-s]',ov).forEach(i=>{const v=i.value.trim();if(v==='')return;const fd=others.find(x=>x.id===i.dataset.s);c.set[i.dataset.s]=fd&&fd.type==='check'?(v==='sim'):v});c.skills=$$('[data-sk]',ov).filter(i=>i.checked).map(i=>i.dataset.sk)}},
  actions:[...(isNew?[]:[{label:I('trash')+' Excluir',cls:'danger',value:'del'}]),{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>{ov._sync();return 'save'}}]});
 if(!res)return;
 if(res==='del'){if(!await confirmDlg(`Excluir a opção “${esc(c.name)}”?`))return;f.choices=f.choices.filter(x=>x.id!==c.id)}
 else f.choices=isNew?[...f.choices,c]:f.choices.map(x=>x.id===c.id?c:x);
 saveTpl();MR.tpl()};

/* entrada do jogador: só nome + escolhas liberadas */
function renderJoin(){
 const g=T.game,tpl=g.template,avail=g.chars.filter(c=>c.kind==='pregen'&&!T.seats.some(s=>s.from===c.id));const o={emoji:EMOJIS[0],color:COLORS[Math.floor(Math.random()*COLORS.length)]};
 const pickF=tplFields(tpl).filter(f=>f.type==='select'&&f.pick&&ensureChoices(f).length);
 $('#tMain').innerHTML=`<div class="tpad narrow" id="joinBox">${S.canWrite===false?'<div class="notice">Você está com acesso só de leitura. Peça ao mestre para compartilhar o app com você como <b>Colaborador</b> para poder jogar.</div>':''}
  <div class="card"><h3>Criar personagem</h3><p class="muted">A ficha desta campanha foi preparada pelo mestre. Você escolhe o nome${pickF.length?' e '+pickF.map(f=>f.label.toLowerCase()).join(', '):''}.</p>
  ${avail.length?`<label class="f">Começar com</label><div class="pregens"><label><input type="radio" name="pg" value="" checked><span class="tok" style="background:var(--line)">✚</span><span>Criar meu personagem</span></label>${avail.map(c=>`<label><input type="radio" name="pg" value="${c.id}"><span class="tok" style="background:${esc(c.color)}">${esc(c.emoji)}</span><span>${esc(c.name)}</span></label>`).join('')}</div>`:''}
  <label class="f">Nome do personagem</label><input id="jName" placeholder="Ex.: Kael, o Errante" maxlength="60">
  <div id="jPicks">${pickF.map(f=>`<label class="f">${esc(f.label)}</label><div class="choices">${f.choices.map((c,i)=>`<label class="choice"><input type="radio" name="jp_${f.id}" value="${c.id}" ${i===0?'checked':''}><b>${esc(c.name)}</b>${c.desc?`<small>${esc(c.desc)}</small>`:''}<span class="at">${choiceSummary(tpl,c).slice(0,6).map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</span></label>`).join('')}</div>`).join('')}</div>
  <label class="f">Cor do anel no mapa</label><div class="col-grid">${COLORS.map(x=>`<button type="button" class="${x===o.color?'on':''}" data-tkc="${x}" style="background:${x}" aria-label="cor"></button>`).join('')}</div><span id="tkPrev" hidden></span>
  <button class="btn primary" id="jGo" style="width:100%;margin-top:16px;padding:12px">Entrar na mesa</button></div></div>`;
 bindTokenPicker($('#joinBox'),o);
 $$('input[name=pg]').forEach(r=>r.onchange=()=>{const c=g.chars.find(x=>x.id===r.value);$('#jPicks').style.display=c?'none':'';if(c){$('#jName').value=c.name;o.emoji=c.emoji;o.color=c.color;$('#tkPrev').textContent=c.emoji;$('#tkPrev').style.background=c.color}});
 $('#jGo').onclick=()=>joinTable(o);
}
async function joinTable(o){
 const g=T.game,tpl=g.template,pgId=($('input[name=pg]:checked')||{}).value||'',pg=pgId?g.chars.find(c=>c.id===pgId):null;
 const picks={};tplFields(tpl).filter(f=>f.type==='select').forEach(f=>{const r=$(`input[name="jp_${f.id}"]:checked`);if(r)picks[f.id]=r.value});
 const built=pg?{values:cl(pg.values||{}),skills:[...(pg.skills||[])],inv:cl(pg.inv||[])}:buildValues(tpl,picks);
 const nm=$('#jName').value.trim()||(pg&&pg.name)||'Aventureiro';const entry={name:nm,look:pg&&pg.look?cl(pg.look):autoLook(built.values,nm),emoji:o.emoji,color:o.color,values:built.values,skills:built.skills,inv:built.inv,coins:Math.max(0,+(T.game&&T.game.startCoins)||0),cond:[],pos:null,rolls:[],notes:'',from:pgId||null,joined:Date.now()};
 const b=busy('Entrando na mesa…');
 try{if(ACL())await aclJoin();const ref=S.db.doc('seats/'+S.uid),snap=await ref.get();
  if(snap.exists){const d=snap.data();await ref.update({gids:[...new Set([...(d.gids||[]),T.gid])],g:{[T.gid]:entry}})}else await ref.set({uid:S.uid,gids:[T.gid],g:{[T.gid]:entry}});
  T.seats=T.seats.filter(s=>s.uid!==S.uid).concat([{...entry,uid:S.uid,gids:[T.gid]}]);if(T.game.lookFree!==false){T.tab='look';renderSubtabs()}renderTab();renderPanel();toast(T.game.lookFree!==false?'Bem-vindo! Agora monte a aparência do seu personagem.':'Bem-vindo à mesa!')}
 catch(e){console.warn(e);toast(e&&e.code==='acl'?e.message:e&&e.code==='invalid_argument'?(FBAVAIL()?'Sem permissão para entrar nesta mesa. Peça um novo convite ao mestre.':'Sem permissão para entrar. Peça acesso de Colaborador ao mestre.'):'Não foi possível entrar agora.','err')}finally{b.done()}
}
PR.sheet=()=>{const s=mySeat();if(!s)return renderJoin();
 $('#tMain').innerHTML=`<div class="tpad"><div class="sheet-top">${avatarHTML(s,'tok big')}<div class="grow"><label class="f">Nome do personagem</label><input id="psName" value="${esc(s.name||'')}" maxlength="60"></div><button class="btn sm" data-act="tTab" data-t="look">🎭 Aparência</button></div>
  <p class="small muted" style="margin:-4px 0 12px">🔒 A ficha é definida pelo mestre — só o nome é seu.</p>
  <div class="sheet" id="psheet">${sheetHTML(T.game.template,s.values||{},{ro:true})}</div>
  <div class="card"><h3>Habilidades</h3><div id="pskills">${skillsHTML(s.skills)}</div></div>
  <div class="card" style="margin-top:14px"><h3>Anotações pessoais</h3><textarea id="psNotes" rows="4" placeholder="Pistas, nomes, planos… (só você vê)">${esc(s.notes||'')}</textarea></div></div>`;
 $('#psName').oninput=debounce(()=>{seatPatch(S.uid,{name:$('#psName').value});renderPanel()},400);
 $('#psNotes').oninput=debounce(()=>seatPatch(S.uid,{notes:$('#psNotes').value}),600);
};

/* ============ presença: mestre conectado ============ */
S.peers=[];
function setPresence(p){if(S.room)S.room.presence(p).catch(()=>{})}
function masterOnline(gid,mid){if(!S.room)return null;return(S.peers||[]).some(p=>p.by&&p.by===mid&&p.presence&&p.presence.gid===gid&&p.presence.role==='master')}
const playerOnline=uid=>(S.peers||[]).some(p=>p.by===uid&&p.presence&&p.presence.gid===T.gid);
let peersT=null;
function onPeersChange(){clearTimeout(peersT);peersT=setTimeout(()=>{
 if(T.gid&&T.game){if($('#tLobby'))renderLobby();updateMasterPill();if($('#tPanel'))renderPanel()}
 $$('[data-mo]').forEach(el=>{const on=masterOnline(el.dataset.mo,el.dataset.mid);el.textContent=on?'● Mestre online':on===false?'○ Mestre offline':'';el.classList.toggle('on',!!on)});
},250)}
function updateMasterPill(){const el=$('#tMaster');if(!el||!T.game)return;if(T.mode==='master'||!T.entered){el.style.display='none';return}const on=masterOnline(T.gid,T.game.masterId);el.style.display=on===null?'none':'';el.className='mpill '+(on?'on':'');el.textContent=on?'● Mestre conectado':'○ Mestre desconectado'}
function renderLobby(){
 const g=T.game,on=masterOnline(T.gid,g.masterId),me=isMaster();$('#tSub').innerHTML='';$('#tMode').innerHTML='';
 const b=$('#tBody');b.className='tbl-b lobby';
 b.innerHTML=`<main class="tmain"><div class="tpad narrow" id="tLobby"><div class="card lobby">
  ${g.cover?`<img class="lobby-cover" src="${esc(g.cover)}" alt="">`:'<div class="lobby-ic">🎲</div>'}
  <h2>${esc(g.title||'Mesa de jogo')}</h2>${g.synopsis?`<p class="muted">${esc(g.synopsis)}</p>`:''}
  <div class="mstat ${on?'on':''}"><span class="d"></span>${on===null?'Não foi possível verificar se o mestre está conectado':on?'Mestre conectado — pode entrar':'Aguardando o mestre se conectar…'}</div>
  <button class="btn primary" data-act="tEnter" data-as="player" style="width:100%;padding:13px;font-size:15px" ${on||on===null||me?'':'disabled'}>${I('user')} Conectar como jogador</button>
  ${me?`<button class="btn" data-act="tEnter" data-as="master" style="width:100%;padding:12px;margin-top:8px">${I('table')} Conectar como mestre</button>`:''}
  <p class="small muted" style="margin-top:12px">Como jogador você acessa apenas a área de jogador: ficha, mapa, mochila e dados.</p></div></div></main>`;
}
ACT.tEnter=el=>{T.entered=true;T.mode=el.dataset.as==='master'&&isMaster()?'master':'player';T.playerOnly=T.mode==='player'&&!isMaster();setPresence({gid:T.gid,role:T.mode==='master'?'master':'player'});renderTableShell();renderTab();updateMasterPill();handleSession()};

/* ============ conta, apelido e senha do app ============ */
const unlockKey='escritas:unlocked';let memUnlocked=false;
const isUnlocked=()=>{try{return sessionStorage.getItem(unlockKey)==='1'}catch{return memUnlocked}};
const markUnlocked=v=>{memUnlocked=v;try{v?sessionStorage.setItem(unlockKey,'1'):sessionStorage.removeItem(unlockKey)}catch{}};
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const prof=()=>S.prefs.profile||(S.prefs.profile={nick:'',emoji:'🖋️',color:COLORS[0],bio:''});
const myName=()=>prof().nick||(S.me&&S.me.name)||'Você';
function accountChip(){const p=prof();return `<button class="acct" data-act="account" title="Minha conta"><span class="tok" style="background:${esc(p.color)};width:28px;height:28px;font-size:15px">${esc(p.emoji)}</span><span class="hide-m">${esc(myName())}</span>${S.prefs.lock?'🔒':''}</button>`}
ACT.account=async()=>{const p=prof(),o={emoji:p.emoji,color:p.color};
 const v=await modal({title:'Minha conta',wide:true,body:`<div class="notice" style="background:var(--panel2);border-color:var(--line)">${VISITOR()?`Você está como <b>visitante</b> (${esc(S.me&&S.me.name||'')}): joga em mesas abertas, mas não escreve livros nem mestra. <a href="#" data-act="inkLogin">Criar conta grátis</a> — suas fichas nas mesas continuam com você. · <a href="#" data-act="inkLogout">Sair</a>`:FBM()&&INK.user?`Você está na sua conta do Inkmind (<b>${esc(INK.user.email||S.me&&S.me.name||'')}</b>) — seus projetos ficam salvos na nuvem e só você os vê. <a href="#" data-act="inkLogout">Sair da conta</a> · <a href="#" data-act="inkDelete">Excluir minha conta</a>`:FBAVAIL()?`Você está usando o Inkmind <b>sem conta</b>: tudo fica salvo só neste navegador. <a href="#" data-act="inkLogin">Entrar ou criar conta</a>`:`Você entra no Inkmind com a sua conta do claude.ai${S.me&&S.me.name?` (<b>${esc(S.me.name)}</b>)`:''} — por isso seus projetos ficam só seus, em qualquer aparelho.`} Aqui você define como aparece para os outros e uma senha extra para abrir o app.</div>
  <label class="f">Apelido público (aparece como autor nas publicações e na mesa)</label><input id="acN" value="${esc(p.nick)}" maxlength="40" placeholder="${esc(S.me&&S.me.name||'Seu nome de autor')}">
  <label class="f">Ícone</label>${tokenPickerHTML(o.emoji,o.color)}
  <label class="f">Sobre você</label><textarea id="acB" rows="2" placeholder="Escritor de fantasia, mestre de RPG às sextas…">${esc(p.bio)}</textarea>
  <h3 style="margin:18px 0 4px;font:600 16px var(--disp)">🔒 Senha do aplicativo</h3><p class="small muted" style="margin:0 0 8px">${S.prefs.lock?'Ativa: o app pede a senha sempre que é aberto numa nova aba ou aparelho.':'Desativada. Com senha, o app pede a senha ao ser aberto — útil em aparelhos compartilhados.'}</p>
  <div class="row wrap"><button class="btn" data-v="pw">${S.prefs.lock?'Trocar senha':'Criar senha'}</button>${S.prefs.lock?'<button class="btn ghost danger" data-v="rmpw">Remover senha</button><button class="btn ghost" data-v="lock">Bloquear agora</button>':''}</div>`,
  onMount:(ov,close)=>{bindTokenPicker(ov,o);$$('[data-v]',ov).forEach(b=>b.onclick=()=>{ov._save();close(b.dataset.v)});ov._save=()=>{p.nick=$('#acN',ov).value.trim();p.bio=$('#acB',ov).value.trim();p.emoji=o.emoji;p.color=o.color;savePrefs()}},
  actions:[...(FBAVAIL()&&window.INK&&INK.user?[{label:'⎋ Sair da conta',cls:'ghost',onClick:()=>{setTimeout(()=>ACT.inkLogout(),60);return 'logout'}}]:[]),{label:'Fechar'},{label:'Salvar',cls:'primary',onClick:ov=>{ov._save();toast('Conta atualizada');return 'ok'}}]});
 if(v==='pw')return setPassword();
 if(v==='rmpw'){if(await confirmDlg('Remover a senha do aplicativo?','Remover')){S.prefs.lock=null;savePrefs();toast('Senha removida')}}
 if(v==='lock'){markUnlocked(false);closeTable();renderLock();return}
 if(!S.P&&!T.gid&&$('.home'))renderHome();
};
async function setPassword(){
 const v=await modal({title:'Senha do aplicativo',body:`<label class="f">Nova senha (mínimo 4 caracteres)</label><input type="password" id="pw1" autocomplete="new-password"><label class="f">Repita a senha</label><input type="password" id="pw2" autocomplete="new-password"><p class="small muted">Guarde bem: se esquecer, dá para redefinir pela sua conta do claude.ai, mas a trava existe para que outra pessoa no mesmo aparelho não abra seus projetos sem querer.</p>`,
  actions:[{label:'Cancelar'},{label:'Salvar senha',cls:'primary',onClick:ov=>{const a=$('#pw1',ov).value,b=$('#pw2',ov).value;if(a.length<4){toast('Use pelo menos 4 caracteres.','err');return false}if(a!==b){toast('As senhas não conferem.','err');return false}return a}}]});
 if(!v)return;const salt=uid()+uid();S.prefs.lock={salt,hash:await sha(salt+v)};savePrefs();markUnlocked(true);toast('Senha criada');if($('.home'))renderHome();
}
function renderLock(){
 const p=prof();$('#app').innerHTML=`<div class="lockscr"><div class="card lockcard"><img class="lock-logo" src="img/logo.webp" alt="Inkmind">
  <span class="tok big" style="background:${esc(p.color)};margin:0 auto">${esc(p.emoji)}</span><h3 style="text-align:center;margin:12px 0 2px">Olá, ${esc(myName())}</h3><p class="muted small" style="text-align:center;margin:0 0 14px">Digite a senha do aplicativo para continuar.</p>
  <form id="lkF"><input type="password" id="lkP" placeholder="Senha" autocomplete="current-password"><button class="btn primary" style="width:100%;margin-top:10px;padding:12px">Entrar</button></form>
  <button class="btn ghost sm" id="lkForgot" style="width:100%;margin-top:8px">Esqueci a senha</button></div></div>`;
 setTimeout(()=>$('#lkP')&&$('#lkP').focus(),50);
 $('#lkF').onsubmit=async e=>{e.preventDefault();const L=S.prefs.lock;if(!L){markUnlocked(true);return renderHome()}if(await sha(L.salt+$('#lkP').value)===L.hash){markUnlocked(true);renderHome()}else{toast('Senha incorreta.','err');$('#lkP').select()}};
 $('#lkForgot').onclick=async()=>{if(await confirmDlg('Redefinir a senha? Como você já está na sua conta do claude.ai, a senha antiga será removida e você pode criar outra em “Minha conta”.','Redefinir')){S.prefs.lock=null;savePrefs();markUnlocked(true);renderHome();toast('Senha removida — crie uma nova em Minha conta')}};
}

/* ============ gerador de imagens externo (site ou chat de IA) ============ */
const IMG_STYLES=['fantasia sombria','pintura a óleo','aquarela','retrato de personagem','mapa visto de cima','ícone de token redondo','capa de livro','pixel art'];
async function genImage(){
 let result=null,onPaste=null;
 await modal({title:'🎨 Gerar imagem com IA',wide:true,body:`
  <div id="giCfg" class="card" style="display:${(S.prefs.imageGen||{}).url?'none':'block'};margin-bottom:12px"><h3>Seu gerador de imagens</h3><p class="small muted" style="margin:0 0 6px">Cole o endereço do site ou chat de IA que você usa para criar imagens. Se o site aceitar a descrição no endereço, escreva <code>{prompt}</code> no lugar dela.</p>
   <div class="row wrap"><input id="giU" placeholder="https://seu-gerador.com/criar?q={prompt}" value="${esc((S.prefs.imageGen||{}).url||'')}" style="flex:2;min-width:220px"><input id="giN" placeholder="Nome (ex.: Meu gerador)" value="${esc((S.prefs.imageGen||{}).name||'')}" style="flex:1;min-width:140px"><button class="btn primary" id="giSave">Salvar</button></div></div>
  <label class="f" style="margin-top:0">Descreva a imagem</label><textarea id="giP" rows="3" placeholder="Ex.: retrato de uma elfa arqueira de capa verde, floresta sombria ao fundo, luz de tochas"></textarea>
  <div class="chips" style="margin:8px 0">${IMG_STYLES.map(s=>`<button class="chip" data-st="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div>
  <div class="row wrap">${S.sample?'<button class="btn" id="giAI">✨ Melhorar descrição com IA</button>':''}<span class="sp"></span><button class="btn ghost sm" id="giCfgB">⚙ Endereço do gerador</button><a class="btn primary" id="giGo" target="_blank" rel="noopener noreferrer" href="#">Abrir gerador ↗</a></div>
  <p class="small muted">O gerador abre numa nova aba (sites externos não podem rodar dentro do app) e a descrição é copiada. Quando a imagem ficar pronta, copie ou baixe e traga de volta:</p>
  <div class="drop" id="giDrop"><b>Cole a imagem aqui (Ctrl+V / colar)</b><br>ou toque para escolher o arquivo baixado</div>`,
  onMount:(ov,close)=>{
   const P_=$('#giP',ov),go=$('#giGo',ov);
   const upd=()=>{const c=S.prefs.imageGen||{},u=(c.url||'').trim(),q=P_.value.trim();go.href=u?(u.includes('{prompt}')?u.split('{prompt}').join(encodeURIComponent(q)):u):'#';go.textContent='Abrir '+(c.name||'gerador')+' ↗';go.classList.toggle('disabled',!u)};
   P_.oninput=upd;$$('[data-st]',ov).forEach(b=>b.onclick=()=>{P_.value=(P_.value.trim()?P_.value.trim()+', ':'')+b.dataset.st;upd()});
   $('#giCfgB',ov).onclick=()=>{const c=$('#giCfg',ov);c.style.display=c.style.display==='none'?'block':'none'};
   $('#giSave',ov).onclick=()=>{const u=$('#giU',ov).value.trim();if(!/^https?:\/\//i.test(u)){toast('O endereço precisa começar com https://','err');return}S.prefs.imageGen={url:u,name:$('#giN',ov).value.trim()};savePrefs();$('#giCfg',ov).style.display='none';upd();toast('Gerador salvo')};
   go.onclick=e=>{if(!(S.prefs.imageGen||{}).url){e.preventDefault();$('#giCfg',ov).style.display='block';toast('Configure o endereço do gerador primeiro.');return}const q=P_.value.trim();if(q)try{navigator.clipboard.writeText(q).then(()=>toast('Descrição copiada — cole no gerador se precisar'),()=>{})}catch{}};
   const ai=$('#giAI',ov);if(ai)ai.onclick=async()=>{const q=P_.value.trim();if(!q){toast('Escreva uma ideia primeiro.');return}ai.disabled=true;ai.textContent='✨ Escrevendo…';
    try{const r=await S.sample(`Você escreve prompts para geradores de imagem por IA. Transforme a ideia abaixo em UM prompt em inglês, rico em detalhes visuais (assunto, estilo artístico, iluminação, composição, paleta), com no máximo 70 palavras. Responda apenas com o prompt, sem aspas nem comentários.\n\nIdeia: ${q}`,{modelTier:'quick'});if(r&&r.text){P_.value=r.text.trim();upd()}}
    catch(e){toast(e&&e.code==='rate_limited'?'Muitos pedidos — tente em instantes.':'Não consegui melhorar agora.','err')}finally{ai.disabled=false;ai.textContent='✨ Melhorar descrição com IA'}};
   const take=async f=>{const b=busy('Guardando imagem…');try{const r=await storeImage(f);if(P())addToGallery((P_.value.trim()||'Imagem gerada').slice(0,40),r);result=r;toast('Imagem adicionada'+(P()?' à galeria':''));close('ok')}catch(er){toast(er.message||'Falha ao guardar','err')}finally{b.done()}};
   bindDrop($('#giDrop',ov),'image/*',false,fs=>take(fs[0]));
   onPaste=e=>{const f=[...((e.clipboardData&&e.clipboardData.files)||[])].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();take(f)}};document.addEventListener('paste',onPaste);
   upd();},
  actions:[{label:'Fechar'}]});
 if(onPaste)document.removeEventListener('paste',onPaste);
 return result;
}
ACT.genImg=async()=>{const r=await genImage();if(r&&S.P&&S.view==='gallery')RENDER.gallery()};

/* ============ publicar e biblioteca ============ */
async function publishProject(){
 const p=P();if(S.backend!=='cloud'||!S.uid){toast('Publicar só funciona '+CLOUD_NEED()+'.','err');return}
 await flushChapter();ensureOutline(p);const b=busy('Publicando…');
 try{
  const base='pubs/'+S.uid,bp=base+'/books/'+p.id;const order=bookOrder();const toc=[];let lastF=null,words=0;
  let prev=[];try{const ps=await S.db.doc(bp).get();if(ps.exists)prev=(ps.data().toc||[]).map(t=>t.id)}catch{}
  for(let i=0;i<order.length;i++){const o=order[i],c=cm(o.id);b.set(`Publicando capítulo ${i+1} de ${order.length}…`);const d=await getChapter(o.id);const html=clean(d.html||'');
   const fid=o.folder?o.folder.id:null;toc.push({id:o.id,title:c.title||'Sem título',...(chKick(c)!=null?{kick:chKick(c)}:{}),part:fid&&fid!==lastF?o.folder.title:null});lastF=fid;words+=c.words||0;
   try{await S.db.doc(bp+'/ch/'+o.id).set({title:c.title||'',html,n:i+1})}catch(e){if(e&&e.code==='invalid_argument')throw new Error(`O capítulo “${c.title}” é grande demais para publicar (limite ~250 KB). Divida-o em dois.`);throw e}}
  for(const id of prev)if(!toc.some(t=>t.id===id))await S.db.doc(bp+'/ch/'+id).delete().catch(()=>{});
  const s=p.settings;const author=p.author||myName();
  await S.db.doc(bp).set({id:p.id,kind:p.type==='rpg'?'rpg':'book',title:p.title,author,synopsis:p.synopsis||'',cover:p.cover||null,genre:p.genre||'',settings:{bodyFont:s.bodyFont,headFont:s.headFont,fontSize:s.fontSize,lineHeight:s.lineHeight,paraStyle:s.paraStyle,align:s.align,dropcap:s.dropcap},toc,updatedAt:Date.now()});
  const sum={id:p.id,kind:p.type==='rpg'?'rpg':'book',title:p.title,author,genre:p.genre||'',synopsis:(p.synopsis||'').slice(0,400),cover:p.cover||null,chapters:toc.length,words,updatedAt:Date.now()};
  const idx=S.db.doc(base),is=await idx.get();if(is.exists)await idx.update({items:{[p.id]:sum}});else await idx.set({uid:S.uid,items:{[p.id]:sum}});
  if(p.type==='rpg'){const gr=S.db.doc('games/'+p.id);try{const gs=await gr.get();if(gs.exists)await gr.update({published:true,title:p.title,synopsis:p.synopsis||'',cover:p.cover||null,genre:p.genre||''});else await gr.set({kind:'game',id:p.id,title:p.title,masterId:S.uid,createdAt:Date.now(),template:presetTpl('classico'),chars:[],skills:[],items:[],activeMap:null,mrolls:[],published:true,synopsis:p.synopsis||'',cover:p.cover||null,genre:p.genre||''})}catch(e){toast('O livro foi publicado, mas a mesa de jogo precisa do dono do app para ser aberta ao público.','err')}}
  p.published={at:Date.now()};saveProject();toast(p.type==='rpg'?'Campanha publicada! Ela aparece na busca de RPG.':'Livro publicado na Biblioteca!');
 }catch(e){console.warn(e);toast(e.message||'Não foi possível publicar agora.','err')}finally{b.done()}
}
async function unpublishProject(p,silent){
 if(S.backend!=='cloud')return;const base='pubs/'+S.uid,bp=base+'/books/'+p.id;
 try{const ps=await S.db.doc(bp).get();if(ps.exists){for(const t of ps.data().toc||[])await S.db.doc(bp+'/ch/'+t.id).delete().catch(()=>{});await S.db.doc(bp).delete()}
  const idx=await S.db.doc(base).get();if(idx.exists)await S.db.doc(base).update({items:{[p.id]:null}});
  if(p.type==='rpg')await S.db.doc('games/'+p.id).update({published:false}).catch(()=>{});
  p.published=null;if(S.P&&S.P.id===p.id)saveProject();if(!silent)toast('Publicação removida')}catch(e){console.warn(e);if(!silent)toast('Não consegui despublicar agora.','err')}
}
ACT.pubDo=async()=>{await publishProject();RENDER.export()};
ACT.pubUndo=async()=>{if(!await confirmDlg('Tirar este projeto da Biblioteca? Ele continua na sua estante.','Despublicar'))return;await unpublishProject(P());RENDER.export()};
ACT.explore=async()=>{if(S.P){await flushChapter();saveProject.flush()}closeTable();T.gid=null;renderExplore()};
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
async function renderExplore(){
 S.P=null;S.cid=null;document.body.classList.remove('focus');S.exK=S.exK||'all';
 $('#app').innerHTML=`<div class="home"><header class="home-h"><button class="btn ghost sm" data-act="home">${I('back')}<span class="hide-m">Estante</span></button><div class="brand" style="font-size:19px"><img class="brand-mark" src="img/mark.webp" alt="">Biblioteca</div><div class="sp"></div>${accountChip()}</header>
  <section class="hero"><h1>Explorar</h1><p>Livros e campanhas de RPG publicados no Inkmind.</p>
  <div class="row wrap"><input id="exq" placeholder="🔎 Buscar por título, autor ou gênero…" style="max-width:440px" value="${esc(S.exQ||'')}"><div class="seg" id="exK">${[['all','Todos'],['book','📖 Livros'],['rpg','🎲 RPG']].map(([k,l])=>`<button data-k="${k}" class="${S.exK===k?'on':''}">${l}</button>`).join('')}</div></div></section>
  <div class="shelf" id="exList"><div class="empty" style="grid-column:1/-1"><div class="spin" style="margin:0 auto 10px"></div>Carregando publicações…</div></div></div>`;
 $('#exq').oninput=debounce(()=>{S.exQ=$('#exq').value;drawExplore()},200);
 $$('#exK button').forEach(b=>b.onclick=()=>{S.exK=b.dataset.k;$$('#exK button').forEach(x=>x.classList.toggle('on',x===b));drawExplore()});
 if(S.backend!=='cloud'){$('#exList').innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="big">Biblioteca indisponível</div><p>${FBAVAIL()?'<a href="#" data-act="inkLogin">Entre na sua conta do Inkmind</a>':'Abra o app no claude.ai'} para ver e publicar livros e RPGs.</p></div>`;return}
 if(S.pubs&&S._pubsAt&&Date.now()-S._pubsAt<180000){}else try{const snap=await withTimeout(S.db.collection('pubs').get(),15000);S._pubsAt=Date.now();const items=[];snap.docs.forEach(d=>{const it=(d.data()||{}).items||{};for(const k in it)if(it[k])items.push({...it[k],owner:d.id})});S.pubs=items.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))}
 catch(e){console.warn(e);S.pubs=[]}
 drawExplore();
}
function drawExplore(){const box=$('#exList');if(!box||!S.pubs)return;const q=norm(S.exQ),k=S.exK;
 const L=S.pubs.filter(p=>(k==='all'||p.kind===k)&&(!q||norm(p.title+' '+p.author+' '+p.genre+' '+p.synopsis).includes(q)));
 box.innerHTML=L.length?L.map(p=>`<div class="book" data-act="pubOpen" data-o="${esc(p.owner)}" data-id="${esc(p.id)}">
   <div class="cover ${p.cover?'hasimg':''}" style="${coverStyle(p)}">${p.cover?`<img src="${esc(p.cover)}" alt="">`:''}<div class="ct">${esc(p.title)}</div><div class="ca">${esc(p.author||'')}</div></div>
   <div class="book-meta"><b>${esc(p.title)}</b><span class="pill">${p.kind==='rpg'?'🎲 RPG':'📖 Livro'}</span>${p.genre?`<span class="pill">${esc(p.genre)}</span>`:''}${p.kind==='rpg'?`<span class="pill mo" data-mo="${esc(p.id)}" data-mid="${esc(p.owner)}"></span>`:`<span class="pill">${p.chapters||0} cap.</span>`}${p.owner===S.uid?'<span class="pill">seu</span>':''}</div></div>`).join('')
  :`<div class="empty" style="grid-column:1/-1"><div class="big">${S.pubs.length?'Nada encontrado':'Nada publicado ainda'}</div><p>${S.pubs.length?'Tente outra busca.':'Publique um livro ou campanha em Exportar → Publicar.'}</p></div>`;
 onPeersChange();
}
ACT.pubOpen=async el=>{const p=(S.pubs||[]).find(x=>x.owner===el.dataset.o&&x.id===el.dataset.id);if(!p)return;const on=p.kind==='rpg'?masterOnline(p.id,p.owner):null;
 const v=await modal({title:esc(p.title),wide:true,body:`<div class="row" style="align-items:flex-start;gap:16px;flex-wrap:wrap"><div style="width:130px;flex:none"><div class="cover ${p.cover?'hasimg':''}" style="${coverStyle(p)};padding:10px">${p.cover?`<img src="${esc(p.cover)}" alt="">`:''}<div class="ct" style="font-size:14px">${esc(p.title)}</div></div></div>
  <div class="grow" style="min-width:200px"><p style="margin:0 0 6px"><b>${esc(p.author||'Autor desconhecido')}</b></p><div class="row wrap" style="gap:6px;margin-bottom:8px"><span class="pill">${p.kind==='rpg'?'🎲 Campanha de RPG':'📖 Livro'}</span>${p.genre?`<span class="pill">${esc(p.genre)}</span>`:''}<span class="pill">${p.chapters||0} ${p.kind==='rpg'?'seções':'capítulos'}</span><span class="pill">${fmtK(p.words||0)} palavras</span></div>
  <p class="muted">${esc(p.synopsis||'Sem sinopse.')}</p>${p.kind==='rpg'?`<div class="mstat ${on?'on':''}"><span class="d"></span>${on===null?'Status do mestre indisponível':on?'Mestre conectado agora':'Mestre offline — você poderá entrar quando ele se conectar'}</div>`:''}</div></div>`,
  actions:[{label:'Fechar'},{label:'📖 Ler',cls:p.kind==='rpg'?'':'primary',value:'read'},...(p.kind==='rpg'?[{label:'🎲 Ir para a mesa',cls:'primary',value:'play'}]:[])]});
 if(v==='read')renderReader(p.owner,p.id,0);if(v==='play')openTable(p.id,{fromExplore:true})};
const RD={};
async function renderReader(owner,pid,idx){
 const b=busy('Abrindo…');let book=null;try{const s=await S.db.doc(`pubs/${owner}/books/${pid}`).get();book=s.exists?s.data():null}catch{}finally{b.done()}
 if(!book){toast('Esta publicação não está mais disponível.','err');return}
 Object.assign(RD,{owner,pid,book,idx:idx||0});const s=book.settings||{};[s.bodyFont,s.headFont].forEach(f=>f&&loadFont(f));
 $('#app').innerHTML=`<div class="reader"><header class="home-h"><button class="btn ghost sm" data-act="explore">${I('back')}<span class="hide-m">Biblioteca</span></button><div class="grow" style="min-width:0"><b class="rd-h">${esc(book.title)}</b><small class="muted">${esc(book.author||'')}</small></div><select id="rdCh" style="width:auto;max-width:46vw">${(book.toc||[]).map((c,i)=>`<option value="${i}">${c.part?esc(c.part)+' · ':''}${i+1}. ${esc(c.title)}</option>`).join('')}</select></header>
  <div class="rd-scroll" id="rdScroll"><article class="paper rd-paper" id="rdPaper"><div class="ch-kicker" id="rdK"></div><h1 class="rd-title" id="rdT"></h1><div class="prose" id="rdBody"></div>
  <div class="rd-nav"><button class="btn" id="rdPrev">← Anterior</button><button class="btn primary" id="rdNext">Próximo →</button></div></article></div></div>`;
 const paper=$('#rdPaper');paper.style.setProperty('--bf',fontStack(s.bodyFont||'Literata'));paper.style.setProperty('--hf',fontStack(s.headFont||'Playfair Display'));paper.style.setProperty('--fs',(s.fontSize||18)+'px');paper.style.setProperty('--lh',s.lineHeight||1.7);paper.style.setProperty('--align',s.align||'justify');
 $('#rdBody').classList.toggle('web',s.paraStyle==='web');$('#rdBody').classList.toggle('dropcap',!!s.dropcap);
 $('#rdCh').onchange=e=>showReaderCh(+e.target.value);$('#rdPrev').onclick=()=>showReaderCh(RD.idx-1);$('#rdNext').onclick=()=>showReaderCh(RD.idx+1);
 showReaderCh(RD.idx);
}
async function showReaderCh(i){const toc=RD.book.toc||[];if(!toc.length){$('#rdBody').innerHTML='<p class="muted">Sem capítulos.</p>';return}i=clamp(i,0,toc.length-1);RD.idx=i;const t=toc[i];
 $('#rdK').textContent=(t.part?t.part+' · ':'')+(t.kick!=null?t.kick:(RD.book.kind==='rpg'?'Seção ':'Capítulo ')+(RD.book.toc.slice(0,i+1).filter(x=>x.kick==null).length));$('#rdT').textContent=t.title;$('#rdBody').innerHTML='<p class="muted">Carregando…</p>';$('#rdCh').value=i;$('#rdPrev').disabled=i===0;$('#rdNext').disabled=i===toc.length-1;$('#rdScroll').scrollTop=0;
 try{const s=await S.db.doc(`pubs/${RD.owner}/books/${RD.pid}/ch/${t.id}`).get();if(RD.idx!==i)return;$('#rdBody').innerHTML=s.exists?clean(s.data().html||'')||'<p class="muted">Capítulo vazio.</p>':'<p class="muted">Capítulo indisponível.</p>'}catch{$('#rdBody').innerHTML='<p class="muted">Não consegui carregar.</p>'}}
