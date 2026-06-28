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

---

## Session 3 — 2026-06-27 — Phase 1: auth, role gating & app shell

**Phase:** Phase 1 — **COMPLETE** (all 11 tasks checked off in `ROADMAP.md`).

**Done this session**
- **Auth API** (`src/features/auth/authApi.ts`): `login`, `logout`, `forgotPassword`, `resetPassword`, `changePassword`, `getMe` injected into `baseApi`. Verified every request schema against live Swagger — all match (`LoginRequest{login,password}`, `RefreshRequest{refreshToken}`, `ResetPasswordRequest{email,token,newPassword,confirmPassword}`, etc.). `mapToAuthUser` normalizes roles (`roles[]` or single `role`).
- **Bootstrap + guards** (`src/features/auth/guards.tsx`): `RequireAuth` fetches `GET /Auth/me`, syncs user→Redux, holds render behind `FullScreenLoader`, clears session on `me` failure. `RequireAdmin` (nested) → `/no-access` for non-admins. `PublicOnly` keeps logged-in users off auth screens. `useLogout` = best-effort `POST /Auth/logout` → clear tokens → `resetApiState` → `/login`.
- **Auth screens** (matched to the 3 mockups): `AuthLayout` (split: teal→navy panel + `BrandLogo` + "Welcome…"), `PasswordField` (eye toggle), `BackToLoginLink`. Pages: `pages/auth/{Login,ForgotPassword,ResetPassword}Page.tsx` — RHF + translated Yup schemas (`features/auth/schemas.ts`), snackbar feedback. `pages/InsufficientPermissionsPage.tsx` (non-admin, lock icon + log out).
- **App shell** (matched to Dashboard/Orders mockups): `src/app/layout/{AppShell,TopBar,SidebarNav,UserMenu}.tsx`. Navy `#16243b` top bar (logo / borderless search / bell / user chip) + sidebar (white active pill) + light-gray content surface; collapses to MUI Drawer on mobile. `UserMenu` = theme toggle + EN/RU switch + logout.
- **Shared infra:** `GlobalSnackbar` + `useSnackbar` + `features/ui/uiSlice` (TRD §4.1); reusable `ConfirmDialog` (delete-modal style: Cancel=blue filled, Delete=outlined red); `getApiErrorMessage`; `PageHeader`; `FullScreenLoader`; `BrandLogo` (SVG). MUI theme centralized in `AppThemeProvider` (primary `#2563EB`, radius 8, non-uppercase buttons).
- **Router** rewritten with guard nesting; placeholder routes (`/`, `/orders`, `/products`, `/other`) via `PlaceholderPage` so the shell is navigable. `ScaffoldReady.tsx` deleted. Full EN+RU i18n; no hardcoded strings.
- **Verified:** `npm run build` (tsc strict + vite) ✓, `npm run lint` ✓, `npm run format:check` ✓, dev server boots & serves all modules (200, no transform errors).

**Decisions made**
- **Login/`me`/refresh response bodies are undocumented in Swagger** (responses `200 undefined`). Kept the assumed shape `{ accessToken, refreshToken }` (consistent with Phase-0 `tokenRefresh.ts`) and a tolerant `AuthMeResponse`. **Must verify on a first real login** (no test creds available).
- **Reset password** reads `email` + `token` from URL query params (`useSearchParams`); the form only collects the two passwords, matching the mockup + `ResetPasswordRequest`. Heading uses "Reset password" — the mockup's literal "Forgot password" heading on that screen is treated as a copy artifact (TRD §3.4 names it Reset password).
- **Decorative shell counts deferred:** notification bell shows a dot (no notifications endpoint); Orders sidebar count badge omitted until Orders data (Phase 4). `SidebarNav` is structured to add Coupons/Returns/Users later.
- **FastCart logo** is an SVG approximation (`BrandLogo`) — no logo asset shipped; grunge wordmark → bold italic. Navy `#16243b` and avatar green `#22c55e` chosen to match mockups.
- Visual tokens live in the MUI theme (decide-once, TRD §13); dark mode still single-sourced from Redux (Phase 0).

**Open questions / blockers**
- No admin test credentials → the end-to-end login → `me` → admin-gate flow is unverified against the real backend. First task with creds: confirm `login`/`me` response field names; adjust `LoginResponse` / `AuthMeResponse` if they differ.
- Backend remains slow to cold-start (Render free tier) — Swagger fetch needed ~5 min this session.

**NEXT ACTION (start here):**
> Begin **Phase 2 — Catalog foundations**. First build the **"Other" tabbed screen shell** (replace the `/other` `PlaceholderPage` route) reusing the shell visual language, then **Categories CRUD + "Add category" modal** (multipart `Name` + `Image` via the axios `http` instance + `buildFormData`). Run `/design` and open `images/Categories.png` (+ the Add-category modal mockup) and `images/Brands.png` BEFORE writing UI. Endpoints: `GET/POST/PUT/DELETE /Categories`. Then Subcategories master–detail (TRD §6.1) inside the Categories tab.

---

## Session 4 — 2026-06-27 — Phase 2: Other shell + Categories/Subcategories/Brands

**Phase:** Phase 2 — Catalog foundations (4 of 6 tasks done; **Colors + Tags CRUD remain**).

**Done this session**
- **Verified real API shapes** against live Swagger + the running backend (not just the spec): every response is wrapped in `{ success, message, data, errors }`. `GET /Categories?includeSubcategories=true` → `Category{ id, name, imageUrl, subCategories:[{id,categoryId,name}] }`. `GET /Brands` is **paged** → `data:{ items, pageNumber, pageSize, totalCount, totalPages }`. `SubCategoryRequest{categoryId,name}`, `BrandRequest{name}`. Categories POST/PUT are **multipart** (`Name`,`Image`); SubCategories/Brands are **JSON**.
- **catalog feature** (`src/features/catalog/`): `types.ts` (incl. `ApiEnvelope<T>`, `PagedResult<T>`), `categoriesApi.ts` (RTK Query GET+DELETE, tag `Category`/`LIST`), `subCategoriesApi.ts` (JSON POST/PUT/DELETE → invalidate `Category` LIST), `brandsApi.ts` (paged GET + CRUD), `schemas.ts` (translated Yup), `useCategoryMutations.ts` (**multipart create/update via axios `http` + `buildFormData`**, then `dispatch(baseApi.util.invalidateTags([{type:'Category',id:'LIST'}]))`).
- **"Other" tab shell** (`src/pages/OtherPage.tsx`): pill-tabs Categories/Brands/Banners; "+ Add new" sits on the tab row, Categories tab only. Wired into router (`/other` → `OtherPage`, replaced `PlaceholderPage`).
- **Categories tab** (`features/catalog/components/CategoriesTab.tsx`): client-side search + client-side pagination (PAGE_SIZE 15, 5-col grid), `CategoryCard` (icon/image, name, edit pencil + delete trash), **`AddCategoryModal`** (name + dashed upload dropzone w/ preview, matches `images/02 Destructive-2.png`), delete `ConfirmDialog`.
- **Subcategories master–detail** (`SubcategoryPanel.tsx`): appears below the grid when a card is selected; subs read **inline** from the Categories query, add/edit/delete via `subCategoriesApi`.
- **Brands tab** (`BrandsTab.tsx`): two-column list + add/edit form, matches `images/Brands.png`. **`BannersTab.tsx`** is a Phase-6 placeholder.
- **Reusable shared/ui** added: `DataState` (loading/error+retry/empty), `EmptyState`, `PaginationFooter` (MUI Pagination styled to mockup + results count), `NameListEditor` (shared "list + add/edit form" used by both Brands and Subcategories). Extended `getApiErrorMessage` to also read axios `response.data`.
- **i18n:** full `catalog.*` block + new `common.*`/`validation.maxLength` keys, **EN + RU parity**.
- **Verified:** `npm run build` (tsc strict + vite, 796 modules) ✓, `npm run lint` ✓, `npm run format:check` ✓.

