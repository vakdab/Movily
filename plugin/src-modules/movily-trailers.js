/* Movily: фоновий трейлер на сторінці фільму/серіалу (як у Prisma).
   Через ~1.5 с після відкриття картки трейлер плавно проявляється поверх фону (постер/бекдроп згасає),
   зверху лишається градієнт, з'являється кнопка звуку. Вмикається/вимикається в Налаштування > Інтерфейс.
   Джерело: TMDB /videos (ключ YouTube), пріоритет: мова інтерфейсу, потім en; тип Trailer, далі Teaser.
   Автономний модуль: працює через події Lampa (full / complite), без змін ядра. */
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
      '.mvt-box iframe{position:absolute;left:50%;top:50%;border:0;pointer-events:none;transform:translate(-50%,-50%)}',
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

  /* ---------- вибір відео з TMDB ---------- */
  function rank(list) {
    var ui = lang(), want = ui === 'uk' ? ['uk', 'en'] : (ui === 'ru' ? ['ru', 'en'] : ['en']);
    var seen = {}, out = [];
    (list || []).forEach(function (v) {
      if (!v || !v.key || seen[v.key]) return;
      if (v.site && String(v.site).toLowerCase() !== 'youtube') return;
      var s = 0;
      if (v.type === 'Trailer') s += 100; else if (v.type === 'Teaser') s += 40; else return;
      if (v.official) s += 10;
      var li = want.indexOf(v.iso_639_1);
      if (li >= 0) s += 30 - li * 10;
      s += v.published_at ? Date.parse(v.published_at) / 1e13 : 0;
      seen[v.key] = 1;
      out.push({ v: v, s: s });
    });
    out.sort(function (x, y) { return y.s - x.s; });
    return out.map(function (x) { return x.v; });
  }

  function fetchVideos(movie, done) {
    var type = movie.name || movie.first_air_date ? 'tv' : 'movie';
    var lng = ({ uk: 'uk-UA', ru: 'ru-RU' })[lang()] || 'en-US';
    var base = 'https://api.themoviedb.org/3/';
    var net = new Lampa.Reguest(), out = [], left = 2;
    function fin() { if (--left === 0) { try { net.clear(); } catch (e) {} done(out); } }
    function req(language) {
      var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + Lampa.TMDB.key() + '&language=' + language);
      net.silent(url, function (j) { out = out.concat((j && j.results) || []); fin(); }, function () { fin(); });
    }
    req(lng); req('en-US');
  }

  /* ---------- плеєр (YouTube iframe, без елементів керування) ---------- */
  var cur = null;

  function stop(now) {
    if (!cur) return;
    var c = cur; cur = null;
    clearTimeout(c.timer);
    try { window.removeEventListener('message', c.onMsg); if (c.fit) window.removeEventListener('resize', c.fit); } catch (e) {}
    try {
      if (c.box && c.box.parentNode) {
        if (now) c.box.parentNode.removeChild(c.box);
        else { c.box.classList.remove('loaded'); setTimeout(function () { if (c.box.parentNode) c.box.parentNode.removeChild(c.box); }, FADE); }
      }
    } catch (e) {}
    try { if (c.btn && c.btn.parentNode) c.btn.parentNode.removeChild(c.btn); } catch (e) {}
    try { c.render.removeClass('mvt-on'); } catch (e) {}
  }

  function cmd(c, fn, args) {
    try { c.frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: fn, args: args || [] }), '*'); } catch (e) {}
  }

  function play(render, queue, holder, bgEl) {
    stop(true);
    var vid = queue[0];
    var box = document.createElement('div');
    box.className = 'mvt-box';
    var frame = document.createElement('iframe');
    var withSound = opt(K.sound) === true;
    var id = 'mvt' + Date.now();
    var qs = 'autoplay=1&mute=1&controls=0&disablekb=1&fs=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&loop=1&playlist=' + vid.key +
      '&enablejsapi=1&origin=' + encodeURIComponent(location.origin) + '&widgetid=1';
    frame.src = 'https://www.youtube.com/embed/' + vid.key + '?' + qs;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'autoplay; encrypted-media';
    frame.setAttribute('tabindex', '-1');
    frame.setAttribute('aria-hidden', 'true');
    box.appendChild(frame);
    holder.insertBefore(box, bgEl ? bgEl.nextSibling : holder.firstChild);

    function fit() {
      var w = box.clientWidth || (holder && holder.clientWidth) || window.innerWidth || 1;
      var h = box.clientHeight || (holder && holder.clientHeight) || window.innerHeight || 1;
      var r = 16 / 9, W, H;
      if (w / h > r) { W = w; H = w / r; } else { H = h; W = h * r; }
      W *= 1.08; H *= 1.08;   /* трохи більше, щоб сховати чорні поля й заголовок YouTube */
      frame.style.width = Math.ceil(W) + 'px';
      frame.style.height = Math.ceil(H) + 'px';
    }
    fit();
    setTimeout(fit, 300); setTimeout(fit, 1200);

    var c = cur = { box: box, frame: frame, render: render, muted: !withSound, id: id, started: false, btn: null, timer: 0 };

    /* кнопка звуку */
    var btn = document.createElement('div');
    btn.className = 'mvt-sound muted';
    btn.innerHTML = '<svg class="mvt-ic-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>' +
      '<svg class="mvt-ic-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg>';
    btn.title = tr('mute');
    var onTap = function (ev) {
      if (ev) { ev.preventDefault && ev.preventDefault(); ev.stopPropagation && ev.stopPropagation(); }
      if (!cur || cur !== c) return;
      c.muted = !c.muted;
      cmd(c, c.muted ? 'mute' : 'unMute');
      if (!c.muted) cmd(c, 'setVolume', [60]);
      btn.classList.toggle('muted', c.muted);
    };
    btn.addEventListener('click', onTap);
    btn.addEventListener('touchend', onTap);
    var anchor = render[0];
    if (window.getComputedStyle(anchor).position === 'static') anchor.style.position = 'relative';
    anchor.appendChild(btn);
    c.btn = btn;

    /* повідомлення від YouTube: коли реально грає, показуємо */
    c.onMsg = function (ev) {
      if (!cur || cur !== c || ev.source !== frame.contentWindow) return;
      var d = ev.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { return; } }
      if (!d) return;
      if (d.event === 'onError') {
        log('помилка YouTube ' + d.info + ', наступне відео');
        var rest = queue.slice(1);
        if (rest.length) play(render, rest, holder, bgEl); else stop();
        return;
      }
      if (d.event === 'onReady' || d.event === 'initialDelivery') {
        cmd(c, 'playVideo');
      }
      var st = d.event === 'onStateChange' ? d.info : (d.info && typeof d.info.playerState === 'number' ? d.info.playerState : undefined);
      if (st === 1 && !c.started) {
        c.started = true;
        clearTimeout(c.timer);
        box.classList.add('loaded');
        render.addClass('mvt-on');
        btn.classList.add('show');
        if (!c.muted) { cmd(c, 'unMute'); cmd(c, 'setVolume', [60]); btn.classList.remove('muted'); }
      }
      if (st === 0) { try { cmd(c, 'seekTo', [0, true]); cmd(c, 'playVideo'); } catch (e) {} }
    };
    window.addEventListener('message', c.onMsg);
    frame.addEventListener('load', function () {
      try { frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (e) {}
      ['onReady', 'onStateChange', 'onError'].forEach(function (n) {
        try { frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: [n], id: 1, channel: 'widget' }), '*'); } catch (e) {}
      });
      setTimeout(function () { if (cur === c) cmd(c, 'playVideo'); }, 400);
    });
    c.timer = setTimeout(function () { if (cur === c && !c.started) { log('не стартував'); var rest2 = queue.slice(1); if (rest2.length) play(render, rest2, holder, bgEl); else stop(); } }, 12000);
    c.fit = fit;
    window.addEventListener('resize', fit);
  }

  /* ---------- картка фільму ---------- */
  var seq = 0;
  function onFull(e) {
    /* нова картка: попередній трейлер завжди зупиняємо (навіть коли функцію вимкнено) */
    if (e.type === 'start' || e.type === 'complite') { seq++; stop(true); }
    if (e.type !== 'complite' || !opt(K.on)) return;
    var movie = (e.data && e.data.movie) || (e.object && e.object.card) || null;
    if (!movie || !movie.id || movie.adult) return;
    var render = e.object.activity.render();
    var token = ++seq;
    var delay = parseInt(opt(K.delay), 10) || 1500;

    /* 1) відео, які Lampa вже отримала (e.data.videos), 2) додатковий запит до TMDB */
    function launch(list) {
      if (token !== seq || !opt(K.on)) return;
      var q = rank(list).slice(0, 4);
      if (!q.length) { log('трейлера немає'); return; }
      if (!document.body.contains(render[0])) return;
      var bg = render.find('.full-start__background').first();
      var holder = bg.length ? bg[0].parentNode : (render.find('.full-start-new').first().closest('.scroll').parent()[0] || render[0]);
      if (!holder) return;
      if (window.getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
      play(render, q, holder, bg.length ? bg[0] : null);
    }
    setTimeout(function () {
      if (token !== seq || !opt(K.on)) return;
      var active = null; try { active = Lampa.Activity.active(); } catch (x) {}
      if (active && active.activity && active.activity.render()[0] !== render[0]) return;   /* уже пішли з картки */
      var have = e.data && e.data.videos && e.data.videos.results;
      if (have && have.length && rank(have).length) return launch(have);
      fetchVideos(movie, launch);
    }, delay);
  }

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
