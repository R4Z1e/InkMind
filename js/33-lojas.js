/* ============ v38: Lojas da mesa ============
   Mestre → Preparar → Lojas: várias lojas (mercado, ferreiro, botica…), cada uma com itens, preço, estoque,
   vendedor, descrição e quanto paga pelos itens dos jogadores. Aberta = aparece para os jogadores na aba
   "Loja" (e no botão 🏪 da tela de jogo). As compras usam as moedas da mochila (seat.coins).
   Dados: T.game.shops=[{id,name,icon,keeper,desc,open,ratio,items:[{item,price,stock}]}] (stock 999 = sem limite),
   T.game.coinName, T.game.startCoins. A loja antiga (T.game.shop, uma só) é lida como a primeira loja. */
ICONS.shop=ICONS.shop||'<path d="M3 9l1.6-5h14.8L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>';
MT.shop=['Lojas','shop'];
{const e=Object.entries(PT).filter(([k])=>k!=='shop');Object.keys(PT).forEach(k=>delete PT[k]);for(const [k,v] of e){PT[k]=v;if(k==='bag')PT.shop=['Loja','shop']}if(!PT.shop)PT.shop=['Loja','shop']}
try{const prep=MTG.find(x=>x[0]==='Preparar');if(prep&&!prep[1].includes('shop'))prep[1].splice(prep[1].indexOf('items')+1,0,'shop')}catch{}
const COIN=()=>(T.game&&String(T.game.coinName||'').trim())||'moedas';
const INF=999;
function shopsOf(g){g=g||T.game;if(!g)return [];if(Array.isArray(g.shops))return g.shops;
 if(g.shop&&(g.shop.name||(g.shop.items||[]).length))return [{id:'main',icon:'🏪',keeper:'',desc:'',ratio:(g.rules&&g.rules.sellRatio!=null)?g.rules.sellRatio:.5,...cl(g.shop)}];return []}
const shopsOpen=()=>(T.game&&MOD('shop'))?shopsOf().filter(s=>s.open):[];
const shopRatio=sh=>sh&&sh.ratio!=null?+sh.ratio:RSET().sellRatio;
function saveShops(list,extra){gamePatch({shops:cl(list),shop:null,...(extra||{})})}
const sellPrice=(sh,item)=>{const e=(sh.items||[]).find(x=>x.item===item),it=itemById(item);return Math.floor((e?+e.price:priceOf(it))*shopRatio(sh))};
/* ---------- jogador: comprar e vender ---------- */
function shopBuy(sid,item){const s=mySeat(),sh=shopsOpen().find(x=>x.id===sid);if(!s||!sh){toast('Esta loja fechou.');return}
 const e=(sh.items||[]).find(x=>x.item===item),it=itemById(item);if(!e||!it)return;const coins=+s.coins||0,price=Math.max(0,+e.price||0);
 if(e.stock<=0){toast('Esgotado.');return}if(coins<price){toast(`Faltam ${price-coins} ${COIN()}.`,'err');return}
 const inv=cl(s.inv||[]),ex=inv.find(x=>x.item===item&&!x.eq);if(ex)ex.qty++;else inv.push({k:uid(),item,qty:1});
 seatPatch(S.uid,{inv,coins:coins-price});T.shopHold=(T.shopHold||0)+1;setTimeout(()=>{T.shopHold--},1500);
 pushAct({type:'shop',mode:'buy',sid,item,price});toast(`🛍 Comprou ${it.name}!`);try{sClack(0)}catch{}}
function shopSell(sid,k){const s=mySeat(),sh=shopsOpen().find(x=>x.id===sid);if(!s||!sh)return;const inv=cl(s.inv||[]),ex=inv.find(x=>x.k===k);if(!ex||ex.eq)return;
 const it=itemById(ex.item),p=sellPrice(sh,ex.item);ex.qty--;seatPatch(S.uid,{inv:inv.filter(x=>x.qty>0),coins:(+s.coins||0)+p});
 pushAct({type:'shop',mode:'sell',sid,item:ex.item,price:p});toast(`💰 Vendeu ${it?it.name:'item'} por ${p} ${COIN()}`)}
