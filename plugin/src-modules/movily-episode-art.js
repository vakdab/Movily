/* Movily: кадри та назви серій для джерел, де Lampa не підібрала серію з TMDB (у списку видно лише «2 серия» і порожню картинку).
   Причина: онлайн-плагін шукає серію в TMDB за номером, який віддає джерело; якщо номера немає або він не збігається,
   картка лишається без кадру. Тут номер береться з самої картки («02» на мініатюрі, «2 серия», «Серія 2», «Episode 2»),
   сезон з фільтра, а кадр, назва, оцінка і тривалість з TMDB для цього сезону. Нічого, що Lampa вже намалювала, не чіпається. */
(function () {
  'use strict';
  if (window.__movily_episode_art) return;
  window.__movily_episode_art = true;

  var cache = {};      // 'id:season' -> {state:'loading'|'ok'|'fail', eps:{n:episode}, wait:[]}

  function L() { return window.Lampa; }
  function activeCard() {
    try { var a = L().Activity.active(); return a && (a.card || a.movie); } catch (e) { return null; }
  }
  function tmdbId(card) {
    var id = card && card.id;
    if (card && ['cub', 'tmdb'].indexOf(card.source || 'tmdb') === -1) id = card.tmdb_id;
    return typeof id === 'number' ? id : null;
  }

  // the season shown: Filter chip «Сезон: 1 сезон», else the card of the first row, else 1
  function seasonOf(root) {
    try {
      var chips = root.querySelectorAll('.explorer__files-head .simple-button, .filter--filter, .torrent-filter .simple-button');
      for (var i = 0; i < chips.length; i++) {
        var m = /(?:сезон|season)\D{0,3}(\d+)|(\d+)\s*(?:сезон|season)/i.exec(chips[i].textContent || '');
        if (m) return parseInt(m[1] || m[2], 10);
      }
      var w = root.querySelector('.online-prestige-watched__body');
      var m2 = w && /(?:сезон|season)\s*(\d+)/i.exec(w.textContent);
      if (m2) return parseInt(m2[1], 10);
    } catch (e) {}
    return 1;
  }

  function episodeNumber(row, index) {
    var b = row.querySelector('.online-prestige__episode-number');
    var t = b && b.textContent.trim();
    if (t && /^\d+$/.test(t)) return parseInt(t, 10);
    var title = (row.querySelector('.online-prestige__title') || {}).textContent || '';
    var m = /(\d+)\s*(?:сери|серія|серия|ep|episode|эпизод)|(?:сери[яі]|серія|episode|ep\.?|эпизод)\s*(\d+)|^\s*(\d+)[.\s]/i.exec(title);
    if (m) return parseInt(m[1] || m[2] || m[3], 10);
    return index + 1;
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
        // Lampa splits a season with long release gaps (OVA) into fake seasons and keeps only the first part in «episodes»;
        // the full list is in «episodes_original»
        (j.episodes_original || j.episodes || []).forEach(function (e) { c.eps[e.episode_number] = e; });
        fin(Object.keys(c.eps).length > 0);
      }, function () { fin(false); });
    } catch (e) { fin(false); }
  }


  // «Геллсінґ II», «Геллсінґ  І», «Part IV» -> «Геллсінґ 2», «Геллсінґ 1», «Part 4»: a Roman numeral at the END of the title becomes a normal number.
  // The Cyrillic І / Х / С / М / Д look like Latin I / X / C / M / D, so they are treated the same.
  function romanToInt(r) {
    var v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }, t = 0, p = 0;
    for (var i = r.length - 1; i >= 0; i--) { var c = v[r[i]]; if (!c) return 0; t += c < p ? -c : c; p = c; }
    return t;
  }
  function fixRoman(txt) {
    if (!txt) return txt;
    var s = txt.replace(/[\u0406\u0456]/g, 'I').replace(/\u0425/g, 'X').replace(/\u0421/g, 'C').replace(/\u041C/g, 'M').replace(/\u0414/g, 'D').replace(/\u0412/g, 'V');
    var m = /^(.*?[\s\u00a0.:-]+)([IVXLC]+)\s*$/.exec(s.replace(/\s+/g, ' ').trim());
    if (!m) return txt;
    var n = romanToInt(m[2]);
    if (!n || n > 199) return txt;
    // only a real numeral: canonical form (so a word such as «МІХ» is not touched)
    var back = (function (x) { var map = [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']], o = ''; map.forEach(function (a) { while (x >= a[0]) { o += a[1]; x -= a[0]; } }); return o; })(n);
    if (back !== m[2]) return txt;
    return txt.replace(/\s+/g, ' ').trim().replace(/[\s\u00a0.:-]+\S+$/, function (tail) { return tail.replace(/\S+$/, '') + n; });
  }

  function fixTitles() {
    try {
      var ts = document.querySelectorAll('.online-prestige__title');
      for (var i = 0; i < ts.length; i++) {
        var old = ts[i].textContent, nw = fixRoman(old);
        if (nw !== old && nw) ts[i].textContent = nw;
      }
    } catch (e) {}
  }

  function isBare(txt) { return /^\s*(\d+\s*)?(сери[яи]|серія|episode|ep\.?|эпизод)\s*(\d+)?\s*$/i.test(txt || ''); }

  // the best picture we can find: this episode's still, else the card's backdrop (never an empty card)
  function pickPath(ep, card) {
    if (ep && ep.still_path) return ep.still_path;
    return (card && (card.backdrop_path || card.poster_path)) || null;
  }

  function fill(row, ep, card) {
    if (row.getAttribute('data-mv-art') === '1') return;
    row.setAttribute('data-mv-art', '1');
    try {
      // picture: only when Lampa left it empty
      var imgBox = row.querySelector('.online-prestige__img');
      var img = imgBox && imgBox.querySelector('img');
      var hasPic = imgBox && imgBox.classList.contains('online-prestige__img--loaded');
      var path = pickPath(ep, card);
      var cur = (img && img.getAttribute('src')) || '';
      var isCardArt = !!card && !!cur && ((card.backdrop_path && cur.indexOf(card.backdrop_path) >= 0) || (card.poster_path && cur.indexOf(card.poster_path) >= 0));
      var real = !!(ep && ep.still_path);
      // set the picture when it is empty / broken, or when it is only the card's own art and this episode has a real still
      var need = img && path && (!hasPic || /img_broken/.test(cur) || !cur || (real && isCardArt));
      if (need && cur.indexOf(path) < 0) {
        var loader = imgBox.querySelector('.online-prestige__loader');
        img.onerror = function () { img.src = './img/img_broken.svg'; };
        img.onload = function () {
          imgBox.classList.add('online-prestige__img--loaded');
          if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
        };
        img.src = L().TMDB.image('t/p/w300' + path);
      }
      if (!ep) return;
      // title only when the source gave a bare «Episode N» / «N серия» and TMDB has a real name
      var tt = row.querySelector('.online-prestige__title');
      if (tt && ep.name && isBare(tt.textContent) && !isBare(ep.name)) tt.textContent = ep.name;
      // time
      var tm = row.querySelector('.online-prestige__time');
      if (tm && ep.runtime && !/[1-9]/.test(tm.textContent)) {
        var hh = Math.floor(ep.runtime / 60), mm = ep.runtime % 60;
        tm.textContent = (hh ? ('0' + hh).slice(-2) + ':' : '') + ('0' + mm).slice(-2) + (hh ? '' : ':00');
      }
      // rating
      var info = row.querySelector('.online-prestige__info');
      if (info && ep.vote_average && !info.querySelector('.online-prestige-rate')) {
        var sp = document.createElement('span');
        sp.innerHTML = L().Template.get('lampac_prestige_rate', { rate: parseFloat(ep.vote_average + '').toFixed(1) }, true);
        info.insertBefore(sp, info.firstChild);
        var dot = document.createElement('span');
        dot.className = 'online-prestige-split';
        dot.textContent = '●';
        info.insertBefore(dot, sp.nextSibling);
      }
    } catch (e) {}
  }

  function scan() {
    fixTitles();
    try {
      var card = activeCard(), id = tmdbId(card);
      if (!id || !card.name && !card.original_name) return;
      var roots = document.querySelectorAll('.explorer');
      for (var r = 0; r < roots.length; r++) {
        var rows = roots[r].querySelectorAll('.online-prestige:not([data-mv-art])');
        if (!rows.length) continue;
        var season = seasonOf(roots[r]);
        (function (rowsList, season) {
          load(id, season, function (eps) {
            for (var i = 0; i < rowsList.length; i++) {
              var row = rowsList[i];
              var n = episodeNumber(row, i);
              fill(row, eps ? eps[n] : null, card);
            }
            fixTitles();
          });
        })(Array.prototype.slice.call(rows), season);
      }
    } catch (e) {}
  }

  function start() {
    var t = 0;
    function later() { if (t) return; t = setTimeout(function () { t = 0; scan(); }, 250); }
    if (window.MutationObserver) new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
    else setInterval(scan, 1000);
    // the season can change without a new row set arriving at once: rows drawn for another season get checked again
    document.addEventListener('click', function () { setTimeout(function () {
      var done = [];
      for (var i = 0; i < done.length; i++) done[i].removeAttribute('data-mv-art');
    }, 600); }, true);
    scan();
  }

  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
