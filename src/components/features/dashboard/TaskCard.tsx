'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TagInput } from '@/components/ui/tag-input'
import {
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  Trash2,
  Edit2,
  Check,
  X,
  GripVertical,
  Sparkles,
  Clock,
  Flame,
  Settings2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns'
import { toTitleCase } from '@/lib/utils/text-formatter'
import type { Task } from '@/types/task'

// Re-export Task type for backward compatibility
export type { Task }

interface TaskCardProps {
  task: Task
  selected?: boolean
  onToggleComplete?: (taskId: string, completed: boolean) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onDelete?: (taskId: string) => void
  onSelect?: (taskId: string) => void
  onAIEnhance?: (taskId: string) => void
  onHabitLog?: (taskId: string) => void
  onHabitEdit?: (taskId: string) => void
  showCheckbox?: boolean
  draggable?: boolean
  compact?: boolean
  showCompleteToggle?: boolean
  showCategories?: boolean
  className?: string
}

export function TaskCard({
  task,
  selected = false,
  onToggleComplete,
  onUpdate,
  onDelete,
  onSelect,
  onAIEnhance,
  onHabitLog,
  onHabitEdit,
  showCheckbox = false,
  draggable = false,
  compact = false,
  showCompleteToggle = true,
  showCategories = true,
  className
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingPriority, setIsEditingPriority] = useState(false)
  const [isEditingDueDate, setIsEditingDueDate] = useState(false)

  // Get labels from either new categories array or old category field
  const taskLabels = task.categories || (task.category ? [task.category] : [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border text-[color:var(--priority-high-text)] bg-[color:var(--priority-high-bg)] border-[color:var(--priority-high-border)]'
      case 'medium':
        return 'border text-[color:var(--priority-medium-text)] bg-[color:var(--priority-medium-bg)] border-[color:var(--priority-medium-border)]'
      case 'low':
        return 'border text-[color:var(--priority-low-text)] bg-[color:var(--priority-low-bg)] border-[color:var(--priority-low-border)]'
      default:
        return 'border border-[color:var(--border)] text-muted-foreground bg-muted/20'
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

  const handleTitleClick = () => {
    if (!task.completed && !isEditing) {
      setIsEditing(true)
    }
  }

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      onUpdate?.(task.id, { title: editedTitle.trim() })
    } else {
      setEditedTitle(task.title)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedTitle(task.title)
    setIsEditing(false)
  }

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleComplete?.(task.id, !task.completed)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Delete this task?')) {
      onDelete?.(task.id)
    }
  }

  const handleAIEnhance = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAIEnhance?.(task.id)
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(task.id)
  }

  const handleLabelsChange = (newCategories: string[]) => {
    onUpdate?.(task.id, { categories: newCategories })
  }

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    onUpdate?.(task.id, { priority })
    setIsEditingPriority(false)
  }

  const handleDueDateChange = (dateString: string) => {
    const newDate = dateString ? new Date(dateString) : undefined
    onUpdate?.(task.id, { dueDate: newDate })
    setIsEditingDueDate(false)
  }

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors group',
          selected && 'bg-primary/10 border border-primary/30',
          task.completed && 'opacity-60',
          className
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {showCheckbox && (
          <Checkbox
            checked={selected}
            onCheckedChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {showCompleteToggle && (
          <button
            onClick={handleToggleComplete}
            className="flex-shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        )}

        <span
          className={cn(
            'text-xs truncate flex-shrink min-w-0',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {toTitleCase(task.title)}
        </span>

        {((task.isHabit && !task.completed && (onHabitLog || onHabitEdit)) || task.dueDate) && (
          <div className="ml-auto flex items-center gap-2">
            {task.isHabit && onHabitLog && !task.completed && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onHabitLog(task.id)
                }}
                className="text-[10px] font-semibold uppercase tracking-wide rounded-full border border-[color:var(--board-action-border)] bg-[color:var(--board-action-bg)] px-2 py-1 text-[color:var(--board-action-text)] hover:bg-[color:var(--board-action-bg)]/80"
              >
                Log
              </button>
            )}
            {task.isHabit && onHabitEdit && !task.completed && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onHabitEdit(task.id)
                }}
                className="text-[10px] font-semibold uppercase tracking-wide rounded-full border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)] px-2 py-1 text-[color:var(--board-text-muted)] hover:text-[color:var(--board-text-strong)]"
              >
                Edit
              </button>
            )}

            {task.dueDate && (
              <span
                className={cn(
                  'text-xs flex items-center gap-1 flex-shrink-0',
                  isOverdue && 'text-red-400 font-semibold',
                  isDueToday && 'text-yellow-400 font-semibold'
                )}
              >
                <Clock className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden group p-5 transition-all duration-300 ease-out',
        'border border-[color:var(--board-column-border)] hover:-translate-y-1',
        'bg-[color:var(--board-card-bg)] text-[color:var(--board-text-strong)]',
        '[box-shadow:var(--board-card-shadow)] [border-color:var(--board-card-border)]',
        'group-hover:[box-shadow:var(--board-card-hover-shadow)] group-hover:[border-color:var(--board-card-hover-border)]',
        'rounded-2xl',
        selected && 'ring-2 ring-primary',
        task.completed && 'opacity-60',
        draggable && 'cursor-move',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0" style={{ background: 'var(--board-card-hover-overlay)' }} />
      </div>
      <div className="relative flex items-start gap-4">
        {/* Drag Handle */}
        {draggable && (
          <div className="flex-shrink-0 mt-1 text-[color:var(--board-icon-muted)] hover:text-[color:var(--board-text-strong)] cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Checkbox for bulk selection */}
        {showCheckbox && (
          <Checkbox
            checked={selected}
            onCheckedChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
        )}

        {/* Completion Toggle */}
        {showCompleteToggle && (
          <button
            onClick={handleToggleComplete}
            className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-full border border-border/50 bg-[color:var(--board-surface-glass)] text-[color:var(--board-icon-muted)] transition-all hover:-translate-y-0.5"
            style={{ borderColor: 'var(--board-column-border)' }}
          >
            {task.completed ? (
              <CheckCircle2 className="mx-auto h-4 w-4" style={{ color: 'var(--priority-low-text)' }} />
            ) : (
              <Circle className="mx-auto h-4 w-4" />
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Title */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
                className="flex-1 h-7 text-xs"
                autoFocus
                onBlur={handleSaveTitle}
              />
              <Button size="sm" variant="ghost" onClick={handleSaveTitle} className="h-6 w-6 p-0">
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <h3
              onClick={handleTitleClick}
              className={cn(
                'font-semibold text-sm cursor-pointer leading-relaxed transition-colors',
                task.completed ? 'line-through text-muted-foreground' : ''
              )}
              style={{
                color: task.completed ? 'var(--board-text-subtle)' : 'var(--board-text-strong)'
              }}
            >
              {toTitleCase(task.title)}
            </h3>
          )}

          {/* Description */}
          {task.description && isExpanded && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--board-text-muted)' }}>
              {task.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Due Date */}
            {isEditingDueDate ? (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  defaultValue={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="h-7 rounded-full border border-primary/60 bg-background/80 px-3 text-[11px] text-foreground shadow-sm focus-visible:outline-none"
                  autoFocus
                  onBlur={() => setIsEditingDueDate(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsEditingDueDate(false)
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingDueDate(false)}
                  className="h-6 w-6 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => !task.completed && setIsEditingDueDate(true)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-all',
                  'shadow-sm hover:shadow-md hover:-translate-y-0.5',
                  task.completed && 'cursor-default opacity-60 hover:translate-y-0 hover:shadow-none'
                )}
                disabled={task.completed}
                style={
                  task.dueDate
                    ? isOverdue
                      ? {
                          background: 'var(--board-due-overdue-bg)',
                          borderColor: 'var(--board-due-overdue-border)',
                          color: 'var(--board-due-overdue-text)'
                        }
                      : isDueToday
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
                    : {
                        background: 'var(--board-due-empty-bg)',
                        borderColor: 'var(--board-due-empty-border)',
                        color: 'var(--board-due-empty-text)'
                      }
                }
              >
                <Calendar className="h-3.5 w-3.5" />
                {task.dueDate ? (formatDueDate(task.dueDate) ?? 'Set date') : 'Add date'}
              </button>
            )}

            {/* Priority Badge - Clickable */}
            {isEditingPriority ? (
              <div className="flex gap-1">
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 cursor-pointer bg-red-100 dark:bg-red-950 hover:scale-105"
                  onClick={() => handlePriorityChange('high')}
                >
                  High
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 cursor-pointer bg-yellow-100 dark:bg-yellow-950 hover:scale-105"
                  onClick={() => handlePriorityChange('medium')}
                >
                  Med
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 cursor-pointer bg-green-100 dark:bg-green-950 hover:scale-105"
                  onClick={() => handlePriorityChange('low')}
                >
                  Low
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingPriority(false)}
                  className="h-5 w-5 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
            <Badge
              variant="outline"
              className={cn(
                'flex-shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-all',
                'shadow-sm hover:shadow-md hover:-translate-y-0.5 border',
                getPriorityColor(task.priority)
              )}
              onClick={() => !task.completed && setIsEditingPriority(true)}
            >
              <Flag className="h-2.5 w-2.5 mr-0.5" />
              {task.priority}
            </Badge>
          )}

            {task.isHabit && task.habitSettings && (task.habitSettings.totalCompletions ?? 0) > 0 && (
              <Badge
                variant="outline"
                className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-[color:var(--board-action-border)] bg-[color:var(--board-action-bg)] text-[color:var(--board-action-text)]"
              >
                <Flame className="h-2.5 w-2.5 mr-1" />
                {task.habitSettings.streak ?? 0} day streak
              </Badge>
            )}

            {/* Labels - Multiple */}
            {showCategories && (taskLabels.length > 0 ? (
              <div className="flex flex-shrink-0 gap-1.5">
                {taskLabels.map(label => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="rounded-full px-3 py-1 text-[11px]"
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
              !task.completed && (
                <Badge
                  variant="outline"
                  className="flex-shrink-0 rounded-full px-3 py-1 text-[11px]"
                  style={{
                    background: 'var(--board-tag-bg)',
                    borderColor: 'var(--board-tag-border)',
                    color: 'var(--board-tag-text)'
                  }}
                >
                  No labels
                </Badge>
              )
            ))}
          </div>

          {/* Label Editor */}
          {showCategories && !task.completed && (
            <div
              className="rounded-xl border px-3 py-2"
              style={{
                background: 'var(--board-tag-bg)',
                borderColor: 'var(--board-tag-border)'
              }}
            >
              <TagInput
                tags={taskLabels}
                onChange={handleLabelsChange}
                placeholder="Add labels..."
                className="text-xs"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-start gap-2">
          {task.isHabit && onHabitLog && !task.completed && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onHabitLog(task.id)
              }}
              className="h-8 px-3 text-xs rounded-full border"
              style={{
                background: 'var(--board-action-bg)',
                color: 'var(--board-action-text)',
                borderColor: 'var(--board-action-border)'
              }}
              title="Log habit completion"
            >
              Log Habit
            </Button>
          )}
          {task.isHabit && onHabitEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onHabitEdit(task.id)
              }}
              className="h-8 w-8 rounded-full p-0 transition-all hover:bg-[color:var(--board-surface-glass)]/80"
              style={{
                background: 'var(--board-surface-glass)',
                color: 'var(--board-text-subtle)'
              }}
              title="Edit habit settings"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Always visible delete button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-8 w-8 rounded-full p-0 transition-all hover:bg-[color:var(--board-danger-bg)]/80"
            style={{
              background: 'var(--board-danger-bg)',
              color: 'var(--board-danger-text)'
            }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          {/* Other actions - show on hover */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onAIEnhance && !task.completed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAIEnhance}
                className="h-8 w-8 rounded-full p-0 transition-all hover:bg-[color:var(--board-action-bg)]/80"
                style={{
                  background: 'var(--board-action-bg)',
                  color: 'var(--board-action-text)'
                }}
                title="AI Enhance"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            )}

            {!task.completed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleTitleClick}
                className="h-8 w-8 rounded-full p-0 transition-all hover:bg-[color:var(--board-surface-glass)]/80"
                style={{
                  background: 'var(--board-surface-glass)',
                  color: 'var(--board-text-subtle)'
                }}
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expand/Collapse for description */}
      {task.description && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-xs text-muted-foreground hover:text-foreground mt-2 ml-11"
        >
          Show description...
        </button>
      )}
    </Card>
  )
}
