'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  List, 
  Columns3, 
  Calendar,
  Sun,
  Grid3X3,
  BarChart3,
  Focus,
  Table
} from 'lucide-react'

export type TaskView = 'list' | 'kanban' | 'calendar' | 'my-day' | 'matrix' | 'dashboard' | 'focus' | 'table'

interface ViewOption {
  id: TaskView
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
}

const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'list',
    name: 'List',
    description: 'Traditional task list',
    icon: List,
    shortcut: '1'
  },
  {
    id: 'kanban',
    name: 'Kanban',
    description: 'Visual board with columns',
    icon: Columns3,
    shortcut: '2'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Tasks on calendar grid',
    icon: Calendar,
    shortcut: '3'
  },
  {
    id: 'my-day',
    name: 'My Day',
    description: 'Today\'s focused tasks',
    icon: Sun,
    shortcut: '4'
  },
  {
    id: 'matrix',
    name: 'Matrix',
    description: 'Priority matrix view',
    icon: Grid3X3,
    shortcut: '5'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Analytics and insights',
    icon: BarChart3,
    shortcut: '6'
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'Single task focus',
    icon: Focus,
    shortcut: '7'
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Spreadsheet-like grid',
    icon: Table,
    shortcut: '8'
  }
]

interface ViewSwitcherProps {
  currentView: TaskView
  onViewChange: (view: TaskView) => void
  availableViews?: TaskView[]
  className?: string
}

export function ViewSwitcher({ 
  currentView, 
  onViewChange, 
  availableViews = ['list', 'kanban', 'calendar', 'my-day'],
  className = ''
}: ViewSwitcherProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  
  const availableOptions = VIEW_OPTIONS.filter(option => 
    availableViews.includes(option.id)
  )
  
  const currentOption = availableOptions.find(option => option.id === currentView)
  
  // Desktop view - Simple tabs like Grok
  const DesktopSwitcher = () => (
    <div className="hidden md:flex items-center gap-6">
      {availableOptions.map((option) => {
        const isActive = option.id === currentView
        
        return (
          <button
            key={option.id}
            onClick={() => onViewChange(option.id)}
            className={`text-xs font-medium pb-2 border-b-2 transition-colors ${
              isActive 
                ? 'text-foreground border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground'
            }`}
            title={`${option.name} - ${option.description}`}
          >
            {option.name}
          </button>
        )
      })}
    </div>
  )
  
  // Mobile view - Dropdown
  const MobileSwitcher = () => (
    <div className="md:hidden">
      <Select value={currentView} onValueChange={(value: TaskView) => onViewChange(value)}>
        <SelectTrigger className="glass border-glass w-[140px]">
          <div className="flex items-center gap-2">
            {currentOption && (
              <>
                <currentOption.icon className="h-4 w-4" />
                <span className="text-sm">{currentOption.name}</span>
              </>
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((option) => {
            const Icon = option.icon
            return (
              <SelectItem key={option.id} value={option.id}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <DesktopSwitcher />
      <MobileSwitcher />
      
      {/* View info for current view */}
      {currentOption && (
        <div className="hidden lg:block text-xs text-muted-foreground">
          {currentOption.description}
        </div>
      )}
    </div>
  )
}

// Hook for keyboard shortcuts
export function useViewSwitcherShortcuts(
  currentView: TaskView,
  onViewChange: (view: TaskView) => void,
  availableViews: TaskView[] = ['list', 'kanban', 'calendar', 'my-day']
) {
  const availableOptions = VIEW_OPTIONS.filter(option => 
    availableViews.includes(option.id)
  )
  
  // Keyboard shortcut handler
  const handleKeyPress = (event: KeyboardEvent) => {
    // Only handle if not in input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return
    }
    
    const shortcut = event.key
    const option = availableOptions.find(opt => opt.shortcut === shortcut)
    
    if (option && option.id !== currentView) {
      event.preventDefault()
      onViewChange(option.id)
    }
  }
  
  // Add event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }
}