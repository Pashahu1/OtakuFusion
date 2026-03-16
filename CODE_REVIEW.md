# Code Review: OtakuFusion

**План поступового рефакторингу** — що вже зроблено й що робити далі, по кроках. Можна виконувати по одному пункту, перевіряти збірку й комітити.

---

## Що вже зроблено (коротко)

| Що | Де |
|----|-----|
| Безпека: JWT не логуються, API URL з env | `api/auth/login`, `lib/api.ts` |
| Watch-сторінка: контейнер + WatchPlayerContent, WatchInfoPanel, WatchTags, useWatchPageEffects | `app/watch/[id]/page.tsx`, компоненти |
| Player: розбито на модулі (playerStream, getArtplayerOptions, getPlayerLayers, setupPlayerReady, updateContinueWatching, useChapterStyles) | `components/Player/`, `hooks/useChapterStyles.ts` |
| Прибрано @ts-nocheck з усієї `src` | — |
| Видалено мертвий код: ReplaceServerName, TextSliced, useToolTipPosition, getEpisodesServer, стара Skeleton | — |
| Named exports у ключових місцях (Player, Watch*, хуки watch, сервіси getEpisodes/getServers тощо) | різні файли |
| ErrorState, лоадери, metadata/SEO, revalidate головної | error.tsx, layout, getHomePage |

Детальний список був у попередніх версіях документа; за потреби можна вести лог виконаних пунктів окремо.

---

## Поточний стан (перевірка)

| Етап | Статус | Примітка |
|------|--------|----------|
| **Етап 1** | ✅ Виконано | 1.1 fetchScheduleAnime, 1.2 logout setIsLoading(false), 1.3 handlerDisabled видалено, 1.4 catch у handleSave. |
| **Етап 2** | ✅ Виконано | 2.1 episodeUtils + заміни, 2.2–2.3 EmptyState/ErrorState, 2.4 getUser/getCategoryInfo, 2.5 useWatch, + SwiperCard named. |
| **Етап 3** | ✅ Виконано | 3.1 Zod ContinueWatching, 3.2 Zod API, 3.3 типи замість any. |
| **Етап 4** | 🔜 Окремий етап | Розбиття useWatchPageEffects і Episodelist (архітектурний рефакторинг). |
| **Етап 5** | 🔜 Окрема гілка | AniList після завершення 3 (і за бажанням 4). |

---

## План робіт (поступово)

Рекомендований порядок: **Етап 1** → **Етап 2** → потім за бажанням **Етап 3**. Після кожного кроку перевіри, що застосунок збирається і працює, потім можна робити коміт.

---

### Етап 1 — Швидкі фікси (без ризику)

Це невеликі зміни в одному-двох файлах. Добре підходять для того, щоб звикнути до плану.

| Крок | Що зробити | Де | Навіщо |
|------|------------|-----|--------|
| **1.1** | Перейменувати функцію: опечатка в назві | `app/schedule/page.tsx` — знайди `fetchSheduleAnime` і заміни на `fetchScheduleAnime` (у визначенні й у виклику в useEffect). | Щоб назва відповідала змісту (schedule) і пошук по коду працював коректно. |
| **1.2** | Виправити стан після виходу | `context/AuthContext.tsx` — у функції `logout` замість `setIsLoading(true)` поставити `setIsLoading(false)`. | Після виходу індикатор завантаження не повинен «залипати». |
| **1.3** | Прибрати мертву функцію | `components/Profile/ProfileHeader/ProfileHeader.tsx` — функція `handlerDisabled` ніде не використовується. Її можна сміливо **видалити** (рядки з її оголошенням). | Менше мертвого коду, простіше читати. |
| **1.4** | Додати обробку помилок у збереженні профілю | У тому ж `ProfileHeader.tsx` у `handleSave`: після блоку `try { ... }` додати `catch (err) { ... }`. У catch: показати користувачу помилку (наприклад, через `alert` або майбутній toast) і за логікою залишити `setIsLoading(false)` у `finally` (воно вже є — переконайся, що при помилці теж викликається). | Якщо запит на оновлення профілю впаде, користувач побачить повідомлення, а форма не зависне в стані «завантаження». |

Після Етапу 1 маєш уже 4 невеликі, але корисні зміни. Можна зробити один коміт на всі чотири або по коміту на кожен пункт — як зручніше.

---

### Етап 2 — Невеликі покращення (по одному файлу / одній темі)

Тут уже трохи більше коду, але кожен пункт все одно обмежений одним або кількома файлами.

