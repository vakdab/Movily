/* Movily: сніг (nemiroff/lampa/snow.js) з перемикачем в Налаштування > Інтерфейс. Вимкнено за замовчуванням. */
(function () {
  'use strict';
  if (window.__movily_snow) return;
  window.__movily_snow = true;
  var KEY = 'movily_snow';
  var SRC = 'https://nemiroff.github.io/lampa/snow.js';
  var STR = {
    uk: { n: 'Сніг', d: 'Падаючий сніг на фоні. Потрібен перезапуск додатка після вимкнення.' },
    ru: { n: 'Снег', d: 'Падающий снег на фоне. После выключения нужен перезапуск приложения.' },
    en: { n: 'Snow', d: 'Falling snow over the background. Restart the app after turning it off.' }
  };
  function tr(k) {
    var l = 'uk';
    try { l = String(Lampa.Storage.get('language', 'uk') || 'uk'); } catch (e) {}
    return (STR[l] || STR.en)[k];
  }
  function on() {
    try { var v = Lampa.Storage.get(KEY, false); return v === true || v === 'true'; } catch (e) { return false; }
  }
  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.src = SRC;
    s.onload = function () {
      /* snow.js чекає подію app:ready, яка вже минула: запускаємо снігопад вручну */
      try {
        if (window.jQuery && jQuery.fn.snowfall) jQuery('.background').snowfall({ deviceorientation: true, round: true, minSize: 5, maxSize: 8 });
      } catch (e) {}
    };
    document.head.appendChild(s);
  }
  function clearSnow() {
    try { if (window.jQuery && jQuery.fn.snowfall) jQuery('.background').snowfall('clear'); } catch (e) {}
    try { jQuery('.snowfall-flakes, .snowfall-canvas').remove(); } catch (e) {}
    window.snow = false;
  }
  function settings() {
    var api = Lampa.SettingsApi;
    if (!api || window.__movily_snow_set) return;
    window.__movily_snow_set = true;
    api.addParam({ component: 'interface', param: { name: KEY, type: 'trigger', 'default': false },
      field: { name: tr('n'), description: tr('d') },
      onChange: function () { if (on()) load(); else clearSnow(); } });
  }
  function start() { settings(); if (on()) load(); }
  function wait() {
    if (window.Lampa && Lampa.Listener && window.appready) return start();
    var t = setInterval(function () {
      if (window.Lampa && Lampa.SettingsApi && window.appready) { clearInterval(t); start(); }
    }, 500);
  }
  wait();
})();
