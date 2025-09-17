'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Trash2, Calendar, Flag, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

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
  collapsed?: boolean
}

export function TaskListView({
  taskList,
  onClose,
  onTaskUpdate,
  onTaskDelete,
  onTaskListDelete,
  collapsed = false
}: TaskListViewProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
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

  const completedTasks = taskList.tasks.filter(task => task.completed)
  const pendingTasks = taskList.tasks.filter(task => !task.completed)

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-sm mb-4">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <div>
            <h3 className="text-[14px] font-medium text-gray-100">{taskList.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-gray-500">
                {taskList.tasks.length} tasks
              </span>
              {pendingTasks.length > 0 && (
                <span className="text-[10px] text-blue-400">
                  {pendingTasks.length} pending
                </span>
              )}
              {completedTasks.length > 0 && (
                <span className="text-[10px] text-green-400">
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
            className="h-7 px-2 text-[11px] text-red-500 hover:text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          {taskList.tasks.length === 0 ? (
            <div className="text-center py-8">
              <Circle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-[12px] text-gray-400">No tasks in this list</p>
              <p className="text-[10px] text-gray-500 mt-1">Add tasks using the chat below</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-medium text-gray-400 mb-2">To Do</h4>
                  <div className="space-y-1">
                    {pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-sm bg-gray-900/40 hover:bg-gray-900/60 transition-colors group"
                      >
                        <button
                          onClick={() => handleTaskToggle(task.id, true)}
                          className="flex-shrink-0 hover:scale-110 transition-transform"
                        >
                          <Circle className="h-3.5 w-3.5 text-gray-400 hover:text-blue-400" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-gray-200">{task.title}</p>
                          {task.description && (
                            <p className="text-[10px] text-gray-500 truncate">{task.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {task.priority && task.priority !== 'medium' && (
                            <Flag className={cn("h-3 w-3", getPriorityColor(task.priority))} />
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {formatDueDate(task.dueDate)}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTaskDelete(task.id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all"
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
                  <h4 className="text-[11px] font-medium text-gray-400 mb-2">Completed</h4>
                  <div className="space-y-1">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-sm bg-gray-900/20 opacity-60 hover:opacity-80 transition-opacity group"
                      >
                        <button
                          onClick={() => handleTaskToggle(task.id, false)}
                          className="flex-shrink-0 hover:scale-110 transition-transform"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-gray-400 line-through">{task.title}</p>
                          {task.description && (
                            <p className="text-[10px] text-gray-600 truncate line-through">{task.description}</p>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTaskDelete(task.id)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all"
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