/* mestre recebe a compra/venda: atualiza o estoque e anota no registro da sessão */
function shopApplyAct(s,a){const list=cl(shopsOf()),sh=list.find(x=>x.id===(a.sid||'main'))||list[0],it=itemById(a.item);
 if(sh){const e=(sh.items||[]).find(x=>x.item===a.item);if(e&&e.stock<INF){if(a.mode==='buy'&&e.stock>0)e.stock--;else if(a.mode==='sell')e.stock++;saveShops(list)}}
 const txt=`🏪 ${s.name} ${a.mode==='buy'?'comprou':'vendeu'} ${it?it.name:'um item'}${sh?(a.mode==='buy'?' em ':' para ')+sh.name:''} por ${a.price} ${COIN()}`;
 logAdd(txt);if(T.view!=='play')toast(txt)}
function shopViewHTML(sh){const s=mySeat(),coins=+s.coins||0,ratio=shopRatio(sh),tab=ratio>0?(T.shopTab||'buy'):'buy';
 const head=`<div class="shop-h"><span class="shop-ic">${esc(sh.icon||'🏪')}</span><div class="grow"><b>${esc(sh.name||'Loja')}</b>${sh.keeper?`<small>Atendido por ${esc(sh.keeper)}</small>`:''}${sh.desc?`<p>${esc(sh.desc)}</p>`:''}</div></div>`;
 const seg=ratio>0?`<div class="seg shop-seg"><button data-sht="buy" class="${tab==='buy'?'on':''}">Comprar</button><button data-sht="sell" class="${tab==='sell'?'on':''}">Vender</button></div>`:'';
 let body;
 if(tab==='buy')body=(sh.items||[]).map(e=>{const it=itemById(e.item);if(!it)return '';const out=e.stock<=0,poor=coins<e.price;
  return `<div class="shop-it ${out?'out':''}">${entIcon(it,'🎒')}<div class="grow"><b>${esc(it.name)}</b><small>${esc([it.type,it.effect,it.weight?'peso '+it.weight:''].filter(Boolean).join(' · '))}</small>${it.desc?`<p>${esc(it.desc)}</p>`:''}</div>
   <div class="shop-buy"><span class="shop-price">💰 ${+e.price||0}</span>${e.stock<INF?`<small>${out?'esgotado':'restam '+e.stock}</small>`:''}<button class="btn sm ${out||poor?'':'primary'}" data-buy="${e.item}" ${out||poor?'disabled':''}>${out?'Esgotado':poor?'Faltam '+(e.price-coins):'Comprar'}</button></div></div>`}).join('')||'<p class="muted">Nada à venda por enquanto.</p>';
 else body=(s.inv||[]).filter(e=>!e.eq).map(e=>{const it=itemById(e.item);if(!it||isNatural(it))return '';const p=sellPrice(sh,e.item);
  return `<div class="shop-it">${entIcon(it,'🎒')}<div class="grow"><b>${esc(it.name)}</b> <span class="pill">×${e.qty}</span><small>${esc(it.type||'')}</small></div><div class="shop-buy"><span class="shop-price">+${p}</span><button class="btn sm" data-sell="${e.k}">Vender</button></div></div>`}).join('')||`<p class="muted">Nada para vender (itens equipados não aparecem). ${esc(sh.name||'A loja')} paga ${Math.round(ratio*100)}% do preço.</p>`;
 return head+seg+`<div class="shop-list">${body}</div>`}
function shopPanelHTML(){const list=shopsOpen(),s=mySeat();if(!list.find(x=>x.id===T.shopSel))T.shopSel=list[0]&&list[0].id;const sh=list.find(x=>x.id===T.shopSel);
 return `<div class="shop-top"><div class="shop-purse">💰 <b>${+s.coins||0}</b> ${esc(COIN())}</div>${list.length>1?`<div class="shop-pick">${list.map(x=>`<button data-shp="${x.id}" class="${x.id===T.shopSel?'on':''}">${esc(x.icon||'🏪')} ${esc(x.name||'Loja')}</button>`).join('')}</div>`:''}</div>${sh?shopViewHTML(sh):''}`}
