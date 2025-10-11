'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, X, ChevronDown, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getIconComponent } from '@/lib/utils/icon-matcher'
import { getListColor } from '@/lib/utils/list-colors'
import { ListSettingsDialog } from './ListSettingsDialog'
import type { TaskList } from '@/types/task'

interface TaskHeaderProps {
  activeList: TaskList
  stats: {
    today: number
    total: number
    done: number
  }
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddTask: () => void
  onListUpdate?: (updates: { title?: string; color?: string }) => void
  tags?: string[]
  tagFilter?: string | null
  priorityFilter?: string | null
  onFilterChange?: (filters: { tag?: string | null; priority?: string | null }) => void
  className?: string
}

export function TaskHeader({
  activeList,
  stats,
  searchQuery,
  onSearchChange,
  onAddTask,
  onListUpdate,
  tags = [],
  tagFilter,
  priorityFilter,
  onFilterChange,
  className
}: TaskHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const listColor = getListColor(activeList.color)
  const ListIcon = getIconComponent(activeList.icon)

  const hasActiveFilters = tagFilter || priorityFilter

  const handleClearFilters = () => {
    onFilterChange?.({ tag: null, priority: null })
  }

  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  return (
    <>
      <ListSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        list={activeList}
        onSave={(updates) => {
          onListUpdate?.(updates)
        }}
      />

      <div className={cn('border-b border-border bg-card/50', className)}>
      {/* List Name and Stats Row */}
      <div className="px-4 py-3 space-y-2">
        {/* Active List Label */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
            Active List
          </span>
        </div>

        {/* List Name with Icon and Color */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center gap-2 flex-1',
            listColor.text
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              listColor.bg
            )} />
            {ListIcon && <ListIcon className="h-5 w-5" />}
            <h2 className="text-xl font-bold">
              {activeList.title}
            </h2>
          </div>

          {/* List Settings Button */}
          {onListUpdate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">List settings</span>
            </Button>
          )}

          {/* Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-xs bg-slate-100 dark:bg-slate-800 border-border"
            >
              {stats.today} today
            </Badge>
            <Badge
              variant="outline"
              className="text-xs bg-slate-100 dark:bg-slate-800 border-border"
            >
              {stats.total} total
            </Badge>
            <Badge
              variant="outline"
              className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-500/20"
            >
              {stats.done} done
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Actions Row */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 pr-16 h-9 text-sm"
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Filter Dropdowns */}
        {onFilterChange && (
          <>
            {/* Label Filter */}
            {tags.length > 0 && (
              <div className="relative">
                <select
                  value={tagFilter || ''}
                  onChange={(e) => onFilterChange({ tag: e.target.value || null, priority: priorityFilter })}
                  className={cn(
                    'h-9 px-3 pr-8 text-sm rounded-md border border-border bg-background',
                    'appearance-none cursor-pointer hover:bg-accent',
                    'focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                >
                  <option value="">All Labels</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            )}

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter || ''}
                onChange={(e) => onFilterChange({ priority: e.target.value || null, tag: tagFilter })}
                className={cn(
                  'h-9 px-3 pr-8 text-sm rounded-md border border-border bg-background',
                  'appearance-none cursor-pointer hover:bg-accent',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              >
                <option value="">All Priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFilters}
                className="h-9 px-3 text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </>
        )}

        {/* Add Task Button */}
        <Button
          onClick={onAddTask}
          className="h-9 px-4 text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-1" />
          Task
        </Button>
      </div>
    </div>
    </>
  )
}