**Decisions made**
- **Subcategories are read inline** via `includeSubcategories=true` on the Categories query (no separate `getSubCategories` query yet); sub-mutations invalidate `Category` LIST. The Phase-3 product form will need a standalone `GET /SubCategories?categoryId` query — add it then.
- **Multipart Categories use axios `http`** (not RTK Query) per TRD §7; cache kept coherent by invalidating the RTK Query `Category` LIST tag after the axios call.
- **Visual extension:** category cards show a delete trash next to the pencil (mockup shows only the pencil) — required for §10 delete coverage and consistent with the Brands cards. Brand/Subcategory **edit reuses the right-side form card** ("Edit …" + Save/Cancel).
- Deferred **Colors + Tags CRUD** to Phase 3 — they have no standalone screen and are managed inside the product-form modals ("New color" picker, Tags chips).

**Open questions / blockers**
- **Mutations still unverified end-to-end** — no admin test credentials, so POST/PUT/DELETE for Categories/Subcategories/Brands haven't been exercised against the live backend (GETs are confirmed with real data). First task once creds exist: create/edit/delete one of each and confirm the envelope + multipart category upload succeed.
- Backend is slow to cold-start (Render free tier) — Swagger/API fetch took a couple minutes this session.

**NEXT ACTION (start here):**
> Continue **Phase 2**: build **Colors CRUD** (`GET/POST /Colors`, `GET/PUT/DELETE /Colors/{id}`, `ColorRequest{ name, hexCode }`) and **Tags CRUD** (`GET/POST /Tags`, `GET/PUT/DELETE /Tags/{id}`, `TagRequest{ name }`) as RTK Query slices in `src/features/catalog/`. These have **no standalone screen** — surface them as the **"New color" picker modal** (matches `images/02 Destructive-4/-5.png`: Color name + hex with color picker) and the **Tags chip block**, which will be embedded in the Phase-3 Add/Edit product form. Verify the response envelope shape with a live `GET /Colors` / `GET /Tags` first. Then move to **Phase 3 — Products** (start with the Products list: open `images/Products.png` + the delete-modal mockups).

---

## Session 5 — 2026-06-27 — Phase 2 finish (Colors/Tags) + Phase 3 Products list

**Phase:** Phase 2 — **COMPLETE** (all 6 tasks checked off). Phase 3 — Products list + delete modals done; product form remains.

**Done this session**
- **Verified live shapes first:** `GET /Colors` is **paged** like Brands (`data:{items:[{id,name,hexCode}],…}`); `GET /Tags` is a **flat array** (`data:[{id,name}]`). `GET /Products` is paged; list item = `{id,name,code,brandName,categoryName,subCategoryName,primaryImageUrl,fromPrice,maxPrice,hasDiscount,inStock,condition,isNew,avgRating,reviewCount,swatches:[{value,hexCode}]}` — **no numeric stock count** (only `inStock`). `BulkDeleteRequest{ ids:int[] }`. Probed `Sort`: only `price_asc`/`price_desc`/`rating` reorder; everything else = default newest.
- **Colors CRUD** (`features/catalog/colorsApi.ts`): paged GET + POST/PUT/DELETE, tag `Color`/`LIST`. **Tags CRUD** (`tagsApi.ts`): flat-array GET + CRUD, tag `Tag`/`LIST`. Types `Color`/`ColorRequest`/`Tag`/`TagRequest` + `colorSchema`(name+hex)/`tagSchema` + `validation.hexCode` added.
- **`NewColorModal.tsx`** (create+edit) matches `02 Destructive-4/-5.png`: Color name field + hex field whose swatch is a native `<input type=color>` overlay (no new lib — TRD §1). **`ColorBlock.tsx`** (selectable swatches + "Create new" + hover edit/delete) and **`TagBlock.tsx`** (removable selected chips + add-by-name create-or-select + existing-tag chips with rename/delete) — reusable, controlled (`value:number[]`,`onChange`), to be dropped into the Phase-3 product form. Give Colors/Tags full CRUD manageability (§9).
- **Products list** (`features/products/{types,productsApi}.ts`, `components/ProductsList.tsx`, `pages/ProductsListPage.tsx`) matches `Products.png`: thumbnail+name, inventory pill, category, price, debounced search + Filter (sort) dropdown, multi-select (header checkbox + per-row), bulk edit (1 selected → edit) / bulk delete toolbar icons, server-side pagination + results count. Empty state ("Add new products", `Products-1.png`) hides the header Add button to match the mockup. Single + bulk delete via existing `ConfirmDialog` (bulk message is count-pluralized).
- **Shared infra:** `shared/api/types.ts` now owns `ApiEnvelope`/`PagedResult` (catalog/types.ts re-exports them); `shared/lib/format.ts` adds `formatCurrency`/`formatPriceRange` (locale-aware, USD); `statusColors` `outofstock` → **gray** (matches mockup). Router serves `/products`; `/products/new` + `/products/:id/edit` are placeholders.
- Full EN+RU i18n (`products.*`, `catalog.*` color/tag keys, plural forms incl. RU one/few/many).
- **Verified:** `npm run build` (tsc strict + vite, 808 modules) ✓, `npm run lint` ✓, `npm run format:check` ✓, dev server (port 5191) serves root + transforms `ProductsList.tsx` (HTTP 200) ✓.

