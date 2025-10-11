'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DeleteDialog } from '@/components/ui/delete-dialog'
import { ListTodo, Trash2, Edit3, Edit2, User, List, RefreshCw, CheckCircle, ChevronLeft, ChevronRight, LogOut, Check, XCircle, Search, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isToday, isTomorrow, isYesterday, parseISO, startOfDay } from 'date-fns'
import { useAuthStore } from '@/store/auth-store'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  category?: string
  tags?: string[]
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
  isMobile?: boolean
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
  const [viewMode, setViewMode] = useState<'lists' | 'dates'>('dates') // Default to date view

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

  // Group all tasks by due date
  const getTasksByDueDate = () => {
    const allTasks: (Task & { listId: string; listTitle: string })[] = []

    // Collect all tasks from all lists with their source list info
    taskLists.forEach(list => {
      list.tasks.forEach(task => {
        if (task.dueDate && !task.completed) { // Only show uncompleted tasks with due dates
          allTasks.push({
            ...task,
            listId: list.id,
            listTitle: list.title
          })
        }
      })
    })

    // Group tasks by due date
    const groupedTasks: Record<string, (Task & { listId: string; listTitle: string })[]> = {}

    allTasks.forEach(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        const dateKey = startOfDay(dueDate).toISOString()

        if (!groupedTasks[dateKey]) {
          groupedTasks[dateKey] = []
        }
        groupedTasks[dateKey].push(task)
      }
    })

    // Sort dates and return with formatted labels
    return Object.entries(groupedTasks)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateKey, tasks]) => {
        const date = new Date(dateKey)
        let label = ''

        if (isToday(date)) {
          label = 'TODAY'
        } else if (isTomorrow(date)) {
          label = 'TOMORROW'
        } else if (isYesterday(date)) {
          label = 'YESTERDAY'
        } else {
          label = format(date, 'EEEE MMMM d').toUpperCase()
        }

        return {
          dateKey,
          date,
          label,
          tasks: tasks.sort((a, b) => {
            // Sort by priority (high, medium, low)
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2)
          })
        }
      })
  }

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
            {/* View Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'lists' ? 'dates' : 'lists')}
              className={cn(
                "p-0 hover:text-gray-100 hover:bg-gray-800/50 rounded-sm transition-colors",
                isMobile ? "h-8 w-8 text-gray-200" : "h-6 w-6 text-gray-400"
              )}
              title={viewMode === 'lists' ? 'View by due dates' : 'View by lists'}
            >
              {viewMode === 'lists' ? (
                <Calendar className={isMobile ? "h-5 w-5" : "h-3 w-3"} />
              ) : (
                <List className={isMobile ? "h-5 w-5" : "h-3 w-3"} />
              )}
            </Button>
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

      {/* Content Area - Either Lists or Dates */}
      {(!isCollapsed || isMobile) && (
      <div className={cn(
        "flex-1 overflow-y-auto min-h-0",
        isMobile ? "p-1.5 space-y-0.5" : "p-2 space-y-1"
      )}>
        {/* Date View */}
        {viewMode === 'dates' && (() => {
          const tasksByDate = getTasksByDueDate()
          return tasksByDate.length === 0 ? (
            <div className={cn(
              "text-center",
              isMobile ? "py-6" : "py-3"
            )}>
              <Clock className={cn(
                "mx-auto mb-1",
                isMobile ? "h-6 w-6 mb-2 text-gray-300" : "h-6 w-6 text-gray-400"
              )} />
              <p className={cn(
                "text-gray-300 mb-1",
                isMobile ? "text-xs" : "text-xs"
              )}>No upcoming due dates</p>
              <p className={cn(
                "text-gray-500",
                isMobile ? "text-[10px]" : "text-[10px]"
              )}>Tasks with due dates will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksByDate.map(({ dateKey, date, label, tasks }) => (
                <div key={dateKey} className="space-y-1">
                  {/* Date Header */}
                  <div className={cn(
                    "flex items-center gap-2 px-2 py-1 border-b border-gray-800/30",
                    isMobile ? "text-xs" : "text-[11px]"
                  )}>
                    <Calendar className={cn(
                      "text-blue-400",
                      isMobile ? "h-4 w-4" : "h-3 w-3"
                    )} />
                    <span className="font-semibold text-gray-200 uppercase tracking-wide">
                      {label}
                    </span>
                    <span className="text-gray-500 text-[9px]">
                      {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Tasks for this date */}
                  {tasks.map((task) => (
                    <div
                      key={`${task.listId}-${task.id}`}
                      className={cn(
                        "group cursor-pointer transition-all duration-150 rounded-sm border overflow-hidden",
                        "border-gray-800/50 bg-gray-900/30 hover:bg-gray-800/40 hover:border-gray-700/60",
                        isMobile && "mx-1 active:scale-[0.98]"
                      )}
                      onClick={() => {
                        // Find and select the task list containing this task
                        const taskList = taskLists.find(list => list.id === task.listId)
                        if (taskList) {
                          handleTaskListClick(taskList)
                          if (isMobile && onCollapse) {
                            onCollapse()
                          }
                        }
                      }}
                    >
                      <div className={cn(
                        "flex items-center justify-between",
                        isMobile ? "px-2 py-1.5" : "px-2.5 py-1.5"
                      )}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={cn(
                            "h-2 w-2 rounded-full flex-shrink-0",
                            task.priority === 'high' ? "bg-red-500" :
                            task.priority === 'medium' ? "bg-yellow-500" :
                            "bg-green-500"
                          )} />
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className={cn(
                                "font-medium text-gray-100",
                                isMobile ? "text-xs" : "text-[12px]"
                              )}>
                                {task.title}
                              </span>
                              {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="px-1 py-0 text-[8px]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <span className={cn(
                              "text-gray-500 truncate",
                              isMobile ? "text-[9px]" : "text-[9px]"
                            )}>
                              from {task.listTitle}
                            </span>
                          </div>
                        </div>
                        {onTaskDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onTaskDelete(task.listId, task.id)
                            }}
                            className={cn(
                              "p-0 hover:text-red-400 hover:bg-red-900/20 rounded-sm opacity-0 group-hover:opacity-100 transition-all",
                              isMobile ? "h-7 w-7 text-gray-300" : "h-5 w-5 text-gray-400"
                            )}
                            title="Delete task"
                          >
                            <Trash2 className={isMobile ? "h-4 w-4" : "h-2.5 w-2.5"} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        })()}

        {/* List View */}
        {viewMode === 'lists' && (
          <>
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
                {/* All Lists Button */}
                <div
                  className={cn(
                    "group cursor-pointer transition-all duration-150 rounded-sm border mb-2",
                    selectedTaskListId === null
                      ? "border-blue-500/50 bg-blue-900/20"
                      : "border-gray-800/50 bg-gray-900/30 hover:bg-gray-800/40 hover:border-gray-700/60",
                    isMobile && "mx-1 active:scale-[0.98]"
                  )}
                  onClick={() => {
                    onTaskListSelect?.(null)
                    if (isMobile && onCollapse) {
                      onCollapse()
                    }
                  }}
                >
                  <div className={cn(
                    "flex items-center justify-between",
                    isMobile ? "px-2 py-2" : "px-2.5 py-2"
                  )}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <List className={cn(
                        selectedTaskListId === null ? "text-blue-400" : "text-gray-400",
                        isMobile ? "h-4 w-4" : "h-3.5 w-3.5"
                      )} />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={cn(
                          "font-semibold truncate",
                          selectedTaskListId === null ? "text-blue-300" : "text-gray-200",
                          isMobile ? "text-sm" : "text-xs"
                        )}>
                          All Lists
                        </span>
                        <span className={cn(
                          "text-gray-500",
                          isMobile ? "text-[10px]" : "text-[9px]"
                        )}>
                          {taskLists.length} list{taskLists.length !== 1 ? 's' : ''} • {taskLists.reduce((total, list) => total + list.tasks.filter(t => !t.completed).length, 0)} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {taskLists.map((taskList, index) => {
                  const completedCount = taskList.tasks.filter(task => task.completed).length
                  const totalCount = taskList.tasks.length
                  const isSelected = selectedTaskListId === taskList.id

                  // Cycle through gradient colors
                  const gradientClasses = ['card-purple', 'card-pink', 'card-blue', 'card-teal', 'card-emerald', 'card-amber', 'card-red']
                  const gradientClass = gradientClasses[index % gradientClasses.length]

                  return (
                    <div
                      key={taskList.id}
                      className={cn(
                        "group cursor-pointer transition-all duration-150 overflow-hidden shadow-md",
                        isSelected && "ring-2 ring-white/30 shadow-xl",
                        isMobile && "mx-1 active:scale-[0.98]",
                        gradientClass
                      )}
                      style={{ borderRadius: '0.5rem' }}
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
                            "flex-shrink-0 text-white/90",
                            isMobile ? "h-5 w-5" : "h-3 w-3"
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
                                className="h-5 px-1 py-0 text-[11px] bg-white/20 border-white/30 text-white placeholder:text-white/60"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSaveRename(taskList.id)
                                }}
                                className="h-4 w-4 p-0 text-white hover:text-white/80 hover:bg-white/20"
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
                                className="h-4 w-4 p-0 text-white hover:text-white/80 hover:bg-white/20"
                              >
                                <XCircle className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className={cn(
                                "font-semibold truncate text-white drop-shadow-sm flex-1",
                                isMobile ? "text-xs" : "text-[12px]"
                              )}>
                                {taskList.title}
                              </span>
                              {totalCount > 0 && (
                                <span className={cn(
                                  "text-white/70 flex-shrink-0 font-medium",
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
                                "p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-sm",
                                isMobile ? "h-7 w-7" : "h-5 w-5"
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
                                "p-0 text-white/80 hover:text-white hover:bg-red-500/30 rounded-sm",
                                isMobile ? "h-7 w-7" : "h-5 w-5"
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
                                className="flex items-center gap-1.5 flex-wrap text-[10px]"
                              >
                                <div className={cn(
                                  "h-1 w-1 rounded-full flex-shrink-0",
                                  task.completed ? "bg-green-500" : "bg-blue-500"
                                )} />
                                <span className={cn(
                                  task.completed ? "text-gray-500 line-through" : "text-gray-400"
                                )}>
                                  {task.title}
                                </span>
                                {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="px-1 py-0 text-[7px]">
                                    {tag}
                                  </Badge>
                                ))}
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
                <Image
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  width={isMobile ? 16 : 20}
                  height={isMobile ? 16 : 20}
                  unoptimized
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
