/* Movily: картки у стилі AppleTV AGNative: горизонтальний бекдроп 16:9, градієнт знизу,
   логотип назви фільму (TMDB) замість тексту, рейтинг. Лише для звичайних постерних карток у рядках
   (не чіпає картки-кнопки, «Continue» та сітки). Логотипи беруться через Lampa.Api.sources.tmdb. */
(function () {
  'use strict';
  if (window.__movily_card_logos) return;
  window.__movily_card_logos = true;

  var STYLE_ID = 'movily-card-logos-css';
  // ті самі ключі, що в «Налаштування → AppleTV AGNative»
  var K = {
    backdrop: 'appletv_agnative_backdrop', mode: 'appletv_agnative_card_image_mode',
    size: 'appletv_agnative_card_size', logoSize: 'appletv_agnative_logo_size',
    badge: 'appletv_agnative_badge', rating: 'appletv_agnative_rating',
    align: 'appletv_agnative_overlay_align', logoLang: 'appletv_agnative_logo_lang',
    quality: 'appletv_agnative_poster_quality'
  };
  function opt(k, d) { try { var v = Lampa.Storage.get(k, d); return v === undefined || v === null || v === '' ? d : v; } catch (e) { return d; } }
  // «Горизонтальні картки»: off = вертикальні постери (тоді модуль нічого не міняє)
  function horizontal() { return opt(K.backdrop, 'off') !== 'off'; }
  // ширина картки по розміру (em), як у AGNative для горизонтальних
  var WIDTH = { xs: 14, sm: 15.8, md: 17.6, lg: 19.4, xl: 21.2 };
  var LOGO_H = { xs: 1.7, sm: 1.95, md: 2.55, lg: 2.6, xl: 3.1 };
  var LOGO_W = { xs: 50, sm: 64, md: 82, lg: 90, xl: 100 };
  var BODY = 'movily-cards';
  var cache = {};      // key -> {path} | null
  var pending = {};    // key -> [callbacks]
  var LS = 'movily_card_logos_v1';
  try { cache = JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { cache = {}; }
  var saveT;
  function persist() {
    clearTimeout(saveT);
    saveT = setTimeout(function () {
      try {
        var keys = Object.keys(cache);
        if (keys.length > 600) keys.slice(0, keys.length - 600).forEach(function (k) { delete cache[k]; });
        localStorage.setItem(LS, JSON.stringify(cache));
      } catch (e) {}
    }, 800);
  }

  function css() {
    var old = document.getElementById(STYLE_ID);
    if (old) old.remove();
    var B = 'body.' + BODY;
    var C = B + ' .items-line .card:not(.card--wide):not(.card--collection):not(.card--category):not(.card--studio):not(.card-more):not([data-nfx-switched="surs"]):not(.mly-skip)';
    var w = WIDTH[opt(K.size, 'md')] || WIDTH.md;
    var lh = LOGO_H[opt(K.logoSize, 'md')] || LOGO_H.md, lw = LOGO_W[opt(K.logoSize, 'md')] || LOGO_W.md;
    var al = opt(K.align, 'start'), ai = al === 'center' ? 'center' : al === 'end' ? 'flex-end' : 'flex-start';
    var ta = al === 'center' ? 'center' : al === 'end' ? 'right' : 'left';
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      C + '{width:' + w + 'em!important;flex:0 0 auto!important}',
      C + ' .card__view{padding-bottom:56.25%!important;margin-bottom:0!important;border-radius:1.55em!important;overflow:hidden!important;' +
        'box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -1.5px 1px rgba(0,0,0,.18),inset 0 0 0 1px rgba(255,255,255,.06),0 6px 14px rgba(0,0,0,.14),0 12px 28px rgba(0,0,0,.16)!important;' +
        'transition:transform .28s cubic-bezier(.22,.61,.36,1),box-shadow .28s ease!important}',
      C + ' .card__img{border-radius:1.55em!important;object-fit:cover!important;background-size:cover!important;background-position:center!important}',
      C + ' .card__view::before{content:""!important;display:block!important;position:absolute;left:0;right:0;bottom:0;height:8.5em;z-index:1;pointer-events:none;border-radius:0 0 1.55em 1.55em;' +
        'background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.78) 18%,rgba(0,0,0,.5) 42%,rgba(0,0,0,.22) 64%,rgba(0,0,0,.06) 82%,transparent 100%)!important}',
      C + ' .card__view::after{display:none!important}',
      C + ' .card__title,' + C + ' .card__age{display:none!important}',
      C + ' .card__vote{display:none!important}',
      C + '.focus .card__view{transform:translateY(-.08em) scale(1.06)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 0 0 2px rgba(86,141,255,.92),0 18px 42px rgba(0,0,0,.26),0 8px 20px rgba(0,0,0,.14)!important}',
      C + '.hover .card__view{transform:translateY(-.04em) scale(1.03)!important}',
      '.mly-ov{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column;align-items:' + ai + ';text-align:' + ta + ';justify-content:flex-end;padding:2.15em 1.02em .92em;pointer-events:none}',
      '.mly-ov__logo{display:block;max-height:' + lh + 'em;max-width:' + lw + '%;width:auto;height:auto;object-fit:contain;object-position:' + (al === 'center' ? 'center' : al === 'end' ? 'right' : 'left') + ' bottom;margin-bottom:.28em;filter:drop-shadow(0 2px 6px rgba(0,0,0,.6))}',
      '.mly-ov__title{color:#fff;font-size:1.02em;line-height:1.14;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,.95),0 2px 8px rgba(0,0,0,.85),0 4px 16px rgba(0,0,0,.7);' +
        'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:.2em}',
      '.mly-ov__meta{color:rgba(255,255,255,.92);font-size:.74em;line-height:1.28;text-shadow:0 1px 2px rgba(0,0,0,.95),0 2px 6px rgba(0,0,0,.85)}',
      '.mly-ov.has-logo .mly-ov__title{display:none}',
      '.mly-ov__rate,.mly-ov__badge{display:none}',
      B + '.mly-rate .mly-ov__rate{display:inline}',
      '.mly-ov__badge{position:absolute;top:.7em;left:.82em;padding:.3em .8em;border-radius:.9em;background:rgba(12,14,20,.62);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:.62em;font-weight:800;letter-spacing:.05em;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}',
      B + '.mly-badge .mly-ov__badge{display:block}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function L() { return window.Lampa; }
  function kindOf(d) { return (d.name || d.original_name || d.first_air_date || d.media_type === 'tv') ? 'tv' : 'movie'; }
  function isTmdb(d) { return d && d.id && (!d.source || d.source === 'tmdb' || d.source === 'cub'); }

  function logoLang() {
    var o = opt(K.logoLang, 'auto');
    if (o && o !== 'auto' && o !== 'ui') return String(o).toLowerCase().split('-')[0];
    try {
      var l = (L().Storage.field('language') || 'uk').toLowerCase();
      return l.split('-')[0] || 'uk';
    } catch (e) { return 'uk'; }
  }

  function getLogo(d, cb) {
    if (!isTmdb(d)) return cb(null);
    var lang = logoLang(), kind = kindOf(d), key = kind + '/' + d.id + '/' + lang;
    if (key in cache) return cb(cache[key]);
    if (pending[key]) { pending[key].push(cb); return; }
    pending[key] = [cb];
    function done(v) {
      cache[key] = v; persist();
      var w = pending[key] || []; delete pending[key];
      w.forEach(function (f) { try { f(v); } catch (e) {} });
    }
    try {
      var langs = [lang, 'en', 'null'].filter(function (x, i, a) { return a.indexOf(x) === i; }).join(',');
      L().Api.sources.tmdb.get(kind + '/' + d.id + '/images?include_image_language=' + langs, {}, function (j) {
        var logos = (j && j.logos) || [], pick = null;
        [lang, 'en', null].some(function (code) {
          var m = logos.filter(function (x) { return (x.iso_639_1 || null) === code && x.file_path && !/\.svg$/i.test(x.file_path); });
          if (m.length) { pick = m.sort(function (a, b) { return (b.vote_average || 0) - (a.vote_average || 0); })[0]; return true; }
          return false;
        });
        done(pick ? { path: pick.file_path } : null);
      }, function () { done(null); });
    } catch (e) { done(null); }
  }

  function year(d) { return String(d.release_date || d.first_air_date || '').slice(0, 4); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function setImage(el, d) {
    var im = el.querySelector('.card__img');
    if (!im) return;
    var poster = opt(K.mode, 'backdrop') === 'poster';
    var path = poster ? (d.poster_path || d.backdrop_path) : (d.backdrop_path || d.poster_path);
    if (!path) return;
    var url = L().TMDB.image('t/p/' + (poster ? opt(K.quality, 'w500') : 'w780') + path);
    if (im.tagName === 'IMG') {
      if (im.getAttribute('data-mly-src') === url) return;
      im.setAttribute('data-mly-src', url);
      im.src = url;
    } else {
      im.style.backgroundImage = 'url(' + url + ')';
    }
  }

  function decorate(el) {
    if (!el || el.__mly) return;
    var d = el.card_data;
    if (!d || !(d.title || d.name)) return;
    if (el.classList.contains('card--wide') || el.classList.contains('card--collection') ||
        el.classList.contains('card--category') || el.classList.contains('card--studio') ||
        el.classList.contains('card-more') || el.getAttribute('data-nfx-switched') === 'surs') return;
    var view = el.querySelector('.card__view');
    if (!view) return;
    // лише картки з рядків головної (не сітки), щоб не ламати каталоги
    if (!el.closest('.items-line')) return;
    el.__mly = true;
    setImage(el, d);

    var ov = document.createElement('div');
    ov.className = 'mly-ov';
    var meta = [];
    var y = year(d); if (y) meta.push(esc(y));
    var v = parseFloat(d.vote_average);
    if (v > 0) meta.push('<span class="mly-ov__rate">\u2605 ' + v.toFixed(1) + '</span>');
    ov.innerHTML = '<div class="mly-ov__title">' + esc(d.title || d.name) + '</div>' +
      (meta.length ? '<div class="mly-ov__meta">' + meta.join(' \u00b7 ') + '</div>' : '');
    var bd = document.createElement('div');
    bd.className = 'mly-ov__badge';
    bd.textContent = kindOf(d) === 'tv' ? 'Серіал' : 'Фільм';
    view.appendChild(bd);
    view.appendChild(ov);

    getLogo(d, function (lg) {
      if (!lg || !el.isConnected) return;
      var im = new Image();
      im.className = 'mly-ov__logo';
      im.alt = d.title || d.name || '';
      im.onload = function () { ov.classList.add('has-logo'); };
      im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); };
      im.src = L().TMDB.image('t/p/w300' + lg.path);
      ov.insertBefore(im, ov.firstChild);
    });
  }

  var scanT;
  function scan() {
    clearTimeout(scanT);
    scanT = setTimeout(function () {
      if (!horizontal()) return;
      var list = document.querySelectorAll('.items-line .card');
      for (var i = 0; i < list.length; i++) decorate(list[i]);
    }, 120);
  }

  function applySettings() {
    var b = document.body, on = horizontal();
    b.classList.toggle(BODY, on);
    b.classList.toggle('mly-rate', opt(K.rating, 'off') !== 'off');
    b.classList.toggle('mly-badge', opt(K.badge, 'on') !== 'off');
    css();
    if (on) {
      var list = document.querySelectorAll('.items-line .card');
      for (var i = 0; i < list.length; i++) { if (list[i].__mly && list[i].card_data) setImage(list[i], list[i].card_data); }
      scan();
    }
  }

  function start() {
    try {
      Lampa.Storage.listener.follow('change', function (e) {
        if (e && e.name && String(e.name).indexOf('appletv_agnative_') === 0) setTimeout(applySettings, 50);
      });
    } catch (e) {}
    applySettings();
    try {
      new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    } catch (e) { setInterval(scan, 800); }
    try { L().Listener.follow('activity', scan); } catch (e) {}
    scan();
  }

  if (window.Lampa && Lampa.Listener && Lampa.Storage && Lampa.TMDB && Lampa.Api && document.body) start();
  else {
    var t = setInterval(function () {
      if (window.Lampa && Lampa.Listener && Lampa.Storage && Lampa.TMDB && Lampa.Api && document.body) { clearInterval(t); start(); }
    }, 200);
  }
})();
