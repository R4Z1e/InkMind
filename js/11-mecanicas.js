/* ============ v11: mecânicas em módulos configuráveis pelo mestre ============ */
const MOD_INFO=[
 ['checks','🎯 Testes, perícias e resistências','O mestre pede testes com CD aos jogadores; perícias somam proficiência; vantagem e desvantagem.'],
 ['equip','🛡 Equipamento','Equipar armadura, escudo e acessórios; a Defesa é calculada sozinha.'],
 ['loot','💰 Saque e baús','Inimigos derrotados deixam itens e moedas no mapa; o mestre também coloca baús.'],
 ['cond','🌀 Condições com efeito','Envenenado, atordoado, abençoado… mudam as rolagens e acabam sozinhas após algumas rodadas.'],
 ['area','💥 Magias em área','Habilidades com raio atingem todos na área; quem resistir sofre metade do dano.'],
 ['secret','🤫 Rolagens secretas','O mestre rola dados que só ele vê.'],
 ['handouts','🖼 Mostrar ao grupo','O mestre revela imagens, cartas e pistas na tela de todos.'],
 ['quests','📖 Diário de missões','Missões com etapas, concluídas ou falhas, visíveis ao grupo.'],
 ['shop','🏪 Loja','Comprar e vender itens com as moedas da mochila.'],
 ['sound','🔊 Som ambiente','Chuva, floresta, caverna, taverna, masmorra e batalha, escolhidos por mapa.'],
 ['levelup','⭐ Subir de nível com escolhas','A cada nível o jogador escolhe uma habilidade nova; atributos aumentam de tempos em tempos.'],
 ['los','👁 Linha de visão','Paredes bloqueiam a visão na névoa de guerra e os ataques.'],
 ['death','💀 Teste de morte','Herói caído rola 1d20 por turno: 3 sucessos estabiliza, 3 falhas morre.']];
function MOD(k){const m=(T.game&&T.game.rules&&T.game.rules.mods)||{};return m[k]!==undefined?!!m[k]:true}
function RSET(){const r=(T.game&&T.game.rules)||{};return{lootCoins:r.lootCoins??'2d6',areaAllies:r.areaAllies!==false,sellRatio:r.sellRatio??.5,battleAmb:r.battleAmb!==false,attrEvery:r.attrEvery??4,saveProf:!!r.saveProf}}
const normT=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
const DND_SKILLS=[['Acrobacia','DES'],['Adestrar Animais','SAB'],['Arcanismo','INT'],['Atletismo','FOR'],['Atuação','CAR'],['Enganação','CAR'],['Furtividade','DES'],['História','INT'],['Intimidação','CAR'],['Intuição','SAB'],['Investigação','INT'],['Medicina','SAB'],['Natureza','INT'],['Percepção','SAB'],['Persuasão','CAR'],['Prestidigitação','DES'],['Religião','INT'],['Sobrevivência','SAB']];
const SK_ALIAS={diplomacia:'persuasao',furtivo:'furtividade',investigar:'investigacao',psicologia:'intuicao','primeiros socorros':'medicina',ocultismo:'arcanismo',persuadir:'persuasao',biblioteca:'investigacao'};
const attrResolve=a=>{if(fLab(a))return a;const k=String(a||'').toUpperCase().slice(0,3);return ALIAS[k]?attrLab(k):a};
function skillList(){const L=T.game.rules&&T.game.rules.skills;return(L&&L.length?L:DND_SKILLS.map(([n,a])=>({n,a:attrLab(a)}))).map(s=>({n:s.n,a:attrResolve(s.a)}))}
function profSkills(a){const f=fByRe(/per[ií]cia/i,['textarea','text']);const t=f?String(fieldVal(f,a.values)||''):'';return new Set(t.split(/[,;\n\/]+/).map(normT).filter(Boolean).map(x=>SK_ALIAS[x]||x))}
function skillBonus(a,sk){const p=profSkills(a).has(normT(sk.n));return{mod:modBy(a,sk.a)+(p?profOf(a):0),prof:p}}
const attrFields=()=>tplFields(T.game.template).filter(f=>f.type==='attr'||f.type==='number').filter(f=>f.id!==RULES().level&&f.id!==RULES().def);
/* condições */
const COND_FX={adv_atk:'Vantagem nos ataques',dis_atk:'Desvantagem nos ataques',dis_chk:'Desvantagem em testes',adv_vs:'Ataques contra ele têm vantagem',dis_vs:'Ataques contra ele têm desvantagem',atk:'Bônus em ataques e testes (valor)',def:'Bônus na Defesa (valor)',dot:'Dano no início do turno (dados)',hot:'Cura no início do turno (dados)',skip:'Perde o turno',slow:'Deslocamento pela metade'};
const COND_DEF=[{n:'Envenenado',ic:'🤢',d:3,fx:[['dis_atk'],['dis_chk']]},{n:'Atordoado',ic:'💫',d:1,fx:[['skip'],['adv_vs']]},{n:'Amedrontado',ic:'😱',d:2,fx:[['dis_atk'],['dis_chk']]},{n:'Cego',ic:'🙈',d:2,fx:[['dis_atk'],['adv_vs']]},{n:'Abençoado',ic:'✨',d:3,fx:[['atk',2]]},{n:'Protegido',ic:'🛡️',d:3,fx:[['def',2]]},{n:'Enfraquecido',ic:'🥀',d:3,fx:[['atk',-2]]},{n:'Queimando',ic:'🔥',d:3,fx:[['dot','1d4']]},{n:'Regenerando',ic:'💚',d:3,fx:[['hot','1d4']]},{n:'Invisível',ic:'👻',d:3,fx:[['adv_atk'],['dis_vs']]},{n:'Lento',ic:'🐌',d:2,fx:[['slow'],['def',-2]]},{n:'Paralisado',ic:'🧊',d:1,fx:[['skip'],['adv_vs']]}];
const SYS_COND={'Caído':'🩸','Estável':'🫀','Morto':'💀'};
const condDefs=()=>{const c=T.game&&T.game.rules&&T.game.rules.conds;return c&&c.length?c:COND_DEF};
const condDef=n=>condDefs().find(c=>c.n===n);
const condIc=n=>SYS_COND[n]||(condDef(n)||{}).ic||'•';
const condGood=n=>{const d=condDef(n);return!!d&&(d.fx||[]).some(([t,v])=>t==='adv_atk'||t==='dis_vs'||t==='hot'||((t==='atk'||t==='def')&&+v>0))};
function cfx(a){const o={adv:0,dis:0,advVs:0,disVs:0,disChk:0,atk:0,def:0,skip:0,slow:0};if(!a||!a.src||!MOD('cond'))return o;(a.src.cond||[]).forEach(n=>{const d=condDef(n);if(!d)return;(d.fx||[]).forEach(([t,v])=>{if(t==='adv_atk')o.adv=1;else if(t==='dis_atk')o.dis=1;else if(t==='adv_vs')o.advVs=1;else if(t==='dis_vs')o.disVs=1;else if(t==='dis_chk')o.disChk=1;else if(t==='atk')o.atk+=+v||0;else if(t==='def')o.def+=+v||0;else if(t==='skip')o.skip=1;else if(t==='slow')o.slow=1})});return o}
function d20m(mode){const a=expRoll('1d20').dice[0].v;if(!mode)return{v:a,dice:[{f:20,v:a}],tag:''};const b=expRoll('1d20').dice[0].v;return{v:mode>0?Math.max(a,b):Math.min(a,b),dice:[{f:20,v:a},{f:20,v:b}],tag:mode>0?' (vantagem)':' (desvantagem)'}}
const netMode=(p,n)=>p&&!n?1:n&&!p?-1:0;
function setCond(kind,id,name,on,dur){const c=T.game.combat,end=on&&dur&&c&&c.on?c.round+(+dur):null;
 if(kind==='pc'){const s=T.seats.find(x=>x.uid===id);if(!s)return;const cd=(s.cond||[]).filter(x=>x!==name);if(on)cd.push(name);seatPatch(id,{cond:cd,cdur:{[name]:end}})}
 else gamePatch({chars:T.game.chars.map(x=>{if(x.id!==id)return x;const cd=(x.cond||[]).filter(y=>y!==name);if(on)cd.push(name);return{...x,cond:cd,cdur:{...(x.cdur||{}),[name]:end}}})})}
function startTurnFx(o,c){const a=actorRef(o.kind,o.id);if(!a||!MOD('cond'))return false;let skip=[];const cdur=a.src.cdur||{},hp=RULES().hp;
 (a.src.cond||[]).slice().forEach(n=>{if(SYS_COND[n])return;const end=cdur[n];if(end&&c.round>=end){setCond(o.kind,o.id,n,false);logAdd(`⌛ ${a.name} não está mais: ${n}`);return}
  const d=condDef(n);if(!d)return;(d.fx||[]).forEach(([t,v])=>{if((t==='dot'||t==='hot')&&hp){const r=expRoll(v||'1d4').total;masterDelta({kind:o.kind,id:o.id,fid:hp,delta:t==='dot'?-r:r});logAdd(`${d.ic} ${a.name} ${t==='dot'?'sofre '+r+' de dano':'recupera '+r} (${n})`)}if(t==='skip')skip.push(n)})});
 if(skip.length){logAdd(`💫 ${a.name} perde o turno (${skip.join(', ')})`);return true}return false}
/* equipamento */
function defCalc(a,base){let d=base;if(MOD('equip')){const eq=(a.inv||[]).filter(e=>e.eq).map(e=>itemById(e.item)).filter(Boolean),arm=eq.find(i=>i.slot==='Armadura'&&+i.ac);if(arm){const dm=modBy(a,attrLab('DES')),dx=arm.acDex==='Sem DES'?0:arm.acDex==='DES até +2'?Math.min(2,dm):dm;d=+arm.ac+dx}d+=eq.reduce((s,i)=>s+(+i.acBonus||0),0)}return d+cfx(a).def}
function toggleEquip(k){const s=mySeat();if(!s)return;const inv=cl(s.inv||[]),e=inv.find(x=>x.k===k);if(!e)return;const it=itemById(e.item);if(!it||!it.slot||it.slot==='—')return;
 if(!e.eq&&(it.slot==='Armadura'||it.slot==='Escudo'))inv.forEach(x=>{const i2=itemById(x.item);if(x!==e&&x.eq&&i2&&i2.slot===it.slot)x.eq=false});e.eq=!e.eq;seatPatch(S.uid,{inv});toast(e.eq?`${it.name} equipado · Defesa ${defOf(actorRef('pc',S.uid))}`:`${it.name} guardado na mochila`)}
ACT.tEquip=el=>{toggleEquip(el.dataset.k);if(T.mode==='player'&&T.tab==='bag')renderTab()};
/* saque e baús */
function mapPatch(mid,patch){const m=T.maps[mid];if(!m)return;T.maps[mid]=deepMerge(m,patch);if(T.edit&&T.edit.id===mid)Object.assign(T.edit,cl(patch));sharedWrite('games/'+T.gid+'/maps/'+mid,{patch})}
const isNatural=it=>!it||it.natural||/garras|presas|mordida/i.test(it.name||'');
function dropLoot(c){if(!c||!c.token)return;const m=T.maps[c.token.m];if(!m)return;const items=(c.inv||[]).filter(e=>!isNatural(itemById(e.item))).map(e=>({item:e.item,qty:e.qty}));const coins=c.coins!=null&&c.coins!==''?+c.coins:expRoll(RSET().lootCoins).total;if(!items.length&&!(coins>0))return;
 mapPatch(m.id,{loot:[...(m.loot||[]),{id:uid(),x:c.token.x,y:c.token.y,items,coins:Math.max(0,coins|0),ic:'💰',from:c.name}]});gamePatch({chars:T.game.chars.map(x=>x.id===c.id?{...x,inv:[]}:x)})}
