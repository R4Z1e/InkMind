/* ============ início ============ */
window.addEventListener('beforeunload',()=>{try{flushChapter()}catch{}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){try{flushChapter();saveProject.flush()}catch{}}});
window.addEventListener('resize',hideImgBar);
document.addEventListener('selectionchange',()=>syncToolbarT());
(async function boot(){
 try{await Store.init()}catch(e){console.warn(e)}
 try{const pr=await Store.get('prefs');if(pr){S.prefs=Object.assign(S.prefs,pr);if(!pr.brandV){S.prefs.brandV=1;S.prefs.theme='inkmind';S.prefs.accent='';savePrefs()}}}catch{}
 applyTheme();
 try{S.projects=await Store.list()}catch(e){console.warn(e);toast('Não consegui carregar seus projetos agora. Tente recarregar em instantes.','err')}
 if(S.room)try{S.room.onPeers(ch=>{S.peers=ch.peers;onPeersChange()},()=>{S.room=null})}catch{}
 $('#splash').remove();if(S.prefs.lock&&!isUnlocked())renderLock();else renderHome();
})();
