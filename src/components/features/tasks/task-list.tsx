'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Calendar, Flag, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  categoryId?: string
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

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'No date'
    
    // Convert Firebase Timestamp to Date if needed
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(dateObj)
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
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return formatDate(date)
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
                  "font-semibold line-clamp-1 task-title",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h1>
                <div>
                  <h1 className="text-xs font-semibold text-foreground flex items-center gap-1 line-clamp-1">
                    <p className="text-xs font-medium line-clamp-1">
                      {task.dueDate ? formatDate(new Date(task.dueDate)) : getRelativeTime(task.createdAt)}
                    </p>
                    {/* Priority Badge */}
                    <div className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ml-2",
                      getPriorityColor(task.priority)
                    )}>
                      {task.priority}
                    </div>
                  </h1>
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
                    <p className={cn(
                      "text-muted-foreground line-clamp-1 task-description",
                      task.completed && "line-through"
                    )}>
                      {task.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {/* Status Indicators */}
                    {overdue && (
                      <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        Overdue
                      </span>
                    )}
                    {dueSoon && !overdue && (
                      <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        Due Soon
                      </span>
                    )}
                    <p className="line-clamp-1 text-[10px]">
                      {getRelativeTime(task.createdAt)}
                    </p>
                    {!task.completed && (
                      <div className="w-[14px] h-full flex items-center justify-center">
                        <div className="rounded-full bg-blue-400 size-1.5"></div>
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