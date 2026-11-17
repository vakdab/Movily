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
  var POS_KEYS = ['position', 'time', 'currentTime', 'currenttime', 'lastPosition', 'last_position', 'playbackTime', 'progress', 'seconds', 'start', 'startTime', 'lastPlayedPosition', 'lastPlayedTime', 'playedPosition', 'playedTime', 'lastPlayedProgress', 'elapsed'];
  var DUR_KEYS = ['duration', 'total', 'length', 'totalTime', 'lastPlayedDuration'];

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
  // A private relay topic (random, lives only in this app's storage). The return page opens in Safari, which cannot see the home-screen
  // app's storage, so Safari drops what SenPlayer returned into this topic and the app picks it up when it comes to the front.
  var RELAY = 'https://ntfy.sh/';
  function topic() {
    var t = null;
    try { t = localStorage.getItem('movily_sp_topic'); } catch (e) {}
    if (!t) {
      var a = new Uint8Array(12);
      try { crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < 12; i++) a[i] = Math.floor(Math.random() * 256); }
      t = 'mvl' + Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      try { localStorage.setItem('movily_sp_topic', t); } catch (e) {}
    }
    return t;
  }
  function cb(kind) { return base() + '?sp=' + kind + '&t=' + topic(); }

  function senUrl(data, pos) {
    var u = L().Torserver && L().Torserver.toPlayUrl ? L().Torserver.toPlayUrl(data.url) : data.url;
    var q = 'url=' + encodeURIComponent(u);
    if (pos > 0) q += '&position=' + pos + '&startTime=' + pos;
    if (data.title) q += '&filename=' + encodeURIComponent(String(data.title).replace(/<[^>]*>/g, ''));
    q += '&x-success=' + encodeURIComponent(cb('done')) + '&x-cancel=' + encodeURIComponent(cb('cancel')) + '&x-error=' + encodeURIComponent(cb('error'));
    return 'senplayer://x-callback-url/play?' + q;
  }

  // Lampa's own hash of an episode / movie: season + (":" if >10) + episode + original title (same as Lampa builds it)
  function fallbackHash(data) {
    try {
      var card = data.card || (L().Activity && L().Activity.active && L().Activity.active().card) || null;
      var title = card && (card.original_title || card.original_name);
      if (!title || !L().Utils || !L().Utils.hash) return null;
      var se = data.season !== undefined ? data.season : (data.timeline && data.timeline.season);
      var ep = data.episode !== undefined ? data.episode : (data.timeline && data.timeline.episode);
      var serial = !!(card.original_name || card.number_of_seasons);
      if (serial && (se === undefined || ep === undefined)) return null;
      return L().Utils.hash(serial ? [se, se > 10 ? ':' : '', ep, title].join('') : [title].join(''));
    } catch (e) { return null; }
  }

  // card key + season + episode in the format Lampa stores them (Timeline.link), so the progress line finds the record
  function linkOf(data) {
    var t = data.timeline || {};
    try {
      var card = (data.card && typeof data.card === 'object') ? data.card : (L().Activity && L().Activity.active && L().Activity.active() && L().Activity.active().card);
      if (card && L().Timeline && L().Timeline.link) {
        var se = data.season !== undefined ? data.season : (t.season !== undefined ? t.season : data.season_number);
        var ep = data.episode !== undefined ? data.episode : (t.episode !== undefined ? t.episode : data.episode_number);
        var lk = L().Timeline.link(card, se, ep);
        if (lk && lk.card) return lk;
      }
    } catch (e) {}
    return t.card ? { card: t.card, season: t.season, episode: t.episode } : null;
  }


  // ---------- real length of the episode (SenPlayer does not report it) ----------
  // 1) what Lampa already knows (timeline), 2) the card's runtime, 3) TMDB length of this very episode (async, fills the pending record)
  function activeCard(data) {
    try { return (data.card && typeof data.card === 'object') ? data.card : (L().Activity && L().Activity.active && L().Activity.active() && L().Activity.active().card); } catch (e) { return null; }
  }
  function guessDuration(data, lk) {
    try {
      var card = activeCard(data);
      var rt = card && (card.runtime || (card.episode_run_time && card.episode_run_time[0]) || (card.last_episode_to_air && card.last_episode_to_air.runtime));
      if (rt > 0) return Math.round(rt * 60);
    } catch (e) {}
    return 0;
  }
  function resolveDuration(data, lk, rec) {
    try {
      var card = activeCard(data);
      var id = card && card.id;
      if (!id || !card.name && !card.original_name) return;                  // movies: card runtime is enough
      var se = lk && lk.season !== undefined ? lk.season : data.season, ep = lk && lk.episode !== undefined ? lk.episode : data.episode;
      if (se === undefined || ep === undefined) return;
      if (['cub', 'tmdb'].indexOf(card.source || 'tmdb') === -1) id = card.tmdb_id;
      if (typeof id !== 'number' || !L().Api || !L().Api.sources || !L().Api.sources.tmdb) return;
      L().Api.sources.tmdb.get('tv/' + id + '/season/' + se, {}, function (j) {
        try {
          var e2 = (j.episodes_original || j.episodes || []).filter(function (x) { return x.episode_number == ep; })[0];
          if (!e2 || !(e2.runtime > 0)) return;
          var cur = ls(KEY_PENDING);
          if (cur && cur.at === rec.at) { cur.duration = e2.runtime * 60; ls(KEY_PENDING, cur); }
        } catch (x) {}
      }, function () {});
    } catch (e) {}
  }

  function remember(data, pos) {
    var t = data.timeline || {};
    var lk = linkOf(data) || {};
    var card = lk.card || null;
    var hash = t.hash || fallbackHash(data);
    var rec = {
      at: Date.now(), title: String(data.title || '').replace(/<[^>]*>/g, ''), hash: hash,
      duration: t.duration || 0, startedAt: pos || 0, card: card, season: lk.season, episode: lk.episode
    };
    if (!rec.duration) rec.duration = guessDuration(data, lk);
    ls(KEY_PENDING, rec);
    resolveDuration(data, lk, rec);
    // diagnostics: what we are going to write to, visible in Settings > Interface > SenPlayer
    var log = ls(KEY_LOG) || [];
    log.unshift({ at: new Date().toISOString(), kind: 'start', params: { hash: hash, hasTimeline: !!data.timeline, card: card, duration: rec.duration, pos: pos }, title: rec.title });
    ls(KEY_LOG, log.slice(0, 15));
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
      var url = senUrl(data, pos);
      if (window.Movily && typeof window.Movily.openExternal === 'function') window.Movily.openExternal(url);
      else window.location.assign(url);
    } catch (x) {}
  }

  // ---------- 2. the return ----------
  function num(v) {
    var str = String(v).trim();
    if (/^\d+:\d{1,2}(:\d{1,2})?(\.\d+)?$/.test(str)) {          // hh:mm:ss or mm:ss
      var a = str.split(':').map(parseFloat), r = 0;
      for (var i = 0; i < a.length; i++) r = r * 60 + a[i];
      return isNaN(r) ? null : r;
    }
    var n = parseFloat(str.replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function pick(params, keys) {
    for (var i = 0; i < keys.length; i++) {
      for (var k in params) if (k.toLowerCase() === keys[i].toLowerCase()) { var n = num(params[k]); if (n !== null) return n; }
    }
    return null;
  }
  // everything SenPlayer could put in the return link: query, hash, nested "?a=b" inside a value
  function flatten(params) {
    var out = {};
    function add(k, v) { if (!(k in out)) out[k] = v; }
    function walk(o, depth) {
      if (depth > 4 || o === null || o === undefined) return;
      if (typeof o === 'object') { for (var k in o) { if (o[k] !== null && typeof o[k] === 'object') walk(o[k], depth + 1); else add(k, o[k]); } return; }
      var v = String(o).trim();
      if (/^[\[{]/.test(v)) { try { walk(JSON.parse(v), depth + 1); } catch (e) {} }
    }
    for (var k in params) {
      var v = String(params[k]);
      add(k, v);
      var kt = String(k).trim();
      if (/^[\[{]/.test(kt)) { try { walk(JSON.parse(kt), 1); } catch (e) {} }   // the whole JSON arrived as the key
      if (/^[\[{]/.test(v)) { try { walk(JSON.parse(v), 1); } catch (e) {} }
      var m = v.match(/[?#&]([^=&]+=[^#]*)$/);
      if (m) { try { new URLSearchParams(m[1]).forEach(function (vv, kk) { add(kk, vv); }); } catch (e) {} }
    }
    return out;
  }


  // Lampa updates the lines itself (Timeline.update), but cards drawn by online plugins may be detached from the active layer:
  // make sure every line with this hash is visible and has the right width, like the built-in player does while it plays
  function paintLine(hash, percent) {
    try {
      var lines = document.querySelectorAll('.time-line[data-hash="' + hash + '"]');
      for (var i = 0; i < lines.length; i++) {
        lines[i].classList.toggle('hide', !percent);
        var d = lines[i].firstElementChild;
        if (d) d.style.width = percent + '%';
      }
    } catch (e) {}
  }

  function writeTimecode(pend, seconds, duration) {
    try {
      if (!pend || !pend.hash) { toast(tr('Не вдалося зберегти: немає ідентифікатора серії', 'Not saved: no episode id')); return false; }
      var dur = duration || pend.duration || 0;
      // SenPlayer does not report the length. Without it the line stays hidden (percent 0), so assume a typical episode
      // (at least 24 min and a little beyond the position); the real length replaces it on the next play
      if (!dur) dur = Math.max(1440, Math.ceil((seconds + 300) / 60) * 60);
      var percent = dur > 0 ? Math.max(0, Math.min(100, Math.round(seconds / dur * 100))) : 0;
      var rec = { hash: pend.hash, percent: percent, time: Math.round(seconds), duration: Math.round(dur) };
      if (pend.card) { rec.card = pend.card; if (pend.season !== undefined) rec.season = pend.season; if (pend.episode !== undefined) rec.episode = pend.episode; }
      if (L().Timeline && typeof L().Timeline.update === 'function') L().Timeline.update(rec);
      paintLine(pend.hash, percent);
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
  // pick up what the Safari return page dropped into the relay (only messages newer than the start of this playback)
  var pulling = false;
  function pull(cb2) {
    var pend = ls(KEY_PENDING);
    if (!pend || pulling || !window.fetch) return;
    pulling = true;
    var since = Math.max(0, Math.floor(pend.at / 1000) - 2);
    fetch(RELAY + topic() + '/json?poll=1&since=' + since)
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        var last = null;
        txt.split('\n').forEach(function (line) {
          if (!line) return;
          try { var m = JSON.parse(line); if (m.event === 'message' && m.message) last = JSON.parse(m.message); } catch (e) {}
        });
        pulling = false;
        if (last && last.kind) { returned = last; handleReturn(); if (cb2) cb2(true); } else if (cb2) cb2(false);
      })
      .catch(function () { pulling = false; if (cb2) cb2(false); });
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
    var P = flatten(r.params || {});
    var secs = pick(P, POS_KEYS), dur = pick(P, DUR_KEYS);
    if (secs === null) { for (var kk in P) { if (/pos|time|played|elapsed/i.test(kk) && !/url|title|name|date/i.test(kk)) { var nn = num(P[kk]); if (nn !== null) { secs = nn; break; } } } }
    if (dur === null) { for (var k2 in P) { if (/dur|total|length/i.test(k2)) { var n2 = num(P[k2]); if (n2 !== null) { dur = n2; break; } } } }
    var pct = pick(P, ['percent', 'percentage']);
    var wrote = false, fullDur = dur || (pend && pend.duration) || 0;
    if (dur && dur > 100000) dur = dur / 1000;                      // duration in ms
    if (secs !== null && pend) {
      if (fullDur && secs > fullDur * 1.5 && secs > 10000) secs = secs / 1000;   // position in ms
      else if (!fullDur && secs > 86400) secs = secs / 1000;
      if (secs <= 1 && fullDur) secs = secs * fullDur;                            // fraction
    } else if (pct !== null && pend && fullDur) {
      secs = fullDur * (pct > 1 ? pct / 100 : pct);
    }
    if (secs !== null && secs >= 0 && pend) {
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
    if (!pend || Date.now() - pend.at > 8 * 3600 * 1000) return;
    var C = L().Controller, S = L().Select;
    if (!S || !C) return;
    var enabled = C.enabled && C.enabled();
    var pcts = pend.duration ? [25, 50, 75, 90, 100] : [];
    // estimate: where it started + how long the page was in the background (capped at 6 h and at the length)
    var est = Math.max(0, (Date.now() - pend.at) / 1000 + (pend.startedAt || 0));
    if (pend.duration && est > pend.duration) est = pend.duration;
    var items = [];
    if (est > 30 && !(pend.leftAt && pend.leftAt <= pend.at)) items.push({ title: tr('Рекомендовано: ', 'Suggested: ') + fmt(est) + tr('  (за часом у плеєрі)', '  (by time in player)'), s: est });
    items = items.concat(pcts.map(function (p) { return { title: p === 100 ? tr('Переглянуто до кінця', 'Watched to the end') : p + '%  (' + fmt(pend.duration * p / 100) + ')', p: p }; }));
    items.push({ title: tr('Ввести час вручну (хв:сек)', 'Enter time manually (mm:ss)'), p: -2 });
    items.push({ title: tr('Не зберігати', 'Do not save'), p: -1 });
    S.show({
      title: tr('Скільки переглянуто?', 'How much did you watch?') + (pend.title ? ' · ' + pend.title : ''),
      items: items,
      onSelect: function (it) {
        try { if (enabled && enabled.name) C.toggle(enabled.name); } catch (e) {}
        if (it.s) { writeTimecode(pend, it.s, pend.duration); toast(tr('Таймкод збережено: ', 'Saved: ') + fmt(it.s)); ls(KEY_PENDING, null); return; }
        if (it.p === -2) { askExact(pend); return; }
        if (it.p > 0) { writeTimecode(pend, pend.duration * it.p / 100, pend.duration); toast(tr('Таймкод збережено', 'Saved')); }
        ls(KEY_PENDING, null);
      },
      onBack: function () { try { if (enabled && enabled.name) C.toggle(enabled.name); } catch (e) {} ls(KEY_PENDING, null); }
    });
  }

  function askExact(pend) {
    var v = window.prompt(tr('На якому місці зупинились? (наприклад 23:40 або 1:05:10)', 'Where did you stop? (e.g. 23:40 or 1:05:10)'), '');
    var n = v ? num(v) : null;
    if (n !== null && n >= 0) {
      if (pend.duration && n > pend.duration) n = pend.duration;
      writeTimecode(pend, n, pend.duration); toast(tr('Таймкод збережено: ', 'Saved: ') + fmt(n));
    }
    ls(KEY_PENDING, null);
  }


  // No position came back: put the line where the time spent in the player says it should be (like the built-in player's line),
  // instead of asking every time. Settings > Interface > SenPlayer lets the user switch it off and choose manually.
  function autoEstimate() {
    try {
      if (L().Storage.get('movily_sp_auto', 'true') === 'false') return false;
      var pend = ls(KEY_PENDING);
      if (!pend || !pend.hash) return false;
      var spent = (Date.now() - pend.at) / 1000;
      if (spent < 60) return false;                                  // the player was barely opened: ask instead of guessing
      var est = Math.max(0, spent + (pend.startedAt || 0));
      var dur = pend.duration || 0;
      if (dur && est > dur) est = dur;
      if (writeTimecode(pend, est, dur)) { ls(KEY_PENDING, null); toast(tr('Лінію переглянутого збережено: ', 'Progress saved: ') + fmt(est)); return true; }
    } catch (e) {}
    return false;
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
    // first the relay (the real position from SenPlayer); the manual choice only if nothing arrived
    pull(function (ok) {
      if (ok || !ls(KEY_PENDING)) return;
      if (autoEstimate()) return;
      setTimeout(askManual, 200);
    });
  }

  // ---------- settings ----------
  function settings() {
    try {
      var S = L().SettingsApi;
      if (!S || !S.addParam) return;
      S.addParam({
        component: 'interface',
        param: { name: 'movily_sp_auto', type: 'select', values: { 'true': tr('Так, автоматично', 'Yes, automatically'), 'false': tr('Ні, питати вручну', 'No, ask me') }, 'default': 'true' },
        field: { name: tr('SenPlayer: лінія перегляду', 'SenPlayer: progress line'), description: tr('Якщо плеєр не повернув позицію, ставити лінію за часом у плеєрі', 'If the player returns no position, set the line by time spent in the player') }
      });
      S.addParam({
        component: 'interface',
        param: { name: 'movily_sp_show', type: 'static' },
        field: { name: 'SenPlayer', description: tr('Що повернув SenPlayer (для діагностики)', 'What SenPlayer returned (diagnostics)') },
        onRender: function (item) {
          item.on('hover:enter click', function () {
            var log = ls(KEY_LOG) || [];
            var items = log.length ? log.map(function (r) {
              return { title: (r.kind || '?') + (r.wrote ? ' · ✓' : '') + ' · ' + String(r.at).slice(11, 19), subtitle: Object.keys(r.params || {}).map(function (k) { var v = String(r.params[k]); return k.slice(0, 40) + '=' + v.replace(/https?:\/\/[^"]{20,}/g, 'URL').slice(0, 120); }).join(' | ') };
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
    setTimeout(function () { if (!handleReturn()) pull(); }, 600);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', function () { setTimeout(function () { if (!returned) onVisible(); }, 300); });
  }

  if (window.Lampa && Lampa.Player && Lampa.Player.listener) start();
  else { var t = setInterval(function () { if (window.Lampa && Lampa.Player && Lampa.Player.listener) { clearInterval(t); start(); } }, 200); }
})();
