/* Layout stability: reserve geometry before async data and images arrive. */
(function () {
  'use strict';
  if (window.__movily_layout_stability) return;
  window.__movily_layout_stability = true;

  var style = document.createElement('style');
  style.id = 'movily-layout-stability';
  style.textContent = [
    'html{overflow-y:scroll;overflow-x:hidden}',
    'body{overflow-x:hidden}',
    'body.stv .activitys,body.stv .activity,body.stv .activity__body,body.stv .full-start-new,body.stv .full-start-new__body,body.stv .full-start-new__right,body.stv .items-line{transition:none!important}',
    'body.stv .full-start-new__body{min-height:clamp(520px,72vh,820px)}',
    'body.stv .full-start-new__title.stv-logo-pending,body.stv .full-start-new__title.stv-has-logo{contain:layout}',
    'body.stv .card__view{contain:layout;overflow:hidden}',
    '@media (max-width:480px){body.stv .full-start-new__right{margin-top:clamp(-120px,-20vh,-80px)!important}}'
  ].join('');
  (document.head || document.documentElement).appendChild(style);

  // On a hard reload Lampa creates the Activity in stages. Keep the partial
  // card tree hidden until the first page is actually ready, otherwise Safari
  // briefly paints poster placeholders before the final layout arrives.
  function revealWhenReady() {
    if (!document.body || !document.body.classList.contains('movily-booting')) return;
    var ready = document.querySelector('.activity--active:not(.activity--load)');
    if (!ready) return;
    var poster = ready.querySelector('.full-start__background, .full-start-new__img, .card__img');
    if (poster && poster.tagName === 'IMG' && !poster.complete) return;
    document.body.classList.remove('movily-booting');
  }

  var tries = 0;
  var bootTimer = setInterval(function () {
    revealWhenReady();
    if (!document.body || !document.body.classList.contains('movily-booting') || ++tries > 100) {
      clearInterval(bootTimer);
      if (document.body) document.body.classList.remove('movily-booting');
    }
  }, 100);
})();
