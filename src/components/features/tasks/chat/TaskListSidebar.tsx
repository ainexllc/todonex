'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { ListTodo, Trash2, Edit3, User, List } from 'lucide-react'
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
  className?: string
}

export function TaskListSidebar({
  taskLists,
  selectedTaskListId,
  onTaskListSelect,
  onTaskListDelete,
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

  const pendingTasks = taskLists.reduce((total, list) => 
    total + list.tasks.filter(task => !task.completed).length, 0
  )
  const completedTasks = taskLists.reduce((total, list) => 
    total + list.tasks.filter(task => task.completed).length, 0
  )

  return (
    <div className={cn("w-80 bg-gray-950 border-r border-gray-800 flex flex-col", className)}>
      {/* Sidebar Header */}
      <div className="p-3 border-b border-gray-800">
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-white">My Lists</h2>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/80 rounded-lg p-2 text-center">
            <div className="font-semibold text-white">{pendingTasks}</div>
            <div className="text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800/80 rounded-lg p-2 text-center">
            <div className="font-semibold text-green-400">{completedTasks}</div>
            <div className="text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      {/* Task Lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {taskLists.length === 0 ? (
          <div className="text-center py-6">
            <ListTodo className="h-10 w-10 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-300 mb-2">No lists yet</p>
            <p className="text-xs text-gray-500">Use the chat to create your first list</p>
          </div>
        ) : (
          <>
            {taskLists.map((taskList) => {
              const pendingCount = taskList.tasks.filter(task => !task.completed).length
              const completedCount = taskList.tasks.filter(task => task.completed).length
              const isSelected = selectedTaskListId === taskList.id
              
              return (
                <Card
                  key={taskList.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-lg bg-gray-900 border-gray-800 overflow-hidden",
                    isSelected
                      ? "ring-2 ring-blue-500 bg-gray-800"
                      : "hover:bg-gray-800/70"
                  )}
                  onClick={() => handleTaskListClick(taskList)}
                >
                  <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <List className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <CardTitle className="text-[10px] font-semibold truncate text-white">
                        {taskList.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteTaskList(e, taskList)}
                      className="h-5 w-5 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-opacity"
                      title="Delete task list"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <CardContent className="p-3">
                    <div className="space-y-1.5">
                      {/* Recent tasks preview */}
                      {taskList.tasks.length > 0 && (
                        <div className="space-y-1">
                          {taskList.tasks.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-2 text-xs pb-1"
                            >
                              <div className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                task.completed ? "bg-green-400" : "bg-orange-400"
                              )} />
                              <span className={cn(
                                "truncate text-gray-300",
                                task.completed && "line-through text-gray-500"
                              )}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                          {taskList.tasks.length > 2 && (
                            <div className="text-xs text-gray-500 pl-3.5 pb-1">
                              +{taskList.tasks.length - 2} more tasks
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-800">
        {user && (
          <div className="flex items-center space-x-3 mb-2">
            {/* Profile Picture or Avatar */}
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                  {getUserInitials(user.displayName || '', user.email || '')}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user.email}
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          Create lists by describing what you want to accomplish
        </div>
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
