'use client'

import { X, Calendar, Flag, CheckCircle2, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { HabitSettings } from '@/types/task'

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  categoryId?: string
  subtasks?: Subtask[]
  createdAt: Date
  updatedAt: Date
  isHabit?: boolean
  habitSettings?: HabitSettings
}

interface TaskViewModalProps {
  task: Task | null
  onClose: () => void
  onEdit: (task: Task) => void
}

export function TaskViewModal({ task, onClose, onEdit }: TaskViewModalProps) {
  if (!task) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400'
      case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-400'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getPriorityIcon = (priority: string) => {
    return <Flag className="h-4 w-4" />
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return null
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return null

    return `${dateObj.getUTCMonth() + 1}/${dateObj.getUTCDate()}`
  }

  const formatHabitCadence = (settings?: HabitSettings | null) => {
    if (!settings) return null

    switch (settings.frequency) {
      case 'daily':
        return 'Repeats daily'
      case 'weekly':
        return 'Repeats weekly'
      case 'monthly':
        return 'Repeats monthly'
      case 'custom': {
        const interval = Math.max(settings.intervalDays ?? 1, 1)
        return `Repeats every ${interval} day${interval === 1 ? '' : 's'}`
      }
      default:
        return null
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto task-form-modal">
        <DialogHeader className="pb-6 border-b border-border">
          <DialogTitle className="flex items-center justify-between text-xl font-semibold pr-8">
            <div className="flex items-center gap-3">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={cn(task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </span>
            </div>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Task Status & Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  task.completed 
                    ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                )}>
                  {task.completed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-3 w-3" />
                      Pending
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  getPriorityColor(task.priority)
                )}>
                  {getPriorityIcon(task.priority)}
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <div className="p-4 bg-muted/30 rounded-lg border">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
              <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(task.dueDate)}</span>
              </div>
            </div>
          )}

          {/* Habit Details */}
          {task.isHabit && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Habit Cadence</h3>
              <div className="p-3 bg-muted/20 rounded-lg border space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatHabitCadence(task.habitSettings) ?? 'Repeats regularly'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="block text-foreground text-sm font-medium">Streak</span>
                    <span>{task.habitSettings?.streak ?? 0} day{(task.habitSettings?.streak ?? 0) === 1 ? '' : 's'}</span>
                  </div>
                  <div>
                    <span className="block text-foreground text-sm font-medium">Total Completions</span>
                    <span>{task.habitSettings?.totalCompletions ?? 0}</span>
                  </div>
                  {task.habitSettings?.lastCompletion && (
                    <div className="col-span-2">
                      <span className="block text-foreground text-sm font-medium">Last Logged</span>
                      <span>{formatDate(task.habitSettings.lastCompletion)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} completed)
              </h3>
              <div className="space-y-2">
                {task.subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg border">
                    {subtask.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm flex-1",
                      subtask.completed && "line-through text-muted-foreground"
                    )}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
            <span>Created: {formatDate(task.createdAt)}</span>
            <span>Updated: {formatDate(task.updatedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-border">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={() => onEdit(task)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
