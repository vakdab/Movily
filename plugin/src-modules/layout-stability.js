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
})();
