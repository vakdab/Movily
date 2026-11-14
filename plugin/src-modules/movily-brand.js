/* Movily brand: the Movily logo instead of the burger icon in the header button.
   Only the picture changes: the button is still Lampa's own .head__menu-icon, so the click,
   the focus and the left menu keep working exactly as before. */
(function () {
  'use strict';
  if (window.__movily_brand) return;
  window.__movily_brand = true;

  var ID = 'movily-brand-css';
  var LOGO = 'img/logo-icon.svg';

  function css() {
    if (document.getElementById(ID)) return;
    var st = document.createElement('style');
    st.id = ID;
    st.textContent = [
      /* hide the burger drawing, show the logo in its place */
      'body .head__menu-icon svg{opacity:0!important}',
      'body .head__menu-icon{background-image:url("' + LOGO + '")!important;background-repeat:no-repeat!important;background-position:center!important;background-size:62%!important}',
      /* the logo is the whole button: a bit bigger than the old burger so the "M" reads well */
      'body.stv .head__menu-icon{background-size:64%!important}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  css();
})();
