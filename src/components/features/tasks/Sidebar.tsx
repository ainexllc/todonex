'use client'

import { Plus, List as ListIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getListColor } from '@/lib/utils/list-colors'
import { getIconComponent } from '@/lib/utils/icon-matcher'
import type { TaskList } from '@/types/task'

interface SidebarProps {
  lists: TaskList[]
  activeListId?: string
  onListSelect: (listId: string) => void
  onNewList: () => void
  className?: string
}

export function Sidebar({
  lists,
  activeListId,
  onListSelect,
  onNewList,
  className
}: SidebarProps) {
  // Calculate incomplete task count for each list
  const getIncompleteCount = (list: TaskList) => {
    return list.tasks.filter(task => !task.completed).length
  }

  // Calculate completion stats across all lists
  const getCompletionStats = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    let todayCount = 0
    let weekCount = 0
    let monthCount = 0
    let yearCount = 0

    lists.forEach(list => {
      list.tasks.forEach(task => {
        if (task.completed && task.completedAt) {
          const completedDate = new Date(task.completedAt)
          if (completedDate >= today) todayCount++
          if (completedDate >= weekStart) weekCount++
          if (completedDate >= monthStart) monthCount++
          if (completedDate >= yearStart) yearCount++
        }
      })
    })

    return { today: todayCount, week: weekCount, month: monthCount, year: yearCount }
  }

  const stats = getCompletionStats()

  // Get active list for visual feedback
  const activeList = lists.find(list => list.id === activeListId)

  return (
    <div
      className={cn(
        'flex h-full w-72 flex-col border-r border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]/70 text-[color:var(--board-text-strong)] backdrop-blur-xl',
        className
      )}
    >

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
                'w-full flex items-center gap-3 px-3 py-2 transition-all duration-200 text-left group relative rounded-xl border',
                isActive
                  ? 'border-[color:var(--board-column-border-accent)] bg-[color:var(--board-column-bg)]/80 text-[color:var(--board-text-strong)]'
                  : 'border-transparent bg-transparent hover:bg-[color:var(--board-surface-glass)] hover:border-[color:var(--board-column-border)]'
              )}
            >
              {IconComponent && (
                <IconComponent
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: colorTheme.hex }}
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{list.title}</p>
                <p className="text-[11px] text-[color:var(--board-text-muted)]">{incompleteCount} active</p>
              </div>

              {incompleteCount > 0 && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: colorTheme.hex }}
                >
                  {incompleteCount}
                </span>
              )}
            </button>
          )
        })}

        {/* Empty state */}
        {lists.length === 0 && (
          <div className="py-8 px-4 text-center text-sm text-[color:var(--board-text-muted)]">
            No lists yet. Create your first list to get started!
          </div>
        )}
      </div>

      {/* Stats Summary Section */}
      <div className="flex-shrink-0 border-t border-[color:var(--board-column-border)] px-4 py-3">
        <div className="mb-3">
          <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--board-text-muted)]">
            Completed
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 rounded-lg bg-[color:var(--board-column-bg)]/60 border border-[color:var(--board-column-border)]">
            <div className="text-xs text-[color:var(--board-text-muted)]">Today</div>
            <div className="text-lg font-bold text-[color:var(--board-text-strong)]">{stats.today}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[color:var(--board-column-bg)]/60 border border-[color:var(--board-column-border)]">
            <div className="text-xs text-[color:var(--board-text-muted)]">This Week</div>
            <div className="text-lg font-bold text-[color:var(--board-text-strong)]">{stats.week}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[color:var(--board-column-bg)]/60 border border-[color:var(--board-column-border)]">
            <div className="text-xs text-[color:var(--board-text-muted)]">This Month</div>
            <div className="text-lg font-bold text-[color:var(--board-text-strong)]">{stats.month}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[color:var(--board-column-bg)]/60 border border-[color:var(--board-column-border)]">
            <div className="text-xs text-[color:var(--board-text-muted)]">This Year</div>
            <div className="text-lg font-bold text-[color:var(--board-text-strong)]">{stats.year}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--board-column-border)] px-4 py-3">
        <Button
          onClick={onNewList}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs font-medium rounded-lg border border-dashed border-[color:var(--board-column-border)] hover:border-[color:var(--board-action-border)]"
        >
          <Plus className="h-3.5 w-3.5" />
          New List
        </Button>
      </div>

    </div>
  )
}
