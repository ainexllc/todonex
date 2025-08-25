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
}

export function TaskList({ tasks, selectedTaskId, onTaskUpdate, onTaskDelete, onTaskEdit, onTaskSelect }: TaskListProps) {
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
    return dueDate < new Date()
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
              "group w-full flex flex-col py-0 rounded-3xl task-card cursor-pointer relative transition-all duration-150",
              task.completed && "opacity-60",
              isSelected ? "border-primary bg-primary/5" : ""
            )}
            onClick={() => onTaskSelect(task)}
          >
            <div className="flex flex-col px-4 py-2 gap-0.5">
              <div className="flex flex-row items-center justify-between">
                <h1 className={cn(
                  "text-sm font-medium line-clamp-1 task-title",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h1>
                <div className="flex items-center justify-end gap-2">
                  {/* Hover Action Icons - Right aligned */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 hover:bg-muted/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTaskEdit(task)
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 hover:bg-muted/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Toggle task completion status
                        toggleComplete(task)
                      }}
                    >
                      {task.completed ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    </Button>
                  </div>
                  
                  {/* Priority Badge and Date - hidden on hover, right aligned */}
                  <div className="group-hover:opacity-0 transition-opacity duration-200 ml-auto">
                    <div className="text-sm text-foreground flex items-center gap-2 line-clamp-1">
                      {/* Priority Badge */}
                      <div className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-sm border",
                        getPriorityColor(task.priority)
                      )}>
                        {task.priority}
                      </div>
                      <p className="text-sm font-medium line-clamp-1 task-description">
                        {formatRepeatSchedule(task)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t-[0.5px]">
              <div className="w-full">
                <div className="flex-nowrap px-4 pb-2 pt-1.5 flex items-center justify-between w-full text-sm h-full gap-0.5">
                  <div className="flex items-center gap-1.5">
                    {/* Completion Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-4 w-4 rounded-full hover:bg-muted transition-all duration-150 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleComplete(task)
                      }}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Circle className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </Button>
                    <div className="flex flex-col gap-1">
                      <p className={cn(
                        "text-sm text-muted-foreground line-clamp-1 task-description",
                        task.completed && "line-through"
                      )}>
                        {task.description || "No description"}
                      </p>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground task-description">
                          <span>•</span>
                          <span>
                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks completed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {/* Status Indicators */}
                    {overdue && (
                      <span className="text-sm text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950 px-1.5 py-0.5 rounded task-description">
                        Overdue
                      </span>
                    )}
                    {dueSoon && !overdue && (
                      <span className="text-sm text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950 px-1.5 py-0.5 rounded task-description">
                        Due Soon
                      </span>
                    )}
                    <p className="line-clamp-1 text-sm task-description">
                      {getRelativeTime(task.createdAt)}
                    </p>
                    {!task.completed && (
                      <div className="w-[14px] h-full flex items-center justify-center">
                        <div className="rounded-full bg-primary size-1.5"></div>
                      </div>
                    )}
                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskEdit(task)
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleComplete(task)
                          }}
                        >
                          {task.completed ? (
                            <>
                              <Circle className="h-4 w-4 mr-2" />
                              Mark Pending
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Complete
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            onTaskDelete(task.id)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}