'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Calendar, Flag, Edit2, Trash2, X, MoreVertical, Clock, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
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

interface TaskDetailPanelProps {
  task: Task | null
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  onTaskEdit: (task: Task) => void
  onClose: () => void
}

export function TaskDetailPanel({ 
  task, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskEdit, 
  onClose 
}: TaskDetailPanelProps) {
  if (!task) return null

  const toggleComplete = () => {
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

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'No date'
    
    const dateObj = date instanceof Date ? date : new Date(date)
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    if (isNaN(dueDate.getTime())) return false
    return dueDate < new Date()
  }

  const isDueSoon = () => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    if (isNaN(dueDate.getTime())) return false
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return dueDate <= tomorrow
  }

  const overdue = isOverdue()
  const dueSoon = isDueSoon()

  const getTaskAge = () => {
    const now = new Date()
    const created = new Date(task.createdAt)
    const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Created today'
    if (diffInDays === 1) return 'Created yesterday'
    return `Created ${diffInDays} days ago`
  }

  const getTimeUntilDue = () => {
    if (!task.dueDate) return null
    const now = new Date()
    const due = new Date(task.dueDate)
    const diffInHours = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 0) return 'Overdue'
    if (diffInHours < 24) return `Due in ${diffInHours} hours`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Due in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold">Task Details</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Task Title and Quick Actions */}
        <div className="glass rounded-2xl p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 rounded-full hover:bg-muted transition-all duration-200 mt-1"
              onClick={toggleComplete}
            >
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </Button>
            
            <div className="flex-1 space-y-2">
              <h1 className={cn(
                "font-semibold leading-tight task-title",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h1>
              
              {/* Priority Badge */}
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
                getPriorityColor(task.priority)
              )}>
                <Flag className="h-2 w-2" />
                {task.priority}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                  <Edit2 className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleComplete}>
                  {task.completed ? (
                    <>
                      <Circle className="h-3 w-3 mr-2" />
                      Mark Pending
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-2" />
                      Complete
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onTaskDelete(task.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-3 w-3 text-blue-500" />
            Quick Insights
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Age
              </span>
              <span className="font-medium">{getTaskAge()}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Deadline
                </span>
                <span className={cn(
                  "font-medium",
                  overdue && "text-red-600",
                  dueSoon && !overdue && "text-orange-600"
                )}>
                  {getTimeUntilDue()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <span className={cn(
                "font-medium",
                task.completed ? "text-green-600" : "text-orange-600"
              )}>
                {task.completed ? "Completed" : "In Progress"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="glass rounded-2xl p-4">
            <h3 className="text-xs font-semibold mb-2">Description</h3>
            <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap task-description">
              {task.description}
            </p>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="glass rounded-2xl p-4">
            <h3 className="text-xs font-semibold flex items-center gap-2 mb-2">
              <Calendar className="h-3 w-3" />
              Due Date
            </h3>
            <p className={cn(
              "text-xs font-medium",
              overdue && "text-red-600",
              dueSoon && !overdue && "text-orange-600"
            )}>
              {formatDate(new Date(task.dueDate))}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-xs font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTaskEdit(task)}
              className="w-full h-7 text-xs justify-start"
            >
              <Edit2 className="h-3 w-3 mr-2" />
              Edit Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleComplete}
              className="w-full h-7 text-xs justify-start"
            >
              {task.completed ? (
                <>
                  <Circle className="h-3 w-3 mr-2" />
                  Mark as Pending
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-xs font-semibold mb-3">Task Details</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDateTime(task.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Updated</span>
              <span>{formatDateTime(task.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}