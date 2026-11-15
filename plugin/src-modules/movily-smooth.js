/* Movily smooth: плавні переходи між сторінками і менше смикання при швидкому користуванні.
   1) Перехід між сторінками: замість двох накладених fade (.activity + .activity__body, через що екран
      на мить ставав порожнім) нова сторінка з'являється одним коротким fade + легким зсувом (лише
      opacity/transform, тобто на GPU), стара сторінка гасне під нею.
   2) Під час переходу тимчасово вимикається backdrop-filter (найдорожчий ефект на телефоні), потім повертається.
   3) Швидкі кліки не накопичують анімацій: клас переходу знімається по таймеру, що скидається.
   Нічого не змінює в логіці Lampa: лише CSS і клас body.movily-transition. */
(function () {
  'use strict';
  if (window.__movily_smooth) return;
  window.__movily_smooth = true;

  var ID = 'movily-smooth-css';
  var CLS = 'movily-transition';
  var DURATION = 240;           // ms, довжина fade нової сторінки
  var EASE = 'cubic-bezier(.22,.61,.36,1)';

  function css() {
    if (document.getElementById(ID)) return;
    var st = document.createElement('style');
    st.id = ID;
    st.textContent = [
      /* одна анімація замість двох: прибираємо fade тіла, fade робить сама .activity */
      'body .activity__body{transition:none!important;animation:none!important}',
      'body .activity--load .activity__body{opacity:0}',
      'body .activity{transition:opacity ' + DURATION + 'ms ' + EASE + ';will-change:auto}',
      /* стара сторінка гасне швидше, ніж з'являється нова, щоб не було «порожнього» кадру */
      'body .activity:not(.activity--active){transition-duration:' + Math.round(DURATION * 0.6) + 'ms;pointer-events:none}',
      /* поки нова сторінка вантажить дані (activity--load), попередня лишається на екрані, а не гасне в порожнечу */
      'body .activity.movily-prev{opacity:1;z-index:0;transition:none}',
      'body .activity.movily-prev.movily-prev-out{opacity:0;transition:opacity ' + Math.round(DURATION * 0.8) + 'ms ' + EASE + '}',
      /* нова сторінка: легкий зсув знизу, лише transform */
      'body.' + CLS + ' .activity--active{animation:movily-activity-in ' + DURATION + 'ms ' + EASE + ' both}',
      '@keyframes movily-activity-in{from{transform:translate3d(0,10px,0)}to{transform:translate3d(0,0,0)}}',
      /* найдорожче для GPU: скло. На час переходу вимикаємо, потім повертається само */
      'body.' + CLS + ' *,body.' + CLS + ' *::before,body.' + CLS + ' *::after{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
      /* поважаємо системне «зменшити рух» */
      '@media (prefers-reduced-motion:reduce){body .activity{transition:none!important}body.' + CLS + ' .activity--active{animation:none!important}}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  var prevEl = null, releaseTimer = 0, loadObs = null;

  function release() {
    clearTimeout(releaseTimer);
    if (loadObs) { loadObs.disconnect(); loadObs = null; }
    var el = prevEl; prevEl = null;
    if (!el) return;
    el.classList.add('movily-prev-out');
    setTimeout(function () { el.classList.remove('movily-prev', 'movily-prev-out'); }, Math.round(DURATION * 0.8) + 40);
  }

  /* викликається ДО Lampa.Activity.push/backward: запам'ятовуємо сторінку, що зараз на екрані */
  function holdPrevious() {
    var cur = document.querySelector('.activity.activity--active');
    if (!cur || cur.classList.contains('activity--load')) return;
    if (prevEl && prevEl !== cur) { prevEl.classList.remove('movily-prev', 'movily-prev-out'); }
    prevEl = cur;
    cur.classList.remove('movily-prev-out');
    cur.classList.add('movily-prev');
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(release, 4000);           /* страховка: не тримати стару сторінку вічно */
    if (loadObs) loadObs.disconnect();
    /* чекаємо, поки нова активна сторінка перестане бути в стані завантаження */
    var slides = document.querySelector('.activitys__slides');
    if (!slides || !window.MutationObserver) { setTimeout(release, 400); return; }
    var check = function () {
      var act = slides.querySelector('.activity--active');
      if (act && act !== prevEl && !act.classList.contains('activity--load')) release();
    };
    loadObs = new MutationObserver(check);
    loadObs.observe(slides, { attributes: true, attributeFilter: ['class'], subtree: true });
    setTimeout(check, 0);
  }

  var timer = 0;
  function begin() {
    var b = document.body;
    if (!b) return;
    if (!b.classList.contains(CLS)) b.classList.add(CLS);
    clearTimeout(timer);
    timer = setTimeout(function () { b.classList.remove(CLS); }, DURATION + 120);
  }

  function hook() {
    try {
      if (!window.Lampa || !Lampa.Listener) return false;
      /* будь-який старт/повернення активності = перехід */
      Lampa.Listener.follow('activity', function (e) {
        if (e && (e.type === 'start' || e.type === 'archive' || e.type === 'create' || e.type === 'destroy')) begin();
      });
      var A = Lampa.Activity;
      ['push', 'backward', 'replace'].forEach(function (name) {
        var orig = A && A[name];
        if (typeof orig !== 'function' || orig.__movily_smooth) return;
        A[name] = function () { if (name !== 'backward') holdPrevious(); begin(); return orig.apply(this, arguments); };
        A[name].__movily_smooth = true;
      });
      return true;
    } catch (e) { return false; }
  }

  css();
  if (!hook()) {
    var tries = 0, t = setInterval(function () { if (hook() || ++tries > 40) clearInterval(t); }, 250);
  }
})();
