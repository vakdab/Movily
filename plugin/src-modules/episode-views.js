/* Movily: view modes for the online / episodes list (Explorer page).
   A toolbar under the Source / Filter chips switches how the .online-prestige rows are drawn:
   1 big cards, 2 compact list, 3 cards with a thumbnail, 4 table, 5 grid 2 columns, 6 banners.
   Only CSS classes change (mv-view-N on .explorer__files-body); Lampa's rows, focus and clicks stay as they are.
   The chosen mode is kept in localStorage. Sizes of the header and the chips are not touched. */
(function () {
  'use strict';
  if (window.__movily_episode_views) return;
  window.__movily_episode_views = true;

  var KEY = 'movily_episode_view';
  var DEFAULT = 3;
  var BAR = 'mv-views';

  var ICONS = {
    1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
    2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="5" height="5" rx="1.2"/><rect x="3.5" y="14" width="5" height="5" rx="1.2"/><path d="M12 6.5h8.5M12 16.5h8.5"/></svg>',
    3: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="7" rx="2.2"/><rect x="3.5" y="13.5" width="17" height="7" rx="2.2"/><circle cx="8" cy="7" r="1" fill="currentColor"/><circle cx="8" cy="17" r="1" fill="currentColor"/></svg>',
    4: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.5 7h15M4.5 12h15M4.5 17h15"/></svg>',
    5: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="6.5" rx="1.8"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="13" width="7" height="7.5" rx="1.8"/></svg>',
    6: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="11" rx="2"/><path d="M3.5 18.5h17M3.5 21h10"/></svg>',
    7: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/></svg>'
  };
  var TITLES = { 1: 'Великі картки', 2: 'Список з мініатюрою', 3: 'Картки з мініатюрою', 4: 'Таблиця', 5: 'Сітка', 6: 'Банери', 7: 'Режим за замовчуванням' };

  function get() {
    try {
      var v = parseInt(localStorage.getItem(KEY), 10);
      if (v >= 1 && v <= 6) return v;
    } catch (e) {}
    return DEFAULT;
  }
  function set(v) { try { localStorage.setItem(KEY, String(v)); } catch (e) {} }

  var CSS = [
    /* the toolbar */
    '.' + BAR + '{display:flex;justify-content:space-between;align-items:center;margin:.9em 1.2em 0;padding:.35em .5em;border-radius:1.2em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}',
    '.' + BAR + ' .mv-views__btn{flex:1 1 0;display:flex;align-items:center;justify-content:center;height:2.7em;margin:0 .1em;border-radius:.8em;color:rgba(255,255,255,.62);cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.' + BAR + ' .mv-views__btn svg{width:1.35em;height:1.35em}',
    '.' + BAR + ' .mv-views__btn.mv-on{background:rgba(255,255,255,.12);color:#fff}',
    '.' + BAR + ' .mv-views__btn.focus{background:#fff;color:#000}',

    /* every mode: the rows are plain blocks we lay out ourselves */
    '.mv-vw .online-prestige{position:relative;overflow:hidden;box-sizing:border-box;max-width:100%}',
    '.mv-vw .online-prestige__body{min-width:0}',
    '.mv-vw .online-prestige__episode-number{font-weight:600}',

    /* 1: big cards, picture on top */
    '.mv-view-1 .online-prestige{display:block!important;margin:0 0 1em!important;padding:0!important;border-radius:1.2em!important}',
    '.mv-view-1 .online-prestige__img{width:100%!important;height:auto!important;min-height:0!important;padding-bottom:56.25%;position:relative}',
    '.mv-view-1 .online-prestige__img>img{border-radius:0!important}',
    '.mv-view-1 .online-prestige__episode-number{top:auto!important;right:auto!important;left:.7em!important;bottom:.7em!important;font-size:.9em!important;padding:.15em .55em;border-radius:.5em;background:rgba(0,0,0,.65);display:block!important}',
    '.mv-view-1 .online-prestige__body{padding:.8em 1em 1em!important}',
    '.mv-view-1 .online-prestige__timeline{margin:.5em 0!important}',

    /* 2: compact list: number | small picture | title ... time */
    '.mv-view-2 .online-prestige{display:grid!important;grid-template-columns:2.2em 6em minmax(0,1fr) auto;grid-template-areas:"n i b t";align-items:center;column-gap:.7em;margin:0 0 .5em!important;padding:.4em .9em .4em .6em!important;border-radius:1em!important}',
    '.mv-view-2 .online-prestige__img{grid-area:i;width:6em!important;height:3.4em!important;min-height:0!important;overflow:hidden;border-radius:.6em}',
    '.mv-view-2 .online-prestige__episode-number{display:none!important}',
    '.mv-view-2 .online-prestige::before{content:attr(data-mv-n);grid-area:n;color:rgba(255,255,255,.5);font-weight:600;font-size:1.05em}',
    '.mv-view-2 .online-prestige__body{display:contents}',
    '.mv-view-2 .online-prestige__head{display:contents}',
    '.mv-view-2 .online-prestige__title{grid-area:b;font-size:1.1em!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block!important}',
    '.mv-view-2 .online-prestige__time{grid-area:t;padding:0!important;white-space:nowrap;color:rgba(255,255,255,.55)}',
    '.mv-view-2 .online-prestige__timeline,.mv-view-2 .online-prestige__footer{display:none!important}',

    /* 3: cards with a thumbnail */
    '.mv-view-3 .online-prestige{margin:0 0 .8em!important;border-radius:1.1em!important}',
    '.mv-view-3 .online-prestige__img{width:9.5em!important;min-height:6em!important}',
    '.mv-view-3 .online-prestige__episode-number{top:.4em!important;left:.4em!important;right:auto!important;bottom:auto!important;font-size:.8em!important;padding:.15em .5em;border-radius:.45em;background:rgba(0,0,0,.7);display:block!important}',

    /* 4: table: # | episode | rating | time, a header row on top */
    '.mv-view-4 .scroll__body{padding-top:0}',
    '.mv-view-4 .online-prestige{display:grid!important;grid-template-columns:2.4em minmax(0,1fr) 3.6em 4.6em;grid-template-areas:"n b r t";align-items:center;column-gap:.5em;margin:0!important;padding:.75em .5em!important;border-radius:0!important;background:none!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.08)!important;box-shadow:none!important}',
    '.mv-view-4 .online-prestige.focus{background:rgba(255,255,255,.1)!important}',
    '.mv-view-4 .online-prestige__img{display:none!important}',
    '.mv-view-4 .online-prestige::before{content:attr(data-mv-n);grid-area:n;color:rgba(255,255,255,.5);font-weight:600}',
    '.mv-view-4 .online-prestige__body{display:contents}',
    '.mv-view-4 .online-prestige__head{display:contents}',
    '.mv-view-4 .online-prestige__title{grid-area:b;font-size:1.1em!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block!important}',
    '.mv-view-4 .online-prestige__time{grid-area:t;padding:0!important;text-align:right;white-space:nowrap;color:rgba(255,255,255,.55)}',
    '.mv-view-4 .online-prestige__footer{display:contents}',
    '.mv-view-4 .online-prestige__info{grid-area:r;justify-content:center;font-size:1em}',
    '.mv-view-4 .online-prestige__info>*:not(:first-child),.mv-view-4 .online-prestige-split,.mv-view-4 .online-prestige-rate>svg{display:none!important}',
    '.mv-view-4 .online-prestige-rate>span{padding:0!important}',
    '.mv-view-4 .online-prestige__timeline,.mv-view-4 .online-prestige__quality{display:none!important}',

    /* 5: grid, 2 columns: the picture fills the whole card, title + time lie on it */
    '.mv-view-5 .scroll__body{display:flex!important;flex-wrap:wrap;align-items:flex-start;margin:0 -.4em}',
    '.mv-view-5 .online-prestige{display:block!important;box-sizing:border-box;flex:0 0 calc(50% - .8em)!important;width:calc(50% - .8em)!important;max-width:calc(50% - .8em)!important;margin:0 .4em .8em!important;padding:0!important;border-radius:1em!important;overflow:hidden}',
    '.mv-view-5 .online-prestige+.online-prestige{margin-top:0!important}',
    '.mv-view-5 .online-prestige__img{position:relative!important;display:block!important;width:100%!important;height:0!important;min-height:0!important;padding:0 0 62% 0!important;margin:0!important;border-radius:0!important}',
    '.mv-view-5 .online-prestige__img>img{border-radius:0!important}',
    '.mv-view-5 .online-prestige__episode-number{top:.45em!important;left:.45em!important;right:auto!important;bottom:auto!important;width:auto!important;height:auto!important;font-size:.8em!important;padding:.1em .55em;border-radius:.45em;background:rgba(0,0,0,.72);display:block!important}',
    '.mv-view-5 .online-prestige__body{position:absolute!important;left:0;right:0;bottom:0;padding:1.6em .75em .35em!important;background:linear-gradient(to top,rgba(0,0,0,.88) 25%,rgba(0,0,0,0))}',
    '.mv-view-5 .online-prestige__head{display:block!important}',
    '.mv-view-5 .online-prestige__title{display:block!important;font-size:1em!important;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mv-view-5 .online-prestige__time{padding:0!important;font-size:.85em;color:rgba(255,255,255,.72)}',
    '.mv-view-5 .online-prestige__timeline{margin:.35em 0 0!important}',
    '.mv-view-5 .online-prestige__footer,.mv-view-5 .online-prestige__quality{display:none!important}',

    /* 6: banners: the picture is a dimmed background; label + title on the left, time on the right, rating at the bottom */
    '.mv-view-6 .online-prestige{display:block!important;min-height:9.5em;margin:0 0 .8em!important;padding:0!important;border-radius:1.2em!important}',
    '.mv-view-6 .online-prestige__img{position:absolute!important;left:0;top:0;right:0;bottom:0;width:100%!important;height:100%!important;min-height:0!important}',
    '.mv-view-6 .online-prestige__img>img{filter:brightness(.4)}',
    '.mv-view-6 .online-prestige__episode-number,.mv-view-6 .online-prestige__loader{display:none!important}',
    '.mv-view-6 .online-prestige__body{position:relative;z-index:1;min-height:9.5em;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:1em 1.1em!important}',
    '.mv-view-6 .online-prestige__head{align-items:flex-start!important}',
    '.mv-view-6 .online-prestige__title{font-size:1.4em!important;font-weight:700;-webkit-line-clamp:2!important;line-clamp:2!important}',
    '.mv-view-6 .online-prestige__time{padding:.1em .6em!important;border-radius:.5em;background:rgba(0,0,0,.55);font-size:.9em}',
    '.mv-view-6 .online-prestige__timeline{display:none!important}',
    '.mv-view-6 .online-prestige__footer{margin:0!important}',
    '.mv-view-6 .online-prestige__info{color:rgba(255,255,255,.8)}',

    /* the list starts below the toolbar (Lampa sized it as «screen minus header», not knowing the bar) */
    '.mv-vw.scroll,.mv-vw .scroll__content{padding-top:.4em}'
  ].join('\n');

  function addCss() {
    if (document.getElementById('movily-episode-views-css')) return;
    var st = document.createElement('style');
    st.id = 'movily-episode-views-css';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function apply(root, mode) {
    var body = root.querySelector('.explorer__files-body') || root;
    for (var i = 1; i <= 6; i++) body.classList.remove('mv-view-' + i);
    body.classList.add('mv-vw', 'mv-view-' + mode);
    var btns = root.querySelectorAll('.' + BAR + ' .mv-views__btn');
    for (var j = 0; j < btns.length; j++) {
      var n = parseInt(btns[j].getAttribute('data-mode'), 10);
      btns[j].classList.toggle('mv-on', n === mode);
    }
  }

  function build(root) {
    var head = root.querySelector('.explorer__files-head');
    if (!head || root.querySelector('.' + BAR)) return;
    // only pages that list episodes / sources (online plugins); not the torrents page
    if (!root.querySelector('.online-prestige')) return;
    var bar = document.createElement('div');
    bar.className = BAR;
    var html = '';
    for (var i = 1; i <= 7; i++) {
      html += '<div class="mv-views__btn selector" data-mode="' + i + '" title="' + TITLES[i] + '">' + ICONS[i] + '</div>';
    }
    bar.innerHTML = html;
    head.parentNode.insertBefore(bar, head.nextSibling);
    var cur = get();
    apply(root, cur);
    bar.style.display = head.classList.contains('hide') ? 'none' : '';
    bar.addEventListener('click', function (e) {
      var b = e.target;
      while (b && b !== bar && !(b.classList && b.classList.contains('mv-views__btn'))) b = b.parentNode;
      if (!b || b === bar) return;
      var n = parseInt(b.getAttribute('data-mode'), 10);
      if (n === 7) { set(cur); return; }
      cur = n;
      set(n);
      apply(root, n);
    });
    // Lampa's remote / keyboard: Enter on a focused button
    try {
      var btns = bar.querySelectorAll('.mv-views__btn');
      for (var k = 0; k < btns.length; k++) {
        if (window.$) window.$(btns[k]).on('hover:enter', function () { this.click(); });
      }
    } catch (e) {}
  }


  // the episode number for the modes that draw it themselves (data attribute from Lampa's own badge)
  function numberRows(root) {
    var rows = root.querySelectorAll('.online-prestige');
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.getAttribute('data-mv-n')) continue;
      var n = r.querySelector('.online-prestige__episode-number');
      var t = n && n.textContent.trim();
      if (!t) {
        var m = (r.querySelector('.online-prestige__title') || {}).textContent;
        var x = m && /^\s*(\d+)\./.exec(m);
        t = x ? (x[1].length < 2 ? '0' + x[1] : x[1]) : '';
      }
      if (t) r.setAttribute('data-mv-n', t);
    }
  }

  // Lampa sizes the list as «the screen minus the header», not knowing the toolbar: cap it to the room that is left
  function fit(root) {
    var sc = root.querySelector('.explorer__files-body > .scroll');
    if (!sc) return;
    var top = sc.getBoundingClientRect().top;
    var room = Math.floor(window.innerHeight - top);
    if (room > 120) sc.style.maxHeight = room + 'px';
  }

  function scan() {
    var roots = document.querySelectorAll('.explorer');
    for (var i = 0; i < roots.length; i++) {
      var r = roots[i];
      var have = r.querySelector('.' + BAR);
      if (have) {
        // rows arrive later: keep the mode on the freshly built list
        var body = r.querySelector('.explorer__files-body');
        if (body && !body.classList.contains('mv-vw')) apply(r, get());
        // Lampa hides / shows the head (chips) itself: the toolbar follows it, and stays right after it
        var hd = r.querySelector('.explorer__files-head');
        if (hd) {
          have.style.display = hd.classList.contains('hide') ? 'none' : '';
          if (hd.nextSibling !== have) hd.parentNode.insertBefore(have, hd.nextSibling);
        }
      } else build(r);
      numberRows(r);
      fit(r);
    }
  }

  function start() {
    addCss();
    scan();
    window.addEventListener('resize', function () { try { scan(); } catch (e) {} });
    if (window.MutationObserver) {
      var t = 0;
      new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () { t = 0; try { scan(); } catch (e) {} }, 120);
      }).observe(document.body, { childList: true, subtree: true });
    } else setInterval(scan, 800);
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