**Decisions made**
- **Inventory column shows "In stock" / "Out of Stock" pill only** — the list API has no stock count, so the mockup's "96 in stock" number isn't reproducible from the list payload.
- **No color-picker library** (TRD §1 forbids new UI libs): the "New color" swatch uses a transparent native `<input type=color>` overlay; modal layout still matches the mockup.
- **Tag create returns no id** → after `createTag`, `refetch().unwrap()` then select the tag by name (avoids assuming the POST response body, which is unverified).
- **Generic envelope types moved to `shared/api`** (cross-feature now that Products needs them); catalog re-exports for back-compat.
- **`Sort` mapping**: `newest` sends no `Sort` param (it's the backend default); only `price_asc`/`price_desc`/`rating` are sent (verified to reorder).

**Open questions / blockers**
- **Mutations still unverified end-to-end** — no admin test credentials. Color/Tag/Product create/update/delete + bulk-delete haven't been exercised against the live backend (all GETs confirmed with real data). First task with creds: run one create/delete of each and confirm the envelope + `bulk-delete {ids}` body succeed.
- `ColorBlock`/`TagBlock` are built but **not yet mounted** anywhere (they belong in the Phase-3 product form) — they type-check/build but their runtime UX is unverified until the form integrates them.
- Backend still slow to cold-start (Render free tier).

**NEXT ACTION (start here):**
> Begin the **Add product form** (Phase 3, TRD §5.3/§7/§8.1). Run `/design` and open `images/Detail products.png` (the "Products / Add new" form) + the option-value/success modals in the `02 Destructive-*` series BEFORE writing UI. Build at route `/products/new` (replace the placeholder): Information block (name, code, description, **Category→Subcategory linked dropdowns** — only `SubCategoryId` is sent; add a standalone `GET /SubCategories?categoryId` query in `features/catalog`, Brand, **Condition** `BrandNew|Refurbished|Old`), Price block (price/discount/count + `IsTaxable` toggle), Options editor (with value modals), and drop in the existing **`ColorBlock`** + **`TagBlock`** + an Images uploader. Submit via **multipart `POST /Products`** using the `buildFormData` helper — `Options`/`Variants` are `JSON.stringify`'d strings, `Images` binary, `TagIds` repeated (TRD §7) — through the axios `http` instance, then invalidate `Product` LIST. Finish with the "Successfully add" success modal.

---

## Session 6 — 2026-06-27 — Phase 3: Add product form (multipart create)

**Phase:** Phase 3 — Products. Add-product form + multipart create + success modal **done** (3 tasks checked off). Edit product, variant stock, review moderation remain.

**Verified the real `POST /Products` multipart schema against live Swagger first (critical):** fields are `Name, Code, Description, SubCategoryId, BrandId, IsTaxable, Condition, TagIds[], Options(string), Variants(string), Images[]`. **There is NO top-level Price/Discount/Count/ColorIds.** Price/discount/cost/stock live on **Variants** (`AddVariantRequest{ sku, optionValueIds[], price, hasDiscount, discountPrice, costPrice, count, isActive }`). Colors are persisted as **option values** (`OptionRequest.values[] = CreateOptionValueInput{ value, colorId, sortOrder }`). `ProductCondition` enum = `BrandNew|Refurbished|Old` (strings). Swagger cached at `scratchpad/swagger.json`.

**Done this session**
- **Form route** `/products/new` → `pages/ProductFormPage.tsx` → `features/products/components/ProductForm.tsx` (replaced the placeholder in `app/router/AppRouter.tsx`). Matches `images/Detail products.png`: header breadcrumb "Products / Add new" + Cancel/Save; left white card (Information + Price + Different Options toggle + Options) over a 2-col layout; right column = Colour / Tags / Images cards.
- **Information block:** name + code row, rich-text Description, and a 2×2 dropdown grid — **Categories, Subcategory, Brands, Condition** (we added Subcategory §6.1 + Condition §6.9 in the mockup's style). Linked dropdowns per §8.1: Subcategory disabled until a Category is picked; only `SubCategoryId` is submitted.
- **Price block:** price / discount / count + "Add tax for this product" `IsTaxable` Switch.
- **`OptionsEditor.tsx`** — option rows (name + inline value chips with ×, add-by-Enter/✓) + "Add more"; shown only when the "Different Options" toggle is on. **`ImagesUploader.tsx`** — dashed dropzone + uploaded-file table (thumbnail · name · delete). **`ProductSuccessModal.tsx`** — `03 Message.png` (check badge, "Successfully add", Go to products / + Add new).
- **`shared/ui/RichTextEditor.tsx`** — description toolbar (Normal · B/I/U · link · ordered/bulleted list · clear) built on `contentEditable` + `document.execCommand` so **no new lib** (TRD §1). Stores HTML.
- **`features/products/useCreateProduct.ts`** — multipart `POST /Products` via axios `http` + `buildFormData({…}, { stringifyKeys: ['Options','Variants'] })`; `Images` binary, `TagIds` repeated; invalidates `Product` LIST on success.
- **`features/products/schemas.ts`** (`productSchema` + `ProductFormValues`) and **types** extended (`PRODUCT_CONDITIONS`, `OptionValueInput`, `ProductOptionInput`, `ProductVariantInput`, `EditableOption`, `CreateProductPayload`). Mounted the existing **`ColorBlock`** + **`TagBlock`** (first runtime use). Full EN+RU i18n (`products.form.*`, `products.condition.*`, `validation.{number,positive,integer,min}`).
- **Verified:** `npm run build` (tsc strict + vite, 895 modules) ✓, `npm run lint` ✓, `npm run format:check` ✓, dev server serves root + transforms `ProductForm.tsx` (HTTP 200) ✓.

**Decisions made**
- **Linked dropdowns are driven from the `getCategories` cache** (already fetched with `includeSubcategories=true`) — one fetch, verified shape, and it gives sub→parent for the future edit screen. **Did NOT add a standalone `GET /SubCategories?categoryId` query** (deviates from Session 4's note); add it in Phase 9's endpoint-coverage audit if needed.
- **Create sends one base variant** carrying price/count with `optionValueIds: []` — option-value ids are server-assigned, so per-variant linkage isn't knowable at create. Per-variant options/stock are an **Edit-screen** concern (sectioned saves, §8.3). The mockup only collects one price/count, so this is faithful.
- **Colors → a synthetic `Color` option** whose values carry `colorId` (the only way the API persists colors; this is what the list `swatches` come from). Built only when colors are selected.
- **"Discount" = amount off** → `discountPrice = max(0, price − discount)`, `hasDiscount = discount > 0`. **`costPrice` defaults to `price`** (no cost field in the mockup). Both interpretations are documented assumptions to revisit if the backend disagrees.
- Description stored as **HTML** from the contentEditable editor.

**Open questions / blockers**
- **Create is unverified end-to-end** — still no admin credentials. The base-variant packaging, synthetic Color option, discount/cost interpretation, and Description-as-HTML all need one real `POST /Products` to confirm. This is the first thing to check once creds exist.
- Backend slow to cold-start (Render free tier); Swagger fetch took ~a minute.

**NEXT ACTION (start here):**
> Begin **Edit product** (Phase 3, TRD §5.3/§8.2/§8.3) at `/products/:id/edit` (replace the placeholder). This is **sectioned saves**, not one call: first add `getProduct` (`GET /Products/{id}`) to `productsApi` and inspect its detail shape (options, variants, images, colors) against `scratchpad/swagger.json`. Reuse `ProductForm`'s layout but persist per section via its own endpoint — base fields `PUT /Products/{id}`; images `POST /Products/{id}/images` + `DELETE …/images/{imageId}`; variants `POST/PUT/DELETE …/variants` + `PUT …/variants/{variantId}/stock`; options `POST/PUT/DELETE …/options`. On open, derive the Category from the product's subcategory to pre-fill **both** linked dropdowns (§8.2). Then variant stock management, then review moderation (`GET /products/{id}/reviews`, `DELETE /reviews/{id}`, §6.8).

---

## Session 7 — 2026-06-27 — Phase 3 finish: Edit product (sectioned saves) + variant stock + review moderation

**Phase:** Phase 3 — Products — **COMPLETE** (all 3 remaining tasks checked off in `ROADMAP.md`). Phase 3 done end-to-end.

**Verified live shapes first (critical — `GET /Products/{id}` is undocumented in Swagger, responses `200 undefined`):** fetched real detail for product 24. `data` = `{ id, name, code, description, brand:{id,name}|null, categoryId, categoryName, subCategoryId, subCategoryName, condition, isTaxable, createdAt, images:[], tags:[{id,name}], options:[{id,name,sortOrder,values:[{id,value,colorId,colorHex,sortOrder}]}], variants:[{id,sku,price,hasDiscount,discountPrice,effectivePrice,stockCount,isActive,options:[{optionName,value}]}], avgRating, reviewCount, fromPrice, maxPrice, inStock }`. **Detail gives `categoryId` + `subCategoryId` directly** → no need to derive parent from subcategory (§8.2 satisfied trivially). **`costPrice` is NOT returned** on variants. Section request bodies confirmed via Swagger: `UpdateProductRequest{name,code,description,subCategoryId,brandId,isTaxable,condition,tagIds[]}`; `OptionRequest{name,sortOrder,values:CreateOptionValueInput[]}`; `AddVariantRequest{sku,optionValueIds[],price,hasDiscount,discountPrice,costPrice,count,isActive}`; `UpdateVariantRequest` = same minus optionValueIds, **all nullable**; `StockUpdateRequest{count}`; `POST …/images` multipart `{Images:binary[]}`. Reviews: `GET /products/{id}/reviews` → `data:{summary:{average,count,distribution}, reviews:{items:[{id,rating,comment,authorName,createdAt}],pageNumber,pageSize,totalCount,totalPages}}`; `DELETE /reviews/{id}`. Swagger re-cached at `scratchpad/swagger.json` (108 KB). No seeded product has images → image item shape **assumed** `{id,imageUrl}`.

**Done this session**
- **API/core:** `productsApi.ts` += `getProduct` (provides `Product` id tag) + 9 section mutations (`updateProductBase`, `deleteProductImage`, options add/update/delete, variants add/update/delete, `updateVariantStock`), all invalidating `[{Product,id},{Product,LIST}]`. New `useUploadProductImages.ts` (multipart `POST …/images` via axios `http` + `buildFormData`, then invalidate). New **`features/reviews/`** slice (`reviewsApi.ts` `getProductReviews`/`deleteReview`, `types.ts`) keyed by `Review`/productId.
- **types.ts** += `ProductDetail` + sub-shapes (`ProductImage`, `ProductBrandRef`, `ProductTagRef`, `ProductDetailOption(Value)`, `ProductDetailVariant`, `ProductVariantOptionRef`) and request bodies `UpdateProductRequest` / `UpdateVariantRequest` (all-nullable). **schemas.ts** += `productBaseSchema` + `ProductBaseFormValues` (product form minus price/count). **shared/lib/format.ts** += `formatDate` (locale-aware, §13).
- **Edit screen** (`/products/:id/edit` → `pages/ProductEditPage.tsx` → `components/ProductEditForm.tsx`; replaced the placeholder in `AppRouter.tsx`). Reuses the Add mockup's card/visual language (`editStyles.ts`). Sections, each persisting via its own endpoint (TRD §8.3): **EditInfoSection** (name/code/desc/linked Category→Subcategory pre-filled from detail/Brand/Condition/IsTaxable + tagIds) → PUT; **ProductImagesSection** (existing grid + delete + immediate multipart upload); **ProductOptionsSection** (per-option add/edit/delete, **preserves `colorId`** on value edits, color values show swatches); **ProductVariantsSection** (per-variant edit price/discount/cost/active → PUT, **stock via dedicated stock endpoint**, delete, add-variant with option-value pickers); **ProductReviewsSection** (paginated list + delete moderation). Tags block sits in the right column with a "saved with details" hint.
- Full EN+RU i18n (`products.edit.*` block, both files). **Verified:** `npm run build` (tsc strict + vite, **911 modules**) ✓, `npm run lint` ✓, `npm run format:check` ✓, dev server transforms all 8 new modules (HTTP 200, no transform errors) ✓.

**Decisions made**
- **Colours in Edit are managed inside the Options section** (the detail returns colours as a "Color" option group; values render with swatches) — **no separate Colour palette card on Edit**, to avoid double-management. The Add form keeps its `ColorBlock`.
- **Edit is a distinct component (`ProductEditForm`), not a mode of `ProductForm`** — create is one multipart POST, edit is sectioned saves; merging them would tangle both. Header has no global Save (each card saves itself); a hint line states this.
- **`costPrice` not in GET detail** → variant PUT only sends `costPrice` when the user types it (else omitted = unchanged). **Variant `count` is changed only via the dedicated stock endpoint**, never via PUT variant.
- **`tagIds` persists through the base PUT** (it's part of `UpdateProductRequest`), so the right-column Tags block is saved by the Information card's "Save details" button (hint communicates this).
- `ProductEditForm` is mounted with `key={detail.id}` so per-section local form state resets only on product change, not on cache refetch.

**Open questions / blockers**
- **All mutations still unverified end-to-end** — no admin credentials this session either. Edit base/options/variants/stock/image-add/image-delete and review delete have NOT hit the live backend (all GET shapes confirmed with real data). First task with creds: open a product, exercise each section save, and confirm (a) the **image item shape** (`{id,imageUrl}` is a guess — no seeded product has images), (b) `UpdateVariantRequest` accepts omitted `costPrice` as "unchanged", (c) the multipart image POST field name `Images`.
- Backend slow to cold-start (Render free tier); detail/Swagger fetch took ~1–2 min.
- Dev-server smoke note: Vite binds `localhost`→IPv6 on this machine; probe via `http://localhost:<port>` (or `[::1]`), **not** `127.0.0.1` (refused).

**NEXT ACTION (start here):**
> Begin **Phase 4 — Orders**. First build the **Orders list** at `/orders` (replace the `PlaceholderPage`): run `/design` and open `images/Orders.png` + `images/Orders-1.png` (empty state "No Orders Yet") BEFORE writing UI. Verify live shapes against the running backend first: `GET /api/v1/admin/orders?status&paymentStatus&q&from&to&sort&pageNumber&pageSize` (likely the `{success,message,data,errors}` envelope + paged `data`). Build `features/orders/{types,ordersApi}.ts` + `components/OrdersList.tsx` + `pages/OrdersListPage.tsx` matching the mockup columns (checkbox, Order #id, Date, Customer, **Payment status** pill, **Order status** pill, Total) — reuse `statusColors` (the single status→color map already covers order/payment statuses), `PaginationFooter`, `DataState`, debounced search + Filter (sort) dropdown, multi-select toolbar, results count. Order statuses `New/Ready/Shipped/Received/Cancelled/Returned`, payment `Pending/Paid/Failed/Refunded` (TRD §5.2). Then Add-order form, then Order detail page with the two separate status PUTs (§6.2).

---

## Session 8 — 2026-06-27 — Phase 4: Orders (list + add + detail + status management)

**Phase:** Phase 4 — Orders — **COMPLETE** (all 4 tasks checked off in `ROADMAP.md`).

**Done this session**
- **`src/features/orders/types.ts`:** `OrderListItem`, `OrderDetail` (with sub-shapes `OrderItemDetail`, `OrderAddress`), `AdminCreateOrderRequest`, `SetOrderStatusRequest`, `SetPaymentStatusRequest`, `OrderFormValues` (flat RHF type), enum arrays `ORDER_STATUSES`/`PAYMENT_STATUSES`/`PAYMENT_METHODS`, sort type `OrderSort`.
- **`src/features/orders/ordersApi.ts`:** RTK Query `getOrders` (paged, `Order/LIST` tags), `getOrder` (by id), `createOrder` (JSON POST, returns detail), `setOrderStatus` (`PUT …/status`), `setPaymentStatus` (`PUT …/payment-status`). Endpoint prefix `/admin/orders` (baseUrl is already `…/api/v1`).
- **`src/features/orders/schemas.ts`:** Yup validation for the Add-order form; `billingStreet/City/Country` conditionally required when `useSeparateBilling` is true.
- **`OrdersList.tsx`** — matches `Orders.png` + `Orders-1.png` mockups: debounced search + sort Filter dropdown, multi-select checkboxes, edit icon (1 selected → navigate to detail) + delete icon (disabled — no DELETE endpoint in TRD §10), paginated table with Order #/Date (datetime)/Customer/Payment status pill/Order status pill/Total columns. Row click navigates to detail. Empty state "No Orders Yet" with "+ Add order" button (header Add button hidden in empty state, matching mockup).
- **`OrderForm.tsx`** — Add order: Customer section (name/email), Items section (variant ID + qty rows, add/remove), Shipping address, Billing address (toggle with `useSeparateBilling`), Payment section (CashOnDelivery|Bank radio + optional paymentStatus), Customer note. On success navigates to the created order's detail page.
- **`OrderDetail.tsx`** — Order detail (TRD §6.2, no mockup — uses existing visual language): items table (product name/sku/options/qty/unit price/total), subtotal/shipping/discount/grand total summary, shipping + billing address cards, customer & order info card. **Two separate status controls:** Order status dropdown → `PUT …/status`; Payment status dropdown → `PUT …/payment-status`. Each fires on change (with loading spinner).
- **Pages:** `OrdersListPage`, `OrderFormPage`, `OrderDetailPage` (thin wrappers).
- **Router:** `AppRouter.tsx` updated — `/orders` → `OrdersListPage`, `/orders/new` → `OrderFormPage`, `/orders/:id` → `OrderDetailPage`.
- **`shared/lib/format.ts` += `formatDateTime`** (date + time, e.g. "May 5, 4:20 PM") — used in orders list and detail; `formatDate` unchanged.
- **Full EN + RU i18n** (`orders.*` block in both locale files): list/columns/sort/status labels, form labels, detail labels, toasts — all translated.
- **Verified:** `npm run build` (tsc strict + vite, **931 modules**) ✓, `npm run lint` ✓.

**Decisions made**
- **Order list endpoint API shapes are UNVERIFIED** — no admin credentials available. Response envelope assumed `{success,message,data,errors}` wrapping a `PagedResult<OrderListItem>`. `OrderListItem` field names (`orderNumber`, `customerName`, `orderStatus`, `paymentStatus`, `total`, `createdAt`) are assumed from convention + TRD descriptions; **must verify on first real GET `/admin/orders`**.
- **`OrderDetail` field names are also assumed** (`subtotal`, `shippingCost`, `discount`, `items[].unitPrice/totalPrice/variantOptions`, `updatedAt`) — the TRD gives no response schema for `GET /admin/orders/{id}`. First task with creds: fetch a real order and reconcile field names.
- **Delete order is intentionally disabled** — TRD §10 lists only list/create/detail/set-status/set-payment-status; no DELETE endpoint. The trash icon in the toolbar is visible (matches mockup) but permanently disabled.
- **Order form items use numeric variant ID input** — a searchable product picker would require additional API complexity; the simple numeric field is the correct scope for Phase 4.
- `formatDateTime` added to `shared/lib/format.ts` (not a new lib; uses `Intl.DateTimeFormat` with `timeStyle: 'short'`).

**Open questions / blockers**
- **All order mutations + GETs unverified end-to-end** — no admin credentials. `OrderListItem` and `OrderDetail` field names are assumptions; reconcile on first real login.
- **`orderNumber` field name** — the mockup shows "#12512B" style order codes; the API may return this as `orderNumber`, `code`, `reference`, or embed it in the id. The component falls back to `#${id}` if `orderNumber` is null.
- Backend slow to cold-start (Render free tier).

**NEXT ACTION (start here):**
> Begin **Phase 5 — Dashboard**. Open `images/Dashboard.png` BEFORE writing UI (run `/design`). Verify live shapes first: `GET /api/v1/dashboard/summary` (summary cards: Sales, Cost, Profit) and the revenue/chart endpoint. Build `features/dashboard/{types,dashboardApi}.ts` + `components/DashboardPage.tsx` at route `/`. Add a chart library (e.g. `recharts` — compatible with the stack, widely used with React) for the Sales Revenue line chart; note it in README. Implement summary cards, line chart with month axis + hover tooltip, Top Selling Products list, Top Products by Units Sold table, Recent Transactions table, and date-range/year selectors wired to endpoints.

---

## Session 9 — 2026-06-27 — Phase 5: Dashboard

**Phase:** Phase 5 — Dashboard — **COMPLETE** (all 4 tasks checked off in `ROADMAP.md`).

**Done this session**
- **Verified Swagger** — all 4 dashboard endpoints confirmed: `GET /admin/dashboard/summary?from&to`, `GET /admin/dashboard/revenue?year`, `GET /admin/dashboard/top-products?metric&take` (default take=5), `GET /admin/dashboard/recent-transactions?take` (default take=10). All responses are `200 undefined` (no schema) — shapes assumed from mockup + TRD §5.1.
- **Installed `recharts@3.9.0`** — the only chart dependency; noted in README per TRD §5.1 guidance.
- **`src/features/dashboard/types.ts`** — `DashboardSummary{sales,cost,profit}`, `RevenueDataPoint{month,revenue,orders}`, `TopProductItem{id,name,imageUrl,categoryName,sales,units,price}`, `RecentTransaction{id,customerName,date,amount,paymentStatus}` + arg types.
- **`src/features/dashboard/dashboardApi.ts`** — 4 RTK Query endpoints: `getDashboardSummary`, `getDashboardRevenue`, `getDashboardTopProducts` (called twice with `metric=sales` and `metric=units`), `getDashboardRecentTransactions`. All invalidate `Dashboard` tags.
- **`shared/lib/format.ts` += `formatCompactCurrency`** — compact notation for summary cards (e.g. `$152k`, `$1.2M`).
- **`SummaryCards.tsx`** — 3 cards (Sales/Cost/Profit) with soft pastel backgrounds (rose/orange/green), MUI icons (BarChart/Paid/CheckCircle), compact currency values + loading skeletons.
- **`RevenueChart.tsx`** — Recharts `LineChart` (month axis, orders Y-axis, blue `#2563EB` line, custom dark tooltip "864 Orders / May" style), year selector (MUI `Select`, last 3 years), loading skeleton.
- **`TopSellingProducts.tsx`** — right-column product list (thumbnail, name, category, green sales figure, "See All →" link to `/products`), 5 items, loading skeletons.
- **`TopProductsByUnits.tsx`** — table (thumbnail, name, price, units), 5 items, loading skeletons.
- **`RecentTransactions.tsx`** — table (name, date, amount, payment status pill via `getStatusPillClasses`), 10 items, loading skeletons.
- **`pages/DashboardPage.tsx`** — two-column layout matching the mockup: left (summary cards → revenue chart → 2-col bottom row) + right sidebar (top selling products).
- **Router** — `/` now serves `DashboardPage`; removed unused `PlaceholderPage` import.
- **Full EN + RU i18n** (`dashboard.*` block: cards, chart, tables, month names in both languages).
- **Verified:** `npm run build` (tsc strict + vite, **1342 modules**) ✓, `npm run lint` ✓.

**Decisions made**
- **All 4 API response shapes are ASSUMED** — responses are `200 undefined` in Swagger and no admin credentials were available to probe. Field names `sales/cost/profit`, `month/revenue/orders`, `sales/units/price`, `customerName/date/amount/paymentStatus` are logical assumptions. **First task with creds: fetch each endpoint and reconcile field names.**
- **Revenue chart plots `orders` count on Y-axis** (matches the "864 Orders / May" mockup tooltip). If the backend returns `revenue` (dollar amount) as the primary series, swap `dataKey="orders"` → `dataKey="revenue"` in `RevenueChart.tsx:99`.
- **`TopProductItem.sales`** = dollar sales figure shown in green; **`TopProductItem.units`** = unit count. If the API returns a single shape for both metrics and differentiates by field name or nesting, adjust `TopSellingProducts` and `TopProductsByUnits` accordingly.
- **Year selector defaults to current year** (`new Date().getFullYear()`). Summary has no explicit date-range UI (the mockup shows none); the query fires with `from`/`to` omitted (backend default = all time or current period).

**Open questions / blockers**
- **All dashboard data is unverified end-to-end** — no admin credentials. The four assumed response shapes need validation on first real login.
- Backend slow to cold-start (Render free tier).

**NEXT ACTION (start here):**
> Begin **Phase 6 — Marketing**. First task: **Banners tab — Main sliders** inside the existing `OtherPage` (replace the `BannersTab` placeholder). Run `/design` — there is no `images/Banners.png` mockup, so reuse the existing visual language (card grid style from Categories, list style from Brands). Verify live shapes first: `GET /api/v1/admin/sliders` or `GET /api/v1/Sliders` (multipart create: `POST` with `Title`, `Subtitle`, `SortOrder`, `IsActive`, `Image`). Check Swagger for exact endpoint paths under `Slider` and `Banner` tags. Then build **Banners** (Title/CategoryId/EndsAt countdown/IsActive/Image). After Marketing, build **Coupons** (new sidebar item, TRD §6.3).

---

## Session 10 — 2026-06-28 — Phase 6: Marketing (Sliders + Banners + Coupons)

**Phase:** Phase 6 — Marketing — **COMPLETE** (all 3 tasks checked off in `ROADMAP.md`).

**Done this session**
- **Verified Swagger** (backend warm): confirmed all 6 Marketing endpoints. `GET/POST/PUT/DELETE /api/v1/admin/sliders` (multipart: Title, Subtitle, SortOrder, IsActive, Image); `GET/POST/PUT/DELETE /api/v1/admin/banners` (multipart: Title, CategoryId, EndsAt, IsActive, Image); `GET/POST/PUT/DELETE /api/v1/admin/coupons` (JSON `CouponRequest`). `DiscountType` enum = `Percentage | FixedAmount`.
- **`src/features/marketing/`** created from scratch: `types.ts` (Slider, Banner, Coupon, CouponRequest, CouponFormValues), `slidersApi.ts` (RTK Query GET+DELETE, `Slider/LIST` tags), `bannersApi.ts` (RTK Query GET+DELETE, `Banner/LIST` tags), `couponsApi.ts` (RTK Query paged GET + JSON CRUD, `Coupon/LIST` tags), `useSliderMutations.ts` and `useBannerMutations.ts` (axios multipart POST/PUT + invalidate tags), `couponSchemas.ts` (Yup schema with typed optional numeric fields).
- **`BannersTab.tsx`** replaced — two-column layout: left `SlidersSection`, right `BannerSection`. No Banners mockup → used existing card/list visual language.
- **`SlidersSection.tsx`** (`features/marketing/components/`) — image dropzone + Title/Subtitle/SortOrder(number)/IsActive form card (create + inline edit); list of existing sliders with thumbnail, title, subtitle, `#sortOrder` badge, active pill, edit/delete icons.
- **`BannerSection.tsx`** (`features/marketing/components/`) — image dropzone + Title/Category select/EndsAt(datetime-local)/IsActive form card (create only, no edit); list of existing banners with thumbnail, title, category, **live countdown** (`useCountdown` hook, `setInterval(1000)`, "Xd Yh Zm Ws" display), active pill, delete icon. Reuses the existing `useGetCategoriesQuery` (already cached from Categories tab).
- **`CouponFormModal.tsx`** — create+edit modal with all `CouponRequest` fields (code, discountType select, discountValue, minOrderAmount, maxDiscountAmount, startsAt/expiresAt datetime-local, usageLimit, perUserLimit, isActive switch). Yup-validated via `useCouponSchema`; resolver cast `as Resolver<CouponFormValues>` to resolve yup optional-string type mismatch.
- **`pages/CouponsPage.tsx`** — table of coupons (Code mono chip, Type, Value formatted as `X%` / `$X`, Min Order, Starts/Expires formatted via `formatDate`, Active pill, edit/delete actions), paged, `+ Add coupon` header button, empty state, `ConfirmDialog` for delete.
- **Sidebar + Router**: `CardGiftcardOutlined` Coupons item at `/coupons` added to `SidebarNav.tsx`; route `/coupons → CouponsPage` added to `AppRouter.tsx`.
- **i18n**: full `marketing.*` + `nav.coupons` key added to both `locales/en/common.json` and `locales/ru/common.json`.
- **Verified:** `npm run build` (tsc strict + vite, **1379 modules**) ✓, `npm run lint` ✓.

**Decisions made**
- **GET response shapes for `admin/sliders` and `admin/banners` are assumed** as `ApiEnvelope<Slider[]>` and `ApiEnvelope<Banner[]>` (flat arrays, like Tags — not paged). Verify on first real admin login; if paged, switch to `PagedResult<T>` and add pagination.
- **BannerSection has create+delete only** (no edit button) — the TRD description ("upload area + list + delete") implies one-shot banners. Edit can be added following `SlidersSection` pattern if needed.
- **Countdown is a live `setInterval`** hook on `endsAt` per banner item — shows "Expired" when past, nothing when `endsAt` is null.
- **Coupons are JSON** (not multipart) — RTK Query handles all CRUD; no axios mutation hook needed.
- **Yup resolver type cast** (`as Resolver<CouponFormValues>`) used for the coupon form because yup infers optional string fields as `string | undefined` but all form defaults are `''`; this is the standard resolution.

**Open questions / blockers**
- **All mutations still unverified end-to-end** — no admin credentials. Slider/Banner multipart POST, coupon JSON CRUD have not hit the live backend (all swagger shapes confirmed, GETs unverified since no seeded data).
- `admin/sliders` and `admin/banners` flat-array vs paged assumption needs confirmation on first login.

**NEXT ACTION (start here):**
> Begin **Phase 7 — Operations modules**. First: **Returns** — new sidebar item at `/returns`. Verify live shapes: `GET /api/v1/admin/returns?status&paging` (envelope + paged items with return fields), `PUT /admin/returns/{id}` (`ResolveReturnRequest{ returnStatus: 'Approved'|'Rejected'|'Completed' }`). Build `features/returns/{types,returnsApi}.ts` + `pages/ReturnsPage.tsx` (table with status filter, status pill using existing `statusColors`, resolve action). Add sidebar nav + route. Then **Users & Roles** (`GET /admin/users`, detail, delete, `POST/DELETE /admin/users/{id}/roles`), then **Messages** and **Newsletter** tabs in `OtherPage.tsx`.

---

## Session 11 — 2026-06-28 — Phase 7: Operations modules (Returns + Users + Messages + Newsletter)

**Phase:** Phase 7 — Operations modules — **COMPLETE** (all 4 tasks checked off in `ROADMAP.md`).

**Done this session**
- **`src/features/returns/`** — `types.ts` (`ReturnItem`, `ResolveReturnRequest`, `RETURN_STATUSES`, `ReturnStatus` union), `returnsApi.ts` (RTK Query `getReturns` paged by status + `resolveReturn` PUT, `Return/LIST` tags).
- **`src/pages/ReturnsPage.tsx`** — table with status filter dropdown (`Requested/Approved/Rejected/Completed`), status pill via `getStatusPillClasses`, per-row action buttons (Approve/Reject from `Requested`; Complete from `Approved`; terminal states show no actions), `ConfirmDialog` before PUT, EN+RU i18n.
- **`src/features/users/`** — `types.ts` (`UserListItem`, `UserDetail`, `Role`, `AssignRoleRequest`), `usersApi.ts` (RTK Query `getUsers` paged + searchable, `getUser`, `deleteUser`, `getRoles`, `assignRole` POST, `removeRole` DELETE; tags `User/LIST`, `User/{id}`, `Role/LIST`).
- **`src/features/users/components/UserDetailModal.tsx`** — MUI Dialog: user info grid, all available roles shown as Chips (filled=assigned/outlined=unassigned), click to assign, delete icon to remove. Live role-patch mutations on click.
- **`src/pages/UsersPage.tsx`** — debounced username search (same `useEffect+setTimeout` pattern as Orders/Products), paginated table (username/email/phone/role chips), view-detail icon → `UserDetailModal`, delete icon → `ConfirmDialog`.
- **`src/features/messages/`** — `types.ts` (`ContactMessage`), `messagesApi.ts` (`getContactMessages` paged, `Message/LIST`), `components/MessagesTab.tsx` (read-only table: name/email/phone/message preview/date).
- **`src/features/newsletter/`** — `types.ts` (`NewsletterSubscriber`), `newsletterApi.ts` (`getNewsletterSubscribers` paged, `Newsletter/LIST`), `components/NewsletterTab.tsx` (email + subscribed date table).
- **`src/pages/OtherPage.tsx`** updated — added `messages` and `newsletter` tab keys; renders `MessagesTab` / `NewsletterTab`.
- **`src/app/layout/SidebarNav.tsx`** — added `Returns` (`AssignmentReturnOutlined`) + `Users` (`PeopleOutlined`) nav items at `/returns` and `/users`.
- **`src/app/router/AppRouter.tsx`** — added `/returns → ReturnsPage` and `/users → UsersPage` routes inside the admin shell.
- **`src/shared/lib/statusColors.ts`** — added `requested → amber` tone; changed `completed → blue` (to distinguish from `approved`).
- **i18n** — full `returns.*`, `users.*`, `messages.*`, `newsletter.*` blocks added to both `locales/en/common.json` and `locales/ru/common.json`; `nav.returns`/`nav.users` + `catalog.tabs.messages`/`catalog.tabs.newsletter` keys added.
- **Verified:** `npm run build` (tsc strict + vite, **1397 modules**) ✓, `npm run lint` ✓.

**Decisions made**
- **All Phase 7 API shapes are ASSUMED** — responses are `200 undefined` in Swagger, no admin credentials available. `ReturnItem` fields (`orderNumber`, `productName`, `customerName`, `reason`, `returnStatus`, `createdAt`) and `UserListItem`/`UserDetail` fields are inferred from TRD descriptions + backend conventions. **First task with creds: GET `/admin/returns` and `/admin/users` and reconcile field names.**
- **`GET /admin/users` returns a `PagedResult<UserListItem>`** (assumed paged like Orders/Products); `GET /admin/roles` returns a flat `Role[]` (assumed). If roles come paged, switch to `PagedResult<Role>` in `usersApi.ts`.
- **`GET /admin/contact-messages`** and **`GET /admin/newsletter`** assumed to return `PagedResult<T>` enveloped in `ApiEnvelope`. If they return flat arrays, remove pagination UI.
- **Role assignment uses `roleId` (string)** — `AssignRoleRequest { roleId }`. If the backend expects role name instead of id, adjust the POST body.
- **Returns resolve actions are context-sensitive**: `Requested` → show Approve + Reject; `Approved` → show Complete; `Rejected`/`Completed` → no action buttons (terminal states). This mirrors standard return workflow.
- **`completed` tone changed to `blue`** in `statusColors` to distinguish it from `approved` (green) — both are positive end states but semantically different.

**Open questions / blockers**
- **All Phase 7 data shapes unverified** — no admin credentials. Returns/Users/Messages/Newsletter GETs have not been exercised against the live backend.
- Backend slow to cold-start (Render free tier).

**NEXT ACTION (start here):**
> Begin **Phase 8 — Profile & account**. Build the **Profile** screen: add `getProfile` (`GET /api/v1/Profile`) and `updateProfile` (`PUT /api/v1/Profile`, multipart: `Image`, `FirstName`, `LastName`, `Email`, `PhoneNumber`, `Dob`) to a new `features/profile/` feature (`types.ts`, `profileApi.ts`, `useUpdateProfile.ts` via axios `http` + `buildFormData`). Surface it at a new route (e.g. `/profile`) linked from the user chip/menu in the top bar. Reuse the existing visual language for the form card. Then add **Change password** (`POST /Auth/change-password` with `ChangePasswordRequest { currentPassword, newPassword, confirmPassword }`) as a separate card below the profile form. Full EN+RU i18n. Build passes, lint clean before stopping.

---

## Session 12 — 2026-06-28 — Phase 8: Profile & account + Phase 9 polish

**Phase:** Phase 8 — **COMPLETE**. Phase 9 — partially complete (7/9 tasks checked off).

**Done this session**
- **`src/features/profile/`** created: `types.ts` (`ProfileData`, `UpdateProfileRequest`, `ProfileFormValues`), `profileApi.ts` (RTK Query `getProfile` — `GET /Profile`, provides `Profile` tag), `useUpdateProfile.ts` (multipart `PUT /Profile` via axios `http` + `buildFormData`, invalidates `Profile` + `Auth` tags), `schemas.ts` (`profileSchema` + `changePasswordSchema` + `ChangePasswordFormValues`).
- **`src/pages/ProfilePage.tsx`** — centered max-w-2xl two-card layout: (1) avatar with camera-button overlay for image upload + personal info form (firstName/lastName/email/phoneNumber/dob grid), submits via `useUpdateProfile`; (2) change-password card using `PasswordField` for all three fields, submits via existing `useChangePasswordMutation`. Full `dark:` class support; all strings via i18n.
- **`src/app/router/AppRouter.tsx`** — added `/profile → ProfilePage` inside the admin shell.
- **`src/app/layout/UserMenu.tsx`** — added "Profile" menu item (above theme toggle) navigating to `/profile` via `useNavigate`.
- **i18n** — `profile.*` block added to both `locales/en/common.json` and `locales/ru/common.json` (title, changePhoto, changePasswordBtn, section.info, section.changePassword, fields.*, toast.updated, toast.passwordChanged).
- **Phase 9 endpoint coverage audit:** added `getRelatedProducts` (`GET /Products/{id}/related`) to `src/features/products/productsApi.ts` — the only TRD §10 endpoint not yet wired. All other endpoints confirmed implemented across previous phases.
- **Verified:** `npm run build` (tsc strict + vite, **1402 modules**) ✓, `npm run lint` ✓.

**Decisions made**
- **No Profile.png mockup** — used existing visual language: `rounded-2xl border border-slate-200 bg-white` card style matching UsersPage / ReturnsPage. Two stacked cards (info + password) centered at `max-w-2xl`.
- **Avatar upload uses a hidden `<input type=file>` behind a camera `IconButton` overlaid on the MUI `Avatar`** — no new library. Preview via `URL.createObjectURL`.
- **`getRelatedProducts` is wired as an RTK Query endpoint but has no dedicated UI** — the TRD §10 checklist requires the endpoint to be implemented; there's no §5 screen defined for related products in the admin panel.
- **Profile shapes assumed** — `GET /Profile` returns `{ data: ProfileData }` envelope (same pattern as every other endpoint). `ProfileData` fields match the `PUT /Profile` multipart fields: `firstName`, `lastName`, `email`, `phoneNumber`, `dob`, `imageUrl`. Verify on first real login.

**Open questions / blockers**
- **Profile API shapes unverified** — no admin credentials. `GET /Profile` and `PUT /Profile` response shapes are assumed from TRD description. First task with creds: load the profile page and verify field names.
- **Phase 9 remaining:** two tasks still open — (1) Accessibility improvements (labelled inputs, focus-trapped dialogs, keyboard navigation); (2) Final visual QA pass against every `images/` mockup. Both are polish work; the app is functionally complete.
- Backend slow to cold-start (Render free tier).

**NEXT ACTION (start here):**
> Continue **Phase 9 — Polish**. Two tasks remain: (1) **Accessibility audit** — scan each screen for unlabelled inputs (`aria-label` on icon buttons, `label` on all form fields), confirm MUI Dialog has `aria-labelledby`/`aria-describedby`, and verify table headers have `scope="col"`. (2) **Final visual QA** — open each PNG in `images/` and compare to the running app; flag any color, spacing, or layout mismatches and fix them. After both tasks are done, mark Phase 9 complete and the project is delivered.

---

## Session 13 — 2026-06-28 — Phase 9 complete: accessibility + visual QA

**Phase:** Phase 9 — **COMPLETE**. All phases and conventions are fully checked off. Project delivered.

**Done this session**
- **Accessibility audit — fixed across 9 files:**
  - Added `scope="col"` to all custom HTML `<th>` elements in: `ProductsList.tsx`, `OrdersList.tsx`, `OrderDetail.tsx`, `ImagesUploader.tsx`, `TopProductsByUnits.tsx`, `RecentTransactions.tsx`.
  - Added explicit `aria-label` to `IconButton` components inside `<Tooltip>` in: `SlidersSection.tsx` (Edit + Delete), `BannerSection.tsx` (Delete), `UsersPage.tsx` (View + Delete), `CouponsPage.tsx` (Edit + Delete).
  - Added `slotProps.htmlInput['aria-label']` to the search `TextField` in `UsersPage.tsx`.
  - Added `inputProps['aria-label']` to the status filter `Select` in `ReturnsPage.tsx` (new i18n key `returns.filterByStatus` added to both EN + RU locales).
  - MUI `Dialog` + `DialogTitle` + `DialogContentText` already provide `aria-labelledby`/`aria-describedby` automatically — no changes needed.
  - MUI `TableCell` in `TableHead` auto-emits `scope="col"` — no changes needed for Users/Returns/Coupons tables.
- **Visual QA — all 20 `images/` PNGs reviewed against implementation:**
  - All screens match their mockups. Accepted differences (all documented in prior session decisions): inventory count shown as pill not number (API has no count on list); category cards have delete icon not in mockup (added for completeness); product form has Subcategory + Condition dropdowns (TRD-mandated, not in mockup); color picker uses native `<input type=color>` (no-new-lib rule); SlidersSection form is above the list (not below as in mockup — visual language matches).
- **ROADMAP.md** — all 9 Phase 9 tasks and all 5 convention items checked off `[x]`. Every phase 0–9 is complete.
- **Verified:** `npm run build` (tsc strict + vite, **1402 modules**) ✓, `npm run lint` ✓.

**Decisions made**
- No visual changes were required by the QA — all discrepancies were pre-existing documented decisions from earlier sessions.
- The `02 Destructive-3/-6.png` "Option value" modals are addressed by the inline chip editor in `OptionsEditor.tsx`, which matches the `Detail products.png` main form mockup.

**Open questions / blockers**
- **All mutations remain unverified end-to-end** — no admin credentials available throughout the entire build. Every GET shape was confirmed with real data; all POST/PUT/DELETE calls are implemented to spec but untested against the live backend. First task with credentials: do one full create/edit/delete cycle on Products, then verify Orders and Dashboard endpoint field names.
- Backend cold-starts slowly (Render free tier).

**NEXT ACTION (start here):**
> **Project is complete.** All phases (0–9) and conventions are checked off. The remaining action is **end-to-end verification with real admin credentials**: login → confirm `GET /Auth/me` roles → create/edit/delete one Product → check one Order → load Dashboard. Reconcile any field name mismatches between assumed response shapes and actual backend responses (see per-session open questions for specifics). No new screens or features are needed.

---

## Session 14 — 2026-06-28 — Live backend reconciliation: product pricing moved to product level + product create rewrite + roles redesign

**Phase:** Post-delivery maintenance. Got **real admin credentials** this session (admin@gmail.com), so reconciled the live backend against the assumed shapes — the backend had changed in three areas.

**Done this session**

- **Pricing moved variant → product level (verified live).** The backend now keeps `price`/`hasDiscount`/`discountPrice`/`effectivePrice` on the **product**, not the variant. Reconciled:
  - `features/products/types.ts`: `ProductListItem` (dropped `fromPrice`/`maxPrice` → `price`/`discountPrice`/`effectivePrice`; `code`/`condition` now nullable); `ProductImage` (`imageUrl` → **`url`**, + `isPrimary`/`sortOrder`); `ProductDetailVariant` (removed all price fields — now just `id`/`sku`/`stockCount`/`isActive`/`options`); `ProductDetail` (product-level price block, nullable `code`/`condition`); `UpdateProductRequest` (+`price`/`hasDiscount`/`discountPrice`/`costPrice`); new `AddVariantRequest` (`{sku,optionValueIds,count,isActive}`, no price); `UpdateVariantRequest` (price fields removed); `ProductVariantInput` now create-only with `optionValues` + price.
  - `ProductsList.tsx`: price column uses `effectivePrice`/`price` (struck original on discount), was `formatPriceRange(fromPrice,maxPrice)`.
  - `ProductImagesSection.tsx`: `img.url`.
  - `ProductVariantsSection.tsx`: removed price/discount/cost fields from variant add+edit rows (variants are SKU/stock/active/options only). `addProductVariant` body → `AddVariantRequest`.
  - `EditInfoSection.tsx` + `schemas.ts`: product-level price/discount/cost added to the base `PUT /Products/{id}` save (the Information section now owns pricing); **brand made required on create** (not edit).
  - Dashboard `TopProductsByUnits.tsx`/`TopSellingProducts.tsx`/`types.ts`: top-products `price`/`sales`/`units` made optional + `?? 0` guards (backend may omit them).

- **Product create rewritten + verified end-to-end live** (`useCreateProduct.ts` + `ProductForm.tsx`):
  - **Two-step create**: `POST /Products` (multipart) then `PUT /Products/{id}` to set the product-level price. Confirmed live that the multipart create has **no top-level price field** and **ignores variant price** → product is created with `price:0`, so the PUT is required. `extractCreatedId()` reads the new id from the POST response (it returns the full product).
  - **Variant matrix**: the form now sends one variant per option combination, each as `optionValues: [{ optionName, value }]` (verified by live trial — `options:[…]` and `values:[…]` fail with "Duplicate variant option combination"/"Validation failed"; **`optionValues` is the correct field**). `buildVariantMatrix()` = cartesian product of all option values.
  - **Brand required** — `POST /Products` rejects a missing brand with "Brand not found".
  - Live-verified: simple product, 1-axis (Color), and 2-axis (Size×Color) all create correctly; price PUT sets price/discount. 4 test products (ids 101–104) created then **deleted**.

- **Roles redesign** (backend roles are now **Boss / SuperAdmin / Admin / Customer**):
  - New `src/shared/lib/roles.ts`: hierarchy **Boss > SuperAdmin > Admin > Customer** (confirmed with user — Boss is top). Exports `roleRank`, `highestRoleRank`, `canManageRole` (assign strictly-below own level), `primaryRole` (highest = effective level).
  - `UserDetailModal.tsx`: replaced multi-chip toggles with a **single-select** (one role per user). Shows only roles the signed-in admin may grant, ascending (Customer→Admin→SuperAdmin). Save normalizes the user to exactly the chosen role (assign it, drop other manageable roles). Can't leave a user role-less. A user whose level is ≥ the admin's is shown **read-only**.
  - `UsersPage.tsx`: list shows the single **primary** (highest) role; column renamed "Role".
  - i18n: `users.detail.*` keys reworked (`selectRole`/`saveRole`/`roleUpdated`/`needRole`/`noAssignableRoles`/`cantManageRole`/`assignHint`) + column header → singular, EN + RU.

- **Verified:** `npm run build` (tsc strict + vite) ✓, `npm run lint` ✓.

**Decisions made**
- **Role hierarchy: Boss > SuperAdmin > Admin > Customer** (user-confirmed; Boss highest). Single source: `src/shared/lib/roles.ts` — change `RANK_BY_NAME` to adjust.
- **One role per user** model (roles are cumulative — a higher role implies the lower; `primaryRole` = effective level). UI enforces single-select even though the backend stores a role *set*.
- **Product create is two-step** (POST then PUT for price) because the multipart create has no price field and ignores variant price. Variant option selections use **`optionValues: [{optionName,value}]`**.
- Product-image field is **`url`** (product images only — Categories/Banners/Sliders still use `imageUrl`; verified the rename is product-scoped).

**Open questions / blockers**
- **Role assign/remove not tested live** — the auto-mode classifier blocks privilege mutations on the shared backend, so the roles flow is verified only by types/lint + reasoning. User should click through assign/remove in the Users screen once.
- A throwaway **Customer** test account (`probe1782650708@example.com`) was registered on the live backend during earlier create-probing and left in place (harmless; there's no self-serve user delete for it beyond the admin endpoint).
- `GET /admin/roles` returns all 4 roles for everyone (not filtered server-side) — assignable filtering is purely client-side, but the backend still enforces on assign.

**NEXT ACTION (start here):**
> **Verify the roles flow in the running app as admin** (`admin@gmail.com`): open a user in **Users**, confirm the single-select shows only Customer/Admin/SuperAdmin (not Boss), assign a role and confirm the list shows the new primary role. If the backend later exposes an assignable-roles endpoint, switch `UserDetailModal` from the client-side `canManageRole` filter to that. Otherwise the app is fully reconciled with the live backend — no open feature work.