function shopBind(root,redraw){root.onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled||!root.contains(b))return;
 if(b.dataset.shp){T.shopSel=b.dataset.shp;T.shopTab='buy'}else if(b.dataset.sht)T.shopTab=b.dataset.sht;
 else if(b.dataset.buy)shopBuy(T.shopSel,b.dataset.buy);else if(b.dataset.sell)shopSell(T.shopSel,b.dataset.sell);else return;
 setTimeout(redraw,40)}}
PR.shop=()=>{const s=mySeat();if(!s)return renderJoin();const m=$('#tMain');
 if(!shopsOpen().length){m.innerHTML=`<div class="tpad narrow"><div class="vh"><div class="grow"><h2>Loja</h2></div></div><div class="empty"><div class="big">🏪 Nenhuma loja aberta</div><p>Quando o mestre abrir uma loja, ela aparece aqui.</p></div></div>`;return}
 m.innerHTML=`<div class="tpad narrow"><div class="vh"><div class="grow"><h2>Loja</h2><p>Compre e venda com as ${esc(COIN())} da sua mochila.</p></div></div><div id="shopP" class="shop-p">${shopPanelHTML()}</div></div>`;
 const p=$('#shopP');shopBind(p,()=>{if($('#shopP'))$('#shopP').innerHTML=shopPanelHTML()})};
ACT.pShop=async()=>{if(!shopsOpen().length){toast('Nenhuma loja aberta.');return}
 await modal({title:'🏪 Loja',wide:true,body:'<div id="shopM" class="shop-p"></div>',onMount:ov=>{const box=$('#shopM',ov),draw=()=>{if(!shopsOpen().length){box.innerHTML='<p class="muted">A loja fechou.</p>';return}box.innerHTML=shopPanelHTML()};draw();shopBind(box,draw);T.shopModalDraw=draw},actions:[{label:'Fechar',cls:'primary'}]});T.shopModalDraw=null};
/* ---------- mestre: montar as lojas ---------- */
const SHOP_TPL=[['geral','🏪','Mercado geral','Um pouco de tudo para a estrada.',['Consumível','Equipamento','Outro']],['ferreiro','⚒️','Ferreiro','Armas e armaduras forjadas na hora.',['Arma','Armadura']],['botica','⚗️','Botica','Poções, ervas e remédios.',['Consumível']],['taverna','🍺','Taverna','Comida, bebida e boatos.',[]],['vazia','🛒','Loja em branco','',[]]];
function shopEditHTML(sh,its){const inShop=new Set((sh.items||[]).map(e=>e.item)),rest=its.filter(i=>!inShop.has(i.id));
 return `<div class="card shop-ed ${sh.open?'is-open':''}" data-sid="${sh.id}">
 <div class="shop-edh"><input class="shop-emo" data-f="icon" value="${esc(sh.icon||'🏪')}" maxlength="4" title="Ícone"><input class="shop-nm" data-f="name" value="${esc(sh.name||'')}" placeholder="Nome da loja"><label class="toggle"><input type="checkbox" data-f="open" ${sh.open?'checked':''}><span class="sw"></span><span class="shop-st">${sh.open?'Aberta para os jogadores':'Fechada'}</span></label><button class="btn sm ghost" data-sh="del" title="Excluir loja">🗑</button></div>
 <div class="shop-edm"><input data-f="keeper" value="${esc(sh.keeper||'')}" placeholder="Vendedor (opcional)"><input data-f="desc" value="${esc(sh.desc||'')}" placeholder="Descrição curta (opcional)"><label class="small">Paga <input type="number" min="0" max="100" data-f="ratio" value="${Math.round(shopRatio(sh)*100)}">% pelos itens dos jogadores</label></div>
 <div class="shop-rows">${(sh.items||[]).map(e=>{const it=itemById(e.item);if(!it)return '';return `<div class="shop-row" data-item="${e.item}">${entIcon(it,'🎒')}<span class="grow"><b>${esc(it.name)}</b><small>${esc(it.type||'')}</small></span><label class="small">Preço <input type="number" min="0" data-p value="${+e.price||0}"></label><label class="small">Estoque <input type="number" min="0" data-s value="${e.stock>=INF?'':e.stock}" placeholder="∞"></label><button class="btn sm ghost" data-sh="rm" title="Tirar da loja">✕</button></div>`}).join('')||'<p class="small muted" style="margin:6px 0">Nenhum item nesta loja ainda.</p>'}</div>
 ${rest.length?`<div class="shop-add"><select data-add>${rest.map(i=>`<option value="${i.id}">${esc(i.icon||'')} ${esc(i.name)} — ${priceOf(i)}</option>`).join('')}</select><button class="btn sm" data-sh="add">+ Adicionar</button>${rest.length>1?`<button class="btn sm ghost" data-sh="addall">Adicionar todos (${rest.length})</button>`:''}</div>`:''}</div>`}
