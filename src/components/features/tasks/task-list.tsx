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
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  onTaskEdit: (task: Task) => void
}

export function TaskList({ tasks, onTaskUpdate, onTaskDelete, onTaskEdit }: TaskListProps) {
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
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date)
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false
    return new Date(task.dueDate) < new Date()
  }

  const isDueSoon = (task: Task) => {
    if (!task.dueDate || task.completed) return false
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return new Date(task.dueDate) <= tomorrow
  }

  if (tasks.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isExpanded = expandedTasks.has(task.id)
        const overdue = isOverdue(task)
        const dueSoon = isDueSoon(task)

        return (
          <Card
            key={task.id}
            className={cn(
              "glass border-glass hover:bg-white/5 transition-all duration-200",
              task.completed && "opacity-60",
              overdue && "border-red-500/30",
              dueSoon && !overdue && "border-orange-500/30"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Completion Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6 rounded-full hover:bg-white/10"
                  onClick={() => toggleComplete(task)}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  )}
                </Button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Priority */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={cn(
                        "font-medium cursor-pointer",
                        task.completed && "line-through text-muted-foreground"
                      )}
                      onClick={() => toggleExpanded(task.id)}
                    >
                      {task.title}
                    </h3>
                    
                    {/* Priority Badge */}
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                      getPriorityColor(task.priority)
                    )}>
                      {getPriorityIcon(task.priority)}
                      {task.priority}
                    </div>

                    {/* Overdue/Due Soon Indicators */}
                    {overdue && (
                      <span className="text-xs text-red-500 font-medium">Overdue</span>
                    )}
                    {dueSoon && !overdue && (
                      <span className="text-xs text-orange-500 font-medium">Due Soon</span>
                    )}
                  </div>

                  {/* Description (when expanded) */}
                  {isExpanded && task.description && (
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className={cn(
                        overdue && "text-red-500",
                        dueSoon && !overdue && "text-orange-500"
                      )}>
                        {formatDate(new Date(task.dueDate))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8 hover:bg-white/10"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleComplete(task)}
                      className={task.completed ? "text-orange-600" : "text-green-600"}
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
                      onClick={() => onTaskDelete(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}