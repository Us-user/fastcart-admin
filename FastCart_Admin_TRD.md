# FastCart Admin Panel — Technical Requirements Document (TRD)

**Version:** 1.0
**Project type:** Standalone admin web application (separate from the storefront)
**Backend:** `https://fastcart-backend.onrender.com`
**API spec:** `https://fastcart-backend.onrender.com/swagger/v1/swagger.json`

---

## 0. How to use this document

This TRD is the single source of truth for **behavior, data flow, and scope**.

### Design source — the `images/` folder (READ THIS FIRST)

**All design mockups live in the `images/` folder at the root of the project. This folder is the single source of truth for visual design** (layout, spacing, colors, typography, component styling, empty states, modals).

**Mandatory workflow for every screen you implement:**
1. **Before writing any UI for a screen, open the matching mockup file in `images/` and look at it.** Do not build any screen from memory or from this document's prose alone — the prose describes *behavior*; the `images/` files define *appearance*.
2. Match the mockup precisely: layout, proportions, spacing, colors, fonts, component styles, status pill colors, table styling, buttons, modals, and empty states.
3. Do **not** invent a visual style for any screen that has a mockup in `images/`.
4. For screens that have **no** mockup (the features missing from the original design — see §6), reuse the **exact** visual language found in the `images/` mockups: same sidebar, same top bar, same table style, same buttons, same modal style, same color tokens, same empty-state pattern. The result must look like it was designed by the same person.

If `images/` contains files whose names differ from the mapping below, **match them by content** (open them and identify the screen) rather than skipping them. Always re-scan the `images/` folder at the start of work in case new mockups were added.

#### Mockup → screen mapping (files currently in `images/`)
| Mockup file | Screen it defines |
|---|---|
| Login screen | §3.4 Login (split layout, email/password, eye toggle, "Forgot password?", blue Log in) |
| Forgot-password screen | §3.4 Forgot password (email + "Send reset link") |
| Reset-password screen | §3.4 Reset password (password + confirm + "Reset") |
| Dashboard screen | §5.1 Dashboard (summary cards, revenue chart, top products, recent transactions) |
| Orders list + Orders empty state | §5.2 Orders list and "No Orders Yet" empty state |
| Products list + delete modals | §5.3 Products list, "Delete product" + "Delete Items" modals |
| Products / Add new | §5.3 Add/Edit product form (information, price, options, colour, tags, images) |
| Product success + option/color modals | §5.3 "Successfully add" modal, Option value modals, "New color" modal w/ picker |
| Products empty state | §5.3 "Add new products" empty state |
| Categories (Other tab) | §5.4 Categories grid + §6.1 Subcategories (master–detail) |
| Add category modal | §5.4 Add category modal (name + image upload) |
| Brands (Other tab) | §5.4 Brands list + Add new brand |
| Banners (Other tab) | §5.4 Main sliders + Banner (upload, title/subtitle, countdown/EndsAt) |

*(File names in the folder are screenshots; identify each by opening it. The table maps content, not exact filenames.)*

If anything in this document is ambiguous, prefer: (1) matching the mockup in `images/`, (2) matching the existing visual patterns from `images/`, (3) keeping behavior consistent with the rest of the panel.

---

## 1. Tech stack (mandatory — use only these)

| Concern | Technology | Notes |
|---|---|---|
| Language | **TypeScript** (strict mode) | `strict: true` in tsconfig. No `any` unless unavoidable and justified. |
| Framework | **React + Vite** | Function components + hooks only. No class components. |
| UI components | **MUI (Material UI)** | Inputs, selects, radios, checkboxes, slider, dialogs, menus, drawers, snackbars. |
| Styling / layout | **Tailwind CSS** | Layout, grid, spacing, custom visuals. **Dark mode via the `dark:` variant.** |
| Server state | **RTK Query** | All API calls + caching + invalidation. |
| Client state | **Redux Toolkit** | Auth tokens, theme mode, UI state. |
| Routing | **React Router** | Navigation + route guards. |
| Forms | **React Hook Form** | All forms. |
| Validation | **Yup** | Wired to RHF via `@hookform/resolvers`. |
| i18n | **i18next + react-i18next** | English + Russian. |
| HTTP fallback | **axios** | Only where RTK Query is awkward (e.g. multipart uploads). |

No other state managers, UI kits, form libraries, or styling systems may be introduced.

