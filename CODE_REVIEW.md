# Code Review: OtakuFusion

**Що вже зроблено** і **що залишилось**. Нижче — стратегія гілок, чекліст «що маю зробити», невикористані файли, патерни, та таблиця завдань.

---

## Стратегія роботи (гілки + поступово)

- **Великі компоненти — окремі гілки:** розбиття `Player.tsx` і `app/watch/[id]/page.tsx` робити в окремих гілках. Так зручніше рев’ювати і мерджити без поламаного main.
- **Zod + UI під валідацію — окрема гілка:** валідація (наприклад, ContinueWatching, API body) + UI для помилок валідації в одній гілці.
- **Решта — поступово:** named exports, видалення мертвого коду, прибирання `@ts-nocheck` у дрібних файлах, типи замість `any` можна робити по трохи в main або короткоживучих гілках.

---

## Що маю зробити (чекліст)

### Гілка: розбиття Player.tsx

Розбиття на частини (кожна = один коміт, збірка зелена після кожного):

| # | Частина | Що зробити | Коміт (приклад) |
|---|--------|-------------|------------------|
| P1 | **useChapterStyles** | Винести useEffect із застосуванням chapter styles у хук `useChapterStyles(intro, outro)`. У Player лише виклик хука. | `refactor(Player): extract useChapterStyles hook` |
| P2 | **Stream URL + HLS** | Винести побудову `headers`, `fullURL` і функцію `playM3u8` у модуль (наприклад `playerStream.ts` або хук). Player викликає готову функцію/хук. | `refactor(Player): extract stream URL and HLS setup` |
| P3 | **Опції Artplayer** | Винести об’єкт опцій (plugins, subtitle, icons, customType) у фабрику `getArtplayerOptions(...)` у окремому файлі. У Player: `new Artplayer({ ...getArtplayerOptions(...), url, container })`. Layers поки залишити в опціях. | `refactor(Player): extract Artplayer options factory` |
| P4 | **Layers** | Винести масив `layers` (лого, tap-зони, skip intro/outro, іконки) у `getPlayerLayers(...)` або окремий модуль. Підключити в опціях. | `refactor(Player): extract layers config` |
| P5 | **Ready callback** | Винести тіло `art.on('ready', ...)` у функцію `setupPlayerReady(art, refs, callbacks, options)` (окремий файл). У Player лише `art.on('ready', () => setupPlayerReady(...))`. | `refactor(Player): extract ready callback setup` |
| P6 | **Cleanup + continueWatching** | Винести оновлення `continueWatching` (localStorage) у хелпер `updateContinueWatching(animeInfo, episodeId, ...)`. У cleanup лише destroy + виклик хелпера. | `refactor(Player): extract continueWatching update` |
| P7 | **Типи та @ts-nocheck** | Допрацювати типи в нових модулях, прибрати `@ts-nocheck` з Player та пов’язаних файлів (getVttArray, PlayerIcons, pluginChapterStyle, плагіни). | `refactor(Player): add types, remove @ts-nocheck` |

Порядок: P1 → P2 → … → P7. Після кожної частини — перевірка збірки й плеєра, потім коміт.

- [ ] P1 useChapterStyles
- [ ] P2 Stream URL + HLS
- [ ] P3 Опції Artplayer
- [ ] P4 Layers
- [ ] P5 Ready callback
- [ ] P6 Cleanup + continueWatching
- [ ] P7 Типи та @ts-nocheck

### Гілка: розбиття watch/[id]/page.tsx
- [ ] Розбити сторінку на контейнер + презентаційні компоненти (теги, плеєр, епізоди, «next episode», секції).
- [ ] Прибрати `@ts-nocheck` з watch page.
- [ ] Допрацювати типи для watch-сторінки.

### Гілка: Zod + UI під валідацію
- [ ] ContinueWatching: після `JSON.parse` валідувати через Zod, показувати помилки в UI.
- [ ] Backend: у API routes з JSON — схема Zod, safeParse, 400 при помилці; при потребі — UI для відображення помилок валідації.
- [ ] (Опційно) типи замість any в auth/refresh, user/avatar — можна в цій же гілці або окремо.

### Поступово (main або дрібні гілки)
- [ ] Видалити невикористані файли: ReplaceServerName.ts, TextSliced.ts, useToolTipPosition.ts, getEpisodesServer.ts, папка `components/Skeleton/` (Skeleton.jsx, SkeletonCard, SkeletonSection) — див. таблицю невикористаних нижче.
- [ ] Named exports: по бажанню перевести на named компоненти (EmptyState, ErrorState, Player, Episodelist, AnimeSection тощо), useWatch, useToolTipPosition (або видалити), сервіси getUser, getCategoryInfo.
- [ ] Решта `@ts-nocheck` у дрібних модулях — прибирати по мірі торкання файлів.
- [ ] any → конкретні типи (AnimeCalendar, auth, user) — по мірі часу.

---

## Що вже зроблено