function giveItems(u,items,coins){const s=T.seats.find(x=>x.uid===u);if(!s)return;const inv=cl(s.inv||[]);(items||[]).forEach(({item,qty})=>{if(!itemById(item))return;const e=inv.find(x=>x.item===item&&!x.eq);if(e)e.qty+=qty;else inv.push({k:uid(),item,qty})});seatPatch(u,{inv,coins:(+s.coins||0)+(coins||0)})}
function lootNear(){const s=mySeat(),m=T.maps[T.game.activeMap];if(!s||!s.pos||!m||s.pos.m!==m.id||!MOD('loot'))return null;return(m.loot||[]).find(l=>gdist(l,s.pos)<=1)||null}
const lootTxt=l=>[l.coins?l.coins+' moedas':'',...(l.items||[]).map(e=>{const i=itemById(e.item);return i?(e.qty>1?e.qty+'× ':'')+i.name:''})].filter(Boolean).join(', ')||'nada';
ACT.pLoot=()=>{const l=lootNear();if(!l){toast('Chegue perto do saque (1 quadrado).');return}pushAct({type:'loot',lid:l.id,mid:T.game.activeMap});toast('Pegando: '+lootTxt(l))};
ACT.gmChest=async()=>{const m=T.maps[T.game.activeMap];if(!m){toast('Mostre um mapa aos jogadores primeiro.','err');return}const its=(T.game.items||[]).filter(i=>!isNatural(i));
 const v=await modal({title:'📦 Baú de tesouro',body:`<p class="small muted" style="margin-top:0">O baú aparece perto do grupo. Quem chegar ao lado dele toca em 💰 Pegar.</p><div class="row wrap"><label>Moedas <input type="number" id="chC" value="20" min="0" style="width:90px"></label><label>Ícone <select id="chI"><option>📦</option><option>💰</option><option>🗝️</option><option>⚰️</option><option>🎁</option></select></label></div>
  <div class="tg-list" style="max-height:300px;overflow:auto;margin-top:8px">${its.map(i=>`<div class="tg">${entIcon(i,'🎒')}<span class="grow"><b>${esc(i.name)}</b><small>${esc(i.type||'')}</small></span><input type="number" min="0" max="20" value="0" data-ci="${i.id}" style="width:60px"></div>`).join('')}</div>
  ${(m.loot||[]).length?`<p class="small" style="margin-top:10px">Neste mapa: ${(m.loot||[]).map(l=>esc(l.ic)+' '+esc(lootTxt(l))).join(' · ')}</p>`:''}`,
  actions:[...((m.loot||[]).length?[{label:'Remover saques do mapa',cls:'danger',value:'rm'}]:[]),{label:'Cancelar'},{label:'Colocar baú',cls:'primary',onClick:ov=>({c:+$('#chC',ov).value||0,ic:$('#chI',ov).value,items:$$('[data-ci]',ov).map(i=>({item:i.dataset.ci,qty:+i.value||0})).filter(x=>x.qty>0)})}]});
 if(!v)return;if(v==='rm'){mapPatch(m.id,{loot:[]});refreshPlay();return}
 const pcs=tokensOnMap(m.id).filter(t=>t.kind==='pc'),cx=pcs.length?Math.round(pcs.reduce((s,t)=>s+t.pos.x,0)/pcs.length)+2:(m.spawn||{x:1}).x+2,cy=pcs.length?Math.round(pcs.reduce((s,t)=>s+t.pos.y,0)/pcs.length):(m.spawn||{y:1}).y;
 let p={x:clamp(cx,0,m.w-1),y:clamp(cy,0,m.h-1)};for(let r=0;r<8;r++){let ok=null;for(let dy=-r;dy<=r&&!ok;dy++)for(let dx=-r;dx<=r&&!ok;dx++){const x=p.x+dx,y=p.y+dy;if(x<0||y<0||x>=m.w||y>=m.h)continue;if(m.bg&&m.bg.src||walkable(tileAt(m,x,y)))ok={x,y}}if(ok){p=ok;break}}
 mapPatch(m.id,{loot:[...(m.loot||[]),{id:uid(),x:p.x,y:p.y,items:v.items,coins:v.c,ic:v.ic}]});logAdd(`${v.ic} Um baú apareceu no mapa!`);refreshPlay()};
/* área */
const BLOCKT=new Set(['k','w','m','h',' ']);
function losClear(m,p,q){if(!m||(m.bg&&m.bg.src))return true;let x0=p.x,y0=p.y;const x1=q.x,y1=q.y,dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx-dy;
 for(let g=0;g<400;g++){if(x0===x1&&y0===y1)return true;const e2=2*err;if(e2>-dy){err-=dy;x0+=sx}if(e2<dx){err+=dx;y0+=sy}if(x0===x1&&y0===y1)return true;if(BLOCKT.has(tileAt(m,x0,y0)))return false}return true}
function fogVis(m,tokens){let los=false;try{los=!!T.game&&MOD('los')}catch{}if(!los||!m.fogOn||!(+m.vision>0))return fogVis_v8(m,tokens);
 const n=m.w*m.h,f=m.fog||'',vis=new Uint8Array(n);for(let i=0;i<n;i++)vis[i]=f[i]==='1'?1:0;const R=+m.vision;
 (tokens||[]).filter(t=>t.kind==='pc').forEach(t=>{const p={x:Math.round(t.x),y:Math.round(t.y)};for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){if(dx*dx+dy*dy>R*R+.6)continue;const q={x:p.x+dx,y:p.y+dy};if(q.x<0||q.y<0||q.x>=m.w||q.y>=m.h)continue;if(losClear(m,p,q))vis[q.y*m.w+q.x]=1}});return vis}
function areaFx(e){if(!e||!e.area)return;TL.fx=TL.fx||[];TL.fx.push({...e.area,t:performance.now()+(diceBusy?900:0)});if(!TL.raf)TL.raf=requestAnimationFrame(tlFrame);sThud(diceBusy?.9:0,.8)}
/* ações (novo) */
function actionsOf(a){const L=[],eqOn=MOD('equip');
 (a.inv||[]).forEach(e=>{const it=itemById(e.item);if(!it)return;if(it.dmg)L.push({k:'w',id:it.id,ent:it,name:it.name+(eqOn&&e.eq?' ✓':''),icon:it.icon,img:it.img,eq:!!e.eq});if(it.heal)L.push({k:'i',id:it.id,ent:it,inv:e.k,qty:e.qty,name:it.name,icon:it.icon,img:it.img})});
 (a.skills||[]).forEach(id=>{const sk=(T.game.skills||[]).find(x=>x.id===id);if(sk&&(sk.dmg||sk.heal||(MOD('cond')&&sk.cond&&!String(sk.cond).startsWith('—'))))L.push({k:'s',id,ent:sk,name:sk.name,icon:sk.icon,img:sk.img})});
 if(eqOn)L.sort((p,q)=>(q.eq?1:0)-(p.eq?1:0));
 if(!L.some(x=>x.k==='w')){const f=fByRe(/^for\b|^for$|força|corpo/i,['attr','number']);L.unshift({k:'u',name:'Ataque desarmado',icon:'👊',ent:{dmg:'1',atk:f?f.label:'—'}})}
 return L}
const actCond=act=>MOD('cond')&&act.ent.cond&&!String(act.ent.cond).startsWith('—')?act.ent.cond:null;
const actFriendly=act=>isHealAct(act)||(!act.ent.dmg&&!act.ent.heal&&actCond(act)&&condGood(actCond(act)));
async function pickTarget(a,act,friendly,rng,area){
 if(rng===0)return a;const m=a.pos&&T.maps[a.pos.m];if(!m){toast('Coloque o personagem no mapa primeiro.','err');return null}const los=MOD('los');
 const L=tokensOnMap(m.id).filter(t=>friendly?!(t.kind==='npc'&&isDown(t)):(t.id!==a.id&&!(t.kind==='npc'&&isDown(t)))).map(t=>({t,d:gdist(a.pos,t.pos),v:t.id===a.id||!los||losClear(m,a.pos,t.pos)}))
  .sort((p,q)=>(friendly?(p.t.kind==='pc'?0:1)-(q.t.kind==='pc'?0:1):(p.t.kind==='npc'?0:1)-(q.t.kind==='npc'?0:1))||p.d-q.d);
 if(!L.length){toast('Nenhum alvo no mapa.','err');return null}
 const ent=act.ent,atkInfo=!friendly&&!isAuto(ent.atk)&&!(MOD('area')&&ent.save&&!String(ent.save).startsWith('—'))?` · ataque: 1d20${fmtB(modBy(a,ent.atk)+profOf(a)+cfx(a).atk)} contra a Defesa`:'';
 return modal({title:`${esc(act.icon||'')} ${esc(act.name)} — ${area?'escolha o centro da área':'escolha o alvo'}`,body:`<p class="small muted" style="margin-top:0">Alcance: ${rng<=1?'corpo a corpo (1 quadrado)':rng+' quadrados'}${area?` · área com raio de ${area} quadrado(s)`:''}${atkInfo}</p>
  <div class="tg-list">${L.map(({t,d,v},i)=>{const off=d>rng||!v;return `<button class="tg ${off?'far':''}" data-i="${i}" ${off?'disabled':''}>${avatarHTML(t,'tok')}<span class="grow"><b>${esc(t.name)}${t.id===a.id?' (você)':''}</b><small>${!v?'sem linha de visão · ':d>rng?'fora de alcance · ':''}${d} quadrado(s)${!friendly&&t.kind==='npc'?' · Defesa '+defOf(t):''}${(t.src.cond||[]).length?' · '+(t.src.cond||[]).map(condIc).join(''):''}</small>${barMini(hpOf(t))}</span></button>`}).join('')}</div>`,
  onMount:(ov,close)=>$$('[data-i]',ov).forEach(b=>b.onclick=()=>close(L[+b.dataset.i].t)),actions:[{label:'Cancelar'}]})}
async function doAction(a,act){
 const r=RULES(),ent=act.ent,c=T.game.combat;
 if(c&&c.on&&c.order.some(o=>o.id===a.id)){if(curId()!==a.id){toast('Aguarde sua vez.');return}if(r.oneAction&&T.actedTk===c.tk){toast('Você já usou sua ação neste turno. Mova-se ou encerre o turno.');return}}
 if(isDown(a)){toast(a.name+' está fora de combate.','err');return}
 const cost=act.k==='s'?(+ent.mp||0):0,mpF=r.mp&&fById(r.mp);
 if(cost&&mpF&&aVal(a,r.mp).cur<cost){toast(`${mpF.label} insuficiente (precisa de ${cost}).`,'err');return}
 const heal=isHealAct(act),condN=actCond(act),friendly=actFriendly(act),area=MOD('area')?(+ent.area||0):0,rng=rangeOf(act);
 const tg=await pickTarget(a,act,friendly,rng,area);if(!tg)return;
 let targets=[tg];if(area>0&&tg.pos){targets=tokensOnMap(tg.pos.m).filter(t=>gdist(t.pos,tg.pos)<=area&&!(t.kind==='npc'&&isDown(t))&&(friendly?t.kind===a.kind||t.id===a.id:(t.id!==a.id&&(RSET().areaAllies||t.kind!==a.kind))))}
 const atkLab=isAuto(ent.atk)?null:ent.atk,saveLab=MOD('area')&&ent.save&&!String(ent.save).startsWith('—')?ent.save:null,af=cfx(a),hasAmt=!!(heal?ent.heal:ent.dmg);
 const dc=8+profOf(a)+(atkLab?modBy(a,atkLab):0);
 const ex0=String((heal?ent.heal:ent.dmg)||'0').replace(/\s/g,''),dr=hasAmt?expRoll(ex0):{total:0,dice:[]},mm=atkLab&&(act.k==='w'||act.k==='u'||(heal&&act.k==='s'))?modBy(a,atkLab):0,base=hasAmt?Math.max(1,dr.total+mm):0;
 let critAmt=null;const critV=()=>{if(critAmt==null){const ex=(ex0.match(/\d*d\d+/gi)||[]).join('+');critAmt=base+(ex?expRoll(ex).total:0)}return critAmt};
 const dice=[],fx=[],outs=[];let txt='',res='hit';
 targets.forEach(t=>{let o='hit',info='';
  if(!friendly&&saveLab){const tf=cfx(t),sd=d20m(netMode(0,tf.disChk)),st=sd.v+modBy(t,saveLab)+tf.atk;o=st>=dc?'half':'hit';info=`resistência ${st}`}
  else if(!friendly&&atkLab){const tf=cfx(t),d=d20m(netMode(af.adv||tf.advVs,af.dis||tf.disVs)),bonus=modBy(a,atkLab)+profOf(a)+af.atk,tot=d.v+bonus,dv=defOf(t);o=d.v===20?'crit':d.v===1?'fumble':tot>=dv?'hit':'miss';if(targets.length===1){dice.push(...d.dice);txt=`Ataque ${d.v}${d.tag}${fmtB(bonus)} = ${tot} vs Defesa ${dv}`}info=`${tot} vs ${dv}`}
  const amt=!hasAmt?0:o==='crit'?critV():o==='half'?Math.floor(base/2):(o==='hit'?base:0);
  const barF=heal?(act.k==='i'?((fLab(ent.healBar)||{}).id||r.hp):r.hp):r.hp;
  if(amt&&barF)fx.push({kind:t.kind,id:t.id,fid:barF,delta:heal?amt:-amt});
  if(condN&&(o==='hit'||o==='crit'))fx.push({kind:t.kind,id:t.id,cond:condN,dur:(condDef(condN)||{}).d||2});
  outs.push({t,o,amt,info});if(targets.length===1)res=o});
 if(cost&&mpF)fx.push({kind:a.kind,id:a.id,fid:r.mp,delta:-cost});
 dice.push(...(dr.dice||[]));
 if(hasAmt)txt+=(txt?' · ':'')+(heal?'Cura ':'Dano ')+ex0+fmtB(mm)+' = '+base;
 if(area)txt=`Área de ${area} · ${targets.length} alvo(s)${saveLab?` · resistência de ${saveLab} CD ${dc}`:''}`+(hasAmt?` · ${heal?'cura':'dano'} ${base}`:'');
 const fmtO=x=>x.o==='miss'?'errou':x.o==='fumble'?'falha crítica':x.o==='half'?(x.amt?`resistiu, ${x.amt}`:'resistiu'):(x.o==='crit'?'CRÍTICO! ':'')+(x.amt?(heal?'+'+x.amt:x.amt+' de dano'):'')+(condN&&(x.o==='hit'||x.o==='crit')?` ${condIc(condN)} ${condN}`:'');
 const logTxt=area?`💥 ${a.name} usou ${act.name}: ${outs.map(x=>x.t.name+' ('+fmtO(x)+')').join(', ')||'ninguém na área'}`:`${heal||friendly?'💚':'⚔️'} ${a.name} ${friendly?(tg.id===a.id?`usou ${act.name} em si mesmo`:`usou ${act.name} em ${tg.name}`):`atacou ${tg.name} com ${act.name}`}: ${fmtO(outs[0])}`;
 if(act.k==='i'){const inv=cl(a.inv).map(e=>e.k===act.inv?{...e,qty:e.qty-1}:e).filter(e=>e.qty>0);if(a.kind==='pc')seatPatch(a.id,{inv});else gamePatch({chars:T.game.chars.map(x=>x.id===a.id?{...x,inv}:x)})}
 const big=area?(hasAmt?base:'✓'):res==='miss'?'ERROU':res==='fumble'?'FALHA':!hasAmt?(condN?condIc(condN):'✓'):heal?'+'+(outs[0]?outs[0].amt:0):(outs[0]?outs[0].amt:0);
 const e={id:uid(),t:Date.now(),e:txt||'',v:base,big,d:'',l:`${act.name} → ${area?targets.length+' alvo(s)':tg.name}`,dice:dice.slice(0,12),res:area?'hit':res,tg:area?null:tg.id,heal:heal?1:0,area:area&&tg.pos?{x:tg.pos.x,y:tg.pos.y,r:area,m:tg.pos.m}:null};
 if(a.kind==='pc')seatPatch(a.id,{rolls:[e,...(a.src.rolls||[])].slice(0,15)});else gamePatch({mrolls:[{...e,n:a.name,npc:a.id},...(T.game.mrolls||[])].slice(0,20)});
 T.seenRolls.add(e.id);diceQueue({...e,who:a.name,look:a.look,color:a.color});missFloat(e);areaFx(e);
 if(isMaster())fx.forEach(masterApply);
 else{const mine=f=>f.kind==='pc'&&f.id===S.uid;fx.filter(mine).forEach(f=>f.cond?setCond('pc',S.uid,f.cond,true,f.dur):selfDelta(f));const others=fx.filter(f=>!mine(f));pushAct({type:'fx',fx:others,txt:logTxt})}
 if(isMaster())logAdd(logTxt);
 if(c&&c.on&&curId()===a.id)T.actedTk=c.tk;setTimeout(renderActBar,50)}