### 1.1 MUI + Tailwind coexistence
- Tailwind handles layout/spacing/grid and custom visual treatment.
- MUI handles interactive primitives (dialogs, selects, menus, snackbars, etc.).
- Disable MUI's CSS baseline conflicts where needed; ensure Tailwind's preflight and MUI styles do not fight. Document the chosen approach (e.g. Tailwind `important` strategy or scoping) in the README.
- Dark mode must be driven by a single source (the Redux theme mode) and applied to **both** MUI theme (`palette.mode`) and Tailwind (`dark` class on `<html>`), so the two never disagree.

---

## 2. Project setup & conventions

### 2.1 Bootstrapping
- Fresh Vite project: `react-ts` template.
- Node LTS. Package manager: npm (unless the team prefers otherwise).
- ESLint + Prettier configured; TypeScript strict.

### 2.2 Folder structure (feature-based)
```
src/
  app/                 # store, root providers, router
  shared/              # reusable ui, hooks, utils, types, constants
    api/               # base axios instance, RTK Query baseApi, interceptors
    ui/                # shared presentational components (matching mockup style)
    lib/               # helpers (formatting, multipart builders, etc.)
  features/
    auth/              # login, forgot, reset, me, guards
    dashboard/
    orders/
    products/
    catalog/           # categories + subcategories + brands + tags + colors
    marketing/         # banners + sliders + coupons + newsletter
    returns/
    users/             # users + roles
    messages/          # contact messages
    reviews/           # review moderation
  pages/               # route-level screens composing features
  locales/             # en/, ru/ translation files
```
Exact internal organization can be adjusted, but it must be **feature-based and consistent**.

### 2.3 Environment
- `VITE_API_BASE_URL` = `https://fastcart-backend.onrender.com`
- All API paths are versioned under `/api/v1`.

### 2.4 Code quality
- No business logic in components where it can live in hooks/services.
- All API endpoints typed. Define request/response TypeScript types for every endpoint used.
- All user-facing strings go through i18next — **no hardcoded display text** in components.

---

## 3. Authentication, authorization & token handling

### 3.1 Auth endpoints
- `POST /api/v1/Auth/login` — body `{ login, password }` → returns access + refresh tokens (and user info).
- `POST /api/v1/Auth/refresh` — body `{ refreshToken }`.
- `POST /api/v1/Auth/logout` — body `{ refreshToken }`.
- `POST /api/v1/Auth/forgot-password` — body `{ email }`.
- `POST /api/v1/Auth/reset-password` — body `{ email, token, newPassword, confirmPassword }`.
- `POST /api/v1/Auth/change-password` — body `{ currentPassword, newPassword, confirmPassword }`.
- `GET /api/v1/Auth/me` — current user (used for role check).

### 3.2 Token storage & lifecycle
- Store **access token and refresh token in `localStorage`**.
- On app load, hydrate auth state from `localStorage` into Redux.
- Attach `Authorization: Bearer <accessToken>` to every authenticated request (RTK Query base query + axios instance both).
- **Automatic refresh on 401:** implement an interceptor / RTK Query `baseQueryWithReauth`:
  1. On a 401, call `POST /Auth/refresh` with the stored refresh token.
  2. If refresh succeeds, store new tokens and **retry the original request once**.
  3. If refresh fails, clear tokens and redirect to login.
  - Guard against infinite loops and handle concurrent 401s (single-flight refresh).

### 3.3 Authorization (admin-only access)
- The panel logs in via the shared `Auth/login`. There is one token system.
- **After login, call `GET /Auth/me` and check whether the user has the admin role** (roles come from the user object / `admin/roles`).
- If the user **has** the admin role → allow into the panel.
- If the user **does not** have the admin role → show a dedicated **"Insufficient permissions"** screen. Do not hard-crash or silently log them out; show a clear message and a way to log out / go back. They must not be able to reach any admin route.
- Route guards: unauthenticated → redirect to `/login`. Authenticated but non-admin → "Insufficient permissions" screen. Authenticated admin → full access.

### 3.4 Auth screens (mockups provided)
- **Login** — split layout: dark branded panel on the left ("Welcome to admin panel" + FastCart logo), form on the right with Email, Password (with show/hide eye toggle), "Forgot password?" link, blue "Log in" button. Match the mockup exactly.
- **Forgot password** — same split layout; right side shows a back-to-login link, "Forgot password" heading, Email field, "Send reset link" button. Match the mockup.
- **Reset password** — same split layout; Password + Confirm password fields (each with eye toggle), "Reset" button. Match the mockup.

