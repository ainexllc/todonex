/**
 * NoteNex Design System - Tailwind Configuration
 * Version: 1.0.0
 *
 * Copy this configuration into your tailwind.config.ts to get the complete NoteNex design system.
 * Make sure to also include the CSS custom properties from CSS_TOKENS.css in your global CSS file.
 */

import type { Config } from "tailwindcss";

/**
 * Helper function to use CSS custom properties with opacity modifier support
 * Enables usage like: bg-surface-base/95 or text-ink-900/80
 */
const withOpacityValue = (variable: string): string => {
  return `rgb(var(${variable}) / <alpha-value>)`;
};

/**
 * Note color tones for the color palette feature
 * Used in the note-taking interface for color coding notes
 */
const noteTones = [
  "white",
  "lemon",
  "peach",
  "tangerine",
  "mint",
  "fog",
  "lavender",
  "blush",
  "sky",
  "moss",
  "coal",
];

/**
 * Safelist note colors to ensure they're included in the production build
 * These classes are generated dynamically based on user selections
 */
const noteColorSafelist = noteTones.flatMap((tone) => [
  `bg-note-${tone}`,
  `bg-note-${tone}-soft`,
  `hover:bg-note-${tone}`,
  `hover:bg-note-${tone}-soft`,
]);

const config: Config = {
  // Scan all source files for Tailwind classes
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {
      /**
       * ============================================
       * COLORS - Maps CSS custom properties to Tailwind utilities
       * ============================================
       */
      colors: {
        // Surface colors - backgrounds and elevated elements
        surface: {
          DEFAULT: withOpacityValue("--color-surface-base"),     // Main background
          base: withOpacityValue("--color-surface-base"),        // Alias for DEFAULT
          muted: withOpacityValue("--color-surface-muted"),      // Secondary background
          elevated: withOpacityValue("--color-surface-elevated"), // Cards, modals
        },

        // Overlay for modals and backdrops
        overlay: withOpacityValue("--color-surface-overlay"),

        // Outline/Border colors
        outline: {
          subtle: withOpacityValue("--color-outline-subtle"),    // Light borders
          strong: withOpacityValue("--color-outline-strong"),    // Emphasized borders
        },

        // Accent colors (Orange) - Primary brand color
        accent: {
          DEFAULT: withOpacityValue("--color-accent-500"),
          50: withOpacityValue("--color-accent-50"),
          100: withOpacityValue("--color-accent-100"),
          200: withOpacityValue("--color-accent-200"),
          300: withOpacityValue("--color-accent-300"),
          400: withOpacityValue("--color-accent-400"),
          500: withOpacityValue("--color-accent-500"),
          600: withOpacityValue("--color-accent-600"),
          700: withOpacityValue("--color-accent-700"),
          800: withOpacityValue("--color-accent-800"),
          900: withOpacityValue("--color-accent-900"),
        },

        // Ink colors - Text colors that adapt to light/dark mode
        ink: {
          50: withOpacityValue("--color-ink-50"),
          100: withOpacityValue("--color-ink-100"),
          200: withOpacityValue("--color-ink-200"),
          300: withOpacityValue("--color-ink-300"),
          400: withOpacityValue("--color-ink-400"),
          500: withOpacityValue("--color-ink-500"),
          600: withOpacityValue("--color-ink-600"),
          700: withOpacityValue("--color-ink-700"),
          800: withOpacityValue("--color-ink-800"),
          900: withOpacityValue("--color-ink-900"),
        },

        // Semantic colors - Status indicators
        success: withOpacityValue("--color-success"),  // Green
        warning: withOpacityValue("--color-warning"),  // Yellow
        danger: withOpacityValue("--color-danger"),    // Red

        // Note color palette - Specific to note-taking features
        note: {
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
        },
      },

      /**
       * ============================================
       * TYPOGRAPHY
       * ============================================
       */
      fontFamily: {
        sans: "var(--font-geist-sans)",  // Default sans-serif (body text)
        mono: "var(--font-geist-mono)",  // Monospace (code)
      },

      /**
       * ============================================
       * SHADOWS
       * ============================================
       */
      boxShadow: {
        // Floating elements like dropdowns, tooltips, popovers
        floating: "0 14px 30px -18px rgba(15, 23, 42, 0.45)",

        // Inset border effect for subtle depth
        inset: "inset 0 0 0 1px rgba(148, 163, 184, 0.2)",
      },

      /**
       * ============================================
       * BORDER RADIUS
       * ============================================
       */
      borderRadius: {
        "3xl": "1.5rem",  // 24px - Used for cards and major UI elements
      },

      /**
       * ============================================
       * CONTAINER & LAYOUT WIDTHS
       * ============================================
       * These map to the CSS custom properties for responsive containers
       */
      maxWidth: {
        // Main container widths (responsive layout system)
        "container-xs": "100%",
        "container-sm": "720px",     // Tablets
        "container-md": "960px",     // Tablet landscape
        "container-lg": "1184px",    // Desktop
        "container-xl": "1280px",    // Large desktop
        "container-2xl": "1440px",   // Full HD
        "container-3xl": "1600px",   // 2K/4K monitors

        // App shell widths (legacy, keep for backward compatibility)
        "app-shell-xs": "100%",
        "app-shell-sm": "560px",
        "app-shell-md": "720px",
        "app-shell-lg": "820px",
        "app-shell-xl": "880px",
        "app-shell-wide-sm": "700px",
        "app-shell-wide-md": "1120px",
        "app-shell-wide-lg": "1280px",
        "app-shell-wide-xl": "1440px",

        // Note board widths (for note-taking interface)
        "note-board-sm": "520px",
        "note-board-md": "720px",
        "note-board-lg": "1024px",
        "note-board-xl": "1200px",
      },

      /**
       * ============================================
       * SPACING (Custom values beyond Tailwind defaults)
       * ============================================
       */
      spacing: {
        // Add any custom spacing values here if needed
        // Example: '72': '18rem',
      },

      /**
       * ============================================
       * Z-INDEX (Layer management)
       * ============================================
       */
      zIndex: {
        // Example custom z-index values
        // 'dropdown': '1000',
        // 'sticky': '1020',
        // 'modal': '1040',
      },
    },
  },

  /**
   * ============================================
   * SAFELIST
   * ============================================
   * Classes that should always be included in production build
   */
  safelist: noteColorSafelist,

  /**
   * ============================================
   * PLUGINS
   * ============================================
   */
  plugins: [
    // Add Tailwind plugins here
    // Example: require('@tailwindcss/forms'),
  ],
};