function masterApply(f){if(f.cond)setCond(f.kind,f.id,f.cond,true,f.dur);else masterDelta(f)}
function masterDelta(f){const fld=fById(f.fid);if(!fld)return;const hpId=RULES().hp;
 if(f.kind==='npc'){const c=T.game.chars.find(x=>x.id===f.id);if(!c)return;const b=fieldVal(fld,c.values||{}),nb={cur:clamp(b.cur+f.delta,0,b.max),max:b.max},down=f.fid===hpId?nb.cur<=0:!!c.down;
  gamePatch({chars:T.game.chars.map(x=>x.id===c.id?{...x,values:{...(x.values||{}),[f.fid]:nb},down}:x)});if(down&&!c.down){logAdd(`💀 ${c.name} foi derrotado!`);if(MOD('loot'))dropLoot(T.game.chars.find(x=>x.id===c.id))}}
 else{const s=T.seats.find(x=>x.uid===f.id);if(!s)return;const b=fieldVal(fld,s.values||{}),nb={cur:clamp(b.cur+f.delta,0,b.max),max:b.max},p={values:{[f.fid]:nb}};
  if(f.fid===hpId){let cd=[...(s.cond||[])];
   if(nb.cur<=0&&b.cur>0&&!cd.includes('Caído')&&!cd.includes('Morto')){cd.push('Caído');logAdd(`🩸 ${s.name} caiu inconsciente!`);p.ds={s:0,f:0}}
   else if(nb.cur<=0&&b.cur<=0&&f.delta<0&&MOD('death')&&!cd.includes('Morto')){if(!cd.includes('Caído'))cd.push('Caído');const ds={s:0,f:0,...(s.ds||{})};ds.f++;cd=cd.filter(x=>x!=='Estável');if(ds.f>=3){cd.push('Morto');logAdd(`☠️ ${s.name} sofreu dano enquanto caído e morreu.`);p.ds={s:0,f:0}}else{p.ds=ds;logAdd(`💀 ${s.name} sofreu dano caído: ${ds.f} falha(s)`)}}
   else if(nb.cur>0&&(cd.includes('Caído')||cd.includes('Estável'))){cd=cd.filter(x=>x!=='Caído'&&x!=='Estável');p.ds={s:0,f:0}}
   p.cond=cd}
  seatPatch(s.uid,p)}}
function nextTurn(){const c=cl(T.game.combat);if(!c||!c.on)return;const n=c.order.length,alive=o=>{const a=actorRef(o.kind,o.id);return a&&!isDown(a)};
 const canAct=o=>{const a=actorRef(o.kind,o.id);if(!a)return false;if(!isDown(a))return true;return MOD('death')&&o.kind==='pc'&&a.cond.includes('Caído')&&!a.cond.includes('Estável')&&!a.cond.includes('Morto')};
 const foes=c.order.filter(o=>o.kind==='npc'),pcs=c.order.filter(o=>o.kind==='pc');
 if(foes.length&&!foes.some(alive)&&c.result!=='win'){c.result='win';logAdd('🏆 Vitória! Todos os inimigos foram derrotados.')}
 else if(pcs.length&&!pcs.some(o=>alive(o)||canAct(o))&&c.result!=='lose'){c.result='lose';logAdd('☠️ Todos os heróis caíram…')}
 let i=c.turn;for(let g=0;g<n*3;g++){i=(i+1)%n;if(i===0)c.round++;const o=c.order[i];if(!canAct(o))continue;c.turn=i;if(alive(o)&&startTurnFx(o,c))continue;if(!canAct(o))continue;break}
 c.turn=i;const a=actorRef(c.order[i].kind,c.order[i].id);c.start=a&&a.pos?{x:a.pos.x,y:a.pos.y}:null;c.tk=uid();gamePatch({combat:c});refreshPlay()}
function processActs(){if(!isMaster()||!T.game)return;const done=new Set(T.game.done||[]),now=Date.now();let ch=false;
 T.seats.forEach(s=>{(s.acts||[]).slice().reverse().forEach(a=>{if(!a.id||done.has(a.id))return;done.add(a.id);ch=true;if(now-a.t>20*60e3)return;
   if(a.type==='fx'){(a.fx||[]).forEach(masterApply);if(a.txt)logAdd(a.txt)}
   else if(a.type==='end'){if(curId()===s.uid){logAdd(`⏭ ${s.name} encerrou o turno`);nextTurn()}}
   else if(a.type==='death'&&MOD('death'))deathResolve(s,a.v);
   else if(a.type==='loot'){const m=T.maps[a.mid],l=m&&(m.loot||[]).find(x=>x.id===a.lid);if(l){giveItems(s.uid,l.items,l.coins);mapPatch(m.id,{loot:(m.loot||[]).filter(x=>x.id!==l.id)});logAdd(`${l.ic||'💰'} ${s.name} pegou: ${lootTxt(l)}`)}}
   else if(a.type==='shop'){const sh=cl(T.game.shop||{});const e=(sh.items||[]).find(x=>x.item===a.item);if(a.mode==='buy'&&e&&e.stock>0&&e.stock<999){e.stock--;gamePatch({shop:sh})}const it=itemById(a.item);logAdd(`🏪 ${s.name} ${a.mode==='buy'?'comprou':'vendeu'} ${it?it.name:'um item'} por ${a.price} moedas`)}
   else if(a.type==='lv'){logAdd(`⭐ ${s.name} escolheu: ${a.txt}`)}});
  Object.entries(s.ans||{}).forEach(([rid,an])=>{const key='ans:'+rid+':'+s.uid;if(done.has(key)||!an)return;done.add(key);ch=true;const rq=(T.game.reqs||[]).find(x=>x.id===rid);if(!rq)return;logAdd(`🎯 ${s.name} — ${reqLabel(rq)}: ${an.v}${rq.hide?'':(an.v>=rq.dc?' ✔ passou':' ✘ falhou')}`);renderReqRes()})});
 if(ch)gamePatch({done:[...done].slice(-200)})}
function deathResolve(s,v){const ds={s:0,f:0,...(s.ds||{})};let cd=[...(s.cond||[])],msg;
 if(v===20){masterDelta({kind:'pc',id:s.uid,fid:RULES().hp,delta:1});msg=`✨ ${s.name} tirou 20 no teste de morte e se levanta com 1 de Vida!`}
 else{if(v===1)ds.f+=2;else if(v>=10)ds.s++;else ds.f++;msg=`💀 ${s.name} — teste de morte: ${v} (${ds.s} sucesso(s), ${ds.f} falha(s))`;
  if(ds.f>=3){cd.push('Morto');seatPatch(s.uid,{ds:{s:0,f:0},cond:[...new Set(cd)]});msg+=` — ${s.name} morreu.`}
  else if(ds.s>=3){cd.push('Estável');seatPatch(s.uid,{ds:{s:0,f:0},cond:[...new Set(cd)]});msg+=' — estabilizou.'}
  else seatPatch(s.uid,{ds})}
 logAdd(msg);if(curId()===s.uid)nextTurn()}
ACT.pDeath=()=>{const s=mySeat(),c=T.game.combat;if(!s||!c||!c.on||curId()!==S.uid)return;if(T.deathTk===c.tk)return;T.deathTk=c.tk;const v=expRoll('1d20').dice[0].v;
 const e={id:uid(),t:Date.now(),e:v===20?'Levanta com 1 de Vida!':v>=10?'Sucesso':v===1?'Duas falhas!':'Falha',v,big:v,l:'Teste de morte',dice:[{f:20,v}],res:v===20?'crit':v===1?'fumble':undefined,d:''};
 seatPatch(S.uid,{rolls:[e,...(s.rolls||[])].slice(0,15)});T.seenRolls.add(e.id);diceQueue({...e,who:s.name,look:s.look,color:s.color});
 if(isMaster())deathResolve(s,v);else pushAct({type:'death',v});renderActBar()};
/* pedidos de teste */
const reqLabel=r=>r.kind==='skill'?r.k:(r.kind==='save'?'Resistência de ':'Teste de ')+r.k;
function myPendingReq(){const s=mySeat();if(!s||!MOD('checks'))return null;return(T.game.reqs||[]).find(r=>(r.who||[]).includes(S.uid)&&Date.now()-r.at<30*60e3&&!((s.ans||{})[r.id]))||null}
function answerReq(r){const s=mySeat(),a=actorRef('pc',S.uid);if(!s||!a)return;let mod=0;
 if(r.kind==='skill'){const sk=skillList().find(x=>x.n===r.k)||{n:r.k,a:''};mod=skillBonus(a,sk).mod}else mod=modBy(a,r.k)+(r.kind==='save'&&RSET().saveProf?profOf(a):0);
 const f=cfx(a);mod+=f.atk;const d=d20m(netMode(r.adv>0,r.adv<0||f.disChk)),tot=d.v+mod;
 const e={id:uid(),t:Date.now(),e:`1d20${d.tag}${fmtB(mod)} = ${tot}`+(r.hide?'':` vs CD ${r.dc}`),v:tot,big:tot,l:reqLabel(r)+(r.hide?'':` (CD ${r.dc})`),dice:d.dice,res:d.v===20?'crit':d.v===1?'fumble':undefined,d:''};
 seatPatch(S.uid,{rolls:[e,...(s.rolls||[])].slice(0,15),ans:{[r.id]:{v:tot,d:d.v,t:Date.now()}}});T.seenRolls.add(e.id);diceQueue({...e,who:s.name,look:s.look,color:s.color});
 if(!r.hide)setTimeout(()=>toast(tot>=r.dc?'✔ Passou no teste!':'✘ Não passou…'),1900);renderReq()}
function renderReq(){let el=$('#reqcard');const r=T.gid&&T.entered&&T.game?myPendingReq():null;if(!r){if(el)el.remove();return}
 if(!el){el=document.createElement('div');el.id='reqcard';el.className='reqcard';document.body.appendChild(el)}if(el.dataset.id===r.id)return;el.dataset.id=r.id;
 el.innerHTML=`<div class="rq-t">🎯 O mestre pede</div><b>${esc(reqLabel(r))}${r.hide?'':` · CD ${r.dc}`}</b>${r.adv?`<span class="pill">${r.adv>0?'com vantagem':'com desvantagem'}</span>`:''}${r.txt?`<p>${esc(r.txt)}</p>`:''}<button class="btn primary" id="rqGo">🎲 Rolar</button>`;
 $('#rqGo',el).onclick=()=>answerReq(r);sClack(0)}
function renderReqRes(){let el=$('#reqres');const r=isMaster()&&T.reqWatch&&(T.game.reqs||[]).find(x=>x.id===T.reqWatch);if(!r){if(el)el.remove();return}
 if(!el){el=document.createElement('div');el.id='reqres';el.className='reqres';document.body.appendChild(el)}
 el.innerHTML=`<div class="row"><b>🎯 ${esc(reqLabel(r))} · CD ${r.dc}</b><span class="sp"></span><button class="btn sm ghost" id="rrX">✕</button></div>${(r.who||[]).map(u=>{const s=T.seats.find(x=>x.uid===u),an=s&&(s.ans||{})[r.id];return `<div class="rr">${s?avatarHTML(s,'tav'):''}<span class="grow">${esc(s?s.name:'?')}</span>${an?`<b class="${an.v>=r.dc?'okt':'badt'}">${an.v} ${an.v>=r.dc?'✔':'✘'}</b>`:'<span class="muted small">aguardando…</span>'}</div>`}).join('')}`;
 $('#rrX',el).onclick=()=>{T.reqWatch=null;el.remove()}}
