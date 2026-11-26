/* Movily: liquid-glass overlay для вбудованого відеоплеєра Lampa.
   Адаптує реальні елементи плеєра під макет: PiP/закриття зверху, назва та метадані по центру,
   перемотка і play/pause у центрі, картка наступної серії, час над timeline та нижні дії.
   Не масштабує DOM до фіксованого полотна і не додає штучний фон чи регулятор гучності. */
(function () {
  'use strict';
  if (window.__movily_player_ui) return;
  window.__movily_player_ui = true;

  var STEP = 10;
  function L() { return window.Lampa; }

  var css = [
    /* Єдина liquid-glass поверхня для панелей, кнопок і чипів. */
    '.player-panel .player-panel__box-buttons,.player .mv-glass,.player .mv-skip,.player .mv-btn,.player-info__values>div,.player-panel__timenow,.player-panel__timeend,.player-panel__time{background:rgba(255,255,255,.16)!important;-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);border:1px solid rgba(255,255,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 6px 20px rgba(0,0,0,.25);color:#fff;}',
    '.player-panel .button{background:transparent;color:#fff;transition:background .15s,transform .15s;} ',
    '.player-panel .button.focus,.player .mv-btn.focus,.player .mv-skip.focus{background:rgba(255,255,255,.4)!important;color:#fff!important;transform:scale(1.06);}',

    /* Затемнення тільки поверх реального відео — для читабельності контролів. */
    '.player-panel{top:0;bottom:0;pointer-events:none;background:linear-gradient(to bottom,rgba(0,0,0,.55),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 54%,rgba(0,0,0,.72));}',
    '.player-panel__body{position:absolute;inset:0;padding:max(1.2em,env(safe-area-inset-top)) max(1.2em,env(safe-area-inset-right)) max(1em,env(safe-area-inset-bottom)) max(1.2em,env(safe-area-inset-left));display:flex;flex-direction:column;justify-content:flex-end;font-size:1em;}',
    '.player-panel .selector,.player-panel .button,.player-panel__timeline,.mv-btn{pointer-events:auto;}',

    /* Наступна серія — скляна картка над таймлайном зліва. */
    '.player-panel__apex{transform:none;margin-bottom:.45em;max-width:calc(50% - 1em);}',
    '.player-next__episode{background:rgba(255,255,255,.16)!important;-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);border:1px solid rgba(255,255,255,.22);border-radius:1.1em!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 6px 20px rgba(0,0,0,.25);padding:.4em .9em .4em .4em;}',
    '.player-next__thumbnail{width:5.8em!important;min-width:5.8em;border-radius:.75em;overflow:hidden;}',
    '.player-next__title{font-size:.75em;opacity:.85;}',
    '.player-next__episode-title{font-size:1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:13em;}',

    /* Центральний ряд: −10 / play-pause / +10. */
    '.player-panel__line-two{display:block;position:static;font-size:1em!important;}',
    '.player-panel__center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:auto;display:flex;align-items:center;gap:3em;}',
    '.player-panel__center .player-panel__playpause{width:4.75em;height:4.75em;border-radius:50%!important;background:rgba(255,255,255,.2)!important;-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);border:1px solid rgba(255,255,255,.24);box-shadow:inset 0 1px 0 rgba(255,255,255,.32),0 6px 20px rgba(0,0,0,.3);}',
    '.player-panel__center .player-panel__playpause svg{width:2em;height:2em;}',
    '.mv-skip{width:4em;height:4em;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;position:relative;cursor:pointer;}',
    '.mv-skip svg{width:2.05em;height:2.05em;}',
    '.mv-skip span{position:absolute;font-size:.72em;font-weight:700;top:50%;left:50%;transform:translate(-50%,-44%);}',

    /* Поточний час і залишок — скляні чипи над лінією прогресу. */
    '.player-panel__line-one{order:2;display:flex;align-items:center;justify-content:space-between;margin:.15em 0 .55em;}',
    '.player-panel__timenow,.player-panel__timeend{position:static!important;display:block;padding:.28em .75em;border-radius:1em;font-size:.78em;font-weight:700;line-height:1.35;white-space:nowrap;color:#fff;}',
    '.player-panel__timeend{margin-left:auto;}',
    '.player-panel__timeline{order:3;height:.6em;border-radius:1em;background:rgba(255,255,255,.3)!important;margin-bottom:.75em;overflow:visible;}',
    '.player-panel__timeline.focus{height:.7em;}',
    '.player-panel__peding{background:rgba(255,255,255,.42);}',
    '.player-panel__position{background:#fff;}',
    '.player-panel__line-two{order:4;display:flex!important;align-items:center;justify-content:space-between;}',
    '.player-panel__line-two .player-panel__left,.player-panel__line-two .player-panel__right{width:auto;display:flex!important;align-items:center;gap:.55em;}',
    '.player-panel__line-two .player-panel__center{position:fixed!important;left:50%;top:50%;}',
    '.player-panel__line-two>.player-panel__right.player-panel__tv-visible{margin-left:auto;justify-content:flex-end;}',
    '.player-panel__line-two>.player-panel__left{margin-right:auto;}',
    '.player-panel__line-two .player-panel__box-buttons{padding:.12em;border-radius:3em!important;}',
    '.player-panel__line-two .button{width:2.75em;height:2.75em;padding:.7em;border-radius:50%;}',
    '.player-panel__line-two .button svg{width:1.2em!important;height:1.2em!important;}',

    /* Верх: штатна назва, чипи роздільності/джерела та окремі close і PiP. */
    '.player-info{pointer-events:none;z-index:4;text-align:center;}',
    '.player-info__body{padding:max(1.1em,env(safe-area-inset-top)) 5.2em 0;display:flex;flex-direction:column;align-items:center;}',
    '.player-info .head-backward,.player-info__line{display:none!important;}',
    '.player-info__title{font-size:clamp(1.1em,2.4vw,1.4em);font-weight:700;letter-spacing:.03em;line-height:1.25;width:min(74vw,48em);margin:0;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.player-info__values{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:.45em;margin-top:.45em;}',
    '.player.player--ios .player-info__values{display:flex!important;}',
    '.player-info__values>div{display:flex;align-items:center;margin:0;padding:.28em .75em;border-radius:2em;font-size:.76em;line-height:1.3;white-space:nowrap;}',
    '.player-info__values .value--stat,.player-info__values .value--speed,.player-info__values .value--pieces{display:none!important;}',
    '.player-info__values .value--size span{background:transparent!important;padding:0!important;}',
    '.player-info__values .value--name span{font-weight:600;}',
    '.mv-top{position:fixed;z-index:6;top:max(1.1em,env(safe-area-inset-top));left:max(1.2em,env(safe-area-inset-left));display:flex;gap:.55em;align-items:center;transition:opacity .3s,transform .3s;opacity:0;transform:translateY(-1.2em);pointer-events:none;}',
    '.player--panel-visible .mv-top{opacity:1;transform:none;pointer-events:auto;}',
    '.mv-btn{width:2.75em;height:2.75em;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;cursor:pointer;}',
    '.mv-btn svg{width:1.25em;height:1.25em;}',

    /* Нижні дії: плейлист і наступна серія зліва; решта штатних дій справа. */
    'body.true--mobile .player-panel .player-panel__tv-visible{display:flex!important;}',
    'body.true--mobile .player-panel .player-panel__mobile-visible,.player-panel .player-panel__right.player-panel__mobile-visible{display:none!important;}',
    '.player-panel__box-buttons:empty,.player-panel__box-buttons:not(:has(.button:not(.hide))){display:none!important;}',
    '.player-panel__tv-visible .player-panel__quality,.player-panel__tv-visible .player-panel__volume,.player-panel__tv-visible .player-panel__pip{display:none!important;}',
    '.player-panel__mobile-visible .player-panel__quality,.player-panel__mobile-visible .player-panel__volume,.player-panel__mobile-visible .player-panel__pip{display:none!important;}',
    '.player-panel__playlist-buttons{display:flex!important;}',
    '.player-panel__playlist-buttons.hide{display:none!important;}',
    '.player-panel__tv-visible .button.hide:not(.player-panel__playinfo){display:none!important;}',
    '.player-panel__tv-visible .player-panel__settings,.player-panel__tv-visible .player-panel__subs,.player-panel__tv-visible .player-panel__tracks{display:flex!important;}',
    '.player-panel__tv-visible .player-panel__settings.hide,.player-panel__tv-visible .player-panel__subs.hide,.player-panel__tv-visible .player-panel__tracks.hide{display:none!important;}',
    '.player-panel__next-episode-name{font-size:.8em;max-width:18em;}',

    /* У портреті не повертаємо весь плеєр: стискаємо центральні кнопки під екран. */
    '@media (orientation:portrait){.player-panel__center{gap:1.2em}.player-panel__center .player-panel__playpause{width:4.5em;height:4.5em}.mv-skip{width:3.4em;height:3.4em}.player-panel__apex{max-width:100%}.player-next__episode-title{max-width:9em}.player-panel__timenow,.player-panel__timeend{font-size:.7em}.player-info__body{padding-left:4.2em;padding-right:4.2em}.player-info__title{width:76vw}}'
  ].join('\n');

  function addStyle() {
    if (document.getElementById('movily-player-ui-style')) return;
    var s = document.createElement('style');
    s.id = 'movily-player-ui-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';
  var ICON_PIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3.5"/><rect x="12" y="11" width="6" height="5" rx="1" fill="currentColor" stroke="none"/></svg>';
  var ICON_REW = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6a10 10 0 1 1-9.5 7"/><path d="M6 6v7h7"/></svg>';
  var ICON_FWD = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6a10 10 0 1 0 9.5 7"/><path d="M26 6v7h-7"/></svg>';

  function video() {
    try { return L().PlayerVideo.video(); }
    catch (e) { return document.querySelector('.player video'); }
  }

  function seek(delta) {
    var v = video();
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
    try { L().PlayerPanel.listener.send('visible', { status: true }); } catch (e) {}
  }

  function bindTap(el, fn) {
    el.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
    try { $(el).on('hover:enter', fn); } catch (e) {}
  }

  function topButton(icon, label, action) {
    var button = document.createElement('div');
    button.className = 'mv-btn selector';
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.innerHTML = icon;
    bindTap(button, action);
    return button;
  }

  function build() {
    var panel = document.querySelector('.player-panel');
    var player = document.querySelector('.player');
    if (!panel || !player || player.getAttribute('data-mv-ui') === '1') return;
    player.setAttribute('data-mv-ui', '1');

    var center = panel.querySelector('.player-panel__center');
    var pp = center && center.querySelector('.player-panel__playpause');
    if (center && pp) {
      var back = document.createElement('div');
      back.className = 'mv-skip selector';
      back.setAttribute('role', 'button');
      back.setAttribute('aria-label', 'Назад на 10 секунд');
      back.innerHTML = ICON_REW + '<span>' + STEP + '</span>';
      var fwd = document.createElement('div');
      fwd.className = 'mv-skip selector';
      fwd.setAttribute('role', 'button');
      fwd.setAttribute('aria-label', 'Вперед на 10 секунд');
      fwd.innerHTML = ICON_FWD + '<span>' + STEP + '</span>';
      center.insertBefore(back, pp);
      center.appendChild(fwd);
      bindTap(back, function () { seek(-STEP); });
      bindTap(fwd, function () { seek(STEP); });
    }

    var top = document.createElement('div');
    top.className = 'mv-top';
    top.appendChild(topButton(ICON_CLOSE, 'Закрити плеєр', function () {
      try { L().Player.close(); } catch (e) {}
    }));
    top.appendChild(topButton(ICON_PIP, 'Картинка в картинці', function () {
      try {
        if (L().PlayerPanel && L().PlayerPanel.listener) L().PlayerPanel.listener.send('pip', {});
      } catch (e) {
        var pip = document.querySelector('.player-panel__pip');
        if (pip) pip.click();
      }
    }));
    player.appendChild(top);
  }

  function tick() { try { build(); } catch (e) {} }

  function start() {
    addStyle();
    try { L().Player.listener.follow('start', function () { setTimeout(tick, 0); setTimeout(tick, 400); }); } catch (e) {}
    tick();
  }

  if (L() && L().Player && L().Player.listener && document.head) start();
  else {
    var t = setInterval(function () {
      if (L() && L().Player && L().Player.listener && document.head) { clearInterval(t); start(); }
    }, 300);
    setTimeout(function () { clearInterval(t); }, 30000);
  }
})();