export default config;

/**
 * USAGE EXAMPLES:
 *
 * Surfaces:
 * className="bg-surface-base"           // Main background
 * className="bg-surface-elevated"       // Cards, modals
 * className="bg-surface-muted"          // Secondary background
 *
 * Text Colors:
 * className="text-ink-900"              // Primary text
 * className="text-ink-700"              // Body text
 * className="text-ink-500"              // Secondary/muted text
 *
 * Accent/Brand:
 * className="bg-accent-500 text-white"  // Primary button
 * className="text-accent-600"           // Accent text
 * className="border-accent-500"         // Accent border
 *
 * With Opacity:
 * className="bg-surface-elevated/95"    // 95% opacity
 * className="text-ink-900/80"           // 80% opacity
 *
 * Borders:
 * className="border border-outline-subtle"    // Light border
 * className="border-2 border-outline-strong"  // Strong border
 *
 * Shadows:
 * className="shadow-floating"           // Dropdown/tooltip shadow
 * className="shadow-lg"                 // Card shadow
 *
 * Container Widths:
 * className="max-w-container-xl"        // Desktop container
 * className="max-w-container-2xl"       // Full HD container
 * className="max-w-note-board-lg"       // Note board container
 *
 * Border Radius:
 * className="rounded-3xl"               // Cards (24px)
 * className="rounded-xl"                // Buttons, inputs (12px)
 *
 * Complete Component Example:
 * <div className="bg-surface-elevated border border-outline-subtle rounded-3xl shadow-lg px-5 py-4">
 *   <h2 className="text-ink-900 text-xl font-semibold">Card Title</h2>
 *   <p className="text-ink-700 mt-2">Card content goes here</p>
 *   <button className="mt-4 bg-accent-500 text-white px-4 py-2 rounded-xl hover:bg-accent-600">
 *     Action
 *   </button>
 * </div>
 */
