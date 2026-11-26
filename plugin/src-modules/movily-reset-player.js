/* Movily: SenPlayer-інтеграцію прибрано. Один раз скидає плеєр, який раніше сам виставляв модуль (SenPlayer за замовчуванням),
   на стандартний вбудований плеєр Lampa і чистить службові дані. Вибір, зроблений вручну пізніше, не чіпається. */
(function () {
  'use strict';
  try {
    var ls = window.localStorage;
    if (ls.getItem('movily_sp_default_done') === '1' && ls.getItem('movily_sp_reset_done') !== '1') {
      ['player', 'player_torrent'].forEach(function (k) {
        var v = ls.getItem(k);
        if (v === 'senplayer' || v === '"senplayer"') ls.setItem(k, 'inner');
      });
    }
    ['movily_sp_default_done', 'movily_sp_pending', 'movily_sp_log', 'movily_sp_topic', 'movily_sp_channel', 'movily_sp_reset_done'].forEach(function (k) { ls.removeItem(k); });
    ls.setItem('movily_sp_reset_done', '1');
  } catch (e) {}
})();