ACT.gmReq=async()=>{if(!T.seats.length){toast('Ninguém na mesa ainda.');return}const sk=skillList(),at=attrFields();
 const v=await modal({title:'🎯 Pedir teste',body:`<label class="f">Para quem</label><div class="row wrap">${T.seats.map(s=>`<label class="ckrow" style="margin:0"><input type="checkbox" data-u="${s.uid}" checked> ${esc(s.name)}</label>`).join('')}</div>
  <div class="row wrap"><div class="grow"><label class="f">Tipo</label><select id="rqK"><option value="skill">Perícia</option><option value="attr">Atributo</option><option value="save">Resistência</option></select></div><div class="grow"><label class="f">Qual</label><select id="rqN"></select></div></div>
  <label class="f">Dificuldade (CD)</label><div class="row wrap"><input type="number" id="rqD" value="12" min="1" max="40" style="width:80px">${[[5,'Muito fácil'],[10,'Fácil'],[12,'Normal'],[15,'Média'],[20,'Difícil'],[25,'Muito difícil']].map(([n,l])=>`<button type="button" class="btn sm" data-dc="${n}" title="${l}">${n}</button>`).join('')}</div>
  <label class="f">Rolagem</label><div class="seg" id="rqA"><button type="button" data-a="-1">Desvantagem</button><button type="button" data-a="0" class="on">Normal</button><button type="button" data-a="1">Vantagem</button></div>
  <label class="f">Mensagem (opcional)</label><input id="rqT" placeholder="Ex.: Vocês ouvem passos no corredor…" maxlength="160">
  <label class="toggle"><input type="checkbox" id="rqH"><span class="sw"></span>Esconder a CD e o resultado dos jogadores</label>`,
  onMount:ov=>{const fill=()=>{const k=$('#rqK',ov).value;$('#rqN',ov).innerHTML=(k==='skill'?sk.map(s=>`<option value="${esc(s.n)}">${esc(s.n)} (${esc(s.a)})</option>`):at.map(f=>`<option value="${esc(f.label)}">${esc(f.label)}</option>`)).join('')};fill();$('#rqK',ov).onchange=fill;
   $$('[data-dc]',ov).forEach(b=>b.onclick=()=>$('#rqD',ov).value=b.dataset.dc);$$('#rqA button',ov).forEach(b=>b.onclick=()=>$$('#rqA button',ov).forEach(x=>x.classList.toggle('on',x===b)))},
  actions:[{label:'Cancelar'},{label:'Pedir teste',cls:'primary',onClick:ov=>({who:$$('[data-u]',ov).filter(i=>i.checked).map(i=>i.dataset.u),kind:$('#rqK',ov).value,k:$('#rqN',ov).value,dc:+$('#rqD',ov).value||10,adv:+($('#rqA .on',ov)||{dataset:{a:0}}).dataset.a,txt:$('#rqT',ov).value.trim(),hide:$('#rqH',ov).checked})}]});
 if(!v||!v.who.length||!v.k)return;const rq={id:uid(),at:Date.now(),...v};gamePatch({reqs:[rq,...(T.game.reqs||[])].slice(0,10)});T.reqWatch=rq.id;logAdd(`🎯 O mestre pediu ${reqLabel(rq)}${rq.hide?'':' (CD '+rq.dc+')'} para ${v.who.map(u=>(T.seats.find(s=>s.uid===u)||{}).name).join(', ')}`);renderReqRes();toast('Teste pedido')};
/* condições (mestre) */
async function condModal(pre){const m=T.maps[T.game.activeMap],toks=m?tokensOnMap(m.id):[];const L=toks.length?toks:T.seats.map(s=>actorRef('pc',s.uid));if(!L.length){toast('Ninguém para aplicar.');return}
 const defs=condDefs();const v=await modal({title:'🌀 Condições',body:`<label class="f">Em quem</label><div class="tg-list" style="max-height:220px;overflow:auto">${L.map(t=>`<label class="tg" style="cursor:pointer"><input type="checkbox" data-t="${t.kind}:${t.id}" ${pre&&pre.includes(t.id)?'checked':''}>${avatarHTML(t,'tok')}<span class="grow"><b>${esc(t.name)}</b><small>${(t.src.cond||[]).map(n=>condIc(n)+' '+esc(n)).join(' · ')||'sem condições'}</small></span></label>`).join('')}</div>
  <div class="row wrap"><div class="grow"><label class="f">Condição</label><select id="cdN">${defs.map(d=>`<option value="${esc(d.n)}" data-d="${d.d||2}">${d.ic} ${esc(d.n)}</option>`).join('')}<option value="Caído">🩸 Caído</option></select></div><div style="width:140px"><label class="f">Duração (rodadas)</label><input type="number" id="cdD" min="0" value="${(defs[0]||{}).d||2}"></div></div><p class="small muted" id="cdX"></p><p class="small muted">Duração 0 = até o mestre remover. Fora de combate a condição fica até ser removida.</p>`,
  onMount:ov=>{const upd=()=>{const d=condDef($('#cdN',ov).value);$('#cdX',ov).textContent=d?(d.fx||[]).map(([t,v])=>COND_FX[t].replace(/ \((valor|dados)\)/,'')+(v!=null&&v!==''?' '+v:'')).join(' · '):'';$('#cdD',ov).value=d?d.d||0:0};$('#cdN',ov).onchange=upd;upd()},
  actions:[{label:'Cancelar'},{label:'Remover',value:'rm',onClick:ov=>({rm:1,n:$('#cdN',ov).value,t:$$('[data-t]',ov).filter(i=>i.checked).map(i=>i.dataset.t)})},{label:'Aplicar',cls:'primary',onClick:ov=>({n:$('#cdN',ov).value,d:+$('#cdD',ov).value||0,t:$$('[data-t]',ov).filter(i=>i.checked).map(i=>i.dataset.t)})}]});
 if(!v||!v.t||!v.t.length)return;v.t.forEach(k=>{const [kind,id]=k.split(':');setCond(kind,id,v.n,!v.rm,v.d)});logAdd(`${condIc(v.n)} ${v.rm?'Removido':'Aplicado'}: ${v.n} — ${v.t.map(k=>{const [kind,id]=k.split(':');return(actorRef(kind,id)||{}).name}).join(', ')}`);refreshPlay();renderPanel()}
ACT.gmCond=()=>condModal();
const _tCondAdd=ACT.tCondAdd;ACT.tCondAdd=el=>MOD('cond')?condModal([el.dataset.uid]):_tCondAdd(el);
/* mostrar ao grupo e diário */
function showHandout(h){if(!h)return;const d=document.createElement('div');d.className='handout';d.innerHTML=`<div class="ho-card">${h.img?`<img src="${esc(h.img)}" alt="">`:''}${h.title?`<h2>${esc(h.title)}</h2>`:''}${h.text?`<p>${esc(h.text)}</p>`:''}<button class="btn primary">Fechar</button></div>`;d.onclick=e=>{if(e.target===d||e.target.closest('button'))d.remove()};document.body.appendChild(d);sChime(0,true)}
async function handoutForm(h={}){return modal({title:'🖼 Mostrar ao grupo',body:`<label class="f">Título</label><input id="hoT" value="${esc(h.title||'')}" placeholder="Ex.: Bilhete encontrado"><label class="f">Texto</label><textarea id="hoX" rows="4" placeholder="Carta, inscrição, pista…">${esc(h.text||'')}</textarea><label class="f">Imagem (opcional)</label><div class="row wrap"><span id="hoP">${h.img?`<img src="${esc(h.img)}" class="en-img" alt="">`:''}</span>${S.assets?'<button type="button" class="btn sm" id="hoU">⬆ Enviar imagem</button><button type="button" class="btn sm" id="hoG">🎨 Gerar com IA</button>':''}</div>`,
  onMount:ov=>{let img=h.img||null;ov._img=()=>img;const set=s=>{img=s;$('#hoP',ov).innerHTML=s?`<img src="${esc(s)}" class="en-img" alt="">`:''};const u=$('#hoU',ov);if(u)u.onclick=async()=>{const [f]=await pickFile('image/*');if(!f)return;const b=busy('Enviando…');try{set((await storeImage(f)).src)}catch(e){toast(e.message,'err')}finally{b.done()}};const g=$('#hoG',ov);if(g)g.onclick=async()=>{const r=await genImage();if(r)set(r.src)}},
  actions:[{label:'Cancelar'},{label:'Guardar para depois',value:'later',onClick:ov=>({later:1,title:$('#hoT',ov).value.trim(),text:$('#hoX',ov).value.trim(),img:ov._img()})},{label:'Mostrar agora',cls:'primary',onClick:ov=>({title:$('#hoT',ov).value.trim(),text:$('#hoX',ov).value.trim(),img:ov._img()})}]})}
ACT.gmShow=async()=>{const prep=T.game.prep||[];let v;
 if(prep.length){const pick=await modal({title:'🖼 Mostrar ao grupo',body:`<p class="small muted" style="margin-top:0">Revelações preparadas:</p><div class="tg-list">${prep.map((p,i)=>`<button class="tg" data-i="${i}">${p.img?`<img src="${esc(p.img)}" class="act-img" alt="">`:'<span class="act-ic">📜</span>'}<span class="grow"><b>${esc(p.title||'Sem título')}</b><small>${esc((p.text||'').slice(0,80))}</small></span></button>`).join('')}</div>`,onMount:(ov,close)=>$$('[data-i]',ov).forEach(b=>b.onclick=()=>close(prep[+b.dataset.i])),actions:[{label:'Cancelar'},{label:'+ Nova revelação',cls:'primary',value:'new'}]});
  if(!pick)return;if(pick!=='new'){showNow(pick);gamePatch({prep:prep.filter(p=>p.id!==pick.id)});return}}
 v=await handoutForm();if(!v||(!v.title&&!v.text&&!v.img))return;const h={id:uid(),at:Date.now(),title:v.title,text:v.text,img:v.img};
 if(v.later){gamePatch({prep:[...prep,h]});toast('Guardado para revelar depois');return}showNow(h)};
function showNow(h){const x={...h,id:uid(),at:Date.now()};gamePatch({handouts:[x,...(T.game.handouts||[])].slice(0,40)});T.hSeen.add(x.id);showHandout(x);logAdd(`🖼 O mestre revelou: ${x.title||'uma imagem'}`)}
function handoutWatch(){if(!MOD('handouts'))return;T.hSeen=T.hSeen||new Set();const L=T.game.handouts||[];if(!T.hSeeded){T.hSeeded=true;L.forEach(h=>T.hSeen.add(h.id));return}L.slice().reverse().forEach(h=>{if(T.hSeen.has(h.id))return;T.hSeen.add(h.id);if(Date.now()-h.at<5*60e3)showHandout(h)})}
function questWatch(){if(!MOD('quests'))return;const q=T.game.quests||[];const seen=T.qSeen;T.qSeen={};q.forEach(x=>T.qSeen[x.id]=x.status);if(!seen)return;q.forEach(x=>{const p=seen[x.id];if(p===undefined){banner(`<div class="cb-s">Nova missão</div><div class="cb-t">📜 ${esc(x.title)}</div>`,'',2200);sChime(0,true)}else if(p!==x.status&&x.status!=='ativa'){banner(`<div class="cb-s">${x.status==='concluída'?'Missão concluída':'Missão falhou'}</div><div class="cb-t">${x.status==='concluída'?'✔':'✘'} ${esc(x.title)}</div>`,x.status==='concluída'?'big win':'big lose',2400);sChime(0,x.status==='concluída')}})}
ACT.pDiary=()=>{const d=$('#diary');if(!d)return;d.classList.toggle('open');if(d.classList.contains('open'))renderDiary()};
function renderDiary(){const el=$('#diaL');if(!el)return;const me=isMaster(),q=T.game.quests||[],h=T.game.handouts||[],chip=s=>`<span class="qst ${s==='concluída'?'ok':s==='falhou'?'bad':''}">${s}</span>`;
 el.innerHTML=`${MOD('quests')?`<div class="row"><h4 style="margin:4px 0">Missões</h4><span class="sp"></span>${me?'<button class="btn sm" data-qn="1">+ Nova</button>':''}</div>${q.map(x=>`<div class="qcard ${x.status!=='ativa'?'dim':''}"><div class="row"><b class="grow">${esc(x.title)}</b>${chip(x.status)}</div>${x.desc?`<p>${esc(x.desc)}</p>`:''}${(x.steps||[]).map((st,i)=>`<label class="qstep"><input type="checkbox" ${st.done?'checked':''} ${me?`data-qs="${x.id}:${i}"`:'disabled'}> ${esc(st.t)}</label>`).join('')}${me?`<div class="row wrap" style="margin-top:6px"><button class="btn sm" data-qe="${x.id}">✏️</button>${x.status==='ativa'?`<button class="btn sm" data-qd="${x.id}:concluída">✔ Concluir</button><button class="btn sm" data-qd="${x.id}:falhou">✘ Falhou</button>`:`<button class="btn sm" data-qd="${x.id}:ativa">↺ Reabrir</button>`}<button class="btn sm ghost" data-qx="${x.id}">🗑</button></div>`:''}</div>`).join('')||'<p class="muted small">Nenhuma missão ainda.</p>'}`:''}
  ${MOD('handouts')&&h.length?`<h4 style="margin:14px 0 4px">Revelações</h4>${h.map((x,i)=>`<button class="tg" data-hv="${i}">${x.img?`<img src="${esc(x.img)}" class="act-img" alt="">`:'<span class="act-ic">📜</span>'}<span class="grow"><b>${esc(x.title||'Sem título')}</b><small>${esc((x.text||'').slice(0,60))}</small></span></button>`).join('')}`:''}
  ${me?`<h4 style="margin:14px 0 4px">📝 Notas do mestre <small class="muted">(só você vê)</small></h4><textarea id="gmN" rows="8" style="width:100%">${esc(T.game.gmNotes||'')}</textarea>`:''}`;
 el.onclick=async e=>{const b=e.target.closest('[data-qn],[data-qe],[data-qd],[data-qx],[data-hv]');if(!b)return;const d=b.dataset;
  if(d.hv){showHandout(h[+d.hv]);return}
  if(d.qn||d.qe){const x=d.qe?q.find(y=>y.id===d.qe):{id:uid(),title:'',desc:'',status:'ativa',steps:[]};const v=await modal({title:d.qe?'Editar missão':'Nova missão',body:`<label class="f">Título</label><input id="qT" value="${esc(x.title)}"><label class="f">Descrição</label><textarea id="qD" rows="3">${esc(x.desc||'')}</textarea><label class="f">Etapas (uma por linha)</label><textarea id="qS" rows="4">${esc((x.steps||[]).map(s=>(s.done?'[x] ':'')+s.t).join('\n'))}</textarea>`,actions:[{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>({title:$('#qT',ov).value.trim()||'Missão',desc:$('#qD',ov).value.trim(),steps:$('#qS',ov).value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>({t:l.replace(/^\[x\]\s*/i,''),done:/^\[x\]/i.test(l)}))})}]});
   if(!v)return;const nx={...x,...v};gamePatch({quests:d.qe?q.map(y=>y.id===x.id?nx:y):[nx,...q]});if(!d.qe)logAdd('📜 Nova missão: '+nx.title);renderDiary();return}
  if(d.qd){const [id,st]=d.qd.split(':');const x=q.find(y=>y.id===id);gamePatch({quests:q.map(y=>y.id===id?{...y,status:st}:y)});if(x)logAdd(st==='concluída'?'✔ Missão concluída: '+x.title:st==='falhou'?'✘ Missão falhou: '+x.title:'↺ Missão reaberta: '+x.title);renderDiary();return}
  if(d.qx){if(!await confirmDlg('Excluir esta missão?'))return;gamePatch({quests:q.filter(y=>y.id!==d.qx)});renderDiary()}};
 $$('[data-qs]',el).forEach(i=>i.onchange=()=>{const [id,k]=i.dataset.qs.split(':');gamePatch({quests:q.map(y=>y.id===id?{...y,steps:y.steps.map((s,j)=>j===+k?{...s,done:i.checked}:s)}:y)})});
 const n=$('#gmN',el);if(n)n.oninput=debounce(()=>gamePatch({gmNotes:n.value}),600)}