| Крок | Що зробити | Де | Навіщо |
|------|------------|-----|--------|
| **2.1** | Одна утиліта для номера епізоду | Зараз у проєкті в кількох місцях повторюється логіка на кшталт `item?.id.match(/ep=(\d+)/)?.[1]`. Створи файл, наприклад `src/shared/utils/episodeUtils.ts`, і винеси туди функцію типу `getEpisodeNumberFromId(id: string): string \| undefined`. Потім поступово заміни повторення в useWatchPageEffects, Player, Episodelist, useWatchAnime, getPlayerLayers, setupPlayerReady, useWatch на виклик цієї функції. Роби заміни по одному файлу і перевіряй збірку. | Один раз написана логіка — один раз змінювати; менше дублювання. |
| **2.2** | Named export для EmptyState | У файлі компонента EmptyState заміни `export default` на `export function EmptyState` (або `export const EmptyState`). Знайди всі місця, де імпортується EmptyState, і зміни імпорт на `import { EmptyState } from ...`. | Узгодженість з іншими компонентами, зручніше рефакторити. |
| **2.3** | Named export для ErrorState | Те саме, що 2.2, але для ErrorState. Перевір імпорти в error.tsx, schedule, тощо. | Те саме. |
| **2.4** | Named export для сервісів getUser і getCategoryInfo | У `services/getUser.ts` і `services/getCategoryInfo.ts` зроби named export замість default. Онови імпорти в тих місцях, де ці сервіси використовуються. | Узгодженість з getEpisodes, getServers тощо. |
| **2.5** | Named export для хука useWatch | У `hooks/useWatch.ts` зроби `export function useWatch` замість default. Онови імпорт у `app/watch/[id]/page.tsx`. | Єдиний стиль експорту хуків. |

Етап 2 можна робити не за один раз: вибрав один пункт — зробив, перевірив, закомітив. Далі можна повертатися до інших пунктів Етапу 2 коли буде час.

---

### Етап 3 — Більші теми (коли будеш готовий)

Це вже більші зміни. Має сенс брати їх по одній і, за бажанням, в окремих гілках.

| Крок | Що зробити | Де | Навіщо |
|------|------------|-----|--------|
| **3.1** | Валідація ContinueWatching через Zod | Там, де зберігається/читається «continue watching» з localStorage (наприклад, JSON.parse), додати Zod-схему і валідувати дані. Якщо валідація не пройшла — показувати безпечний стан (наприклад, порожній список) або повідомлення в UI. | Захист від зіпсованих даних у localStorage. |
| **3.2** | Zod для API (request body) | У API routes, де приймається JSON (login, register, change-password, user/update тощо), описати схему Zod для body, викликати safeParse і при помилці повертати 400 з описом помилок. | Надійніша валідація на бекенді, менше неочікуваних даних. |
| **3.3** | Типи замість any | У `api/auth/refresh/route.ts` (payload після jwt.verify), `api/user/avatar/route.ts` (результат завантаження), `AnimeCalendar.tsx` (events) замінити `any` на конкретні типи або інтерфейси. | Краща підказка від TypeScript і менше помилок під час рефакторингу. |

---

### Етап 4 — Розбиття хуків і компонентів (окремий етап)

Архітектурний рефакторинг: дрібніші хуки та компоненти для кращої читабельності й тестування. Має сенс виконувати окремо від Етапу 3.

| Крок | Що зробити | Де | Навіщо |
|------|------------|-----|--------|
| **4.1** | Розбити useWatchPageEffects на дрібніші хуки | Зараз у `useWatchPageEffects` кілька різних useEffect. Винести, наприклад: синхронізацію continue watching, синхронізацію URL з episodeId, document title, таймер помилки, висоту колонки епізодів — в окремі маленькі хуки і в page викликати їх по черзі. | Простіше читати і тестувати кожну частину окремо. |
| **4.2** | Розбити Episodelist | Компонент Episodelist великий. Винести логіку (пошук діапазону, генерація опцій, обробник зміни) в хук `useEpisodeList`, а один елемент списку — в компонент `EpisodeItem`. | Менший файл, чіткіша відповідальність. |

---

### Етап 5 — Інтеграція AniList (окрема гілка, майбутній бекенд)

