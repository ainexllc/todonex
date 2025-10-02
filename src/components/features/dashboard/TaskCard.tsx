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
  Clock
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
  showCheckbox?: boolean
  draggable?: boolean
  compact?: boolean
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
  showCheckbox = false,
  draggable = false,
  compact = false,
  className
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingPriority, setIsEditingPriority] = useState(false)

  // Get categories from either new categories array or old category field
  const taskCategories = task.categories || (task.category ? [task.category] : [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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

  const handleCategoriesChange = (newCategories: string[]) => {
    onUpdate?.(task.id, { categories: newCategories })
  }

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    onUpdate?.(task.id, { priority })
    setIsEditingPriority(false)
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

        <span className={cn(
          'text-xs truncate flex-shrink min-w-0',
          task.completed && 'line-through text-muted-foreground'
        )}>
          {toTitleCase(task.title)}
        </span>

        {task.dueDate && (
          <span className={cn(
            'text-xs flex items-center gap-1 flex-shrink-0 ml-auto',
            isOverdue && 'text-red-400 font-semibold',
            isDueToday && 'text-yellow-400 font-semibold'
          )}>
            <Clock className="h-3 w-3" />
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'p-4 transition-all duration-200',
        'bg-gray-800/90 dark:bg-gray-800/90',
        'border border-white/10',
        'shadow-sm hover:shadow-md',
        'rounded-xl',
        'backdrop-blur-sm',
        selected && 'ring-2 ring-primary',
        task.completed && 'opacity-70',
        draggable && 'cursor-move hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {draggable && (
          <div className="flex-shrink-0 mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
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
        <button
          onClick={handleToggleComplete}
          className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
        >
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-400 hover:text-primary" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
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
                'font-medium text-sm cursor-pointer hover:text-blue-300 transition-colors leading-relaxed text-white',
                task.completed && 'line-through text-gray-400'
              )}
            >
              {toTitleCase(task.title)}
            </h3>
          )}

          {/* Description */}
          {task.description && isExpanded && (
            <p className="text-xs text-gray-300 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Row - Single Line */}
          <div className="flex items-center gap-1.5">
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
                className={cn('text-xs px-1.5 py-0.5 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform', getPriorityColor(task.priority))}
                onClick={() => !task.completed && setIsEditingPriority(true)}
              >
                <Flag className="h-2.5 w-2.5 mr-0.5" />
                {task.priority}
              </Badge>
            )}

            {/* Categories - Multiple */}
            {taskCategories.length > 0 ? (
              <div className="flex gap-1 flex-shrink-0">
                {taskCategories.map(cat => (
                  <Badge key={cat} variant="outline" className="text-xs px-1.5 py-0.5">
                    {cat}
                  </Badge>
                ))}
              </div>
            ) : (
              !task.completed && (
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 flex-shrink-0 text-gray-500"
                >
                  No categories
                </Badge>
              )
            )}

            {/* Due Date - pushed to right - ALWAYS VISIBLE */}
            {task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs px-2 py-1 flex-shrink-0 ml-auto flex items-center gap-1',
                  'border-2 font-semibold',
                  isOverdue && 'bg-red-500/10 border-red-500 text-red-400',
                  isDueToday && 'bg-yellow-500/10 border-yellow-500 text-yellow-400',
                  !isOverdue && !isDueToday && 'border-blue-500/50 text-blue-400'
                )}
              >
                <Calendar className="h-3 w-3" />
                {formatDueDate(task.dueDate)}
              </Badge>
            )}
          </div>

          {/* Category Editor */}
          {!task.completed && (
            <div className="mt-1.5">
              <TagInput
                tags={taskCategories}
                onChange={handleCategoriesChange}
                placeholder="Add categories..."
                className="text-xs"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {/* Always visible delete button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          {/* Other actions - show on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAIEnhance && !task.completed && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAIEnhance}
                className="h-7 w-7 p-0"
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
                className="h-7 w-7 p-0"
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
