# Code Review: OtakuFusion

**План поступового рефакторингу й розвитку** — що вже зроблено й що робити далі. Крок за кроком: один пункт → перевірка збірки → коміт. Без поспіху.

---

## ✅ Що вже зроблено

### Загальний стан

| Що | Де |
|----|-----|
| Безпека: JWT не логуються, API URL з env | `api/auth/login`, `lib/api.ts` |
| Watch-сторінка: контейнер + WatchPlayerContent, WatchInfoPanel, WatchTags, useWatchPageEffects | `app/watch/[id]/page.tsx`, компоненти |
| Player: розбито на модулі (playerStream, getArtplayerOptions, getPlayerLayers, setupPlayerReady, updateContinueWatching, useChapterStyles) | `components/Player/`, `hooks/useChapterStyles.ts` |
| Прибрано @ts-nocheck з усієї `src` | — |
| Видалено мертвий код: ReplaceServerName, TextSliced, useToolTipPosition, getEpisodesServer, стара Skeleton | — |
| Named exports у ключових місцях (Player, Watch*, хуки watch, сервіси getEpisodes/getServers, EmptyState, ErrorState, Episodelist, SwiperCard, getUser, getCategoryInfo, useWatch) | різні файли |
| ErrorState, лоадери, metadata/SEO, revalidate головної | error.tsx, layout, getHomePage |

### Етапи 1–3 (виконано)

| Етап | Що зроблено |
|------|-------------|
| **Етап 1** | Опечатка fetchScheduleAnime, logout setIsLoading(false), видалено handlerDisabled, catch у handleSave (ProfileHeader). |
| **Етап 2** | episodeUtils + заміни, named exports (EmptyState, ErrorState, getUser, getCategoryInfo, useWatch, SwiperCard). |
| **Етап 3** | Zod ContinueWatching, Zod для API (request body), типи замість any. |

### Додаткові виправлення (ревʼю)

- Refresh-токен: `NEXT_JWT_ACCESS_SECRET` (api/auth/refresh).
- Predeploy: прибрано prisma validate (package.json).
- Назва сайту: єдине джерело правди в `config/website.ts`.
- ProfileHeader: catch у handleSave з повідомленням користувачу.
- Avatar API: перевірка MIME, прибрано закоментований код.

---

## 🔜 Що залишилося (план, крок за кроком)

Рекомендований порядок — по одному блоку, коли буде час. Технології (toast-бібліотека, state-рішення тощо) можна визначити пізніше.

## Розбивка за пріоритетом і типом

### P0 — Production-ready (Refactor/Type/A11y)
- A.3 — модуль env: перевірка обовʼязкових `process.env` при старті, експорт констант, заміна `process.env.X!`.
- A.5 — Continue Watching: `updateContinueWatching` один раз при заході на watch + guard у функції.
- A.6 — спільні хелпери для валідації та форматування помилок у API.
- A.7 — `SwiperCard`: стабільні унікальні next/prev IDs, `type="button"`, `useMemo` для `navigation`, guard на порожній `catalog`, очистка зайвих `swiper/css` імпортів.

### P1 — Рефакторинг логіки (Refactor)
- A.1 — розбити `useWatchPageEffects` на дрібніші хуки.
- A.2 — розбити `Episodelist`: `useEpisodeList` + `EpisodeItem`.
- Опційно (з блоку A, DX/якість): named exports для ключових секцій/форм, єдиний стиль скелетонів, unit-тести для `getEpisodeNumberFromId`, `updateContinueWatching`, `parseContinueWatchingList`, довести до нуля `any` в `refresh/avatar/AnimeCalendar`.

### P1 — UX-покращення (UX)
- A.4 — toast замість `alert` для помилок/успіху.
- B.1 — UI логіна/реєстрації + toast/інлайн-помилки.
- B.2 — confirm email: зрозумілі статуси, повторна відправка, next step.
- B.3 — responsive: перевірити й довести до коректної роботи на мобільних.

### P2 — Окремі фічі (Feature)
- C.1 — Адмінка окремо: керування контентом/модерація, guard по ролі, окремі роути.
- D.1–D.4 — AniList + глобальний стан (маппінг, синх прогресу, wish list, вибір підходу для state).

### P3 — Achievements (Feature, на потім)
- E.1 — агреговані achievements без прив’язки до кожного аніме окремо.

---

### Блок A — Рефакторинг (з оригінального плану)