Велика таска: додати AniList до проєкту. Джерело аніме-даних зараз — [anime-api](https://github.com/Pashahu1/anime-api) (REST: `id`, `data_id`, `title`, `animeInfo["MAL Score"]` тощо). Роботу вести в окремій гілці, бекенд планується переробляти наглухо.

| Крок | Що зробити | Навіщо |
|------|------------|--------|
| **5.1** | **Маппінг anime-api ↔ AniList** | Створити на бекенді схему/таблицю маппінгу: `ourAnimeId` (або `data_id`) → `anilistId` (опційно `malId`). Заповнювати по мірі використання: пошук на AniList по назві або MAL id (якщо є в anime-api), зберегти результат. Сервіс «для цього ourAnimeId повернути anilistId» — з кешу/БД. | Єдине місце зв’язки даних; клієнт не думає про зіставлення. |
| **5.2** | **Авто відстеження перегляду + синх з AniList** | Зберігати прогрес перегляду (continue watching) у себе; при наявності anilistId — синхронізувати прогрес (наприклад, епізод) у список AniList (Watching). **Захист:** не перезаписувати наш прогрес даними з AniList, якщо там 0 або менше (наприклад, юзер очистив списки на AniList). Правило: `newProgress = max(ourProgress, anilistProgress)` при синху; джерело правди для «переглянуто на сайті» — наш бек/клієнт. | Авто-збереження переглянутого + відображення в AniList без втрати прогресу. |
| **5.3** | **Wish list / статуси (Дивлюся, Планую, Переглянув тощо)** | Інтеграція зі списками AniList: додавання в список, зміна статусу (Current, Planning, Completed, Dropped, Paused, Repeating). API AniList це підтримує. Реалізувати UI вибору статусу + виклики до бекенду, бекенд — до AniList. Опційно: двостороння синхронізація (зміни на AniList підтягувати при вході/синху) з правилами merge (наприклад, по `updated_at`), щоб не затирати дані. | Найбільша таска; основна цінність AniList для юзера. |

Рекомендований порядок: 5.1 → 5.2 → 5.3. Після 5.1 можна паралельно робити 5.2 і готувати UX для 5.3.

---

## Довідка

### Невикористані файли

Раніше видалено: ReplaceServerName, TextSliced, useToolTipPosition, getEpisodesServer, стара папка Skeleton. Якщо з’являться нові файли, які ніде не імпортуються — їх теж можна винести в цей список і видалити після перевірки.

### Де ще default export (для Етапу 2)

- **Компоненти:** EmptyState, ErrorState (Етап 2.2–2.3), Episodelist, AnimeSection, AnimeCalendar, SwiperCard, DeleteAccount, ChangePasswordForm, SearchInput, SearchData, GenderData, AnimeFilters, AnimeData.
- **Хук:** useWatch (Етап 2.5).
- **Сервіси:** getUser, getCategoryInfo (Етап 2.4).
- **Сторінки (page.tsx, layout):** у Next.js зазвичай залишають default — міняти не обов’язково.

Переходити на named exports можна по одному компоненту/сервісу, як у кроках 2.2–2.5.

### Стиль коду (орієнтир)

- Функції верхнього рівня (компоненти, хуки): краще `function Name()`.
- Колбеки в JSX (onClick, onChange): можна стрілками або винесеними в `useCallback` там, де передаються в списки.
- Для об’єктних форм у TypeScript за правилами проєкту краще `interface`.

---

## Підсумок порядку робіт

1. **Етап 1** — опечатка schedule, logout setIsLoading, видалити handlerDisabled, catch у ProfileHeader handleSave.
2. **Етап 2** — утиліта getEpisodeNumberFromId, named exports (EmptyState, ErrorState, getUser, getCategoryInfo, useWatch).
3. **Етап 3** — Zod (ContinueWatching + API), типи замість any.
4. **Етап 4** (окремий етап) — розбиття useWatchPageEffects на дрібніші хуки, розбиття Episodelist (useEpisodeList, EpisodeItem).
5. **Етап 5** (окрема гілка) — AniList: маппінг anime-api↔AniList, авто-відстеження перегляду з захистом від перезапису, wish list / статуси.

Якщо щось з плану здається незрозумілим або хочеш спочатку розібрати один пункт детальніше — можна брати один крок і просити розписати його покроково (наприклад, «як саме додати catch у handleSave»).

---

## Оцінка технічного стану

**Вердикт: технічно майже все ок.** Основа солідна: розділення відповідальностей, типи, частина безпеки на місці. Нижче — що вже виправлено під час додаткового ревʼю та що покращити далі.

### Що виправлено (додатковий ревʼю)

| Що | Де |
|----|-----|
| Refresh-токен: використовується `NEXT_JWT_ACCESS_SECRET` (як у login/middleware), не `JWT_ACCESS_SECRET` | `api/auth/refresh/route.ts` |
| Predeploy: прибрано `npx prisma validate` (проєкт на Mongoose) | `package.json` |
| Єдине джерело правди для назви сайту: `WEBSITE_NAME` і `LOGO_TITLE` з `config/website.ts`, файл `config/logoTitle.ts` видалено | `config/website.ts` |
| ProfileHeader: у catch у `handleSave` — зрозуміле повідомлення користувачу + правильний текст у `console.error` | `ProfileHeader.tsx` |
| Avatar API: перевірка MIME (jpeg, png, webp, gif), видалено закоментований код | `api/user/avatar/route.ts` |

### Що покращити далі (пріоритети)

- **Env**: перевірка обовʼязкових `process.env` при старті (один модуль типу `lib/env.ts`) замість `process.env.XXX!` скрізь — менше падінь у runtime.
- **Zod**: повна валідація continue watching з localStorage та body у всіх API routes (частина вже є в Етапі 3).
- **Архітектура**: дрібніші хуки з useWatchPageEffects, розбиття Episodelist (Етап 4).
- **UX**: toast замість `alert()` для помилок/успіху (наприклад, збереження профілю).
- **Масштабованість**: спільні хелпери для валідації та форматування помилок у API.

Це вже рівень «куди рости далі», а не критичні діри — можна брати по одному пункту і впроваджувати поступово.

---

## Додаткові рекомендації (архітектура та патерни)

### Env / конфіги

- **Що зробити**: створити модуль `src/lib/env.ts`, де один раз читати й перевіряти всі обовʼязкові змінні середовища (JWT, Mongo, SMTP, Cloudinary, API URL). Експортувати з нього вже **перевірені** константи й замінити по коду `process.env.X!` на імпорти з цього модуля.
- **Навіщо**: помилки конфігурації ловляться при старті, а не в рантаймі; єдине джерело правди для всіх секретів.

### Watch-сторінка та хуки

- **useWatchPageEffects**:
  - Розбити на дрібніші хуки (патерн custom hooks):
    - `useContinueWatchingSync(animeId, episodes, urlEp, setEpisodeId)`
    - `useWatchUrlSync(animeId, episodeId, isFirstSetRef)` — тільки перше оновлення `?ep=...` без циклів.
    - `useWatchTitle(animeInfo)` — зміна `document.title`.
    - `useWatchErrorState(serverLoading, buffering, streamUrl, setShowErrorBlock)` — логіка блоку з помилкою.
    - `useEqualColumnsHeight(playerColumnRef, setEpisodesColumnHeight, deps)` — вирівнювання висоти колонок.
  - Кожен хук викликати в `page.tsx` або в тонкому контейнері.

- **Episodelist**:
  - Винести бізнес-логіку в `useEpisodeList` (діапазони, пошук, скрол до активної серії).
  - Створити `EpisodeItem` як окремий компонент для одного епізоду.

### Continue Watching

- **updateContinueWatching**:
  - Викликати **один раз** при заході на `watch` після того, як є і `animeInfo`, і `episodeId` (контейнерний ефект у `watch/[id]/page.tsx`), а в `Player` залишити оновлення прогресу при кінці серії / auto-next.
  - У функції мати чіткий guard: не писати нічого в localStorage, якщо немає нормального `animeInfo.id`, `animeInfo.data_id` або `episodeId`.
- **ContinueWatchingSection**:
  - Продовжити використовувати Zod-схему як єдину точку валідації даних з localStorage.

### Валідація й типи

- **API schemas**:
  - Гарантувати, що всі API routes, які приймають JSON (login, register, change-password, user/update тощо), використовують схеми з `shared/schemas/api.ts` через `safeParse` і повертають 400 при невалідному body.
- **Типізація**:
  - Довести до нуля використання `any` (Cloudinary upload result, jwt payload, події календаря) через окремі інтерфейси.

### UX і скелетони

- Тримати єдиний стиль скелетонів:
  - короткі лінії замість великих блоків;
  - висоти близькі до реального тексту;
  - однаковий підхід у WatchInfoPanel, картах, списках.
- Замість `alert()` використовувати один спільний механізм toast/notification (окремий хук або сервісний компонент).

### Тести

- Додати невеликий набір unit-тестів для чистих функцій:
  - `getEpisodeNumberFromId`
  - `updateContinueWatching`
  - `parseContinueWatchingList`
- Це дасть упевненість при подальших рефакторингах і покаже продакшн-підхід до якості.
