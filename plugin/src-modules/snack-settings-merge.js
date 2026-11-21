/* Hide the old Snack TV and AppleTV AgNative settings groups from Settings.
   Their UI options are no longer merged into Interface, while the theme modules and saved values remain intact. */
(function () {
  'use strict';
  if (window.__movily_hide_legacy_settings) return;
  window.__movily_hide_legacy_settings = true;

  var NAMES = ['закусь tv', 'zakus tv', 'snack tv', 'agnative', 'appletv agnative', 'apple tv agnative'];

  function lc(text) {
    return String(text || '').replace(/<[^>]*>/g, '').trim().toLowerCase();
  }

  function hiddenComponent(id, item) {
    var key = String(id || '').toLowerCase();
    var name = lc(item && item.name);
    return NAMES.indexOf(name) >= 0 || key.indexOf('agnative') === 0 || key.indexOf('appletv_agnative') === 0;
  }

  function patch() {
    var api = window.Lampa && Lampa.SettingsApi;
    if (!api || typeof api.allComponents !== 'function') return false;
    if (api.__movily_hidden_legacy_settings) return true;
    api.__movily_hidden_legacy_settings = true;

    var allComponents = api.allComponents;
    api.allComponents = function () {
      var components = allComponents.apply(api, arguments) || {};
      var visible = {};
      for (var id in components) {
        if (!hiddenComponent(id, components[id])) visible[id] = components[id];
      }
      return visible;
    };
    return true;
  }

  function hideRows() {
    try {
      var rows = document.querySelectorAll('.settings-folder');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var label = row.querySelector('.settings-folder__name');
        var id = row.getAttribute('data-component') || '';
        if (!hiddenComponent(id, { name: label ? label.textContent : '' })) continue;
        row.style.setProperty('display', 'none', 'important');
        row.classList.remove('selector');
        if (row.parentNode) row.parentNode.removeChild(row);
      }
    } catch (e) {}
  }

  function start() {
    var tries = 0;
    (function wait() {
      if (patch()) hideRows();
      else if (tries++ < 200) setTimeout(wait, 100);
    })();
    setInterval(hideRows, 500);
    if (window.MutationObserver && document.body) {
      new MutationObserver(hideRows).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
