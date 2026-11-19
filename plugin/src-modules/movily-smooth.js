/* Movily smooth navigation.
   Short, GPU-friendly page transitions. Blur is applied only to the page being moved,
   never to the whole interface, so fast navigation stays stable on phones. */
(function () {
  'use strict';
  if (window.__movily_smooth) return;
  window.__movily_smooth = true;

  var ID = 'movily-smooth-css';
  var MOTION = 'movily-motion';
  var ENTER = 'movily-page-enter';
  var EXIT = 'movily-page-exit';
  var HOLD = 'movily-page-hold';
  var DURATION = 260;
  var EASE = 'cubic-bezier(.22,.61,.36,1)';
  var previous = null;
  var activeObserver = null;
  var cleanupTimer = 0;
  var finishTimer = 0;

  function addCss() {
    if (document.getElementById(ID)) return;
    var style = document.createElement('style');
    style.id = ID;
    style.textContent = [
      /* Lampa's body fade creates a second animation and a dark flash. */
      'body .activity__body{transition:none!important;animation:none!important}',
      'body .activity--load .activity__body{opacity:0}',
      'body .activity{transition:none!important;will-change:auto}',
      'body .activity:not(.activity--active){pointer-events:none}',
      'body.' + MOTION + ' .activity.' + HOLD + '{z-index:1!important;opacity:1!important;filter:none!important;transform:none!important;will-change:auto}',

      /* Incoming page: subtle lift, scale and motion blur. */
      'body.' + MOTION + ' .activity.' + ENTER + '{z-index:2!important;opacity:1!important;animation:movily-page-in ' + DURATION + 'ms ' + EASE + ' both;will-change:transform,opacity}',
      'body.' + MOTION + ' .activity.' + ENTER + '.activity--load{opacity:0!important;animation:none;will-change:auto}',
      '@keyframes movily-page-in{0%{opacity:0;transform:translate3d(0,14px,0)}100%{opacity:1;transform:translate3d(0,0,0)}}',

      /* Outgoing page: stays visible until the incoming page is ready. */
      'body.' + MOTION + ' .activity.' + EXIT + '{z-index:1!important;opacity:1!important;animation:movily-page-out ' + Math.round(DURATION * .7) + 'ms ' + EASE + ' forwards;will-change:transform,opacity;pointer-events:none}',
      '@keyframes movily-page-out{0%{opacity:1}100%{opacity:0}}',

      /* Blur is restricted to the two moving activity layers, not every glass element. */
      'body.' + MOTION + ' .activity.' + ENTER + ' *,body.' + MOTION + ' .activity.' + EXIT + ' *{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
      '@media (prefers-reduced-motion:reduce){body .activity.' + ENTER + ',body .activity.' + EXIT + '{animation:none!important;filter:none!important;transform:none!important;transition:none!important}body .activity.' + ENTER + '.activity--load{opacity:0!important}}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function clearPageClasses(el) {
    if (!el || !el.classList) return;
    el.classList.remove(ENTER, EXIT, HOLD);
  }

  function stopMotion() {
    clearTimeout(cleanupTimer);
    clearTimeout(finishTimer);
    if (activeObserver) { activeObserver.disconnect(); activeObserver = null; }
    if (previous) clearPageClasses(previous);
    var slides = document.querySelector('.activitys__slides');
    if (slides) Array.prototype.forEach.call(slides.children, clearPageClasses);
    previous = null;
    if (document.body) document.body.classList.remove(MOTION);
  }

  function finish(next) {
    if (!next || next.classList.contains('activity--load')) return false;
    if (previous && previous !== next) {
      previous.classList.remove(HOLD, EXIT);
      previous.classList.add(EXIT);
    }
    next.classList.add(ENTER);
    clearTimeout(cleanupTimer);
    cleanupTimer = setTimeout(function () {
      if (previous) clearPageClasses(previous);
      clearPageClasses(next);
      if (document.body) document.body.classList.remove(MOTION);
      previous = null;
    }, DURATION + 180);
    return true;
  }

  function animate(next, old) {
    if (!document.body || !next) return;
    clearTimeout(finishTimer);
    if (activeObserver) { activeObserver.disconnect(); activeObserver = null; }
    document.body.classList.add(MOTION);
    if (previous && previous !== old) clearPageClasses(previous);
    previous = old && old !== next ? old : null;
    if (previous) {
      previous.classList.remove(ENTER);
      /* It remains visible while the next activity is loading. */
      previous.classList.remove(EXIT);
      previous.classList.add(HOLD);
    }

    if (!next.classList.contains('activity--load')) {
      finish(next);
      return;
    }

    /* Wait for data, then crossfade. This removes the empty/dark flash on slow sources. */
    var slides = document.querySelector('.activitys__slides');
    if (slides && window.MutationObserver) {
      activeObserver = new MutationObserver(function () {
        var current = slides.querySelector('.activity--active');
        if (current && !current.classList.contains('activity--load')) {
          activeObserver.disconnect();
          activeObserver = null;
          finish(current);
        }
      });
      activeObserver.observe(slides, { attributes: true, attributeFilter: ['class'], subtree: true });
    }
    finishTimer = setTimeout(function () {
      var current = document.querySelector('.activity--active');
      if (current) finish(current);
    }, 4000);
  }

  function hook() {
    try {
      if (!window.Lampa || !Lampa.Listener || !Lampa.Activity) return false;
      Lampa.Listener.follow('activity', function (event) {
        if (!event || (event.type !== 'start' && event.type !== 'destroy')) return;
        var next = document.querySelector('.activity--active');
        if (next) animate(next, previous);
      });

      var activity = Lampa.Activity;
      ['push', 'replace', 'backward'].forEach(function (name) {
        var original = activity[name];
        if (typeof original !== 'function' || original.__movilySmooth) return;
        activity[name] = function () {
          var old = document.querySelector('.activity--active');
          var result = original.apply(this, arguments);
          var next = document.querySelector('.activity--active');
          if (next) animate(next, old);
          return result;
        };
        activity[name].__movilySmooth = true;
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  addCss();
  if (!hook()) {
    var tries = 0;
    var timer = setInterval(function () {
      if (hook() || ++tries > 40) clearInterval(timer);
    }, 250);
  }
})();
