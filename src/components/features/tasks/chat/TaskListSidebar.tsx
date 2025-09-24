'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { ListTodo, Trash2, Edit3, Edit2, User, List, RefreshCw, CheckCircle, ChevronLeft, ChevronRight, LogOut, Check, XCircle, Search } from 'lucide-react'
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
  onTaskListRename?: (taskListId: string, newTitle: string) => void
  onRefresh?: () => void
  onCompletedClick?: () => void
  onCollapse?: () => void
  isCollapsed?: boolean
  isMobile?: boolean
  className?: string
}

export function TaskListSidebar({
  taskLists,
  selectedTaskListId,
  onTaskListSelect,
  onTaskListDelete,
  onTaskListRename,
  onRefresh,
  onCompletedClick,
  onCollapse,
  isCollapsed = false,
  isMobile = false,
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
    <div className={cn(
      "bg-gray-950 flex flex-col h-full overflow-hidden",
      !isMobile && "border-r border-gray-800",
      className
    )}>
      {/* Sidebar Header - Compact Modern Design */}
      <div className="border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
        <div className={cn(
          "flex items-center justify-between",
          isMobile ? "px-2.5 py-2" : "px-3 py-2"
        )}>
          <div className={cn(
            "text-blue-400 font-bold tracking-wide select-none",
            isMobile ? "text-sm" : "text-[13px]"
          )}
          style={{
            fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", Consolas, "Ubuntu Mono", monospace'
          }}>
            NextTaskPro
          </div>
          <div className="flex items-center gap-1">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-200 hover:text-white hover:bg-gray-800/50 rounded-sm transition-colors"
                title="Search lists"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            {onCompletedClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCompletedClick}
                className={cn(
                  "p-0 hover:text-gray-100 hover:bg-gray-800/50 rounded-sm transition-colors",
                  isMobile ? "h-8 w-8 text-gray-200" : "h-6 w-6 text-gray-400"
                )}
                title="View completed tasks"
              >
                <CheckCircle className={isMobile ? "h-5 w-5" : "h-3 w-3"} />
              </Button>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className={cn(
                  "p-0 hover:text-gray-100 hover:bg-gray-800/50 rounded-sm transition-colors",
                  isMobile ? "h-8 w-8 text-gray-200" : "h-6 w-6 text-gray-400"
                )}
                title="Refresh lists"
              >
                <RefreshCw className={isMobile ? "h-5 w-5" : "h-3 w-3"} />
              </Button>
            )}
          </div>
        </div>

        {/* Minimal Stats Bar - Hide on mobile for space */}
        {!isMobile && (
        <div className="flex items-center gap-3 px-3 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            <span className="text-[11px] text-gray-300">
              <span className="font-medium text-green-400">{completedTasks}</span> Done
            </span>
          </div>
        </div>
        )}
      </div>

      {/* Task Lists */}
      {(!isCollapsed || isMobile) && (
      <div className={cn(
        "flex-1 overflow-y-auto min-h-0",
        isMobile ? "p-1.5 space-y-0.5" : "p-2 space-y-1"
      )}>
        {taskLists.length === 0 ? (
          <div className={cn(
            "text-center",
            isMobile ? "py-6" : "py-3"
          )}>
            <ListTodo className={cn(
              "mx-auto mb-1",
              isMobile ? "h-8 w-8 mb-2 text-gray-300" : "h-8 w-8 text-gray-400"
            )} />
            <p className={cn(
              "text-gray-300 mb-1",
              isMobile ? "text-xs" : "text-xs"
            )}>No lists yet</p>
            <p className={cn(
              "text-gray-500",
              isMobile ? "text-[10px]" : "text-[10px]"
            )}>Use the chat to create your first list</p>
          </div>
        ) : (
          <>
            {taskLists.map((taskList) => {
              const completedCount = taskList.tasks.filter(task => task.completed).length
              const totalCount = taskList.tasks.length
              const isSelected = selectedTaskListId === taskList.id

              return (
                <div
                  key={taskList.id}
                  className={cn(
                    "group cursor-pointer transition-all duration-150 rounded-md border overflow-hidden",
                    isSelected
                      ? "border-blue-500/60 bg-blue-950/30 shadow-sm shadow-blue-500/20"
                      : "border-gray-800/50 bg-gray-900/30 hover:bg-gray-800/40 hover:border-gray-700/60",
                    isMobile && "mx-1 active:scale-[0.98]"
                  )}
                  onClick={() => {
                    handleTaskListClick(taskList)
                    // Close mobile drawer when selecting a task list
                    if (isMobile && onCollapse) {
                      onCollapse()
                    }
                  }}
                >
                  <div className={cn(
                    "flex items-center justify-between",
                    isMobile ? "px-2 py-1.5" : "px-2.5 py-1.5"
                  )}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <List className={cn(
                        "flex-shrink-0",
                        isMobile ? "h-5 w-5 text-gray-200" : "h-3 w-3 text-gray-400"
                      )} />
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
                            className="h-5 px-1 py-0 text-[11px] bg-gray-800/80 border-gray-700 text-gray-100"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveRename(taskList.id)
                            }}
                            className="h-4 w-4 p-0 text-green-400 hover:text-green-300"
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
                            className="h-4 w-4 p-0 text-red-400 hover:text-red-300"
                          >
                            <XCircle className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className={cn(
                            "font-medium truncate text-gray-100 flex-1",
                            isMobile ? "text-xs" : "text-[12px]"
                          )}>
                            {taskList.title}
                          </span>
                          {totalCount > 0 && (
                            <span className={cn(
                              "text-gray-500 flex-shrink-0",
                              isMobile ? "text-[10px]" : "text-[10px]"
                            )}>
                              {completedCount}/{totalCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {editingListId !== taskList.id && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleStartRename(e, taskList)}
                          className={cn(
                            "p-0 hover:text-gray-200 hover:bg-gray-800/50 rounded-sm",
                            isMobile ? "h-7 w-7 text-gray-300" : "h-5 w-5 text-gray-400"
                          )}
                          title="Rename list"
                        >
                          <Edit2 className={isMobile ? "h-4 w-4" : "h-2.5 w-2.5"} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteTaskList(e, taskList)}
                          className={cn(
                            "p-0 hover:text-red-400 hover:bg-red-900/20 rounded-sm",
                            isMobile ? "h-7 w-7 text-gray-300" : "h-5 w-5 text-gray-400"
                          )}
                          title="Delete list"
                        >
                          <Trash2 className={isMobile ? "h-4 w-4" : "h-2.5 w-2.5"} />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Task preview and stats - More compact on mobile */}
                  {taskList.tasks.length > 0 && (
                    <div className={cn(
                      isMobile ? "px-2 pb-1" : "px-2.5 pb-1.5"
                    )}>
                      <div className="space-y-0.5">
                        {taskList.tasks.slice(0, isMobile ? 3 : 5).map((task) => (
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
                        {taskList.tasks.length > (isMobile ? 3 : 5) && (
                          <div className="text-[9px] text-gray-500 pl-2">
                            +{taskList.tasks.length - (isMobile ? 3 : 5)} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Task count bar - Hide on mobile for space */}
                  {!isMobile && taskList.tasks.length > 0 && completedCount > 0 && (
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
      )}

      {/* Mobile Stats Section */}
      {isMobile && (
        <div className="border-t border-gray-800/50 flex-shrink-0">
          {/* Quick Stats */}
          <div className="px-3 py-2.5 flex items-center justify-between text-[10px] text-gray-500">
            <div className="flex items-center gap-3">
              <span>{taskLists.length} lists</span>
              <span>•</span>
              <span>{taskLists.reduce((sum, list) => sum + list.tasks.length, 0)} tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500/70"></div>
              <span>{completedTasks} done</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse/Expand Button - Hide on mobile */}
      {!isMobile && (
      <div className="border-t border-gray-800/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCollapse}
          className="w-full h-5 flex items-center justify-center text-[11px] font-mono text-gray-500 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? ">>" : "<<"}
        </Button>
      </div>
      )}

      {/* Sidebar Footer - Compact */}
      {(!isCollapsed || isMobile) && (
      <div className={cn(
        "border-t border-gray-800/50 bg-gray-900/50 flex-shrink-0",
        isMobile ? "px-2.5 py-2 safe-area-padding-bottom" : "px-3 py-2"
      )}>
        {user && (
          <div className="flex items-center gap-2">
            {/* Profile Picture or Avatar */}
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className={cn(
                    "rounded-sm",
                    isMobile ? "w-4 h-4" : "w-5 h-5"
                  )}
                />
              ) : (
                <div className={cn(
                  "rounded-sm bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium",
                  isMobile ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[9px]"
                )}>
                  {getUserInitials(user.displayName || '', user.email || '')}
                </div>
              )}
            </div>

            {/* User Info - More compact on mobile */}
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-gray-200 truncate",
                isMobile ? "text-[9px]" : "text-[10px]"
              )}>
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </div>
              {!isMobile && (
              <div className="text-[9px] text-gray-500 truncate">
                {user.email}
              </div>
              )}
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
              className={cn(
                "p-0 hover:text-red-400 hover:bg-red-900/20 rounded-sm transition-colors",
                isMobile ? "h-7 w-7 text-gray-200" : "h-6 w-6 text-gray-400"
              )}
              title="Logout"
            >
              <LogOut className={isMobile ? "h-4 w-4" : "h-3 w-3"} />
            </Button>
          </div>
        )}
      </div>
      )}

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
