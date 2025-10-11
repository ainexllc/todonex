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
      className={cn('w-72 border-r flex flex-col h-full', className)}
      style={{
        background: 'var(--board-surface-glass)',
        borderColor: 'var(--board-column-border)',
        color: 'var(--board-text-strong)'
      }}
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
                  ? 'bg-[color:var(--board-action-bg)]/70 border-[color:var(--board-action-border)] text-[color:var(--board-action-text)]'
                  : 'bg-transparent border-transparent hover:bg-[color:var(--board-surface-glass)] hover:border-[color:var(--board-column-border)]'
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
          <div className="text-center py-8 px-4 text-sm text-muted-foreground">
            No lists yet. Create your first list to get started!
          </div>
        )}
      </div>

      {/* Stats Summary Section */}
      <div
        className="flex-shrink-0 px-4 py-3 border-t"
        style={{ borderColor: 'var(--board-column-border)' }}
      >
        <div className="mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Completed
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 rounded-lg bg-[color:var(--board-column-bg)]/60 border border-[color:var(--board-column-border)]">
            <div className="text-xs" style={{ color: 'var(--board-text-muted)' }}>Today</div>
            <div className="text-lg font-bold">{stats.today}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[color:var(--board-column-bg)]/60 border border-[color:var(--board-column-border)]">
            <div className="text-xs" style={{ color: 'var(--board-text-muted)' }}>This Week</div>
            <div className="text-lg font-bold">{stats.week}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[color:var(--board-column-bg)]/60 border border-[color:var(--board-column-border)]">
            <div className="text-xs" style={{ color: 'var(--board-text-muted)' }}>This Month</div>
            <div className="text-lg font-bold">{stats.month}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[color:var(--board-column-bg)]/60 border border-[color:var(--board-column-border)]">
            <div className="text-xs" style={{ color: 'var(--board-text-muted)' }}>This Year</div>
            <div className="text-lg font-bold">{stats.year}</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--board-column-border)' }}>
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