MR.shop=()=>{const g=T.game,list=shopsOf(),its=(g.items||[]).filter(i=>!isNatural(i)),m=$('#tMain');
 const log=(g.log||[]).filter(l=>/^🏪 .+ (comprou|vendeu) /.test(l.txt||'')).slice(0,8);
 m.innerHTML=`<div class="tpad"><div class="vh"><div class="grow"><h2>Lojas</h2><p>Monte lojas com os itens da mesa. Quando você abre uma loja, os jogadores veem a aba <b>Loja</b> (e o botão 🏪 na tela de jogo) e compram com as moedas da mochila.</p></div><button class="btn primary" data-sh="new">+ Nova loja</button></div>
 ${!its.length?`<div class="card shop-warn"><p style="margin:0 0 8px">Primeiro crie os itens (armas, poções, comida…) na aba <b>Itens</b>. Dica: preencha o campo <b>Valor</b> e ele vira o preço sugerido.</p><button class="btn sm" data-sh="items">Ir para Itens</button></div>`:''}
 ${MOD('shop')?'':`<div class="card shop-warn"><p style="margin:0">O módulo <b>Loja</b> está desligado em Mecânicas — ele liga sozinho quando você abrir uma loja.</p></div>`}
 ${list.map(sh=>shopEditHTML(sh,its)).join('')||`<div class="empty"><div class="big">🏪 Nenhuma loja ainda</div><p>Crie um mercado, um ferreiro ou uma botica — os itens entram sozinhos pelo tipo.</p></div>`}
 <div class="card shop-cfg"><h3>💰 Moedas dos personagens</h3><div class="shop-cfgr"><label class="small">Nome da moeda <input id="shCoin" value="${esc(g.coinName||'')}" placeholder="moedas"></label><label class="small">Personagem novo começa com <input type="number" min="0" id="shStart" value="${+g.startCoins||0}"></label><span class="sp"></span><label class="small">Dar a todos <input type="number" id="shGiveN" value="10"></label><button class="btn sm" data-sh="give">Dar</button></div>
  <div class="shop-purses">${T.seats.map(s=>`<label class="shop-pp"><span>${esc(s.emoji||'🧝')} ${esc(s.name||'Jogador')}</span><input type="number" data-coins="${s.uid}" value="${+s.coins||0}" title="${esc(COIN())}"></label>`).join('')||'<p class="small muted" style="margin:0">Nenhum jogador na mesa ainda.</p>'}</div></div>
 ${log.length?`<div class="card"><h3>🧾 Últimas compras e vendas</h3>${log.map(l=>`<div class="small shop-log"><span class="muted">${new Date(l.t).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</span> ${esc(l.txt.replace(/^🏪 /,''))}</div>`).join('')}</div>`:''}</div>`;
 const pad=m.querySelector('.tpad'),edit=(el,fn)=>{const card=el.closest('.shop-ed');const l=cl(shopsOf()),sh=card&&l.find(x=>x.id===card.dataset.sid);if(card&&!sh)return;const ex=fn(l,sh)||{};saveShops(l,ex.extra);if(ex.redraw!==false)MR.shop()};
 pad.onclick=async e=>{const b=e.target.closest('[data-sh]');if(!b)return;const k=b.dataset.sh;
  if(k==='items'){T.mtab='items';renderSubtabs();renderTab();return}
  if(k==='new'){const v=await modal({title:'🏪 Nova loja',body:`<p style="margin-top:0">Escolha um ponto de partida. Os itens da mesa entram pelo tipo e você ajusta depois.</p><div class="shop-tpls">${SHOP_TPL.map(([id,ic,n,d,tp])=>`<button class="shop-tpl" data-v="${id}"><span>${ic}</span><b>${n}</b><small>${tp.length?its.filter(i=>tp.includes(i.type)).length+' itens':'sem itens'}</small></button>`).join('')}</div>`,
    onMount:ov=>$$('.shop-tpl',ov).forEach(x=>x.onclick=()=>{ov._v=x.dataset.v;$$('.dlg-f .btn',ov).pop().click()}),actions:[{label:'Cancelar'},{label:'Criar',cls:'primary',onClick:ov=>ov._v||'geral'}]});if(!v)return;
   const t=SHOP_TPL.find(x=>x[0]===v)||SHOP_TPL[0];const l=cl(shopsOf());l.push({id:uid(),icon:t[1],name:t[2]==='Loja em branco'?'Nova loja':t[2],keeper:'',desc:t[3],open:false,ratio:RSET().sellRatio,items:its.filter(i=>t[4].includes(i.type)).map(i=>({item:i.id,price:priceOf(i),stock:INF}))});saveShops(l);MR.shop();
   setTimeout(()=>{const c=$$('.shop-ed').pop();if(c){c.scrollIntoView({block:'center',behavior:'smooth'});const n=c.querySelector('.shop-nm');n&&n.select()}},60);return}
  if(k==='give'){const n=Math.round(+$('#shGiveN').value||0);if(!n||!T.seats.length)return;T.seats.forEach(s=>seatPatch(s.uid,{coins:Math.max(0,(+s.coins||0)+n)}));logAdd(`💰 O mestre ${n>0?'deu':'tirou'} ${Math.abs(n)} ${COIN()} ${n>0?'a':'de'} cada personagem`);toast('Moedas entregues');MR.shop();return}
  if(k==='del'){const card=b.closest('.shop-ed'),sh=shopsOf().find(x=>x.id===card.dataset.sid);if(!await confirmDlg(`Excluir a loja “${sh?sh.name:''}”? Os itens continuam na mesa.`,'Excluir'))return;saveShops(shopsOf().filter(x=>x.id!==card.dataset.sid));MR.shop();return}
  if(k==='rm')edit(b,(l,sh)=>{sh.items=(sh.items||[]).filter(x=>x.item!==b.closest('.shop-row').dataset.item)});
  if(k==='add')edit(b,(l,sh)=>{const id=b.closest('.shop-ed').querySelector('[data-add]').value,it=itemById(id);if(it)(sh.items=sh.items||[]).push({item:id,price:priceOf(it),stock:INF})});
  if(k==='addall')edit(b,(l,sh)=>{const have=new Set((sh.items||[]).map(x=>x.item));its.filter(i=>!have.has(i.id)).forEach(i=>(sh.items=sh.items||[]).push({item:i.id,price:priceOf(i),stock:INF}))})};
 pad.onchange=e=>{const t=e.target;
  if(t.id==='shCoin'){gamePatch({coinName:t.value.trim().slice(0,24)});return}
  if(t.id==='shStart'){gamePatch({startCoins:Math.max(0,Math.round(+t.value||0))});return}
  if(t.dataset.coins){seatPatch(t.dataset.coins,{coins:Math.max(0,Math.round(+t.value||0))});return}
  if(t.dataset.f)edit(t,(l,sh)=>{const f=t.dataset.f;
   if(f==='open'){sh.open=t.checked;const ex={};if(t.checked&&!MOD('shop'))ex.extra={rules:{mods:{shop:true}}};setTimeout(()=>{if(t.checked){logAdd(`🏪 ${sh.name||'A loja'} está aberta!`);if(!(sh.items||[]).length)toast('A loja abriu, mas ainda não tem itens.')}},50);return ex}
   if(f==='ratio')sh.ratio=clamp((+t.value||0)/100,0,1);else sh[f]=t.value.trim().slice(0,f==='desc'?160:f==='icon'?4:60)||(f==='name'?'Loja':f==='icon'?'🏪':'');
   return {redraw:false}});
  if(t.matches('[data-p],[data-s]'))edit(t,(l,sh)=>{const e2=(sh.items||[]).find(x=>x.item===t.closest('.shop-row').dataset.item);if(!e2)return;if(t.matches('[data-p]'))e2.price=Math.max(0,Math.round(+t.value||0));else e2.stock=t.value===''?INF:Math.max(0,Math.min(INF-1,Math.round(+t.value)||0));return {redraw:false}})};
};
/* na tela de jogo, as Ferramentas do mestre abrem um atalho: abrir/fechar lojas ou ir montar */
ACT.gmShop=async()=>{const list=shopsOf();const go=()=>{T.mode='master';T.view='tabs';T.mtab='shop';renderTableShell();renderTab()};if(!list.length){go();return}
 const v=await modal({title:'🏪 Lojas',body:`<p class="small muted" style="margin-top:0">Abra ou feche as lojas para os jogadores.</p>${list.map(sh=>`<label class="toggle" style="display:flex;margin:8px 0"><input type="checkbox" data-o="${sh.id}" ${sh.open?'checked':''}><span class="sw"></span>${esc(sh.icon||'🏪')} ${esc(sh.name||'Loja')} <small class="muted">· ${(sh.items||[]).length} itens</small></label>`).join('')}`,
  actions:[{label:'Montar lojas…',onClick:()=>'edit'},{label:'Salvar',cls:'primary',onClick:ov=>{const o={};$$('[data-o]',ov).forEach(i=>o[i.dataset.o]=i.checked);return o}}]});
 if(v==='edit'){go();return}if(!v||typeof v!=='object')return;const l=cl(list);let opened=[];l.forEach(sh=>{if(v[sh.id]&&!sh.open)opened.push(sh.name);sh.open=!!v[sh.id]});
 saveShops(l,opened.length&&!MOD('shop')?{rules:{mods:{shop:true}}}:null);opened.forEach(n=>logAdd(`🏪 ${n} está aberta!`));try{refreshPlay()}catch{}};