---

## 4. Global layout & shared UI (from mockups)

All authenticated screens share the same shell. Match the mockups:

- **Top bar:** FastCart logo (left), centered search field ("Search…"), right side has a notification bell with a count badge, and a user chip (avatar with initial, name "Randhir kumar", dropdown caret).
- **Left sidebar (dark navy):** nav items with icons. Original items: **Dashboard, Orders (with a count badge), Products, Other.** Active item is highlighted (white pill background). New top-level sections added by this project (see §6) must adopt the **same** nav item style, icons in the same style, same active-state treatment.
- **Content area:** white card surface on a light gray background; section title top-left (e.g. "Dashboard", "Orders", "Products").
- **Tables:** match the mockup table style — header row in muted gray, checkbox column for multi-select, status pills (colored), row actions (edit = blue pencil, delete = red trash), pagination footer ("← 1 2 3 … 24 →" with a results count like "274 Results").
- **Status pills:** colors per status as shown (e.g. Paid = green, Pending = gray, Ready = orange/amber, Shipped = dark, Received = blue). Keep a single mapping of status → color used everywhere.
- **Buttons:** primary = blue filled ("+ Add order", "Save", "Create"); secondary = outlined ("Cancel"); destructive confirm = outlined red ("Delete").
- **Modals/dialogs:** match the mockup modal style — title + close (×), body, right-aligned actions (Cancel + primary). Used for: delete confirmations (single + bulk), add category, add color, option value editing, success ("Successfully add"), etc.
- **Empty states:** match the mockups — centered icon + heading + helper text + primary action (e.g. "No Orders Yet", "Add new products").
- **Dark mode:** every screen must have a correct dark variant via Tailwind `dark:` + MUI dark palette. Where the mockup only shows light mode, produce a faithful dark equivalent using the same tokens.

### 4.1 Notifications / feedback
- Use MUI **snackbars** for success/error feedback on all mutations (create/update/delete).
- Confirmation dialogs for all destructive actions (single delete and bulk delete), matching the mockup "Delete Items" / "Delete product" modals.

### 4.2 Localization
- Full **English + Russian** translation files. Language switch available in the UI (e.g. in the user dropdown or settings). Default language: English. All labels, table headers, buttons, validation messages, empty states, and toasts must be translated.

---

## 5. Feature modules that EXIST in the mockups

### 5.1 Dashboard (mockup provided)
Endpoints:
- `GET /api/v1/admin/dashboard/summary?from&to` — Sales, Cost, Profit cards.
- `GET /api/v1/admin/dashboard/revenue?year` — Sales Revenue line chart (monthly).
- `GET /api/v1/admin/dashboard/top-products?metric&take` — "Top selling products" and "Top Products by Units Sold".
- `GET /api/v1/admin/dashboard/recent-transactions?take` — "Recent Transactions" table.

Requirements:
- Three summary cards (Sales `$152k`, Cost `$99.7k`, Profit `$32.1k` styled as in mockup).
- Sales Revenue line chart with month axis and a hover tooltip ("864 Orders / May" style). Use a charting approach compatible with the stack (a React chart lib is acceptable as a visual dependency; if one is added, note it). Match the mockup look.
- "Top selling products" list with thumbnail, name, category, sales figure, and "See All".
- "Recent Transactions" table (Name, Date, Amount, Status pill).
- "Top Products by Units Sold" table (Name, Price, Units).
- Date range / year selectors wired to the relevant endpoints.

### 5.2 Orders (list mockup + empty-state mockup provided; detail screen has NO mockup — see §6.2)
Endpoints:
- `GET /api/v1/admin/orders?status&paymentStatus&q&from&to&sort&pageNumber&pageSize` — list with filters.
- `POST /api/v1/admin/orders` — create order (`AdminCreateOrderRequest`).
- `GET /api/v1/admin/orders/{id}` — order detail.
- `PUT /api/v1/admin/orders/{id}/status` — set order status (`SetOrderStatusRequest`).
- `PUT /api/v1/admin/orders/{id}/payment-status` — set payment status (`SetPaymentStatusRequest`).

