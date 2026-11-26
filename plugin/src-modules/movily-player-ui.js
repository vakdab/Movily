/* Movily: вигляд вбудованого плеєра в стилі Apple TV / iOS («скляні» капсули).
   Нічого в DOM Lampa не переписується: існуюча панель (.player-panel) і шапка (.player-info) лише перестилізуються,
   тому пульт, фокус і всі події Lampa працюють як раніше. Додано три кнопки, яких у Lampa немає: «Закрити» (зверху зліва),
   «−10 с» і «+10 с» (по боках від play/pause). Кадр «Наступна серія», плейлист, налаштування, субтитри, звук, PiP,
   гучність і якість лишаються штатними кнопками Lampa, їх просто видно завжди і розкладено по місцях. */
(function () {
  'use strict';
  if (window.__movily_player_ui) return;
  window.__movily_player_ui = true;

  var STEP = 10;
  function L() { return window.Lampa; }

  var css = [
    /* ---- скло ---- */
    '.player-panel .player-panel__box-buttons,.player .mv-glass{background:rgba(60,60,60,.38)!important;-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);border:1px solid rgba(255,255,255,.12);box-shadow:0 4px 18px rgba(0,0,0,.25);border-radius:3em!important;}',
    '.player-panel .button{background:transparent;color:#fff;transition:background .15s,transform .15s;}',
    '.player-panel .button.focus,.player .mv-btn.focus{background:rgba(255,255,255,.28)!important;color:#fff!important;transform:scale(1.06);}',

    /* ---- вся панель на всю висоту, поверх відео; градієнти для читабельності ---- */
    '.player-panel{top:0;bottom:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,.45),rgba(0,0,0,0) 28%,rgba(0,0,0,0) 55%,rgba(0,0,0,.7));}',
    '.player-panel__body{position:absolute;inset:0;padding:max(1.2em,env(safe-area-inset-top)) max(1.6em,env(safe-area-inset-right)) max(1.1em,env(safe-area-inset-bottom)) max(1.6em,env(safe-area-inset-left));display:flex;flex-direction:column;justify-content:flex-end;font-size:1em;}',
    '.player-panel .selector,.player-panel .button,.player-panel__timeline,.mv-btn{pointer-events:auto;}',

    /* ---- apex («Наступна серія») залишається штатним, але лівіше над прогресом ---- */
    '.player-panel__apex{transform:none;margin-bottom:.4em;max-width:calc(50% - 7em);}',
    '.player-next__thumbnail{width:6.2em!important;min-width:6.2em;}',
    '.player-next__title{font-size:.8em;opacity:.7;}',
    '.player-next__episode-title{font-size:1.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:11em;}',
    '.player-next__episode{background:rgba(60,60,60,.42)!important;-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);border:1px solid rgba(255,255,255,.14);border-radius:1.1em!important;box-shadow:0 4px 18px rgba(0,0,0,.3);}',

    /* ---- центр: −10 / play-pause / +10 ---- */
    '.player-panel__line-two{display:block;position:static;font-size:1em!important;}',
    '.player-panel__center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:auto;display:flex;align-items:center;gap:2.6em;}',
    '.player-panel__center .player-panel__playpause{width:5.6em;height:5.6em;border-radius:50%!important;background:rgba(70,70,70,.45)!important;-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);border:1px solid rgba(255,255,255,.16);box-shadow:0 6px 24px rgba(0,0,0,.35);}',
    '.player-panel__center .player-panel__playpause svg{width:2.4em;height:2.4em;}',
    '.mv-skip{width:3.8em;height:3.8em;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(70,70,70,.42);-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);border:1px solid rgba(255,255,255,.14);color:#fff;position:relative;cursor:pointer;}',
    '.mv-skip svg{width:2.1em;height:2.1em;}',
    '.mv-skip span{position:absolute;font-size:.78em;font-weight:700;top:50%;left:50%;transform:translate(-50%,-44%);}',

    /* ---- низ: зліва плейлист/далі, справа субтитри/звук/налаштування, прогрес над ними ---- */
    '.player-panel__line-one{order:2;margin:.2em 0 .7em;}',
    '.player-panel__timeline{order:3;height:.35em;border-radius:1em;background:rgba(255,255,255,.28)!important;margin-bottom:.9em;}',
    '.player-panel__timeline.focus{height:.55em;}',
    '.player-panel__line-two{order:4;display:flex!important;align-items:center;justify-content:space-between;}',
    '.player-panel__line-two .player-panel__left,.player-panel__line-two .player-panel__right{width:auto;display:flex!important;align-items:center;gap:.6em;}',
    '.player-panel__line-two .player-panel__center{position:fixed!important;left:50%;top:50%;}',
    '.player-panel__line-two>.player-panel__right.player-panel__tv-visible{margin-left:auto;justify-content:flex-end;}',
    '.player-panel__line-two>.player-panel__left{margin-right:auto;}',

    /* ---- шапка: закрити + назва; час праворуч ---- */
    '.player-info{pointer-events:none;}',
    '.player-info__body{padding:max(1.2em,env(safe-area-inset-top)) max(1.6em,env(safe-area-inset-right)) 0 max(1.6em,env(safe-area-inset-left));}',
    '.player-info .head-backward{display:none!important;}',
    '.mv-top{position:fixed;z-index:5;top:max(1.2em,env(safe-area-inset-top));left:max(1.6em,env(safe-area-inset-left));display:flex;gap:.6em;align-items:center;transition:opacity .3s,transform .3s;opacity:0;transform:translateY(-1.5em);pointer-events:none;}',
    '.player--panel-visible .mv-top{opacity:1;transform:none;pointer-events:auto;}',
    '.mv-btn{width:3em;height:3em;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;cursor:pointer;}',
    '.mv-btn svg{width:1.4em;height:1.4em;}',
    '.player-info__title{font-size:1.9em;width:60%;margin-top:2.6em;}',
    '.player-info__name{display:none;}',

    /* ---- кнопки, які Lampa ховає на мобільному: плейлист і налаштування видно завжди ---- */
    'body.true--mobile .player-panel .player-panel__tv-visible{display:flex!important;}',
    'body.true--mobile .player-panel .player-panel__mobile-visible,.player-panel .player-panel__right.player-panel__mobile-visible{display:none!important;}',
    '.player-panel__box-buttons:has(>.player-panel__quality),.player-panel__box-buttons:empty,.player-panel__box-buttons:not(:has(.button:not(.hide))){display:none!important;}',
    '.player-panel__tv-visible .player-panel__quality,.player-panel__tv-visible .player-panel__fullscreen{display:none!important;}',
    '.player-panel__playlist-buttons{display:flex!important;}',
    '.player-panel__playlist-buttons.hide{display:none!important;}',
    '.player-panel__tv-visible .button.hide:not(.player-panel__playinfo){display:none!important;}',
    '.player-panel__tv-visible .player-panel__settings,.player-panel__tv-visible .player-panel__pip{display:flex!important;}',
    '.player-panel__tv-visible .player-panel__settings.hide,.player-panel__tv-visible .player-panel__pip.hide{display:none!important;}',
    '.player-panel__tv-visible .player-panel__volume{display:none!important;}',   /* гучність: як у референсі, окремий слайдер зверху */

    /* ---- гучність зверху справа ---- */
    '.mv-vol{position:fixed;z-index:5;top:max(1.2em,env(safe-area-inset-top));right:max(1.6em,env(safe-area-inset-right));display:flex;align-items:center;gap:.7em;padding:0 1.1em;height:3em;border-radius:3em;transition:opacity .3s,transform .3s;opacity:0;transform:translateY(-1.5em);pointer-events:none;color:#fff;}',
    '.player--panel-visible .mv-vol{opacity:1;transform:none;pointer-events:auto;}',
    '.mv-vol input{-webkit-appearance:none;appearance:none;width:9em;height:.35em;border-radius:1em;background:rgba(255,255,255,.3);outline:none;}',
    '.mv-vol input::-webkit-slider-thumb{-webkit-appearance:none;width:1em;height:1em;border-radius:50%;background:#fff;}',
    '.mv-vol svg{width:1.4em;height:1.4em;}'
  ].join('\n');

  function addStyle() {
    if (document.getElementById('movily-player-ui-style')) return;
    var s = document.createElement('style');
    s.id = 'movily-player-ui-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var ICON_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_REW = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6a10 10 0 1 1-9.5 7"/><path d="M6 6v7h7"/></svg>';
  var ICON_FWD = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6a10 10 0 1 0 9.5 7"/><path d="M26 6v7h-7"/></svg>';
  var ICON_VOL = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function video() { try { return L().PlayerVideo.video(); } catch (e) { return document.querySelector('.player video'); } }
  function seek(delta) {
    var v = video();
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
    try { L().PlayerPanel.listener.send('visible', { status: true }); } catch (e) {}
  }

  function bindTap(el, fn) {
    // Lampa-фокус (пульт/клавіатура) і тап/клік
    el.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
    try { $(el).on('hover:enter', fn); } catch (e) {}
  }

  function build() {
    var panel = document.querySelector('.player-panel');
    var player = document.querySelector('.player');
    if (!panel || !player || player.getAttribute('data-mv-ui') === '1') return;
    player.setAttribute('data-mv-ui', '1');

    // −10 / +10 по боках від play/pause
    var center = panel.querySelector('.player-panel__center');
    var pp = center && center.querySelector('.player-panel__playpause');
    if (center && pp) {
      var back = document.createElement('div');
      back.className = 'mv-skip selector';
      back.innerHTML = ICON_REW + '<span>' + STEP + '</span>';
      var fwd = document.createElement('div');
      fwd.className = 'mv-skip selector';
      fwd.innerHTML = ICON_FWD + '<span>' + STEP + '</span>';
      center.insertBefore(back, pp);
      center.appendChild(fwd);
      bindTap(back, function () { seek(-STEP); });
      bindTap(fwd, function () { seek(STEP); });
    }

    // закрити зверху зліва
    var top = document.createElement('div');
    top.className = 'mv-top';
    var close = document.createElement('div');
    close.className = 'mv-btn mv-glass selector';
    close.innerHTML = ICON_BACK;
    top.appendChild(close);
    bindTap(close, function () { try { L().Player.close(); } catch (e) {} });
    player.appendChild(top);

    // гучність зверху справа
    var v = video();
    if (v && /iPhone|iPad|iPod/.test(navigator.userAgent) === false) {
      var vol = document.createElement('div');
      vol.className = 'mv-vol mv-glass';
      vol.innerHTML = '<input type="range" min="0" max="1" step="0.01">' + ICON_VOL;
      var inp = vol.querySelector('input');
      inp.value = v.volume;
      inp.addEventListener('input', function () { var vv = video(); if (vv) { vv.volume = parseFloat(inp.value); try { L().Storage.set('player_volume', inp.value); } catch (e) {} } });
      player.appendChild(vol);
    }
  }

  function tick() { try { build(); } catch (e) {} }

  function start() {
    addStyle();
    try { L().Player.listener.follow('start', function () { setTimeout(tick, 0); setTimeout(tick, 400); }); } catch (e) {}
    tick();
  }

  if (L() && L().Player && L().Player.listener && document.head) start();
  else { var t = setInterval(function () { if (L() && L().Player && L().Player.listener && document.head) { clearInterval(t); start(); } }, 300); setTimeout(function () { clearInterval(t); }, 30000); }
})();
