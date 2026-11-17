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
    try { var a = L().Activity.active(); return a && (a.movie || a.card); } catch (e) { return null; }
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
        (j.episodes || []).forEach(function (e) { c.eps[e.episode_number] = e; });
        fin(Object.keys(c.eps).length > 0);
      }, function () { fin(false); });
    } catch (e) { fin(false); }
  }

  function fill(row, ep) {
    if (row.getAttribute('data-mv-art')) return;
    row.setAttribute('data-mv-art', '1');
    try {
      // picture
      var imgBox = row.querySelector('.online-prestige__img');
      var img = imgBox && imgBox.querySelector('img');
      var hasPic = imgBox && imgBox.classList.contains('online-prestige__img--loaded');
      if (img && ep.still_path && !hasPic) {
        var loader = imgBox.querySelector('.online-prestige__loader');
        img.onerror = function () { img.src = './img/img_broken.svg'; };
        img.onload = function () {
          imgBox.classList.add('online-prestige__img--loaded');
          if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
        };
        img.src = L().TMDB.image('t/p/w300' + ep.still_path);
      }
      // title only when the source gave a bare «N серия»
      var tt = row.querySelector('.online-prestige__title');
      if (tt && ep.name && /^\s*(\d+\s*)?(сери[яи]|серія|episode|ep\.?|эпизод)\s*(\d+)?\s*$/i.test(tt.textContent)) tt.textContent = ep.name;
      // time
      var tm = row.querySelector('.online-prestige__time');
      if (tm && ep.runtime && !/[1-9]/.test(tm.textContent)) {
        var hh = Math.floor(ep.runtime / 60), mm = ep.runtime % 60;
        tm.textContent = (hh ? ('0' + hh).slice(-2) + ':' : '') + ('0' + mm).slice(-2) + (hh ? '' : ':00');
      }
      // rating
      var info = row.querySelector('.online-prestige__info');
      if (info && ep.vote_average && !info.querySelector('.online-prestige-rate')) {
        var tpl = L().Template.get('lampac_prestige_rate', { rate: parseFloat(ep.vote_average + '').toFixed(1) }, true);
        var sp = document.createElement('span');
        sp.innerHTML = tpl;
        info.insertBefore(sp, info.firstChild);
        var dot = document.createElement('span');
        dot.className = 'online-prestige-split';
        dot.textContent = '●';
        info.insertBefore(dot, sp.nextSibling);
      }
    } catch (e) {}
  }

  function scan() {
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
            if (!eps) { for (var q = 0; q < rowsList.length; q++) rowsList[q].setAttribute('data-mv-art', '0'); return; }
            for (var i = 0; i < rowsList.length; i++) {
              var row = rowsList[i];
              var n = episodeNumber(row, i);
              if (eps[n]) fill(row, eps[n]); else row.setAttribute('data-mv-art', '0');
            }
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
      var done = document.querySelectorAll('.online-prestige[data-mv-art="0"]');
      for (var i = 0; i < done.length; i++) done[i].removeAttribute('data-mv-art');
    }, 600); }, true);
    scan();
  }

  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
