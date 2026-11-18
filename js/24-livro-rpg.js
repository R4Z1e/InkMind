/* ============ v30/v31: menus por tipo de projeto ============
   Livro: Escrever, Planejar, Wiki (wiki do mundo + dicionário do escritor), Publicar; Estilo e Galeria em "Mais".
   RPG: Escrever, Compêndio e Mesa de jogo; Publicar e Estilo do livro ficam em "Mais" (também no computador). */
const isRpgP=(p=P())=>!!p&&p.type==='rpg';
mobileMain=function(p=P()){return isRpgP(p)?['write','codex','table']:['write','board','codex','publish']};
{const _rn2=railNav;railNav=function(){let h=_rn2.apply(this,arguments);if(!S.P)return h;
 if(!isRpgP())h=h.replace(/(<button data-act="view" data-v="codex"[^>]*>[\s\S]*?<span>)Compêndio(<\/span>)/,'$1Wiki<i class="hide-m" style="font-style:normal"> e dicionário</i>$2');
 else h=h.replace(/<button data-act="view" data-v="(style|publish)" class="[^"]*"/g,(m,k)=>`<button data-act="view" data-v="${k}" class="ik-rh"`).replace('<div class="rsep">Livro pronto</div>','').replace('class="show-m ik-more"','class="show-m ik-more ik-more-d"');
 return h}}
{const _mm=ACT.moreM;ACT.moreM=async function(...a){const p=P();
 if(isRpgP(p)&&!isPhone()){const its=[{i:I('brush'),t:'Estilo do livro',d:'Fontes, tema, marca d’água',run:()=>showView('style'),on:groupOf(S.view)==='style'},{i:I('out'),t:'Publicar',d:'Livro da campanha (PDF/Word), importar, Explorar',run:()=>showView('publish'),on:groupOf(S.view)==='publish'}];ikMenu($('#tabs .ik-more'),its,{title:'Mais'});return}
 return _mm.apply(this,a)}}
