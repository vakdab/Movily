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
  var LAYER = 'movily-snow-layer';
  function layer() {
    var el = document.getElementById(LAYER);
    if (!el) {
      el = document.createElement('div');
      el.id = LAYER;
      /* .background у Lampa має розмір 0x0, тому власний шар на весь екран, поверх усього, без кліків */
      el.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:2147483000;';
      document.body.appendChild(el);
    }
    return el;
  }
  function startFall() {
    if (!window.jQuery || !jQuery.fn.snowfall) return;
    var el = layer();
    jQuery(el).snowfall('clear');
    jQuery(el).snowfall({ deviceorientation: true, round: true, minSize: 5, maxSize: 8, flakeCount: 60 });
  }
  var loaded = false;
  function load() {
    if (loaded) { try { startFall(); } catch (e) {} return; }
    loaded = true;
    var s = document.createElement('script');
    s.src = SRC;
    s.onload = function () {
      /* snow.js чекає подію app:ready, яка вже минула: запускаємо снігопад вручну */
      try { startFall(); } catch (e) {}
    };
    document.head.appendChild(s);
  }
  function clearSnow() {
    try { var el = document.getElementById(LAYER); if (el) { jQuery(el).snowfall('clear'); el.parentNode.removeChild(el); } } catch (e) {}
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