| # | Що зроблено | Файл / місце |
|---|-------------|--------------|
| 1 | Прибрано логування JWT-секретів | `app/api/auth/login/route.ts` |
| 2 | API URL винесено в env | `lib/api.ts` — `NEXT_PUBLIC_API_URL` |
| 3 | AuthContext: `.catch`, `[]`, `.finally(isLoading)` | `context/AuthContext.tsx` |
| 4 | Логін: контрольовані інпути, лоадер при сабміті | `auth/login/page.tsx` |
| 5 | Реєстрація: `type="text"`, `autoComplete="username"` | `auth/register/page.tsx` |
| 6 | ErrorState + error.tsx: один UI | `app/error.tsx` → `ErrorState.tsx` |
| 7 | Metadata та SEO | `app/layout.tsx` |
| 8 | Тип any замінено в useWatchServers | `hooks/useWatchServers.ts` |
| 9 | Revalidate для головної (3600) | `services/getHomePage.ts` |
| 10 | Schedule: лоадер, прибрано console.log | `app/schedule/page.tsx` |
| 11 | not-found: без styled-jsx, описовіший alt | `app/not-found.tsx` |
| 12 | api.ts: перевірка NEXT_PUBLIC_API_URL | `lib/api.ts` |
| 13 | db.ts: прибрано лог "MongoDB connected" | `lib/db.ts` |
| 14 | Логін: форма, submit, preventDefault | `auth/login/page.tsx` |
| 15 | Login API повертає user, AuthContext без зайвого /me | `api/auth/login/route.ts`, `context/AuthContext.tsx` |
| 16 | Сервіси getEpisodes, getNextEpisodeSchedule, getServers — named export; getNextEpisodeSchedule нормалізація API | `services/getEpisodes.ts`, `getNextEpisodeSchedule.ts`, `getServers.ts` |
| 17 | artPlayerPluinChaper: додано default export для плагіна | `components/Player/artPlayerPluinChaper.ts` |
| — | Voice actors тимчасово прибрано (useWatch, watch page, UseWatchReturn) | окрема таска в майбутньому |
| — | getAnimeInfo, getStreamInfo — у проєкті вже named export | — |
| 18 | next.config: прибрано eslint, domains→remotePatterns, qualities [75,80] | `next.config.ts` |
| 19 | SCSS: CategoryList, _reset (mixed decls), SwiperCard (@import→@use) | відповідні .scss |

---

## Невикористані файли (бажано видалити або використати)

Ці модулі ніде не імпортуються. Можна сміливо видалити, якщо не плануєш використовувати.

| Файл | Примітка |
|------|----------|
| `src/helper/ReplaceServerName.ts` | Ніде не імпортується |
| `src/helper/TextSliced.ts` | Експорт `HandleTextSliced` не використовується |
| `src/hooks/useToolTipPosition.ts` | Хук ніде не використовується |
| `src/services/getEpisodesServer.ts` | Сервіс ніде не викликається |
| `src/components/Skeleton/Skeleton/Skeleton.jsx` | Використовується `@/components/ui/Skeleton/Skeleton` (TS) |
| `src/components/Skeleton/SkeletonCard/SkeletonCard.tsx` | Ніде не імпортується |
| `src/components/Skeleton/SkeletonSection/SkeletonSection.tsx` | Ніде не імпортується |

**Рекомендація:** видалити перелічені файли (і порожні папки після видалення), щоб не плутатися та не тягнути мертвий код. Перед видаленням переконайся, що `getEpisodesServer` дійсно не потрібен для майбутнього SSR/серверного рендеру епізодів.

---

## Патерни і best practices — що вже є

- **Композиція хуків:** `useWatch` збирає `useWatchAnime`, `useWatchServers`, `useWatchStream` — логіка рознесена по дрібних хуках, сторінка лише використовує один фасад. Це ок.
- **Сервіси окремо:** API-виклики в `services/`, типи в `shared/types/` — розділення відповідальності дотримано.
- **Контекст авторизації:** один AuthContext, провайдер у layout — звичний підхід.
- **Named exports у ключових місцях:** хуки watch (useWatchAnime, useWatchServers, useWatchStream), сервіси (getEpisodes, getNextEpisodeSchedule, getServers, getAnimeInfo, getStreamInfo, getHomePage, getCategory тощо), компоненти UI (Skeleton, BouncingLoader, Section, Card, Button, Pagination, Seasons тощо) — named, зручно для рефакторингу та tree-shaking.
- **Стиль функцій:** у багатьох місцях використано `function` для компонентів/хуків — узгоджено з твоїми правилами.

**Що покращити (вже в «що залишилось»):** Watch-сторінка — один великий компонент; варто винести блоки в окремі презентаційні компоненти та прибрати `@ts-nocheck`. Продовжити перехід на named exports там, де ще залишився default (компоненти, useWatch, useToolTipPosition, сервіси getUser, getCategoryInfo).

---

## Що залишилось

### Frontend

