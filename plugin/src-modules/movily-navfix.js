/* Movily nav fix: no jerk when pressing «Головна» (or any Activity change).
   1) scrollTop = 0 for every .scroll BEFORE the switch, without animation
   2) .no-transition on <body> for 350 ms: kills transitions on .navigation-bar / .head / float-head
   3) one «Головна» transition at a time: spam clicks and a click on an already open Home are ignored */
(function () {
  'use strict';
  if (window.__movily_navfix) return;
  window.__movily_navfix = true;

  var CLS = 'no-transition';
  var HOLD_MS = 350;
  var LOCK_MS = 700;
  var offTimer = 0;
  var lockUntil = 0;

  function addCss() {
    if (document.getElementById('movily-navfix-css')) return;
    var s = document.createElement('style');
    s.id = 'movily-navfix-css';
    s.textContent = 'body.' + CLS + ' .navigation-bar,body.' + CLS + ' .navigation-bar *,body.' + CLS + ' .head,body.' + CLS + ' .head *,body.' + CLS + ' .wrap__content,body.' + CLS + ' .scroll,body.' + CLS + ' .scroll__body{transition:none!important}';
    (document.head || document.documentElement).appendChild(s);
  }

  function resetScroll() {
    var list = document.querySelectorAll('.scroll');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.classList.contains('scroll--horizontal')) continue;
      var body = el.querySelector('.scroll__body');
      if (body) { body.style.transition = 'none'; body.style.transform = 'translate3d(0,0,0)'; }
      el.scrollTop = 0;
    }
  }

  function freeze() {
    if (!document.body) return;
    document.body.classList.add(CLS);
    clearTimeout(offTimer);
    offTimer = setTimeout(function () { document.body.classList.remove(CLS); }, HOLD_MS);
  }

  function isMainNow() {
    try {
      var a = Lampa.Activity.active();
      return !!a && a.component === 'main';
    } catch (e) { return false; }
  }

  function wrapPush() {
    var A = window.Lampa && Lampa.Activity;
    if (!A || typeof A.push !== 'function' || A.push.__movilyNavfix) return false;
    var original = A.push;
    A.push = function (params) {
      var toMain = params && params.component === 'main';
      if (toMain) {
        var now = Date.now();
        if (now < lockUntil || isMainNow()) return; // already going to / already on Home
        lockUntil = now + LOCK_MS;
      }
      resetScroll();
      freeze();
      return original.apply(this, arguments);
    };
    A.push.__movilyNavfix = true;
    return true;
  }

  function init() {
    addCss();
    // backward / replace also swap the page: same treatment
    ['backward', 'replace'].forEach(function (n) {
      var A = window.Lampa && Lampa.Activity, f = A && A[n];
      if (typeof f !== 'function' || f.__movilyNavfix) return;
      A[n] = function () { resetScroll(); freeze(); return f.apply(this, arguments); };
      A[n].__movilyNavfix = true;
    });
    // belt and braces: Lampa's own 'start' event (the new page is shown)
    Lampa.Listener.follow('activity', function (e) {
      if (e && e.type === 'start') { resetScroll(); freeze(); }
    });
    return wrapPush();
  }

  var tries = 0, t = setInterval(function () {
    try { if (window.Lampa && Lampa.Activity && Lampa.Listener && init()) clearInterval(t); } catch (e) {}
    if (++tries > 60) clearInterval(t);
  }, 100);
})();
