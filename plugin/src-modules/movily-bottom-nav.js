/* Movily: нижнє меню з однією кнопкою «Головна». */
(function () {
  'use strict';
  if (window.__movily_bottom_nav) return;
  window.__movily_bottom_nav = true;

  var NAV_ID = 'movily-bottom-nav';
  var HOME_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 3.6 10a1 1 0 0 0-.4.8V19a1.8 1.8 0 0 0 1.8 1.8h3.4a1 1 0 0 0 1-1v-4.2h5.2v4.2a1 1 0 0 0 1 1H19a1.8 1.8 0 0 0 1.8-1.8v-8.2a1 1 0 0 0-.4-.8z"/></svg>';

  function css() {
    if (document.getElementById('movily-bottom-nav-css')) return;
    var s = document.createElement('style');
    s.id = 'movily-bottom-nav-css';
    s.textContent = [
      '#'+NAV_ID+'{position:fixed;left:0;right:0;bottom:0;z-index:9990;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:6px 10px calc(env(safe-area-inset-bottom,0px) * .45 + 4px);background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.03)),rgba(32,34,40,.50);-webkit-backdrop-filter:blur(40px) saturate(180%);backdrop-filter:blur(40px) saturate(180%);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 0 0 1px rgba(255,255,255,.08);transform:translateZ(0);font-family:-apple-system,"SF Pro Text",system-ui,sans-serif}',
      '#'+NAV_ID+' button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:84px;height:50px;padding:0 18px;border-radius:25px;cursor:pointer;color:#fff;background:rgba(255,255,255,.22);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);-webkit-tap-highlight-color:transparent;transition:transform .15s}',
      '#'+NAV_ID+' button:active{transform:scale(.92)}',
      '#'+NAV_ID+' button svg{width:24px;height:24px;fill:currentColor}',
      '#'+NAV_ID+' button span{font-size:10px;font-weight:600;line-height:1}',
      'body.movily-bottom-nav-visible{padding-bottom:calc(62px + env(safe-area-inset-bottom,0px) * .45)}',
      'body.movily-bottom-nav-hidden #'+NAV_ID+'{display:none!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function home() {
    try {
      Lampa.Activity.push({ url: '', title: (Lampa.Lang.translate('title_main') || 'Головна'), component: 'main', source: Lampa.Storage.field('source') });
    } catch (e) { try { Lampa.Controller.toggle('content'); } catch (x) {} }
  }

  function render() {
    var nav = document.getElementById(NAV_ID);
    if (nav) return nav;
    nav = document.createElement('nav');
    nav.id = NAV_ID;
    nav.setAttribute('aria-label', 'Нижнє меню');
    nav.innerHTML = '<button data-tab="main" aria-label="Головна">' + HOME_ICON + '<span>Головна</span></button>';
    document.body.appendChild(nav);
    nav.addEventListener('click', function (e) {
      if (e.target.closest('button')) home();
    });
    return nav;
  }

  function visibility() {
    render();
    var hidden = !!(document.querySelector('.player, .youtube-player, .modal, .search-box') ||
      document.body.classList.contains('settings--open'));
    document.body.classList.toggle('movily-bottom-nav-visible', !hidden);
    document.body.classList.toggle('movily-bottom-nav-hidden', hidden);
  }

  function start() {
    css();
    render();
    Lampa.Listener.follow('activity', function () { setTimeout(visibility, 60); });
    Lampa.Listener.follow('full', function () { setTimeout(visibility, 60); });
    setInterval(visibility, 800);
    visibility();
  }

  if (window.Lampa && Lampa.Listener && Lampa.Storage) start();
  else {
    var t = setInterval(function () {
      if (window.Lampa && Lampa.Listener && Lampa.Storage) { clearInterval(t); start(); }
    }, 200);
  }
})();
