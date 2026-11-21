/* Movily top navigation: adds the "Шортс" item to Lampa's navigation bar (Back | Головна | Шортс | Налаштування | Пошук)
   and keeps the active state in sync. Standalone. */
(function () {
  'use strict';
  if (window.__movily_topnav) return;
  window.__movily_topnav = true;

  var ICON = '<svg viewBox="0 0 24 24"><path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zm-.23 5.86l-8.5 4.5c-1.34.71-3.01.2-3.72-1.14-.71-1.34-.2-3.01 1.14-3.72l2.04-1.08v-1.21l-.69-.28-1.11-.46c-.99-.41-1.65-1.35-1.7-2.41-.05-1.06.52-2.06 1.46-2.56l8.5-4.5c1.34-.71 3.01-.2 3.72 1.14.71 1.34.2 3.01-1.14 3.72L15.5 9.26v1.21l1.8.74c.99.41 1.65 1.35 1.7 2.41.05 1.06-.52 2.06-1.46 2.56z"/><path d="M10 14.65v-5.3L15 12l-5 2.65z"/></svg>';

  function title() {
    try { return (Lampa.Lang.translate('menu_feed') || 'Шортс'); } catch (e) { return 'Шортс'; }
  }

  function openShorts() {
    try { Lampa.Activity.push({ url: 'feed', title: 'Шортс', component: 'feed' }); } catch (e) {}
  }

  function currentComponent() {
    try { var a = Lampa.Activity.active(); return a && a.component; } catch (e) { return ''; }
  }

  function sync() {
    var bar = document.querySelector('.navigation-bar');
    if (!bar) return;
    var b = document.body.classList;
    var comp = currentComponent();
    var key = b.contains('settings--open') ? 'settings' : b.contains('search--open') ? 'search' : comp === 'feed' ? 'shorts' : comp === 'main' ? 'main' : '';
    [].forEach.call(bar.querySelectorAll('.navigation-bar__item'), function (it) {
      var on = it.getAttribute('data-action') === key;
      it.classList.toggle('mv-active', on);
      if (it.getAttribute('data-action') === 'shorts') it.classList.toggle('mv-on', on);
    });
    document.body.classList.toggle('mv-at-shorts', key === 'shorts');
  }

  function ensure() {
    var body = document.querySelector('.navigation-bar .navigation-bar__body');
    if (!body) return;
    if (body.querySelector('[data-action="shorts"]')) return;
    var main = body.querySelector('[data-action="main"]');
    var item = document.createElement('div');
    item.className = 'navigation-bar__item';
    item.setAttribute('data-action', 'shorts');
    item.innerHTML = '<div class="navigation-bar__icon">' + ICON + '</div><div class="navigation-bar__label">' + title() + '</div>';
    item.addEventListener('click', openShorts);
    if (main && main.nextSibling) body.insertBefore(item, main.nextSibling); else body.appendChild(item);
  }

  function css() {
    if (document.getElementById('movily-topnav-css')) return;
    var s = document.createElement('style');
    s.id = 'movily-topnav-css';
    s.textContent = [
      'body.stv .navigation-bar .navigation-bar__item[data-action=shorts]{order:2}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=settings]{order:3}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=shorts].mv-on{background:transparent!important;color:#fff!important}',
      /* while Shorts is open, Home is not highlighted */
      'body.stv.mv-at-shorts .navigation-bar .navigation-bar__item[data-action=main]{background:transparent!important;color:var(--mv-dim,rgba(255,255,255,.62))!important}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function start() {
    css(); ensure(); sync();
    try { Lampa.Listener.follow('activity', function () { setTimeout(function () { ensure(); sync(); }, 60); }); } catch (e) {}
    setInterval(function () { ensure(); sync(); }, 1500);
  }
  if (window.Lampa && Lampa.Listener) start();
  else { var t = setInterval(function () { if (window.Lampa && Lampa.Listener) { clearInterval(t); start(); } }, 200); }
})();
