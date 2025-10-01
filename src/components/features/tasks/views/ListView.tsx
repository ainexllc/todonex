'use client'

import { Calendar, Flag } from 'lucide-react'
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
}

const priorityStyles = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-700'
}

export function ListView({ tasks, onTaskToggle, onTaskUpdate, listColorHex, className }: ListViewProps) {
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
    <div className={cn('p-6', className)}>
      <div
        className="rounded-2xl border backdrop-blur-sm overflow-hidden"
        style={{
          backgroundColor: listColorHex ? `${listColorHex}60` : 'hsl(var(--card) / 0.5)',
          borderColor: listColorHex ? `${listColorHex}70` : 'hsl(var(--border) / 0.5)'
        }}
      >
        {/* Header Row */}
        <div
          className="grid grid-cols-12 gap-4 px-6 py-3 border-b"
          style={{
            backgroundColor: listColorHex ? `${listColorHex}70` : 'hsl(var(--muted) / 0.3)',
            borderColor: listColorHex ? `${listColorHex}80` : 'hsl(var(--border) / 0.5)'
          }}
        >
          <div className="col-span-4 text-xs font-semibold text-black dark:text-white uppercase tracking-wide">
            Task
          </div>
          <div className="col-span-2 text-xs font-semibold text-black dark:text-white uppercase tracking-wide">
            Priority
          </div>
          <div className="col-span-2 text-xs font-semibold text-black dark:text-white uppercase tracking-wide">
            Tags
          </div>
          <div className="col-span-2 text-xs font-semibold text-black dark:text-white uppercase tracking-wide">
            Due Date
          </div>
          <div className="col-span-2 text-xs font-semibold text-black dark:text-white uppercase tracking-wide text-right">
            Status
          </div>
        </div>

        {/* Task Rows */}
        {tasks.length > 0 ? (
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {tasks.map((task) => {
              const taskTags = task.categories || (task.category ? [task.category] : [])
              const overdue = isOverdue(task.dueDate)
              const dueToday = isDueToday(task.dueDate)

              return (
                <div
                  key={task.id}
                  className={cn(
                    'grid grid-cols-12 gap-4 px-6 py-4 hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
                    task.completed && 'opacity-60'
                  )}
                >
                  {/* Task Name + Note */}
                  <div className="col-span-4 min-w-0">
                    <div className="flex flex-col gap-1">
                      <p
                        className={cn(
                          'text-sm font-medium truncate text-black dark:text-white',
                          task.completed && 'line-through text-black/60 dark:text-white/60'
                        )}
                      >
                        {task.title}
                      </p>
                      {task.note && (
                        <p className="text-xs text-black/70 dark:text-white/70 truncate">
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
                        'text-xs px-2.5 py-1 font-medium border inline-flex items-center gap-1.5',
                        priorityStyles[task.priority]
                      )}
                    >
                      <Flag className="h-3 w-3" />
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  </div>

                  {/* Tags */}
                  <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                    {taskTags.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {taskTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-black/20 text-black border-black/30 dark:bg-white/20 dark:text-white dark:border-white/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-black/50 dark:text-white/50">-</span>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="col-span-2 flex items-center">
                    {task.dueDate ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs px-2.5 py-1 font-medium inline-flex items-center gap-1.5',
                          overdue && 'bg-red-500/20 border-red-400 text-red-300',
                          dueToday && 'bg-yellow-500/20 border-yellow-400 text-yellow-300',
                          !overdue && !dueToday && 'bg-blue-500/20 border-blue-400 text-blue-300'
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(task.dueDate)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-black/50 dark:text-white/50">-</span>
                    )}
                  </div>

                  {/* Status Action */}
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      size="sm"
                      variant={task.completed ? 'outline' : 'default'}
                      onClick={() => onTaskToggle?.(task.id, !task.completed)}
                      className={cn(
                        'h-8 px-3 text-xs font-medium',
                        task.completed
                          ? 'bg-green-500/20 border-green-400 text-green-300 hover:bg-green-500/30'
                          : 'bg-black/20 border-black/30 text-black dark:bg-white/20 dark:border-white/30 dark:text-white hover:bg-black/30 dark:hover:bg-white/30'
                      )}
                    >
                      {task.completed ? 'Undo' : 'Done'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-black/70 dark:text-white/70">
              No tasks match your filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