**Сторінка Watch — моноліт**  
`app/watch/[id]/page.tsx`: розбити на контейнер + презентаційні компоненти (наприклад, блок тегів, блок плеєра, блок епізодів, блок «next episode»). Прибрати `@ts-nocheck`, допрацювати типи.

**ContinueWatchingSection — валідація (Zod)**  
Після `JSON.parse` валідувати через Zod. *Планується окремою гілкою.*

**Named exports**  
Вже named: CoreLayout (Header, Footer, Navbar, NavbarDesktop, NavbarMobile, NavbarList, SidebarMenu), Card, Button, Skeleton та інші в `ui/Skeleton` (AnimeCardSkeleton, SearchSkeleton, PreviewSkeleton, GenderSkeleton, AnimeSectionSkeleton), InitialLoader, BouncingLoader, CategoryList, Seasons, Pagination, ProfileHeader, UserMenu, Section, AnimeListLayout, CurrentTime, NavLink; хуки useWatchServers, useWatchAnime, useWatchStream, useLocalStorage, useDebounce, useSetVh, useDropdown; сервіси getHomePage, getCategory, getAnimeSearch, getNextEpisodesAnime, getGenreAnime, **getEpisodes, getNextEpisodeSchedule, getServers, getAnimeInfo, getStreamInfo**; context AuthProvider, useAuth; lib apiUrl, connectDB, cn, normalizeError; helper Convertor; playerConstants, playerChapters, playerKeydown.  

Досі `export default`: компоненти EmptyState, ErrorState, PreviewHero, Episodelist, AnimeSection, AnimeCalendar, SwiperCard, Player, DeleteAccount, ChangePasswordForm, SkeletonSection (у `components/Skeleton/`), SearchInput, SearchData, GenderData, AnimeFilters, AnimeData; хуки useWatch, useToolTipPosition; сервіси getUser, getCategoryInfo; усі page.tsx та layout.  
*(Voiceactor, getVoiceActor, fetchVoiceActorInfo — видалені з проєкту.)*

**Невикористаний код**  
Видалити або використати: ReplaceServerName, TextSliced (HandleTextSliced), useToolTipPosition, getEpisodesServer, папка `components/Skeleton/` (Skeleton.jsx, SkeletonCard, SkeletonSection) — див. таблицю вище.

**@ts-nocheck** (8 файлів):  
watch page; у Player: getVttArray, PlayerIcons, pluginChapterStyle, artPlayerPluginVttThumbnail, artplayerPluginUploadSubtitle, artPlayerPluinChaper; useToolTipPosition.ts.  
*(Voiceactor у списку більше не актуальний — компонент видалено.)*

**Тип any → конкретні типи** (окрема гілка):  
AnimeCalendar (events), auth/refresh (payload), user/avatar (uploadResult).

---

### Backend

**Zod для request body**  
У всіх API routes з JSON: схема, safeParse, 400 при помилці. *Окрема гілка.*

**Тип any (refresh, avatar)** — окрема гілка.

---

## Де ще залишився `export default` (для named exports)

**Компоненти (components/):**  
EmptyState, ErrorState, PreviewHero, Episodelist, AnimeSection, AnimeCalendar, SwiperCard, Player, DeleteAccount, ChangePasswordForm, SkeletonSection (SkeletonSection.tsx), SearchInput, SearchData, GenderData, AnimeFilters, AnimeData.

**Хуки (hooks/):**  
useWatch, useToolTipPosition — `export default`.

**Сервіси (services/):**  
getUser, getCategoryInfo — `export default`.

**Сторінки (app/.../page.tsx, layout):**  
Зазвичай у Next.js залишають default для page/layout; можна змінити на named за бажанням.

**Інше:**  
config/website.ts, config/logoTitle.ts, shared/data/servers.ts, models/User — часто залишають default.

---

## Стиль: `function name()` vs `const name = () =>`

- **Коли краще `function`:** оголошення функцій верхнього рівня (компоненти, хуки, async-функції).
- **Коли краще стрілка:** колбеки (onClick, .map), невеликі допоміжні функції поруч з кодом.
- **Практика:** у межах одного модуля краще однаковий підхід (наприклад, компоненти — `function`, обробники — стрілки).

---

## Таблиця — що залишилось

| № | Де | Завдання | Як робити |
|---|-----|----------|------------|
| F1 | Frontend | Player.tsx: розбити, прибрати @ts-nocheck | **Окрема гілка** |
| F2 | Frontend | watch/[id]: розбити на компоненти, прибрати @ts-nocheck | **Окрема гілка** |
| F3 | Frontend | ContinueWatching + Zod, API Zod + UI валідації | **Окрема гілка** |
| B1 | Backend | Zod для request body | У гілці F3 або окремо |
| F4 | Frontend | Named exports (список вище) | Поступово |
| F5 | Frontend | Прибрати @ts-nocheck у дрібних файлах | Поступово |
| F6 | Frontend | Видалити невикористані файли | Поступово |
| F7 | Frontend | any → типи (AnimeCalendar, auth, user) | Поступово / гілка |
| B2 | Backend | any → типи refresh, avatar | Поступово / гілка |
