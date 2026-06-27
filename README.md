# FastCart Admin Panel

A standalone admin web app for the FastCart e-commerce backend (separate from the storefront).

- **Behavior spec (authoritative):** [`FastCart_Admin_TRD.md`](./FastCart_Admin_TRD.md)
- **Visual design (authoritative):** the [`images/`](./images) mockups
- **Build plan & session workflow:** [`ROADMAP.md`](./ROADMAP.md), [`SESSION_NOTES.md`](./SESSION_NOTES.md), [`CLAUDE.md`](./CLAUDE.md)
- **Backend:** `https://fastcart-backend.onrender.com` (all paths under `/api/v1`)

## Tech stack (TRD §1)

TypeScript (strict) · React 19 + Vite · MUI (interactive primitives) · Tailwind CSS v4 (layout/spacing/custom visuals) · Redux Toolkit + RTK Query (state + server cache) · React Router · React Hook Form + Yup · i18next + react-i18next (EN + RU) · axios (multipart uploads only).

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev            # start the dev server
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |

### Environment

- `VITE_API_BASE_URL` — backend base URL (e.g. `https://fastcart-backend.onrender.com`). All API paths are versioned under `/api/v1`. See [`.env.example`](./.env.example).
- The backend runs on Render's free tier and may cold-start slowly on the first request.

## Project structure (feature-based, TRD §2.2)

```
src/
  app/                 # store, typed hooks, i18n, theme provider, router
  shared/
    api/               # RTK Query baseApi, axios instance, single-flight token refresh
    lib/               # authStorage, FormData builder, status→color map
    ui/                # shared presentational components (added per phase)
  features/            # auth, theme, … (slices + feature logic)
  pages/               # route-level screens
  locales/             # en/ + ru/ translation resources
```

## Architecture notes

### Dark mode — single source of truth (TRD §1.1)

The Redux **theme mode** (`features/theme/themeSlice.ts`) is the only source. `app/providers/AppThemeProvider.tsx` reads it and drives **both**:

- the MUI palette via `createTheme({ palette: { mode } })`, and
- the Tailwind `dark` class on `<html>` via an effect.

They can never disagree. Tailwind v4 is configured for **class-based** dark mode in `src/index.css`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

### MUI + Tailwind coexistence (TRD §1.1)

- **Tailwind** handles layout, spacing, grid, and custom visual treatment (utility classes, including `dark:`).
- **MUI** handles interactive primitives (dialogs, selects, menus, snackbars, inputs, etc.).
- Tailwind's preflight uses low-specificity element selectors while MUI styles are applied via class selectors, so MUI components win on conflicts; `<CssBaseline />` provides the themed base background. No `important` strategy was needed.

### Two API clients sharing auth + reauth (TRD §3.2, §7)

- **RTK Query** (`shared/api/baseApi.ts`) handles everything except multipart.
- **axios** (`shared/api/axiosInstance.ts`) handles `multipart/form-data` uploads.
- Both attach `Authorization: Bearer <accessToken>` (read from `localStorage`, the API layer's source of truth) and share one **single-flight** 401-refresh routine (`shared/api/tokenRefresh.ts`): on a 401 it refreshes once, retries the original request, and on failure clears the session. Concurrent 401s await the same in-flight refresh; the refresh call uses a bare axios request so it can't loop.

### Multipart helper (TRD §7)

`shared/lib/buildFormData(data, { stringifyKeys })` builds `FormData` from a typed object:

- `File`/`Blob` values → binary parts; arrays → repeated fields (e.g. `TagIds`, multiple `Images`);
- keys listed in `stringifyKeys` are `JSON.stringify`'d into a single string field — this is the **`POST /Products` quirk**: `Options` and `Variants` are typed as strings server-side.

### Status → color (TRD §4, §13)

`shared/lib/statusColors.ts` is the single status→color map (order, payment, return, inventory pills), with light + dark Tailwind classes. Use `getStatusPillClasses(status)`; never hardcode pill colors per screen.

## Localization (TRD §4.2)

All display strings go through i18next (`src/locales/en`, `src/locales/ru`), EN default with a localStorage language detector. No hardcoded display text in components.