| Крок | Що зробити | Де |
|------|------------|-----|
| **A.1** | Розбити useWatchPageEffects на дрібніші хуки (continue watching sync, URL sync, document title, error state, висота колонки). | `hooks/useWatchPageEffects.ts`, `app/watch/[id]/page.tsx` |
| **A.2** | Розбити Episodelist: хук useEpisodeList + компонент EpisodeItem. | `components/Episodelist/` |
| **A.3** | Модуль env: перевірка обовʼязкових process.env при старті, експорт констант, замінити process.env.X! по коду. | `src/lib/env.ts`, api/auth, lib/auth, lib/db, middleware |
| **A.4** | Toast замість alert для помилок/успіху (наприклад, збереження профілю). | ProfileHeader та інші місця з alert |
| **A.5** | Continue Watching: викликати updateContinueWatching один раз при заході на watch (коли є animeInfo + episodeId); guard у функції. | `watch/[id]/page.tsx`, updateContinueWatching |
| **A.6** | Спільні хелпери для валідації та форматування помилок у API. | окремий модуль, API routes |
| **A.7** | `SwiperCard`: стабільні унікальні next/prev IDs (навіть з `sectionId`), `type="button"`, `useMemo` для `navigation`, guard на `catalog.length===0`, прибрати зайві `swiper/css` імпорти. | `src/components/SwiperCard/SwiperCard.tsx` |

Опційно (коли буде настрій): named exports для AnimeSection, AnimeCalendar, DeleteAccount, ChangePasswordForm, SearchInput, SearchData, GenderData, AnimeFilters, AnimeData; єдиний стиль скелетонів; unit-тести для getEpisodeNumberFromId, updateContinueWatching, parseContinueWatchingList; довести до нуля any у refresh/avatar/AnimeCalendar.

---

### Блок B — UX: логін, реєстрація, підтвердження email

| Крок | Що зробити |
|------|------------|
| **B.1** | Оновити UI логіна та реєстрації. Повідомлення (успіх/помилка) — через toast; помилки полів форми — інлайн під інпутами. |
| **B.2** | Змінити UI та логіку підтвердження по email: зрозумілі статуси (лист відправлено, прострочено, вже підтверджено), повторна відправка листа, next step для користувача. |
| **B.3** | Адаптивність (responsive): перевірити й довести до коректної роботи на мобільних ключові екрани з цього блоку (розмітка, переноси, розміри інпутів/кнопок, відступи, читабельність, дотикова зручність). |

Без жорсткого вибору технологій поки що — вирішиш пізніше (бібліотека для toast, валідація форм тощо).

---

### Блок C — Адмінка

| Крок | Що зробити |
|------|------------|
| **C.1** | Адмінка окремо: мінімум для керування контентом/модерації, guard по ролі, окремі роути. Реалізацію вести окремо від основного продукту. |

---

### Блок D — AniList і глобальний стан

| Крок | Що зробити |
|------|------------|
| **D.1** | Маппінг anime-api ↔ AniList (бекенд), сервіс «ourAnimeId → anilistId». |
| **D.2** | Авто відстеження перегляду + синх з AniList (прогрес, захист від перезапису). |
| **D.3** | Wish list / статуси (Дивлюся, Планую, Переглянув тощо), UI + бекенд. |
| **D.4** | Глобальний стан для auth/AniList: вирішити підхід (контекст / інше рішення для стану). Конкретну технологію обрати пізніше. |

Весь блок D — окрема гілка / етап, після того як буде стабільний A/B.

---

### Блок E — Achievements (на потім)

| Крок | Що зробити |
|------|------------|
| **E.1** | Achievements: спочатку агреговані досягнення (наприклад «10/50/100 епізодів», «завершив N тайтлів», streak), без прив’язки до кожного аніме окремо. Візуал і складніші умови — пізніше. |

---

## Довідка

### Невикористані файли

Раніше видалено: ReplaceServerName, TextSliced, useToolTipPosition, getEpisodesServer, стара папка Skeleton. Нові невикористані файли — перевірити і при потребі видалити.

### Стиль коду (орієнтир)

- Функції верхнього рівня: краще `function Name()`.
- Колбеки в JSX: стрілками або useCallback там, де передаються в списки.
- Об’єктні форми в TypeScript: краще `interface`.

### Підсумок порядку

1. **Зроблено** — етапи 1–3, ключові named exports, безпека, Player/Watch структура.
2. **Далі** — A (рефакторинг), потім B (логін/реєстрація/email), C (адмінка), D (AniList + стан), E (achievements) коли буде час.

Крок за кроком, без напруги — один пункт за раз, перевірка, коміт.
