/**
 * List Color Theming System
 *
 * Provides a predefined palette of 18 colors for task list customization.
 * Each color includes background, border, and text color variants optimized
 * for both light and dark modes.
 */

export interface ListColorTheme {
  bg: string       // Background color (Tailwind class)
  border: string   // Border color (Tailwind class)
  text: string     // Text color (Tailwind class)
  hex: string      // Hex value for colored elements (dots, borders, accents)
}

export const LIST_COLORS = {
  // Vibrant colors
  red: {
    bg: 'bg-red-100 dark:bg-red-950',
    border: 'border-red-500',
    text: 'text-red-900 dark:text-red-300',
    hex: '#EF4444',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-950',
    border: 'border-orange-500',
    text: 'text-orange-900 dark:text-orange-300',
    hex: '#F97316',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-950',
    border: 'border-amber-500',
    text: 'text-amber-900 dark:text-amber-300',
    hex: '#F59E0B',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    border: 'border-yellow-500',
    text: 'text-yellow-900 dark:text-yellow-300',
    hex: '#EAB308',
  },
  lime: {
    bg: 'bg-lime-100 dark:bg-lime-950',
    border: 'border-lime-500',
    text: 'text-lime-900 dark:text-lime-300',
    hex: '#84CC16',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-950',
    border: 'border-green-500',
    text: 'text-green-900 dark:text-green-300',
    hex: '#10B981',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    border: 'border-emerald-500',
    text: 'text-emerald-900 dark:text-emerald-300',
    hex: '#059669',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-950',
    border: 'border-teal-500',
    text: 'text-teal-900 dark:text-teal-300',
    hex: '#14B8A6',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    border: 'border-cyan-500',
    text: 'text-cyan-900 dark:text-cyan-300',
    hex: '#06B6D4',
  },
  sky: {
    bg: 'bg-sky-100 dark:bg-sky-950',
    border: 'border-sky-500',
    text: 'text-sky-900 dark:text-sky-300',
    hex: '#0EA5E9',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-950',
    border: 'border-blue-500',
    text: 'text-blue-900 dark:text-blue-300',
    hex: '#3B82F6',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-950',
    border: 'border-indigo-500',
    text: 'text-indigo-900 dark:text-indigo-300',
    hex: '#6366F1',
  },
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-950',
    border: 'border-violet-500',
    text: 'text-violet-900 dark:text-violet-300',
    hex: '#8B5CF6',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950',
    border: 'border-purple-500',
    text: 'text-purple-900 dark:text-purple-300',
    hex: '#A855F7',
  },
  fuchsia: {
    bg: 'bg-fuchsia-100 dark:bg-fuchsia-950',
    border: 'border-fuchsia-500',
    text: 'text-fuchsia-900 dark:text-fuchsia-300',
    hex: '#D946EF',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-950',
    border: 'border-pink-500',
    text: 'text-pink-900 dark:text-pink-300',
    hex: '#EC4899',
  },

  // Neutral colors
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-900',
    border: 'border-slate-500',
    text: 'text-slate-900 dark:text-slate-300',
    hex: '#64748B',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-900',
    border: 'border-gray-500',
    text: 'text-gray-900 dark:text-gray-300',
    hex: '#6B7280',
  },
} as const

export type ListColorKey = keyof typeof LIST_COLORS

/**
 * Get color theme for a given color key
 */
export function getListColor(colorKey?: string): ListColorTheme {
  if (!colorKey || !(colorKey in LIST_COLORS)) {
    return LIST_COLORS.blue // Default to blue
  }
  return LIST_COLORS[colorKey as ListColorKey]
}

/**
 * Get all available color keys
 */
export function getAllColorKeys(): ListColorKey[] {
  return Object.keys(LIST_COLORS) as ListColorKey[]
}

/**
 * Smart color suggestion based on list title keywords
 */
export function suggestColorForList(title: string): ListColorKey {
  const lowerTitle = title.toLowerCase()

  // Map keywords to colors
  const colorMappings: Record<string, ListColorKey> = {
    // Shopping & Food (green/emerald)
    'shopping': 'emerald',
    'groceries': 'green',
    'food': 'lime',
    'restaurant': 'amber',
    'meal': 'lime',

    // Work & Business (blue/indigo)
    'work': 'blue',
    'project': 'indigo',
    'business': 'cyan',
    'meeting': 'sky',
    'deadline': 'red',

    // Health & Fitness (red/pink)
    'gym': 'red',
    'workout': 'orange',
    'health': 'pink',
    'fitness': 'fuchsia',
    'medical': 'red',

    // Home & Personal (purple/violet)
    'home': 'violet',
    'cleaning': 'purple',
    'maintenance': 'slate',
    'garden': 'green',
    'pets': 'amber',

    // Learning (teal/cyan)
    'study': 'teal',
    'reading': 'cyan',
    'book': 'sky',
    'course': 'indigo',
    'learning': 'teal',

    // Events & Social (pink/fuchsia)
    'party': 'pink',
    'birthday': 'fuchsia',
    'event': 'purple',
    'wedding': 'pink',

    // Finance (yellow/amber)
    'bills': 'yellow',
    'budget': 'amber',
    'finance': 'yellow',
    'expenses': 'orange',

    // Time-based (various)
    'today': 'red',
    'weekly': 'blue',
    'daily': 'orange',
    'monthly': 'purple',

    // Urgency (red/orange)
    'urgent': 'red',
    'important': 'orange',
    'priority': 'red',
  }

  // Check for keyword matches
  for (const [keyword, color] of Object.entries(colorMappings)) {
    if (lowerTitle.includes(keyword)) {
      return color
    }
  }

  // Default to blue
  return 'blue'
}
