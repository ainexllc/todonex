'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { ListTodo, Trash2, Edit3, Edit2, User, List, RefreshCw, CheckCircle, ChevronLeft, ChevronRight, LogOut, Check, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/auth-store'
import { sortTasksByDueDate, getDueDateColorClass, formatCompactDueDate } from '@/lib/utils/task-sorting'

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
  onTaskListRename?: (taskListId: string, newTitle: string) => void
  onTaskDelete?: (taskListId: string, taskId: string) => void
  onRefresh?: () => void
  onCompletedClick?: () => void
  onCollapse?: () => void
  isCollapsed?: boolean
  className?: string
}

export function TaskListSidebar({
  taskLists,
  selectedTaskListId,
  onTaskListSelect,
  onTaskListDelete,
  onTaskListRename,
  onTaskDelete,
  onRefresh,
  onCompletedClick,
  onCollapse,
  isCollapsed = false,
  className
}: TaskListSidebarProps) {
  const { user } = useAuthStore()
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    taskList: TaskList | null
  }>({ isOpen: false, taskList: null })
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState('')

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

  const handleStartRename = (e: React.MouseEvent, taskList: TaskList) => {
    e.stopPropagation()
    setEditingListId(taskList.id)
    setEditedTitle(taskList.title)
  }

  const handleSaveRename = (taskListId: string) => {
    if (editedTitle.trim() && onTaskListRename) {
      onTaskListRename(taskListId, editedTitle.trim())
    }
    setEditingListId(null)
    setEditedTitle('')
  }

  const handleCancelRename = () => {
    setEditingListId(null)
    setEditedTitle('')
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
    <div className={cn("bg-surface border-r border-default flex flex-col", className)}>
      {/* Sidebar Header - Compact Modern Design */}
      <div className="border-b border-subtle bg-elevated backdrop-blur-sm">
        <div className="padding-sidebar flex items-center justify-between">
          {/* ASCII Logo */}
          <pre className="text-primary text-xs leading-none font-mono select-none" style={{ fontSize: '10px' }}>
{`╔═╗┬╔╦╗┌─┐┌─┐┬┌─
╠═╣│ ║ ├─┤└─┐├┴┐
╩ ╩┴ ╩ ┴ ┴└─┘┴ ┴`}
          </pre>
          <div className="flex items-center gap-1">
            {onCompletedClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCompletedClick}
                className="h-6 w-6 p-0 text-secondary hover:text-primary hover-surface rounded-sm transition-default"
                title="View completed tasks"
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-6 w-6 p-0 text-secondary hover:text-primary hover-surface rounded-sm transition-default"
                title="Refresh lists"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Minimal Stats Bar */}
        <div className="flex items-center gap-component padding-sidebar pb-2">
          <div className="flex items-center gap-inline">
            <div className="h-1.5 w-1.5 rounded-full priority-low"></div>
            <span className="text-nav-secondary">
              <span className="font-medium priority-low">{completedTasks}</span> Done
            </span>
          </div>
        </div>
      </div>

      {/* Task Lists */}
      {!isCollapsed && (
      <div className="flex-1 overflow-y-auto padding-card space-y-1">
        {taskLists.length === 0 ? (
          <div className="text-center padding-card">
            <ListTodo className="h-8 w-8 mx-auto mb-1 text-secondary" />
            <p className="text-body-sm text-primary mb-1">No lists yet</p>
            <p className="text-caption">Use the chat to create your first list</p>
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
                    "group cursor-pointer transition-default rounded-sm border overflow-hidden",
                    isSelected
                      ? "border-accent bg-elevated shadow-sm"
                      : "border-subtle bg-elevated hover-surface hover:border-default"
                  )}
                  onClick={() => handleTaskListClick(taskList)}
                >
                  <div className="py-1.5 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-inline min-w-0 flex-1">
                      {editingListId === taskList.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <Input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={(e) => {
                              e.stopPropagation()
                              if (e.key === 'Enter') handleSaveRename(taskList.id)
                              if (e.key === 'Escape') handleCancelRename()
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-5 px-1 py-0 text-nav-secondary bg-elevated border-default text-primary"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveRename(taskList.id)
                            }}
                            className="h-4 w-4 p-0 priority-low hover:opacity-80"
                          >
                            <Check className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelRename()
                            }}
                            className="h-4 w-4 p-0 priority-high hover:opacity-80"
                          >
                            <XCircle className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-nav-label font-medium text-primary whitespace-nowrap overflow-visible">
                          {taskList.title}
                        </span>
                      )}
                    </div>
                    {editingListId !== taskList.id && (
                      <div className="flex items-center gap-inline opacity-0 group-hover:opacity-100 transition-default">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleStartRename(e, taskList)}
                          className="h-5 w-5 p-0 text-secondary hover:text-primary hover-surface rounded-sm"
                          title="Rename list"
                        >
                          <Edit2 className="h-2.5 w-2.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteTaskList(e, taskList)}
                          className="h-5 w-5 p-0 text-secondary hover:priority-high hover-surface rounded-sm"
                          title="Delete list"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Task preview and stats */}
                  {taskList.tasks.length > 0 && (
                    <div className="px-2 py-1 pb-1.5">
                      <div className="space-y-0.5">
                        {sortTasksByDueDate(taskList.tasks).slice(0, 5).map((task) => (
                          <div
                            key={task.id}
                            className="group/task flex items-center justify-between gap-1 text-caption"
                          >
                            <div className="flex items-center gap-inline flex-1 min-w-0">
                              <div className={cn(
                                "h-1 w-1 rounded-full flex-shrink-0",
                                task.completed ? "priority-low" : "text-accent"
                              )} />
                              <span className={cn(
                                "truncate flex-1",
                                task.completed ? "text-secondary line-through" : "text-muted"
                              )}>
                                {task.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {task.dueDate && !task.completed && (
                                <span className={cn(
                                  "text-[10px] flex-shrink-0",
                                  getDueDateColorClass(task.dueDate)
                                )}>
                                  {formatCompactDueDate(task.dueDate)}
                                </span>
                              )}
                              {onTaskDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onTaskDelete(taskList.id, task.id)
                                  }}
                                  className="h-3.5 w-3.5 p-0 opacity-0 group-hover/task:opacity-100 text-secondary hover:priority-high hover-surface rounded-sm transition-default"
                                  title="Delete task"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {taskList.tasks.length > 5 && (
                          <div className="text-caption text-muted pl-2.5">
                            +{taskList.tasks.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Task count bar */}
                  {taskList.tasks.length > 0 && completedCount > 0 && (
                    <div className="px-2 py-1 pb-1.5 flex items-center gap-component text-caption">
                      <span className="priority-low opacity-70">
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
      )}

      {/* Collapse/Expand Button - Ultra Compact */}
      <div className="border-t border-subtle">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="w-full h-5 flex items-center justify-center text-nav-secondary font-mono text-secondary hover:text-primary hover-surface transition-default"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? ">>" : "<<"}
        </Button>
      </div>

      {/* Sidebar Footer - Compact */}
      <div className="padding-sidebar border-t border-subtle bg-elevated">
        {user && (
          <div className="flex items-center gap-component">
            {/* Profile Picture or Avatar */}
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-sm"
                />
              ) : (
                <div className="w-5 h-5 rounded-sm bg-accent flex items-center justify-center text-accent-foreground text-caption font-medium">
                  {getUserInitials(user.displayName || '', user.email || '')}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="text-nav-label font-medium text-primary truncate">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-caption text-secondary truncate">
                {user.email}
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const { signOut } = await import('firebase/auth')
                const { auth } = await import('@/lib/firebase')
                await signOut(auth)
              }}
              className="h-6 w-6 p-0 text-secondary hover:priority-high hover-surface rounded-sm transition-default"
              title="Logout"
            >
              <LogOut className="h-3 w-3" />
            </Button>
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
