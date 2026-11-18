/* ============ v30: menus por tipo de projeto ============
   Livro: sem Compêndio (wiki), sem menções @. Barra do celular: Escrever, Planejar, Estilo, Publicar.
   RPG: barra com Escrever, Compêndio e Mesa de jogo; Publicar e Estilo do livro ficam em "Mais" (também no computador). */
const isRpgP=(p=P())=>!!p&&p.type==='rpg';
mobileMain=function(p=P()){return isRpgP(p)?['write','codex','table']:['write','board','style','publish']};
{const _rn2=railNav;railNav=function(){let h=_rn2.apply(this,arguments);if(!S.P)return h;
 if(!isRpgP()){h=h.replace(/<button data-act="view" data-v="codex"[^>]*>[\s\S]*?<\/button>/,'').replace('<div class="rsep">Mundo</div>','<div class="rsep">Imagens</div>')}
 else{h=h.replace(/<button data-act="view" data-v="(style|publish)" class="[^"]*"/g,(m,k)=>`<button data-act="view" data-v="${k}" class="ik-rh"`).replace('<div class="rsep">Livro pronto</div>','').replace('class="show-m ik-more"','class="show-m ik-more ik-more-d"')}
 return h}}
{const _mm=ACT.moreM;ACT.moreM=async function(...a){const p=P();
 if(isRpgP(p)&&!isPhone()){const its=[{i:I('brush'),t:'Estilo do livro',d:'Fontes, tema, marca d’água',run:()=>showView('style'),on:groupOf(S.view)==='style'},{i:I('out'),t:'Publicar',d:'Livro da campanha (PDF/Word), importar, Explorar',run:()=>showView('publish'),on:groupOf(S.view)==='publish'}];ikMenu($('#tabs .ik-more'),its,{title:'Mais'});return}
 const g=RAIL_GROUPS[1],saved=g[1];if(!isRpgP(p))g[1]=saved.filter(k=>k!=='codex');try{return _mm.apply(this,a)}finally{g[1]=saved}}}
{const _sv3=showView;showView=function(v){if(v==='codex'&&S.P&&!isRpgP())v='write';return _sv3.call(this,v)}}
{const _cl=cmdList;cmdList=function(){const L=_cl.apply(this,arguments);if(ikCtx()!=='project'||isRpgP())return L;return L.filter(x=>!(x.g==='Compêndio'||x.g==='Mundo'&&/compêndio/i.test(x.t)||x.t==='Compêndio'||/Mencionar ficha/.test(x.t)))}}
{const _mc=mentionCheck;mentionCheck=function(){if(S.P&&!isRpgP())return mentionClose();return _mc.apply(this,arguments)}}
{const _mcard=mentionCard;mentionCard=function(el){if(S.P&&!isRpgP())return;return _mcard.apply(this,arguments)}}
