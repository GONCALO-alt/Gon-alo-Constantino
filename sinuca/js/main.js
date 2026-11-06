'use strict';
/* Arranque. */
(function () {
  function boot() {
    SPR.buildIcons();
    const P = PROG.init();
    if (!P.stats.matches) PROG.newlyUnlocked(); // personagens iniciais não precisam de anúncio
    SFX.setSound(P.settings.sound); SFX.setMusic(P.settings.music);
    window.__vibrate = P.settings.vibrate;
    GAME.init();
    UI.init();
    UI.home();
    const unlockAudio = () => { SFX.init(); window.removeEventListener('pointerdown', unlockAudio); };
    window.addEventListener('pointerdown', unlockAudio);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* sem modo offline */ });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