/* loja */
const priceOf=it=>{const n=parseInt(String((it&&it.value)||'').replace(/[^\d]/g,''));return n>0?n:1};
ACT.gmShop=async()=>{const sh=cl(T.game.shop||{name:'Mercador',open:false,items:[]}),its=(T.game.items||[]).filter(i=>!isNatural(i)),has=id=>(sh.items||[]).find(x=>x.item===id);
 const v=await modal({title:'🏪 Loja',wide:true,body:`<div class="row wrap"><div class="grow"><label class="f">Nome da loja</label><input id="shN" value="${esc(sh.name||'Mercador')}"></div><div style="width:160px"><label class="f">Venda paga (% do preço)</label><input type="number" id="shR" value="${Math.round((T.game.rules&&T.game.rules.sellRatio!=null?T.game.rules.sellRatio:.5)*100)}" min="0" max="100"></div></div>
  <label class="toggle"><input type="checkbox" id="shO" ${sh.open?'checked':''}><span class="sw"></span>Loja aberta para os jogadores</label>
  <div class="tg-list" style="max-height:340px;overflow:auto;margin-top:8px">${its.map(i=>{const e=has(i.id);return `<div class="tg"><input type="checkbox" data-si="${i.id}" ${e?'checked':''}>${entIcon(i,'🎒')}<span class="grow"><b>${esc(i.name)}</b><small>${esc(i.type||'')}</small></span><label class="small">Preço <input type="number" min="0" value="${e?e.price:priceOf(i)}" data-sp="${i.id}" style="width:70px"></label><label class="small">Estoque <input type="number" min="0" value="${e?(e.stock>=999?'':e.stock):''}" placeholder="∞" data-ss="${i.id}" style="width:60px"></label></div>`}).join('')}</div>`,
  actions:[{label:'Cancelar'},{label:'Salvar loja',cls:'primary',onClick:ov=>({name:$('#shN',ov).value.trim()||'Mercador',open:$('#shO',ov).checked,ratio:clamp((+$('#shR',ov).value||0)/100,0,1),items:$$('[data-si]',ov).filter(i=>i.checked).map(i=>{const id=i.dataset.si,st=$(`[data-ss="${id}"]`,ov).value;return{item:id,price:+$(`[data-sp="${id}"]`,ov).value||0,stock:st===''?999:+st}})})}]});
 if(!v)return;gamePatch({shop:{name:v.name,open:v.open,items:v.items},rules:{sellRatio:v.ratio}});if(v.open&&!sh.open)logAdd(`🏪 ${v.name} está aberta!`);refreshPlay()};
ACT.pShop=async()=>{const sh=T.game.shop;if(!sh||!sh.open)return;let tab='buy';const draw=ov=>{const s=mySeat(),coins=+s.coins||0,ratio=RSET().sellRatio;$('#spC',ov).textContent=coins;
  $('#spL',ov).innerHTML=tab==='buy'?(sh.items||[]).map(e=>{const it=itemById(e.item);if(!it)return'';const out=e.stock<=0;return `<div class="tg">${entIcon(it,'🎒')}<span class="grow"><b>${esc(it.name)}</b><small>${esc(it.effect||it.type||'')}${e.stock<999?' · estoque '+e.stock:''}</small></span><button class="btn sm primary" data-buy="${e.item}" ${out||coins<e.price?'disabled':''}>${out?'Esgotado':'💰 '+e.price}</button></div>`}).join('')||'<p class="muted">Nada à venda.</p>'
   :(s.inv||[]).filter(e=>!e.eq).map(e=>{const it=itemById(e.item);if(!it)return'';const ls=(sh.items||[]).find(x=>x.item===e.item),p=Math.floor((ls?ls.price:priceOf(it))*ratio);return `<div class="tg">${entIcon(it,'🎒')}<span class="grow"><b>${esc(it.name)} ×${e.qty}</b><small>${esc(it.type||'')}</small></span><button class="btn sm" data-sell="${e.k}" data-p="${p}">Vender por ${p}</button></div>`}).join('')||'<p class="muted">Nada para vender (itens equipados não aparecem).</p>'};
 await modal({title:'🏪 '+esc(sh.name||'Loja'),body:`<div class="row"><div class="seg" id="spT"><button class="on" data-t="buy">Comprar</button><button data-t="sell">Vender</button></div><span class="sp"></span><b>💰 <span id="spC"></span> moedas</b></div><div class="tg-list" id="spL" style="margin-top:10px;max-height:360px;overflow:auto"></div>`,
  onMount:ov=>{draw(ov);$$('#spT button',ov).forEach(b=>b.onclick=()=>{tab=b.dataset.t;$$('#spT button',ov).forEach(x=>x.classList.toggle('on',x===b));draw(ov)});
   $('#spL',ov).onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const s=mySeat();
    if(b.dataset.buy){const ls=(sh.items||[]).find(x=>x.item===b.dataset.buy);if(!ls||(+s.coins||0)<ls.price)return;const inv=cl(s.inv||[]),ex=inv.find(x=>x.item===ls.item&&!x.eq);if(ex)ex.qty++;else inv.push({k:uid(),item:ls.item,qty:1});seatPatch(S.uid,{inv,coins:(+s.coins||0)-ls.price});if(ls.stock<999)ls.stock--;pushAct({type:'shop',mode:'buy',item:ls.item,price:ls.price});toast('Comprado!');sClack(0)}
    else if(b.dataset.sell){const inv=cl(s.inv||[]),ex=inv.find(x=>x.k===b.dataset.sell);if(!ex)return;const it=ex.item;ex.qty--;seatPatch(S.uid,{inv:inv.filter(x=>x.qty>0),coins:(+s.coins||0)+(+b.dataset.p||0)});pushAct({type:'shop',mode:'sell',item:it,price:+b.dataset.p||0});toast('Vendido!')}
    setTimeout(()=>draw(ov),30)}},actions:[{label:'Fechar',cls:'primary'}]})};
/* som ambiente */
const AMB_LIST={nenhum:'🔇 Nenhum',chuva:'🌧 Chuva',floresta:'🌲 Floresta e vento',caverna:'🕳 Caverna',taverna:'🍺 Taverna e lareira',masmorra:'⛓ Masmorra',batalha:'⚔️ Batalha'};
const AMB={key:'',stop:null};
function ambNoise(c,type){const n=c.sampleRate*3,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(type==='brown'){l=(l+.02*w)/1.02;d[i]=l*3.5}else d[i]=w}return b}
function ambLoop(c,out,type,ft,freq,q,gain){const s=c.createBufferSource();s.buffer=ambNoise(c,type);s.loop=true;const f=c.createBiquadFilter();f.type=ft;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.value=gain;s.connect(f).connect(g).connect(out);s.start();return{s,f,g}}
function ambTone(c,out,freq,dur,gain,type='sine',f2){const o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(out);o.start(t);o.stop(t+dur+.05)}
function ambBurst(c,out,freq,dur,gain){const s=c.createBufferSource(),n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;f.Q.value=1.5;const g=c.createGain();g.gain.value=gain;s.connect(f).connect(g).connect(out);s.start()}
function ambStop(){if(AMB.stop){try{AMB.stop()}catch{}}AMB.stop=null;AMB.key=''}
function ambStart(kind){ambStop();AMB.key=kind;if(!kind||kind==='nenhum'||!sndOn())return;const c=ac();if(!c)return;const out=c.createGain();out.gain.value=0;out.connect(c.destination);out.gain.linearRampToValueAtTime(.8,c.currentTime+2.5);const L=[],tm=[];
 const every=(fn,a,b)=>{const t=()=>{try{fn()}catch{}tm.push(setTimeout(t,a+Math.random()*(b-a)))};tm.push(setTimeout(t,a*Math.random()))};
 const lfo=(param,rate,depth)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=rate;g.gain.value=depth;o.connect(g).connect(param);o.start();L.push({s:o})};
 if(kind==='chuva'){L.push(ambLoop(c,out,'white','lowpass',1300,.3,.12));L.push(ambLoop(c,out,'white','bandpass',4500,.6,.03));every(()=>ambBurst(c,out,2600+Math.random()*2500,.025,.05),60,220);every(()=>ambLoop&&ambTone(c,out,70,1.8,.06,'sine',40),9000,20000)}
 else if(kind==='floresta'){const w=ambLoop(c,out,'brown','lowpass',520,.4,.22);L.push(w);lfo(w.g.gain,.09,.1);lfo(w.f.frequency,.05,200);every(()=>{const f=2400+Math.random()*1600;for(let i=0;i<2+Math.floor(Math.random()*3);i++)setTimeout(()=>ambTone(c,out,f,.09,.025,'sine',f*1.4),i*130)},2500,7000);every(()=>ambBurst(c,out,1800,.06,.02),1500,4000)}
 else if(kind==='caverna'||kind==='masmorra'){const o1=c.createOscillator(),o2=c.createOscillator(),gd=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=180;o1.frequency.value=kind==='masmorra'?41:55;o2.frequency.value=kind==='masmorra'?41.6:55.8;gd.gain.value=.05;o1.connect(lp);o2.connect(lp);lp.connect(gd).connect(out);o1.start();o2.start();L.push({s:o1},{s:o2});
  const dl=c.createDelay(1);dl.delayTime.value=.32;const fb=c.createGain();fb.gain.value=.38;dl.connect(fb).connect(dl);dl.connect(out);
  every(()=>{const f=900+Math.random()*700,o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.45,t+.12);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(g);g.connect(out);g.connect(dl);o.start(t);o.stop(t+.2)},1100,3400);
  if(kind==='masmorra'){const w=ambLoop(c,out,'brown','lowpass',300,.5,.16);L.push(w);lfo(w.g.gain,.07,.08);every(()=>{for(let i=0;i<4;i++)setTimeout(()=>ambBurst(c,out,3200+Math.random()*1500,.04,.035),i*70)},6000,14000)}}
 else if(kind==='taverna'){const mu=ambLoop(c,out,'brown','bandpass',420,.8,.35);L.push(mu);lfo(mu.g.gain,.3,.12);every(()=>ambBurst(c,out,2500+Math.random()*3000,.015+Math.random()*.02,.05),40,260);every(()=>ambTone(c,out,2100+Math.random()*500,.35,.025),4000,10000);every(()=>ambTone(c,out,180+Math.random()*80,.4,.03,'triangle'),3000,8000)}
 else if(kind==='batalha'){const o=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=73.4;lp.type='lowpass';lp.frequency.value=380;g.gain.value=.035;o.connect(lp).connect(g).connect(out);o.start();L.push({s:o});
  let beat=0;const it=setInterval(()=>{const acc=beat%4===0,t=c.currentTime,k=c.createOscillator(),kg=c.createGain();k.frequency.setValueAtTime(acc?130:105,t);k.frequency.exponentialRampToValueAtTime(42,t+.18);kg.gain.setValueAtTime(acc?.5:.3,t);kg.gain.exponentialRampToValueAtTime(.0001,t+.25);k.connect(kg).connect(out);k.start(t);k.stop(t+.3);if(beat%8===6)ambBurst(c,out,900,.08,.12);beat++},420);tm.push({iv:it});
  every(()=>{ambBurst(c,out,3800,.09,.06);ambTone(c,out,1700+Math.random()*600,.5,.02,'triangle')},1800,4500)}
 AMB.stop=()=>{tm.forEach(x=>x&&x.iv?clearInterval(x.iv):clearTimeout(x));const t=c.currentTime;out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(out.gain.value,t);out.gain.linearRampToValueAtTime(0,t+1.2);setTimeout(()=>{L.forEach(n=>{try{n.s.stop()}catch{}});try{out.disconnect()}catch{}},1400)}}
