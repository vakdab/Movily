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

    /* 2: compact list: number, small picture, title, time */
    '.mv-view-2 .online-prestige{align-items:center;margin:0 0 .5em!important;padding:.35em .8em .35em .5em!important;border-radius:1em!important}',
    '.mv-view-2 .online-prestige__img{width:6.2em!important;min-height:3.5em!important;height:3.5em!important;margin-left:1.8em}',
    '.mv-view-2 .online-prestige__episode-number{top:0!important;bottom:0!important;left:-2.6em!important;right:auto!important;width:2.4em;font-size:1.05em!important;color:rgba(255,255,255,.5)}',
    '.mv-view-2 .online-prestige__img{overflow:visible!important}',
    '.mv-view-2 .online-prestige__body{padding:.4em .6em!important}',
    '.mv-view-2 .online-prestige__timeline,.mv-view-2 .online-prestige__footer{display:none!important}',
    '.mv-view-2 .online-prestige__title{font-size:1.15em!important}',

    /* 3: cards with a thumbnail */
    '.mv-view-3 .online-prestige{margin:0 0 .8em!important;border-radius:1.1em!important}',
    '.mv-view-3 .online-prestige__img{width:9.5em!important;min-height:6em!important}',
    '.mv-view-3 .online-prestige__episode-number{top:.4em!important;left:.4em!important;right:auto!important;bottom:auto!important;font-size:.8em!important;padding:.15em .5em;border-radius:.45em;background:rgba(0,0,0,.7);display:block!important}',

    /* 4: table rows, no pictures */
    '.mv-view-4 .online-prestige{display:flex!important;align-items:center;margin:0!important;padding:.55em .6em!important;border-radius:0!important;background:none!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.08)!important}',
    '.mv-view-4 .online-prestige__img{width:2.6em!important;min-height:0!important;height:1.6em!important;flex:0 0 2.6em}',
    '.mv-view-4 .online-prestige__img>img,.mv-view-4 .online-prestige__loader{display:none!important}',
    '.mv-view-4 .online-prestige__episode-number{position:static!important;display:block!important;font-size:1em!important;color:rgba(255,255,255,.5)}',
    '.mv-view-4 .online-prestige__timeline,.mv-view-4 .online-prestige__quality{display:none!important}',
    '.mv-view-4 .online-prestige__body{padding:0 .5em!important}',
    '.mv-view-4 .online-prestige__head{display:flex!important}',
    '.mv-view-4 .online-prestige__title{font-size:1.1em!important}',
    '.mv-view-4 .online-prestige__footer{position:absolute;right:5.2em;top:50%;transform:translateY(-50%)}',

    /* 5: grid, 2 columns, title over the picture */
    '.mv-view-5.mv-list .scroll__body>div{display:flex;flex-wrap:wrap;margin:0 -.35em}',
    '.mv-view-5 .online-prestige{display:block!important;width:calc(50% - .7em)!important;margin:0 .35em .7em!important;padding:0!important;border-radius:1em!important;float:left}',
    '.mv-view-5 .online-prestige__img{width:100%!important;height:auto!important;min-height:0!important;padding-bottom:62%}',
    '.mv-view-5 .online-prestige__episode-number{top:.4em!important;left:.4em!important;right:auto!important;bottom:auto!important;font-size:.8em!important;padding:.1em .5em;border-radius:.4em;background:rgba(0,0,0,.7);display:block!important}',
    '.mv-view-5 .online-prestige__body{position:absolute;left:0;right:0;bottom:0;padding:.6em .7em!important;background:linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,0))}',
    '.mv-view-5 .online-prestige__title{font-size:1em!important}',
    '.mv-view-5 .online-prestige__footer,.mv-view-5 .online-prestige__quality{display:none!important}',

    /* 6: banners, the picture as a dimmed background */
    '.mv-view-6 .online-prestige{display:block!important;min-height:9.5em;margin:0 0 .8em!important;padding:0!important;border-radius:1.2em!important}',
    '.mv-view-6 .online-prestige__img{position:absolute!important;left:0;top:0;right:0;bottom:0;width:100%!important;height:100%!important;min-height:0!important}',
    '.mv-view-6 .online-prestige__img>img{filter:brightness(.45)}',
    '.mv-view-6 .online-prestige__episode-number{display:none!important}',
    '.mv-view-6 .online-prestige__body{position:relative;z-index:1;min-height:9.5em;display:flex;flex-direction:column;justify-content:space-between;padding:1em 1.1em!important}',
    '.mv-view-6 .online-prestige__title{font-size:1.5em!important}'
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
    }
  }

  function start() {
    addCss();
    scan();
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