List requirements (match mockup):
- Columns: checkbox, Order (#id), Date, Customer, Payment status (pill), Order Status (pill), Total.
- Search box + Filter dropdown ("Newest" sort), edit/delete bulk actions, pagination with results count.
- Multi-select with bulk action toolbar.
- "+ Add order" primary button.
- Empty state "No Orders Yet" with "+ Add order" (match mockup).

Order statuses: `New, Ready, Shipped, Received, Cancelled, Returned`.
Payment statuses: `Pending, Paid, Failed, Refunded`.

Add order form (`AdminCreateOrderRequest`): customerName, customerEmail, items (list of `{ productVariantId, quantity }`), shippingAddress, optional billingAddress, paymentMethod (`CashOnDelivery | Bank`), optional paymentStatus, optional customerNote. Build a clean form; since there's no dedicated mockup for the create form internals, reuse the product/add-new form visual language.

### 5.3 Products (list mockup + add/new mockup + empty-state mockup + delete modals provided)
Endpoints:
- `GET /api/v1/Products?...` (rich filters: Q, CategoryId, SubCategoryId, BrandIds, ColorIds, TagIds, MinPrice, MaxPrice, Condition, MinRating, HasDiscount, IsNew, InStock, Sort, paging).
- `GET /api/v1/Products/{id}`, `GET /api/v1/Products/{id}/related`.
- `POST /api/v1/Products` — **multipart** create (see §7).
- `PUT /api/v1/Products/{id}` — update base fields only.
- `DELETE /api/v1/Products/{id}`, `POST /api/v1/Products/bulk-delete`.
- Images: `POST /api/v1/Products/{id}/images`, `DELETE /api/v1/Products/{id}/images/{imageId}`.
- Variants: `GET/POST /api/v1/Products/{id}/variants`, `PUT/DELETE /api/v1/Products/{id}/variants/{variantId}`, `PUT .../variants/{variantId}/stock`.
- Options: `POST /api/v1/Products/{id}/options`, `PUT/DELETE /api/v1/Products/{id}/options/{optionId}`.

List requirements (match mockup):
- Columns: checkbox, Product (thumbnail + name), Inventory ("96 in stock" / "Out of Stock" pill), Category, Price, Action (edit + delete).
- Search + Filter ("Newest"), bulk edit/delete, pagination + results count.
- Empty state "Add new products" (match mockup).
- Delete modals: single ("Delete product") and bulk ("Delete Items … delete 4 selected items?") — match mockups.

**Add / Edit product form** (match the "Products / Add new" mockup):
- **Information:** Product name, Code, rich-text Description (toolbar as shown), Categories dropdown, **Subcategory dropdown (added — see §6.1 / §8)**, Brands dropdown, **Condition dropdown (added — `BrandNew | Refurbished | Old`)**.
- **Price block:** Product price, Discount, Count; "Add tax for this product" toggle (`IsTaxable`).
- **Different Options toggle:** "This product has multiple options". When on, show **Options** editor:
  - Option rows (Option 1 "Size" → values S/M/L/XL; Option 2 "Weight" → values 10/20/40; "+ Add more").
  - Option value editing modals (match "Option 1" modals: add value, chips with × to remove, Save/Cancel).
- **Colour block (right):** preset color swatches + "Create new" → opens **New color** modal (Color name + hex with color picker; "Dark blue / #00599C" example). Maps to `Colors` API.
- **Tags block (right):** add tag by name (✓ to confirm) + removable tag chips ("T-Shirt ×", "Men Clothes ×", "Summer Collection ×"). Maps to `Tags` API.
- **Images block (right):** drag-and-drop / click to upload ("SVG, JPG, PNG…"), uploaded image list with file name + delete action.
- **Header actions:** Cancel + Save.
- **Success modal:** "Successfully add — Do you want to add new product to your store?" with "Go to products" + "+ Add new" (match mockup).

**Create vs Edit behavior (critical — see §7 and §8.3):**
- **Create** = one multipart `POST /Products` with everything (base fields + options + variants as JSON strings + image files).
- **Edit** = **sectioned saves** across multiple endpoints: base fields via `PUT /Products/{id}`; images via the images endpoints; variants via the variant endpoints; options via the option endpoints; stock via the stock endpoint. The edit screen presents these as cohesive sections, each persisting via its own endpoint. This is mandatory because the API is structured this way.

### 5.4 "Other" → Categories / Brands / Banners (mockups provided)
This is a tabbed screen. Existing tabs in mockups: **Categories, Brands, Banners.** This project **adds more tabs** (Subcategories, Messages, Newsletter — see §6) using the same tab styling.

**Categories tab** (mockup provided): grid of category cards (icon + name + edit pencil). "+ Add new" → **Add category** modal (Category name + image upload "Click to upload… SVG, JPG, PNG… 900×400"). Maps to `Categories` API (multipart: Name + Image). Pagination + results count as shown.
- **Subcategories** are integrated here per §6.1.

**Brands tab** (mockup provided): two-column — left list of brands (name + edit + delete), right "Add new brand" (Brand name + Create). Maps to `Brands` API.

**Banners tab** (mockup provided): two columns:
- **Main sliders** — upload area + list of slider images (thumbnail + file name + delete), Subtitle + Title fields, Save. Maps to `admin/sliders` (multipart: Title, Subtitle, **SortOrder**, IsActive, Image). **Add SortOrder control** per §6.10.
- **Banner** — upload area + image list, Categories dropdown, a countdown/duration field ("05d/23h/59m/35s" with a clock — maps to `EndsAt` date-time), Title field, Save. Maps to `admin/banners` (multipart: Title, CategoryId, EndsAt, IsActive, Image).

---

## 6. Feature modules that are MISSING from the mockups (must be designed & built)

For all of these, **there is no mockup** — build them in the **exact visual language** of the existing screens (sidebar, top bar, tables, cards, modals, status pills, empty states, dark mode). They must be indistinguishable in style from the designed screens.

### 6.1 Subcategories (CRITICAL — catalog cannot work without it)
The backend catalog is **two-level: Category → Subcategory → Product.** A product is attached to a **`SubCategoryId`**, never directly to a category.
Endpoints: `GET /api/v1/SubCategories?categoryId`, `GET /SubCategories/{id}`, `POST /SubCategories` (`{ categoryId, name }`), `PUT /SubCategories/{id}`, `DELETE /SubCategories/{id}`.

**UI decision (master–detail in the Categories tab):**
- In the "Other → Categories" screen, present a **master–detail** layout: the category cards/list on the left/top; selecting a category reveals **its subcategories** on the right/below as a compact list with add / edit / delete.
- Keep the category card visual from the mockup; subcategories use a clean list styled like the Brands list.
- Adding a subcategory uses a modal consistent with "Add category" (Subcategory name + the parent category is the selected one).

This is the cleanest representation of the two-level structure and avoids clutter.

### 6.2 Order detail + status management (CRITICAL)
The mockups only show the orders **list**. Build an **order detail page** (route by order id):
- Show order items (product, variant, qty, price), customer info, shipping/billing address, totals, payment method, timestamps.
- **Two separate controls**: an **Order status** dropdown (`New/Ready/Shipped/Received/Cancelled/Returned`) → `PUT /admin/orders/{id}/status`; and a **Payment status** dropdown (`Pending/Paid/Failed/Refunded`) → `PUT /admin/orders/{id}/payment-status`. They are two distinct API calls, hence two controls.
- Reach it by clicking an order row in the list.

### 6.3 Coupons / Discounts
Endpoints: `GET /api/v1/admin/coupons?paging`, `GET /admin/coupons/{id}`, `POST /admin/coupons`, `PUT /admin/coupons/{id}`, `DELETE /admin/coupons/{id}` (`CouponRequest`).
- **New top-level sidebar item: "Coupons."**
- Table of coupons + create/edit form: code, discountType (`Percentage | FixedAmount`), discountValue, minOrderAmount, maxDiscountAmount, startsAt, expiresAt, usageLimit, perUserLimit, isActive.
- Delete confirmation modal in the standard style.

### 6.4 Returns
Endpoints: `GET /api/v1/admin/returns?status&paging`, `PUT /admin/returns/{id}` (`ResolveReturnRequest` with `ReturnStatus`).
- **New top-level sidebar item: "Returns"** (or nested under Orders — implement as a top-level item for clarity).
- Table of return requests with status filter (`Requested/Approved/Rejected/Completed`) and actions to resolve (Approve / Reject / Complete) via the PUT endpoint.

### 6.5 Users & Roles
Endpoints: `GET /api/v1/admin/users?userName&paging`, `GET /admin/users/{id}`, `DELETE /admin/users/{id}`, `POST /admin/users/{id}/roles` (`AssignRoleRequest`), `DELETE /admin/users/{id}/roles/{roleId}`, `GET /admin/roles`.
- **New top-level sidebar item: "Users."**
- Users table with search by username + pagination; view a single user; delete a user; assign/remove roles (roles fetched from `admin/roles`).
- Role management UI (chips/checkboxes) consistent with the tag/option styling.

### 6.6 Contact messages (storefront inbox)
Endpoint: `GET /api/v1/admin/contact-messages?paging`.
- Add as a **tab under "Other" → "Messages"** (same tab style).
- Simple paginated list/table: name, email, phone, message, date. Read-only view of each message.

### 6.7 Newsletter subscribers
Endpoint: `GET /api/v1/admin/newsletter?paging`.
- Add as a **tab under "Other" → "Newsletter."**
- Paginated table of subscriber emails (and subscription date if present). Minimal screen.

### 6.8 Review moderation
Endpoints: `GET /api/v1/products/{productId}/reviews?paging`, `DELETE /api/v1/reviews/{id}`.
- Surface product reviews on the **product detail/edit screen** with a delete (moderate) action, since reviews are per-product. (A dedicated "Reviews" section is optional; integrating into the product screen is preferred to avoid an extra global list with no listing endpoint.)

### 6.9 Product `Condition` field
- Backend products carry `Condition` (`BrandNew | Refurbished | Old`). Add a **Condition dropdown** to the product Add/Edit form (Information block). It is part of create (multipart) and edit (`PUT /Products/{id}`).

### 6.10 Slider `SortOrder` (and Subtitle)
- `admin/sliders` supports `SortOrder` and `Subtitle`. Add an **order control** to each slider on the Banners tab (numeric order field or drag-and-drop reordering). Subtitle is already shown; ensure it is wired.

---

## 7. Multipart upload handling (important implementation note)

Several create/update operations are **`multipart/form-data`** because they include file uploads. RTK Query is awkward with `FormData` + nested-field serialization, so **use the axios instance for these**, while everything else uses RTK Query.

**Product creation is the key case.** `POST /Products` is multipart and, critically, its **`Options` and `Variants` fields are typed as plain strings**, not JSON objects. This means you must **`JSON.stringify` the options and variants arrays and place the resulting strings into the form fields**; the backend parses them server-side. Files (`Images`) are appended as real binary parts.

Conceptual shape of the request body:
```
Name:           "Men Grey Hoodie"
Code:           "MGH-001"
Description:    "<rich text/plain>"
SubCategoryId:  5
BrandId:        2
IsTaxable:      true
Condition:      "BrandNew"
TagIds:         [1,2,3]                       (repeated form fields)
Options:        "[{\"name\":\"Size\",\"values\":[...]}]"     ← STRING
Variants:       "[{\"sku\":\"...\",\"price\":49.9,\"count\":32,...}]" ← STRING
Images:         <file>, <file>, ...           ← real binary parts
```

Other multipart endpoints (no nested-string quirk, just files + fields):
- `POST/PUT /Categories` (Name, Image)
- `POST/PUT /admin/banners` (Title, CategoryId, EndsAt, IsActive, Image)
- `POST/PUT /admin/sliders` (Title, Subtitle, SortOrder, IsActive, Image)
- `PUT /Profile` (Image, FirstName, LastName, Email, PhoneNumber, Dob)

Provide a small reusable helper to build `FormData` from a typed object (handling arrays, files, and the stringified fields), and a shared axios instance that carries the auth token + reuses the same 401-refresh logic as RTK Query.

---

## 8. Catalog & product form logic (resolving the two-level structure)

### 8.1 Category ↔ Subcategory in the product form
- The product form has **two linked dropdowns**: **Category** (helper, used only to filter) → **Subcategory** (the value actually sent to the API as `SubCategoryId`).
- Selecting a Category loads its subcategories (`GET /SubCategories?categoryId=...`) and enables the Subcategory dropdown.
- If no Category is selected, the Subcategory dropdown is **disabled** with a hint.
- The **Category itself is not sent to the API** — only `SubCategoryId` is. Category exists purely to narrow the subcategory choices.

### 8.2 Editing a product
- When opening a product for edit, derive the product's subcategory, then set **both** the Category (parent of that subcategory) and the Subcategory dropdowns so the form is pre-filled correctly.

### 8.3 Sectioned save on edit (mandatory)
- Edit screen persists **per section**, each via its own endpoint (base info → `PUT /Products/{id}`; images → images endpoints; variants → variant endpoints; options → option endpoints; stock → stock endpoint).
- Present sections cohesively, but each section saves independently. This is required by the API design and is not optional.

---

## 9. Supporting catalog entities

- **Brands** — `GET/POST /Brands`, `GET/PUT/DELETE /Brands/{id}`. (Brands tab.)
- **Colors** — `GET/POST /Colors`, `GET/PUT/DELETE /Colors/{id}` (`ColorRequest`: name + hexCode). Used by the product Colour block + "New color" modal with picker.
- **Tags** — `GET/POST /Tags`, `GET/PUT/DELETE /Tags/{id}` (`TagRequest`: name). Used by the product Tags block.
- **Subcategories** — per §6.1.

These power the product form's dropdowns/chips and must be fully manageable.

---

## 10. Endpoint coverage checklist (the panel must implement ALL of these)

**Auth:** register* (optional for admin), login, refresh, logout, forgot-password, reset-password, change-password, me.
*(register is storefront-facing; include only if useful for admin account setup.)*

**Dashboard:** summary, revenue, top-products, recent-transactions.

**Orders (admin):** list, create, detail, set status, set payment-status.

**Products:** list, detail, related, create (multipart), update, delete, bulk-delete, images add/delete, variants list/add/update/delete, variant stock update, options add/update/delete.

**Catalog:** Categories CRUD, SubCategories CRUD, Brands CRUD, Colors CRUD, Tags CRUD.

**Marketing:** admin/sliders CRUD, admin/banners CRUD, admin/coupons CRUD, admin/newsletter list.

**Returns (admin):** list, resolve.

**Users (admin):** list, detail, delete, assign role, remove role; roles list.

**Messages (admin):** contact-messages list.

**Reviews:** list per product, delete (moderation).

**Profile:** get, update (multipart) — for the logged-in admin's own profile/settings, including change-password.

Endpoints intentionally **not** part of the admin UI (storefront/customer-only, listed for completeness): Cart, Wishlist, Addresses (customer), Orders checkout/cancel/return/pay (customer side), Coupons/validate, Newsletter/subscribe, Contact (submit), public Banners/Sliders/Categories/SubCategories GET, ProductReviews create. These are consumed by the storefront, not the admin.

---

## 11. Non-functional requirements

- **Responsive:** primarily a desktop admin; must remain usable down to tablet widths. Sidebar collapses to a drawer (MUI Drawer) on small screens.
- **Loading & error states:** every data screen shows loading skeletons/spinners and a clear error state with retry. Lists show the designed empty states.
- **Optimistic where safe / invalidation always:** use RTK Query cache invalidation after mutations so lists refresh. Optimistic updates optional for toggles.
- **Accessibility:** label all inputs, dialogs focus-trap (MUI handles most), keyboard-navigable tables/menus.
- **Type safety:** request and response types defined for every endpoint; no untyped network data flowing into components.
- **i18n completeness:** no untranslated strings; EN + RU parity.
- **Consistent status color mapping** in one place, reused across orders, payments, returns, inventory.
- **Security:** never log tokens; clear tokens on logout (`POST /Auth/logout` + local clear); guard all routes.

---

## 12. Deliverables

1. A standalone Vite + React + TS admin app using exactly the stack in §1.
2. All screens from the mockups, **visually matched to the screenshots in the project folder.**
3. All missing screens (§6) built in the same visual language.
4. Full EN + RU localization.
5. Working auth with localStorage tokens, 401-refresh, and admin-role gating with an "Insufficient permissions" screen.
6. Complete endpoint coverage per §10.
7. README documenting setup, env vars, the MUI+Tailwind dark-mode approach, and the multipart helper.

---

## 13. Open conventions (decide once, apply everywhere)
- Status → color map (single source).
- Date/number/currency formatting (locale-aware).
- Pagination page size default (match backend default of 20 unless a mockup implies otherwise).
- Toast copy patterns for success/error.
- Form validation messages (Yup schemas per entity, translated).

---

### Reminder
**Behavior = this document. Visual design = the mockups in the `images/` folder.** Before implementing any screen, open its matching file in `images/` and build to match it. For screens without a mockup, copy the existing visual language from `images/` faithfully so the whole panel looks like one cohesive product. Re-scan `images/` at the start of each work session in case new mockups were added.
