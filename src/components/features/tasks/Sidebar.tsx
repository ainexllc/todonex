'use client'

import { Plus, LayoutGrid, List as ListIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { getListColor } from '@/lib/utils/list-colors'
import { getIconComponent } from '@/lib/utils/icon-matcher'
import type { TaskList, ViewMode } from '@/types/task'

interface SidebarProps {
  lists: TaskList[]
  activeListId?: string
  onListSelect: (listId: string) => void
  onNewList: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

export function Sidebar({
  lists,
  activeListId,
  onListSelect,
  onNewList,
  viewMode,
  onViewModeChange,
  className
}: SidebarProps) {
  // Calculate incomplete task count for each list
  const getIncompleteCount = (list: TaskList) => {
    return list.tasks.filter(task => !task.completed).length
  }

  // Get active list for visual feedback
  const activeList = lists.find(list => list.id === activeListId)

  return (
    <div
      className={cn('w-72 border-r border-border bg-background flex flex-col h-full', className)}
    >
      {/* Header with New List button */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <Button
          onClick={onNewList}
          className="w-full gap-2 rounded-xl"
          size="sm"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          New List
        </Button>
      </div>

      {/* Task Lists Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {lists.map((list) => {
          const isActive = list.id === activeListId
          const incompleteCount = getIncompleteCount(list)
          const colorTheme = getListColor(list.color)
          const IconComponent = list.icon ? getIconComponent(list.icon) : ListIcon

          return (
            <button
              key={list.id}
              onClick={() => onListSelect(list.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-muted/50',
                'text-left group relative',
                isActive && 'bg-primary/10 hover:bg-primary/15'
              )}
            >
              {/* Colored dot indicator */}
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: colorTheme.hex
                }}
              />

              {/* Icon (if available) */}
              {IconComponent && (
                <IconComponent
                  className="h-4 w-4 flex-shrink-0 text-foreground/70"
                />
              )}

              {/* List title */}
              <span className="flex-1 text-sm font-medium truncate text-foreground">
                {list.title}
              </span>

              {/* Incomplete task count badge */}
              {incompleteCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {incompleteCount}
                </span>
              )}
            </button>
          )
        })}

        {/* Empty state */}
        {lists.length === 0 && (
          <div className="text-center py-8 px-4 text-sm text-muted-foreground">
            No lists yet. Create your first list to get started!
          </div>
        )}
      </div>

      {/* Middle Section - View Mode Toggle */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            View Mode
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'masonry' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('masonry')}
            className="flex-1 rounded-lg gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs">Board</span>
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('timeline')}
            className="flex-1 rounded-lg gap-2"
          >
            <ListIcon className="h-4 w-4" />
            <span className="text-xs">List</span>
          </Button>
        </div>
      </div>

      {/* Bottom Section - Theme Toggle */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Theme
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
