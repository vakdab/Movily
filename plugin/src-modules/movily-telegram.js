/* Movily: сумісність із Telegram Mini App WebView.
   Telegram може блокувати location.assign() для custom URL schemes (senplayer://, infuse:// тощо).
   Для Mini App відкриваємо такі посилання через тимчасовий target=_blank anchor, що передає їх ОС.
   HTTPS-посилання відкриваємо через Telegram.WebApp.openLink, якщо API доступне. */
(function () {
  'use strict';
  if (window.__movily_telegram_bridge) return;
  window.__movily_telegram_bridge = true;
  function webApp() {
    try { return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null; } catch (e) { return null; }
  }
  function inTelegram() {
    var w = webApp();
    if (w) return true;
    try { return /Telegram/i.test(navigator.userAgent || '') || /tgWebApp/i.test(location.hash + location.search); } catch (e) { return false; }
  }
  function open(url) {
    if (!url) return false;
    var w = webApp();
    try {
      if (w && /^https?:/i.test(url) && typeof w.openLink === 'function') {
        w.openLink(url);
        return true;
      }
    } catch (e) {}
    if (!inTelegram()) {
      try { window.location.assign(url); return true; } catch (e) { return false; }
    }
    try {
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      (document.body || document.documentElement).appendChild(a);
      a.click();
      setTimeout(function () { try { a.remove(); } catch (e) {} }, 1000);
      return true;
    } catch (e) {
      try { window.location.href = url; return true; } catch (x) { return false; }
    }
  }
  window.Movily = window.Movily || {};
  window.Movily.isTelegram = inTelegram;
  window.Movily.openExternal = open;
})();
