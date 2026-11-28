#!/usr/bin/env bash
# Збирає dist/moon-interface.js з модулів у src-modules/
set -euo pipefail
cd "$(dirname "$0")"
OUT=dist/moon-interface.js
python3 - <<'PY'
order = ["movily-reset-player","lampa-mobile-apple","snack-defaults","snack-tv","snack-header","snack-leftdock",
         "snack-settings-merge","snack-settings-hide","streamings","movily-brand","movily-mobile-shell","episode-views","movily-smooth","movily-navfix","movily-trailers","movily-hide-continue","movily-episode-art","movily-player-next","movily-player-ui"]
css = ""
head = """/*!
 * Moon / Snack TV interface for Lampa (single-file plugin).
 * Підключення: Налаштування -> Розширення -> Додати плагін -> URL цього файлу.
 */
(function () {
  'use strict';
  if (window.__moon_plugin_boot) return;
  window.__moon_plugin_boot = true;
  function run() {
""" + css
tail = """
  }
  function ready() { return window.Lampa && Lampa.Listener && Lampa.Storage && Lampa.Settings && Lampa.Template; }
  function start() {
    if (window.appready) run();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') run(); });
  }
  if (ready()) start();
  else { var t = setInterval(function () { if (ready()) { clearInterval(t); start(); } }, 200); }
})();
"""
body = ""
for n in order:
    body += "\n/* ===== %s ===== */\n" % n + open("src-modules/%s.js" % n, encoding="utf-8").read() + "\n"
open("dist/moon-interface.js", "w", encoding="utf-8").write(head + body + tail)
PY
node --check "$OUT" && echo "OK: $OUT"
