/* Movily search page: YouTube-style layout. Back + input row, history list with "insert" arrows,
   results as a clean poster grid. Removes the grid/menu button next to the input. */
(function () {
  'use strict';
  if (window.__movily_search_page) return;
  window.__movily_search_page = true;

  var STYLE_ID = 'movily-search-page-style';
  
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7 7 17M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4.5v4h4M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function addCss() {
    if (document.getElementById(STYLE_ID)) return;
    var S = 'body.movily-new-search.search--open';
    var css = [
      /* прибрати кнопку-сітку (Меню) на сторінці пошуку */
      S + ' .movily-search-menu-button{display:none!important;}',

      /* шапка: назад + поле */
      '@media(max-width:899px){',
      S + ' .search .scroll__body{display:block!important;padding:calc(10px + env(safe-area-inset-top,0px)) 0 0!important;}',
      S + ' .search .head-backward{display:block!important;position:absolute!important;left:6px;top:calc(10px + env(safe-area-inset-top,0px));z-index:3;width:44px;height:48px;margin:0!important;padding:0!important;}',
      S + ' .search .head-backward__title{display:none!important;}',
      S + ' .search .head-backward__button{position:static!important;inset:auto!important;width:44px!important;height:48px!important;margin:0!important;padding:0!important;display:flex!important;align-items:center;justify-content:center;background:none!important;border:0!important;border-radius:50%!important;}',
      S + ' .search .head-backward__button svg{width:24px;height:24px;}',
      S + ' .search__body{display:block!important;}',
      S + ' .search__keypad{display:block!important;margin:0 12px 0 52px!important;padding:0!important;width:auto!important;}',
      S + ' .search__keypad .simple-keyboard-input{box-sizing:border-box;width:100%!important;height:46px!important;line-height:46px!important;margin:0!important;padding:0 18px!important;font-size:17px!important;border:0!important;border-radius:23px!important;background:rgba(255,255,255,.1)!important;color:#fff!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);}',
      S + ' .search__keypad .simple-keyboard-input:focus{background:rgba(255,255,255,.14)!important;}',
      S + ' .search__keypad .simple-keyboard-input::placeholder{color:rgba(235,235,245,.55)!important;}',
      S + ' .search__sources{display:none!important;}',

      /* історія як у YouTube */
      S + ' .search__history{display:block!important;margin:6px 0 0!important;}',
      S + ' .search__history .scroll,' + S + ' .search__history .scroll__content{overflow:visible!important;transform:none!important;width:100%!important;}',
      S + ' .search__history .scroll__body{display:block!important;padding:0!important;width:100%!important;transform:none!important;}',
      S + ' .search__history .scroll__content{padding:0!important;}',
      S + ' .search-history-key{display:flex!important;align-items:center;gap:16px;width:100%!important;min-height:56px;margin:0!important;padding:0 14px 0 18px!important;box-sizing:border-box;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;color:#f2f2f7!important;font-size:17px!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;}',
      S + ' .search-history-key:before{display:none!important;content:none!important;}',
      S + ' .search-history-key>div{flex:1;min-width:0;padding:0!important;font-size:1em!important;}',
      S + ' .search-history-key>div span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      S + ' .search-history-key .msp-ico,' + S + ' .search-history-key .msp-ins{flex:0 0 auto;display:inline-flex;width:24px;height:24px;color:rgba(235,235,245,.78);}',
      S + ' .search-history-key .msp-ico svg,' + S + ' .search-history-key .msp-ins svg{width:24px;height:24px;}',
      S + ' .search-history-key .msp-ins{width:40px;height:40px;margin-right:-8px;align-items:center;justify-content:center;border-radius:50%;}',
      S + ' .search-history-key .msp-ins svg{width:22px;height:22px;}',
      S + ' .search-history-key.focus,' + S + ' .search-history-key:active{background:rgba(255,255,255,.08)!important;color:#fff!important;}',

      /* порожня історія: ховаємо напис, лишаємо м'яку підказку */
      S + ' .search-history-empty{display:none!important;}',
      S + ' .search-looking{padding:0!important;}',
      S + ' .search-looking__text{display:block!important;margin:0!important;padding:70px 28px!important;text-align:center;font-size:16px!important;line-height:1.4;color:rgba(235,235,245,.5)!important;}',

      /* результати: заголовок категорії + чиста сітка постерів */
      S + ' .search__results{display:block!important;margin:6px 0 0!important;padding:0 0 calc(24px + env(safe-area-inset-bottom,0px))!important;}',
      S + ' .search__results .scroll,' + S + ' .search__results .scroll__content,' + S + ' .search__results .scroll__body{display:block!important;width:100%!important;transform:none!important;padding:0!important;margin:0!important;}',
      S + ' .search__results .items-line{margin:0 0 18px!important;padding:0!important;}',
      S + ' .search__results .items-line__head{padding:6px 16px 10px!important;margin:0!important;}',
      S + ' .search__results .items-line__title{font-size:19px!important;font-weight:700!important;}',
      S + ' .search__results .items-line__body{padding:0!important;margin:0!important;}',
      S + ' .search__results .items-line__body .scroll{overflow:visible!important;}',
      S + ' .search__results .items-line__body .scroll__content{overflow:visible!important;transform:none!important;}',
      S + ' .search__results .items-line__body .scroll__body{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 10px;padding:0 14px!important;transform:none!important;width:100%!important;box-sizing:border-box;}',
      S + ' .search__results .items-line__body .scroll__body>*{min-width:0;}',
      S + ' .search__results .card{width:100%!important;margin:0!important;float:none!important;position:relative!important;transform:none!important;}',
      S + ' .search__results .card__view{padding-bottom:150%!important;border-radius:12px!important;overflow:hidden;background:rgba(255,255,255,.07);}',
      S + ' .search__results .card__img{border-radius:12px!important;}',
      S + ' .search__results .card__title{font-size:13px!important;line-height:1.25;margin-top:7px!important;white-space:normal!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
      S + ' .search__results .card__age{font-size:12px!important;color:rgba(235,235,245,.55);}',
      S + ' .search__results .card--more,' + S + ' .search__results .card-more{display:none!important;}',
      '}',
      '@media(min-width:480px) and (max-width:899px){' + S + ' .search__results .items-line__body .scroll__body{grid-template-columns:repeat(4,minmax(0,1fr));}}',
      '@media(min-width:700px) and (max-width:899px){' + S + ' .search__results .items-line__body .scroll__body{grid-template-columns:repeat(5,minmax(0,1fr));}}'
    ].join('\n');
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = css;
    document.head.appendChild(st);
  }

  function enabled() { return document.body.classList.contains('movily-new-search'); }

  function decorateHistory() {
    if (!document.body.classList.contains('search--open') || !enabled()) return;
    qsa('.search-history-key').forEach(function (key) {
      if (key.__mspDone) return;
      key.__mspDone = true;
      var ico = document.createElement('span');
      ico.className = 'msp-ico';
      ico.innerHTML = CLOCK;
      key.insertBefore(ico, key.firstChild);
      var ins = document.createElement('span');
      ins.className = 'msp-ins';
      ins.innerHTML = ARROW;
      /* стрілка лише вставляє запит у поле (без запуску пошуку), як у YouTube */
      function insert(e) {
        e.preventDefault();
        e.stopPropagation();
        var text = (key.querySelector('span:not(.msp-ico):not(.msp-ins)') || {}).textContent || '';
        var input = qs('.search__keypad .simple-keyboard-input');
        if (!input) return;
        input.value = text + ' ';
        try { input.dispatchEvent(new Event('input', { bubbles: true })); } catch (er) {}
        input.focus();
      }
      ins.addEventListener('click', insert, true);
      ins.addEventListener('touchend', insert, true);
      key.appendChild(ins);
    });
  }

  function focusInput() {
    var input = qs('.search__keypad .simple-keyboard-input');
    if (input && document.activeElement !== input) { try { input.focus(); } catch (e) {} }
  }

  function start() {
    addCss();
    var timer = 0, wasOpen = false;
    function tick() {
      timer = 0;
      var open = document.body.classList.contains('search--open');
      if (open) decorateHistory();
      if (open && enabled() && !wasOpen) setTimeout(focusInput, 250);
      wasOpen = open;
    }
    var mo = new MutationObserver(function () { if (!timer) timer = setTimeout(tick, 60); });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
    tick();
  }

  function wait() {
    if (document.body && window.Lampa && window.appready) { start(); return; }
    var t = setInterval(function () {
      if (document.body && window.Lampa && window.appready) { clearInterval(t); start(); }
    }, 300);
  }
  wait();
})();
