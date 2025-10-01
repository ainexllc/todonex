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

  // Get active list color for sidebar background
  const activeList = lists.find(list => list.id === activeListId)
  const activeColorTheme = activeList ? getListColor(activeList.color) : null

  return (
    <div
      className={cn('w-72 border-r flex flex-col h-full', className)}
      style={{
        backgroundColor: activeColorTheme ? `${activeColorTheme.hex}60` : 'hsl(var(--card) / 0.5)',
        borderColor: activeColorTheme ? `${activeColorTheme.hex}70` : 'hsl(var(--border))'
      }}
    >
      {/* Header with New List button */}
      <div
        className="flex-shrink-0 p-4 border-b"
        style={{
          borderColor: activeColorTheme ? `${activeColorTheme.hex}70` : 'hsl(var(--border))'
        }}
      >
        <Button
          onClick={onNewList}
          className="w-full gap-2 rounded-xl bg-black/20 hover:bg-black/30 text-black border-black/30 dark:bg-white/20 dark:hover:bg-white/30 dark:text-white dark:border-white/30"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New List
        </Button>
      </div>

      {/* Task Lists Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                'hover:bg-black/10 dark:hover:bg-white/10 border-l-4 relative',
                'text-left group',
                isActive && 'bg-black/20 dark:bg-white/20 shadow-sm'
              )}
              style={{
                borderLeftColor: colorTheme.hex,
              }}
            >
              {/* Colored vertical bar - more visible */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundColor: colorTheme.hex
                }}
              />

              {/* Icon (if available) */}
              {IconComponent && (
                <IconComponent
                  className="h-4 w-4 flex-shrink-0 text-black dark:text-white"
                />
              )}

              {/* List title */}
              <span className="flex-1 text-sm font-medium truncate text-black dark:text-white">
                {list.title}
              </span>

              {/* Incomplete task count badge */}
              {incompleteCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/20 text-black border border-black/30 dark:bg-white/20 dark:text-white dark:border-white/30">
                  {incompleteCount}
                </span>
              )}
            </button>
          )
        })}

        {/* Empty state */}
        {lists.length === 0 && (
          <div className="text-center py-8 px-4 text-sm text-black/70 dark:text-white/70">
            No lists yet. Create your first list to get started!
          </div>
        )}
      </div>

      {/* Middle Section - View Mode Toggle */}
      <div
        className="flex-shrink-0 px-4 py-3 border-t"
        style={{
          borderColor: activeColorTheme ? `${activeColorTheme.hex}70` : 'hsl(var(--border))'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-black dark:text-white uppercase tracking-wide">
            View Mode
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'masonry' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('masonry')}
            className={cn(
              "flex-1 rounded-xl gap-2",
              viewMode === 'masonry'
                ? "bg-black/30 hover:bg-black/40 text-black border-black/40 dark:bg-white/30 dark:hover:bg-white/40 dark:text-white dark:border-white/40"
                : "bg-black/10 hover:bg-black/20 text-black border-black/30 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/30"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-xs">Board</span>
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('timeline')}
            className={cn(
              "flex-1 rounded-xl gap-2",
              viewMode === 'timeline'
                ? "bg-black/30 hover:bg-black/40 text-black border-black/40 dark:bg-white/30 dark:hover:bg-white/40 dark:text-white dark:border-white/40"
                : "bg-black/10 hover:bg-black/20 text-black border-black/30 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/30"
            )}
          >
            <ListIcon className="h-4 w-4" />
            <span className="text-xs">List</span>
          </Button>
        </div>
      </div>

      {/* Bottom Section - Theme Toggle */}
      <div
        className="flex-shrink-0 px-4 py-3 border-t"
        style={{
          borderColor: activeColorTheme ? `${activeColorTheme.hex}70` : 'hsl(var(--border))'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-black dark:text-white uppercase tracking-wide">
            Theme
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
