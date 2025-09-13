'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Calendar, Flag, Edit2, Trash2, MoreVertical, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

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
}

interface TaskListProps {
  tasks: Task[]
  selectedTaskId?: string
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  onTaskEdit: (task: Task) => void
  onTaskSelect: (task: Task) => void
  onTaskView: (task: Task) => void
}

export function TaskList({ tasks, selectedTaskId, onTaskUpdate, onTaskDelete, onTaskEdit, onTaskSelect, onTaskView }: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const toggleComplete = (task: Task) => {
    onTaskUpdate(task.id, { completed: !task.completed })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flag className="h-3 w-3" />
      case 'medium': return <Flag className="h-3 w-3" />
      case 'low': return <Flag className="h-3 w-3" />
      default: return null
    }
  }

  const formatRepeatSchedule = (task: Task) => {
    // For now, we'll simulate repeat patterns based on task properties
    // In a real app, you'd have a repeat field in the task model
    
    if (task.dueDate) {
      const dateObj = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate)
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date'
      }
      
      const hour = dateObj.getHours()
      const minute = dateObj.getMinutes()
      
      // Format time based on whether it's on the hour or has minutes
      const time = minute === 0 
        ? dateObj.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
        : dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      
      // Simulate different repeat patterns based on task priority and time
      if (task.priority === 'high') {
        return `Daily at ${time}`
      } else if (task.priority === 'medium') {
        return `Weekly at ${time}`
      } else {
        // For low priority tasks, use time of day descriptions
        if (hour >= 6 && hour < 12) {
          return 'Daily in the morning'
        } else if (hour >= 12 && hour < 17) {
          return 'Daily in the afternoon'
        } else if (hour >= 17 && hour < 21) {
          return 'Daily in the evening'
        } else {
          return `Daily at ${time}`
        }
      }
    }
    
    // For tasks without due dates, create variety based on task properties
    const taskHash = task.id.length % 4
    const patterns = [
      'Daily in the morning',
      'Weekly at 2pm',
      'Daily at 9am',
      'Monthly at 10am'
    ]
    
    return patterns[taskHash] || 'Daily in the morning'
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    if (isNaN(dueDate.getTime())) return false
    
    // Get today's date at midnight for accurate day comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get due date at midnight
    const dueDateMidnight = new Date(dueDate)
    dueDateMidnight.setHours(0, 0, 0, 0)
    
    // Overdue if due date was yesterday or earlier
    return dueDateMidnight < today
  }

  const isDueSoon = (task: Task) => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    if (isNaN(dueDate.getTime())) return false
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return dueDate <= tomorrow
  }

  if (tasks.length === 0) {
    return null
  }

  // Helper function to get relative time
  const getRelativeTime = (date: Date | null | undefined) => {
    if (!date) return 'Recently'
    
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return 'Recently'
    
    const now = new Date()
    const diffInMs = now.getTime() - dateObj.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(dateObj)
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const overdue = isOverdue(task)
        const dueSoon = isDueSoon(task)
        const isSelected = selectedTaskId === task.id

        return (
          <div
            key={task.id}
            className={cn(
              "group w-full rounded-lg bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/30 border border-primary/20 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg",
              task.completed && "opacity-60",
              isSelected ? "border-primary bg-primary/5" : ""
            )}
            onClick={() => onTaskView(task)}
          >
            <div className="p-4 space-y-2">
              {/* Task Title */}
              <div className="flex items-center justify-between">
                <div className={cn(
                  "text-foreground line-clamp-1 flex-1 mr-3 task-title-custom",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </div>
                
                <div className="flex items-center gap-1">
                  {/* Edit Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskEdit(task)
                    }}
                    title="Edit task"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>

                  {/* Complete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskUpdate(task.id, { completed: !task.completed })
                    }}
                    title={task.completed ? "Mark as pending" : "Mark as complete"}
                  >
                    {task.completed ? (
                      <Circle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTaskDelete(task.id)
                    }}
                    title="Delete task"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Separator Line */}
              <div className="h-0.5 bg-border w-full"></div>

              {/* Task Description */}
              {task.description && (
                <p className={cn(
                  "text-gray-500 dark:text-gray-400 line-clamp-2 task-desc-custom",
                  task.completed && "line-through"
                )}>
                  {task.description}
                </p>
              )}

              {/* Task Meta Information */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  {/* Completion Status */}
                  <div className="flex items-center gap-1">
                    {task.completed ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    <span>{task.completed ? 'Completed' : 'Pending'}</span>
                  </div>
                  
                  {/* Subtasks Count */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span>
                      • {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                    </span>
                  )}
                </div>

                {/* Due Date or Created Time */}
                <div className="flex items-center gap-2">
                  {overdue && (
                    <span className="text-red-600 bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
                      Overdue
                    </span>
                  )}
                  {dueSoon && !overdue && (
                    <span className="text-orange-600 bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded">
                      Due Soon
                    </span>
                  )}
                  <span>
                    {task.dueDate 
                      ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: new Date(task.dueDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })
                      : 'No due date'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}