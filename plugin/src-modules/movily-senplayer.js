/* Movily: зовнішній плеєр SenPlayer (iOS/iPadOS/macOS) + таймкоди.
   1. «Конектор»: коли Lampa запускає відео, а плеєр у налаштуваннях SenPlayer, відкриваємо
      senplayer://x-callback-url/play?url=...&position=<сек> з колбеками x-success / x-cancel / x-error,
      які ведуть назад на цей сайт (https), а не на lampa://, якого у веб-версії немає.
   2. Повернення: якщо SenPlayer передав позицію (position / time / currentTime / lastPosition ...), вона
      записується в таймкод Lampa. Усе, що SenPlayer передав, лишається в журналі діагностики
      (Налаштування > Інтерфейс > SenPlayer > «Що повернув SenPlayer»).
   3. Запасний ручний запис: коли користувач повертається на сторінку, а позиція не прийшла, показується
      вибір «Скільки переглянуто?» (25 / 50 / 75 / 90 % / до кінця / пропустити), і таймкод пишеться в Lampa.
   Поза iOS/macOS модуль нічого не робить. */
(function () {
  'use strict';
  if (window.__movily_senplayer) return;
  window.__movily_senplayer = true;

  var KEY_PENDING = 'movily_sp_pending';   // що зараз грає в SenPlayer (localStorage, переживає перезапуск сторінки)
  var KEY_LOG = 'movily_sp_log';           // що повернув SenPlayer (для діагностики)
  var POS_KEYS = ['position', 'time', 'currentTime', 'currenttime', 'lastPosition', 'last_position', 'playbackTime', 'progress', 'seconds', 'start', 'startTime'];
  var DUR_KEYS = ['duration', 'total', 'length'];

  function isApple() {
    try { return /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) && (/Mobile|iPad|iPhone/.test(navigator.userAgent) || navigator.maxTouchPoints > 1); } catch (e) { return false; }
  }
  function ls(k, v) {
    try {
      if (v === undefined) { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; }
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
    return null;
  }
  function L() { return window.Lampa; }
  function tr(uk, en) { try { return /^uk|ru/.test(L().Storage.get('language', 'uk')) ? uk : en; } catch (e) { return uk; } }

  // ---------- 1. the launch ----------
  function usesSen(data) {
    try {
      var need = 'player' + (data && data.torrent_hash ? '_torrent' : '');
      return L().Storage.field(need) === 'senplayer';
    } catch (e) { return false; }
  }

  function startPosition(data) {
    var t = data && data.timeline;
    if (!t) return 0;
    if (t.time > 1) return Math.floor(t.time);
    if (t.percent > 0 && t.duration > 0) return Math.floor(t.duration * (t.percent > 1 ? t.percent / 100 : t.percent));
    return 0;
  }

  function base() { return location.origin + location.pathname.replace(/[^/]*$/, ''); }
  function cb(kind) { return base() + '?sp=' + kind; }

  function senUrl(data, pos) {
    var u = L().Torserver && L().Torserver.toPlayUrl ? L().Torserver.toPlayUrl(data.url) : data.url;
    var q = 'url=' + encodeURIComponent(u);
    if (pos > 0) q += '&position=' + pos + '&startTime=' + pos;
    if (data.title) q += '&filename=' + encodeURIComponent(String(data.title).replace(/<[^>]*>/g, ''));
    q += '&x-success=' + encodeURIComponent(cb('done')) + '&x-cancel=' + encodeURIComponent(cb('cancel')) + '&x-error=' + encodeURIComponent(cb('error'));
    return 'senplayer://x-callback-url/play?' + q;
  }

  function remember(data, pos) {
    var t = data.timeline || {};
    ls(KEY_PENDING, {
      at: Date.now(), title: String(data.title || '').replace(/<[^>]*>/g, ''), hash: t.hash || null,
      duration: t.duration || 0, startedAt: pos || 0, card: t.card || null, season: t.season, episode: t.episode
    });
  }

  function onCreate(e) {
    try {
      if (!isApple()) return;
      var data = e && e.data;
      if (!data || !data.url || !usesSen(data)) return;
      if (/youtube\.com|youtu\.be/.test(data.url)) return;      // trailers stay in Lampa's own player
      if (data.launch_player === 'lampa' || data.launch_player === 'inner') return;
      var pos = startPosition(data);
      e.abort();                                                // Lampa's own launch (no callback, no position) is not used
      remember(data, pos);
      try { L().Player.listener.send('external', data); } catch (x) {}
      window.location.assign(senUrl(data, pos));
    } catch (x) {}
  }

  // ---------- 2. the return ----------
  function num(v) { var n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; }
  function pick(params, keys) {
    for (var i = 0; i < keys.length; i++) {
      for (var k in params) if (k.toLowerCase() === keys[i].toLowerCase()) { var n = num(params[k]); if (n !== null) return n; }
    }
    return null;
  }

  function writeTimecode(pend, seconds, duration) {
    try {
      if (!pend || !pend.hash) return false;
      var dur = duration || pend.duration || 0;
      var percent = dur > 0 ? Math.max(0, Math.min(100, Math.round(seconds / dur * 100))) : 0;
      var rec = { hash: pend.hash, percent: percent, time: Math.round(seconds), duration: Math.round(dur) };
      if (pend.card) { rec.card = pend.card; if (pend.season !== undefined) rec.season = pend.season; if (pend.episode !== undefined) rec.episode = pend.episode; }
      if (L().Timeline && typeof L().Timeline.update === 'function') L().Timeline.update(rec);
      return true;
    } catch (e) { return false; }
  }

  function logReturn(kind, params, pend, wrote) {
    var log = ls(KEY_LOG) || [];
    log.unshift({ at: new Date().toISOString(), kind: kind, params: params, title: pend && pend.title, wrote: wrote });
    ls(KEY_LOG, log.slice(0, 15));
  }

  // The return opens this site in a NEW tab (iOS opens the x-success link that way). index.html does not load Lampa
  // there: it hands the data to the tab that started the video (BroadcastChannel / storage event) and shows «Done».
  // This side listens. If no other tab was open, index.html continues to the app with ?spr=... (see readReturn).
  var CH = 'movily_sp_channel';
  var returned = null;   // {kind, params} read from the URL at start
  function listen() {
    var seen = {};
    function take(r) {
      if (!r || !r.kind || seen[r.id]) return;
      seen[r.id] = 1;
      returned = r;
      handleReturn();
    }
    try { var bc = new BroadcastChannel(CH); bc.onmessage = function (m) { take(m.data); }; } catch (e) {}
    window.addEventListener('storage', function (ev) {
      if (ev.key !== CH || !ev.newValue) return;
      try { take(JSON.parse(ev.newValue)); } catch (e) {}
    });
  }
  function readReturn() {
    try {
      var sp = new URLSearchParams(location.search);
      if (sp.has('spr')) {                        // arrived from the return page: no other tab took it
        returned = JSON.parse(sp.get('spr'));
        history.replaceState(null, '', location.pathname + location.hash);
        return;
      }
    } catch (e) {}
  }

  function handleReturn() {
    var pend = ls(KEY_PENDING);
    if (!returned) return false;
    var r = returned; returned = null;
    try { var ack = new BroadcastChannel(CH + '_ack'); ack.postMessage(r.id); ack.close(); } catch (e) {}
    var secs = pick(r.params, POS_KEYS), dur = pick(r.params, DUR_KEYS);
    var wrote = false;
    if (secs !== null && secs >= 0 && pend) {
      // some players report a fraction or a percent: 0..1 is treated as a fraction of the duration when the length is known
      if (secs <= 1 && (dur || pend.duration)) secs = secs * (dur || pend.duration);
      wrote = writeTimecode(pend, secs, dur);
      if (wrote) { ls(KEY_PENDING, null); toast(tr('Таймкод збережено: ', 'Saved: ') + fmt(secs)); }
    }
    logReturn(r.kind, r.params, pend, wrote);
    if (r.kind === 'error') toast(tr('SenPlayer не зміг відтворити відео', 'SenPlayer could not play the video'));
    return wrote;
  }

  // ---------- 3. the manual fallback ----------
  function fmt(s) { s = Math.round(s); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (x < 10 ? '0' : '') + x; }
  function toast(t) { try { L().Noty.show(t); } catch (e) {} }

  function askManual() {
    var pend = ls(KEY_PENDING);
    if (!pend || !pend.hash || Date.now() - pend.at > 8 * 3600 * 1000) return;
    if (!pend.duration) return;                  // without the length a percent means nothing; the next play will carry it
    var C = L().Controller, S = L().Select;
    if (!S || !C) return;
    var enabled = C.enabled && C.enabled();
    var pcts = [25, 50, 75, 90, 100];
    var items = pcts.map(function (p) { return { title: p === 100 ? tr('Переглянуто до кінця', 'Watched to the end') : p + '%  (' + fmt(pend.duration * p / 100) + ')', p: p }; });
    items.push({ title: tr('Не зберігати', 'Do not save'), p: -1 });
    S.show({
      title: tr('Скільки переглянуто?', 'How much did you watch?') + (pend.title ? ' · ' + pend.title : ''),
      items: items,
      onSelect: function (it) {
        try { if (enabled && enabled.name) C.toggle(enabled.name); } catch (e) {}
        if (it.p > 0) { writeTimecode(pend, pend.duration * it.p / 100, pend.duration); toast(tr('Таймкод збережено', 'Saved')); }
        ls(KEY_PENDING, null);
      },
      onBack: function () { try { if (enabled && enabled.name) C.toggle(enabled.name); } catch (e) {} ls(KEY_PENDING, null); }
    });
  }

  // the page comes back to the front (the user left SenPlayer without a callback): ask once
  var asked = false;
  function onVisible() {
    if (document.visibilityState !== 'visible' || asked) return;
    var pend = ls(KEY_PENDING);
    if (!pend || Date.now() - pend.at < 4000) return;     // too soon: the page was not left yet
    asked = true;
    setTimeout(function () { asked = false; }, 3000);
    if (!L() || !L().Select) return;
    // a callback return was handled (and cleared the pending record) by start(); this is the no-callback path
    setTimeout(askManual, 400);
  }

  // ---------- settings ----------
  function settings() {
    try {
      var S = L().SettingsApi;
      if (!S || !S.addParam) return;
      S.addParam({
        component: 'interface',
        param: { name: 'movily_sp_show', type: 'static' },
        field: { name: 'SenPlayer', description: tr('Що повернув SenPlayer (для діагностики)', 'What SenPlayer returned (diagnostics)') },
        onRender: function (item) {
          item.on('hover:enter click', function () {
            var log = ls(KEY_LOG) || [];
            var items = log.length ? log.map(function (r) {
              return { title: (r.kind || '?') + (r.wrote ? ' · ✓' : '') + ' · ' + String(r.at).slice(11, 19), subtitle: JSON.stringify(r.params).slice(0, 160) };
            }) : [{ title: tr('Ще нічого не поверталось', 'Nothing returned yet') }];
            L().Select.show({ title: tr('Що повернув SenPlayer', 'What SenPlayer returned'), items: items, onBack: function () { L().Controller.toggle('settings_component'); } });
          });
        }
      });
    } catch (e) {}
  }

  // ---------- the default player ----------
  // once per device, only where SenPlayer can open (Apple) and only if the viewer has not chosen a player
  function defaultPlayer() {
    try {
      if (!isApple()) return;
      if (localStorage.getItem('movily_sp_default_done')) return;
      localStorage.setItem('movily_sp_default_done', '1');
      ['player', 'player_torrent'].forEach(function (k) {
        if (localStorage.getItem(k) === null) L().Storage.set(k, 'senplayer');
      });
    } catch (e) {}
  }

  // ---------- start ----------
  function start() {
    defaultPlayer();
    readReturn();
    listen();
    try { L().Player.listener.follow('create', onCreate); } catch (e) {}
    settings();
    setTimeout(function () { handleReturn(); }, 600);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', function () { setTimeout(function () { if (!returned) onVisible(); }, 300); });
  }

  if (window.Lampa && Lampa.Player && Lampa.Player.listener) start();
  else { var t = setInterval(function () { if (window.Lampa && Lampa.Player && Lampa.Player.listener) { clearInterval(t); start(); } }, 200); }
})();
