# NoteNex Component Examples

Copy-paste ready code snippets for implementing the NoteNex design system in your project.

## Table of Contents

- [Shadow System](#shadow-system)
- [Top Navigation](#top-navigation)
- [Sidebar Navigation](#sidebar-navigation)
- [Card Components](#card-components)
- [Container Layouts](#container-layouts)
- [Buttons](#buttons)
- [Forms](#forms)
- [Modal/Dialog](#modaldialog)
- [Common UI Patterns](#common-ui-patterns)

---

## Shadow System

The NoteNex design system uses a carefully crafted shadow system to create depth and hierarchy. Here's how shadows are applied across different component types:

### Shadow Specifications

```css
/* Custom Shadows (defined in Tailwind config) */
shadow-floating: 0 14px 30px -18px rgba(15, 23, 42, 0.45);
shadow-inset: inset 0 0 0 1px rgba(148, 163, 184, 0.2);

/* Top Nav Custom Shadow */
shadow-[0_18px_45px_-30px_rgba(0,0,0,0.2)]

/* Tailwind Default Shadows Used */
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
shadow:     0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Shadow Usage by Component

#### 1. Top Navigation
**Shadow:** `shadow-[0_18px_45px_-30px_rgba(0,0,0,0.2)]`
**Purpose:** Creates a subtle depth effect that separates the nav from content below
```tsx
<header className="sticky top-0 z-30 backdrop-blur-2xl shadow-[0_18px_45px_-30px_rgba(0,0,0,0.2)]">
```

#### 2. Cards (Default State)
**Shadow:** `shadow-lg`
**Purpose:** Gives cards a clear elevation above the background
```tsx
<div className="rounded-3xl bg-surface-elevated px-5 py-4 shadow-lg">
```

#### 3. Cards (Hover State)
**Shadow:** `shadow-2xl`
**Purpose:** Increases elevation on hover to indicate interactivity
```tsx
<div className="rounded-3xl bg-surface-elevated px-5 py-4 shadow-lg hover:shadow-2xl transition">
```

#### 4. Modals & Floating Panels
**Shadow:** `shadow-floating`
**Purpose:** Strong shadow for high-elevation UI elements
```tsx
<div className="rounded-3xl bg-surface-elevated shadow-floating">
```

#### 5. Dropdowns & Popovers
**Shadow:** `shadow-floating`
**Purpose:** Consistent elevation for all floating UI
```tsx
<div className="absolute bottom-12 right-0 rounded-2xl bg-surface-elevated/95 p-3 shadow-floating backdrop-blur-xl">
```

#### 6. Buttons (Primary)
**Shadow:** `shadow-sm`
**Purpose:** Subtle depth for interactive elements
```tsx
<button className="rounded-xl bg-accent-500 px-4 py-2 shadow-sm">
```

#### 7. Input Fields (Focus State)
**Shadow:** `ring-2` (focus ring, not traditional shadow)
**Purpose:** Visual feedback for focus state
```tsx
<input className="focus:ring-2 focus:ring-accent-500/20" />
```

#### 8. Inset Effects (Loading States)
**Shadow:** `shadow-inner` or custom `shadow-inset`
**Purpose:** Pressed/loading appearance
```tsx
<div className="h-9 rounded-xl bg-surface-muted/80 shadow-inner animate-pulse" />
```

### Shadow Layering System

The NoteNex design uses a consistent z-axis elevation system:

```
Level 0 (Base):       No shadow - background surfaces
Level 1 (Subtle):     shadow-sm - buttons, chips
Level 2 (Default):    shadow-lg - cards, panels
Level 3 (Elevated):   shadow-xl - sticky headers
Level 4 (Hover):      shadow-2xl - interactive cards on hover
Level 5 (Floating):   shadow-floating - modals, dropdowns, popovers
Level 6 (Top Nav):    Custom shadow - main navigation bar
```

### Complete Shadow Examples

#### Card with Progressive Shadow on Hover
```tsx
<article className="rounded-3xl bg-surface-elevated border border-outline-subtle px-5 py-4 shadow-lg transition-shadow duration-200 hover:shadow-2xl cursor-pointer">
  <h3 className="text-base font-semibold text-ink-900">Interactive Card</h3>
  <p className="mt-2 text-sm text-ink-700">Hover to see the shadow increase</p>
</article>
```

#### Floating Panel (Color Picker Example)
```tsx
<div className="absolute bottom-12 right-0 z-30 flex gap-2 rounded-2xl bg-surface-elevated/95 p-3 shadow-floating backdrop-blur-xl">
  <button className="h-8 w-8 rounded-full bg-note-lemon shadow-sm hover:shadow-md transition" />
  <button className="h-8 w-8 rounded-full bg-note-mint shadow-sm hover:shadow-md transition" />
  <button className="h-8 w-8 rounded-full bg-note-lavender shadow-sm hover:shadow-md transition" />
</div>
```

#### Modal with Shadow
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Backdrop - no shadow needed */}
  <div className="absolute inset-0 bg-overlay/60 backdrop-blur-sm" />

  {/* Modal - floating shadow for high elevation */}
  <div className="relative w-full max-w-lg rounded-3xl bg-surface-elevated shadow-floating border border-outline-subtle">
    <div className="px-6 py-4">Modal content</div>
  </div>
</div>
```

#### Button Group with Shadows
```tsx
<div className="flex items-center gap-2">
  {/* Primary button - subtle shadow */}
  <button className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition">
    Save
  </button>

  {/* Secondary button - border instead of shadow */}
  <button className="rounded-xl border border-outline-subtle bg-surface-elevated px-4 py-2 text-sm font-semibold text-ink-900 hover:shadow-sm transition">
    Cancel
  </button>
</div>
```

### Shadow Best Practices

1. **Consistency:** Use the defined shadow levels consistently across similar components
2. **Transitions:** Always add `transition` or `transition-shadow` when shadows change on hover
3. **Backdrop Blur:** Combine `shadow-floating` with `backdrop-blur-xl` for glassmorphism effects
4. **Z-Index Coordination:** Higher shadows should correspond to higher z-index values
5. **Dark Mode:** Shadows work well in both light and dark themes without modification
6. **Performance:** Avoid animating shadows on large numbers of elements simultaneously

### Quick Reference

```tsx
{/* Navigation bar */}
className="shadow-[0_18px_45px_-30px_rgba(0,0,0,0.2)]"

{/* Standard card */}
className="shadow-lg"

{/* Interactive card */}
className="shadow-lg hover:shadow-2xl transition-shadow"

{/* Floating UI (modals, dropdowns) */}
className="shadow-floating"

{/* Buttons */}
className="shadow-sm hover:shadow-md transition"

{/* Inset/loading state */}
className="shadow-inner"

{/* Subtle border effect */}
className="shadow-inset"
```

---

## Top Navigation

### Basic Top Nav with Theme Toggle

```tsx
"use client";

import { Search, Menu, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export function TopNav() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("theme-light", newTheme === "light");
  };

  const navBackgroundClass =
    theme === "dark"
      ? "bg-[#050507]/95"
      : "bg-white/92 border-b border-outline-subtle/60";

  return (
    <header
      className={clsx(
        "sticky top-0 z-30 backdrop-blur-2xl shadow-[0_18px_45px_-30px_rgba(0,0,0,0.2)] transition-colors",
        navBackgroundClass
      )}
    >
      <div className="mx-auto flex h-16 max-w-container-2xl items-center justify-between px-4 md:px-6">
        {/* Left: Menu button (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="icon-button lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <a href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent-500">
              <span className="text-lg font-bold text-white">N</span>
            </div>
            <span className="text-lg font-bold text-ink-900">NoteNex</span>
          </a>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full rounded-xl border border-outline-subtle bg-surface-muted/50 py-2 pl-10 pr-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
        </div>

        {/* Right: Theme toggle + User menu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="icon-button"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <div className="h-8 w-px bg-outline-subtle" />

          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-surface-elevated p-1 pr-3 hover:bg-surface-muted transition"
          >
            <div className="h-7 w-7 rounded-full bg-accent-500 grid place-items-center text-white text-sm font-semibold">
              U
            </div>
            <span className="text-sm font-medium text-ink-900">User</span>
          </button>
        </div>
      </div>
    </header>
  );
}
```

**Key Features:**
- Height: `h-16` (64px)
- Sticky positioning with `sticky top-0 z-30`
- Theme-aware background with backdrop blur
- Shadow: `shadow-[0_18px_45px_-30px_rgba(0,0,0,0.2)]`
- Max width: `max-w-container-2xl` (1440px)

---

## Sidebar Navigation

### Sidebar with Active States

```tsx
"use client";

import { Home, Archive, Settings, Tag } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/archive", icon: Archive, label: "Archive" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-[calc(100vh-4rem)] w-72 shrink-0 bg-surface-base/85 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col py-4">
        {/* Navigation Section */}
        <div className="px-3 py-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Workspace
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={label}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-ink-200 text-ink-900"
                      : "text-ink-500 hover:bg-surface-muted hover:text-ink-700"
                  )}
                >
                  <span
                    className={clsx(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent transition-colors",
                      isActive
                        ? "bg-ink-300/80 text-ink-900"
                        : "bg-surface-muted text-ink-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Labels Section */}
        <div className="px-3 py-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Labels
          </p>
          <div className="mt-2 space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-500 hover:bg-surface-muted hover:text-ink-700"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
              </span>
              <span className="flex-1 truncate text-left">Work</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

**Active State Styling:**
- Background: `bg-ink-200` (medium gray)
- Text: `text-ink-900` (primary text)
- Icon background: `bg-ink-300/80`

**Hover State:**
- Background: `bg-surface-muted`
- Text: `text-ink-700`

---

## Card Components

### Standard Card

```tsx
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface-elevated border border-outline-subtle px-5 py-4 shadow-lg">
      {children}
    </div>
  );
}
```

**Usage Example:**

```tsx
<Card>
  <h3 className="text-base font-semibold text-ink-900">Card Title</h3>
  <p className="mt-2 text-sm text-ink-700">
    This is a standard card with the NoteNex design system styling.
  </p>
</Card>
```

### Interactive Card (Hover Effect)

```tsx
export function InteractiveCard({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <article
      className="group relative cursor-pointer break-inside-avoid rounded-3xl bg-surface-elevated px-5 py-4 shadow-lg transition hover:shadow-2xl"
      onClick={onClick}
    >
      {children}
    </article>
  );
}
```

### Note Card with Color

```tsx
export function ColoredNoteCard() {
  return (
    <article className="rounded-3xl bg-note-lemon px-5 py-4 shadow-lg transition hover:shadow-2xl">
      <h3 className="text-base font-semibold text-gray-900">Colored Note</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
        This note has a colored background using the note color palette.
      </p>

      {/* Footer with metadata */}
      <footer className="mt-4 flex items-center justify-between border-t border-gray-900/10 pt-3">
        <span className="text-xs uppercase tracking-wide text-gray-600">
          Updated yesterday
        </span>
      </footer>
    </article>
  );
}
```

**Card Specifications:**
- Border radius: `rounded-3xl` (24px)
- Padding: `px-5 py-4` (20px horizontal, 16px vertical)
- Shadow: `shadow-lg` (default), `shadow-2xl` (hover)
- Background: `bg-surface-elevated` or note colors

---

## Container Layouts

### Responsive Container

```tsx
export function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-container-xl px-4 md:px-6">
      {children}
    </div>
  );
}
```

**Container Width Breakpoints:**

```tsx
// Mobile first (100% width)
<div className="mx-auto w-full max-w-container-sm px-4">  {/* 720px max */}
<div className="mx-auto w-full max-w-container-md px-6">  {/* 960px max */}
<div className="mx-auto w-full max-w-container-lg px-6">  {/* 1184px max */}
<div className="mx-auto w-full max-w-container-xl px-6">  {/* 1280px max */}
<div className="mx-auto w-full max-w-container-2xl px-6"> {/* 1440px max */}
<div className="mx-auto w-full max-w-container-3xl px-8"> {/* 1600px max */}
```

### Masonry/Column Layout (Note Board)

```tsx
export function NoteBoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cq-board mx-auto w-full max-w-note-board-xl px-4">
      {/* Container query responsive columns */}
      <div className="note-board-columns space-y-4">
        {children}
      </div>
    </div>
  );
}
```

**CSS for responsive columns:**

```css
.note-board-columns {
  column-count: 1;
  column-gap: 1rem;
}

@container board (min-width: 640px) {
  .note-board-columns {
    column-count: 2;
    column-gap: 1.25rem;
  }
}

@container board (min-width: 960px) {
  .note-board-columns {
    column-count: 3;
    column-gap: 1.5rem;
  }
}
```

---

## Buttons

### Primary Button

```tsx
<button
  type="button"
  className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
>
  Primary Action
</button>
```

### Secondary Button

```tsx
<button
  type="button"
  className="rounded-xl border border-outline-subtle bg-surface-elevated px-4 py-2 text-sm font-semibold text-ink-900 shadow-sm transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
>
  Secondary Action
</button>
```

### Icon Button

```tsx
<button
  type="button"
  className="icon-button h-9 w-9"
  aria-label="Action"
>
  <Settings className="h-4 w-4" />
</button>
```

**Icon Button CSS (from globals.css):**

```css
.icon-button {
  @apply grid place-items-center rounded-full p-2 text-ink-500 transition-all duration-150 hover:bg-surface-muted hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500;
}
```

### Danger Button

```tsx
<button
  type="button"
  className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2"
>
  Delete
</button>
```

---

## Forms

### Input Field

```tsx
<div className="space-y-2">
  <label htmlFor="title" className="block text-sm font-medium text-ink-900">
    Title
  </label>
  <input
    type="text"
    id="title"
    className="w-full rounded-xl border border-outline-subtle bg-surface-muted/50 px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition"
    placeholder="Enter title..."
  />
</div>
```

### Textarea

```tsx
<div className="space-y-2">
  <label htmlFor="description" className="block text-sm font-medium text-ink-900">
    Description
  </label>
  <textarea
    id="description"
    rows={4}
    className="w-full rounded-xl border border-outline-subtle bg-surface-muted/50 px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition resize-none"
    placeholder="Enter description..."
  />
</div>
```

### Select Dropdown

```tsx
<div className="space-y-2">
  <label htmlFor="category" className="block text-sm font-medium text-ink-900">
    Category
  </label>
  <select
    id="category"
    className="w-full rounded-xl border border-outline-subtle bg-surface-muted/50 px-4 py-2.5 text-sm text-ink-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition"
  >
    <option>Select category</option>
    <option>Work</option>
    <option>Personal</option>
    <option>Ideas</option>
  </select>
</div>
```

### Checkbox

```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="h-4 w-4 rounded border-outline-subtle text-accent-500 focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
  />
  <span className="text-sm text-ink-900">Remember me</span>
</label>
```

---

## Modal/Dialog

### Modal Overlay and Container

```tsx
"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-3xl bg-surface-elevated shadow-floating border border-outline-subtle">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer (optional) */}
        <div className="flex items-center justify-end gap-3 border-t border-outline-subtle px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-subtle bg-surface-elevated px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-surface-muted transition"
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Usage:**

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Note">
  <p className="text-sm text-ink-700">Modal content goes here...</p>
</Modal>
```

---

## Common UI Patterns

### Badge/Chip

```tsx
<span className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-600">
  <span className="h-2 w-2 rounded-full bg-accent-500" />
  Active
</span>
```

### Stat Card

```tsx
<div className="rounded-xl border border-outline-subtle bg-surface-elevated p-4">
  <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">
    Total Notes
  </dt>
  <dd className="mt-1 text-2xl font-bold text-ink-900">127</dd>
</div>
```

### Loading Spinner

```tsx
import { Loader2 } from "lucide-react";

<div className="flex items-center justify-center py-8">
  <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
</div>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="rounded-full bg-surface-muted p-4">
    <Icon className="h-8 w-8 text-ink-400" />
  </div>
  <h3 className="mt-4 text-lg font-semibold text-ink-900">No items found</h3>
  <p className="mt-2 text-sm text-ink-500">
    Get started by creating your first item.
  </p>
  <button
    type="button"
    className="mt-6 rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 transition"
  >
    Create Item
  </button>
</div>
```

### Divider

```tsx
{/* Horizontal */}
<div className="h-px bg-outline-subtle" />

{/* Vertical */}
<div className="w-px bg-outline-subtle" />

{/* With Text */}
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-outline-subtle" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="bg-surface-base px-2 text-ink-500">Or continue with</span>
  </div>
</div>
```

### Toast Notification (Conceptual)

```tsx
<div className="pointer-events-auto rounded-xl bg-surface-elevated border border-outline-subtle px-4 py-3 shadow-floating">
  <div className="flex items-start gap-3">
    <div className="flex-1">
      <p className="text-sm font-semibold text-ink-900">Success</p>
      <p className="mt-1 text-sm text-ink-700">Your changes have been saved.</p>
    </div>
    <button
      type="button"
      className="icon-button h-6 w-6"
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
</div>
```

---

## Complete Page Layout Example

```tsx
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-base">
      <TopNav />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-container-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## Notes

- All components use the CSS custom properties from `CSS_TOKENS.css`
- Colors automatically adapt to light/dark theme
- Use `clsx` for conditional class names
- All interactive elements have proper focus states
- Mobile-first responsive approach
- Consistent spacing and sizing throughout

**Installation Requirements:**

```bash
npm install clsx
npm install lucide-react
```

**Global CSS Setup:**

Make sure to include the CSS custom properties from `CSS_TOKENS.css` in your `globals.css` file.

**Tailwind Config:**

Use the configuration from `TAILWIND_CONFIG.ts` to enable all design tokens.
