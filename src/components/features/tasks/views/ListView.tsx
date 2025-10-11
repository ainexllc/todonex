'use client'

import type { CSSProperties } from 'react'
import { Calendar, Flag, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns'
import type { Task } from '@/types/task'

interface ListViewProps {
  tasks: Task[]
  onTaskToggle?: (taskId: string, completed: boolean) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  listColorHex?: string
  className?: string
  onAddTask?: () => void
}

const priorityStyles: Record<string, CSSProperties> = {
  low: {
    background: 'var(--priority-low-bg)',
    color: 'var(--priority-low-text)',
    borderColor: 'var(--priority-low-border)'
  },
  medium: {
    background: 'var(--priority-medium-bg)',
    color: 'var(--priority-medium-text)',
    borderColor: 'var(--priority-medium-border)'
  },
  high: {
    background: 'var(--priority-high-bg)',
    color: 'var(--priority-high-text)',
    borderColor: 'var(--priority-high-border)'
  }
}

export function ListView({ tasks, onTaskToggle, onTaskUpdate, listColorHex, className, onAddTask }: ListViewProps) {
  const formatDueDate = (date?: Date) => {
    if (!date) return null

    const dueDate = new Date(date)
    if (isNaN(dueDate.getTime())) return null

    if (isToday(dueDate)) return 'Today'
    if (isTomorrow(dueDate)) return 'Tomorrow'
    if (isThisWeek(dueDate)) return format(dueDate, 'EEEE')
    return format(dueDate, 'MMM d, yyyy')
  }

  const isDueToday = (date?: Date) => date && isToday(new Date(date))
  const isOverdue = (date?: Date) => date && isPast(new Date(date)) && !isToday(new Date(date))

  return (
    <div
      className={cn('p-6', className)}
      style={{
        background: 'var(--board-background)',
        color: 'var(--board-text-strong)'
      }}
    >
      <div
        className="rounded-2xl border backdrop-blur-lg overflow-hidden"
        style={{
          background: 'var(--board-surface-glass)',
          borderColor: listColorHex ?? 'var(--board-column-border)',
          boxShadow: 'var(--board-column-shadow)'
        }}
      >
        {onAddTask && (
          <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: listColorHex ?? 'var(--board-column-border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--board-text-subtle)' }}>Task list</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onAddTask}
              className="h-8 px-3 text-xs rounded-full border"
              style={{
                background: 'var(--board-action-bg)',
                color: 'var(--board-action-text)',
                borderColor: 'var(--board-action-border)'
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Task
            </Button>
          </div>
        )}
        {/* Header Row */}
        <div
          className="grid grid-cols-12 gap-4 px-6 py-3 border-b"
          style={{
            background: listColorHex ? `${listColorHex}40` : 'var(--board-column-bg)',
            borderColor: listColorHex ?? 'var(--board-column-border)'
          }}
        >
          <div className="col-span-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--board-text-subtle)' }}>
            Task
          </div>
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--board-text-subtle)' }}>
            Priority
          </div>
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--board-text-subtle)' }}>
            Labels
          </div>
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--board-text-subtle)' }}>
            Due Date
          </div>
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-right" style={{ color: 'var(--board-text-subtle)' }}>
            Status
          </div>
        </div>

        {/* Task Rows */}
        {tasks.length > 0 ? (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {tasks.map((task) => {
              const taskLabels = task.categories || (task.category ? [task.category] : [])
              const overdue = isOverdue(task.dueDate)
              const dueToday = isDueToday(task.dueDate)

              return (
                <div
                  key={task.id}
                  className={cn(
                    'grid grid-cols-12 gap-4 px-6 py-4 transition-colors',
                    task.completed && 'opacity-60'
                  )}
                  style={{
                    background: 'transparent'
                  }}
                >
                  {/* Task Name + Note */}
                  <div className="col-span-4 min-w-0">
                    <div className="flex flex-col gap-1">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          task.completed && 'line-through'
                        )}
                        style={{ color: task.completed ? 'var(--board-text-muted)' : 'var(--board-text-strong)' }}
                      >
                        {task.title}
                      </p>
                      {task.note && (
                        <p className="text-xs truncate" style={{ color: 'var(--board-text-muted)' }}>
                          {task.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="col-span-2 flex items-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs px-2.5 py-1 font-medium border inline-flex items-center gap-1.5'
                      )}
                      style={priorityStyles[task.priority] ?? priorityStyles.medium}
                    >
                      <Flag className="h-3 w-3" />
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  </div>

                  {/* Labels */}
                  <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                    {taskLabels.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {taskLabels.map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 border"
                            style={{
                              background: 'var(--board-tag-bg)',
                              borderColor: 'var(--board-tag-border)',
                              color: 'var(--board-tag-text)'
                            }}
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--board-text-muted)' }}>-</span>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="col-span-2 flex items-center">
                    {task.dueDate ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs px-2.5 py-1 font-medium inline-flex items-center gap-1.5',
                          'border'
                        )}
                        style={
                          overdue
                            ? {
                                background: 'var(--board-due-overdue-bg)',
                                borderColor: 'var(--board-due-overdue-border)',
                                color: 'var(--board-due-overdue-text)'
                              }
                            : dueToday
                            ? {
                                background: 'var(--board-due-today-bg)',
                                borderColor: 'var(--board-due-today-border)',
                                color: 'var(--board-due-today-text)'
                              }
                            : {
                                background: 'var(--board-due-future-bg)',
                                borderColor: 'var(--board-due-future-border)',
                                color: 'var(--board-due-future-text)'
                              }
                        }
                      >
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(task.dueDate)}
                      </Badge>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--board-text-muted)' }}>-</span>
                    )}
                  </div>

                  {/* Status Action */}
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      size="sm"
                      variant={task.completed ? 'outline' : 'default'}
                      onClick={() => onTaskToggle?.(task.id, !task.completed)}
                      className={cn('h-8 px-3 text-xs font-medium rounded-full border transition-colors')}
                      style={
                        task.completed
                          ? {
                              background: 'var(--board-task-accent-complete)',
                              borderColor: 'var(--priority-low-border)',
                              color: 'var(--priority-low-text)'
                            }
                          : {
                              background: 'var(--board-action-bg)',
                              borderColor: 'var(--board-action-border)',
                              color: 'var(--board-action-text)'
                            }
                      }
                    >
                      {task.completed ? 'Undo' : 'Done'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center space-y-4">
            <p className="text-sm" style={{ color: 'var(--board-text-muted)' }}>
              No tasks match your filters
            </p>
            {onAddTask && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onAddTask}
                className="h-9 px-4 text-sm rounded-full border"
                style={{
                  background: 'var(--board-action-bg)',
                  color: 'var(--board-action-text)',
                  borderColor: 'var(--board-action-border)'
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