function ambSync(){let want='nenhum';if(T.gid&&T.view==='play'&&T.game&&MOD('sound')&&sndOn()){const m=T.maps[T.game.activeMap],c=T.game.combat;want=c&&c.on&&RSET().battleAmb?'batalha':(m&&m.amb)||'nenhum'}if(want!==(AMB.key||'nenhum'))ambStart(want)}
ACT.gmAmb=async()=>{const m=T.maps[T.game.activeMap];if(!m){toast('Mostre um mapa primeiro.','err');return}const v=await modal({title:'🔊 Som ambiente',body:`<p class="small muted" style="margin-top:0">Som do mapa “${esc(m.name)}”, ouvido por todos na Tela de jogo (cada um pode silenciar no 🔊).</p><div class="tg-list">${Object.entries(AMB_LIST).map(([k,l])=>`<button class="tg ${((m.amb||'nenhum')===k)?'on':''}" data-k="${k}"><span class="grow"><b>${l}</b></span>${((m.amb||'nenhum')===k)?'✓':''}</button>`).join('')}</div><label class="toggle"><input type="checkbox" id="amB" ${RSET().battleAmb?'checked':''}><span class="sw"></span>Tocar “Batalha” automaticamente durante o combate</label>`,
  onMount:(ov,close)=>{$$('[data-k]',ov).forEach(b=>b.onclick=()=>close({k:b.dataset.k,b:$('#amB',ov).checked}))},actions:[{label:'Fechar',onClick:ov=>({b:$('#amB',ov).checked})}]});
 if(!v)return;if(v.b!==RSET().battleAmb)gamePatch({rules:{battleAmb:v.b}});if(v.k){mapPatch(m.id,{amb:v.k});ambSync()}};
/* subir de nível com escolhas */
const clsField=()=>fByRe(/classe|arqu[eé]tipo|ocupa/i,['select']);
const clsNames=()=>{const f=clsField();return f?(f.choices||[]).map(c=>c.name):[]};
const myClass=s=>{const f=clsField();if(!f||!s)return'';const c=choiceById(f,(s.values||{})[f.id]);return c?c.name:''};
ACT.pLevel=async()=>{const s=mySeat();if(!s||!(+s.pend>0))return;const a=actorRef('pc',S.uid),lv=lvlOf(a)-(+s.pend-1),cls=myClass(s),rs=RSET();
 const pool=(T.game.skills||[]).filter(k=>!(s.skills||[]).includes(k.id)&&(+k.lvl||1)<=lv&&(!k.cls||k.cls==='Todas'||normT(k.cls)===normT(cls)));const attrUp=rs.attrEvery>0&&lv%rs.attrEvery===0,ats=tplFields(T.game.template).filter(f=>f.type==='attr');
 const v=await modal({title:`⭐ Nível ${lv} — melhorias`,body:`${pool.length?`<label class="f">Escolha uma habilidade nova</label><div class="tg-list" style="max-height:300px;overflow:auto">${pool.map(k=>`<label class="tg" style="cursor:pointer"><input type="radio" name="lvS" value="${k.id}">${entIco(k)}<span class="grow"><b>${esc(k.name)}</b><small>${esc([k.type,k.effect,k.mp?('custa '+k.mp):''].filter(Boolean).join(' · '))}</small></span></label>`).join('')}</div>`:'<p class="muted">Nenhuma habilidade nova disponível para este nível.</p>'}
  ${attrUp&&ats.length?`<label class="f">Aumento de atributo: +1 em dois atributos (pode repetir)</label><div class="row"><select id="lvA1">${ats.map(f=>`<option value="${f.id}">${esc(f.label)} (${fieldVal(f,s.values||{})})</option>`).join('')}</select><select id="lvA2">${ats.map(f=>`<option value="${f.id}">${esc(f.label)} (${fieldVal(f,s.values||{})})</option>`).join('')}</select></div>`:''}`,
  actions:[{label:'Depois'},{label:'Confirmar',cls:'primary',onClick:ov=>({sk:($('input[name=lvS]:checked',ov)||{}).value,a1:($('#lvA1',ov)||{}).value,a2:($('#lvA2',ov)||{}).value})}]});
 if(!v)return;if(pool.length&&!v.sk){toast('Escolha uma habilidade.','err');return}const p={pend:(+s.pend||1)-1},vals={},picked=[];
 if(v.sk){p.skills=[...(s.skills||[]),v.sk];picked.push((T.game.skills.find(k=>k.id===v.sk)||{}).name)}
 if(v.a1){[v.a1,v.a2].filter(Boolean).forEach(id=>{const f=fById(id);const cur=vals[id]!=null?vals[id]:+fieldVal(f,s.values||{});vals[id]=Math.min(20,cur+1)});p.values=vals;picked.push('atributos '+Object.keys(vals).map(id=>fById(id).label+' '+vals[id]).join(', '))}
 seatPatch(S.uid,p);pushAct({type:'lv',txt:picked.join(' + ')||'nada'});toast('Melhorias aplicadas!');renderActBar()};
/* dados (jogador e mestre) */
ACT.pDice=async()=>{const s=mySeat(),me=isMaster(),a=s&&actorRef('pc',S.uid),attrs=tplFields(T.game.template).filter(f=>f.type==='attr'),sk=MOD('checks')&&a?skillList():[];
 await modal({title:'🎲 Rolar dados',body:`<div class="dq" style="grid-template-columns:repeat(4,1fr)">${[4,6,8,10,12,20,100].map(n=>`<button class="btn" data-roll="1d${n}">d${n}</button>`).join('')}<button class="btn" data-roll="2d20">2d20</button></div>
  <div class="row"><input id="pdExp" placeholder="Ex.: 1d20+5"><button class="btn primary" id="pdGo">Rolar</button></div>
  ${me&&MOD('secret')?'<label class="toggle"><input type="checkbox" id="pdS"><span class="sw"></span>🤫 Rolagem secreta (só você vê)</label>':''}
  ${a&&attrs.length?`<label class="f">Atributo</label><div class="row wrap">${attrs.map(f=>{const md=modOf(fieldVal(f,s.values||{}));return `<button class="btn sm" data-roll="1d20${md}" data-lbl="${esc(f.label)}">${esc(f.label)} ${md}</button>`}).join('')}</div>`:''}
  ${sk.length?`<label class="f">Perícias <span class="muted small">(★ = proficiente)</span></label><div class="row wrap">${sk.map(k=>{const b=skillBonus(a,k);return `<button class="btn sm" data-roll="1d20${b.mod>=0?'+':''}${b.mod}" data-lbl="${esc(k.n)}">${b.prof?'★ ':''}${esc(k.n)} ${b.mod>=0?'+':''}${b.mod}</button>`}).join('')}</div>`:''}`,
  onMount:(ov,close)=>{const go=(ex,l)=>{const sec=$('#pdS',ov)&&$('#pdS',ov).checked;close();tRoll(ex,l,sec)};$$('[data-roll]',ov).forEach(b=>b.onclick=()=>go(b.dataset.roll,b.dataset.lbl));$('#pdGo',ov).onclick=()=>go($('#pdExp',ov).value);$('#pdExp',ov).onkeydown=e=>{if(e.key==='Enter')go(e.target.value)}},actions:[{label:'Fechar'}]})};
/* barra de ações (nova) */
function renderActBar(){const el=$('#actbar');if(!el||!T.game)return;const c=T.game.combat,on=c&&c.on,cur=curEntry(),s=mySeat(),me=isMaster();let h='';
 if(s){const a=actorRef('pc',S.uid),inC=on&&c.order.some(o=>o.id===S.uid),my=inC&&cur&&cur.id===S.uid,wait=inC&&!my,acted=my&&RULES().oneAction&&T.actedTk===c.tk,dn=isDown(a),dying=my&&MOD('death')&&a.cond.includes('Caído')&&!a.cond.includes('Estável')&&!a.cond.includes('Morto');
  const dis=wait||acted||dn?'disabled':'',ln=lootNear(),sh=MOD('shop')&&T.game.shop&&T.game.shop.open,pend=MOD('levelup')&&+s.pend>0;
  h+=`<div class="ab-grp">${inC?`<span class="ab-info ${my?'my':''}">${a.cond.includes('Morto')?'☠️ Morto':dying?'💀 Caído — faça o teste de morte':dn?'🩸 '+(a.cond.includes('Estável')?'Estável':'Caído'):my?(T.endSent===c.tk?'⏳ Encerrando…':'⭐ Sua vez!'):'⏳ Vez de '+esc(cur?cur.name:'—')}</span>`:''}
   ${dying?`<button class="btn ab primary" data-act="pDeath" ${T.deathTk===c.tk?'disabled':''}>💀<span>Teste de morte</span></button>`:`<button class="btn ab" data-act="pAct" data-k="atk" ${dis}>⚔️<span>Atacar</span></button><button class="btn ab" data-act="pAct" data-k="skill" ${dis}>✨<span>Habilidade</span></button><button class="btn ab" data-act="pAct" data-k="item" ${dis}>🧪<span>Item</span></button><button class="btn ab" data-act="pDice">🎲<span>Teste</span></button><button class="btn ab" data-act="pBag">🎒<span>Mochila</span></button>`}
   ${ln&&!dn?`<button class="btn ab gold" data-act="pLoot">${esc(ln.ic||'💰')}<span>Pegar</span></button>`:''}${sh?`<button class="btn ab" data-act="pShop">🏪<span>${esc(T.game.shop.name||'Loja')}</span></button>`:''}${pend?`<button class="btn ab gold" data-act="pLevel">⭐<span>Melhorias (${+s.pend})</span></button>`:''}
   ${my&&!dying?`<button class="btn ab primary" data-act="pEnd" ${T.endSent===c.tk?'disabled':''}>⏭<span>Encerrar turno</span></button>`:''}
   ${my&&!dn&&RULES().moveLimit?`<span class="ab-info">👣 ${speedOf(a)}${acted?' · ação usada':''}</span>`:''}</div>`}
 if(me){const npc=on&&cur&&cur.kind==='npc'?actorRef('npc',cur.id):null,acted=npc&&RULES().oneAction&&T.actedTk===c.tk;
  h+=`<div class="ab-grp gm">${on?`<button class="btn ab primary" data-act="cbNext">⏭<span>Próximo turno</span></button>`:`<button class="btn ab primary" data-act="cbStart">⚔️<span>Iniciar combate</span></button>`}
   ${MOD('checks')?'<button class="btn ab" data-act="gmReq">🎯<span>Pedir teste</span></button>':''}<button class="btn ab" data-act="cbSpawn">👹<span>Inimigos</span></button><button class="btn ab" data-act="gmTools">🧰<span>Ferramentas</span></button>
   ${on?'<button class="btn ab danger" data-act="cbEnd">🏳<span>Fim do combate</span></button>':''}
   ${npc?`<span class="ab-info my">${esc(npc.name)}:</span><button class="btn ab" data-act="pAct" data-k="atk" data-npc="${npc.id}" ${acted?'disabled':''}>⚔️<span>Atacar</span></button><button class="btn ab" data-act="pAct" data-k="skill" data-npc="${npc.id}" ${acted?'disabled':''}>✨<span>Habilidade</span></button><span class="ab-info">👣 ${speedOf(npc)}</span>`:''}</div>`}
 if(!s&&!me)h='<span class="ab-info">Entre na mesa pela aba Ficha para jogar.</span>';
 el.innerHTML=h}
ACT.gmTools=async()=>{const T0=[['gmCond','🌀','Condição','cond'],['gmChest','📦','Baú de tesouro','loot'],['gmShow','🖼','Mostrar ao grupo','handouts'],['gmShop','🏪','Loja','shop'],['gmAmb','🔊','Som ambiente','sound'],['cbXp','⭐','Dar XP',''],['cbRest','🏕','Descanso',''],['pDice','🎲','Dados'+(MOD('secret')?' / secreta':''),''],['pDiaryOpen','📖','Diário e notas','quests'],['tblBackup','💾','Backup da campanha','']].filter(x=>!x[3]||MOD(x[3]));
 const v=await modal({title:'🧰 Ferramentas do mestre',body:`<div class="gm-grid">${T0.map(([k,i,l])=>`<button class="gm-t" data-k="${k}"><span>${i}</span>${l}</button>`).join('')}</div>`,onMount:(ov,close)=>$$('[data-k]',ov).forEach(b=>b.onclick=()=>close(b.dataset.k)),actions:[{label:'Fechar'}]});
 if(v&&ACT[v])ACT[v]()};
ACT.pDiaryOpen=()=>{const d=$('#diary');if(d&&!d.classList.contains('open'))ACT.pDiary()};
ACT.pBag=async()=>{const s=mySeat();if(!s)return;const draw=ov=>{const s=mySeat(),a=actorRef('pc',S.uid),items=(s.inv||[]).map(e=>({e,it:itemById(e.item)})).filter(x=>x.it);
  $('#bgH',ov).innerHTML=`💰 ${+s.coins||0} moedas · 🛡 Defesa ${defOf(a)}`;
  $('#bgL',ov).innerHTML=items.map(({e,it})=>`<div class="tg">${entIcon(it,'🎒')}<span class="grow"><b>${esc(it.name)} ×${e.qty}</b><small>${esc([it.slot&&it.slot!=='—'?it.slot:'',it.effect,it.desc].filter(Boolean).join(' · ').slice(0,120))}</small></span>${MOD('equip')&&it.slot&&it.slot!=='—'?`<button class="btn sm ${e.eq?'primary':''}" data-eq="${e.k}">${e.eq?'✓ Equipado':'Equipar'}</button>`:''}</div>`).join('')||'<p class="muted">Mochila vazia.</p>'};
 await modal({title:'🎒 Mochila',body:`<p id="bgH" style="margin-top:0"></p><div class="tg-list" id="bgL"></div><p class="small muted">Poções e itens de cura: use o botão 🧪 Item.</p>`,onMount:ov=>{draw(ov);$('#bgL',ov).onclick=e=>{const b=e.target.closest('[data-eq]');if(!b)return;toggleEquip(b.dataset.eq);setTimeout(()=>draw(ov),30)}},actions:[{label:'Fechar',cls:'primary'}]})};
