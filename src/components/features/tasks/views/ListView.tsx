'use client'

import type { CSSProperties } from 'react'
import { Calendar, Flag, Plus, Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns'
import type { Task } from '@/types/task'

interface ListViewProps {
  tasks: Task[]
  onTaskToggle?: (taskId: string, completed: boolean) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskEdit?: (task: Task) => void
  onTaskDelete?: (task: Task) => void
  listColorHex?: string
  className?: string
  onAddTask?: () => void
  onHabitLog?: (taskId: string) => void
  onHabitEdit?: (taskId: string) => void
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

export function ListView({
  tasks,
  onTaskToggle,
  onTaskUpdate: _onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
  listColorHex: _listColorHex,
  className,
  onAddTask,
  onHabitLog,
  onHabitEdit
}: ListViewProps) {
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
      className={cn('w-full p-6', className)}
      style={{
        background: 'var(--board-background)',
        color: 'var(--board-text-strong)'
      }}
    >
      <div
        className="overflow-hidden rounded-2xl border border-[color:var(--board-column-border)] bg-[color:var(--board-column-bg)]/85 backdrop-blur-lg"
        style={{ boxShadow: 'var(--board-column-shadow)' }}
      >
        {onAddTask && (
          <div className="flex items-center justify-between border-b border-[color:var(--board-column-border)] px-6 py-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--board-text-subtle)' }}>Task list</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onAddTask}
              className="h-8 rounded-full border border-[color:var(--board-column-border-accent)] bg-[color:var(--board-column-border-accent)]/35 px-3 text-xs text-[color:var(--board-text-strong)]"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Task
            </Button>
          </div>
        )}
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 border-b border-[color:var(--board-column-border)] bg-[color:var(--board-column-bg)]/70 px-6 py-3">
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
            Actions
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
                    'grid grid-cols-12 gap-4 border-b px-6 py-4 transition-all duration-200 ease-out last:border-b-0 hover:-translate-y-[1px] hover:shadow-[var(--board-card-shadow)]',
                    task.completed && 'opacity-60'
                  )}
                  style={{
                    background: 'var(--board-card-bg)',
                    borderColor: 'var(--board-card-border)'
                  }}
                >
                  {/* Task Name + Note */}
                  <div className="col-span-4 min-w-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            task.completed && 'line-through'
                          )}
                          style={{ color: task.completed ? 'var(--board-text-muted)' : 'var(--board-text-strong)' }}
                        >
                          {task.title}
                        </p>
                        {task.isHabit && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 font-semibold rounded-full border-[color:var(--board-action-border)] bg-[color:var(--board-action-bg)] text-[color:var(--board-action-text)]"
                          >
                            Habit
                          </Badge>
                        )}
                      </div>
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
                        'text-[10px] px-2 py-0.5 font-semibold border inline-flex items-center gap-1 rounded-full uppercase tracking-wide'
                      )}
                      style={priorityStyles[task.priority] ?? priorityStyles.medium}
                    >
                      <Flag className="h-2.5 w-2.5" />
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  </div>

                  {/* Labels */}
          <div className="col-span-2 flex min-w-0 items-center gap-1.5">
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

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {task.isHabit && onHabitLog && !task.completed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onHabitLog(task.id)}
                        className="h-8 rounded-full border border-[color:var(--board-column-border-accent)] bg-[color:var(--board-column-border-accent)]/35 px-3 text-xs font-medium text-[color:var(--board-text-strong)] transition-colors"
                      >
                        Log
                      </Button>
                    )}
                    {task.isHabit && onHabitEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onHabitEdit(task.id)}
                        className="h-8 px-3 text-xs font-medium rounded-full border transition-colors"
                        style={{
                          background: 'var(--board-surface-glass)',
                          borderColor: 'var(--board-column-border)',
                          color: 'var(--board-text-muted)'
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onTaskEdit?.(task)}
                      className="h-8 w-8 rounded-full border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]/80 text-[color:var(--board-text-muted)] hover:text-[color:var(--board-text-strong)] hover:border-[color:var(--board-column-border-accent)] hover:bg-[color:var(--board-column-border-accent)]/30 transition-colors"
                      aria-label="Edit task"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onTaskDelete?.(task)}
                      className="h-8 w-8 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 hover:text-red-100 hover:border-red-400 hover:bg-red-500/20 transition-colors"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant={task.completed ? 'outline' : 'default'}
                      onClick={() => onTaskToggle?.(task.id, !task.completed)}
                      className={cn('h-8 rounded-full border px-3 text-xs font-medium transition-colors')}
                      style={
                        task.completed
                          ? {
                              background: 'var(--board-task-accent-complete)',
                              borderColor: 'var(--priority-low-border)',
                              color: 'var(--priority-low-text)'
                            }
                          : {
                              background: 'var(--board-column-border-accent)',
                              borderColor: 'var(--board-column-border-accent)',
                              color: 'var(--board-text-strong)'
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
                className="h-9 rounded-full border border-[color:var(--board-column-border-accent)] bg-[color:var(--board-column-border-accent)]/35 px-4 text-sm text-[color:var(--board-text-strong)]"
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
