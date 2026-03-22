# Code Review: OtakuFusion

**План поступового рефакторингу й розвитку.** Крок за кроком: один пункт → перевірка збірки → коміт.

Стан зведено в три смуги: **готові** · **робиться** · **майбутнє**. Детальні блоки (A–F) лишаються внизу для майбутніх тасків.

---

## Готові

### Зведення по кроках плану

| ID | Що зроблено |
|----|-------------|
| **Етап 1–3** | Опечатки / logout / ProfileHeader catch, episodeUtils, named exports, Zod (ContinueWatching, API body), менше `any`. |
| **A.3** | Модуль `env`, перевірка `process.env`, заміна голих `process.env.X!`. |
| **A.4** | `sonner` + `AppToaster`, `toast` з `@/lib/toast`, без `alert` у `src`. |
| **A.5** | Continue Watching: один виклик `updateContinueWatching` на watch + guard. |
| **A.6** | Спільні хелпери валідації / форматування помилок у API. |
| **A.7** | `SwiperCard`: унікальні next/prev IDs, `type="button"`, `useMemo`, guard на порожній каталог, зайві `swiper/css` прибрані. |
| **B.1** | Логін / реєстрація: `UnderlineField`, помилки полів візуально, toast для загальних кейсів. |
| **B.3** | Адаптивність: hero (iOS Safari, ноути), auth, footer, пошук, розклад, дрібні екрани тощо. |

### Загальний стан кодової бази

| Що | Де |
|----|-----|
| Безпека: JWT не логуються, API URL з env | `api/auth/login`, `lib/api.ts` |
| Watch: контейнер, WatchPlayerContent, WatchInfoPanel, WatchTags, useWatchPageEffects | `app/watch/[id]/page.tsx`, компоненти |
| Player: модулі (playerStream, getArtplayerOptions, …) | `components/Player/`, `hooks/useChapterStyles.ts` |
| Без `@ts-nocheck` у `src` | — |
| Прибрано мертвий код (ReplaceServerName, TextSliced, …) | — |
| Named exports у ключових модулях | Player, Watch*, сервіси, EmptyState, ErrorState, … |
| ErrorState, лоадери, metadata/SEO, revalidate головної | `error.tsx`, `layout`, `getHomePage` |

### Додаткові виправлення (ревʼю)

- Refresh-токен: `NEXT_JWT_ACCESS_SECRET` (`api/auth/refresh`).
- Predeploy: без prisma validate у `package.json`.
- Назва сайту: `config/website.ts`.
- ProfileHeader: catch у `handleSave` з повідомленням користувачу.
- Avatar API: перевірка MIME, прибрано мертвий закоментований код.

---

## Робиться

| Зараз у фокусі | Нотатка |
|----------------|---------|
| A.1 | Коли береш таск — впиши тут ID (напр. **A.1**, **F.1**) і коротко, що саме робиш. |

---

## Майбутнє

### Короткий пріоритет

| Пріоритет | Що |
|-----------|-----|
| **P1** | **A.1** `useWatchPageEffects` → дрібніші хуки · **A.2** `Episodelist` → `useEpisodeList` + `EpisodeItem` · **F.1** Lighthouse / CWV головної (mobile) · **B.2** UI/UX верифікації email · **B.4** продукт + код верифікації email (епік) |
| **P2** | **C.1** адмінка · **D.1–D.4** AniList + глобальний стан |
| **P3** | **E.1** achievements (агреговані) |

Опційно (DX): named exports для AnimeSection, AnimeCalendar, форми налаштувань, Search*, GenderData, AnimeFilters, AnimeData; єдиний стиль скелетонів; unit-тести для `getEpisodeNumberFromId`, `updateContinueWatching`, `parseContinueWatchingList`; нуль `any` у refresh / avatar / AnimeCalendar.

---

### Блок A — рефакторинг (що лишилось)

| Крок | Що зробити | Де |
|------|------------|-----|
| **A.1** | Розбити `useWatchPageEffects` на дрібніші хуки (continue watching, URL, title, error, висота колонки). | `hooks/useWatchPageEffects.ts`, `app/watch/[id]/page.tsx` |
| **A.1.5** | Додати скелетон до дати наступної серії
| **A.2** | Розбити Episodelist: `useEpisodeList` + `EpisodeItem`. | `components/Episodelist/` |

*(A.3–A.7 — у розділі **Готові**.)*

---

### Блок B — UX: логін, реєстрація, email

| Крок | Що зробити |
|------|------------|
| **B.2** | UI та логіка підтвердження email: статуси (відправлено, прострочено, вже підтверджено), resend, зрозумілий next step. |
| **B.4** | **Верифікація email — продукт + код** (окремо від B.2). |

#### B.4 — деталі

| Підпункт | Ідея |
|----------|------|
| **UI verify** | Якщо `email` уже в query після реєстрації — не показувати друге поле email; лише read-only / лейбл «на цю адресу надіслано код». Поле email — лише без `?email=`. |
| **Проблема** | Можливий **deadlock**: зареєструвався → не підтвердив → не може зайти й не може зареєструвати той самий email знову. |
| **Варіант** | Обговорити **опційну** верифікацію після sign-up; підтвердження в профілі + обмеження чутливих дій. Зачіпає login/register API, User, middleware, UI. |

**Порядок:** узгодити продукт → B.4 UI → бекенд під модель.

*(B.1, B.3 — у **Готові**.)*

---

### Блок F — Performance / Lighthouse (**F.1**)

**Контекст:** Lighthouse (Performance), головна, **mobile**, prod (`otaku-fusion.vercel.app`). Повторний замір — **інкогніто, без розширень Chrome**.

| Метрика | Знімок | Коментар |
|---------|--------|----------|
| Performance | **49** | червона зона |
| FCP | 0.6 s | ок |
| LCP | 1.2 s | можна покращити hero / LCP-елемент |
| TBT | **810 ms** | важкий JS на головному потоці |
| CLS | **0.257** | погано (вище 0.25) |

**Чекліст:** CLS (резерви під медіа, шрифти) · TBT (dynamic import, бандл, Swiper) · LCP (`fetchPriority`, `sizes`, формат зображень) · повторний аудит і оновлення цифр у PR / тут.

---

### Блок C — адмінка

| Крок | Що зробити |
|------|------------|
| **C.1** | Адмінка: контент/модерація, guard по ролі, окремі роути. |

---

### Блок D — AniList і глобальний стан

| Крок | Що зробити |
|------|------------|
| **D.1** | Маппінг anime-api ↔ AniList, `ourAnimeId → anilistId`. |
| **D.2** | Автопрогрес + синх з AniList. |
| **D.3** | Wish list / статуси, UI + бекенд. |
| **D.4** | Глобальний стан auth/AniList (підхід обрати пізніше). |

Блок D — окрема гілка після стабілізації A/B.

---

### Блок E — achievements (потім)

| Крок | Що зробити |
|------|------------|
| **E.1** | Агреговані досягнення (N епізодів, завершені тайтли, streak), без прив’язки до кожного аніме. |

---

## Довідка

### Невикористані файли

Перевіряти час від часу; раніше видалено ReplaceServerName, TextSliced, useToolTipPosition, getEpisodesServer, стару Skeleton.

### Стиль коду (орієнтир)

- Верхній рівень: краще `function Name()`.
- Колбеки в списках: стрілки або `useCallback`.
- Форми об’єктів у TS: краще `interface`.

---

*Останнє оновлення структури: готові / робиться / майбутнє.*
