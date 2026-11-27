/* Snack TV header controls: clock + profile button on the right of the header.
   The left menu (burger) is Lampa's own .head__menu-icon, kept visible by Snack TV itself.
   Standalone. */
(function () {
  'use strict';
  if (window.__snack_header_ready) return;
  window.__snack_header_ready = true;

  var CSS_ID = 'snack-header-css';
  var DOCK_ID = 'snack-header-dock';
  var CLOCK_ID = 'snack-header-clock';
  var PROFILE_ID = 'snack-header-profile';
  var ICON = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4.1" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-3.9 3.8-6 8-6s8 2.1 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function css() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style');
    s.id = CSS_ID;
    s.textContent = [
      '#' + DOCK_ID + '{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 2em - 18px*var(--snack-hs,1));z-index:20;display:flex;align-items:center;gap:0;height:36px;box-sizing:border-box;padding:0 4px 0 0;border-radius:999px;background:rgba(40,40,46,.55);border:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 0 0 1px rgba(255,255,255,.07);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%)}',
      '#' + DOCK_ID + ' .snack-hbtn{display:inline-flex;align-items:center;justify-content:center;height:34px;box-sizing:border-box;border-radius:999px;color:#fff;background:transparent;border:0;box-shadow:none;cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '#' + CLOCK_ID + '{min-width:0;padding:0 8px 0 13px;font-size:14px;font-weight:700;letter-spacing:.01em;font-variant-numeric:tabular-nums}',
      '#' + PROFILE_ID + '{width:30px;padding:0;overflow:hidden}',
      '#' + PROFILE_ID + ' svg{width:18px;height:18px}',
      '#' + PROFILE_ID + ' img{width:24px;height:24px;border-radius:999px;object-fit:cover;display:block}',
      '#' + DOCK_ID + ' .snack-hbtn.focus,#' + DOCK_ID + ' .snack-hbtn.hover{background:rgba(255,255,255,.22)}',
      /* the left menu button: same glass capsule */
      'body.stv.true--mobile .head__menu-icon,body.stv.mouse--controll .head__menu-icon,body.stv .head__menu-icon{display:flex!important;align-items:center;justify-content:center;position:absolute!important;left:12px!important;top:calc(env(safe-area-inset-top,0px) + 2em - 18px*var(--snack-hs,1))!important;right:auto!important;bottom:auto!important;transform:none!important;width:36px!important;height:36px!important;min-width:0!important;margin:0!important;padding:0!important;box-sizing:border-box;border-radius:999px;background:rgba(40,40,46,.55);border:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 0 0 1px rgba(255,255,255,.07);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);z-index:20;overflow:hidden}',
      'body.stv.true--mobile .head__menu-icon svg,body.stv .head__menu-icon svg,body.stv .head__menu-icon img{display:block!important;position:static!important;width:18px!important;height:18px!important;max-width:18px!important;max-height:18px!important;margin:0!important;padding:0!important;transform:none!important;color:#fff;fill:#fff;flex:0 0 auto}',
      /* the left burger menu (Prisma build): the same glass as the centre pill and the buttons */
      'body.stv:not(.menu--always):not(.light--version) .wrap__left .menu,body.stv:not(.menu--always):not(.light--version) .menu{background:rgba(32,34,40,.82)!important;-webkit-backdrop-filter:blur(40px) saturate(160%)!important;backdrop-filter:blur(40px) saturate(160%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 0 0 1px rgba(255,255,255,.07)!important;border:0!important;overflow:hidden}',
      /* the floating left dock (burger menu with the letter icons): the same glass */
      'body.stv .agnative-leftdock,body.stv[data-agnative-perf="low"] .agnative-leftdock,body.stv[data-agnative-perf="ultra"] .agnative-leftdock{background:rgba(32,34,40,.82)!important;-webkit-backdrop-filter:blur(40px) saturate(160%)!important;backdrop-filter:blur(40px) saturate(160%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 0 0 1px rgba(255,255,255,.07)!important;border:0!important}',
      'body.stv .menu .menu__header{background:transparent!important;border-bottom:1px solid rgba(255,255,255,.10)!important}',
      'body.stv .menu .menu__case,body.stv .menu .menu__list{background:transparent!important}',
      /* the header\'s own right-hand items stay out of the way */
      'body.stv .head__actions,body.stv .head__action{display:none!important}',
      /* full card order: logo, then the text title under it, then the reactions in ONE row, then the rest */
      'body.stv .full-start-new__title.stv-has-logo,body.stv .full-start-new__title.stv-logo-pending{font-size:clamp(16px,4.6vw,22px)!important;line-height:1.2!important;color:#fff!important;font-weight:800!important;text-align:center;display:flex!important;flex-direction:column-reverse;align-items:center;gap:8px;min-height:0!important;justify-content:flex-end;margin-bottom:10px!important;box-sizing:border-box}',
      'body.stv .full-start-new__title.stv-has-logo .stv-logo{margin:0 auto!important;object-position:center bottom!important}',
      /* the reactions come right after the title block (under logo + text), never above it */
      'body.stv .full-start-new__right{display:flex!important;flex-direction:column}',
      'body.stv .full-start-new__title{order:1!important}',
      'body.stv .full-start-new__reactions{order:2!important;display:flex!important;flex-wrap:nowrap!important;justify-content:center;align-items:center;gap:6px;margin:0 0 12px!important;min-height:0!important;width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none}',
      'body.stv .full-start-new__reactions::-webkit-scrollbar{display:none}',
      'body.stv .full-start-new__reactions > div{flex:0 0 auto;padding:0!important;margin:0!important}',
      'body.stv .full-start-new__reactions .reaction{white-space:nowrap}',
      'body.stv .stv-meta{order:3!important}',
      'body.stv .full-start-new__buttons{order:4!important}',
      'body.stv .stv-desc{order:5!important}',
      /* the size setting (Agnative > Top bar > size) scales the burger and the clock/profile pill */
      'body.stv{--snack-hs:1}',
      'body.stv[data-agnative-topnav-size="xs"]{--snack-hs:.8}',
      'body.stv[data-agnative-topnav-size="sm"]{--snack-hs:.9}',
      'body.stv[data-agnative-topnav-size="md"]{--snack-hs:1}',
      'body.stv[data-agnative-topnav-size="lg"]{--snack-hs:1.15}',
      'body.stv[data-agnative-topnav-size="xl"]{--snack-hs:1.3}',
      '#' + DOCK_ID + '{transform:scale(var(--snack-hs,1));transform-origin:top right}',
      'body.stv.true--mobile .head__menu-icon,body.stv .head__menu-icon{transform:scale(var(--snack-hs,1))!important;transform-origin:top left}',
      /* ONE ROW: burger | nav pill | clock + profile. The pill lives in the strip between the burger and the
         clock: centred there, it shrinks (smaller padding and text) to fit, so nothing overlaps. */
      'body.stv{--snack-hdr-l:calc(12px + 36px*var(--snack-hs,1) + 10px);--snack-hdr-r:calc(12px + var(--snack-dock-w,96px)*var(--snack-hs,1) + 10px)}',
      'body.stv .navigation-bar{left:var(--snack-hdr-l)!important;right:var(--snack-hdr-r)!important;width:auto!important;top:calc(env(safe-area-inset-top,0px) + 2em)!important;height:0!important;display:flex!important;justify-content:center;align-items:center;overflow:visible}',
      'body.stv .navigation-bar .navigation-bar__body{height:calc(36px*var(--snack-hs,1))!important;min-height:0!important;max-height:none!important;padding:calc(3px*var(--snack-hs,1))!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;position:static!important;left:auto!important;top:auto!important;transform:none!important;max-width:100%;overflow:hidden;flex-shrink:1;min-width:0;margin:0;border-radius:999px}',
      /* LANDSCAPE: Lampa's frameUpdate() takes the .navigation-bar's width off every page (it expects the bar as a
         column at the right edge). Our bar spans the header, so pages were left (screen - bar) wide: ~146px on a
         phone, the episodes list squeezed into the left corner. So: the bar is 0 wide at the screen's centre, and
         the pill is centred on it, as wide as the strip between the burger and the clock allows. */
      'body.stv.orientation--landscape .navigation-bar{left:50%!important;right:auto!important;width:0!important;min-width:0!important;display:block!important;padding:0!important}',
      'body.stv.orientation--landscape .navigation-bar .navigation-bar__body{position:absolute!important;top:calc(-18px*var(--snack-hs,1))!important;left:0!important;transform:translateX(-50%)!important;width:max-content;max-width:calc(100vw - var(--snack-hdr-l) - var(--snack-hdr-r))}',
      'body.stv .navigation-bar .navigation-bar__item{height:calc(28px*var(--snack-hs,1))!important;margin:0 1px!important;box-sizing:border-box!important;padding-top:0!important;padding-bottom:0!important}',
      'body.stv .navigation-bar .navigation-bar__label{font-size:calc(15px*var(--snack-hs,1))!important}',
      'body.stv .navigation-bar .navigation-bar__icon{width:calc(18px*var(--snack-hs,1))!important;height:calc(18px*var(--snack-hs,1))!important}',
      'body.stv .navigation-bar .navigation-bar__item{min-width:0;flex:0 1 auto;white-space:nowrap}',
      'body.stv .navigation-bar .navigation-bar__label{overflow:hidden;text-overflow:ellipsis}',
      '@media (max-width:430px){body.stv{--snack-hdr-l:calc(10px + 36px*var(--snack-hs,1) + 8px);--snack-hdr-r:calc(10px + var(--snack-dock-w,92px)*var(--snack-hs,1) + 8px)}body.stv .navigation-bar .navigation-bar__item{padding:0 8px!important;margin:0 1px!important}body.stv .navigation-bar .navigation-bar__item[data-action=back],body.stv .navigation-bar .navigation-bar__item[data-action=search]{padding:0 7px!important}body.stv .navigation-bar .navigation-bar__label{font-size:calc(14px*var(--snack-hs,1))!important;overflow:visible!important;text-overflow:clip!important}}',
      '@media (max-width:380px){body.stv .navigation-bar .navigation-bar__item{padding:0 6px!important}body.stv .navigation-bar .navigation-bar__item[data-action=back],body.stv .navigation-bar .navigation-bar__item[data-action=search]{padding:0 4px!important}body.stv .navigation-bar .navigation-bar__label{font-size:calc(13px*var(--snack-hs,1))!important}}',
      /* nothing from AgNative's own top bar may show next to Snack TV */
      'body.stv .agnative-topnav-shell,body.stv .agnative-topnav-rightdock,body.stv #agnative-topnav-clock,body.stv .agnative-control-panel,body.stv .agnative-hero{display:none!important}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }

  function profileHtml() {
    try {
      var acc = window.Lampa && Lampa.Account && Lampa.Account.Permit && Lampa.Account.Permit.account;
      var icon = acc && acc.profile && acc.profile.icon;
      var proto = Lampa.Utils && Lampa.Utils.protocol && Lampa.Utils.protocol();
      var dom = Lampa.Manifest && Lampa.Manifest.cub_domain;
      if (icon && proto && dom) return '<img src="' + proto + dom + '/img/profiles/' + icon + '.png" alt="">';
    } catch (e) {}
    return ICON;
  }

  function openProfiles() {
    try {
      if (window.Lampa && Lampa.Account && Lampa.Account.Profile && typeof Lampa.Account.Profile.select === 'function') {
        Lampa.Account.Profile.select(function () {
          try { Lampa.Controller.toggle('head'); } catch (e) {}
        });
        return;
      }
      var nat = qs('.open--profile,.open--syncpro-profile');
      if (nat) { nat.click(); return; }
      if (window.Lampa && Lampa.Settings && Lampa.Settings.open) Lampa.Settings.open('account');
    } catch (e) {}
  }

  function openSettings() {
    try { if (window.Lampa && Lampa.Settings && Lampa.Settings.open) Lampa.Settings.open(); } catch (e) {}
  }

  function bind(el, fn) {
    var busy = false;
    function run(ev) {
      if (busy) return;
      busy = true; setTimeout(function () { busy = false; }, 250);
      if (ev && ev.preventDefault) ev.preventDefault();
      fn();
    }
    el.addEventListener('click', run);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(e); });
    if (window.$) { try { $(el).on('hover:enter', run); } catch (e) {} }
  }

  function time() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function ensure() {
    var head = qs('.head');
    if (!head || !document.body || !document.body.classList.contains('stv')) {
      var old = document.getElementById(DOCK_ID);
      if (old && (!document.body || !document.body.classList.contains('stv'))) old.remove();
      return;
    }
    css();
    var dock = document.getElementById(DOCK_ID);
    if (!dock) {
      dock = document.createElement('div');
      dock.id = DOCK_ID;
      var clock = document.createElement('div');
      clock.id = CLOCK_ID;
      clock.className = 'snack-hbtn selector';
      clock.setAttribute('tabindex', '0');
      bind(clock, openSettings);
      var prof = document.createElement('div');
      prof.id = PROFILE_ID;
      prof.className = 'snack-hbtn selector';
      prof.setAttribute('tabindex', '0');
      prof.setAttribute('data-role', 'profile');
      bind(prof, openProfiles);
      dock.appendChild(clock);
      dock.appendChild(prof);
    }
    if (dock.parentNode !== head) head.appendChild(dock);
    try {
      var dw = Math.ceil(dock.offsetWidth || 0);
      if (dw && document.body.getAttribute('data-snack-dw') !== String(dw)) {
        document.body.setAttribute('data-snack-dw', String(dw));
        document.body.style.setProperty('--snack-dock-w', dw + 'px');
      }
    } catch (e) {}
    var c = document.getElementById(CLOCK_ID);
    var t = time();
    if (c && c.textContent !== t) c.textContent = t;
    var pr = document.getElementById(PROFILE_ID);
    var html = profileHtml();
    if (pr && pr.getAttribute('data-h') !== html) { pr.innerHTML = html; pr.setAttribute('data-h', html); }
  }

  /* full card: logo, then the text title under it, then ALL reactions in ONE row, then the rest.
     Done in the DOM with inline styles, so no theme rule can reorder it again. */
  function fixCard() {
    if (!document.body || !document.body.classList.contains('stv')) return;
    var cards = document.querySelectorAll('.full-start-new__right');
    for (var i = 0; i < cards.length; i++) {
      var right = cards[i];
      var title = right.querySelector('.full-start-new__title');
      var react = right.querySelector('.full-start-new__reactions');
      if (!title) continue;

      var logo = title.querySelector('.stv-logo');
      var text = title.querySelector('.snack-title-text');
      var kids = react ? react.children : [];
      var signature = [
        logo ? 'logo' : 'text',
        text ? text.textContent : '',
        react ? String(kids.length) : 'none',
        title.nextElementSibling === react ? 'moved' : 'unmoved'
      ].join('|');
      if (right.getAttribute('data-stv-card-layout') === signature) continue;

      /* Make the title layout idempotently. Never append to cssText on every pass. */
      if (logo && title.classList.contains('stv-has-logo')) {
        if (!text) {
          var node = null;
          for (var n = title.firstChild; n; n = n.nextSibling) {
            if (n.nodeType === 3 && n.nodeValue.trim()) { node = n; break; }
          }
          if (node) {
            text = document.createElement('div');
            text.className = 'snack-title-text';
            text.textContent = node.nodeValue.trim();
            title.removeChild(node);
            title.appendChild(text);
          }
        }
        title.style.display = 'flex';
        title.style.flexDirection = 'column';
        title.style.alignItems = 'center';
        title.style.fontSize = '0';
        logo.style.order = '1';
        if (text) {
          text.style.order = '2';
          text.style.fontSize = 'clamp(16px,4.6vw,22px)';
          text.style.lineHeight = '1.2';
          text.style.color = '#fff';
          text.style.fontWeight = '800';
          text.style.textAlign = 'center';
          text.style.marginTop = '8px';
        }
      }
      if (react) {
        if (title.nextElementSibling !== react) right.insertBefore(react, title.nextSibling);
        react.style.display = 'flex';
        react.style.flexWrap = 'nowrap';
        react.style.justifyContent = 'center';
        react.style.alignItems = 'center';
        react.style.gap = '6px';
        react.style.margin = '6px 0 12px';
        react.style.minHeight = '0';
        react.style.width = '100%';
        react.style.overflowX = 'auto';
        react.style.overflowY = 'hidden';
        react.style.webkitOverflowScrolling = 'touch';
        react.style.scrollbarWidth = 'none';
        for (var k = 0; k < kids.length; k++) {
          kids[k].style.flex = '0 0 auto';
          kids[k].style.padding = '0';
          kids[k].style.margin = '0';
        }
      }
      /* Re-read the position/count after the write and remember this exact layout. */
      right.setAttribute('data-stv-card-layout', [
        title.querySelector('.stv-logo') ? 'logo' : 'text',
        title.querySelector('.snack-title-text') ? title.querySelector('.snack-title-text').textContent : '',
        react ? String(react.children.length) : 'none',
        react && title.nextElementSibling === react ? 'moved' : 'unmoved'
      ].join('|'));
    }
  }

  function start() {
    ensure();
    fixCard();
    /* Do not poll the whole interface. New cards and navigation mutations are enough. */
    if (window.MutationObserver) {
      var t;
      new MutationObserver(function (mutations) {
        var relevant = false;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].type === 'childList' && mutations[i].addedNodes.length) { relevant = true; break; }
        }
        if (!relevant) return;
        clearTimeout(t);
        t = setTimeout(function () { ensure(); fixCard(); }, 120);
      }).observe(document.body, { childList: true, subtree: true });
    }
    if (window.Lampa && Lampa.Listener) Lampa.Listener.follow('activity', function (e) {
      if (e.type === 'start' || e.type === 'archive') setTimeout(function () { ensure(); fixCard(); }, 0);
    });
    if (window.Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') ensure(); });
  }

  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
