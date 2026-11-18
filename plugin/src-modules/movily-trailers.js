/* Movily: фоновий трейлер на сторінці фільму/серіалу.
   Джерело: The Trailer Database (trailerdb.org), SQL-API https://trailerdb.mhadifilms.workers.dev/query.
   База віддає YouTube-ID, тому відтворення йде через YouTube iframe (youtube-nocookie), без елементів керування.
   Вибір ролика: тільки повноцінні трейлери (trailer / teaser / red_band / imax / tv_spot), офіційні й доступні,
   мова: українська > оригінальна мова фільму > англійська > будь-яка; всередині мови: за переглядами.
   Каскад: база (SQL з фільтром і сортуванням) > TMDB напряму (включно з відео без мови) > відео з картки. Кандидатів кілька: недоступний ролик пропускається.
   Цикл: затримка > трейлер плавно проявляється (постер згасає) > кінець > постер повертається > пауза > знову.
   Формат (Налаштування > Інтерфейс > «Формат трейлера»): «На весь фон» (як було) або «Вікно 16:9» (лише портрет/телефон): блок 16:9 у потоці картки одразу ПІД текстовим лого/назвою, розкривається, коли відео реально грає; до того iframe прозорий (без плашок YouTube).
   Вмикається/вимикається в Налаштування > Інтерфейс. Автономний модуль на подіях Lampa (full / complite). */
