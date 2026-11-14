# Movily

Lampa (https://github.com/yumata/lampa) з інтерфейсом із плагіна Moon / Snack TV (https://github.com/vakdab/Lampa).

## Що змінено відносно оригінальної Lampa
- **Інтерфейс**: рідний вигляд Lampa підмінено плагіном `plugin/dist/moon-interface.js` (Snack TV, шапка, ліве меню, налаштування). Він підключається автоматично з `index.html` після `app.min.js`, додавати його вручну в «Розширення» не потрібно.
- **Без екрану завантаження**: прибрано заставку `.welcome` і текст кроків завантаження.
- **Без вибору мови**: `lampa_settings.lang_use = false`, мова за замовчуванням `uk` (і `tmdb_lang = uk`). Змінити мову можна в налаштуваннях.
- **Лого**: Movily (трикутник з літерою M) у `img/logo-icon.svg`, `img/logo.svg`, фавіконах, PWA-іконках і `og.png`; у шапці воно замінює бургер на кнопці меню (`plugin/src-modules/movily-brand.js`).
- Ядро Lampa (`app.min.js`, `css/`, `vender/` тощо) не змінювалось.

## Структура
- `index.html`, `app.min.js`, `css/`, `lang/`, `vender/`, ... : Lampa (yumata/lampa)
- `plugin/src-modules/` : модулі інтерфейсу
- `plugin/build.sh` : збирає `plugin/dist/moon-interface.js` (`cd plugin && ./build.sh`)

## Запуск
Потрібен будь-який статичний веб-сервер, наприклад `python3 -m http.server 8080`, далі відкрити `http://localhost:8080`.
Docker: `docker build --build-arg domain={domain} -t movily . && docker run -p 8080:80 -d movily`

## Оновлення
- Інтерфейс: правка в `plugin/src-modules/`, потім `cd plugin && ./build.sh`.
- Lampa: замінити файли ядра файлами з yumata/lampa і повторно перевірити правки в `index.html` (блок «Movily»).

Ліцензія Lampa: GPL-2.0 (див. `LICENSE`).
