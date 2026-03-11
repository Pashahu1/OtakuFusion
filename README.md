# OtakuFusion

**Modern anime streaming platform** — fast search, custom video player, and a clean, responsive UI. Built with Next.js, TypeScript, and Tailwind CSS.

![OtakuFusion — anime streaming platform](https://github.com/user-attachments/assets/632f8d00-be8c-404e-ad81-cf83c97322e0)

---

## Features

- **Watch** — Custom player (HLS), multiple servers, skip intro/outro, autonext, progress saving, related anime
- **Search** — Instant search with debounce, autocomplete
- **Home** — Spotlight slider, trending carousel, adaptive layout
- **Auth** — Login, register, email verification, profile (avatar, preferences)
- **Schedule** — Anime calendar / release schedule
- **UI** — Mobile-friendly, optimized images, loading and error states

---

## Tech stack

| Layer        | Stack |
|-------------|--------|
| Framework   | Next.js 16 (App Router), React 19 |
| Language    | TypeScript |
| Styling     | Tailwind CSS 4, SCSS |
| Video       | Artplayer, HLS.js |
| State / Data | React state, Local Storage, MongoDB (auth/profile) |
| Auth        | JWT (access + refresh), HTTP-only cookies |
| Email       | Nodemailer (SMTP) |
| Media       | Cloudinary (avatars) |

---

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **MongoDB** (e.g. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) — for auth and user data
- **SMTP** — for verification and transactional emails (e.g. Gmail, SendGrid)
- **Cloudinary** (optional) — for avatar uploads

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/your-username/OtakuFusion.git
cd OtakuFusion
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`. **Required for a minimal run:**

- `NEXT_PUBLIC_API_URL` — base URL of your anime/streaming API
- `MONGODB_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — strong random strings (e.g. `openssl rand -base64 32`)
- Set `NEXT_JWT_ACCESS_SECRET` and `NEXT_JWT_REFRESH_SECRET` to the same values as above (used by login/me routes)
- `SMTP_*` — SMTP credentials for verification emails

Optional:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL (defaults in code if unset)
- `NEXT_PUBLIC_PROXY_URL`, `NEXT_PUBLIC_M3U8_PROXY_URL` — if your player needs a proxy for streams
- `CLOUDINARY_*` — for profile avatar uploads

All variable names and short descriptions are in **`.env.example`**. Never commit `.env` or real secrets.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Next.js + Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting without writing |

---

## Project structure (overview)

```
src/
├── app/              # Next.js App Router (pages, layouts, API routes)
├── components/       # React components (UI, Player, Layout, etc.)
├── context/         # React context (e.g. Auth)
├── hooks/           # Custom hooks (watch, localStorage, debounce, etc.)
├── lib/             # Shared utilities (api client, auth, db, mailer)
├── services/        # API/data services (anime, episodes, streams)
├── shared/          # Types, constants, data
└── style/           # Global SCSS (reset, variables, mixins)
```

---

## Deployment

- **Vercel** — recommended: connect the repo, set env vars, deploy.
- **Other hosts** — run `npm run build` and `npm run start`; set all required env vars in the host’s dashboard.

Ensure `NEXT_PUBLIC_*` and server-side variables (e.g. `MONGODB_URI`, `JWT_*`, `SMTP_*`) are set in the deployment environment.

---

## Contributing

Contributions are welcome.

1. Open an issue to discuss bugs or features.
2. Fork the repo and create a branch (`fix/...` or `feat/...`).
3. Follow existing code style (TypeScript, functional components, named exports where used).
4. Add a clear description in the PR and reference any related issues.

---

## Reporting issues

When reporting bugs or asking for features, please include:

- A short, clear description
- Steps to reproduce (for bugs)
- What you expected vs what happened
- Environment (Node version, OS, browser if relevant)

---

## Author

**Pavlo Chudyn** — Frontend Developer (React / Next.js)

- GitHub: [Pashahu1](https://github.com/Pashahu1)
- LinkedIn: [pavlo-chudyn](https://www.linkedin.com/in/pavlo-chudyn-978547246)
- Telegram: [PashaChudin](https://t.me/PashaChudin)

---

If you find this project useful, consider giving it a **star** on GitHub.