/* ícones de condição nos tokens; saque e explosões no mapa */
function tlPost(x,t,s,cx,cy,r,now,cell){tlPost_v8(x,t,s,cx,cy,r,now,cell);const cd=(t.cond||[]).filter(n=>n!=='Caído');if(!cd.length||t.down)return;x.save();x.font=`${Math.max(9,Math.round(cell*.3))}px ${EMOJI_FONT}`;x.textAlign='center';x.textBaseline='middle';cd.slice(0,3).forEach((n,i)=>{const px=cx+r*.9,py=cy-r*.7+i*cell*.3;x.fillStyle='rgba(0,0,0,.6)';x.beginPath();x.arc(px,py,cell*.17,0,7);x.fill();x.fillText(condIc(n),px,py+1)});x.restore()}
function tlPre(x,cell,now,m){tlPre_v8(x,cell,now,m);
 if(MOD('loot')&&(m.loot||[]).length){x.save();x.font=`${Math.round(cell*.66)}px ${EMOJI_FONT}`;x.textAlign='center';x.textBaseline='middle';m.loot.forEach(l=>{if(TL.vis&&TL.mode==='player'&&!TL.vis[l.y*m.w+l.x])return;x.shadowColor='rgba(255,190,80,.9)';x.shadowBlur=8+Math.sin(now/300+l.x)*5;x.fillText(l.ic||'💰',(l.x+.5)*cell,(l.y+.52)*cell+Math.sin(now/450+l.y)*cell*.04)});x.restore()}
 TL.fx=(TL.fx||[]).filter(f=>now-f.t<1000);TL.fx.forEach(f=>{if(f.m!==m.id||now<f.t)return;const p=(now-f.t)/1000,cx=(f.x+.5)*cell,cy=(f.y+.5)*cell,R=(f.r+.5)*cell;x.save();x.globalAlpha=1-p;const g=x.createRadialGradient(cx,cy,0,cx,cy,R*(.35+.65*p));g.addColorStop(0,'rgba(255,230,140,.9)');g.addColorStop(.5,'rgba(255,120,40,.6)');g.addColorStop(1,'rgba(157,92,255,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,R,0,7);x.fill();x.strokeStyle='rgba(255,200,120,.8)';x.lineWidth=3;x.beginPath();x.arc(cx,cy,R*(.35+.65*p),0,7);x.stroke();x.restore()})}
function v11after(){if(!T.game)return;try{renderReq();renderReqRes();handoutWatch();questWatch();ambSync();if($('#diary')&&$('#diary').classList.contains('open'))renderDiary();
 const s=mySeat();if(s&&+s.pend>0&&T.pendSeen!==+s.pend&&MOD('levelup')){T.pendSeen=+s.pend;if(T.view==='play')setTimeout(()=>banner(`<div class="cb-s">Você subiu de nível</div><div class="cb-t">⭐ Escolha suas melhorias</div>`,'',2200),3200)}}catch(e){console.warn('v11',e)}}
/* conteúdo extra do kit */
function extraKit(){const g=T.game,items=cl(g.items||[]),skills=cl(g.skills||[]),hpL=RULES().hp?fById(RULES().hp).label:'Vida';
 const I1=(o)=>{let e=items.find(x=>x.name===o.name);if(!e){e={id:uid(),weight:'',value:'',desc:'',...o};items.push(e)}else Object.keys(o).forEach(k=>{if(e[k]==null||e[k]==='')e[k]=o[k]});return e.id};
 const S1=(o)=>{let e=skills.find(x=>x.name===o.name);if(!e){e={id:uid(),cost:'',...o};skills.push(e)}return e.id};
 I1({name:'Gibão de couro',icon:'🥋',type:'Armadura',slot:'Armadura',ac:11,acDex:'DES completa',value:'10 po',weight:5,effect:'Defesa 11 + DES'});I1({name:'Brunea',icon:'🦺',type:'Armadura',slot:'Armadura',ac:14,acDex:'DES até +2',value:'50 po',weight:20,effect:'Defesa 14 + DES (máx. 2)'});
 I1({name:'Cota de malha',icon:'⛓️',type:'Armadura',slot:'Armadura',ac:16,acDex:'Sem DES',value:'75 po',weight:27,effect:'Defesa 16'});I1({name:'Escudo',icon:'🛡️',type:'Armadura',slot:'Escudo',acBonus:2,value:'10 po',weight:3,effect:'+2 Defesa'});
 I1({name:'Anel de proteção',icon:'💍',type:'Equipamento',slot:'Acessório',acBonus:1,value:'200 po',effect:'+1 Defesa'});
 ['Espada longa','Cajado','Adaga','Arco curto','Maça','Machado grande','Cimitarra','Clava gigante'].forEach(n=>{const e=items.find(x=>x.name===n);if(e&&!e.slot)e.slot='Arma'});const gr=items.find(x=>x.name==='Garras e presas');if(gr)gr.natural=true;[['Mísseis mágicos','Mago'],['Raio de fogo','Mago'],['Curar ferimentos','Clérigo'],['Chama sagrada','Clérigo'],['Golpe poderoso','Guerreiro'],['Segundo fôlego','Guerreiro'],['Ataque furtivo','Ladino']].forEach(([n,c])=>{const k=skills.find(x=>x.name===n);if(k&&!k.cls){k.cls=c;k.lvl=k.lvl||1}});
 const int=attrLab('INT'),sab=attrLab('SAB'),des=attrLab('DES'),car=attrLab('CAR');
 S1({name:'Bola de fogo',icon:'☄️',type:'Magia',dmg:'3d6',atk:int,save:des,area:2,mp:4,range:'20',lvl:3,cls:'Mago',effect:'3d6 em área (raio 2); DES reduz à metade'});
 S1({name:'Bênção',icon:'🙏',type:'Magia',cond:'Abençoado',atk:'— (acerta sempre)',mp:2,range:'6',lvl:1,cls:'Clérigo',effect:'Aliado fica Abençoado (+2) por 3 rodadas'});
 S1({name:'Cura em grupo',icon:'💞',type:'Magia',heal:'1d6',atk:sab,area:2,mp:4,range:'6',lvl:3,cls:'Clérigo',effect:'Cura 1d6 + SAB em aliados na área'});
 S1({name:'Lâmina envenenada',icon:'🧪',type:'Ativa',dmg:'1d6',atk:des,cond:'Envenenado',mp:2,range:'1',lvl:2,cls:'Ladino',effect:'1d6 e envenena (3 rodadas)'});
 S1({name:'Grito de guerra',icon:'📣',type:'Ativa',cond:'Amedrontado',atk:car,save:attrLab('SAB'),area:2,mp:2,range:'1',lvl:2,cls:'Guerreiro',effect:'Inimigos próximos ficam amedrontados (SAB resiste)'});
 S1({name:'Escudo arcano',icon:'🔰',type:'Magia',cond:'Protegido',atk:'— (acerta sempre)',mp:1,range:'0',lvl:2,cls:'Mago',effect:'+2 Defesa em si mesmo por 3 rodadas'});
 S1({name:'Raio paralisante',icon:'🧊',type:'Magia',cond:'Paralisado',atk:int,save:attrLab('CON'),mp:3,range:'12',lvl:4,cls:'Mago',effect:'Alvo perde o próximo turno (CON resiste)'});
 gamePatch({items,skills})}
const _kitV8=addStarterKit;addStarterKit=function(){const r=_kitV8();try{extraKit()}catch(e){console.warn(e)}return r};
/* aventura de exemplo */
function paintRect(m,x0,y0,x1,y1,ch){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)setTile(m,x,y,ch)}
function paintRoom(m,x0,y0,x1,y1,fl){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)setTile(m,x,y,(x===x0||x===x1||y===y0||y===y1)?'k':fl)}
function buildAdventure(){if(!T.game.chars.some(c=>c.name==='Goblin'&&!c.clone))addStarterKit();else extraKit();
 const g=T.game,it=n=>(g.items.find(i=>i.name===n)||{}).id,base=n=>g.chars.find(c=>c.name===n&&!c.clone),r=RULES();const items=cl(g.items);
 const add=o=>{let e=items.find(i=>i.name===o.name);if(!e){e={id:uid(),weight:'',value:'',desc:'',...o};items.push(e)}return e.id};
 const amu=add({name:'Amuleto da Lua Verde',icon:'🟢',type:'Tesouro',value:'120 po',effect:'Brilha perto de mortos-vivos',desc:'Pingente de jade com uma lua gravada. Era a fonte das luzes verdes.'}),chave=add({name:'Chave enferrujada',icon:'🗝️',type:'Chave/Missão',effect:'Abre a cripta sob o moinho'});
 gamePatch({items});
 const M1=newMapObj('Vila de Vale Raso','dark','field',34,22),M2=newMapObj('Porão do Moinho','dark','empty',30,20),M3=newMapObj('Cripta Esquecida','dark','empty',28,20);
 paintRect(M1,0,11,33,11,'r');paintRect(M1,12,0,12,21,'r');paintRect(M1,30,0,31,21,'a');paintRect(M1,3,3,7,7,'h');paintRect(M1,16,3,20,6,'h');paintRect(M1,3,14,7,18,'h');
 paintRoom(M1,23,13,29,18,'b');setTile(M1,26,13,'d');paintRect(M1,26,12,26,12,'r');[[1,1],[9,2],[2,9],[22,2],[25,4],[27,8],[8,20],[15,19],[19,16],[1,20],[33,2],[33,19],[10,15],[21,20]].forEach(([x,y])=>setTile(M1,x,y,'t'));
 M1.labels=[{id:uid(),t:'Taverna do Javali Torto',x:5,y:8},{id:uid(),t:'Casa do moleiro',x:18,y:7},{id:uid(),t:'Ferreiro',x:5,y:19},{id:uid(),t:'Moinho',x:26,y:19}];M1.objs=[{id:uid(),k:'🛢️',x:22,y:12},{id:uid(),k:'⛲',x:14,y:13}];M1.spawn={x:12,y:11};M1.amb='floresta';
 M1.links={'26,13':{to:M2.id}};
 paintRoom(M2,2,2,11,9,'f');paintRect(M2,11,5,18,5,'f');paintRect(M2,11,4,18,4,'k');paintRect(M2,11,6,18,6,'k');setTile(M2,11,5,'d');paintRoom(M2,18,2,27,12,'c');setTile(M2,18,5,'d');setTile(M2,23,12,'d');setTile(M2,2,5,'d');
 M2.objs=[{id:uid(),k:'🛢️',x:4,y:3},{id:uid(),k:'🛢️',x:5,y:3},{id:uid(),k:'🕸️',x:10,y:8},{id:uid(),k:'🦴',x:8,y:4},{id:uid(),k:'🕯️',x:22,y:3},{id:uid(),k:'📜',x:25,y:9}];M2.labels=[{id:uid(),t:'Depósito de grãos',x:6,y:8},{id:uid(),t:'Toca dos goblins',x:22,y:11}];
 M2.spawn={x:3,y:5};M2.fogOn=true;M2.vision=6;M2.fog='0'.repeat(M2.w*M2.h);M2.amb='caverna';M2.links={'23,12':{to:M3.id},'2,5':{to:M1.id}};M2.loot=[{id:uid(),x:3,y:8,items:[{item:it('Poção de cura'),qty:1}].filter(x=>x.item),coins:12,ic:'📦'}];
 paintRoom(M3,3,3,24,17,'c');setTile(M3,14,17,'d');[[8,7],[8,13],[19,7],[19,13]].forEach(([x,y])=>setTile(M3,x,y,'w'));
 M3.objs=[{id:uid(),k:'🗿',x:14,y:5},{id:uid(),k:'🕯️',x:12,y:5},{id:uid(),k:'🕯️',x:16,y:5},{id:uid(),k:'⚰️',x:5,y:6},{id:uid(),k:'⚰️',x:22,y:6},{id:uid(),k:'⚰️',x:5,y:14},{id:uid(),k:'💀',x:22,y:14}];M3.labels=[{id:uid(),t:'Altar da Lua Verde',x:14,y:4}];
 M3.spawn={x:14,y:16};M3.fogOn=true;M3.vision=7;M3.fog='0'.repeat(M3.w*M3.h);M3.amb='masmorra';M3.links={'14,17':{to:M2.id}};M3.loot=[{id:uid(),x:14,y:6,items:[],coins:50,ic:'⚰️'}];
 [M1,M2,M3].forEach(m=>{T.maps[m.id]=m;sharedWrite('games/'+T.gid+'/maps/'+m.id,{set:cl(m)})});
 const chars=cl(T.game.chars),hpSet=(v,n)=>{if(r.hp)v[r.hp]={cur:n,max:n};return v};
 const mk=(b,name,pos,extra={})=>{const c=cl(b);c.id=uid();c.clone=b.id;c.name=name;c.down=false;c.token=pos;Object.assign(c,extra);chars.push(c);return c};
 const npcBase={id:uid(),name:'Osvaldo, o moleiro',kind:'npc',emoji:'👨‍🌾',color:'#8a6a3a',values:hpSet(defaultValues(T.game.template),6),skills:[],inv:[],token:{m:M1.id,x:20,y:8},xp:0,ally:true};chars.push(npcBase);
 const gb=base('Goblin'),sk=base('Esqueleto'),lb=base('Lobo');
 if(gb){mk(gb,'Goblin vigia',{m:M2.id,x:21,y:6},{inv:[...(gb.inv||[]),{k:uid(),item:chave,qty:1}]});mk(gb,'Goblin ladrão',{m:M2.id,x:24,y:8})}
 if(gb){const boss=mk(gb,'Grik, o chefe goblin',{m:M3.id,x:14,y:7},{xp:200,emoji:'👺',color:'#8e2a1e',inv:[...(gb.inv||[]),{k:uid(),item:amu,qty:1}]});boss.values=hpSet({...(boss.values||{})},21);if(r.def)boss.values[r.def]=15}
 if(sk){mk(sk,'Esqueleto 1',{m:M3.id,x:10,y:9});mk(sk,'Esqueleto 2',{m:M3.id,x:18,y:9})}if(lb)mk(lb,'Lobo de Grik',{m:M3.id,x:15,y:8});
 const quest={id:uid(),title:'O que rói os sacos do moinho?',desc:'Osvaldo, o moleiro, oferece 50 moedas de ouro para descobrir quem anda roubando os grãos do porão — e por que luzes verdes aparecem à noite.',status:'ativa',steps:[{t:'Falar com Osvaldo na vila',done:false},{t:'Investigar o porão do moinho',done:false},{t:'Encontrar a origem das luzes verdes',done:false},{t:'Derrotar quem está por trás de tudo',done:false}]};
 const prep=[{id:uid(),title:'Bilhete rabiscado',text:'“Mais grãos para o Mestre Verde. Quando a lua encher, a cripta abre. — G.”\n\n(Encontrado com o goblin vigia.)'},{id:uid(),title:'A recompensa de Osvaldo',text:'Osvaldo conta as 50 moedas de ouro com as mãos trêmulas e ainda embrulha uma torta de maçã quente: “Vocês salvaram meu moinho — e talvez a vila inteira.”'}];
 const notes=`ROTEIRO — O Porão do Moinho (one-shot para nível 1, 2 a 4 jogadores, ~2 horas)

1) VILA (mapa “Vila de Vale Raso”): Inicie a sessão. Osvaldo procura o grupo na estrada. Ele conta sobre os sacos roídos e as luzes verdes. Teste de Intuição CD 10: ele está escondendo que ouviu vozes. Recompensa: 50 po. A loja (Mercado) pode abrir aqui.
2) PORÃO (ande até a porta do Moinho): névoa ativa. No depósito há um baú com poção. Teste de Percepção CD 12 revela pegadas pequenas indo para o leste. Na toca, 2 goblins (use ⚔️ Iniciar combate). O vigia carrega a Chave enferrujada e o bilhete (🖼 Mostrar ao grupo → “Bilhete rabiscado”).
3) CRIPTA (porta ao sul da toca): Grik, o chefe goblin, tenta despertar o altar com o Amuleto da Lua Verde. Com ele: 2 esqueletos e um lobo. Se o grupo estiver ferido, Grik negocia (Persuasão/Intimidação CD 15). Derrotado, deixa o amuleto.
4) FIM: volte à vila, revele “A recompensa de Osvaldo”, conclua a missão no 📖 Diário e use 🏁 Fim do combate / ⭐ Dar XP (sugestão: 300 XP para o grupo).
Gancho futuro: o amuleto brilha mais forte ao norte… quem é o “Mestre Verde”?`;
 const shop={open:false,name:'Mercado de Vale Raso',items:[['Poção de cura',50,5],['Poção de mana',50,3],['Adaga',2,999],['Arco curto',25,2],['Gibão de couro',10,2],['Escudo',10,2]].map(([n,p,s])=>({item:it(n),price:p,stock:s})).filter(x=>x.item)};
 gamePatch({chars,quests:[quest,...(T.game.quests||[])],prep:[...(T.game.prep||[]),...prep],gmNotes:(T.game.gmNotes?T.game.gmNotes+'\n\n':'')+notes,shop,activeMap:M1.id});
 return{maps:3}}
ACT.advBuild=async()=>{if(!await confirmDlg('Criar a aventura “O Porão do Moinho”? Serão adicionados 3 mapas ligados por portas, NPCs, inimigos, uma missão, revelações, uma loja e o roteiro nas Notas do mestre. O mapa da vila passa a ser o visível.','Criar aventura'))return;const b=busy('Montando a aventura…');try{buildAdventure();toast('Aventura criada! Leia o roteiro em 📖 Diário → Notas do mestre.')}catch(e){console.warn(e);toast('Não consegui criar a aventura.','err')}finally{b.done()}if(T.mtab==='maps')MR.maps();else renderTab()};
/* regras: painel de módulos */
const _mrRulesV8=MR.rules;
MR.rules=()=>{_mrRulesV8();const pad=$('#tMain .tpad');if(!pad)return;const rs=RSET(),first=pad.querySelector('.card');
 const extra={checks:`<button class="btn sm" data-me="skills">Editar perícias</button><label class="ckrow" style="margin:0"><input type="checkbox" data-rb="saveProf" ${rs.saveProf?'checked':''}> Proficiência nas resistências</label>`,loot:`<label class="small">Moedas por inimigo <input data-rs="lootCoins" value="${esc(rs.lootCoins)}" style="width:80px"></label>`,cond:`<button class="btn sm" data-me="conds">Editar condições (${condDefs().length})</button>`,area:`<label class="ckrow" style="margin:0"><input type="checkbox" data-rb="areaAllies" ${rs.areaAllies?'checked':''}> Área atinge aliados</label>`,shop:`<label class="small">Venda paga <input type="number" data-rn2="sellRatio" value="${Math.round(rs.sellRatio*100)}" style="width:64px">%</label>`,sound:`<label class="ckrow" style="margin:0"><input type="checkbox" data-rb="battleAmb" ${rs.battleAmb?'checked':''}> Batalha automática no combate</label>`,levelup:`<label class="small">Atributos +2 a cada <input type="number" data-rn="attrEvery" value="${rs.attrEvery}" min="0" style="width:56px"> níveis</label><span class="small muted">Defina “Nível mínimo” e “Classe” nas habilidades.</span>`};
 first.insertAdjacentHTML('afterend',`<div class="card" style="margin-top:14px"><h3>Mecânicas da mesa</h3><p class="small muted" style="margin-top:0">Ligue só o que combina com o seu jogo. Tudo pode ser mudado a qualquer momento, inclusive no meio da campanha.</p><div class="mods">${MOD_INFO.map(([k,t,d])=>`<div class="modr ${MOD(k)?'':'off'}"><label class="toggle" style="margin:0"><input type="checkbox" data-mod="${k}" ${MOD(k)?'checked':''}><span class="sw"></span><span><b>${t}</b><br><span class="small muted">${d}</span></span></label>${extra[k]?`<div class="mod-x">${extra[k]}</div>`:''}</div>`).join('')}</div></div>`);
 pad.insertAdjacentHTML('beforeend',`<div class="card" style="margin-top:14px"><h3>🏚 Aventura pronta: O Porão do Moinho</h3><p class="small muted">Uma primeira sessão completa para nível 1: vila, porão e cripta ligados por portas, NPC, goblins, esqueletos e um chefe, baús, loja, missão com etapas, revelações e um roteiro passo a passo nas Notas do mestre.</p><button class="btn primary" data-act="advBuild">🏚 Criar aventura de exemplo</button></div>`);
 const save=p=>{gamePatch({rules:p});toast('Regras salvas')};
 $$('[data-mod]',pad).forEach(i=>i.onchange=()=>{save({mods:{[i.dataset.mod]:i.checked}});i.closest('.modr').classList.toggle('off',!i.checked)});
 $$('[data-rb]',pad).forEach(i=>i.onchange=()=>save({[i.dataset.rb]:i.checked}));
 $$('[data-rs]',pad).forEach(i=>i.onchange=()=>save({[i.dataset.rs]:i.value.trim()||'0'}));
 $$('[data-rn2]',pad).forEach(i=>i.onchange=()=>save({[i.dataset.rn2]:clamp((+i.value||0)/100,0,1)}));
 $$('.mods [data-rn]',pad).forEach(i=>i.onchange=()=>save({[i.dataset.rn]:+i.value||0}));
 $$('[data-me]',pad).forEach(b=>b.onclick=()=>b.dataset.me==='skills'?editSkills():editConds())};
async function editSkills(){const L=skillList();const v=await modal({title:'Perícias',body:`<p class="small muted" style="margin-top:0">Uma por linha, no formato <b>Nome = Atributo</b>. O jogador é proficiente nas perícias escritas no campo “Perícias” da ficha dele (ganha o bônus de proficiência).</p><textarea id="skT" rows="14" style="width:100%">${esc(L.map(s=>s.n+' = '+s.a).join('\n'))}</textarea>`,actions:[{label:'Restaurar padrão',value:'reset'},{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>$('#skT',ov).value}]});
 if(v==null||v===false)return;const skills=v==='reset'?[]:v.split('\n').map(l=>l.split('=')).filter(p=>p[0]&&p[0].trim()).map(([n,a])=>({n:n.trim(),a:(a||'').trim()}));gamePatch({rules:{skills}});toast('Perícias salvas');MR.rules()}
async function editConds(){let L=cl(condDefs());const fxOpt=v=>`<option value="">—</option>${Object.entries(COND_FX).map(([k,l])=>`<option value="${k}" ${v===k?'selected':''}>${l}</option>`).join('')}`;
 const draw=ov=>{$('#cdL',ov).innerHTML=L.map((c,i)=>`<div class="cdrow"><input value="${esc(c.ic)}" data-ci="${i}" data-f="ic" style="width:44px;text-align:center"><input value="${esc(c.n)}" data-ci="${i}" data-f="n" style="flex:1;min-width:110px"><label class="small">rodadas <input type="number" value="${c.d||0}" data-ci="${i}" data-f="d" style="width:56px"></label>${[0,1,2].map(j=>{const f=(c.fx||[])[j]||[];return `<span class="cdfx"><select data-ci="${i}" data-fx="${j}">${fxOpt(f[0])}</select><input value="${esc(f[1]??'')}" data-ci="${i}" data-fv="${j}" placeholder="valor" style="width:58px"></span>`}).join('')}<button class="btn sm ghost" data-rm="${i}">🗑</button></div>`).join('')};
 const sync=ov=>{$$('[data-ci]',ov).forEach(el=>{const c=L[+el.dataset.ci];if(!c)return;if(el.dataset.f)c[el.dataset.f]=el.dataset.f==='d'?+el.value||0:el.value;});L.forEach((c,i)=>{c.fx=[0,1,2].map(j=>{const s=$(`[data-ci="${i}"][data-fx="${j}"]`,ov),v=$(`[data-ci="${i}"][data-fv="${j}"]`,ov);return s&&s.value?(v&&v.value!==''?[s.value,isNaN(+v.value)?v.value:+v.value]:[s.value]):null}).filter(Boolean)})};
 const v=await modal({title:'🌀 Condições',wide:true,body:`<p class="small muted" style="margin-top:0">Cada condição pode ter até 3 efeitos. Valores: número para bônus (+2, −2) e dados para dano/cura por turno (1d4).</p><div id="cdL" class="cdlist"></div><button class="btn sm" id="cdAdd">+ Nova condição</button>`,
  onMount:ov=>{draw(ov);$('#cdAdd',ov).onclick=()=>{sync(ov);L.push({n:'Nova condição',ic:'⭐',d:2,fx:[]});draw(ov)};$('#cdL',ov).onclick=e=>{const b=e.target.closest('[data-rm]');if(!b)return;sync(ov);L.splice(+b.dataset.rm,1);draw(ov)};ov._sync=()=>sync(ov)},
  actions:[{label:'Restaurar padrão',value:'reset'},{label:'Cancelar'},{label:'Salvar',cls:'primary',onClick:ov=>{ov._sync();return 'save'}}]});
 if(!v)return;gamePatch({rules:{conds:v==='reset'?[]:L.filter(c=>c.n.trim())}});toast('Condições salvas');MR.rules()}
function speedOf(a){const s=speedOf_v8(a);return MOD('cond')&&cfx(a).slow?Math.max(1,Math.floor(s/2)):s}
{const fi=ENT.items.fields,ix=fi.findIndex(f=>f[0]==='healBar');fi.splice(ix+1,0,['slot','Equipar como','select',['—','Arma','Armadura','Escudo','Acessório']],['ac','Defesa da armadura (11 leve, 14 média, 16 pesada)','number'],['acDex','Soma a Destreza?','select',['DES completa','DES até +2','Sem DES']],['acBonus','Bônus de Defesa (escudo +2, anel +1)','number']);
 const fs=ENT.skills.fields,iy=fs.findIndex(f=>f[0]==='mp');fs.splice(iy+1,0,['area','Raio da área (quadrados; 0 = um alvo)','number'],['save','Resistência do alvo (metade do dano se passar)','select',()=>['— (sem resistência)',...attrOpts().slice(1)]],['cond','Aplica condição','select',()=>['—',...condDefs().map(c=>c.n)]],['lvl','Nível mínimo (para escolher ao subir de nível)','number'],['cls','Classe que pode aprender','select',()=>['Todas',...clsNames()]])}
const _pTabs11=ACT.pTabs;ACT.pTabs=()=>{_pTabs11();ambSync()};
const _pSound11=ACT.pSound;ACT.pSound=()=>{_pSound11();ambSync()};
