# Ears Audio Toolkit (Manifest V3 Port)

This directory contains an unofficial Manifest V3 compatibility port of the original Ears Audio Toolkit Chrome extension.

The original Manifest V2 package only works on recent Chrome versions when legacy MV2 support is forced with special flags. This port keeps the original UI and core audio processing logic, but adapts the extension to the Manifest V3 runtime model so it can run on current Chrome builds without relying on those flags.

## What changed

- `manifest.json` was converted to Manifest V3
- the old background model was replaced with a service worker (`sw.js`)
- an offscreen host (`offscreen.html`) is used for MV3-compatible audio processing
- the original EQ engine in `bg.js` was kept and reused
- the popup UI and overall workflow were preserved as closely as possible
- original branding, contact links, and donation links were intentionally kept

## Load unpacked

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select this `extension_payload` directory

## Notes

- This is a compatibility port, not a ground-up rewrite.
- This is not an official release from the original author.
- No build step is required. The folder is ready to load as an unpacked extension.
- If Chrome cannot create an offscreen document, the MV3 bridge can fall back to a hidden host window or pinned background tab so tab audio capture can still work.

## Files

- `manifest.json` - Manifest V3 extension manifest
- `sw.js` - service worker and MV3 bridge logic
- `offscreen.html` - offscreen host page
- `bg.js` - audio processing and EQ logic
- `popup.html`, `popup.js`, `popup.css` - popup UI

## Disclaimer

This port exists to keep the extension usable on modern Chrome versions. Before publishing a public fork, review the original extension's license and redistribution terms.

# Ears Audio Toolkit (порт на Manifest V3)

В этой папке находится неофициальный порт оригинального расширения Ears Audio Toolkit под Manifest V3.

Исходная версия на Manifest V2 в современных версиях Chrome работает только при принудительном включении устаревшей поддержки MV2 через специальные флаги. Этот порт сохраняет исходный интерфейс и основную аудио-логику, но адаптирует расширение под модель выполнения Manifest V3, чтобы оно запускалось в актуальных версиях Chrome без таких флагов.

## Что было изменено

- `manifest.json` переведён на Manifest V3
- старая фоновая модель заменена на service worker (`sw.js`)
- для совместимой с MV3 обработки аудио используется offscreen host (`offscreen.html`)
- исходный EQ-движок в `bg.js` сохранён и переиспользован
- popup-интерфейс и общий сценарий работы сохранены максимально близко к оригиналу
- оригинальный брендинг, контактные ссылки и ссылки на донат намеренно оставлены без изменений

## Как загрузить распакованное расширение

1. Откройте `chrome://extensions`
2. Включите Developer mode
3. Нажмите `Load unpacked`
4. Выберите папку `extension_payload`

## Примечания

- Это порт для совместимости, а не переписывание с нуля.
- Это не официальный релиз от исходного автора.
- Сборка не требуется: папка уже готова к загрузке как unpacked extension.
- Если Chrome не может создать offscreen document, MV3-мост может использовать скрытое окно-хост или закреплённую фоновую вкладку, чтобы сохранить работоспособность захвата аудио вкладки.

## Состав файлов

- `manifest.json` - манифест расширения для Manifest V3
- `sw.js` - service worker и логика MV3-моста
- `offscreen.html` - offscreen host-страница
- `bg.js` - логика обработки аудио и эквалайзера
- `popup.html`, `popup.js`, `popup.css` - интерфейс popup-окна

## Дисклеймер

Этот порт сделан для того, чтобы расширение оставалось работоспособным в современных версиях Chrome. Перед публичной публикацией форка стоит проверить лицензию оригинального расширения и условия распространения.
