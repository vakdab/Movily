/* Movily: Telegram Mini App.
   Працює тільки всередині Telegram, поза ним нічого не робить.
   1. Telegram SDK: ready, expand, без закриття свайпом, кольори шапки/фону під Movily.
   2. Відео: у вебв'ю Telegram відео має грати прямо на сторінці (playsinline), а не в системному плеєрі;
      зовнішні плеєри (iOS/Android) там не відкриваються, тому плеєр завжди вбудований («inner»).
   3. Повний екран: через Telegram requestFullscreen (Bot API 8.0+), орієнтація не блокується (відео іде і вертикально, і горизонтально);
      на час відео Telegram не згортає застосунок свайпом, а екран не гасне.
   4. Кнопка «Назад» Telegram: закриває плеєр / повертає на крок назад, на головній закриває застосунок.
   5. Безпечні відступи (вирізи екрана) передаються в CSS змінними --tg-safe-*. */
(function () {
  'use strict';
  if (window.__movily_telegram) return;
  window.__movily_telegram = true;

  function inTelegram() {
    try {
      if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData) return true;
      var h = String(location.hash || '') + String(location.search || '');
      if (/tgWebApp(Data|Version|Platform)/i.test(h)) return true;
      if (window.TelegramWebviewProxy) return true;
    } catch (e) {}
    return false;
  }
  if (!inTelegram()) return;

  var W = null;
  function ver(v) { try { return W && typeof W.isVersionAtLeast === 'function' ? W.isVersionAtLeast(v) : false; } catch (e) { return false; } }
  function call(name) { try { if (W && typeof W[name] === 'function') return W[name].apply(W, Array.prototype.slice.call(arguments, 1)); } catch (e) {} }

  document.documentElement.classList.add('movily-tg');
  if (document.body) document.body.classList.add('movily-tg'); else document.addEventListener('DOMContentLoaded', function () { document.body.classList.add('movily-tg'); });

  // ---------- 2. video: inline, never the system player ----------
  function fixVideo(v) {
    if (!v || v.__mv_tg) return;
    v.__mv_tg = true;
    try {
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.playsInline = true;
      v.setAttribute('x-webkit-airplay', 'allow');
      v.setAttribute('disablepictureinpicture', '');   // Telegram's webview has no PiP; the page has its own
      v.removeAttribute('controls');
    } catch (e) {}
  }
  function scanVideos(root) {
    try { (root || document).querySelectorAll('video').forEach(fixVideo); } catch (e) {}
  }
  // every <video> the page creates gets the attributes before it starts playing
  try {
    var origCreate = document.createElement;
    document.createElement = function (tag) {
      var el = origCreate.apply(document, arguments);
      try { if (String(tag).toLowerCase() === 'video') fixVideo(el); } catch (e) {}
      return el;
    };
  } catch (e) {}
  try {
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        m.addedNodes && m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.tagName === 'VIDEO') fixVideo(n); else if (n.querySelector) scanVideos(n);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  // the external players (iOS apps, Android intents) cannot be opened from the webview: always the inner one
  function forceInnerPlayer() {
    try {
      if (!window.Lampa || !Lampa.Storage) return;
      ['player', 'player_iptv', 'player_torrent'].forEach(function (k) {
        var cur = Lampa.Storage.get(k, 'inner');
        if (cur && cur !== 'inner') Lampa.Storage.set(k, 'inner');
      });
    } catch (e) {}
  }

  // ---------- 3. fullscreen through Telegram ----------
  var tgFull = false;
  function enterFull() {
    if (!W) return;
    if (ver('8.0') && typeof W.requestFullscreen === 'function' && !W.isFullscreen) call('requestFullscreen');
    // no lockOrientation: it freezes the CURRENT orientation (portrait), the phone must be free to rotate
    call('unlockOrientation');
    tgFull = true;
  }
  function leaveFull() {
    if (!W || !tgFull) return;
    tgFull = false;
    if (ver('8.0') && W.isFullscreen) call('exitFullscreen');
    call('unlockOrientation');
  }

  // ---------- keep the screen awake and the swipe-to-close off while a video plays ----------
  var wake = null;
  function keepAwake(on) {
    try {
      if (on && navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(function (l) { wake = l; l.addEventListener('release', function () { wake = null; }); }, function () {});
      if (!on && wake) { wake.release(); wake = null; }
    } catch (e) {}
  }

  function playerOpen() { return !!document.querySelector('body.player--open, .player.visible, .player:not(.hide)') && !!document.querySelector('.player-video__video, .player video'); }
  var wasOpen = false;
  function watchPlayer() {
    var open = false;
    try { open = !!(window.Lampa && Lampa.Player && Lampa.Player.opened && Lampa.Player.opened()); } catch (e) {}
    if (!open) open = playerOpen();
    if (open === wasOpen) return;
    wasOpen = open;
    if (open) { enterFull(); keepAwake(true); document.body.classList.add('movily-tg-playing'); }
    else { leaveFull(); keepAwake(false); document.body.classList.remove('movily-tg-playing'); }
    backButton();
  }

  // ---------- 4. the Telegram «Back» button ----------
  var backBound = false, bbShown = null;
  function onBack() {
    try {
      if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.back === 'function') { Lampa.Controller.back(); return; }
    } catch (e) {}
    call('close');
  }
  function backButton() {
    var bb = W && W.BackButton;
    if (!bb || !ver('6.1')) return;
    try {
      if (!backBound) { bb.onClick(onBack); backBound = true; }
      var deep = false;
      try { deep = wasOpen || (window.Lampa && Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active().component !== 'main'); } catch (e) {}
      if (deep === bbShown) return;
      bbShown = deep;
      if (deep) bb.show(); else bb.hide();
    } catch (e) {}
  }

  // ---------- 5. safe areas ----------
  function insets() {
    if (!W) return;
    try {
      var s = W.safeAreaInset || {}, c = W.contentSafeAreaInset || {}, r = document.documentElement.style;
      r.setProperty('--tg-safe-top', (s.top || 0) + 'px');
      r.setProperty('--tg-safe-bottom', (s.bottom || 0) + 'px');
      r.setProperty('--tg-content-top', (c.top || 0) + 'px');
    } catch (e) {}
  }
  function paint() {
    // the colours are the page's own (black), the header/background of Telegram follow it
    try { call('setHeaderColor', '#000000'); call('setBackgroundColor', '#000000'); call('setBottomBarColor', '#000000'); } catch (e) {}
  }

  function calm() {
    if (!W) return;
    call('ready'); call('expand'); call('disableVerticalSwipes'); call('enableClosingConfirmation');
    paint(); insets();
  }

  function css() {
    if (document.getElementById('movily-tg-css')) return;
    var st = document.createElement('style');
    st.id = 'movily-tg-css';
    st.textContent = [
      /* Telegram's own top bar (fullscreen mode) sits over the page: leave room for it */
      'html.movily-tg body{padding-top:var(--tg-content-top,0)!important}',
      'html.movily-tg body.movily-tg-playing{padding-top:0!important}',
      'html.movily-tg{overscroll-behavior:none}',
      /* the player fills the screen, nothing selectable or draggable under the finger */
      'html.movily-tg .player-video__video{object-fit:contain}',
      'html.movily-tg .player{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  function loadSdk(done) {
    if (window.Telegram && Telegram.WebApp) return done();
    var s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-web-app.js';
    s.async = true;
    s.onload = done;
    s.onerror = function () {};
    (document.head || document.documentElement).appendChild(s);
  }

  function start() {
    css();
    scanVideos();
    loadSdk(function () {
      W = window.Telegram && Telegram.WebApp;
      if (!W) return;
      calm();
      setTimeout(calm, 500); setTimeout(calm, 2000);
      ['activated', 'viewportChanged', 'safeAreaChanged', 'contentSafeAreaChanged', 'fullscreenChanged', 'fullscreenFailed'].forEach(function (ev) {
        try { W.onEvent(ev, function () { insets(); if (ev === 'activated') calm(); }); } catch (e) {}
      });
      // Telegram left fullscreen by itself (swipe, its own button): the page player follows
      try { W.onEvent('fullscreenChanged', function () { if (!W.isFullscreen && wasOpen) tgFull = false; }); } catch (e) {}
      backButton();
      // the player and the page depth are watched; a light poll is enough (no DOM work when nothing changed)
      setInterval(function () { forceInnerPlayer(); watchPlayer(); backButton(); }, 700);
      try {
        if (window.Lampa && Lampa.Listener) Lampa.Listener.follow('activity', function () { setTimeout(backButton, 50); });
      } catch (e) {}
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
