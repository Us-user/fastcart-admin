# Session Notes

> Rolling log for session-to-session continuity. `/stop` appends a new entry here; `/start` reads the **latest** entry first.
> Keep entries concise but cold-start sufficient: someone with zero memory of prior work should be able to resume from the latest entry alone.

---

## Session 1 — 2026-06-27 — Project bootstrap

**Phase:** Pre-Phase 0 (setup only)

**Done this session**
- Read and analyzed `FastCart_Admin_TRD.md` (FastCart Admin Panel TRD v1.0).
- Created `ROADMAP.md` — TRD sliced into Phases 0–9 + conventions checklist.
- Created automation skills: `/start`, `/stop`, `/design` (in `.claude/skills/`).
- Created `CLAUDE.md` (project guidance for future Claude Code sessions).
- Initialized git, created public GitHub repo, pushed initial commit.

**Decisions made**
- Design source = `images/` mockups (per TRD §0). `/design` skill enforces the "open mockup before building" workflow. Figma MCP is available if a Figma round-trip is ever wanted, but not required by the TRD.
- App not yet scaffolded — Vite scaffolding is the first task of Phase 0.

**Open questions / blockers**
- Confirm npm vs another package manager (TRD §2.1 allows team preference; defaulting to npm).
- Backend is on Render free tier (`fastcart-backend.onrender.com`) — may cold-start slowly; verify Swagger reachable when wiring the API layer.

**NEXT ACTION (start here):**
> Run `/start` → begin **Phase 0**: scaffold the Vite `react-ts` project at the repo root (without clobbering `images/`, the TRD, `ROADMAP.md`, or `.claude/`), then install the TRD §1 stack.

---

## Session 2 — 2026-06-27 — Phase 0: scaffolding & infrastructure

**Phase:** Phase 0 — **COMPLETE** (all tasks + the status-map convention checked off in `ROADMAP.md`).

**Done this session**
- Scaffolded Vite at repo root via temp dir + copy (preserved `images/`, docs, `.claude/`). Baseline: **Vite 8 · React 19.2 · TypeScript 6.0**.
- Installed full TRD §1 stack, **0 vulnerabilities**: MUI v9 + Emotion, Tailwind v4 (`@tailwindcss/vite`), Redux Toolkit + RTK Query 2.12, React Router 7, RHF + Yup, i18next 26 + react-i18next + detector, axios.
- Swapped scaffold's **oxlint → ESLint flat config + Prettier** (TRD §1 mandates ESLint+Prettier). `eslint.config.js`, `.prettierrc.json`, `.prettierignore`.
- TS strict on; `@/*` path alias (no `baseUrl` — deprecated in TS 6); `resolveJsonModule` for locale imports.
- Feature-based `src/` tree (TRD §2.2): `app/` (store, typed hooks, i18n, `AppThemeProvider`, `AppRouter`), `shared/api`, `shared/lib`, `features/{auth,theme}`, `pages/`, `locales/{en,ru}`.
- **Dark mode single source** (`AppThemeProvider`): Redux theme mode → MUI `palette.mode` + Tailwind `dark` class on `<html>`; Tailwind v4 class-based `@custom-variant dark` in `index.css`.
- **API layer:** `baseApi` (RTK Query) + `axiosInstance` (multipart) share auth header (from `localStorage`) and one **single-flight** 401-refresh (`tokenRefresh.ts`); `storeRef.ts` breaks the store↔api import cycle.
- **Helpers:** `buildFormData` (files, repeated fields, `JSON.stringify`'d Options/Variants quirk); `statusColors` single status→color map; `authStorage`; `authSlice` + `themeSlice`.
- i18n EN/RU bootstrap with localStorage detector, default EN.
- `README.md` documents setup, env, MUI+Tailwind coexistence/dark-mode, multipart helper.
- **Verified:** `npm run build` (tsc + vite) ✓, `npm run lint` ✓, `npm run format:check` ✓, dev server boots & serves "FastCart Admin".

**Decisions made**
- **npm** as package manager (TRD §2.1 default). Kept bleeding-edge scaffold versions (React 19 / TS 6 / Vite 8 / Tailwind 4 / MUI 9) — all compile/run together; flag peer friction if it appears later.
- **localStorage is the API layer's source of truth** for tokens; the Redux `authSlice` mirrors it and keeps it in sync. Auth selectors use a minimal state shape to avoid a store import cycle.
- Tailwind preflight + MUI coexist without an `important` strategy (MUI's class selectors out-specify preflight's element selectors). `<CssBaseline />` provides the themed base background.
- Temp `pages/ScaffoldReady.tsx` is a Phase-0 smoke screen only — **replace in Phase 1** with the real auth flow + app shell.

**Open questions / blockers**
- Backend (`fastcart-backend.onrender.com`, Render free tier) not yet hit — verify Swagger/auth endpoint shapes when wiring login in Phase 1. The refresh response shape in `tokenRefresh.ts` (`{ accessToken, refreshToken? }`) is assumed; confirm against the real `POST /Auth/refresh` response.
- Other Vite dev servers occupy ports 5173/5174 on this machine; ours auto-picks the next free port.

**NEXT ACTION (start here):**
> Begin **Phase 1 — Auth, role gating & app shell**. First screen is **Login**: run `/design` and open `images/Log in.png` (+ `Log in-1/-2.png`) BEFORE writing UI. Build the auth RTK Query endpoints (`POST /Auth/login`, `GET /Auth/me`) in `features/auth/`, then the split-layout Login screen at `pages/`. Replace the temporary `ScaffoldReady` route in `app/router/AppRouter.tsx`.
