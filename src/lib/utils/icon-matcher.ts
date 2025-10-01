/**
 * Smart Icon Matcher for Task Lists
 *
 * Auto-detects and suggests appropriate Lucide icons based on list title keywords.
 * Provides 60+ keyword mappings to commonly used icons.
 */

import type { LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

export type IconName = keyof typeof Icons

/**
 * Comprehensive keyword to icon mappings
 */
const ICON_MAPPINGS: Record<string, IconName> = {
  // Shopping & Food
  'shopping': 'ShoppingCart',
  'groceries': 'ShoppingBag',
  'food': 'UtensilsCrossed',
  'restaurant': 'Coffee',
  'recipes': 'ChefHat',
  'meal': 'UtensilsCrossed',
  'breakfast': 'Coffee',
  'lunch': 'Salad',
  'dinner': 'UtensilsCrossed',
  'drinks': 'Wine',
  'snacks': 'Cookie',

  // Work & Productivity
  'work': 'Briefcase',
  'project': 'FolderKanban',
  'meeting': 'Users',
  'deadline': 'Clock',
  'todo': 'CheckSquare',
  'tasks': 'ListTodo',
  'office': 'Building',
  'client': 'UserCheck',
  'presentation': 'Presentation',
  'report': 'FileText',
  'email': 'Mail',

  // Health & Fitness
  'gym': 'Dumbbell',
  'workout': 'Activity',
  'health': 'Heart',
  'medical': 'Stethoscope',
  'doctor': 'Hospital',
  'fitness': 'Zap',
  'running': 'PersonStanding',
  'yoga': 'SparklesIcon',
  'exercise': 'Activity',

  // Home & Personal
  'home': 'Home',
  'cleaning': 'Sparkles',
  'maintenance': 'Wrench',
  'garden': 'Flower2',
  'pets': 'Dog',
  'cat': 'Cat',
  'plants': 'Flower',
  'repair': 'Settings',
  'chores': 'Home',

  // Learning & Books
  'study': 'GraduationCap',
  'reading': 'BookOpen',
  'book': 'Book',
  'library': 'Library',
  'course': 'School',
  'learning': 'Brain',
  'education': 'School',
  'research': 'Search',

  // Travel & Events
  'travel': 'Plane',
  'vacation': 'Palmtree',
  'trip': 'MapPin',
  'event': 'Calendar',
  'party': 'PartyPopper',
  'flight': 'Plane',
  'hotel': 'Hotel',
  'car': 'Car',
  'train': 'Train',

  // Finance
  'bills': 'Receipt',
  'budget': 'DollarSign',
  'finance': 'TrendingUp',
  'expenses': 'CreditCard',
  'money': 'Wallet',
  'invoice': 'FileText',
  'payment': 'CreditCard',
  'tax': 'Calculator',

  // Family & Relationships
  'family': 'Users2',
  'kids': 'Baby',
  'birthday': 'Cake',
  'baby': 'Baby',
  'children': 'Users',
  'parents': 'Users2',

  // Creative & Hobbies
  'music': 'Music',
  'art': 'Palette',
  'gaming': 'Gamepad2',
  'photo': 'Camera',
  'video': 'Video',
  'painting': 'Paintbrush',
  'writing': 'Pen',
  'blog': 'FileEdit',

  // Goals & Planning
  'goals': 'Target',
  'ideas': 'Lightbulb',
  'notes': 'StickyNote',
  'weekly': 'CalendarDays',
  'daily': 'Sun',
  'monthly': 'CalendarRange',
  'plan': 'ClipboardList',
  'strategy': 'TrendingUp',

  // Time-based
  'today': 'CalendarCheck',
  'tomorrow': 'CalendarClock',
  'urgent': 'AlertCircle',
  'priority': 'Flag',
  'important': 'Star',

  // Technology
  'code': 'Code',
  'dev': 'Code2',
  'design': 'Palette',
  'website': 'Globe',
  'app': 'Smartphone',
  'software': 'Monitor',

  // Communication
  'phone': 'Phone',
  'call': 'PhoneCall',
  'message': 'MessageSquare',
  'chat': 'MessageCircle',

  // Documents
  'file': 'FileText',
  'document': 'File',
  'folder': 'Folder',
  'archive': 'Archive',
}

/**
 * Get icon name suggestions based on list title
 * Returns up to 5 suggested icon names in order of relevance
 */
export function suggestIconsForList(title: string): IconName[] {
  const lowerTitle = title.toLowerCase()
  const suggestions: IconName[] = []

  // Find all matching keywords
  for (const [keyword, iconName] of Object.entries(ICON_MAPPINGS)) {
    if (lowerTitle.includes(keyword)) {
      if (!suggestions.includes(iconName)) {
        suggestions.push(iconName)
      }
    }
  }

  // If we have suggestions, return top 5
  if (suggestions.length > 0) {
    return suggestions.slice(0, 5)
  }

  // Default suggestions if no match
  return ['List', 'CheckSquare', 'ListTodo', 'Folder', 'Star']
}

/**
 * Get the best single icon match for a list title
 */
export function getBestIconForList(title: string): IconName {
  const suggestions = suggestIconsForList(title)
  return suggestions[0] || 'List'
}

/**
 * Get the actual icon component from lucide-react
 */
export function getIconComponent(iconName: IconName): LucideIcon | undefined {
  return Icons[iconName] as LucideIcon | undefined
}

/**
 * Popular icons to show in icon picker by default
 */
export const POPULAR_ICONS: IconName[] = [
  'List',
  'ShoppingCart',
  'ShoppingBag',
  'Home',
  'Briefcase',
  'Calendar',
  'CheckSquare',
  'Heart',
  'Star',
  'Target',
  'Flag',
  'Coffee',
  'Book',
  'Lightbulb',
  'Sparkles',
  'Users',
  'Folder',
  'File',
  'Tag',
  'Clock',
  'Music',
  'Camera',
  'Plane',
  'Car',
]

/**
 * Icon categories for organized display
 */
export const ICON_CATEGORIES = {
  Popular: POPULAR_ICONS,
  Work: ['Briefcase', 'Building', 'Mail', 'Phone', 'Presentation', 'FileText', 'Users', 'Target'] as IconName[],
  Home: ['Home', 'Sparkles', 'Wrench', 'Flower2', 'Dog', 'Cat', 'Lightbulb', 'Sun'] as IconName[],
  Shopping: ['ShoppingCart', 'ShoppingBag', 'Store', 'Package', 'Receipt', 'Wallet'] as IconName[],
  Health: ['Heart', 'Activity', 'Dumbbell', 'Hospital', 'Pill', 'Apple'] as IconName[],
  Travel: ['Plane', 'Car', 'Train', 'MapPin', 'Palmtree', 'Hotel', 'Luggage'] as IconName[],
  Learning: ['GraduationCap', 'Book', 'BookOpen', 'School', 'Library', 'Brain'] as IconName[],
  Creative: ['Palette', 'Music', 'Camera', 'Video', 'Paintbrush', 'Pen', 'Gamepad2'] as IconName[],
  Time: ['Calendar', 'Clock', 'CalendarDays', 'CalendarCheck', 'Timer', 'Hourglass'] as IconName[],
}

/**
 * Check if an icon name exists in lucide-react
 */
export function isValidIconName(iconName: string): iconName is IconName {
  return iconName in Icons && typeof Icons[iconName as IconName] === 'function'
}
