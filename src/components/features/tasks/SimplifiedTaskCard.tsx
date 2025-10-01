'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Check, Undo2, Calendar, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns'
import type { Task, TaskStatus } from '@/types/task'

interface SimplifiedTaskCardProps {
  task: Task
  onToggleDone?: (taskId: string, completed: boolean) => void
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onDelete?: (taskId: string) => void
  className?: string
}

export function SimplifiedTaskCard({
  task,
  onToggleDone,
  onStatusChange,
  onUpdate,
  onDelete,
  className
}: SimplifiedTaskCardProps) {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const formatDueDate = (date?: Date) => {
    if (!date) return null
    const dueDate = new Date(date)
    if (isNaN(dueDate.getTime())) return null

    if (isToday(dueDate)) return 'Today'
    if (isTomorrow(dueDate)) return 'Tomorrow'
    if (isThisWeek(dueDate)) return format(dueDate, 'EEEE')
    return format(dueDate, 'MMM d')
  }

  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))

  const handleToggleDone = () => {
    onToggleDone?.(task.id, !task.completed)
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus !== task.status) {
      onStatusChange?.(task.id, newStatus)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Delete this task?')) {
      onDelete?.(task.id)
    }
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-border bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm',
        'p-3 space-y-2.5 transition-all duration-200 hover:shadow-md',
        task.completed && 'opacity-70',
        className
      )}
    >
      {/* Header: Title and Done/Undo button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold text-sm leading-snug',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h3>
          {task.note && (
            <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
              {task.note}
            </p>
          )}
        </div>

        {/* Done/Undo button */}
        <Button
          size="sm"
          variant={task.completed ? 'outline' : 'default'}
          onClick={handleToggleDone}
          className="h-7 px-2.5 text-xs flex-shrink-0"
        >
          {task.completed ? (
            <>
              <Undo2 className="h-3 w-3 mr-1" />
              Undo
            </>
          ) : (
            <>
              <Check className="h-3 w-3 mr-1" />
              Done
            </>
          )}
        </Button>
      </div>

      {/* Bottom section: Priority, Tags, and Due Date */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Priority pill */}
        <Badge
          variant="outline"
          className={cn(
            'text-xs px-2 py-0.5 flex-shrink-0 font-medium',
            getPriorityStyles(task.priority)
          )}
        >
          {task.priority}
        </Badge>

        {/* Tag pills */}
        {task.tags && task.tags.length > 0 && (
          <>
            {task.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0.5 flex-shrink-0"
              >
                {tag}
              </Badge>
            ))}
          </>
        )}

        {/* Due date - pushed to right */}
        {task.dueDate && (
          <Badge
            variant="outline"
            className={cn(
              'text-xs px-2 py-0.5 flex-shrink-0 ml-auto flex items-center gap-1 font-medium',
              isOverdue && 'bg-red-500/10 border-red-500 text-red-500 dark:text-red-400',
              isDueToday && 'bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400'
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDueDate(task.dueDate)}
          </Badge>
        )}
      </div>

      {/* Action buttons row */}
      {onStatusChange && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
          <Button
            size="sm"
            variant={task.status === 'today' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('today')}
            className="h-6 text-xs px-2 flex-1"
            disabled={task.status === 'today'}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={task.status === 'upcoming' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('upcoming')}
            className="h-6 text-xs px-2 flex-1"
            disabled={task.status === 'upcoming'}
          >
            Upcoming
          </Button>
          <Button
            size="sm"
            variant={task.status === 'done' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('done')}
            className="h-6 text-xs px-2 flex-1"
            disabled={task.status === 'done'}
          >
            Done
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              title="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
