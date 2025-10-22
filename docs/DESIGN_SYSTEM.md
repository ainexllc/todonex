# NoteNex Design System

**Version**: 1.0.0
**Last Updated**: January 2025

A comprehensive design system for building applications with the NoteNex look and feel. This document captures every visual specification, color token, and component style for consistent cross-project implementation.

---

## Table of Contents

1. [Container Width System](#container-width-system)
2. [Color System](#color-system)
3. [Top Navigation](#top-navigation)
4. [Sidebar & Menus](#sidebar--menus)
5. [Card Components](#card-components)
6. [Typography](#typography)
7. [Shadows & Effects](#shadows--effects)
8. [Border Radius](#border-radius)
9. [Spacing System](#spacing-system)
10. [Implementation Guide](#implementation-guide)

---

## Container Width System

Responsive container widths that adapt to common screen resolutions, ensuring consistent content presentation across all devices.

### Breakpoints & Max-Widths

| Screen Size | Resolution | Max Width | Padding | Tailwind Breakpoint |
|------------|-----------|-----------|---------|---------------------|
| **Mobile Small** | 320px - 374px | 100% | 16px (px-4) | - |
| **Mobile** | 375px - 424px | 100% | 16px (px-4) | - |
| **Mobile Large** | 425px - 767px | 100% | 24px (px-6) | sm: 640px |
| **Tablet** | 768px - 1023px | 720px | 24px (px-6) | md: 768px |
| **Tablet Landscape** | 1024px - 1279px | 960px | 32px (px-8) | lg: 1024px |
| **Desktop** | 1280px - 1439px | 1184px | 48px (px-12) | xl: 1280px |
| **Large Desktop** | 1440px - 1919px | 1280px | 80px (px-20) | 2xl: 1536px |
| **Full HD** | 1920px - 2559px | 1440px | 80px (px-20) | - |
| **2K/4K/Ultra-wide** | 2560px+ | 1600px | 80px (px-20) | - |

### CSS Custom Properties

```css
:root {
  /* Container Max Widths */
  --container-max-width-xs: 100%;
  --container-max-width-sm: 720px;    /* Tablets */
  --container-max-width-md: 960px;    /* Tablet landscape */
  --container-max-width-lg: 1184px;   /* Desktop */
  --container-max-width-xl: 1280px;   /* Large desktop */
  --container-max-width-2xl: 1440px;  /* Full HD */
  --container-max-width-3xl: 1600px;  /* 2K/4K */
}
```

### Usage Example

```tsx
<div className="mx-auto w-full max-w-[720px] md:max-w-[960px] lg:max-w-[1184px] xl:max-w-[1280px] 2xl:max-w-[1440px] px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

---

## Color System

A comprehensive dual-theme color system with semantic naming for surfaces, text, and accents.

### Dark Mode (Default)

#### Surface Colors
```css
--color-surface-base: 20 20 22;         /* #141416 - Main background */
--color-surface-muted: 28 28 31;        /* #1c1c1f - Secondary background */
--color-surface-elevated: 36 36 40;     /* #242428 - Cards, elevated elements */
--color-surface-overlay: 10 10 12;      /* #0a0a0c - Modal overlays */
```

#### Text Colors (Ink)
```css
--color-ink-50: 12 12 12;               /* #0c0c0c - Darkest text */
--color-ink-100: 24 24 24;              /* #181818 */
--color-ink-200: 45 45 45;              /* #2d2d2d */
--color-ink-300: 72 72 78;              /* #48484e */
--color-ink-400: 110 110 120;           /* #6e6e78 - Muted text */
--color-ink-500: 158 158 170;           /* #9e9eaa - Secondary text */
--color-ink-600: 196 196 208;           /* #c4c4d0 */
--color-ink-700: 222 222 230;           /* #dedee6 - Body text */
--color-ink-800: 240 240 245;           /* #f0f0f5 - Emphasized text */
--color-ink-900: 247 247 250;           /* #f7f7fa - Primary text */
```

#### Outline/Border Colors
```css
--color-outline-subtle: 50 50 54;       /* #323236 - Subtle borders */
--color-outline-strong: 249 115 22;     /* #f97316 - Orange accent borders */
```

#### Accent Colors (Orange)
```css
--color-accent-50: 255 247 237;         /* #fff7ed */
--color-accent-100: 255 237 213;        /* #ffedd5 */
--color-accent-200: 254 215 170;        /* #fed7aa */
--color-accent-300: 253 186 116;        /* #fdba74 */
--color-accent-400: 251 146 60;         /* #fb923c */
--color-accent-500: 249 115 22;         /* #f97316 - Primary accent */
--color-accent-600: 234 88 12;          /* #ea580c */
--color-accent-700: 194 65 12;          /* #c2410c */
--color-accent-800: 154 52 18;          /* #9a3412 */
--color-accent-900: 124 45 18;          /* #7c2d12 */
```

#### Semantic Colors
```css
--color-success: 34 197 94;             /* #22c55e - Green */
--color-warning: 250 204 21;            /* #facc15 - Yellow */
--color-danger: 239 68 68;              /* #ef4444 - Red */
```

### Light Mode

#### Surface Colors
```css
--color-surface-base: 250 251 252;      /* #fafbfc - Main background (off-white) */
--color-surface-muted: 243 244 246;     /* #f3f4f6 - Secondary background */
--color-surface-elevated: 255 255 255;  /* #ffffff - Cards, elevated elements */
--color-surface-overlay: 0 0 0;         /* #000000 - Modal overlays */
```

#### Text Colors (Ink) - Inverted Scale
```css
--color-ink-50: 247 247 250;            /* #f7f7fa - Lightest (backgrounds) */
--color-ink-100: 240 240 245;           /* #f0f0f5 */
--color-ink-200: 222 222 230;           /* #dedee6 */
--color-ink-300: 196 196 208;           /* #c4c4d0 */
--color-ink-400: 158 158 170;           /* #9e9eaa - Muted text */
--color-ink-500: 110 110 120;           /* #6e6e78 - Secondary text */
--color-ink-600: 72 72 78;              /* #48484e */
--color-ink-700: 45 45 45;              /* #2d2d2d - Body text */
--color-ink-800: 24 24 24;              /* #181818 - Emphasized text */
--color-ink-900: 12 12 12;              /* #0c0c0c - Primary text (darkest) */
```

#### Outline/Border Colors
```css
--color-outline-subtle: 229 231 235;    /* #e5e7eb - Subtle borders */
--color-outline-strong: 249 115 22;     /* #f97316 - Orange accent borders */
```

*Note: Accent and semantic colors remain the same in both themes*

### Tailwind Color Configuration

```typescript
colors: {
  surface: {
    DEFAULT: 'rgb(var(--color-surface-base) / <alpha-value>)',
    muted: 'rgb(var(--color-surface-muted) / <alpha-value>)',
    elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
  },
  overlay: 'rgb(var(--color-surface-overlay) / <alpha-value>)',
  outline: {
    subtle: 'rgb(var(--color-outline-subtle) / <alpha-value>)',
    strong: 'rgb(var(--color-outline-strong) / <alpha-value>)',
  },
  accent: {
    DEFAULT: 'rgb(var(--color-accent-500) / <alpha-value>)',
    50: 'rgb(var(--color-accent-50) / <alpha-value>)',
    // ... 100-900
  },
  ink: {
    50: 'rgb(var(--color-ink-50) / <alpha-value>)',
    // ... 100-900
  },
}
```

---

## Top Navigation

The sticky top navigation bar that spans the full width of the viewport.

### Specifications

| Property | Dark Mode Value | Light Mode Value |
|----------|----------------|------------------|
| **Height** | `64px` (h-16) | `64px` (h-16) |
| **Background** | `rgba(5, 5, 7, 0.95)` (`bg-[#050507]/95`) | `rgba(255, 255, 255, 0.92)` (`bg-white/92`) |
| **Border** | None | `border-b border-outline-subtle/60` |
| **Backdrop Blur** | `backdrop-blur-2xl` | `backdrop-blur-2xl` |
| **Shadow** | `0 18px 45px -30px rgba(0,0,0,0.2)` | `0 18px 45px -30px rgba(0,0,0,0.2)` |
| **Position** | `sticky top-0` | `sticky top-0` |
| **Z-index** | `z-30` (30) | `z-30` (30) |
| **Transition** | `transition-colors` | `transition-colors` |

### Implementation

```tsx
<header className={clsx(
  "sticky top-0 z-30 backdrop-blur-2xl shadow-[0_18px_45px_-30px_rgba(0,0,0,0.2)] transition-colors",
  theme === "dark"
    ? "bg-[#050507]/95"
    : "bg-white/92 border-b border-outline-subtle/60"
)}>
  <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:px-8">
    {/* Nav content */}
  </div>
</header>
```

### Inner Container
- Uses unified container max-width system
- Flexbox layout: `flex items-center gap-3`
- Responsive padding: `px-4 sm:px-6 lg:px-8`

---

## Sidebar & Menus

Left navigation sidebar with collapsible functionality and hover states.

### Specifications

| Property | Value |
|----------|-------|
| **Width (Expanded)** | `288px` (w-72) |
| **Width (Collapsed)** | `80px` (w-20) |
| **Background** | `bg-surface-base/90 backdrop-blur-2xl` |
| **Transition** | `transition-all duration-300` |
| **Height** | `calc(100vh - 4rem)` (full viewport minus top nav) |

### Navigation Item States

#### Default State
```css
Text: text-ink-500
Background: transparent
Padding: px-3 py-2 (12px 8px)
Border Radius: rounded-xl (12px)
```

#### Hover State
```css
Text: text-ink-700
Background: bg-surface-muted
```

#### Active/Selected State
```css
Text: text-ink-900
Background: bg-ink-200  /* Medium gray, NOT accent color */
Font Weight: font-semibold
```

#### Icon Styling
```css
Default: bg-surface-muted text-ink-600
Active: bg-ink-300/80 text-ink-900
Size: h-8 w-8 (32px)
Border Radius: rounded-lg (8px)
```

### Implementation

```tsx
<Link
  href="/workspace"
  className={clsx(
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-ink-200 text-ink-900"
      : "text-ink-500 hover:bg-surface-muted hover:text-ink-700"
  )}
>
  <span className={clsx(
    "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
    isActive
      ? "bg-ink-300/80 text-ink-900"
      : "bg-surface-muted text-ink-600"
  )}>
    <Icon className="h-4 w-4" />
  </span>
  <span>{label}</span>
</Link>
```

---

## Card Components

Elevated content cards used for notes, items, and content containers.

### Specifications

| Property | Value |
|----------|-------|
| **Background** | `bg-surface-elevated` or note color |
| **Border Radius** | `rounded-3xl` (24px) |
| **Padding** | `px-5 py-4` (20px horizontal, 16px vertical) |
| **Shadow (Default)** | `shadow-lg` |
| **Shadow (Hover)** | `shadow-2xl` |
| **Transition** | `transition hover:shadow-2xl` |
| **Cursor** | `cursor-pointer` |
| **Break Inside** | `break-inside-avoid` (for masonry layout) |

### Note Card Colors

11 predefined note colors with soft variants:

```typescript
const NOTE_COLORS = {
  white: "#FFFFFF",
  "white-soft": "#F9FAFB",
  lemon: "#FEFEA1",
  "lemon-soft": "#FFFED2",
  peach: "#FEC4A3",
  "peach-soft": "#FFE1CE",
  tangerine: "#FFD27F",
  "tangerine-soft": "#FFE7BA",
  mint: "#BBF7D0",
  "mint-soft": "#DCFCE7",
  fog: "#E0ECFF",
  "fog-soft": "#EDF3FF",
  lavender: "#EAD8FF",
  "lavender-soft": "#F3E8FF",
  blush: "#FAD7E5",
  "blush-soft": "#FCE6EF",
  sky: "#CDE3FF",
  "sky-soft": "#E3F0FF",
  moss: "#D5F5C1",
  "moss-soft": "#E8FAD9",
  coal: "#4F5B66",
  "coal-soft": "#A1A8B0",
};
```

### Implementation

```tsx
<article className={clsx(
  "group relative cursor-pointer break-inside-avoid overflow-visible",
  "rounded-3xl px-5 py-4 shadow-lg transition hover:shadow-2xl",
  backgroundClass
)}>
  {/* Card content */}
</article>
```

---

## Typography

Font system using Geist Sans and Kanit for headings.

### Font Families

```css
--font-geist-sans: "Geist Sans", system-ui, sans-serif;
--font-geist-mono: "Geist Mono", monospace;
--font-kanit: "Kanit", sans-serif;
```

### Font Setup (Next.js)

```typescript
import { Geist, Geist_Mono, Kanit } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-kanit",
});
```

### Type Scale

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| **Display** | `text-6xl` | 60px | semibold (600) |
| **H1** | `text-5xl` | 48px | semibold (600) |
| **H2** | `text-4xl` | 36px | semibold (600) |
| **H3** | `text-3xl` | 30px | semibold (600) |
| **H4** | `text-2xl` | 24px | semibold (600) |
| **H5** | `text-xl` | 20px | semibold (600) |
| **Body Large** | `text-lg` | 18px | normal (400) |
| **Body** | `text-base` | 16px | normal (400) |
| **Body Small** | `text-sm` | 14px | normal (400) |
| **Caption** | `text-xs` | 12px | normal (400) |

---

## Shadows & Effects

### Custom Shadows

```css
/* Floating elevated elements */
shadow-floating: 0 14px 30px -18px rgba(15, 23, 42, 0.45)

/* Inset border effect */
shadow-inset: inset 0 0 0 1px rgba(148, 163, 184, 0.2)
```

### Tailwind Shadow Scale

- `shadow-sm` - Subtle shadows for buttons
- `shadow` - Default shadow
- `shadow-md` - Medium depth
- `shadow-lg` - Cards default
- `shadow-xl` - Elevated modals
- `shadow-2xl` - Cards hover state

### Backdrop Effects

```css
backdrop-blur-xl: 24px blur
backdrop-blur-2xl: 40px blur
```

---

## Border Radius

### Scale

| Class | Pixels | Usage |
|-------|--------|-------|
| `rounded` | 4px | Small elements |
| `rounded-md` | 6px | Inputs |
| `rounded-lg` | 8px | Buttons, icons |
| `rounded-xl` | 12px | Nav items, containers |
| `rounded-2xl` | 16px | Sections |
| `rounded-3xl` | 24px | **Cards (signature style)** |
| `rounded-full` | 9999px | Circles, pills |

---

## Spacing System

### Container Padding by Breakpoint

```css
Mobile: px-4 (16px)
Tablet: sm:px-6 (24px)
Desktop: lg:px-8 (32px)
Large: xl:px-12 (48px)
XL: 2xl:px-20 (80px)
```

### Grid & Layout Gaps

```css
--app-shell-grid-gap: 1.5rem (24px)
```

### Common Spacing Patterns

```css
/* Section vertical spacing */
space-y-8 (32px) - Between major sections
space-y-6 (24px) - Between subsections
space-y-4 (16px) - Between elements
space-y-3 (12px) - Between small elements
space-y-2 (8px) - Tight spacing
```

---

## Implementation Guide

### Quick Start

1. **Copy CSS tokens** from `docs/CSS_TOKENS.css` to your project
2. **Copy Tailwind config** from `docs/TAILWIND_CONFIG.ts`
3. **Install fonts**: Geist Sans, Geist Mono, Kanit (via Google Fonts)
4. **Reference component examples** in `docs/COMPONENT_EXAMPLES.md`

### Theme Toggle Implementation

```typescript
// ThemeProvider context
const [theme, setTheme] = useState<"dark" | "light">("dark");

useEffect(() => {
  document.documentElement.classList.toggle("theme-light", theme === "light");
  document.documentElement.classList.toggle("theme-dark", theme === "dark");
}, [theme]);
```

### Container Component Pattern

```tsx
export function Container({
  children,
  variant = "default"
}: ContainerProps) {
  return (
    <div className={clsx(
      "mx-auto w-full",
      "px-4 sm:px-6 lg:px-8",
      variant === "default" && "max-w-[1280px] 2xl:max-w-[1440px]"
    )}>
      {children}
    </div>
  );
}
```

---

## Design Principles

1. **Consistency**: Same widths, colors, and spacing across all views
2. **Responsiveness**: Mobile-first, progressive enhancement
3. **Themeable**: Full dark/light mode support
4. **Accessible**: WCAG AA contrast ratios
5. **Performance**: Hardware-accelerated animations, optimized shadows
6. **Clarity**: High information density without clutter

---

## Version History

- **1.0.0** (January 2025) - Initial design system documentation

---

**Questions or need help implementing?**
Refer to `COMPONENT_EXAMPLES.md` for copy-paste ready code snippets.
