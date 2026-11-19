/* Movily: нижня навігація в стилі наданого HTML-макета. */
(function () {
  'use strict';
  if (window.__movily_bottom_nav) return;
  window.__movily_bottom_nav = true;

  var NAV_ID = 'movily-bottom-nav';
  var active = 'main';
  var history = ['main'];

  var ICONS = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 5.3a1 1 0 0 1 0 1.4L9.4 12l5.3 5.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z"/></svg>',
    main: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2 3.6 10a1 1 0 0 0-.4.8V19a1.8 1.8 0 0 0 1.8 1.8h3.4a1 1 0 0 0 1-1v-4.2h5.2v4.2a1 1 0 0 0 1 1H19a1.8 1.8 0 0 0 1.8-1.8v-8.2a1 1 0 0 0-.4-.8z"/></svg>',
    shorts: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25l1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.06-.94-2.68-2.23-3.25zm-.23 5.86l-8.5 4.5c-1.34.71-3.01.2-3.72-1.14-.71-1.34-.2-3.01 1.14-3.72l2.04-1.08v-1.21l-.69-.28-1.11-.46c-.99-.41-1.65-1.35-1.7-2.41-.05-1.06.52-2.06 1.46-2.56l8.5-4.5c1.34-.71 3.01-.2 3.72 1.14.71 1.34-.2 3.01-1.14 3.72L15.5 9.26v1.21l1.8.74c.99.41 1.65 1.35 1.7 2.41.05 1.06-.52 2.06-1.46 2.56z"/><path d="M10 14.65v-5.3L15 12l-5 2.65z"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.2a1.2 1.2 0 0 1-1.7 1.7l-4.2-4.3A7.5 7.5 0 1 1 10.5 3zm0 2.4a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2z"/></svg>',
    settings: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>'
  };

  function css() {
    if (document.getElementById('movily-bottom-nav-css')) return;
    var style = document.createElement('style');
    style.id = 'movily-bottom-nav-css';
    style.textContent = [
      '#'+NAV_ID+'{position:fixed;left:0;right:0;bottom:0;z-index:9990;display:flex;align-items:center;justify-content:space-between;width:100%;box-sizing:border-box;padding:6px 10px calc(env(safe-area-inset-bottom,0px) * .45 + 4px);background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.03)),rgba(32,34,40,.50)!important;-webkit-backdrop-filter:blur(40px) saturate(180%)!important;backdrop-filter:blur(40px) saturate(180%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 0 0 1px rgba(255,255,255,.08)!important;border:0!important;transform:translateZ(0);font-family:-apple-system,"SF Pro Text",system-ui,sans-serif}',
      '#'+NAV_ID+' button{all:unset;position:relative;z-index:1;box-sizing:border-box;flex:1;height:50px;display:flex;align-items:center;justify-content:center;border-radius:25px;cursor:pointer;color:rgba(255,255,255,.55);transition:background .25s,color .25s,transform .15s;-webkit-tap-highlight-color:transparent}',
      '#'+NAV_ID+' button svg{width:26px;height:26px;fill:currentColor;transition:transform .35s cubic-bezier(.3,1.4,.5,1)}',
      '#'+NAV_ID+' button.on{color:#fff}',
      '#'+NAV_ID+' button.on svg{transform:scale(1.12)}',
      '#'+NAV_ID+' button:active{transform:scale(.9)}',
      '#'+NAV_ID+' button:focus-visible{outline:2px solid #fff;outline-offset:2px}',
      '#'+NAV_ID+' .movily-bottom-pill{position:absolute;z-index:0;left:0;top:0;width:60px;height:40px;border-radius:20px;background:rgba(255,255,255,.22);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);pointer-events:none;transition:transform .4s cubic-bezier(.3,1.25,.5,1);will-change:transform}',
      '#'+NAV_ID+' .movily-bottom-sep{width:1px;height:22px;background:rgba(255,255,255,.18);margin:0 4px;flex:none}',
      '#'+NAV_ID+' button[data-action="back"]{flex:0 0 40px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.16);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);color:#fff}',
      '#'+NAV_ID+' button[data-action="back"] svg{width:23px;height:23px}',
      '#'+NAV_ID+' button.pop[data-tab="main"] svg{animation:movily-bottom-hop .5s}',
      '#'+NAV_ID+' button.pop[data-tab="shorts"] svg{animation:movily-bottom-beat .5s}',
      '#'+NAV_ID+' button.pop[data-tab="search"] svg{animation:movily-bottom-wig .5s}',
      '#'+NAV_ID+' button.pop[data-action="back"] svg{animation:movily-bottom-nudge .35s}',
      '@keyframes movily-bottom-hop{0%{transform:scale(1.12)}35%{transform:translateY(-8px) scale(1.2)}70%{transform:translateY(1px) scale(1.08)}100%{transform:scale(1.12)}}',
      '@keyframes movily-bottom-beat{0%,100%{transform:scale(1.12)}30%{transform:scale(1.4)}60%{transform:scale(1.05)}}',
      '@keyframes movily-bottom-wig{0%,100%{transform:scale(1.12) rotate(0)}25%{transform:scale(1.2) rotate(-18deg)}60%{transform:scale(1.2) rotate(14deg)}}',
      '@keyframes movily-bottom-nudge{0%,100%{transform:translateX(0)}40%{transform:translateX(-6px)}}',
      'body.movily-bottom-nav-visible{padding-bottom:calc(62px + env(safe-area-inset-bottom,0px) * .45)}',
      'body.movily-bottom-nav-hidden #'+NAV_ID+'{display:none!important}',
      '@media (prefers-reduced-motion:reduce){#'+NAV_ID+' button,#'+NAV_ID+' button svg,#'+NAV_ID+' .movily-bottom-pill{transition:none!important}#'+NAV_ID+' button.pop svg{animation:none!important}}'
    ].join('');
    (document.head || document.documentElement).appendChild(style);
  }

  function tr(key, fallback) {
    try { return Lampa.Lang.translate(key); } catch (e) { return fallback; }
  }

  function render() {
    if (document.getElementById(NAV_ID)) return document.getElementById(NAV_ID);
    var nav = document.createElement('nav');
    nav.id = NAV_ID;
    nav.setAttribute('aria-label', 'Нижнє меню');
    nav.innerHTML = '<span class="movily-bottom-pill"></span>' +
      '<button data-action="back" aria-label="Назад">' + ICONS.back + '</button>' +
      '<span class="movily-bottom-sep"></span>' +
      '<button data-tab="main" aria-label="Головна">' + ICONS.main + '</button>' +
      '<button data-tab="shorts" aria-label="Шортс">' + ICONS.shorts + '</button>' +
      '<button data-tab="search" aria-label="Пошук">' + ICONS.search + '</button>' +
      '<button data-tab="settings" aria-label="Налаштування">' + ICONS.settings + '</button>';
    document.body.appendChild(nav);
    nav.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      button.classList.remove('pop');
      void button.offsetWidth;
      button.classList.add('pop');
      if (button.dataset.action === 'back') goBack();
      else activate(button.dataset.tab, true);
    });
    return nav;
  }

  function place() {
    var nav = document.getElementById(NAV_ID), button, pill;
    if (!nav) return;
    button = nav.querySelector('button.on[data-tab]');
    pill = nav.querySelector('.movily-bottom-pill');
    if (!button || !pill) return;
    var x = button.offsetLeft + button.offsetWidth / 2 - pill.offsetWidth / 2;
    var y = button.offsetTop + button.offsetHeight / 2 - pill.offsetHeight / 2;
    pill.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }

  function setActive(tab, remember) {
    var nav = document.getElementById(NAV_ID);
    if (!nav) return;
    active = tab || 'main';
    nav.querySelectorAll('button[data-tab]').forEach(function (button) {
      button.classList.toggle('on', button.dataset.tab === active);
    });
    if (remember && history[history.length - 1] !== active) history.push(active);
    requestAnimationFrame(place);
  }

  function home() {
    try {
      Lampa.Activity.push({ url: '', title: (Lampa.Lang.translate('title_main') || 'Головна'), component: 'main', source: Lampa.Storage.field('source') });
    } catch (e) { try { Lampa.Controller.toggle('content'); } catch (x) {} }
  }

  function search() {
    try { if (Lampa.Search && typeof Lampa.Search.open === 'function') Lampa.Search.open({}); } catch (e) {}
  }

  function settings() {
    try {
      var button = document.querySelector('.head__settings, .settings-icon-holder, .head__action.open--settings, .open--settings');
      if (button) button.click();
      else if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') Lampa.Controller.toggle('settings');
    } catch (e) {}
  }

  function shorts() {
    try {
      Lampa.Activity.push({ url: 'feed', title: tr('menu_feed', 'Шортс'), component: 'feed' });
    } catch (e) {}
  }

  function goBack() {
    try {
      var button = document.querySelector('.navigation-bar__item[data-action="back"], .head__action.open--back');
      if (button) { button.click(); return; }
      if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') Lampa.Controller.toggle('content');
    } catch (e) {}
  }

  function activate(tab, remember) {
    setActive(tab, remember);
    if (tab === 'main') home();
    else if (tab === 'shorts') shorts();
    else if (tab === 'search') search();
    else if (tab === 'settings') settings();
  }

  function currentComponent() {
    try {
      var a = Lampa.Activity.active();
      return String(a && (a.component || (a.activity && a.activity.component) || '') || '').toLowerCase();
    } catch (e) { return ''; }
  }

  function visibility() {
    var nav = render();
    var hidden = !!(document.querySelector('.player, .youtube-player, .modal, .search-box') || document.body.classList.contains('settings--open'));
    document.body.classList.toggle('movily-bottom-nav-visible', !hidden);
    document.body.classList.toggle('movily-bottom-nav-hidden', hidden);
    var comp = currentComponent();
    if (comp === 'main') setActive('main', false);
    else if (comp === 'feed') setActive('shorts', false);
    else if (document.body.classList.contains('search--open')) setActive('search', false);
    else if (document.body.classList.contains('settings--open')) setActive('settings', false);
    else if (!active) setActive('main', false);
    return nav;
  }

  function start() {
    css();
    render();
    setActive('main', false);
    window.addEventListener('resize', place);
    Lampa.Listener.follow('activity', function () { setTimeout(visibility, 60); });
    Lampa.Listener.follow('full', function () { setTimeout(visibility, 60); });
    setInterval(visibility, 800);
    visibility();
  }

  if (window.Lampa && Lampa.Listener && Lampa.Storage) start();
  else {
    var timer = setInterval(function () {
      if (window.Lampa && Lampa.Listener && Lampa.Storage) { clearInterval(timer); start(); }
    }, 200);
  }
})();
