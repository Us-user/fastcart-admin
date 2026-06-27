# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**FastCart Admin Panel** — a standalone admin web app (separate from the storefront) for an e-commerce backend.

- **Behavior spec (authoritative):** `FastCart_Admin_TRD.md`
- **Visual design (authoritative):** the `images/` folder of mockups
- **Backend:** `https://fastcart-backend.onrender.com` — all paths under `/api/v1`
- **API spec:** `https://fastcart-backend.onrender.com/swagger/v1/swagger.json`

The app is built incrementally across sessions via the roadmap + start/stop workflow below. As of bootstrap the Vite app is **not yet scaffolded** (that is Phase 0 in `ROADMAP.md`).

## The session workflow (read this first)

This project is built phase-by-phase across many sessions. Three project skills drive it:

- **`/start`** — reads `ROADMAP.md` + the latest `SESSION_NOTES.md` entry, re-scans `images/`, and resumes from the first unchecked task. Use it to begin a session.
- **`/stop`** — checks off completed `ROADMAP.md` tasks, appends a `SESSION_NOTES.md` entry (with a specific NEXT ACTION), and commits + pushes. Use it to end a session.
- **`/design`** — enforces matching the `images/` mockups before building any screen.

`ROADMAP.md` is the plan (Phases 0–9). `SESSION_NOTES.md` is the rolling handoff log — its newest entry is the cold-start anchor; trust the checked boxes in `ROADMAP.md` if the two disagree.

## The one rule that overrides intuition

**Behavior comes from the TRD; appearance comes from the `images/` mockups — never from memory.** Before building any screen, open its matching PNG in `images/`. For screens with no mockup (the TRD §6 features), reuse the *exact* visual language of the existing mockups. This is mandated by TRD §0 and codified in `/design`.

## Mandatory tech stack (TRD §1 — do not introduce alternatives)

TypeScript (strict) · React + Vite (function components/hooks only) · **MUI** for interactive primitives · **Tailwind** for layout/spacing/custom visuals · **RTK Query** for all server state · **Redux Toolkit** for client state · React Router · React Hook Form · Yup (via `@hookform/resolvers`) · i18next + react-i18next (EN + RU) · **axios** only for multipart uploads.

## Commands (after Phase 0 scaffolding)

Standard Vite scripts will apply once scaffolded: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`. (No test runner is mandated by the TRD; add one only if a phase calls for it.) Until Phase 0 runs there is no `package.json`.

## Architecture & non-obvious constraints

These cut across multiple files and are easy to get wrong:

- **Feature-based layout (TRD §2.2):** `app/` (store, providers, router), `shared/{api,ui,lib}`, `features/*`, `pages/`, `locales/`. Business logic lives in hooks/services, not components.

- **Two API clients, on purpose (TRD §7):** RTK Query handles everything *except* `multipart/form-data`, where axios is used. Both must share the same auth header and the same single-flight 401-refresh logic. A reusable typed `FormData` builder lives in `shared/lib`.

- **The multipart product-create quirk (TRD §7):** `POST /Products` is multipart and its `Options` and `Variants` fields are **strings** — `JSON.stringify` those arrays into the form fields; `Images` are real binary parts; `TagIds` are repeated fields. Getting this wrong silently breaks product creation.

- **Create vs Edit are structurally different (TRD §5.3, §8.3):** Create = one multipart `POST /Products` with everything. Edit = **sectioned saves**, each section persisting via its own endpoint (base `PUT`, images, variants, options, stock). This is required by the API shape, not a UX choice.

- **Two-level catalog (TRD §6.1, §8):** Category → Subcategory → Product. A product attaches to a `SubCategoryId`, never a category. The product form's Category dropdown is a *filter only* (not sent to the API); only `SubCategoryId` is submitted. On edit, derive the category from the product's subcategory to pre-fill both dropdowns.

- **Auth & role gating (TRD §3):** tokens in `localStorage`, hydrated into Redux on load. After login, `GET /Auth/me` decides admin access; non-admins get a dedicated "Insufficient permissions" screen (not a crash/logout). Route guards: unauth → `/login`, non-admin → permissions screen, admin → full access.

- **Dark mode has one source of truth (TRD §1.1):** the Redux theme mode drives **both** MUI `palette.mode` and the Tailwind `dark` class on `<html>` — they must never disagree. Every screen needs a faithful dark variant even when the mockup is light-only.

- **Status → color is centralized (TRD §4, §13):** one status→color map reused across orders, payments, returns, and inventory pills. Never hardcode pill colors per screen.

- **i18n is mandatory (TRD §4.2):** no hardcoded display strings anywhere — all labels, headers, buttons, validation messages, empty states, and toasts go through i18next, with EN + RU parity.

- **Env:** `VITE_API_BASE_URL=https://fastcart-backend.onrender.com`. Backend is on Render's free tier and may cold-start slowly.
