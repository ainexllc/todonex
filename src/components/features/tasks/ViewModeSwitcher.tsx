'use client'

import { LayoutGrid, List, Columns, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/types/task'

interface ViewModeSwitcherProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

const VIEW_MODES: Array<{
  value: ViewMode
  label: string
  icon: React.ElementType
}> = [
  { value: 'masonry', label: 'Masonry', icon: Columns },
  { value: 'timeline', label: 'Timeline', icon: Calendar },
]

export function ViewModeSwitcher({ value, onChange, className }: ViewModeSwitcherProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {VIEW_MODES.map(({ value: mode, label, icon: Icon }) => (
        <Button
          key={mode}
          size="sm"
          variant={value === mode ? 'default' : 'ghost'}
          onClick={() => onChange(mode)}
          className={cn(
            'h-8 px-2 gap-1.5',
            value === mode && 'bg-primary text-primary-foreground'
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="text-xs hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  )
}
