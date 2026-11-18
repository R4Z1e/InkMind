/* ============ v29: rolador de dados do editor com dados animados · escolhas deslizantes no celular ============ */
{const _rd=renderDice;renderDice=function(last){_rd.apply(this,arguments);const d=$('#dice');if(!d)return;
 const go=ex=>{let r;try{r=roll(ex)}catch{toast('Expressão inválida. Use algo como 2d6+3.','err');return}
  diceHist.unshift(r);const res=$('.res',d),det=$('.det',d);if(res){res.textContent='🎲';res.classList.add('rolling')}if(det)det.textContent='Rolando…';
  let who='Você';try{who=myName()}catch{}let look=null;try{look=(prof()||{}).look||null}catch{}
  diceQueue({id:uid(),t:Date.now(),e:r.expr+' → '+r.detail,v:r.total,big:r.total,l:'Rolagem',who,look,color:'#5b4fa8',dice:(r.dice||[]).slice(0,12)});
  clearTimeout(S._diceT);S._diceT=setTimeout(()=>{if($('#dice.open'))renderDice(r)},2700)};
 $$('[data-roll]',d).forEach(b=>b.onclick=()=>go(b.dataset.roll));
 $('#dgo',d).onclick=()=>go($('#dexp',d).value);$('#dexp',d).onkeydown=e=>{if(e.key==='Enter')go(e.target.value)}}}
/* escolhas com imagem (estilo do mapa, tipo de projeto…): no celular deslizam para o lado */
{const _md=modal;modal=function(o){const p=_md.apply(this,arguments);requestAnimationFrame(()=>{try{const ovs=$$('.ov'),ov=ovs[ovs.length-1];if(ov)$$('.typepick',ov).forEach(tp=>{if(tp.dataset.sw)return;tp.dataset.sw=1;
 if(tp.children.length>1&&matchMedia('(max-width:860px)').matches)tp.insertAdjacentHTML('afterend','<p class="tp-hint">← deslize para ver as outras opções →</p>')})}catch{}});return p}}
