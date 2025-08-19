/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Glass morphism utilities
      backdropBlur: {
        'xs': '2px',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.1)',
      },
      // Mobile-first spacing with 8px grid
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Touch-friendly minimum sizes
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      // Dynamic viewport units
      height: {
        'dvh': '100dvh',
      },
      // Glass morphism borders
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.2)',
        'glass-dark': 'rgba(255, 255, 255, 0.1)',
      },
      // Masonry grid support
      gridTemplateColumns: {
        'masonry': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
      // Animation for smooth interactions
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glass-shimmer': 'glassShimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glassShimmer: {
          '0%, 100%': { background: 'rgba(255, 255, 255, 0.1)' },
          '50%': { background: 'rgba(255, 255, 255, 0.2)' },
        },
      },
      // Typography scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Natural Harmony palette
        'sage-light': 'hsl(var(--sage-light))',
        'sage-medium': 'hsl(var(--sage-medium))',
        'sage-dark': 'hsl(var(--sage-dark))',
        'gold-light': 'hsl(var(--gold-light))',
        'gold-medium': 'hsl(var(--gold-medium))',
        'gold-dark': 'hsl(var(--gold-dark))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    // Glass morphism utility plugin
    function({ addUtilities }) {
      addUtilities({
        '.glass': {
          'backdrop-filter': 'blur(12px) saturate(180%)',
          'background': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(220, 234, 208, 0.3))',
          'border': '1px solid rgba(134, 176, 142, 0.3)',
          'box-shadow': '0 8px 32px 0 rgba(134, 176, 142, 0.15)',
        },
        '.glass-dark': {
          'backdrop-filter': 'blur(12px) saturate(180%)',
          'background': 'linear-gradient(135deg, rgba(46, 82, 54, 0.3), rgba(134, 176, 142, 0.1))',
          'border': '1px solid rgba(218, 165, 32, 0.4)',
          'box-shadow': '0 8px 32px 0 rgba(46, 82, 54, 0.4)',
        },
        '.glass-mobile': {
          // Lighter blur for mobile performance
          'backdrop-filter': 'blur(5px)',
          'background': 'rgba(255, 255, 255, 0.15)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.masonry': {
          'column-count': 'auto',
          'column-width': '300px',
          'column-gap': '1rem',
          'column-fill': 'balance',
        },
        '.masonry > *': {
          'break-inside': 'avoid',
          'margin-bottom': '1rem',
        },
      });
    },
  ],
};