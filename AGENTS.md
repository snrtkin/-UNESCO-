# AGENTS.md — Okayama UNESCO Web

Instructions for AI coding agents working on this repository.

## Project overview

Static website for the **岡山ユネスコ協会 (Okayama UNESCO Association)**. Primary audience and content are **Japanese** (`lang="ja"`). No npm, bundler, or framework — vanilla HTML, CSS, and JavaScript only.

| Area | Status |
|------|--------|
| `FRONT_END/` | Implemented; main deliverable |
| `BACK_END/` | Scaffold only (`Server.js`, `Config/`, `Model/`, `Routes/`); files are empty |

Human-facing setup notes live in `README.md`. This file is for agent-specific conventions and pitfalls.

## Quick commands

Serve the site from `FRONT_END` (paths are relative to that folder):

```bash
cd FRONT_END
python -m http.server 5500
```

Then open `http://localhost:5500/index.html`.

Alternative: VS Code **Live Server** on `FRONT_END/index.html`.

There is **no** `npm install`, `npm test`, or lint script. Verify changes by loading pages in a browser.

## Repository layout

```text
hackathon-unesco-web/
  AGENTS.md
  README.md
  FRONT_END/
    index.html              # Home (hero slider, sections, footer)
    pages/                  # All inner pages
    style/
      style.css             # Global styles, nav, footer, animations
      <page>.css            # Page-specific overrides
    script/
      index.js              # Shared behavior (required on most pages)
      <page>.js             # Optional page scripts (often minimal)
    images/                 # Logos, hero slides, photos
```

## Page map

| File | Purpose |
|------|---------|
| `index.html` | Landing page |
| `pages/aisatsu.html` | 会長挨拶 (chairperson message) |
| `pages/unesco-int.html` | 協会紹介 (association overview) |
| `pages/unesco-seukhai.html` | 活動紹介 / UNESCO & association activities |
| `pages/events.html` | イベント |
| `pages/membership.html` | 入会案内 + membership form |
| `pages/volunteer.html` | ボランティア申込 form |
| `pages/unesco-member.html` | 役員一覧 |
| `pages/kaisoku会則.html` | 会則 (bylaws) |
| `pages/designers.html` | Design credits |
| `pages/activities.html` | **Redirect only** → `unesco-seukhai.html` |

## Canonical navigation

When editing nav (sidebar + desktop menu), keep these five items consistent across **all** pages:

| # | Label | Href (from `pages/`) | Href (from `index.html`) |
|---|-------|----------------------|--------------------------|
| 01 | 会長挨拶 | `aisatsu.html` | `pages/aisatsu.html` |
| 02 | 協会紹介 | `unesco-int.html` | `pages/unesco-int.html` |
| 03 | 活動紹介 | `unesco-seukhai.html` | `pages/unesco-seukhai.html` |
| 04 | イベント | `events.html` | `pages/events.html` |
| 05 | 入会案内 | `membership.html` | `pages/membership.html` |

**Known drift:** Some pages still link item 02/03 to `unesco-seukhai.html` or `activities.html`. Align to the table above when touching nav. Use `activities.html` only as a legacy redirect, not as a nav target.

CONTACT button: `pages/membership.html` from home; `../index.html#contact` or `membership.html` from inner pages (match the nearest page’s pattern).

## Adding or editing a page

### HTML shell (required on standard pages)

Every content page should include:

1. `lang="ja"`, charset, viewport meta
2. Google Fonts: **Bodoni Moda** (headings) + **Instrument Sans** (body)
3. `../style/style.css` plus one page CSS file
4. Custom cursor: `#cursor-dot`, `#cursor-ring`
5. Sidebar overlay + offcanvas menu (`#sidebarMenu`, `#menuToggle`, `#closeToggle`, `#sidebarOverlay`)
6. Fixed navbar (`#navbar`)
7. Footer with logo, contact placeholders, social SVG icons, design credit → `designers.html`
8. `<script src="../script/index.js"></script>` before `</body>`

Home (`index.html`) uses paths **without** `../` (e.g. `style/style.css`, `pages/aisatsu.html`).

### CSS

