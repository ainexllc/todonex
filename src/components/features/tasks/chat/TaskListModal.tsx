'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, Circle, Edit, Trash2, Flag, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useIsMobile } from '@/hooks/use-media-query'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  category?: string
}

interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
}

interface TaskListModalProps {
  taskList: TaskList | null
  isOpen: boolean
  onClose: () => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskListDelete?: (taskListId: string) => void
}

export function TaskListModal({
  taskList,
  isOpen,
  onClose,
  onTaskUpdate,
  onTaskDelete,
  onTaskListDelete
}: TaskListModalProps) {
  const isMobile = useIsMobile()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  if (!taskList) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'
    }
  }

  const formatDueDate = (date: Date) => {
    const today = new Date()
    const dueDate = new Date(date)
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    onTaskUpdate?.(taskId, { completed })
  }

  const handleTaskDelete = (taskId: string) => {
    onTaskDelete?.(taskId)
  }

  const handleTaskListDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${taskList.title}"? This action cannot be undone.`)) {
      onTaskListDelete?.(taskList.id)
      onClose()
    }
  }

  const completedTasks = taskList.tasks.filter(task => task.completed)
  const pendingTasks = taskList.tasks.filter(task => !task.completed)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-[14px] font-semibold">{taskList.title}</DialogTitle>
            {taskList.category && (
              <Badge variant="outline" className="mt-1 text-[10px]">
                {taskList.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTaskListDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {/* Task List Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-foreground">{taskList.tasks.length}</div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-green-600">{completedTasks.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-orange-600">{pendingTasks.length}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Pending Tasks</h3>
              <div className="space-y-1">
                {pendingTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <button
                      onClick={() => handleTaskToggle(task.id, true)}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      <Circle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-foreground", isMobile ? "text-xs" : "text-sm")}>{task.title}</p>
                      {task.description && (
                        <p className={cn("text-muted-foreground truncate", isMobile ? "text-[10px]" : "text-xs")}>{task.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.priority && task.priority !== 'medium' && (
                        <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDueDate(task.dueDate)}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTaskDelete(task.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Completed Tasks</h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 opacity-75"
                  >
                    <button
                      onClick={() => handleTaskToggle(task.id, false)}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-foreground line-through", isMobile ? "text-xs" : "text-sm")}>{task.title}</p>
                      {task.description && (
                        <p className={cn("text-muted-foreground truncate line-through", isMobile ? "text-[10px]" : "text-xs")}>{task.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.priority && task.priority !== 'medium' && (
                        <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDueDate(task.dueDate)}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTaskDelete(task.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {taskList.tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <Circle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground">
                This task list is empty. Add some tasks to get started.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Created {format(taskList.createdAt, 'MMM d, yyyy')}
          </div>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
