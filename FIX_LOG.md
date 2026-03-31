# Журнал помилок і виправлень

Короткі нотатки: що зламалось / що було не так → що зробили. Доповнюй вручну або попроси доповнити після тасків.

---

## 2026-03-31

| Проблема | Причина | Виправлення |
|----------|---------|-------------|
| Блік hero, «ghosting» кількох фонів | `key` на `<Swiper>` змінювався після появи pagination → повний remount Swiper | Прибрано remount; pagination прив’язується через `onSwiper` + ref, `pagination={false}` + `bindHeroPagination` (destroy/init/render/update), один раз на інстанс |
| Після першого слайду стрибок на інший | `loop` + `effect: 'fade'` → клони слайдів і перерахунок позиції після init | `loop` замінено на `rewind`; autoplay лише якщо `spotlights.length > 1`; `waitForTransition` у autoplay |
| Trending: картки «зліплені», gap з’являється пізніше | `spaceBetween` у Swiper задається JS після `swiper-initialized` | У `SwiperCard.scss` запасний `margin-right` для `.swiper:not(.swiper-initialized)`; константа `SPACING_BETWEEN_SLIDES` у `SwiperCard.tsx` |
| Дуже високий CLS, Lighthouse — `preview__shine` | Анімація `left` → reflow щокадру | У `PreviewHero.scss` рух через `transform: translateX` + `skewX` у keyframes, `will-change: transform` |
| Помилка Sass `expected "{"` біля рядка 339 | Випадковий текст у кінці `PreviewHero.scss` (артефакт редактора) | Файл обрізано до валідного кінця після `}` у `@keyframes shine` |
| FCP / «Improve image delivery» у Lighthouse | У `next.config.ts` було `images.unoptimized: true` — Next/Image не стискав і не конвертував віддалені картинки | За замовчуванням оптимізація **увімкнена**; відключити лише за потреби: `NEXT_IMAGE_UNOPTIMIZED=true`. У `layout.tsx` — `preconnect` на `cdn.noitatnemucod.net` |

---

## Шаблон для нового запису

```
### YYYY-MM-DD — коротка назва
- **Симптом:** …
- **Чому:** …
- **Фікс:** … (файли: `path/...`)
```

---

*Файл навмисно легкий; детальний план рефакторингу — у `CODE_REVIEW.md`.*