/* abas: "Loja" só aparece para o jogador quando há loja aberta; tudo se atualiza ao vivo */
{const _rs=renderSubtabs;renderSubtabs=function(...a){const r=_rs.apply(this,a);try{if(T.mode==='player'&&T.tab!=='shop'&&!shopsOpen().length){const b=$('#tSub [data-t=shop]');if(b)b.remove()}else if(T.mode==='player'){const b=$('#tSub [data-t=shop]');if(b)b.classList.add('shop-tabb')}}catch{}return r}}
{const _lr=liveRefresh;liveRefresh=function(...a){const r=_lr.apply(this,a);try{shopLive()}catch(e){console.warn('loja',e)}return r}}
function shopLive(){if(!T.game)return;const open=shopsOpen().map(x=>x.id).join(',');
 if(T.mode==='player'&&mySeat()&&T.shopOpenSeen!=null&&open!==T.shopOpenSeen){const was=new Set(T.shopOpenSeen.split(',').filter(Boolean)),nw=shopsOpen().filter(x=>!was.has(x.id));if(nw.length&&T.view!=='play'&&T.tab!=='shop')toast(`🏪 ${nw[0].name||'Uma loja'} abriu! Veja na aba Loja.`)}
 const changed=open!==T.shopOpenSeen;T.shopOpenSeen=open;if(T.shopModalDraw)T.shopModalDraw();if(T.view==='play')return;
 const main=$('#tMain'),busy=main&&main.contains(document.activeElement)&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
 if(T.mode==='player'){if(changed)renderSubtabs();if(T.tab==='shop'&&!busy){const p=$('#shopP');if(p&&shopsOpen().length)p.innerHTML=shopPanelHTML();else PR.shop()}}
 else if(T.mtab==='shop'&&!busy)MR.shop()}
