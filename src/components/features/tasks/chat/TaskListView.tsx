'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Circle, Trash2, Calendar, Flag, X, ChevronDown, ChevronUp, Edit2, Check, XCircle, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useIsMobile } from '@/hooks/use-media-query'
import { sortTasksByDueDate } from '@/lib/utils/task-sorting'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date | null
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

interface TaskListViewProps {
  taskList: TaskList
  onClose: () => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskListDelete?: (taskListId: string) => void
  onTaskListRename?: (taskListId: string, newTitle: string) => void
  collapsed?: boolean
}

export function TaskListView({
  taskList,
  onClose,
  onTaskUpdate,
  onTaskDelete,
  onTaskListDelete,
  onTaskListRename,
  collapsed = false
}: TaskListViewProps) {
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(taskList.title)
  const [editingDueDateTaskId, setEditingDueDateTaskId] = useState<string | null>(null)
  const [tempDueDate, setTempDueDate] = useState<string>('')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'text-secondary'
    }
  }

  const formatDueDate = (date: Date) => {
    // Normalize dates to midnight for accurate day comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueDate = new Date(date)
    dueDate.setHours(0, 0, 0, 0)

    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    console.log('TaskListView: Toggling task', taskId, 'to completed:', completed)
    const updates: any = { completed }
    if (completed) {
      updates.completedAt = new Date()
    } else {
      updates.completedAt = null
    }
    console.log('TaskListView: Sending updates:', updates)
    onTaskUpdate?.(taskId, updates)
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

  const handleRenameStart = () => {
    setEditedTitle(taskList.title)
    setIsEditingTitle(true)
  }

  const handleRenameCancel = () => {
    setEditedTitle(taskList.title)
    setIsEditingTitle(false)
  }

  const handleRenameSave = () => {
    if (editedTitle.trim() && editedTitle !== taskList.title) {
      onTaskListRename?.(taskList.id, editedTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const handleStartEditDueDate = (taskId: string, currentDueDate?: Date) => {
    setEditingDueDateTaskId(taskId)
    if (currentDueDate) {
      const date = new Date(currentDueDate)
      const formattedDate = date.toISOString().split('T')[0]
      setTempDueDate(formattedDate)
    } else {
      setTempDueDate('')
    }
  }

  const handleSaveDueDate = (taskId: string) => {
    const updates: any = {}
    if (tempDueDate) {
      const newDueDate = new Date(tempDueDate)
      console.log('Setting due date:', tempDueDate, '->', newDueDate)
      updates.dueDate = newDueDate
    } else {
      updates.dueDate = null
    }
    onTaskUpdate?.(taskId, updates)
    setEditingDueDateTaskId(null)
    setTempDueDate('')
  }

  const handleCancelEditDueDate = () => {
    setEditingDueDateTaskId(null)
    setTempDueDate('')
  }

  const completedTasks = taskList.tasks.filter(task => task.completed)
  const pendingTasks = sortTasksByDueDate(taskList.tasks.filter(task => !task.completed))

  return (
    <div className="card-elevated margin-component">
      {/* Header */}
      <div className="padding-card border-b border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-secondary hover:text-primary transition-default"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSave()
                    if (e.key === 'Escape') handleRenameCancel()
                  }}
                  className="h-6 px-2 py-0 text-task-title input-default"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRenameSave}
                  className="h-6 w-6 p-0 priority-low hover:opacity-80"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRenameCancel}
                  className="h-6 w-6 p-0 priority-high hover:opacity-80"
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-task-title text-primary">{taskList.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRenameStart}
                  className="h-5 w-5 p-0 text-secondary hover:text-primary hover-surface"
                  title="Rename list"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-nav-secondary text-secondary">
                {taskList.tasks.length} tasks
              </span>
              {pendingTasks.length > 0 && (
                <span className="text-nav-secondary text-accent">
                  {pendingTasks.length} pending
                </span>
              )}
              {completedTasks.length > 0 && (
                <span className="text-nav-secondary priority-low">
                  {completedTasks.length} done
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTaskListDelete}
            className="h-7 px-2 text-nav-secondary priority-high hover:opacity-80 hover-surface"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-secondary hover:text-primary hover-surface"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="padding-card">
          {taskList.tasks.length === 0 ? (
            <div className="text-center py-8">
              <Circle className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <p className="text-body-sm text-primary">No tasks in this list</p>
              <p className="text-caption text-secondary mt-1">Add tasks using the chat below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h4 className="text-nav-label text-secondary mb-2">To Do</h4>
                  <div className="space-y-1">
                    {pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="task-item gap-component group"
                      >
                        <button
                          onClick={() => handleTaskToggle(task.id, true)}
                          className="flex-shrink-0 hover:scale-110 transition-transform"
                        >
                          <Circle className="h-3.5 w-3.5 text-secondary hover:text-accent" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={cn("text-primary", isMobile ? "text-body-sm" : "text-task-title")}>{task.title}</p>
                          {task.description && (
                            <p className={cn("text-secondary truncate", isMobile ? "text-caption" : "text-task-description")}>{task.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {task.priority && task.priority !== 'medium' && (
                            <Flag className={cn("h-3 w-3", getPriorityColor(task.priority))} />
                          )}
                          {editingDueDateTaskId === task.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="date"
                                value={tempDueDate}
                                onChange={(e) => setTempDueDate(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveDueDate(task.id)
                                  if (e.key === 'Escape') handleCancelEditDueDate()
                                }}
                                className="h-6 px-2 text-xs bg-gray-800 border border-gray-700 rounded text-gray-100 focus:outline-none focus:border-blue-500"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveDueDate(task.id)}
                                className="h-5 w-5 p-0 text-green-500 hover:text-green-400"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEditDueDate}
                                className="h-5 w-5 p-0 text-red-500 hover:text-red-400"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEditDueDate(task.id, task.dueDate)}
                              className={cn(
                                "h-6 px-2 flex items-center gap-1 text-xs",
                                task.dueDate ? "text-secondary hover:text-primary" : "opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300"
                              )}
                            >
                              <CalendarDays className="h-3 w-3" />
                              {task.dueDate ? formatDueDate(task.dueDate) : "Set date"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTaskDelete(task.id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-secondary hover:priority-high hover-surface transition-default"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h4 className="text-nav-label text-secondary mb-2">Completed</h4>
                  <div className="space-y-1">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="task-item task-completed gap-component group"
                      >
                        <button
                          onClick={() => handleTaskToggle(task.id, false)}
                          className="flex-shrink-0 hover:scale-110 transition-transform"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 priority-low" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={cn("text-secondary line-through", isMobile ? "text-body-sm" : "text-task-title")}>{task.title}</p>
                          {task.description && (
                            <p className={cn("text-secondary truncate line-through", isMobile ? "text-caption" : "text-task-description")}>{task.description}</p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTaskDelete(task.id)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-secondary hover:priority-high hover-surface transition-default"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}