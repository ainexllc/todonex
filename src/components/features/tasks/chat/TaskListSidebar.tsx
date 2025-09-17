'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { ListTodo, Trash2, Edit3, User, List, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/auth-store'

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

interface TaskListSidebarProps {
  taskLists: TaskList[]
  selectedTaskListId: string | null
  onTaskListSelect: (taskList: TaskList | null) => void
  onTaskListDelete: (taskListId: string) => void
  onRefresh?: () => void
  className?: string
}

export function TaskListSidebar({
  taskLists,
  selectedTaskListId,
  onTaskListSelect,
  onTaskListDelete,
  onRefresh,
  className
}: TaskListSidebarProps) {
  const { user } = useAuthStore()
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    taskList: TaskList | null
  }>({ isOpen: false, taskList: null })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'
    }
  }

  const getUserInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.charAt(0).toUpperCase()
  }

  const handleTaskListClick = (taskList: TaskList) => {
    if (selectedTaskListId === taskList.id) {
      // If clicking the same list, deselect it
      onTaskListSelect(null)
    } else {
      // Select the clicked list
      onTaskListSelect(taskList)
    }
  }

  const handleDeleteTaskList = (e: React.MouseEvent, taskList: TaskList) => {
    e.stopPropagation()
    setDeleteDialog({ isOpen: true, taskList })
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.taskList) {
      await onTaskListDelete(deleteDialog.taskList.id)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, taskList: null })
  }

  const completedTasks = taskLists.reduce((total, list) =>
    total + list.tasks.filter(task => task.completed).length, 0
  )

  return (
    <div className={cn("w-80 bg-gray-950 border-r border-gray-800 flex flex-col", className)}>
      {/* Sidebar Header - Compact Modern Design */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="px-3 py-2 flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-gray-100 tracking-tight">My Lists</h2>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-200 hover:bg-gray-800/50 rounded-sm transition-colors"
              title="Refresh lists"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Minimal Stats Bar */}
        <div className="flex items-center gap-3 px-3 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            <span className="text-[11px] text-gray-300">
              <span className="font-medium text-green-400">{completedTasks}</span> Done
            </span>
          </div>
        </div>
      </div>

      {/* Task Lists */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {taskLists.length === 0 ? (
          <div className="text-center py-3">
            <ListTodo className="h-8 w-8 mx-auto mb-1 text-gray-500" />
            <p className="text-xs text-gray-300 mb-1">No lists yet</p>
            <p className="text-[10px] text-gray-500">Use the chat to create your first list</p>
          </div>
        ) : (
          <>
            {taskLists.map((taskList) => {
              const completedCount = taskList.tasks.filter(task => task.completed).length
              const isSelected = selectedTaskListId === taskList.id
              
              return (
                <div
                  key={taskList.id}
                  className={cn(
                    "group cursor-pointer transition-all duration-150 rounded-sm border overflow-hidden",
                    isSelected
                      ? "border-blue-600/50 bg-gray-900/80 shadow-sm shadow-blue-600/10"
                      : "border-gray-800/50 bg-gray-900/40 hover:bg-gray-900/60 hover:border-gray-700/50"
                  )}
                  onClick={() => handleTaskListClick(taskList)}
                >
                  <div className="px-2.5 py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <List className="h-3 w-3 text-gray-500 flex-shrink-0" />
                      <span className="text-[12px] font-medium truncate text-gray-100">
                        {taskList.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteTaskList(e, taskList)}
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-sm transition-all"
                      title="Delete list"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>

                  {/* Task preview and stats */}
                  {taskList.tasks.length > 0 && (
                    <div className="px-2.5 pb-1.5">
                      <div className="space-y-0.5">
                        {taskList.tasks.slice(0, 5).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-1.5 text-[10px]"
                          >
                            <div className={cn(
                              "h-1 w-1 rounded-full flex-shrink-0",
                              task.completed ? "bg-green-500" : "bg-blue-500"
                            )} />
                            <span className={cn(
                              "truncate",
                              task.completed ? "text-gray-500 line-through" : "text-gray-400"
                            )}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                        {taskList.tasks.length > 5 && (
                          <div className="text-[9px] text-gray-500 pl-2.5">
                            +{taskList.tasks.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Task count bar */}
                  {taskList.tasks.length > 0 && completedCount > 0 && (
                    <div className="px-2.5 pb-1.5 flex items-center gap-2 text-[9px]">
                      <span className="text-green-500/70">
                        {completedCount} done
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Sidebar Footer - Compact */}
      <div className="px-3 py-2 border-t border-gray-800/50 bg-gray-900/50">
        {user && (
          <div className="flex items-center gap-2">
            {/* Profile Picture or Avatar */}
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-sm"
                />
              ) : (
                <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-[9px] font-medium">
                  {getUserInitials(user.displayName || '', user.email || '')}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-gray-200 truncate">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-[9px] text-gray-500 truncate">
                {user.email}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Task List"
        description="Are you sure you want to delete this task list? All tasks within this list will be permanently removed. This action cannot be undone."
        itemName={deleteDialog.taskList?.title}
      />
    </div>
  )
}
