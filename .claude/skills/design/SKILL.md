---
name: design
description: Build any FastCart Admin screen to match its design. Enforces the TRD §0 workflow — open the matching mockup in images/ BEFORE writing UI, match it precisely, and for screens without a mockup reuse the existing visual language. Use before implementing or restyling any screen, modal, or component.
---

# /design — Match the FastCart design system

**The `images/` folder is the single source of truth for visual design.** The TRD describes *behavior*; the mockups define *appearance*. Never build a screen from prose or memory alone.

## Mandatory workflow for every screen

1. **Identify the screen** you're about to build and find its mockup. Use the mapping in `FastCart_Admin_TRD.md` §0; if filenames differ, **open the images and identify them by content**. Always re-scan `images/` first (new mockups may have been added).

2. **Open the mockup and look at it** (Read the PNG) *before* writing any UI. This step is not optional.

3. **Match it precisely:** layout, proportions, spacing, colors, typography, component styles, table styling, status pill colors, buttons, modals, empty states.

4. **For screens with NO mockup** (the §6 features: Subcategories, Order detail, Coupons, Returns, Users & Roles, Messages, Newsletter): reuse the **exact** visual language from existing mockups — same sidebar, top bar, table style, buttons, modal style, color tokens, empty-state pattern. The result must look like one cohesive product designed by one person.

## Shared visual rules (TRD §4)
- **Sidebar:** dark navy, icon + label, active item = white pill. New top-level items match this style.
- **Top bar:** logo left, centered search, notification bell + badge, user chip with caret.
- **Tables:** muted gray header, checkbox multi-select column, colored status pills, row actions (edit = blue pencil, delete = red trash), pagination footer + results count.
- **Status pills:** drive every pill from the **single status → color map** (Paid=green, Pending=gray, Ready=amber, Shipped=dark, Received=blue, etc.). Never hardcode per-screen.
- **Buttons:** primary = blue filled; secondary = outlined; destructive = outlined red.
- **Modals:** title + × close, body, right-aligned actions (Cancel + primary).
- **Empty states:** centered icon + heading + helper text + primary action.
- **Dark mode:** every screen needs a faithful dark variant (Tailwind `dark:` + MUI dark palette, driven by the single Redux theme source). Produce a dark equivalent even where the mockup is light-only.

## Implementation reminders
- MUI for interactive primitives; Tailwind for layout/spacing/custom visuals (TRD §1.1).
- All display text goes through i18next — no hardcoded strings, even in design work.

## Optional: Figma
The Figma MCP is connected. The TRD does **not** require Figma — `images/` is authoritative. Only use Figma tools if the user explicitly wants to import these mockups into a Figma file or sync code↔design; otherwise work directly from the `images/` PNGs.
