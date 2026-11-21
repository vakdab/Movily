/* Movily: нижнє меню (макет «Нижнє меню»): скляні жувальні кнопки. */
(function () {
  'use strict';
  if (window.__movily_bottom_nav) return;
  window.__movily_bottom_nav = true;

  var NAV_ID = 'movily-bottom-nav';
  var ICONS = {"back": "<svg viewBox=\"0 0 24 24\"><path d=\"M14.7 5.3a1 1 0 0 1 0 1.4L9.4 12l5.3 5.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z\"/></svg>", "main": "<svg viewBox=\"0 0 24 24\"><path d=\"M12 3.2 3.6 10a1 1 0 0 0-.4.8V19a1.8 1.8 0 0 0 1.8 1.8h3.4a1 1 0 0 0 1-1v-4.2h5.2v4.2a1 1 0 0 0 1 1H19a1.8 1.8 0 0 0 1.8-1.8v-8.2a1 1 0 0 0-.4-.8z\"/></svg>", "shorts": "<svg viewBox=\"0 0 24 24\"><path d=\"M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zm-.23 5.86l-8.5 4.5c-1.34.71-3.01.2-3.72-1.14-.71-1.34-.2-3.01 1.14-3.72l2.04-1.08v-1.21l-.69-.28-1.11-.46c-.99-.41-1.65-1.35-1.7-2.41-.05-1.06.52-2.06 1.46-2.56l8.5-4.5c1.34-.71 3.01-.2 3.72 1.14.71 1.34.2 3.01-1.14 3.72L15.5 9.26v1.21l1.8.74c.99.41 1.65 1.35 1.7 2.41.05 1.06-.52 2.06-1.46 2.56z\"/><path d=\"M10 14.65v-5.3L15 12l-5 2.65z\"/></svg>", "search": "<svg viewBox=\"0 0 24 24\"><path d=\"M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.2a1.2 1.2 0 0 1-1.7 1.7l-4.2-4.3A7.5 7.5 0 1 1 10.5 3zm0 2.4a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2z\"/></svg>", "settings": "<svg viewBox=\"0 0 24 24\"><path d=\"M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z\"/></svg>"};
  var FILTER = "<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\"><filter id=\"jelly-glass\" x=\"-5%\" y=\"-5%\" width=\"110%\" height=\"110%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\".02 .035\" numOctaves=\"2\" seed=\"7\" result=\"n\"/><feGaussianBlur in=\"n\" stdDeviation=\"1.2\" result=\"b\"/><feDisplacementMap in=\"SourceGraphic\" in2=\"b\" scale=\"9\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter></svg>";
  var CSS = ":root{--bg:#000;--tile:linear-gradient(160deg,rgba(255,255,255,.08),rgba(20,20,24,.34));--tile-on:linear-gradient(160deg,rgba(255,255,255,.17),rgba(20,20,24,.26));--gs:inset 0 0 0 1.5px rgba(255,255,255,.75),inset 0 1px 1px rgba(255,255,255,.18),inset 0 -2px 5px rgba(0,0,0,.2),inset 3px 3px 6px -4px rgba(255,255,255,.12),inset -3px -3px 6px -4px rgba(0,0,0,.25);--icon:rgba(255,255,255,.55);--icon-on:#fff;color-scheme:dark}\n#movily-bottom-nav{position:fixed;left:0;right:0;bottom:0;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 14px 14px;pointer-events:none}\n#movily-bottom-nav button{all:unset;box-sizing:border-box;pointer-events:auto;flex:1;max-width:56px;height:48px;display:flex;align-items:center;justify-content:center;\n  border-radius:18px;background:var(--tile);color:var(--icon);cursor:pointer;-webkit-tap-highlight-color:transparent;\n  box-shadow:0 6px 16px rgba(0,0,0,.45);\n  transition:background .3s,color .3s,transform .4s cubic-bezier(.3,1.5,.5,1)}\n#movily-bottom-nav button svg{width:23px;height:23px;fill:currentColor;transition:transform .4s cubic-bezier(.3,1.5,.5,1)}\n#movily-bottom-nav button:active{transform:scale(.92)}\n#movily-bottom-nav button:focus-visible{outline:2px solid #fff;outline-offset:2px}\n#movily-bottom-nav button.on{background:var(--tile-on);color:var(--icon-on);transform:translateY(-4px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 10px 20px rgba(0,0,0,.5)}\n#movily-bottom-nav button.on:active{transform:translateY(-4px) scale(.92)}\n#movily-bottom-nav button.on svg{transform:scale(1.1)}\n#movily-bottom-nav button[data-act=\"back\"]{flex:0 0 38px;width:38px;height:38px;border-radius:50%;color:#fff;margin-right:2px}\n#movily-bottom-nav button[data-act=\"back\"] svg{width:23px;height:23px}\n#movily-bottom-nav button[data-act=\"back\"].flash{background:var(--tile-on);transform:translateY(-4px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14),0 10px 20px rgba(0,0,0,.5)}\n#movily-bottom-nav button[data-act=\"back\"]:active{background:var(--tile-on);transform:translateY(-4px) scale(.92)}\n#movily-bottom-nav button[data-tab=\"Шортс\"] svg path{stroke:currentColor;stroke-width:1;stroke-linejoin:round}\n\n/* ===== Ultra transparent liquid / jelly glass ===== */\n#movily-bottom-nav button{position:relative;isolation:isolate;will-change:transform;\n  -webkit-backdrop-filter:blur(6px) saturate(1.3) brightness(.92);backdrop-filter:blur(6px) saturate(1.3) brightness(.92);\n  box-shadow:var(--gs),0 8px 18px rgba(0,0,0,.22)}\n#movily-bottom-nav button.on,#movily-bottom-nav button[data-act=\"back\"].flash{box-shadow:var(--gs),0 12px 22px rgba(0,0,0,.28)}\n#movily-bottom-nav button svg{filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))}\n#movily-bottom-nav button::before{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-1;\n  background:radial-gradient(110% 65% at var(--mx,30%) var(--my,0%),rgba(255,255,255,.08),rgba(255,255,255,0) 50%)}\n#movily-bottom-nav button::after{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-1;\n  -webkit-filter:url(#jelly-glass);filter:url(#jelly-glass);\n  box-shadow:inset 2px 2px 0 -1px rgba(255,255,255,.2),inset -1.5px -1.5px 0 -1px rgba(255,255,255,.08)}\n#movily-bottom-nav button:active{transform:none}\n#movily-bottom-nav button.on:active{transform:translateY(-4px)}\n#movily-bottom-nav button[data-act=\"back\"]:active{transform:translateY(-4px)}\n@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){#movily-bottom-nav button{background:rgba(70,72,78,.5)!important}}\n/* arch panel removed */\n#movily-bottom-nav::before{display:none;content:\"\";position:absolute;left:0;right:0;bottom:0;top:-26px;z-index:-1;pointer-events:none;\n  border-radius:50% 50% 0 0 / 44px 44px 0 0;\n  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.3));\n  -webkit-backdrop-filter:blur(8px) saturate(1.3);backdrop-filter:blur(8px) saturate(1.3);\n  box-shadow:inset 0 1.5px 1px rgba(255,255,255,.16),0 -8px 26px rgba(0,0,0,.35)}\n@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){#movily-bottom-nav::before{background:rgba(24,24,26,.85)}}\n#movily-bottom-nav button[data-tab=\"Головна\"]{order:1}\n#movily-bottom-nav button[data-tab=\"Шортс\"]{order:2}\n#movily-bottom-nav button[data-tab=\"Налаштування\"]{order:5}\n#movily-bottom-nav button[data-act=\"back\"]{position:relative;left:auto;top:auto;order:0;margin:0;flex:1;width:auto;max-width:56px;height:48px;border-radius:18px}\n#movily-bottom-nav button[data-tab=\"Пошук\"]{order:4}\n/* capsule frame around the buttons */\n#movily-bottom-nav::before{display:none;left:10px;right:10px;top:4px;bottom:8px;border-radius:999px;background:rgba(30,30,33,.82);border:1.5px solid rgba(255,255,255,.14);box-shadow:none;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}\n@keyframes hop{0%{transform:scale(1.1)}35%{transform:translateY(-7px) scale(1.2)}70%{transform:translateY(1px) scale(1.06)}100%{transform:scale(1.1)}}\n@keyframes wig{0%,100%{transform:scale(1.1) rotate(0)}25%{transform:scale(1.2) rotate(-18deg)}60%{transform:scale(1.2) rotate(14deg)}}\n@keyframes beat{0%,100%{transform:scale(1.1)}30%{transform:scale(1.4)}60%{transform:scale(1.04)}}\n@keyframes nudge{0%,100%{transform:translateX(0)}40%{transform:translateX(-6px)}}\n#movily-bottom-nav button.pop[data-tab=\"Головна\"] svg{animation:hop .5s}\n#movily-bottom-nav button.pop[data-tab=\"Шортс\"] svg{animation:beat .5s}\n#movily-bottom-nav button.pop[data-tab=\"Пошук\"] svg{animation:wig .5s}\n#movily-bottom-nav button.pop[data-act=\"back\"] svg{animation:nudge .35s}\n@media (prefers-reduced-motion:reduce){#movily-bottom-nav button,#movily-bottom-nav button svg{transition:none!important}#movily-bottom-nav button.pop svg{animation:none!important}}\n";
  var active = 'main';
  var hist = ['main'];

  function css() {
    var old = document.getElementById('movily-bottom-nav-css');
    if (old) old.remove();
    var s = document.createElement('style');
    s.id = 'movily-bottom-nav-css';
    s.textContent = CSS +
      '\n.navigation-bar{display:none!important}' +
      '\nbody.movily-bottom-nav-visible{padding-bottom:calc(78px + env(safe-area-inset-bottom,0px))}' +
      '\nbody.movily-bottom-nav-hidden #'+NAV_ID+'{display:none!important}' +
      '\n#'+NAV_ID+'{z-index:19;padding-bottom:calc(14px + env(safe-area-inset-bottom,0px) * .5)}';
    (document.head || document.documentElement).appendChild(s);
  }

  function tr(key, fb) { try { return Lampa.Lang.translate(key) || fb; } catch (e) { return fb; } }

  function goHome() {
    try { Lampa.Activity.push({ url: '', title: tr('title_main', 'Головна'), component: 'main', source: Lampa.Storage.field('source') }); }
    catch (e) { try { Lampa.Controller.toggle('content'); } catch (x) {} }
  }
  function goShorts() {
    try { Lampa.Activity.push({ url: 'feed', title: tr('menu_feed', 'Шортс'), component: 'feed' }); } catch (e) {}
  }
  function goSearch() {
    try { if (Lampa.Search && typeof Lampa.Search.open === 'function') Lampa.Search.open({}); } catch (e) {}
  }
  function goSettings() {
    try {
      var b = document.querySelector('.head__settings, .settings-icon-holder, .head__action.open--settings, .open--settings');
      if (b) b.click(); else Lampa.Controller.toggle('settings');
    } catch (e) {}
  }
  function goBack() {
    try {
      var b = document.querySelector('.navigation-bar__item[data-action="back"], .head__action.open--back');
      if (b) { b.click(); return; }
      if (Lampa.Activity && Lampa.Activity.backward) Lampa.Activity.backward();
    } catch (e) {}
  }

  function setActive(tab, remember) {
    var nav = document.getElementById(NAV_ID);
    if (!nav) return;
    active = tab;
    nav.querySelectorAll('button[data-key]').forEach(function (b) { b.classList.toggle('on', b.dataset.key === tab); });
    if (remember && hist[hist.length - 1] !== tab) hist.push(tab);
  }

  function render() {
    var nav = document.getElementById(NAV_ID);
    if (nav) return nav;
    if (!document.getElementById('movily-jelly-filter')) {
      var holder = document.createElement('div');
      holder.id = 'movily-jelly-filter';
      holder.innerHTML = FILTER;
      document.body.appendChild(holder);
    }
    nav = document.createElement('nav');
    nav.id = NAV_ID;
    nav.setAttribute('aria-label', 'Нижнє меню');
    nav.innerHTML =
      '<button data-act="back" aria-label="Назад">' + ICONS.back + '</button>' +
      '<button class="on" data-tab="Головна" data-key="main" aria-label="Головна">' + ICONS.main + '</button>' +
      '<button data-tab="Шортс" data-key="shorts" aria-label="Шортс">' + ICONS.shorts + '</button>' +
      '<button data-tab="Пошук" data-key="search" aria-label="Пошук">' + ICONS.search + '</button>' +
      '<button data-tab="Налаштування" data-key="settings" aria-label="Налаштування">' + ICONS.settings + '</button>';
    document.body.appendChild(nav);

    nav.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
        if (b.dataset.act === 'back') {
          b.classList.add('flash'); setTimeout(function () { b.classList.remove('flash'); }, 450);
          goBack();
          return;
        }
        var k = b.dataset.key;
        setActive(k, true);
        if (k === 'main') goHome();
        else if (k === 'shorts') goShorts();
        else if (k === 'search') goSearch();
        else if (k === 'settings') goSettings();
      });

      var sx = 1, sy = 1, vx = 0, vy = 0, tx = 1, ty = 1, raf = 0;
      function step() {
        vx += (tx - sx) * .22; vy += (ty - sy) * .22; vx *= .78; vy *= .78; sx += vx; sy += vy;
        b.style.scale = sx.toFixed(4) + ' ' + sy.toFixed(4);
        if (Math.abs(tx - sx) + Math.abs(ty - sy) + Math.abs(vx) + Math.abs(vy) > .003) raf = requestAnimationFrame(step);
        else { b.style.scale = ''; raf = 0; }
      }
      function run() { if (!raf) raf = requestAnimationFrame(step); }
      function light(e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        b.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      }
      b.addEventListener('pointerdown', function (e) { light(e); tx = 1.1; ty = .85; vy -= .02; run(); });
      b.addEventListener('pointermove', function (e) { if (e.buttons) light(e); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) {
        b.addEventListener(n, function () { tx = 1; ty = 1; run(); });
      });
    });
    return nav;
  }

  function currentComponent() {
    try {
      var a = Lampa.Activity.active();
      return String(a && (a.component || (a.activity && a.activity.component) || '') || '').toLowerCase();
    } catch (e) { return ''; }
  }

  function isCovered() {
    var b = document.body;
    if (!b) return false;
    if (b.classList.contains('settings--open') || b.classList.contains('search--open') ||
        b.classList.contains('selectbox--open')) return true;
    if (document.querySelector('.player, .youtube-player, .modal, .search-box, .settings__layer.layer--visible, body > .search, .layer--visible > .search')) return true;
    var c = currentComponent();
    return c === 'search' || c === 'settings';
  }

  function visibility() {
    render();
    var hidden = isCovered();
    document.body.classList.toggle('movily-bottom-nav-visible', !hidden);
    document.body.classList.toggle('movily-bottom-nav-hidden', hidden);
    if (hidden) return;
    var c = currentComponent();
    if (c === 'main') setActive('main', false);
    else if (c === 'feed') setActive('shorts', false);
  }

  function start() {
    css();
    render();
    Lampa.Listener.follow('activity', function () { setTimeout(visibility, 60); });
    Lampa.Listener.follow('full', function () { setTimeout(visibility, 60); });
    setInterval(visibility, 400);
    try {
      new MutationObserver(visibility).observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true });
    } catch (e) {}
    try { Lampa.Search && Lampa.Search.listener && Lampa.Search.listener.follow && Lampa.Search.listener.follow('open', visibility); } catch (e) {}
    try { Lampa.Search && Lampa.Search.listener && Lampa.Search.listener.follow && Lampa.Search.listener.follow('close', visibility); } catch (e) {}
    visibility();
  }

  if (window.Lampa && Lampa.Listener && Lampa.Storage) start();
  else {
    var t = setInterval(function () {
      if (window.Lampa && Lampa.Listener && Lampa.Storage) { clearInterval(t); start(); }
    }, 200);
  }
})();