(function () {
  'use strict';
  if (window.__movily_trailers) return;
  window.__movily_trailers = true;

  var K = { on: 'movily_trailer', sound: 'movily_trailer_sound', delay: 'movily_trailer_delay', fmt: 'movily_trailer_format' };
  var DEF = { movily_trailer: true, movily_trailer_sound: false, movily_trailer_delay: '1500', movily_trailer_format: 'bg' };
  var FADE = 600;
  var DB = 'https://trailerdb.mhadifilms.workers.dev/query';
  var MAX_SEC = 240;            // довші ролики (фічерети, добірки) не беремо

  var STR = {
    uk: { grp: 'Трейлери', on: 'Трейлер у картці фільму', on_d: 'На сторінці фільму трейлер сам запускається фоном. Джерело: The Trailer Database.',
          sound: 'Звук трейлера', sound_d: 'Вмикати звук одразу. Якщо браузер не дозволяє, трейлер стартує без звуку.',
          delay: 'Затримка трейлера', d1: '1 секунда', d15: '1,5 секунди', d3: '3 секунди', d5: '5 секунд',
          mute: 'Звук', unmute: 'Вимкнути звук',
          fmt: 'Формат трейлера', fmt_d: 'Як трейлер виглядає в картці: фоном на весь екран або окремим вікном 16:9 під шапкою, логотип поверх нього.', f_bg: 'На весь фон', f_win: 'Вікно 16:9' },
    ru: { grp: 'Трейлеры', on: 'Трейлер в карточке фильма', on_d: 'На странице фильма трейлер сам запускается фоном. Источник: The Trailer Database.',
          sound: 'Звук трейлера', sound_d: 'Включать звук сразу. Если браузер не разрешает, трейлер стартует без звука.',
          delay: 'Задержка трейлера', d1: '1 секунда', d15: '1,5 секунды', d3: '3 секунды', d5: '5 секунд',
          mute: 'Звук', unmute: 'Выключить звук',
          fmt: 'Формат трейлера', fmt_d: 'Как трейлер выглядит в карточке: фоном на весь экран или отдельным окном 16:9 под шапкой, логотип поверх него.', f_bg: 'На весь фон', f_win: 'Окно 16:9' },
    en: { grp: 'Trailers', on: 'Trailer in the movie card', on_d: 'On a movie page the trailer starts by itself in the background. Source: The Trailer Database.',
          sound: 'Trailer sound', sound_d: 'Start with sound. If the browser blocks it, the trailer starts muted.',
          delay: 'Trailer delay', d1: '1 second', d15: '1.5 seconds', d3: '3 seconds', d5: '5 seconds',
          mute: 'Sound', unmute: 'Mute',
          fmt: 'Trailer format', fmt_d: 'How the trailer looks in the card: full-screen background or a separate 16:9 window under the header with the logo over it.', f_bg: 'Full background', f_win: '16:9 window' }
  };
  function lang() { var l = 'uk'; try { l = String(Lampa.Storage.get('language', 'uk') || 'uk'); } catch (e) {} return STR[l] ? l : (l === 'be' ? 'ru' : 'en'); }
  function tr(k) { return (STR[lang()] || STR.en)[k] || STR.en[k] || k; }
  function log(m) { try { console.log('MovilyTrailer', m); } catch (e) {} }

  function opt(k) {
    var v; try { v = Lampa.Storage.get(k, DEF[k]); } catch (e) { v = DEF[k]; }
    if (v === 'true') return true; if (v === 'false') return false; return v;
  }

  function fmt() { return opt(K.fmt) === 'win' && window.innerHeight > window.innerWidth * 1.15 ? 'win' : 'bg'; }   /* вікно 16:9 лише на портретному екрані (телефон) */

  /* ---------- CSS ---------- */
  function css() {
    if (document.getElementById('movily-trailer-css')) return;
    var st = document.createElement('style');
    st.id = 'movily-trailer-css';
    st.textContent = [
      '.mvt-box{position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;overflow:hidden;pointer-events:none;opacity:0;background:#000;',
      'transition:opacity ' + FADE + 'ms ease-in-out;-webkit-mask-image:linear-gradient(to bottom,#000 55%,rgba(0,0,0,0) 100%);mask-image:linear-gradient(to bottom,#000 55%,rgba(0,0,0,0) 100%)}',
      '.mvt-box.loaded{opacity:1}',
      /* iframe більший за кадр і по центру: ховає чорні смуги 16:9 та елементи YouTube по краях */
      '.mvt-box iframe{position:absolute;left:0;top:0;width:100%;height:100%;min-width:0;min-height:0;',
      'transform:none;border:0;pointer-events:none}',
      /* поки відео не заграло: iframe прозорий, жодних плашок YouTube (назва, пауза, логотип) */
      '.mvt-box iframe{opacity:0;transition:opacity .35s}',
      '.mvt-box.loaded iframe{opacity:1}',
      /* фон і постер згасають, поки грає трейлер */
      '.mvt-on .full-start__background,.mvt-on .stv-own-bg{opacity:0!important;transition:opacity ' + FADE + 'ms ease-in-out}',
      '.mvt-on .full-start__poster,.mvt-on .full-start-new__poster{opacity:0;transition:opacity ' + FADE + 'ms ease-in-out}',
      /* кнопка звуку */
      '.mvt-sound{position:absolute;right:1.1em;top:5.2em;z-index:30;width:2.6em;height:2.6em;border-radius:50%;display:none;align-items:center;justify-content:center;',
      'background:rgba(30,30,34,.55);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#fff;cursor:pointer;opacity:0;transition:opacity .4s}',
      '.mvt-sound.show{display:flex;opacity:1}',
      '.mvt-sound svg{width:55%;height:55%}',
      '.mvt-sound .mvt-ic-off{display:none}',
      '.mvt-sound.muted .mvt-ic-on{display:none}',
      '.mvt-sound.muted .mvt-ic-off{display:block}',
      /* ФОРМАТ «ВІКНО 16:9» (телефон, портрет): відео на всю ширину під шапкою, ПЕРШИЙ формат.
         Текстове лого й назва лежать ПОВЕРХ нижньої частини відео. Блок абсолютний, під час скролу
         js зсуває його разом із контентом і плавно гасить (див. bindScroll). */
      '.mvt-win .mvt-box{left:0;top:calc(env(safe-area-inset-top,0px) + 4.6em);width:100%;height:auto;aspect-ratio:16/9;z-index:1;',
      '-webkit-mask-image:none;mask-image:none;background:#000;will-change:transform,opacity;border:0;outline:0;box-shadow:none}',
      '.mvt-win .mvt-box.mvt-scrolling{transition:none}',
      '.mvt-win .mvt-box iframe{width:100%;height:100%;min-width:0;min-height:0;transform:translate(-50%,-50%) scale(1)}',
      /* поки грає: постер-фон гасне в чорне */
      '.mvt-win.mvt-on .full-start__background,.mvt-win.mvt-on .stv-own-bg,.mvt-win.mvt-on .stv-scrim{opacity:0!important}',
      '.mvt-win.mvt-on{background:#000}',
      '.mvt-win .mvt-sound{top:calc(env(safe-area-inset-top,0px) + 4.6em + 56.25vw - 3.4em)}',
      /* Геометрія: відео стоїть absolute від top = шапка(4.6em) і має висоту 56.25vw. Тіло картки (flex-колонка)
         починається під відео мінус «запас накладання» (22vw): лого й назва лягають на нижню частину відео. */
      'body.stv .mvt-win .full-start-new__body{min-height:0!important;align-items:flex-start!important;position:relative!important;z-index:2!important;',
      'padding-top:calc(env(safe-area-inset-top,0px) + 4.6em + 56.25vw + 1em)!important}',
      'body.stv .mvt-win .full-start-new__title{position:relative!important;z-index:3!important;margin-top:0!important}',
      'body.stv .mvt-win .full-start-new__title .stv-logo{filter:drop-shadow(0 2px 14px rgba(0,0,0,.7))}',
      'body.stv .mvt-win .full-start-new__title{text-shadow:0 2px 16px rgba(0,0,0,.8)}',
      'body.stv .mvt-win .full-start-new__right{align-items:center!important;text-align:center}',
      'body.stv .mvt-win .stv-meta,body.stv .mvt-win .full-start-new__buttons,body.stv .mvt-win .full-start-new__reactions{justify-content:center!important;text-align:center}',
      'body.stv .mvt-win .stv-desc{text-align:center}',
      /* м'яке затемнення знизу відео, щоб лого й назва читалися поверх картинки */
      '.mvt-win .mvt-box:after{content:"";position:absolute;left:0;right:0;bottom:0;height:55%;pointer-events:none;',
      'background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.85))}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- джерело: The Trailer Database ---------- */
  var cache = {};

  function getJSON(url, ok, fail) {
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.timeout = 12000;
    x.onload = function () { try { ok(JSON.parse(x.responseText)); } catch (e) { fail(e); } };
    x.onerror = x.ontimeout = function () { fail(new Error('net')); };
    x.send();
  }
  function sqlStr(v) { return String(v).replace(/[^0-9]/g, ''); }

  /* пріоритет: мова, офіційність, тип ролика, перегляди. Повертає СПИСОК кандидатів (унікальні YouTube-ID):
     якщо перший ролик прибрано з YouTube або заборонено до вбудовування, плеєр бере наступний */
  var TYPE_RANK = { trailer: 0, teaser: 1, red_band: 2, imax: 3, tv_spot: 4 };
  var MAX_CAND = 6;
  function uniq(a) { var o = [], seen = {}; a.forEach(function (x) { if (x && !seen[x]) { seen[x] = 1; o.push(x); } }); return o; }

  function pickAll(rows, origLang) {
    var list = [];
    rows.forEach(function (r) {
      if (!r || !r.youtube_id || r.is_available === 0) return;
      if (!(r.trailer_type in TYPE_RANK)) return;                          // без кліпів, фічеретів, бекстейджів
      if (r.duration_seconds && r.duration_seconds > MAX_SEC) return;
      list.push(r);
    });
    function langRank(l) { l = (l || '').toLowerCase(); return l === 'uk' ? 0 : (origLang && l === origLang ? 1 : (l === 'en' ? 2 : 3)); }
    list.sort(function (a, b) {
      return (langRank(a.language) - langRank(b.language)) ||
             ((b.is_official || 0) - (a.is_official || 0)) ||
             (TYPE_RANK[a.trailer_type] - TYPE_RANK[b.trailer_type]) ||
             ((b.view_count || 0) - (a.view_count || 0));
    });
    return uniq(list.map(function (r) { return r.youtube_id; }));
  }

  /* відео TMDB (ті, що Lampa вже завантажила, або запит напряму): лише YouTube-трейлери/тізери */
  function pickTmdb(videos, origLang) {
    var list = ((videos && videos.results) || []).filter(function (v) {
      return v && v.key && String(v.site || '').toLowerCase() === 'youtube' && (v.type === 'Trailer' || v.type === 'Teaser');
    });
    function rank(v) { var l = String(v.iso_639_1 || '').toLowerCase(); return l === 'uk' ? 0 : (origLang && l === origLang ? 1 : (l === 'en' ? 2 : (l === '' ? 3 : 4))); }
    list.sort(function (a, b) {
      return (rank(a) - rank(b)) || ((b.official ? 1 : 0) - (a.official ? 1 : 0)) || ((a.type === 'Trailer' ? 0 : 1) - (b.type === 'Trailer' ? 0 : 1)) ||
             (new Date(b.published_at || 0) - new Date(a.published_at || 0));
    });
    return uniq(list.map(function (v) { return v.key; }));
  }

  /* TMDB напряму. Lampa просить відео лише українською й англійською, без «мовних» (null) і оригінальної мови,
     тому для багатьох фільмів і майже всіх серіалів у картці трейлерів немає, хоча вони є на TMDB */
  function tmdbVideos(movie, isTv, cb) {
    var tries = 0;
    function go(langs) {
      var url;
      try { url = Lampa.TMDB.api((isTv ? 'tv/' : 'movie/') + movie.id + '/videos?api_key=' + Lampa.TMDB.key() + '&include_video_language=' + langs); } catch (e) { return cb(null); }
      getJSON(url, function (j) { cb(j); }, function () { if (tries++ < 1) go(langs); else cb(null); });
    }
    var ol = movie.original_language && movie.original_language !== 'uk' && movie.original_language !== 'en' ? ',' + movie.original_language : '';
    go('uk,en' + ol + ',null');
  }

  /* База -> TMDB напряму -> відео з картки. Кожен наступний крок лише якщо попередній нічого не дав.
     SQL сам відфільтровує тип/доступність/тривалість і сортує: раніше «LIMIT 80» без сортування віддавав
     випадкові 80 записів із тисяч (кліпи, фічеретки), і справжній трейлер у вибірку не потрапляв. */
  function trailerKey(movie, videos, cb) {
    var isTv = !!(movie.name || movie.first_air_date || movie.number_of_seasons);
    var id = sqlStr(movie.id);
    if (!id) return cb(null);
    var key = (isTv ? 'tv/' : 'movie/') + id, c = cache[key];
    if (c && Date.now() - c.t < 30 * 60000) return cb(c.k);
    function done(list) { list = list && list.length ? list.slice(0, MAX_CAND) : null; cache[key] = { k: list, t: Date.now() }; cb(list); }

    function viaTmdb(prev) {
      tmdbVideos(movie, isTv, function (j) {
        var l = pickTmdb(j, movie.original_language);
        if (!l.length) l = pickTmdb(videos, movie.original_language);
        done(uniq((prev || []).concat(l)));
      });
    }

    var tbl = isTv ? 'series_trailers' : 'trailers', par = isTv ? 'series' : 'movies', fk = isTv ? 'series_id' : 'movie_id';
    var ol = String(movie.original_language || '').replace(/[^a-z]/gi, '').toLowerCase();
    var sql = 'SELECT t.youtube_id,t.trailer_type,t.language,t.view_count,t.duration_seconds,t.is_official,t.is_available FROM ' + tbl + ' t JOIN ' + par + ' s ON s.id=t.' + fk +
      ' WHERE s.tmdb_id=' + id + " AND t.trailer_type IN ('trailer','teaser','red_band','imax','tv_spot') AND t.is_available!=0 AND (t.duration_seconds IS NULL OR t.duration_seconds<=" + MAX_SEC + ')' +
      " ORDER BY CASE t.language WHEN 'uk' THEN 0 WHEN '" + ol + "' THEN 1 WHEN 'en' THEN 2 ELSE 3 END, t.is_official DESC, CASE t.trailer_type WHEN 'trailer' THEN 0 WHEN 'teaser' THEN 1 ELSE 2 END, t.view_count DESC LIMIT 12";
    getJSON(DB + '?sql=' + encodeURIComponent(sql), function (j) {
      var l = (j && j.success && j.rows) ? pickAll(j.rows, movie.original_language) : [];
      if (l.length >= 2) return done(l);          // у базі достатньо: запасне джерело не потрібне
      viaTmdb(l);                                 // мало або нічого: додаємо TMDB (бази-кандидати лишаються першими)
    }, function () { viaTmdb([]); });
  }

  /* ---------- плеєр (YouTube iframe, без елементів керування) ---------- */
  var cur = null, seq = 0;
  var PAUSE_BETWEEN = 4000;   // скільки показуємо постер між повторами
  var YT_STATE = { ENDED: 0, PLAYING: 1 };

  function stop(now) {
    if (!cur) return;
    var c = cur; cur = null;
    clearTimeout(c.timer); clearTimeout(c.loop);
    try { window.removeEventListener('message', c.onMsg); } catch (e) {}
    try {
      if (c.box && c.box.parentNode) {
        var rm = function () {
          try { c.frame.src = 'about:blank'; } catch (e) {}
          if (c.box.parentNode) c.box.parentNode.removeChild(c.box);
        };
        if (now) rm(); else { c.box.classList.remove('loaded'); setTimeout(rm, FADE); }
      }
    } catch (e) {}
    try { if (c.unScroll) c.unScroll(); } catch (e) {}
    try { if (c.btn && c.btn.parentNode) c.btn.parentNode.removeChild(c.btn); } catch (e) {}
    try { c.render.removeClass('mvt-on'); c.render.removeClass('mvt-win'); } catch (e) {}
  }

  function cmd(c, func, args) {
    try { c.frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*'); } catch (e) {}
  }

  /* ---------- скрол: трейлер їде вгору разом із контентом і плавно гасне ---------- */
  function scrollY(render) {
    var y = 0, list = render.find('.scroll'), i, el, body, m;
    for (i = 0; i < list.length; i++) {
      el = list[i];
      if (el.scrollTop > y) y = el.scrollTop;
      body = el.querySelector('.scroll__body');
      if (body) {
        m = /translate3d?\(\s*[-\d.]+(?:px)?\s*,\s*(-?[\d.]+)px/.exec(body.style.transform || '');
        if (m && -parseFloat(m[1]) > y) y = -parseFloat(m[1]);
      }
    }
    return y;
  }
  function bindScroll(c) {
    var raf = 0, hidden = false;
    function apply() {
      raf = 0;
      if (cur !== c || !c.box.parentNode) return;
      var y = scrollY(c.render);
      var h = c.box.offsetHeight || 1;
      var k = Math.max(0, Math.min(1, y / (h * 0.65)));            // 0 = на місці, 1 = зникло
      c.box.classList.toggle('mvt-scrolling', y > 0);
      c.box.style.transform = y ? 'translate3d(0,' + (-y) + 'px,0)' : '';
      c.box.style.opacity = y ? String(c.box.classList.contains('loaded') ? (1 - k) : 0) : '';
      if (c.btn) c.btn.style.opacity = y ? String(Math.max(0, 1 - k * 2)) : '';
      var gone = k >= 1;
      if (gone && !hidden) { hidden = true; cmd(c, 'pauseVideo'); }
      else if (!gone && hidden) { hidden = false; if (c.started) cmd(c, 'playVideo'); }
    }
    c.onScroll = function () { if (!raf) raf = requestAnimationFrame(apply); };
    document.addEventListener('scroll', c.onScroll, true);
    document.addEventListener('touchmove', c.onScroll, true);
    document.addEventListener('wheel', c.onScroll, true);
    c.unScroll = function () {
      document.removeEventListener('scroll', c.onScroll, true);
      document.removeEventListener('touchmove', c.onScroll, true);
      document.removeEventListener('wheel', c.onScroll, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }

  function play(render, ids, holder, bgEl) {
    ids = (ids instanceof Array) ? ids.slice() : [ids];
    var ytId = ids.shift();
    stop(true);
    var box = document.createElement('div');
    box.className = 'mvt-box';
    var frame = document.createElement('iframe');
    frame.setAttribute('allow', 'autoplay; encrypted-media');
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.setAttribute('tabindex', '-1');
    frame.setAttribute('aria-hidden', 'true');
    box.appendChild(frame);
    holder.insertBefore(box, bgEl ? bgEl.nextSibling : holder.firstChild);

    var c = cur = { box: box, frame: frame, render: render, muted: opt(K.sound) !== true, started: false, btn: null, timer: 0, loop: 0, onMsg: null };

    bindScroll(c);
    var btn = document.createElement('div');
    btn.className = 'mvt-sound muted';
    btn.innerHTML = '<svg class="mvt-ic-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>' +
      '<svg class="mvt-ic-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg>';
    btn.title = tr('mute');
    var onTap = function (ev) {
      if (ev) { ev.preventDefault && ev.preventDefault(); ev.stopPropagation && ev.stopPropagation(); }
      if (cur !== c) return;
      c.muted = !c.muted;
      if (c.muted) cmd(c, 'mute'); else { cmd(c, 'unMute'); cmd(c, 'setVolume', [60]); }
      btn.classList.toggle('muted', c.muted);
    };
    btn.addEventListener('click', onTap);
    btn.addEventListener('touchend', onTap);
    c.btn = btn;

    function showTrailer() {
      if (cur !== c) return;
      c.started = true;
      clearTimeout(c.timer);
      box.classList.add('loaded');
      if (fmt() === 'win') render.addClass('mvt-win'); else render.removeClass('mvt-win');
      render.addClass('mvt-on');
      render.find('.button--movily-sound').removeClass('mvt-row-sound-pending');
      if (!c.muted) { cmd(c, 'unMute'); cmd(c, 'setVolume', [60]); btn.classList.remove('muted'); }
    }
    function hideTrailer() {            // постер повертається
      box.classList.remove('loaded');
      render.removeClass('mvt-on');
      render.removeClass('mvt-win');
      render.find('.button--movily-sound').addClass('mvt-row-sound-pending');
    }
    function replay() {                 // пауза з постером, потім трейлер знову
      if (cur !== c) return;
      hideTrailer();
      c.loop = setTimeout(function () {
        if (cur !== c || !opt(K.on)) return;
        cmd(c, 'seekTo', [0, true]);
        cmd(c, 'playVideo');
      }, PAUSE_BETWEEN);
    }

    /* ролик недоступний (прибраний, заборонено вбудовування, віковий): пробуємо наступний кандидат */
    function next() {
      if (cur !== c) return;
      if (!ids.length) { stop(); return; }
      var rest = ids.slice();
      log('наступний кандидат, лишилось ' + rest.length);
      play(render, rest, holder, bgEl);
    }

    /* події плеєра приходять через postMessage (enablejsapi=1 + listening) */
    c.onMsg = function (ev) {
      if (cur !== c || ev.source !== frame.contentWindow) return;
      var d = ev.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { return; } }
      if (!d) return;
      if (d.event === 'onReady' || d.event === 'initialDelivery') { cmd(c, 'playVideo'); }
      if (d.event === 'onStateChange') {
        if (d.info === YT_STATE.PLAYING) showTrailer();
        else if (d.info === YT_STATE.ENDED) replay();
      } else if (d.event === 'infoDelivery' && d.info && typeof d.info.playerState === 'number') {
        if (d.info.playerState === YT_STATE.PLAYING) showTrailer();
        else if (d.info.playerState === YT_STATE.ENDED) replay();
      } else if (d.event === 'onError') {
        log('помилка плеєра ' + d.info);
        if (!c.started) next();
      }
    };
    window.addEventListener('message', c.onMsg);
    frame.addEventListener('load', function () {
      if (cur !== c) return;
      try { frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (e) {}
      cmd(c, 'addEventListener', ['onStateChange']);
    });
    c.timer = setTimeout(function () { if (cur === c && !c.started) { log('не стартував'); next(); } }, 12000);

    frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(ytId) +
      '?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&rel=0&modestbranding=1&showinfo=0&autohide=1&playsinline=1&enablejsapi=1' +
      '&origin=' + encodeURIComponent(location.origin);
  }

  /* ---------- картка фільму ---------- */
  function onFull(e) {
    /* нова картка: попередній трейлер завжди зупиняємо (навіть коли функцію вимкнено) */
    if (e.type === 'start' || e.type === 'complite') { seq++; stop(true); }
    if (e.type !== 'complite' || !opt(K.on)) return;
    var movie = (e.data && e.data.movie) || (e.object && e.object.card) || null;
    if (!movie || !movie.id || movie.adult) return;
    var render = e.object.activity.render();
    var token = ++seq;
    var delay = parseInt(opt(K.delay), 10) || 1500;
    var t0 = Date.now();

    /* запит до бази йде паралельно із затримкою; показуємо не раніше затримки */
    trailerKey(movie, (e.data && e.data.videos) || null, function (ytId) {   /* ytId: список кандидатів */
      var wait = Math.max(0, delay - (Date.now() - t0));
      setTimeout(function () {
        if (token !== seq || !opt(K.on)) return;
        if (!ytId || !ytId.length) { log('трейлера немає'); return; }
        var active = null; try { active = Lampa.Activity.active(); } catch (x) {}
        if (active && active.activity && active.activity.render()[0] !== render[0]) return;   /* уже пішли з картки */
        if (!document.body.contains(render[0])) return;
        var bg = render.find('.full-start__background').first();
        var holder = bg.length ? bg[0].parentNode : (render.find('.full-start-new').first().closest('.scroll').parent()[0] || render[0]);
        if (!holder) return;
        if (window.getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
        play(render, ytId, holder, bg.length ? bg[0] : null);
      }, wait);
    });
  }

  window.__movily_toggle_trailer_sound = function () {
    if (!cur || !cur.btn || !cur.started) return false;
    cur.btn.click();
    return true;
  };
  function pause() { if (cur) cmd(cur, 'pauseVideo'); }
  function resume() { if (cur && cur.started) cmd(cur, 'playVideo'); }

  /* ---------- налаштування (Інтерфейс) ---------- */
  function settings() {
    var api = Lampa.SettingsApi;
    if (!api || window.__movily_trailers_set) return;
    window.__movily_trailers_set = true;
    api.addParam({ component: 'interface', param: { name: 'movily_trailers_title', type: 'title' }, field: { name: tr('grp') } });
    api.addParam({ component: 'interface', param: { name: K.on, type: 'trigger', 'default': DEF[K.on] },
      field: { name: tr('on'), description: tr('on_d') },
      onChange: function (v) { if (v === false || v === 'false') { seq++; stop(); } } });
    api.addParam({ component: 'interface', param: { name: K.fmt, type: 'select', values: { bg: tr('f_bg'), win: tr('f_win') }, 'default': DEF[K.fmt] },
      field: { name: tr('fmt'), description: tr('fmt_d') },
      onChange: function () { try { var a = Lampa.Activity.active(); if (a && a.activity) { seq++; stop(true); } } catch (e) {} } });
    api.addParam({ component: 'interface', param: { name: K.sound, type: 'trigger', 'default': DEF[K.sound] },
      field: { name: tr('sound'), description: tr('sound_d') } });
    api.addParam({ component: 'interface', param: { name: K.delay, type: 'select', values: { '1000': tr('d1'), '1500': tr('d15'), '3000': tr('d3'), '5000': tr('d5') }, 'default': DEF[K.delay] },
      field: { name: tr('delay') } });
  }

  function start() {
    css();
    settings();
    Lampa.Listener.follow('full', function (e) { try { onFull(e); } catch (x) { log(x && x.message); } });
    /* будь-яка зміна активного екрана, окрім самої картки фільму, зупиняє трейлер */
    function guardActive() {
      try {
        if (!cur) return;
        var a = Lampa.Activity.active();
        var el = a && a.activity && a.activity.render && a.activity.render()[0];
        if (!el || el !== cur.render[0]) { seq++; stop(); }
      } catch (x) {}
    }
    Lampa.Listener.follow('activity', function (e) { try { if (e.type === 'start' || e.type === 'archive' || e.type === 'destroy') setTimeout(guardActive, 50); } catch (x) {} });
    setInterval(guardActive, 1500);
    try { Lampa.Player.listener.follow('start', function () { seq++; stop(); }); } catch (x) {}
    document.addEventListener('visibilitychange', function () { document.hidden ? pause() : resume(); });
  }

  if (window.Lampa && Lampa.Listener && Lampa.SettingsApi) start();
  else {
    var t = setInterval(function () { if (window.Lampa && Lampa.Listener && Lampa.SettingsApi) { clearInterval(t); start(); } }, 200);
  }
})();
