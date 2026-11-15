/* Movily: фоновий трейлер на сторінці фільму/серіалу (як у Prisma).
   Джерело те саме, що в Prisma: luno.watch/api/tmdb/{movie|tv}/{id}/trailer (гостьова сесія /api/client/session),
   відповідь: прямий mp4. Відтворення в <video> без Referer (CDN блокує чужі сайти за Referer).
   Цикл: затримка > трейлер плавно проявляється (постер згасає) > кінець > постер повертається > пауза > знову.
   Вмикається/вимикається в Налаштування > Інтерфейс. Автономний модуль на подіях Lampa (full / complite). */
(function () {
  'use strict';
  if (window.__movily_trailers) return;
  window.__movily_trailers = true;

  var K = { on: 'movily_trailer', sound: 'movily_trailer_sound', delay: 'movily_trailer_delay' };
  var DEF = { movily_trailer: true, movily_trailer_sound: false, movily_trailer_delay: '1500' };
  var FADE = 600;

  var STR = {
    uk: { grp: 'Трейлери', on: 'Трейлер у картці фільму', on_d: 'На сторінці фільму трейлер сам запускається фоном. Витрачає інтернет.',
          sound: 'Звук трейлера', sound_d: 'Вмикати звук одразу. Якщо браузер не дозволяє, трейлер стартує без звуку.',
          delay: 'Затримка трейлера', d1: '1 секунда', d15: '1,5 секунди', d3: '3 секунди', d5: '5 секунд',
          mute: 'Звук', unmute: 'Вимкнути звук' },
    ru: { grp: 'Трейлеры', on: 'Трейлер в карточке фильма', on_d: 'На странице фильма трейлер сам запускается фоном. Тратит интернет.',
          sound: 'Звук трейлера', sound_d: 'Включать звук сразу. Если браузер не разрешает, трейлер стартует без звука.',
          delay: 'Задержка трейлера', d1: '1 секунда', d15: '1,5 секунды', d3: '3 секунды', d5: '5 секунд',
          mute: 'Звук', unmute: 'Выключить звук' },
    en: { grp: 'Trailers', on: 'Trailer in the movie card', on_d: 'On a movie page the trailer starts by itself in the background. Uses data.',
          sound: 'Trailer sound', sound_d: 'Start with sound. If the browser blocks it, the trailer starts muted.',
          delay: 'Trailer delay', d1: '1 second', d15: '1.5 seconds', d3: '3 seconds', d5: '5 seconds',
          mute: 'Sound', unmute: 'Mute' }
  };
  function lang() { var l = 'uk'; try { l = String(Lampa.Storage.get('language', 'uk') || 'uk'); } catch (e) {} return STR[l] ? l : (l === 'be' ? 'ru' : 'en'); }
  function tr(k) { return (STR[lang()] || STR.en)[k] || STR.en[k] || k; }
  function log(m) { try { console.log('MovilyTrailer', m); } catch (e) {} }

  function opt(k) {
    var v; try { v = Lampa.Storage.get(k, DEF[k]); } catch (e) { v = DEF[k]; }
    if (v === 'true') return true; if (v === 'false') return false; return v;
  }

  /* ---------- CSS ---------- */
  function css() {
    if (document.getElementById('movily-trailer-css')) return;
    var st = document.createElement('style');
    st.id = 'movily-trailer-css';
    st.textContent = [
      '.mvt-box{position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;overflow:hidden;pointer-events:none;opacity:0;background:#000;',
      'transition:opacity ' + FADE + 'ms ease-in-out;-webkit-mask-image:linear-gradient(to bottom,#000 55%,rgba(0,0,0,0) 100%);mask-image:linear-gradient(to bottom,#000 55%,rgba(0,0,0,0) 100%)}',
      '.mvt-box.loaded{opacity:1}',
      '.mvt-box video{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;border:0;pointer-events:none}',
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
      '.mvt-sound.muted .mvt-ic-off{display:block}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- джерело: бекенд Prisma (luno.watch) ---------- */
  var API = 'https://luno.watch/api/';
  var sess = null, sessWait = null, urlCache = {};

  function getJSON(url, headers, ok, fail) {
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.timeout = 12000;
    for (var h in headers) x.setRequestHeader(h, headers[h]);
    x.onload = function () { try { ok(JSON.parse(x.responseText), x.status); } catch (e) { fail(e); } };
    x.onerror = x.ontimeout = function () { fail(new Error('net')); };
    x.send();
  }
  function session(cb) {
    if (sess && sess.exp > Date.now() + 60000) return cb(sess.token);
    if (sessWait) return sessWait.push(cb);
    sessWait = [cb];
    function done() { var q = sessWait; sessWait = null; q.forEach(function (f) { f(sess ? sess.token : null); }); }
    getJSON(API + 'client/session', {}, function (j) {
      if (j && j.guest_token) sess = { token: j.guest_token, exp: Date.now() + (parseInt(j.ttl, 10) || 3600) * 1000 };
      done();
    }, done);
  }
  function trailerUrl(movie, cb) {
    var type = (movie.name || movie.first_air_date || movie.number_of_seasons) ? 'tv' : 'movie';
    var key = type + '/' + movie.id, c = urlCache[key];
    if (c && Date.now() - c.t < 10 * 60000) return cb(c.url);
    session(function (tok) {
      if (!tok) return cb(null);
      getJSON(API + 'tmdb/' + key + '/trailer', { 'x-client-session': tok }, function (j) {
        if (j && j.success && j.url && !j.hls) { urlCache[key] = { url: j.url, t: Date.now() }; cb(j.url); }
        else cb(null);
      }, function () { cb(null); });
    });
  }

  /* ---------- плеєр (<video>, без елементів керування) ---------- */
  var cur = null, seq = 0;
  var PAUSE_BETWEEN = 4000;   // скільки показуємо постер між повторами

  function stop(now) {
    if (!cur) return;
    var c = cur; cur = null;
    clearTimeout(c.timer); clearTimeout(c.loop);
    try {
      if (c.box && c.box.parentNode) {
        var rm = function () {
          try { c.video.pause(); c.video.removeAttribute('src'); c.video.load(); } catch (e) {}
          if (c.box.parentNode) c.box.parentNode.removeChild(c.box);
        };
        if (now) rm(); else { c.box.classList.remove('loaded'); setTimeout(rm, FADE); }
      }
    } catch (e) {}
    try { if (c.btn && c.btn.parentNode) c.btn.parentNode.removeChild(c.btn); } catch (e) {}
    try { c.render.removeClass('mvt-on'); } catch (e) {}
  }

  function play(render, url, holder, bgEl) {
    stop(true);
    var box = document.createElement('div');
    box.className = 'mvt-box';
    var video = document.createElement('video');
    video.muted = true; video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', '');
    video.setAttribute('referrerpolicy', 'no-referrer');
    video.setAttribute('disablepictureinpicture', '');
    video.preload = 'auto';
    video.controls = false;
    box.appendChild(video);
    holder.insertBefore(box, bgEl ? bgEl.nextSibling : holder.firstChild);

    var c = cur = { box: box, video: video, render: render, muted: opt(K.sound) !== true, started: false, btn: null, timer: 0, loop: 0 };

    var btn = document.createElement('div');
    btn.className = 'mvt-sound muted';
    btn.innerHTML = '<svg class="mvt-ic-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>' +
      '<svg class="mvt-ic-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg>';
    btn.title = tr('mute');
    var onTap = function (ev) {
      if (ev) { ev.preventDefault && ev.preventDefault(); ev.stopPropagation && ev.stopPropagation(); }
      if (cur !== c) return;
      c.muted = !c.muted;
      video.muted = c.muted;
      if (!c.muted) { try { video.volume = 0.6; } catch (e) {} }
      btn.classList.toggle('muted', c.muted);
    };
    btn.addEventListener('click', onTap);
    btn.addEventListener('touchend', onTap);
    var anchor = render[0];
    if (window.getComputedStyle(anchor).position === 'static') anchor.style.position = 'relative';
    anchor.appendChild(btn);
    c.btn = btn;

    function showTrailer() {
      if (cur !== c) return;
      c.started = true;
      clearTimeout(c.timer);
      box.classList.add('loaded');
      render.addClass('mvt-on');
      btn.classList.add('show');
      if (!c.muted) { video.muted = false; try { video.volume = 0.6; } catch (e) {} btn.classList.remove('muted'); }
    }
    function hideTrailer() {            // постер повертається
      box.classList.remove('loaded');
      render.removeClass('mvt-on');
      btn.classList.remove('show');
    }
    function replay() {                 // пауза з постером, потім трейлер знову
      if (cur !== c) return;
      hideTrailer();
      c.loop = setTimeout(function () {
        if (cur !== c || !opt(K.on)) return;
        try { video.currentTime = 0; } catch (e) {}
        var p = video.play(); if (p && p.catch) p.catch(function () {});
      }, PAUSE_BETWEEN);
    }

    video.addEventListener('playing', showTrailer);
    video.addEventListener('ended', replay);
    video.addEventListener('error', function () {
      if (cur !== c) return;
      log('помилка відео ' + (video.error && video.error.code));
      if (!c.started) stop();
    });
    c.timer = setTimeout(function () { if (cur === c && !c.started) { log('не стартував'); stop(); } }, 15000);

    video.src = url;
    var pr = video.play(); if (pr && pr.catch) pr.catch(function () {});
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

    /* запит до бекенду йде паралельно із затримкою; показуємо не раніше затримки */
    trailerUrl(movie, function (url) {
      var wait = Math.max(0, delay - (Date.now() - t0));
      setTimeout(function () {
        if (token !== seq || !opt(K.on)) return;
        if (!url) { log('трейлера немає'); return; }
        var active = null; try { active = Lampa.Activity.active(); } catch (x) {}
        if (active && active.activity && active.activity.render()[0] !== render[0]) return;   /* уже пішли з картки */
        if (!document.body.contains(render[0])) return;
        var bg = render.find('.full-start__background').first();
        var holder = bg.length ? bg[0].parentNode : (render.find('.full-start-new').first().closest('.scroll').parent()[0] || render[0]);
        if (!holder) return;
        if (window.getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
        play(render, url, holder, bg.length ? bg[0] : null);
      }, wait);
    });
  }

  function pause() { if (cur) { try { cur.video.pause(); } catch (e) {} } }
  function resume() { if (cur && cur.started) { try { var p = cur.video.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} } }

  /* ---------- налаштування (Інтерфейс) ---------- */
  function settings() {
    var api = Lampa.SettingsApi;
    if (!api || window.__movily_trailers_set) return;
    window.__movily_trailers_set = true;
    api.addParam({ component: 'interface', param: { name: 'movily_trailers_title', type: 'title' }, field: { name: tr('grp') } });
    api.addParam({ component: 'interface', param: { name: K.on, type: 'trigger', 'default': DEF[K.on] },
      field: { name: tr('on'), description: tr('on_d') },
      onChange: function (v) { if (v === false || v === 'false') { seq++; stop(); } } });
    api.addParam({ component: 'interface', param: { name: K.sound, type: 'trigger', 'default': DEF[K.sound] },
      field: { name: tr('sound'), description: tr('sound_d') } });
    api.addParam({ component: 'interface', param: { name: K.delay, type: 'select', values: { '1000': tr('d1'), '1500': tr('d15'), '3000': tr('d3'), '5000': tr('d5') }, 'default': DEF[K.delay] },
      field: { name: tr('delay') } });
  }

  function start() {
    css();
    settings();
    Lampa.Listener.follow('full', function (e) { try { onFull(e); } catch (x) { log(x && x.message); } });
    /* вийшли з картки / відкрили плеєр: зупиняємо; повернулися: нічого не робимо (нова картка запустить свій) */
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
