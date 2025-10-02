'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuthRedirect } from '@/hooks/use-auth-redirect'
import { useTaskChat } from '@/hooks/useTaskChat'
import { useIsMobile } from '@/hooks/use-media-query'
import { Sidebar } from '@/components/features/tasks/Sidebar'
import { BoardView } from '@/components/features/tasks/views/BoardView'
import { ListView } from '@/components/features/tasks/views/ListView'
import { FloatingAIButton } from '@/components/features/tasks/FloatingAIButton'
import { AIAssistantModal } from '@/components/features/tasks/AIAssistantModal'
import { cn } from '@/lib/utils'
import type { Task, TaskList, ViewMode, TaskStatus } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, User, LogOut, Filter, Settings2 } from 'lucide-react'
import { ListSettingsDialog } from '@/components/features/tasks/ListSettingsDialog'
import { getListColor } from '@/lib/utils/list-colors'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function TasksPage() {
  // Auth redirect hook
  useAuthRedirect()

  const router = useRouter()
  const isMobile = useIsMobile()

  // Local UI state
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeListId, setActiveListId] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('masonry')
  const [searchQuery, setSearchQuery] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  // Task management from hook
  const {
    messages,
    sendMessage,
    loading,
    error,
    taskLists,
    updateTaskList,
    deleteTaskList,
    createTaskList
  } = useTaskChat()

  // Set initial active list when taskLists load
  useEffect(() => {
    if (taskLists.length > 0 && !activeListId) {
      setActiveListId(taskLists[0].id)
    }
  }, [taskLists, activeListId])

  // Load view mode preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('taskViewMode')
    if (savedViewMode && ['masonry', 'timeline'].includes(savedViewMode)) {
      setViewMode(savedViewMode as ViewMode)
    }
  }, [])

  // Save view mode preference to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('taskViewMode', mode)
  }

  const handleDeleteTaskList = async (taskListId: string) => {
    await deleteTaskList(taskListId)
  }

  const handleTaskUpdate = async (taskId: string, listId: string, updates: any) => {
    const taskList = taskLists.find(list => list.id === listId)
    if (!taskList) return

    const updatedTasks = taskList.tasks.map((task: any) =>
      task.id === taskId ? { ...task, ...updates } : task
    )

    // Prepare tasks for Firebase
    const tasksForFirebase = updatedTasks.map((task: any) => {
      const firebaseTask: any = {
        id: task.id,
        title: task.title,
        completed: task.completed || false,
        priority: task.priority || 'medium',
        completedAt: null
      }

      if (task.completedAt) {
        const completedDate = new Date(task.completedAt)
        if (!isNaN(completedDate.getTime())) {
          firebaseTask.completedAt = completedDate.toISOString()
        }
      }

      if (task.description) firebaseTask.description = task.description
      if (task.category) firebaseTask.category = task.category
      if (task.categories && Array.isArray(task.categories)) firebaseTask.categories = task.categories
      if (task.tags && Array.isArray(task.tags)) firebaseTask.tags = task.tags
      if (task.status) firebaseTask.status = task.status

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        if (!isNaN(dueDate.getTime())) {
          firebaseTask.dueDate = dueDate.toISOString()
        }
      }

      return firebaseTask
    })

    await updateTaskList(listId, { tasks: tasksForFirebase })
  }

  const handleTaskDelete = async (taskId: string, listId: string) => {
    const taskList = taskLists.find(list => list.id === listId)
    if (!taskList) return

    const updatedTasks = taskList.tasks.filter((task: any) => task.id !== taskId)

    const tasksForFirebase = updatedTasks.map((task: any) => {
      const firebaseTask: any = {
        id: task.id,
        title: task.title,
        completed: task.completed || false,
        priority: task.priority || 'medium',
        completedAt: null
      }

      if (task.completedAt) {
        const completedDate = new Date(task.completedAt)
        if (!isNaN(completedDate.getTime())) {
          firebaseTask.completedAt = completedDate.toISOString()
        }
      }

      if (task.description) firebaseTask.description = task.description
      if (task.category) firebaseTask.category = task.category
      if (task.categories && Array.isArray(task.categories)) firebaseTask.categories = task.categories
      if (task.tags && Array.isArray(task.tags)) firebaseTask.tags = task.tags
      if (task.status) firebaseTask.status = task.status

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        if (!isNaN(dueDate.getTime())) {
          firebaseTask.dueDate = dueDate.toISOString()
        }
      }

      return firebaseTask
    })

    await updateTaskList(listId, { tasks: tasksForFirebase })
  }

  const handleTaskToggle = async (taskId: string, listId: string, completed: boolean) => {
    const updates: any = { completed }
    if (completed) {
      updates.completedAt = new Date()
    } else {
      updates.completedAt = null
    }
    await handleTaskUpdate(taskId, listId, updates)
  }

  const handleTaskListReorder = async (listId: string, direction: 'up' | 'down') => {
    const currentIndex = taskLists.findIndex(list => list.id === listId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    // Check bounds
    if (newIndex < 0 || newIndex >= taskLists.length) return

    // Swap the two lists' order values
    const currentList = taskLists[currentIndex]
    const targetList = taskLists[newIndex]

    // Get or create order values (use index as default)
    const currentOrder = currentList.order ?? currentIndex
    const targetOrder = targetList.order ?? newIndex

    // Update both lists with swapped order values
    await Promise.all([
      updateTaskList(currentList.id, { order: targetOrder }),
      updateTaskList(targetList.id, { order: currentOrder })
    ])
  }

  // Get active list
  const activeList = useMemo(() => {
    return taskLists.find(list => list.id === activeListId)
  }, [taskLists, activeListId])

  // Filter tasks from active list
  const filteredTasks = useMemo(() => {
    if (!activeList) return []

    let tasks = [...activeList.tasks]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.note?.toLowerCase().includes(query)
      )
    }

    // Filter by tag
    if (tagFilter) {
      tasks = tasks.filter(task => {
        const taskTags = task.categories || (task.category ? [task.category] : [])
        return taskTags.includes(tagFilter)
      })
    }

    // Filter by priority
    if (priorityFilter) {
      tasks = tasks.filter(task => task.priority === priorityFilter)
    }

    return tasks
  }, [activeList, searchQuery, tagFilter, priorityFilter])

  // Calculate stats for active list
  const stats = useMemo(() => {
    if (!activeList) return { today: 0, total: 0, done: 0 }

    const today = activeList.tasks.filter(t => {
      // Check explicit status first
      if (t.status === 'today') return true

      // For tasks without status, check if due today
      if (!t.status && t.dueDate && !t.completed) {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const due = new Date(t.dueDate)
        due.setHours(0, 0, 0, 0)
        return due.getTime() === now.getTime()
      }

      return false
    }).length

    const total = activeList.tasks.length
    const done = activeList.tasks.filter(t => t.completed || t.status === 'done').length

    return { today, total, done }
  }, [activeList])

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Handle profile navigation
  const handleProfile = () => {
    router.push('/profile')
  }

  // Handle status change for board view
  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!activeListId) return
    await handleTaskUpdate(taskId, activeListId, { status })
  }

  // Handle list settings update
  const handleListSettingsUpdate = async (updates: { title?: string; color?: string; icon?: string }) => {
    if (!activeListId) return
    await updateTaskList(activeListId, updates)
  }

  // Get active list color theme
  const listColorTheme = activeList ? getListColor(activeList.color) : null

  return (
    <>
      {activeList && (
        <ListSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          list={activeList}
          onSave={handleListSettingsUpdate}
        />
      )}

    <div className="h-dvh flex flex-col overflow-hidden bg-background">
      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          lists={taskLists}
          activeListId={activeListId}
          onListSelect={setActiveListId}
          onNewList={() => setIsAIModalOpen(true)}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {/* Main Content Area */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            background: listColorTheme
              ? `linear-gradient(to bottom, ${listColorTheme.hex}70, ${listColorTheme.hex}60)`
              : undefined
          }}
        >
          {/* Task Header */}
          <div
            className="flex-shrink-0 border-b border-white/20 backdrop-blur-sm"
            style={{
              backgroundColor: listColorTheme ? `${listColorTheme.hex}80` : undefined
            }}
          >
            {/* Stats Row */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-black dark:text-white">
                    {activeList?.title || 'Tasks'}
                  </h1>
                  <p className="text-sm text-black/80 dark:text-white/80 mt-1">
                    {stats.total} total {stats.total === 1 ? 'task' : 'tasks'}
                    {stats.today > 0 && ` • ${stats.today} for today`}
                    {stats.done > 0 && ` • ${stats.done} completed`}
                  </p>
                </div>
                {activeList && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSettingsOpen(true)}
                    className="h-8 w-8 p-0 text-black dark:text-white hover:bg-black/20 dark:hover:bg-white/20"
                    title="List settings"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {stats.today > 0 && (
                  <Badge variant="outline" className="text-xs text-black dark:text-white border-black/40 dark:border-white/40 font-semibold bg-black/10 dark:bg-white/10">
                    {stats.today} today
                  </Badge>
                )}
                {stats.done > 0 && (
                  <Badge variant="outline" className="text-xs text-black dark:text-white border-black/40 dark:border-white/40 font-semibold bg-black/10 dark:bg-white/10">
                    {stats.done} done
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleProfile}
                  className="h-8 w-8 p-0 text-black dark:text-white hover:bg-black/20 dark:hover:bg-white/20"
                  title="Profile"
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="h-8 w-8 p-0 text-black dark:text-white hover:bg-black/20 dark:hover:bg-white/20"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 px-6 py-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/60 dark:text-white/60" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="h-9 pl-9 text-sm bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
                />
              </div>

              {/* Priority Filter */}
              {priorityFilter && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20 text-black dark:text-white"
                  onClick={() => setPriorityFilter(null)}
                >
                  Priority: {priorityFilter}
                </Badge>
              )}

              {/* Tag Filter */}
              {tagFilter && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20 text-black dark:text-white"
                  onClick={() => setTagFilter(null)}
                >
                  Tag: {tagFilter}
                </Badge>
              )}

              <Button
                size="sm"
                variant="default"
                onClick={() => setShowNewTaskModal(true)}
                className="gap-2 bg-black/20 hover:bg-black/30 text-black border-black/30 dark:bg-white/20 dark:hover:bg-white/30 dark:text-white dark:border-white/30"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </div>

          {/* Content Area - Board or List View */}
          <div className="flex-1 overflow-y-auto">
            {!activeList ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-black/70 dark:text-white/70 mb-4">No list selected</p>
                  <Button onClick={() => setIsAIModalOpen(true)}>
                    Create Your First List
                  </Button>
                </div>
              </div>
            ) : viewMode === 'masonry' ? (
              <BoardView
                tasks={filteredTasks}
                onTaskUpdate={(taskId, updates) => handleTaskUpdate(taskId, activeListId, updates)}
                onTaskDelete={(taskId) => handleTaskDelete(taskId, activeListId)}
                onTaskToggle={(taskId, completed) => handleTaskToggle(taskId, activeListId, completed)}
                onStatusChange={handleStatusChange}
                listColorHex={listColorTheme?.hex}
              />
            ) : (
              <ListView
                tasks={filteredTasks}
                onTaskToggle={(taskId, completed) => handleTaskToggle(taskId, activeListId, completed)}
                onTaskUpdate={(taskId, updates) => handleTaskUpdate(taskId, activeListId, updates)}
                listColorHex={listColorTheme?.hex}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Button */}
      <FloatingAIButton
        onClick={() => setIsAIModalOpen(true)}
        messageCount={messages.length}
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
        loading={loading}
        error={error}
        onTaskAction={async (action, taskId, data) => {
          // Handle AI task actions (create, update, etc.)
          if (action === 'create') {
            await createTaskList(data.title, data.tasks)
          }
        }}
      />
    </div>
    </>
  )
}