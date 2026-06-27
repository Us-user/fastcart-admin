# FastCart Admin Panel — Build Roadmap

> **Single source of behavior:** `FastCart_Admin_TRD.md`
> **Single source of visual design:** the `images/` folder (open the matching mockup before building any screen).
> This roadmap slices the TRD into ordered, logical phases. Work top-to-bottom; later phases depend on earlier ones.

## How this roadmap is used
- `/start` reads this file + `SESSION_NOTES.md`, finds the first unchecked task, and continues from there.
- `/stop` checks off what was completed, records progress in `SESSION_NOTES.md`, and pushes to GitHub.
- Check a box `- [x]` only when the task is implemented **and** matches its mockup (or the mockup visual language, for §6 screens).

## Status legend
- `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 0 — Scaffolding & infrastructure
*Goal: an empty-but-wired app that builds, lints, has the full stack installed, dark mode + i18n + store + API layer in place. No business screens yet.*

- [x] Scaffold fresh Vite `react-ts` project at repo root (preserve `images/`, TRD, roadmap, `.claude/`).
- [x] Install stack (TRD §1): MUI, Tailwind, Redux Toolkit + RTK Query, React Router, React Hook Form, Yup + `@hookform/resolvers`, i18next + react-i18next, axios.
- [x] TypeScript strict mode (`strict: true`); ESLint + Prettier configured. *(swapped scaffold's oxlint → ESLint flat config per TRD)*
- [x] Feature-based folder structure (TRD §2.2): `app/`, `shared/{api,ui,lib}`, `features/*`, `pages/`, `locales/`. *(`shared/ui` populates as shared components are built)*
- [x] Env: `VITE_API_BASE_URL=https://fastcart-backend.onrender.com`; commit `.env.example`.
- [x] MUI + Tailwind coexistence (TRD §1.1): resolve preflight/baseline conflicts; document approach in README.
- [x] Dark mode from a single source (Redux theme mode) → drives MUI `palette.mode` **and** Tailwind `dark` class on `<html>`.
- [x] Redux store + typed hooks (`useAppDispatch`/`useAppSelector`).
- [x] RTK Query `baseApi` with `baseQueryWithReauth` (401 → refresh → retry once → logout; single-flight, no loops) (TRD §3.2).
- [x] Shared axios instance: auth header + same 401-refresh logic (for multipart) (TRD §7).
- [x] Reusable typed `FormData` builder (arrays, files, `JSON.stringify`'d Options/Variants) (TRD §7).
- [x] i18n bootstrap: `en` + `ru` resource files, language detector, default EN (TRD §4.2).
- [x] Single status → color map module (orders/payments/returns/inventory) (TRD §4, §13).

## Phase 1 — Auth, role gating & app shell
*Goal: log in, refresh, admin-only access, and the shared layout every screen lives in.*

- [x] Auth endpoints (TRD §3.1): login, refresh, logout, forgot-password, reset-password, change-password, me.
- [x] Token storage in `localStorage` + hydrate into Redux on load (TRD §3.2).
- [x] **Login** screen — split layout, email/password, eye toggle, "Forgot password?", blue Log in (match mockup).
- [x] **Forgot password** screen (match mockup).
- [x] **Reset password** screen (match mockup).
- [x] `GET /Auth/me` → admin-role check; **"Insufficient permissions"** screen for non-admins (TRD §3.3).
- [x] Route guards: unauth → `/login`; non-admin → permissions screen; admin → full access.
- [x] App shell: top bar (logo, search, notification bell + badge, user chip), dark navy sidebar (active pill), content card surface (TRD §4).
- [x] Global MUI snackbar system for mutation success/error (TRD §4.1).
- [x] Reusable confirm dialog matching the delete-modal style.
- [x] Theme toggle + language switch in the UI (user dropdown) (TRD §4.2).

## Phase 2 — Catalog foundations
*Goal: the entities the product form depends on. Build before Products.*

- [x] Categories CRUD + **Add category** modal (multipart Name + Image) (TRD §5.4).
- [x] Subcategories master–detail inside the Categories tab (Category → Subcategory) (TRD §6.1, §8).
- [x] Brands CRUD — two-column list + Add new brand (TRD §5.4, §9).
- [x] Colors CRUD — used by product Colour block + "New color" picker modal (TRD §9).
- [x] Tags CRUD — used by product Tags block (TRD §9).
- [x] "Other" tabbed screen shell hosting Categories / Brands / Banners (+ later tabs).

## Phase 3 — Products
*Goal: the largest module — list, create (multipart), edit (sectioned), variants/options/images.*

- [x] Products list (thumbnail, inventory pill, category, price), search + filter, multi-select, pagination + results count (TRD §5.3).
- [x] Empty state "Add new products"; single + bulk delete modals.
- [x] **Add product** form — Information (incl. linked Category→Subcategory, Brand, **Condition** `BrandNew|Refurbished|Old`), Price block (+ `IsTaxable`), Options editor, Colour block, Tags block, Images uploader (TRD §5.3, §6.9, §8.1).
- [x] Multipart create `POST /Products`: Options/Variants `JSON.stringify`'d into string fields, Images as binary, TagIds repeated (TRD §7).
- [x] "Successfully add" success modal.
- [x] **Edit product** — sectioned saves: base (`PUT`), images, variants, options, stock — each via its own endpoint (TRD §5.3, §8.3).
- [x] Variant stock management; product detail/related as needed.
- [x] Review moderation on the product screen (list per product + delete) (TRD §6.8).

## Phase 4 — Orders
- [x] Orders list — columns + payment/order status pills, search, filter/sort, multi-select, pagination, empty state "No Orders Yet" (TRD §5.2).
- [x] **Add order** form (`AdminCreateOrderRequest`), reuse product-form visual language.
- [x] **Order detail** page (route by id): items, customer, addresses, totals (TRD §6.2).
- [x] Two separate controls: Order status (`New/Ready/Shipped/Received/Cancelled/Returned`) + Payment status (`Pending/Paid/Failed/Refunded`) → two PUT endpoints.

## Phase 5 — Dashboard
- [x] Summary cards (Sales / Cost / Profit) from `dashboard/summary` (TRD §5.1).
- [x] Sales Revenue line chart with month axis + hover tooltip (add a chart lib; note it in README).
- [x] Top selling products + Top Products by Units Sold + Recent Transactions.
- [x] Date-range / year selectors wired to endpoints.

## Phase 6 — Marketing
- [x] Banners tab: **Main sliders** (multipart Title/Subtitle/**SortOrder**/IsActive/Image + order control) (TRD §5.4, §6.10).
- [x] Banners tab: **Banner** (Title/CategoryId/**EndsAt** countdown/IsActive/Image) (TRD §5.4).
- [x] **Coupons** — new sidebar item: table + create/edit form + delete modal (`CouponRequest`) (TRD §6.3).

## Phase 7 — Operations modules (no mockups — match existing visual language)
- [x] **Returns** — new sidebar item: table + status filter + resolve (Approve/Reject/Complete) (TRD §6.4).
- [x] **Users & Roles** — new sidebar item: list/search, detail, delete, assign/remove roles (TRD §6.5).
- [x] **Messages** — "Other" tab: paginated contact-messages list (read-only) (TRD §6.6).
- [x] **Newsletter** — "Other" tab: paginated subscribers list (TRD §6.7).

## Phase 8 — Profile & account
- [x] Profile get + update (multipart `PUT /Profile`) (TRD §10).
- [x] Change password flow (`POST /Auth/change-password`).

## Phase 9 — Polish, NFRs & delivery
- [x] Responsive down to tablet; sidebar → MUI Drawer on small screens (TRD §11).
- [x] Loading skeletons + error/retry states on every data screen.
- [x] RTK Query cache invalidation after all mutations.
- [x] Dark-mode parity on every screen (faithful dark equivalents where mockups are light-only).
- [x] i18n completeness — EN + RU parity, zero hardcoded display strings.
- [ ] Accessibility — labelled inputs, focus-trapped dialogs, keyboard-navigable tables/menus.
- [x] README (setup, env, MUI+Tailwind dark-mode approach, multipart helper) (TRD §12).
- [x] **Endpoint coverage audit against TRD §10** — confirm every required endpoint is implemented.
- [ ] Final visual QA pass against every mockup in `images/`.

---

## Conventions — decide once, apply everywhere (TRD §13)
- [x] Status → color map (single source).
- [~] Locale-aware date / number / currency formatting. *(currency/number done — `shared/lib/format.ts`; date formatting pending)*
- [ ] Default pagination page size (backend default 20 unless a mockup implies otherwise).
- [~] Toast copy patterns (success / error). *(global snackbar + `getApiErrorMessage` fallback established; per-entity copy fills in per phase)*
- [~] Yup validation schemas per entity (translated messages). *(auth schemas done; other entities per phase)*
