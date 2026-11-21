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
      'body.stv .full-start-new__title.stv-has-logo,body.stv .full-start-new__title.stv-logo-pending{font-size:clamp(16px,4.6vw,22px)!important;line-height:1.2!important;color:#fff!important;font-weight:800!important;text-align:center;display:flex!important;flex-direction:column-reverse;align-items:center;gap:8px;min-height:clamp(92px,14vw,150px)!important;box-sizing:border-box}',
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
      'body.stv .navigation-bar .navigation-bar__body{height:calc(36px*var(--snack-hs,1))!important;min-height:0!important;max-height:none!important;padding:calc(3px*var(--snack-hs,1))!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;position:static!important;left:auto!important;top:auto!important;transform:none!important;max-width:100%;overflow:hidden;flex-shrink:1;min-width:0;margin:0;border-radius:999px;background:rgba(28,28,31,.8)!important;border:1.5px solid rgba(255,255,255,.14)!important;box-shadow:0 10px 30px rgba(0,0,0,.4)!important;-webkit-backdrop-filter:blur(16px) saturate(1.4)!important;backdrop-filter:blur(16px) saturate(1.4)!important}',
      /* LANDSCAPE: Lampa's frameUpdate() takes the .navigation-bar's width off every page (it expects the bar as a
         column at the right edge). Our bar spans the header, so pages were left (screen - bar) wide: ~146px on a
         phone, the episodes list squeezed into the left corner. So: the bar is 0 wide at the screen's centre, and
         the pill is centred on it, as wide as the strip between the burger and the clock allows. */
      'body.stv.orientation--landscape .navigation-bar{left:50%!important;right:auto!important;width:0!important;min-width:0!important;display:block!important;padding:0!important}',
      'body.stv.orientation--landscape .navigation-bar .navigation-bar__body{position:absolute!important;top:calc(-18px*var(--snack-hs,1))!important;left:0!important;transform:translateX(-50%)!important;width:max-content;max-width:calc(100vw - var(--snack-hdr-l) - var(--snack-hdr-r))}',
      'body.stv .navigation-bar .navigation-bar__item{height:calc(28px*var(--snack-hs,1))!important;margin:0 1px!important;box-sizing:border-box!important;padding-top:0!important;padding-bottom:0!important;border-radius:16px!important;background:transparent!important;color:rgba(255,255,255,.62)!important;transition:background .3s,color .3s,transform .25s cubic-bezier(.3,1.5,.5,1)}',
      'body.stv .navigation-bar .navigation-bar__item:active{transform:scale(.94);background:rgba(255,255,255,.17)!important}',
      'body.stv .navigation-bar .navigation-bar__body{position:relative!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important;justify-content:flex-start!important;gap:2px!important}',
      'body.stv .navigation-bar .navigation-bar__body::-webkit-scrollbar{display:none}',
      'body.stv .navigation-bar .navigation-bar__body:before{content:;position:absolute;left:3px;top:calc(4px*var(--snack-hs,1));height:calc(26px*var(--snack-hs,1));width:var(--movily-pill-w,0);transform:translateX(var(--movily-pill-x,0));border-radius:16px;background:rgba(255,255,255,.17);pointer-events:none;z-index:0;opacity:0;transition:transform .42s cubic-bezier(.3,1.25,.5,1),width .42s cubic-bezier(.3,1.25,.5,1),opacity .2s}',
      'body.stv .navigation-bar .navigation-bar__body.movily-nav-pill-ready:before{opacity:1}',
      'body.stv .navigation-bar .navigation-bar__item{position:relative!important;z-index:1!important;flex:0 0 auto!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:calc(5px*var(--snack-hs,1))!important;padding-left:calc(10px*var(--snack-hs,1))!important;padding-right:calc(10px*var(--snack-hs,1))!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=back]{order:0!important;width:calc(30px*var(--snack-hs,1))!important;padding:0!important;margin-right:2px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]{order:1!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=feed],body.stv .navigation-bar .navigation-bar__item[data-action=shorts]{order:2!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=settings]{order:3!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]{order:4!important;border-left:1px solid rgba(255,255,255,.14)!important;margin-left:4px!important;padding-left:10px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search] .navigation-bar__label,body.stv .navigation-bar .navigation-bar__item[data-action=back] .navigation-bar__label{display:none!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main] .navigation-bar__icon,body.stv .navigation-bar .navigation-bar__item[data-action=settings] .navigation-bar__icon{display:block!important;width:18px!important;height:18px!important;margin:0!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main] .navigation-bar__label,body.stv .navigation-bar .navigation-bar__item[data-action=settings] .navigation-bar__label{display:block!important;margin:0!important}',
      'body.stv .navigation-bar .navigation-bar__item.movily-nav-pop .navigation-bar__icon{animation:movily-nav-hop .5s}',
      '@keyframes movily-nav-hop{35%{transform:translateY(-4px) scale(1.15)}70%{transform:translateY(1px)}}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main] .navigation-bar__icon,body.stv .navigation-bar .navigation-bar__item[data-action=settings] .navigation-bar__icon{display:block!important;width:18px!important;height:18px!important;margin-right:7px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main],body.stv .navigation-bar .navigation-bar__item[data-action=settings]{padding-left:13px!important;padding-right:13px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]{border-left:1px solid rgba(255,255,255,.14)!important;margin-left:5px!important;padding-left:10px!important}',
      'body.stv.stv-at-main:not(.settings--open):not(.search--open) .navigation-bar .navigation-bar__item[data-action=main],body.stv.settings--open .navigation-bar .navigation-bar__item[data-action=settings],body.stv.search--open .navigation-bar .navigation-bar__item[data-action=search]{background:rgba(255,255,255,.17)!important;color:#fff!important}',
      'body.stv .navigation-bar .navigation-bar__label{font-size:calc(15px*var(--snack-hs,1))!important}',
      'body.stv .navigation-bar .navigation-bar__icon{width:calc(18px*var(--snack-hs,1))!important;height:calc(18px*var(--snack-hs,1))!important}',
      'body.stv .navigation-bar .navigation-bar__item{min-width:0;flex:0 1 auto;white-space:nowrap}',
      'body.stv .navigation-bar .navigation-bar__label{overflow:hidden;text-overflow:ellipsis}',
      '@media (max-width:430px){body.stv{--snack-hdr-l:calc(10px + 36px*var(--snack-hs,1) + 8px);--snack-hdr-r:calc(10px + var(--snack-dock-w,92px)*var(--snack-hs,1) + 8px)}body.stv .navigation-bar .navigation-bar__item{padding:0 8px!important;margin:0 1px!important}body.stv .navigation-bar .navigation-bar__item[data-action=back],body.stv .navigation-bar .navigation-bar__item[data-action=search]{padding:0 7px!important}body.stv .navigation-bar .navigation-bar__label{font-size:calc(14px*var(--snack-hs,1))!important;overflow:visible!important;text-overflow:clip!important}}',
      '@media (max-width:380px){body.stv .navigation-bar .navigation-bar__item{padding:0 6px!important}body.stv .navigation-bar .navigation-bar__item[data-action=back],body.stv .navigation-bar .navigation-bar__item[data-action=search]{padding:0 4px!important}body.stv .navigation-bar .navigation-bar__label{font-size:calc(13px*var(--snack-hs,1))!important}}',
      /* nothing from AgNative's own top bar may show next to Snack TV */
      'body.stv .agnative-topnav-shell,body.stv .agnative-topnav-rightdock,body.stv #agnative-topnav-clock,body.stv .agnative-control-panel,body.stv .agnative-hero{display:none!important}',
      /* The centered navigation pill is the primary Movily navigation. Final look = the reference mockup:
         dark glass capsule 46px high, 32px round items, 14px/600 labels, dim inactive text, white active text on a
         light chip, a thin divider before the round search button. Declared last so it wins over the rules above. */
      'body.stv{--mv-cap:rgba(28,28,31,.8);--mv-edge:rgba(255,255,255,.14);--mv-chip:rgba(255,255,255,.17);--mv-dim:rgba(255,255,255,.62)}',
      'body.stv .navigation-bar{top:calc(env(safe-area-inset-top,0px) + 2em + 5px)!important}',
      'body.stv .navigation-bar .navigation-bar__body{height:46px!important;padding:0 6px 0 4px!important;gap:4px;border-radius:23px!important;background:var(--mv-cap)!important;border:1.5px solid var(--mv-edge)!important;box-shadow:0 10px 30px rgba(0,0,0,.4)!important;-webkit-backdrop-filter:blur(16px) saturate(1.4)!important;backdrop-filter:blur(16px) saturate(1.4)!important;position:static!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none;-webkit-overflow-scrolling:touch;justify-content:flex-start}',
      'body.stv .navigation-bar .navigation-bar__body::-webkit-scrollbar{display:none}',
      'body.stv .navigation-bar .navigation-bar__item{height:32px!important;padding:0 13px!important;margin:0!important;border-radius:16px!important;background:transparent!important;color:var(--mv-dim)!important;display:flex!important;align-items:center!important;gap:7px;flex:none!important;font-weight:600}',
      'body.stv .navigation-bar .navigation-bar__label{font-size:14px!important;font-weight:600!important;margin:0!important;overflow:visible!important;text-overflow:clip!important}',
      'body.stv .navigation-bar .navigation-bar__icon{display:block!important;width:18px!important;height:18px!important;margin:0!important;flex:none}',
      'body.stv .navigation-bar .navigation-bar__icon svg{width:18px!important;height:18px!important;fill:currentColor}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=back]{order:-1;width:34px;height:34px!important;padding:0!important;justify-content:center;border-radius:17px!important;color:#fff!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=back] .navigation-bar__label,body.stv .navigation-bar .navigation-bar__item[data-action=search] .navigation-bar__label{display:none!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]{order:1}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=settings]{order:2}',
      /* divider + round search button, fixed on the right */
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]{order:4;width:38px;padding:0!important;justify-content:center;margin:0 0 0 9px!important;border-left:0!important;position:relative;color:var(--mv-dim)!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]:before{content:"";position:absolute;left:-5px;top:50%;width:1px;height:20px;margin-top:-10px;background:var(--mv-edge)}',
      'body.stv .navigation-bar .navigation-bar__item:active,body.stv .navigation-bar .navigation-bar__item.focus{background:var(--mv-chip)!important;transform:scale(.94)}',
      'body.stv.stv-at-main:not(.settings--open):not(.search--open) .navigation-bar .navigation-bar__item[data-action=main],body.stv.settings--open .navigation-bar .navigation-bar__item[data-action=settings],body.stv.search--open .navigation-bar .navigation-bar__item[data-action=search]{background:var(--mv-chip)!important;color:#fff!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main],body.stv .navigation-bar .navigation-bar__item[data-action=settings]{padding:0 11px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main] .navigation-bar__icon,body.stv .navigation-bar .navigation-bar__item[data-action=settings] .navigation-bar__icon{margin:0!important}',
      /* the tabs scroll between the pinned Back (left) and Search (right), like the reference rail */
      'body.stv .navigation-bar .navigation-bar__item[data-action=back]{position:sticky!important;left:0;z-index:2;background:var(--mv-cap)!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]{position:relative!important;z-index:2;order:9!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search].stv-on,body.stv.search--open .navigation-bar .navigation-bar__item[data-action=search]{background:var(--mv-chip)!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]{margin-left:2px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=settings]{margin-right:6px!important}',
      /* PHONE: the strip between the burger and the clock is ~250px, so the inactive tabs show only the icon and the
         active tab also shows its label (Home, Shorts, Settings, Search all fit without overlapping). */
      '@media (max-width:600px){',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]:not(.mv-active) .navigation-bar__label,body.stv .navigation-bar .navigation-bar__item[data-action=settings]:not(.mv-active) .navigation-bar__label,body.stv .navigation-bar .navigation-bar__item[data-action=shorts]:not(.mv-on) .navigation-bar__label{display:none!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]:not(.mv-active),body.stv .navigation-bar .navigation-bar__item[data-action=settings]:not(.mv-active),body.stv .navigation-bar .navigation-bar__item[data-action=shorts]:not(.mv-on){width:30px;padding:0!important;justify-content:center}',
      'body.stv .navigation-bar .navigation-bar__body{gap:1px!important;padding:0 3px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=back]{width:30px!important;height:30px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main].mv-active,body.stv .navigation-bar .navigation-bar__item[data-action=settings].mv-active{padding:0 9px!important;gap:4px}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]{margin-left:4px!important;width:30px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]:before{left:-3px!important}',
      'body.stv .navigation-bar .navigation-bar__label{font-size:13px!important}',
      '}',
      /* Reference size: the old menu used width:min(290px, calc(100% - 24px)). Keep the top capsule at that
         same fixed size instead of shrinking it to the gap between the side controls. */
      'body.stv .navigation-bar{left:50%!important;right:auto!important;width:min(290px,calc(100vw - 24px))!important;transform:translateX(-50%)!important}',
      'body.stv .navigation-bar .navigation-bar__body{width:100%!important;max-width:none!important;box-sizing:border-box!important}',
      '@media (orientation:landscape){body.stv .navigation-bar{left:50%!important;right:auto!important;width:min(290px,calc(100vw - 24px))!important;transform:translateX(-50%)!important}}',
      /* COMPACT PHONE REFERENCE: the supplied screenshot uses a 205px x 29px capsule. The side buttons stay
         outside it. Main and Settings are text tabs, Back and Search remain icon-only. */
      '@media (max-width:600px){body.stv .navigation-bar{width:205px!important;max-width:calc(100vw - 24px)!important}',
      'body.stv .navigation-bar .navigation-bar__body{height:29px!important;min-height:29px!important;padding:0 4px!important;border-radius:15px!important;gap:1px!important;overflow-x:auto!important;overflow-y:hidden!important}',
      'body.stv .navigation-bar .navigation-bar__item{height:25px!important;border-radius:13px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=back]{width:27px!important;height:27px!important;flex:0 0 27px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=back] .navigation-bar__icon,body.stv .navigation-bar .navigation-bar__item[data-action=search] .navigation-bar__icon{width:17px!important;height:17px!important;margin:0!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main],body.stv .navigation-bar .navigation-bar__item[data-action=settings]{height:25px!important;padding:0 8px!important;flex:0 0 auto!important;gap:0!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main] .navigation-bar__label,body.stv .navigation-bar .navigation-bar__item[data-action=settings] .navigation-bar__label{display:block!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]:not(.mv-active) .navigation-bar__label,body.stv .navigation-bar .navigation-bar__item[data-action=settings]:not(.mv-active) .navigation-bar__label{display:block!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]:not(.mv-active),body.stv .navigation-bar .navigation-bar__item[data-action=settings]:not(.mv-active){width:auto!important;max-width:none!important;padding:0 8px!important;justify-content:center}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main] .navigation-bar__icon,body.stv .navigation-bar .navigation-bar__item[data-action=settings] .navigation-bar__icon{display:none!important}',
      'body.stv .navigation-bar .navigation-bar__label{font-size:13px!important;line-height:25px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=shorts]{width:27px!important;padding:0!important;flex:0 0 27px!important;justify-content:center}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=shorts] .navigation-bar__label{display:none!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=shorts] .navigation-bar__icon{width:16px!important;height:16px!important;margin:0!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]{width:27px!important;margin-left:3px!important;padding:0!important;flex:0 0 27px!important;position:sticky!important;right:0!important;z-index:3;background:var(--mv-cap)!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]:before{left:-2px!important;height:17px!important;margin-top:-8px!important}',
      '}',
      /* PHONE: take the full strip between the burger and the clock/profile (gaps 6px), so all five items fit */
      '@media (max-width:600px){body.stv{--snack-hdr-l:calc(10px + 36px*var(--snack-hs,1) + 8px);--snack-hdr-r:calc(10px + var(--snack-dock-w,92px)*var(--snack-hs,1) + 8px)}}',
      /* header buttons (burger, clock/profile) at the same vertical centre as the 46px capsule */
      'body.stv.true--mobile .head__menu-icon,body.stv .head__menu-icon{top:calc(env(safe-area-inset-top,0px) + 2em - 14px*var(--snack-hs,1))!important}',
      '#' + DOCK_ID + '{top:calc(env(safe-area-inset-top,0px) + 2em - 14px*var(--snack-hs,1))}',
      'body.stv.orientation--landscape .navigation-bar .navigation-bar__body{top:-23px!important}',
      '@media (max-width:430px){body.stv .navigation-bar .navigation-bar__item,body.stv .navigation-bar .navigation-bar__item[data-action=main],body.stv .navigation-bar .navigation-bar__item[data-action=settings]{padding:0 8px!important;gap:5px}body.stv .navigation-bar .navigation-bar__icon,body.stv .navigation-bar .navigation-bar__icon svg{width:17px!important;height:17px!important}body.stv .navigation-bar .navigation-bar__item[data-action=search]{width:32px!important;margin-left:6px!important}body.stv .navigation-bar .navigation-bar__item[data-action=back],body.stv .navigation-bar .navigation-bar__item[data-action=search]{padding:0!important}body.stv .navigation-bar .navigation-bar__label{font-size:13px!important}}',
      /* Keep the mobile capsule inside the real space between the logo and the measured clock/profile dock. */
      '@media (max-width:600px){body.stv .navigation-bar{left:var(--snack-hdr-l)!important;right:var(--snack-hdr-r)!important;width:auto!important;max-width:none!important;transform:none!important}',
      'body.stv .navigation-bar .navigation-bar__body{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;gap:2px!important;padding:0 3px!important}',
      /* Only the selected destination needs a label on phones; the other destinations stay available as clear icons. */
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]:not(.mv-active) .navigation-bar__label,body.stv .navigation-bar .navigation-bar__item[data-action=settings]:not(.mv-active) .navigation-bar__label{display:none!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main]:not(.mv-active),body.stv .navigation-bar .navigation-bar__item[data-action=settings]:not(.mv-active){width:27px!important;max-width:27px!important;padding:0!important;flex:0 0 27px!important;justify-content:center!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main] .navigation-bar__icon,body.stv .navigation-bar .navigation-bar__item[data-action=settings] .navigation-bar__icon{display:block!important;width:17px!important;height:17px!important;margin:0!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main].mv-active .navigation-bar__icon,body.stv .navigation-bar .navigation-bar__item[data-action=settings].mv-active .navigation-bar__icon{display:none!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=main].mv-active,body.stv .navigation-bar .navigation-bar__item[data-action=settings].mv-active{width:auto!important;max-width:none!important;padding:0 8px!important;flex:0 0 auto!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=search]{width:27px!important;margin-left:4px!important;flex:0 0 27px!important}',
      'body.stv .navigation-bar .navigation-bar__item[data-action=back]{width:27px!important;flex:0 0 27px!important}',
      '}',
      ''
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

  function navModel() {
    var nav = qs('.navigation-bar'), body = nav && qs('.navigation-bar__body', nav);
    if (!body) return;
    body.setAttribute('data-movily-model', 'v5');
    if (!qs('.movily-nav-pill', body)) {
      var pill = document.createElement('span');
      pill.className = 'movily-nav-pill';
      pill.setAttribute('aria-hidden', 'true');
      body.appendChild(pill);
    }
    var items = body.querySelectorAll('.navigation-bar__item');
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute('data-movily-bound') !== '1') {
        items[i].setAttribute('data-movily-bound', '1');
        items[i].addEventListener('click', function () {
          this.classList.remove('movily-nav-pop');
          void this.offsetWidth;
          this.classList.add('movily-nav-pop');
          setTimeout(function (el) { el.classList.remove('movily-nav-pop'); }, 550, this);
        });
      }
    }
    var action = 'main';
    if (document.body.classList.contains('settings--open')) action = 'settings';
    else if (document.body.classList.contains('search--open')) action = 'search';
    else {
      try {
        var a = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
        var c = String(a && (a.component || (a.activity && a.activity.component) || '') || '').toLowerCase();
        if (c === 'feed' || c === 'shorts') action = 'feed';
      } catch (e) {}
    }
    var active = null;
    for (var j = 0; j < items.length; j++) {
      var is = items[j].getAttribute('data-action') === action || (action === 'feed' && items[j].getAttribute('data-action') === 'shorts');
      items[j].classList.toggle('movily-nav-active', is);
      if (is) active = items[j];
    }
    if (active) {
      var x = active.offsetLeft - 3, w = active.offsetWidth;
      body.style.setProperty('--movily-pill-x', x + 'px');
      body.style.setProperty('--movily-pill-w', w + 'px');
      body.classList.add('movily-nav-pill-ready');
      if (active.offsetLeft < body.scrollLeft || active.offsetLeft + w > body.scrollLeft + body.clientWidth) {
        body.scrollLeft = Math.max(0, active.offsetLeft - (body.clientWidth - w) / 2);
      }
    }
  }

  function ensure() {
    var head = qs('.head');
    if (!head || !document.body || !document.body.classList.contains('stv')) {
      var old = document.getElementById(DOCK_ID);
      if (old && (!document.body || !document.body.classList.contains('stv'))) old.remove();
      return;
    }
    css();
    navModel();
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
    setInterval(navModel, 450);
  }

  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
