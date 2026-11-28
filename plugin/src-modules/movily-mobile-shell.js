/* Movily mobile shell: reference-inspired header, category tabs, bottom dock and real Lampa actions. */
(function () {
  'use strict';
  if (window.__movily_mobile_shell) return;
  window.__movily_mobile_shell = true;

  var STYLE_ID = 'movily-mobile-shell-style';
  var ROOT_ID = 'movily-mobile-shell';
  var SHEET_ID = 'movily-mobile-more-sheet';
  var BACKDROP_ID = 'movily-mobile-more-backdrop';
  var LAST_Y = 0;
  var STARTED = false;
  var ACTIONS = [
    { action: 'main', label: 'Головна' },
    { action: 'movie', label: 'Фільми' },
    { action: 'cartoon', label: 'Мультфільми' },
    { action: 'tv', label: 'Серіали' },
    { action: 'anime', label: 'Аніме' }
  ];
  var MORE_PRIORITY = [
    { keys: ['person', 'persons', 'people'], label: 'Особи' },
    { keys: ['catalog', 'collection', 'collections'], label: 'Каталог' },
    { keys: ['filter'], label: 'Фільтр' },
    { keys: ['relise', 'release', 'releases'], label: 'Релізи' },
    { keys: ['timetable', 'schedule'], label: 'Розклад' },
    { keys: ['history'], label: 'Історія' }
  ];
  var SVG = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.8"></circle><path d="m15.5 15.5 5 5"></path></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"></path></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10.5 9-7.2 9 7.2V21h-6.2v-6h-5.6v6H3z"></path></svg>',
    favorite: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.6Z"></path></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"></rect><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"></rect><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"></rect><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"></rect></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.1l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"></path></svg>'
  };

  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function normalize(action) {
    var key = String(action || '').toLowerCase();
    if (key === 'release' || key === 'releases') return 'relise';
    if (key === 'bookmarks') return 'favorite';
    if (key === 'schedule') return 'timetable';
    if (key === 'collection' || key === 'collections') return 'catalog';
    return key;
  }
  function nativeAction(action) {
    var key = normalize(action), items = qsa('.menu .menu__item.selector[data-action]');
    for (var i = 0; i < items.length; i++) {
      if (normalize(items[i].getAttribute('data-action')) === key) return items[i];
    }
    return null;
  }
  function nativeNav(action) {
    return qs('.navigation-bar .navigation-bar__item[data-action="' + action + '"]');
  }
  function activate(node) {
    if (!node) return false;
    try {
      if (window.$) $(node).trigger('hover:enter');
      else if (typeof node.click === 'function') node.click();
      else node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    } catch (e) { return false; }
  }
  function translate(key, fallback) {
    try {
      var value = window.Lampa && Lampa.Lang && Lampa.Lang.translate(key);
      if (value && value !== key) return value;
    } catch (e) {}
    return fallback;
  }
  function closeSheet() {
    var sheet = document.getElementById(SHEET_ID), backdrop = document.getElementById(BACKDROP_ID), more = qs('[data-shell-action="more"]');
    if (sheet) { sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true'); }
    if (backdrop) backdrop.classList.remove('is-open');
    if (more) more.classList.remove('is-active');
  }
  function openSheet() {
    var sheet = document.getElementById(SHEET_ID), backdrop = document.getElementById(BACKDROP_ID), more = qs('[data-shell-action="more"]');
    populateMore();
    if (sheet) { sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden', 'false'); }
    if (backdrop) backdrop.classList.add('is-open');
    if (more) more.classList.add('is-active');
  }
  function directAction(action) {
    try {
      if (!window.Lampa) return false;
      var Storage = Lampa.Storage, Lang = Lampa.Lang, Activity = Lampa.Activity;
      var source = Storage && (Storage.field('source') || 'tmdb');
      if (action === 'search') {
        if (Lampa.Search && typeof Lampa.Search.open === 'function') { Lampa.Search.open({}); return true; }
        return activate(nativeNav('search'));
      }
      if (action === 'settings') {
        if (Lampa.Settings && typeof Lampa.Settings.open === 'function') { Lampa.Settings.open(); return true; }
        return activate(nativeAction('settings'));
      }
      if (action === 'favorite' || action === 'bookmarks') {
        if (Activity && typeof Activity.push === 'function') {
          Activity.push({ component: 'bookmarks', title: translate('settings_input_links', 'Вибране') });
          return true;
        }
      }
      if (!Activity || typeof Activity.push !== 'function' || !Storage || !Lang) return false;
      if (action === 'main') {
        Activity.push({ url: '', title: translate('title_main', 'Головна') + ' - ' + String(source).toUpperCase(), component: 'main', source: source });
        return true;
      }
      if (action === 'movie' || action === 'tv' || action === 'anime') {
        var titleKey = action === 'movie' ? 'menu_movies' : action === 'anime' ? 'menu_anime' : 'menu_tv';
        Activity.push({ url: action, title: translate(titleKey, action === 'movie' ? 'Фільми' : action === 'anime' ? 'Аніме' : 'Серіали') + ' - ' + String(source).toUpperCase(), component: 'category', source: action === 'anime' ? 'cub' : source, page: 1 });
        return true;
      }
      if (action === 'cartoon') {
        Activity.push({ url: 'movie', title: translate('menu_multmovie', 'Мультфільми') + ' - ' + String(source).toUpperCase(), component: 'category', genres: 16, page: 1 });
        return true;
      }
    } catch (e) {}
    return false;
  }
  function runAction(action) {
    closeSheet();
    if (['main', 'movie', 'cartoon', 'tv', 'anime', 'favorite', 'settings'].indexOf(action) >= 0) setActive(action);
    if (action === 'back') {
      if (activate(nativeNav('back'))) return true;
      try { if (window.Lampa && Lampa.Activity && typeof Lampa.Activity.backward === 'function') { Lampa.Activity.backward(); return true; } } catch (e) {}
      try { history.back(); return true; } catch (e2) { return false; }
    }
    if (action === 'favorite' || action === 'search' || action === 'settings') {
      if (activate(nativeAction(action)) || activate(nativeNav(action))) return true;
    } else {
      var native = nativeAction(action);
      if (native && activate(native)) return true;
    }
    return directAction(action);
  }
  function makeButton(label, icon, action, extraClass) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'movily-shell-button selector' + (extraClass ? ' ' + extraClass : '');
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('data-shell-action', action);
    button.setAttribute('data-selector', 'true');
    button.setAttribute('tabindex', '0');
    button.innerHTML = icon;
    return button;
  }
  function bindAction(button, action) {
    var locked = false;
    function run(event) {
      if (locked) return;
      locked = true;
      window.setTimeout(function () { locked = false; }, 220);
      if (event && event.preventDefault) event.preventDefault();
      if (event && event.stopPropagation) event.stopPropagation();
      if (action === 'more') openSheet();
      else runAction(action);
    }
    button.addEventListener('click', run);
    button.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') run(event);
    });
    if (window.$) {
      try { $(button).on('hover:enter', run); } catch (e) {}
    }
  }
  function findMenuLabel(item, fallback) {
    var node = qs('.menu__text, .menu__item-name, .menu__item-text', item);
    return node && node.textContent.trim() ? node.textContent.trim() : (item.textContent || '').trim() || fallback;
  }
  function moreItems() {
    var menuItems = qsa('.menu .menu__item.selector[data-action]'), used = {}, out = [];
    MORE_PRIORITY.forEach(function (group) {
      var found = null;
      for (var i = 0; i < menuItems.length && !found; i++) {
        var action = menuItems[i].getAttribute('data-action');
        if (group.keys.indexOf(String(action || '').toLowerCase()) >= 0 || group.keys.indexOf(normalize(action)) >= 0) found = menuItems[i];
      }
      if (found) {
        var key = normalize(found.getAttribute('data-action'));
        if (!used[key]) { used[key] = true; out.push({ action: found.getAttribute('data-action'), label: findMenuLabel(found, group.label) }); }
      }
    });
    menuItems.forEach(function (item) {
      var action = item.getAttribute('data-action'), key = normalize(action);
      if (!action || used[key] || ['main', 'movie', 'tv', 'cartoon', 'anime', 'search', 'settings', 'favorite'].indexOf(key) >= 0) return;
      var label = findMenuLabel(item, action);
      if (!label) return;
      used[key] = true;
      out.push({ action: action, label: label });
    });
    return out;
  }
  function populateMore() {
    var list = qs('.movily-shell-sheet__items');
    if (!list) return;
    var items = moreItems(), signature = items.map(function (item) { return item.action + ':' + item.label; }).join('|');
    if (list.getAttribute('data-signature') === signature) return;
    list.innerHTML = '';
    items.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'movily-shell-sheet__item selector';
      button.textContent = item.label;
      button.setAttribute('data-shell-action', item.action);
      button.setAttribute('data-selector', 'true');
      button.setAttribute('tabindex', '0');
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        runAction(item.action);
      });
      if (window.$) { try { $(button).on('hover:enter', function () { runAction(item.action); }); } catch (e) {} }
      list.appendChild(button);
    });
    list.setAttribute('data-signature', signature);
  }
  function setActive(action) {
    qsa('.movily-shell-tab').forEach(function (tab) { tab.classList.toggle('is-active', tab.getAttribute('data-shell-action') === action); });
    qsa('.movily-shell-dock .movily-shell-button').forEach(function (button) {
      var key = button.getAttribute('data-shell-action');
      button.classList.toggle('is-active', key === action || (key === 'home' && action === 'main'));
    });
  }
  function build() {
    if (!document.body || document.getElementById(ROOT_ID)) return;
    addCss();
    document.body.classList.add('movily-shell');

    var shell = document.createElement('div');
    shell.id = ROOT_ID;
    shell.innerHTML = '<header class="movily-shell-header" aria-label="Навігація Movily">' +
      '<div class="movily-shell-top"><div class="movily-shell-brand"><img src="img/logo-icon.svg" alt=""><span>Movily</span></div></div>' +
      '<nav class="movily-shell-tabs" aria-label="Розділи"></nav></header>' +
      '<div class="movily-shell-dock" role="navigation" aria-label="Швидка навігація"></div>' +
      '<div id="' + BACKDROP_ID + '" class="movily-shell-backdrop" aria-hidden="true"></div>' +
      '<section id="' + SHEET_ID + '" class="movily-shell-sheet" aria-label="Ще" aria-hidden="true"><div class="movily-shell-sheet__handle"></div><div class="movily-shell-sheet__title">Ще</div><div class="movily-shell-sheet__items"></div></section>';
    document.body.appendChild(shell);

    var top = qs('.movily-shell-top', shell);
    var search = makeButton('Пошук', SVG.search, 'search', 'movily-shell-search');
    bindAction(search, 'search');
    top.appendChild(search);

    var tabs = qs('.movily-shell-tabs', shell);
    ACTIONS.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'movily-shell-tab selector' + (item.action === 'main' ? ' is-active' : '');
      button.textContent = item.label;
      button.setAttribute('data-shell-action', item.action);
      button.setAttribute('data-selector', 'true');
      button.setAttribute('tabindex', '0');
      button.addEventListener('click', function (event) {
        event.preventDefault();
        setActive(item.action);
        runAction(item.action);
      });
      if (window.$) { try { $(button).on('hover:enter', function () { setActive(item.action); runAction(item.action); }); } catch (e) {} }
      tabs.appendChild(button);
    });

    var dock = qs('.movily-shell-dock', shell);
    [
      { label: 'Назад', icon: SVG.back, action: 'back' },
      { label: 'Головна', icon: SVG.home, action: 'main' },
      { label: 'Вибране', icon: SVG.favorite, action: 'favorite' },
      { label: 'Ще', icon: SVG.more, action: 'more' },
      { label: 'Налаштування', icon: SVG.settings, action: 'settings' }
    ].forEach(function (item) {
      var button = makeButton(item.label, item.icon, item.action);
      bindAction(button, item.action);
      if (item.action === 'main') button.classList.add('is-active');
      dock.appendChild(button);
    });

    var backdrop = document.getElementById(BACKDROP_ID);
    backdrop.addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeSheet(); });
    populateMore();
    bindScroll();
    observeMenu();
  }
  function addCss() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      'body.movily-shell{--movily-bar-height:78px;--movily-glass:rgba(24,24,28,.72);--movily-border:rgba(255,255,255,.13);}',
      'body.movily-shell .head__body,body.movily-shell .navigation-bar,body.movily-shell #snack-header-dock,body.movily-shell #agnative-topnav-clock,body.movily-shell .agnative-topnav-shell,body.movily-shell .agnative-topnav-rightdock{display:none!important;}',
      'body.movily-shell .head{height:0!important;overflow:visible!important;background:none!important;pointer-events:none!important;}',
      'body.movily-shell .head:before{display:none!important;}',
      'body.movily-shell.movily-topbar-hidden .movily-shell-header{display:none!important;}',
      'body.movily-shell.movily-topbar-hidden .wrap__content{padding-top:0!important;}',
      'body.movily-shell .wrap__content{padding-top:var(--movily-bar-height)!important;padding-top:calc(var(--movily-bar-height) + env(safe-area-inset-top,0px))!important;}',
      'body.movily-shell .wrap__content>.activity{min-height:calc(100vh - var(--movily-bar-height));min-height:calc(100vh - var(--movily-bar-height) - env(safe-area-inset-top,0px));}',
      'body.movily-shell .scroll:not(.scroll--horizontal)>.scroll__content{padding-bottom:86px!important;padding-bottom:calc(86px + env(safe-area-inset-bottom,0px))!important;}',
      '#' + ROOT_ID + '{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,Arial,sans-serif;color:#fff;}',
      '.movily-shell-header{position:fixed;z-index:50;top:0;left:0;right:0;height:var(--movily-bar-height);padding-top:0;height:calc(var(--movily-bar-height) + env(safe-area-inset-top,0px));padding-top:env(safe-area-inset-top,0px);background:rgba(18,18,20,.72);border-bottom:1px solid rgba(255,255,255,.06);-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);transition:opacity .32s ease,transform .32s ease,filter .32s ease;}',
      '.movily-shell-top{height:42px;padding:4px 15px 2px;display:flex;align-items:center;justify-content:space-between;}',
      '.movily-shell-brand{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:750;letter-spacing:-.045em;line-height:1;}',
      '.movily-shell-brand img{width:28px;height:28px;object-fit:contain;display:block;}',
      '.movily-shell-button{appearance:none;-webkit-appearance:none;border:0;color:#fff;background:transparent;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent;}',
      '.movily-shell-button svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
      '.movily-shell-button.is-active,.movily-shell-button:active{background:rgba(255,255,255,.19);}',
      '.movily-shell-search{width:36px;height:36px;border-radius:50%;margin-right:1px;}',
      '.movily-shell-search svg{width:22px;height:22px;stroke-width:2.2;}',
      '.movily-shell-tabs{height:36px;display:flex;align-items:stretch;gap:18px;padding:0 15px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none;-webkit-overflow-scrolling:touch;}',
      '.movily-shell-tabs::-webkit-scrollbar{display:none;}',
      '.movily-shell-tab{position:relative;flex:0 0 auto;appearance:none;-webkit-appearance:none;border:0;padding:0 1px 7px;background:none;color:rgba(235,235,245,.65);font-family:inherit;font-size:14px;font-weight:500;line-height:1.2;white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent;}',
      '.movily-shell-tab.is-active{color:#fff;font-weight:650;}',
      '.movily-shell-tab.is-active:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;border-radius:2px;background:#fff;}',
      '.movily-shell-dock{position:fixed;z-index:52;left:12px;right:12px;bottom:5px;bottom:calc(env(safe-area-inset-bottom,0px) + 5px);height:52px;padding:4px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(255,255,255,.22);border-radius:28px;background:rgba(255,255,255,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 6px 20px rgba(0,0,0,.25);-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);transition:opacity .32s ease,transform .32s ease,filter .32s ease;}',
      '.movily-shell-dock .movily-shell-button{flex:1;height:42px;border-radius:22px;background:rgba(255,255,255,.11);-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);border:1px solid rgba(255,255,255,.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 4px 14px rgba(0,0,0,.16);transition:background .15s,box-shadow .15s;}',
      '.movily-shell-dock .movily-shell-button svg{width:22px;height:22px;}',
      '.movily-shell-dock .movily-shell-button.is-active,.movily-shell-dock .movily-shell-button:active,.movily-shell-dock .movily-shell-button.focus,.movily-shell-dock .movily-shell-button.hover{background:rgba(255,255,255,.4);box-shadow:inset 0 1px 0 rgba(255,255,255,.32),0 6px 20px rgba(0,0,0,.25);}',
      '.movily-shell-header.is-hidden{opacity:0;visibility:hidden;transform:translateY(-100%);filter:none;background:transparent;border-color:transparent;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;pointer-events:none;}',
      '.movily-shell-dock.is-hidden{opacity:0;transform:translateY(12px);filter:blur(6px);pointer-events:none;}',
      '.movily-shell-backdrop{position:fixed;z-index:53;inset:0;background:rgba(0,0,0,.12);opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s ease;}',
      '.movily-shell-backdrop.is-open{opacity:1;visibility:visible;}',
      '.movily-shell-sheet{position:fixed;z-index:54;left:12px;right:12px;bottom:64px;bottom:calc(64px + env(safe-area-inset-bottom,0px));max-height:56vh;max-height:min(56vh,440px);overflow-y:auto;padding:9px 11px 12px;border:1px solid var(--movily-border);border-radius:23px;background:rgba(35,35,40,.9);box-shadow:0 10px 32px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.08);-webkit-backdrop-filter:blur(28px) saturate(160%);backdrop-filter:blur(28px) saturate(160%);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .2s ease,transform .2s ease,visibility .2s ease;}',
      '.movily-shell-sheet.is-open{opacity:1;visibility:visible;transform:translateY(0);}',
      '.movily-shell-sheet__handle{width:34px;height:4px;margin:0 auto 9px;border-radius:4px;background:rgba(255,255,255,.35);}',
      '.movily-shell-sheet__title{font-size:16px;font-weight:700;padding:2px 4px 9px;}',
      '.movily-shell-sheet__items{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}',
      '.movily-shell-sheet__item{min-height:46px;padding:10px 13px;text-align:left;border:0;border-radius:14px;background:rgba(255,255,255,.09);color:#fff;font-family:inherit;font-size:14px;font-weight:500;line-height:1.25;cursor:pointer;-webkit-tap-highlight-color:transparent;}',
      '.movily-shell-sheet__item:active,.movily-shell-sheet__item.focus,.movily-shell-sheet__item.hover{background:rgba(255,255,255,.2);}',
      '@media (min-width:700px){.movily-shell-header{padding-left:15px;padding-right:15px;padding-left:max(15px,calc((100vw - 980px)/2));padding-right:max(15px,calc((100vw - 980px)/2));}.movily-shell-tabs{padding-left:0;padding-right:0;}.movily-shell-dock{left:50%;right:auto;width:calc(100vw - 24px);max-width:460px;transform:translateX(-50%);}.movily-shell-dock.is-hidden{transform:translate(-50%,12px);}}',
      '@media (max-width:360px){.movily-shell-tabs{gap:14px;padding-left:12px;padding-right:12px;}.movily-shell-tab{font-size:13px;}.movily-shell-brand{font-size:19px;}}',
      '@media (prefers-reduced-motion:reduce){.movily-shell-header,.movily-shell-dock,.movily-shell-sheet,.movily-shell-backdrop{transition:none!important;}}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }
  function setVisible(visible) {
    var header = qs('.movily-shell-header'), dock = qs('.movily-shell-dock');
    if (!header || !dock) return;
    header.classList.toggle('is-hidden', !visible);
    dock.classList.toggle('is-hidden', !visible);
    if (!visible) closeSheet();
  }
  function bindScroll() {
    LAST_Y = window.scrollY || 0;
    document.addEventListener('scroll', function (event) {
      var target = event.target;
      if (target && target.closest && target.closest('.movily-shell-sheet, .scroll--horizontal')) return;
      var elementScroll = target && target !== document && target !== document.documentElement && target !== document.body && typeof target.scrollTop === 'number';
      var y = elementScroll ? target.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);
      var previous = elementScroll ? (target.__movilyLastY || 0) : LAST_Y;
      var delta = y - previous;
      if (y <= 10) setVisible(true);
      else if (delta > 8) setVisible(false);
      else if (delta < -8) setVisible(true);
      if (Math.abs(delta) > 8 || y <= 10) {
        if (elementScroll) target.__movilyLastY = y;
        else LAST_Y = y;
      }
    }, true);
  }
  function observeMenu() {
    if (typeof MutationObserver !== 'function' || !document.body) return;
    var timer = 0;
    function changed() {
      if (timer) return;
      timer = window.setTimeout(function () { timer = 0; populateMore(); }, 120);
    }
    var observer = new MutationObserver(changed);
    var menu = qs('.menu');
    if (menu) observer.observe(menu, { childList: true, subtree: true });
    else {
      var finder = new MutationObserver(function () {
        var found = qs('.menu');
        if (!found) return;
        finder.disconnect();
        observer.observe(found, { childList: true, subtree: true });
        changed();
      });
      finder.observe(document.body, { childList: true, subtree: true });
    }
  }
  function syncActiveFromActivity() {
    try {
      var activity = window.Lampa && Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
      if (!activity) {
        if (document.body) document.body.classList.remove('movily-topbar-hidden');
        return;
      }
      var component = String(activity.component || '').toLowerCase();
      var topbarHidden = component === 'full' || component === 'player' || component === 'trailer';
      if (document.body) document.body.classList.toggle('movily-topbar-hidden', topbarHidden);
      if (topbarHidden) return;
      if (activity.component === 'main') { setActive('main'); return; }
      if (activity.component !== 'category') return;
      var url = String(activity.url || '').toLowerCase();
      if (url === 'movie' && String(activity.genres || '') === '16') setActive('cartoon');
      else if (url === 'movie' || url === 'tv' || url === 'anime') setActive(url);
    } catch (e) {}
  }
  function start() {
    if (STARTED) return;
    STARTED = true;
    build();
    syncActiveFromActivity();
    if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
      try {
        Lampa.Listener.follow('activity', function (event) {
          populateMore();
          if (event && event.type === 'init' && ['full', 'player', 'trailer'].indexOf(String(event.component || '').toLowerCase()) >= 0 && document.body) document.body.classList.add('movily-topbar-hidden');
          if (event && (event.type === 'start' || event.type === 'archive' || event.type === 'destroy')) window.setTimeout(syncActiveFromActivity, 60);
        });
      } catch (e) {}
    }
  }
  function waitForApp() {
    if (window.appready && window.Lampa && Lampa.Listener) { start(); return; }
    var listenerBound = false;
    var timer = window.setInterval(function () {
      if (!window.Lampa || !Lampa.Listener) return;
      if (window.appready) { window.clearInterval(timer); start(); return; }
      if (!listenerBound) {
        listenerBound = true;
        try {
          Lampa.Listener.follow('app', function (event) {
            if (event && event.type === 'ready') { window.clearInterval(timer); start(); }
          });
        } catch (e) { listenerBound = false; }
      }
    }, 500);
    window.setTimeout(function () { window.clearInterval(timer); if (!document.getElementById(ROOT_ID)) start(); }, 15000);
  }
  waitForApp();
})();
