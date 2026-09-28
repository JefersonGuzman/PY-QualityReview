# Design System — Sellervate Quality Review

Visual language for every screen of the app. First version: **white background, black text, grays for structure, and shadows for depth**. There are no accent or status colors yet. The feel (clean SaaS, soft corners, restrained, trustworthy) is inspired by sellervate.com, but the palette and components are our own and nothing is copied from that site.

This file defines *how things look*. It does not define behavior; behavior lives in `specs/`.

## Principles

1. **Monochrome and calm.** A review tool is mostly text. White surfaces, black type, gray structure.
2. **Depth comes from shadows and thin borders,** not from color fills. A white card on a white page needs both a 1px border and a soft shadow to be visible.
3. **Meaning never depends on color.** Statuses, scores and errors are conveyed with words, icons, weight and shape.
4. **Light only.** The app does not follow the OS dark mode. `color-scheme: light` is set explicitly; the scaffold's `prefers-color-scheme: dark` block (the cause of the black UI) is removed.
5. **Adding colors is a design change.** Accent or status colors are added here first, then applied (see "Deferred").

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `--page` | `#FFFFFF` | App background |
| `--surface` | `#FFFFFF` | Cards, header, panels, inputs |
| `--surface-muted` | `#F4F4F5` | Hover fill, table headers, selected rows, secondary badges |
| `--border` | `#E4E4E7` | Default borders and dividers |
| `--border-strong` | `#D4D4D8` | Input borders, emphasized dividers |
| `--text` | `#111111` | Body and headings (black) |
| `--text-muted` | `#52525B` | Secondary text, labels, placeholders (7.7:1 on white) |
| `--text-subtle` | `#A1A1AA` | Decorative only (icons, separators). Never for essential text |
| `--ink` | `#111111` | Primary button fill, selected-state border, focus ring |
| `--ink-hover` | `#27272A` | Primary button hover |
| `--ink-active` | `#3F3F46` | Primary button pressed |
| `--on-ink` | `#FFFFFF` | Text and icons on `--ink` |

Contrast: `--text` on white 18.9:1, `--on-ink` on `--ink` 18.9:1. All text tokens except `--text-subtle` pass 4.5:1 on `--page`, `--surface` and `--surface-muted`.

**Focus ring** (every interactive element): `0 0 0 2px #FFFFFF, 0 0 0 4px #111111`. Never remove the outline without this replacement.

## Shadows (elevation)

| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgba(17,17,17,0.06), 0 1px 1px rgba(17,17,17,0.04)` | Cards, header, inputs at rest |
| `--shadow-raised` | `0 4px 12px rgba(17,17,17,0.08)` | Hovered clickable cards/rows, sticky bars |
| `--shadow-overlay` | `0 12px 32px rgba(17,17,17,0.14)` | Menus, popovers, dialogs |

Rule: a card is `--surface` + 1px `--border` + `--shadow-card`. One elevation level per layer; do not stack shadows.

## Typography

- **Family:** Geist Sans (already loaded through `next/font`), fallback `system-ui, sans-serif`. Geist Mono only for code-like values. The body uses `var(--font-sans)`, not Arial.
- **Scale** (application UI):

| Role | Size / line height | Weight |
|---|---|---|
| Page title (`h1`) | 28px / 36px | 600 |
| Section title (`h2`) | 20px / 28px | 600 |
| Card title (`h3`) | 16px / 24px | 600 |
| Body | 14px / 22px (16px for long feedback text) | 400 |
| Label / small | 13px / 18px | 500 |
| Caption | 12px / 16px | 400 |

- Sentence case everywhere ("Switch user", not "SWITCH USER").

## Shape and spacing

- **Spacing:** 4px base scale (4, 8, 12, 16, 24, 32, 48). Cards use 16-24px padding; page gutters 24px.
- **Radius:** controls (buttons, inputs, badges) 8px; cards and panels 12px; pills fully round.
- **Layout:** content max-width 1200px, centered. Forms and pickers max-width 448px. Two-column layouts collapse to one column below 768px.
- **Motion:** 120-150ms ease-out on background, border and shadow only. No decorative animation.

## Components

### Buttons
Height 40px (36px compact), horizontal padding 16px, radius 8px, weight 500, 14px. Minimum target 40px.

| Variant | Fill | Text | Border | Hover | Use |
|---|---|---|---|---|---|
| Primary | `--ink` (black) | `--on-ink` | none | `--ink-hover` | One per view: the main action (e.g. "Submit review") |
| Secondary | `--surface` | `--text` | 1px `--border-strong` | fill `--surface-muted` | Everyday actions |
| Ghost | transparent | `--text` | none | fill `--surface-muted` | Low-emphasis actions, e.g. "Switch user" |
| Destructive | `--surface` | `--text` | 1px `--ink` | fill `--surface-muted` | Destructive actions: distinguished by its label ("Delete ...") and a confirmation step, not by color |

States: pressed (primary) = `--ink-active`; disabled = fill `--surface-muted`, text `--text-subtle`, no pointer; focus = focus ring; loading = keep width, swap label for a spinner and set `aria-busy`. Primary and Secondary carry `--shadow-card`.

### Inputs (text, textarea, select)
Height 40px (textarea min 96px), fill `--surface`, border 1px `--border-strong`, radius 8px, padding 0 12px. Focus: border `--ink` + focus ring. Error: border `--ink` at 2px plus an icon and a message below ("Enter a score from 1 to 5"), 13px. Labels above the field, 13px/500. Placeholder `--text-muted`.

### Cards and list rows
`--surface`, 1px `--border`, radius 12px, padding 16-24px, `--shadow-card`. Clickable rows (e.g. the user picker): hover `--shadow-raised` and fill `--surface-muted`; focus ring; selected = fill `--surface-muted` and 1px `--ink` border.

### Header and navigation
Header: white, 56px tall, 1px bottom `--border` and `--shadow-card`. Left: product name (16px/600). Right: active user name with role badge, then the "Switch user" ghost button.
Side or tab navigation: items 40px tall, `--text-muted`; active item `--text`, weight 600, fill `--surface-muted`, and a 2px `--ink` marker on the leading edge (or bottom edge for tabs). Items not built yet are muted and non-interactive.

### Badges
Pill, 12px/500, padding 2px 8px.

| Badge | Style |
|---|---|
| Role: Team Lead | 1px `--ink` border, `--text` |
| Role: Specialist | `--surface-muted` fill, 1px `--border`, `--text` |
| Status: Reviewed | `--ink` fill, `--on-ink`, check icon, label "Reviewed" |
| Status: Pending | 1px `--border-strong` outline, `--text-muted`, label "Pending" |

### Review score (1-5)
Shown as the number, the label and a five-dot meter, all black/gray, e.g. `4 · Good  ●●●●○`.

| Score | Label |
|---|---|
| 1 | Poor |
| 2 | Needs improvement |
| 3 | Acceptable |
| 4 | Good |
| 5 | Excellent |

Filled dots use `--ink`, empty dots `--border-strong`. The meter is decorative (`aria-hidden`); the number and label are the accessible text.

### Issue tags
Small pills (`--surface-muted`, `--text`, 13px, 1px `--border`) with a dismiss control only where editing is allowed.

### Feedback, empty and error states
- Inline message: `--surface-muted` fill, 3px `--ink` leading bar, icon + text (e.g. "Error: ..." or "Saved"). The word or icon carries the meaning, not a color.
- Empty state: centered, muted text, one sentence on what will appear, optionally one secondary button.
- Page-level errors say what happened and what to do next; no raw error codes.

## Accessibility
- Text contrast at least 4.5:1 (see tokens).
- Every interactive element has a visible focus ring and a minimum 40px target.
- No information is conveyed by color alone.
- Respect `prefers-reduced-motion`: drop transitions.

## Deferred (not in this version)
- **Accent color and status colors** (success, warning, danger, score scale). The monochrome patterns above stand in for them; if color is introduced later, it is defined in this file first.
- **Dark theme.** Not supported; the UI is always light.

## Implementation notes (Tailwind 4)
Tokens live in `app/globals.css` as CSS variables and are exposed to Tailwind through `@theme inline`, so components use utilities such as `bg-surface`, `bg-surface-muted`, `text-muted`, `bg-ink`, `border-border`, `shadow-card`. Components must not hard-code hex values or use raw Tailwind palette classes (`zinc-*`, `black`, `gray-*`); they use these tokens.

```css
:root {
  color-scheme: light;
  --page: #FFFFFF;          --surface: #FFFFFF;        --surface-muted: #F4F4F5;
  --border: #E4E4E7;        --border-strong: #D4D4D8;
  --text: #111111;          --text-muted: #52525B;     --text-subtle: #A1A1AA;
  --ink: #111111;           --ink-hover: #27272A;      --ink-active: #3F3F46;
  --on-ink: #FFFFFF;
}

@theme inline {
  --color-page: var(--page);            --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-border: var(--border);        --color-border-strong: var(--border-strong);
  --color-foreground: var(--text);      --color-muted: var(--text-muted);
  --color-subtle: var(--text-subtle);
  --color-ink: var(--ink);              --color-ink-hover: var(--ink-hover);
  --color-ink-active: var(--ink-active); --color-on-ink: var(--on-ink);
  --shadow-card: 0 1px 2px rgba(17,17,17,0.06), 0 1px 1px rgba(17,17,17,0.04);
  --shadow-raised: 0 4px 12px rgba(17,17,17,0.08);
  --shadow-overlay: 0 12px 32px rgba(17,17,17,0.14);
  --font-sans: var(--font-geist-sans);  --font-mono: var(--font-geist-mono);
}

body { background: var(--page); color: var(--text); font-family: var(--font-sans), system-ui, sans-serif; }
```