- **Global tokens** live in `style/style.css` `:root`:

  ```css
  --navy, --navy-mid, --cream, --gold, --gold-light, --text-muted
  --sidebar-width, --nav-h, --ease-out-expo, --ease-spring
  ```

- Add page-specific rules in `style/<pagename>.css`; do not bloat `style.css` unless the change is truly global.
- Reuse existing classes: `content-wrapper`, `eyebrow`, `reveal`, `reveal-stagger`, `btn-discover`, `btn-back`, `section-tag`.
- `body { cursor: none; }` — interactive elements use `cursor: none` to match the custom cursor.

### JavaScript

- **`script/index.js`** — shared on almost every page: custom cursor, navbar scroll, sidebar open/close, IntersectionObserver for `.reveal` elements, hero slider (home only; guards with null checks).
- Add a page script only when needed: `script/<pagename>.js` and link it **after** `index.js`.
- Use vanilla DOM APIs; no jQuery or React.
- Forms are **client-side only** today (`preventDefault`, `alert`, or simulated async). Do not assume a backend API exists.

### Images

- Store assets in `FRONT_END/images/`.
- Some filenames contain **spaces** (e.g. `landing 1.jpg`). In HTML `src` they work as-is; in inline `background-image` use quoted URLs.
- Prefer `.avif`/`.jpg`/`.png` already in the folder; optimize size before adding large files.

## Design and content conventions

- Bilingual labels are common: English eyebrow + Japanese heading (e.g. `MESSAGE / 会長挨拶`).
- Placeholder contact info (`hello@flyward.co`, `info@unesco.okayama.jp`) — replace only when explicitly requested.
- Accessibility: use `aria-label` on icon-only controls, `role="dialog"` on sidebar, `aria-expanded` on menu toggle.
- Indentation in HTML varies (2 vs 4 spaces); **match the file you edit**, do not reformat whole files.

## File ↔ asset pairing

| Page | CSS | JS |
|------|-----|-----|
| `index.html` | `style.css` | `index.js` |
| `aisatsu.html` | `aisatsu.css` | `index.js` (`aisatsu.js` is empty stub) |
| `unesco-int.html` | `unesco-int.css` | `index.js` |
| `unesco-seukhai.html` | `unesco-seukhai.css` | `index.js` (`unesco-seukhai.js` has fade-in observer; not always linked) |
| `events.html` | `events.css` | `index.js` |
| `membership.html` | `membership.css` | `index.js`, `membership.js` (stub) |
| `volunteer.html` | `membership.css` (shared form styles) | `index.js` only — `volunteer.js` exists but is **not** wired |
| `unesco-member.html`, `kaisoku会則.html` | `governance.css` | `index.js` |
| `designers.html` | `style.css` + inline `<style>` | `index.js` |

Orphan / legacy files: `style/unesco.css`, `script/unesco.js`, `script/volunteer.js` — verify usage before editing or deleting.

## Agent workflow rules

1. **Minimize scope** — one page or one concern per change; avoid drive-by refactors.
2. **No new dependencies** unless the user asks (no React, Tailwind, npm lockfile, etc.).
3. **Update nav on every page** you touch if nav structure changes — copy from `unesco-int.html` or `index.html` as the reference.
4. **Do not commit** unless the user explicitly requests it.
5. **Do not add** markdown docs, README sections, or comments the user did not ask for.
6. When connecting forms to an API later, implement `BACK_END/Server.js`, `Config/db.js`, `Routes/auth.js`, `Routes/data.js`, and `Model/user.js` (folders exist; logic not written).

## Backend (future)

When `BACK_END/` is added:

- Volunteer and membership forms should POST to a real endpoint instead of `alert()` / simulated submit.
- Keep API base URL configurable (env or constant in JS) rather than hardcoding production URLs in HTML.

## Testing checklist

After edits, manually verify:

- [ ] Page loads with no console errors
- [ ] Sidebar opens/closes; Escape closes it
- [ ] Desktop and mobile nav links reach correct pages
- [ ] Images and fonts load (network tab)
- [ ] `.reveal` sections animate on scroll
- [ ] Forms show validation feedback (where implemented)
- [ ] Links from home use `pages/...`; links from inner pages use sibling `.html` or `../index.html`
