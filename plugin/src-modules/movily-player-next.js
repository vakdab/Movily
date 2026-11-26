/* Movily: «Наступна серія» (кадр + назва) і плейлист із кадрами в ВБУДОВАНОМУ плеєрі завжди, з будь-якого джерела.
   Причина: Lampa малює картку «Наступна серія» і картинки в плейлисті лише коли елемент плейлиста має thumbnail.
   Джерела (UAFresh, L-vid та ін.) віддають тільки {title, url}, тому на частині джерел картки не було.
   Тут перед тим, як плейлист потрапляє в плеєр, кожному елементу без кадру додаються: номер серії, кадр (still з TMDB,
   запасний варіант: backdrop картки) і справжня назва серії, якщо джерело дало лише «2 серия».
   TMDB вантажиться асинхронно, тому після відповіді «Наступна серія» і плейлист оновлюються на місці.
   Те, що джерело вже віддало (власний thumbnail, назва), не чіпається. */
(function () {
  'use strict';
  if (window.__movily_player_next) return;
  window.__movily_player_next = true;

  var cache = {};          // 'id:season' -> {state, eps, wait[]}
  var lastSet = null;      // останній плейлист, який ми обробили

  function L() { return window.Lampa; }
  function activeCard(data) {
    try {
      if (data && data.card && typeof data.card === 'object') return data.card;
      var a = L().Activity.active();
      return a && (a.card || a.movie);
    } catch (e) { return null; }
  }
  function tmdbId(card) {
    var id = card && card.id;
    if (card && ['cub', 'tmdb'].indexOf(card.source || 'tmdb') === -1) id = card.tmdb_id;
    return typeof id === 'number' ? id : null;
  }
  function isSerial(card) { return !!(card && (card.name || card.original_name || card.number_of_seasons)); }

  function isBare(txt) { return /^\s*(\d+\s*)?(сери[яи]|серія|episode|ep\.?|эпизод)\s*(\d+)?\s*$/i.test(txt || ''); }

  // номер серії з самого елемента: поле, інакше з назви («2 серия», «Серія 2», «Episode 2», «02. ...»), інакше позиція
  function episodeOf(it, index) {
    var n = it.episode !== undefined ? it.episode : (it.timeline && it.timeline.episode);
    if (n !== undefined && n !== null && /^\d+$/.test(String(n))) return parseInt(n, 10);
    var t = String(it.title || '').replace(/<[^>]*>/g, '');
    var m = /(\d+)\s*(?:сери|серія|серия|ep|episode|эпизод)|(?:сери[яі]|серія|episode|ep\.?|эпизод)\s*(\d+)|^\s*(\d+)[.\s)]/i.exec(t);
    if (m) return parseInt(m[1] || m[2] || m[3], 10);
    return index + 1;
  }
  function seasonOf(list, playdata) {
    var s;
    for (var i = 0; i < list.length; i++) {
      s = list[i].season !== undefined ? list[i].season : (list[i].timeline && list[i].timeline.season);
      if (s !== undefined && s !== null && /^\d+$/.test(String(s))) return parseInt(s, 10);
    }
    s = playdata && (playdata.season !== undefined ? playdata.season : (playdata.timeline && playdata.timeline.season));
    if (s !== undefined && s !== null && /^\d+$/.test(String(s))) return parseInt(s, 10);
    // фільтр на сторінці джерела: «Сезон: 2 сезон»
    try {
      var chips = document.querySelectorAll('.explorer__files-head .simple-button, .filter--filter, .torrent-filter .simple-button');
      for (var c = 0; c < chips.length; c++) {
        var m = /(?:сезон|season)\D{0,3}(\d+)|(\d+)\s*(?:сезон|season)/i.exec(chips[c].textContent || '');
        if (m) return parseInt(m[1] || m[2], 10);
      }
    } catch (e) {}
    return 1;
  }

  function load(id, season, done) {
    var key = id + ':' + season, c = cache[key];
    if (c && c.state === 'ok') return done(c.eps);
    if (c && c.state === 'fail') return done(null);
    if (c) { c.wait.push(done); return; }
    c = cache[key] = { state: 'loading', eps: {}, wait: [done] };
    function fin(ok) { c.state = ok ? 'ok' : 'fail'; var w = c.wait; c.wait = []; w.forEach(function (f) { f(ok ? c.eps : null); }); }
    try {
      L().Api.sources.tmdb.get('tv/' + id + '/season/' + season, {}, function (j) {
        // повний список серій сезону лежить в episodes_original (Lampa ріже сезони з довгими паузами)
        (j.episodes_original || j.episodes || []).forEach(function (e) { c.eps[e.episode_number] = e; });
        fin(Object.keys(c.eps).length > 0);
      }, function () { fin(false); });
    } catch (e) { fin(false); }
  }

  function img(path, size) {
    try { return L().TMDB.image('t/p/' + (size || 'w300') + path); } catch (e) { return null; }
  }
  // кадр цієї серії, інакше backdrop/постер картки: картка не лишається без картинки
  function pic(ep, card) {
    var p = (ep && ep.still_path) || (card && (card.backdrop_path || card.poster_path));
    return p ? img(p) : null;
  }

  // дописує елементу те, чого не вистачає. Повертає true, якщо щось змінилось
  function enrich(it, ep, card, n, season) {
    var changed = false;
    if (it.episode === undefined || it.episode === null) { it.episode = n; changed = true; }
    if ((it.season === undefined || it.season === null) && isSerial(card)) { it.season = season; changed = true; }
    if (!it.thumbnail || it.__mv_thumb) {
      var p = pic(ep, card);
      // реальний кадр серії замінює запасний backdrop, але не чужий thumbnail від джерела
      if (p && it.thumbnail !== p && (!it.thumbnail || (it.__mv_thumb !== 'real' && ep && ep.still_path))) {
        it.thumbnail = p;
        it.__mv_thumb = (ep && ep.still_path) ? 'real' : 'fallback';
        changed = true;
      }
    }
    if (ep && ep.name && isBare(String(it.title || '').replace(/<[^>]*>/g, '')) && !isBare(ep.name)) {
      it.title = ep.name;
      changed = true;
    }
    return changed;
  }

  // оновити вже намальовану «Наступну серію» і відкритий плейлист
  function redraw(list) {
    try {
      var P = L().PlayerPlaylist;
      if (!P || P.get() !== list) return;
      P.active();
      var pos = 0;
      for (var i = 0; i < list.length; i++) if (list[i].selected) { pos = i; break; }
      // повторне 'set' змушує Lampa перемалювати «Наступну серію» (вона слухає цю подію)
      P.listener.send('set', { playlist: list, position: pos });
    } catch (e) {}
  }

  function process(list) {
    if (!list || !list.length || !isSerial(activeCard())) return;
    var card = activeCard();
    var id = tmdbId(card);
    var play = null;
    try { play = L().Player.playdata(); } catch (e) {}
    var season = seasonOf(list, play);
    var nums = list.map(function (it, i) { return episodeOf(it, i); });

    // 1) одразу, без очікування TMDB: хоча б запасний кадр і номер, щоб картка з'явилась миттєво
    var any = false;
    list.forEach(function (it, i) { if (enrich(it, null, card, nums[i], season)) any = true; });

    // 2) коли прийде TMDB: справжні кадри і назви
    if (id) load(id, season, function (eps) {
      if (!eps) return;
      var ch = false;
      list.forEach(function (it, i) { if (enrich(it, eps[nums[i]], card, nums[i], season)) ch = true; });
      if (ch) redraw(list);
    });
    return any;
  }

  function hook() {
    var P = L().PlayerPlaylist;
    if (!P || P.__mv_wrapped) return false;
    P.__mv_wrapped = true;
    var orig = P.set;
    P.set = function (list) {
      try { lastSet = list; process(list); } catch (e) {}
      return orig.apply(this, arguments);
    };
    // PlayerPlaylist.init слухає Player 'start' і сам викликає внутрішній set (не через P.set), тому обробляємо й цей шлях
    try {
      L().Player.listener.follow('start', function (data) {
        setTimeout(function () {
          try {
            var list = P.get();
            if (list && list.length && list !== lastSet) { lastSet = list; process(list); redraw(list); }
          } catch (e) {}
        }, 0);
      });
    } catch (e) {}
    return true;
  }

  function boot() {
    if (!L() || !L().PlayerPlaylist || !L().Player || !L().Player.listener) return false;
    return hook();
  }
  if (!boot()) {
    var t = setInterval(function () { if (boot()) clearInterval(t); }, 300);
    setTimeout(function () { clearInterval(t); }, 30000);
  }
})();
