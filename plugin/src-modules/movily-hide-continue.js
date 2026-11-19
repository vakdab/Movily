/* Movily: прибирає рядок «Продовжити перегляд» з головної.
   Використовує штатний перемикач рядків Lampa (content_rows_continue_watch), тому
   рядок не завантажується взагалі. Значення примусово скидається при кожному запуску. */
(function () {
  'use strict';
  if (window.__movily_hide_continue) return;
  window.__movily_hide_continue = true;
  var KEY = 'content_rows_continue_watch';
  function off() {
    try { if (Lampa.Storage.get(KEY, 'true') !== false) Lampa.Storage.set(KEY, false); } catch (e) {}
  }
  off();
  try { Lampa.Listener.follow('app', function (e) { if (e && e.type === 'ready') off(); }); } catch (e) {}
  try { Lampa.Listener.follow('activity', function (e) { if (e && e.type === 'start') off(); }); } catch (e) {}
})();
