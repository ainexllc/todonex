"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/features/tasks/Sidebar"
import { BoardView } from "@/components/features/tasks/views/BoardView"
import { ListView } from "@/components/features/tasks/views/ListView"
import { FloatingAIButton } from "@/components/features/tasks/FloatingAIButton"
import { AIAssistantModal } from "@/components/features/tasks/AIAssistantModal"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ListSettingsDialog } from "@/components/features/tasks/ListSettingsDialog"
import { useTaskChat } from "@/hooks/useTaskChat"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"
import { useAuthStore } from "@/store/auth-store"
import { autoArchiveAllLists, filterArchivedTasks } from "@/lib/utils/task-archive"
import { getListColor } from "@/lib/utils/list-colors"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { Search, Plus, User, LogOut, Settings2, LayoutGrid, List as ListIcon, Mic, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, ViewMode, TaskStatus } from "@/types/task"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagInput } from "@/components/ui/tag-input"
import { ColorPicker } from "@/components/ui/color-picker"
import { suggestColorForList, type ListColorKey } from "@/lib/utils/list-colors"
import { POPULAR_ICONS, type IconName, getIconComponent, getBestIconForList } from "@/lib/utils/icon-matcher"

declare global {
  interface Window {
    webkitSpeechRecognition?: any
    SpeechRecognition?: any
  }
}

interface DashboardShellProps {
  redirectUnauthed?: boolean
}

export function DashboardShell({ redirectUnauthed = true }: DashboardShellProps) {
  useAuthRedirect({ disablePublicRedirect: !redirectUnauthed })

  const router = useRouter()
  const { firebaseUser } = useAuthStore()

  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeListId, setActiveListId] = useState<string>("")
  const [viewMode, setViewMode] = useState<ViewMode>("masonry")
  const [searchQuery, setSearchQuery] = useState("")
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showListForm, setShowListForm] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [manualTaskTitle, setManualTaskTitle] = useState("")
  const [manualTaskDueDate, setManualTaskDueDate] = useState<string>("")
  const [manualTaskNotes, setManualTaskNotes] = useState("")
  const [manualTaskPriority, setManualTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [manualTaskStatus, setManualTaskStatus] = useState<TaskStatus>('upcoming')
  const [manualTaskTags, setManualTaskTags] = useState<string[]>([])
  const [showTaskAdvanced, setShowTaskAdvanced] = useState(false)
  const [manualListTitle, setManualListTitle] = useState("")
  const [manualListColor, setManualListColor] = useState<ListColorKey>('blue')
  const [manualListIcon, setManualListIcon] = useState<IconName>('List')
  const [manualListColorTouched, setManualListColorTouched] = useState(false)
  const [manualListIconTouched, setManualListIconTouched] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

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

  useEffect(() => {
    if (taskLists.length > 0 && !activeListId) {
      setActiveListId(taskLists[0].id)
    }
  }, [taskLists, activeListId])

  useEffect(() => {
    const savedViewMode = localStorage.getItem("taskViewMode")
    if (savedViewMode && ["masonry", "timeline"].includes(savedViewMode)) {
      setViewMode(savedViewMode as ViewMode)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey
      if (isMeta && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowCommandPalette((prev) => !prev)
        return
      }
      if (event.key === 'Escape') {
        setShowCommandPalette(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const speechApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (speechApi) {
      setVoiceSupported(true)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!showCommandPalette) {
      setCommandQuery('')
    }
  }, [showCommandPalette])

  useEffect(() => {
    const archiveTasks = async () => {
      if (taskLists.length === 0) return

      const updatedLists = autoArchiveAllLists(taskLists)

      for (let i = 0; i < updatedLists.length; i++) {
        const original = taskLists[i]
        const updated = updatedLists[i]

        const hasArchivedTasks = updated.tasks.some((task, idx) => task.archived && !original.tasks[idx]?.archived)

        if (hasArchivedTasks) {
          const tasksForFirebase = updated.tasks.map((task: any) => {
            const firebaseTask: any = {
              id: task.id,
              title: task.title,
              completed: task.completed || false,
              priority: task.priority || "medium",
              completedAt: null,
              archived: task.archived || false,
              archivedAt: null
            }

            if (task.completedAt) {
              const completedDate = new Date(task.completedAt)
              if (!isNaN(completedDate.getTime())) {
                firebaseTask.completedAt = completedDate.toISOString()
              }
            }

            if (task.archivedAt) {
              const archivedDate = new Date(task.archivedAt)
              if (!isNaN(archivedDate.getTime())) {
                firebaseTask.archivedAt = archivedDate.toISOString()
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

          await updateTaskList(updated.id, { tasks: tasksForFirebase })
        }
      }
    }

    archiveTasks()
    const interval = setInterval(archiveTasks, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [taskLists, updateTaskList])

  useEffect(() => {
    if (!showListForm) return

    if (manualListTitle.trim().length === 0) {
      if (!manualListColorTouched) setManualListColor('blue')
      if (!manualListIconTouched) setManualListIcon('List')
      return
    }

    if (!manualListColorTouched) {
      const suggestedColor = suggestColorForList(manualListTitle)
      setManualListColor(suggestedColor)
    }

    if (!manualListIconTouched) {
      setManualListIcon(getBestIconForList(manualListTitle))
    }
  }, [manualListTitle, showListForm, manualListColorTouched, manualListIconTouched])

  useEffect(() => {
    if (!showVoiceModal && isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsRecording(false)
    }
    if (showVoiceModal) {
      setVoiceTranscript('')
      setVoiceError(null)
    }
  }, [showVoiceModal, isRecording])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem("taskViewMode", mode)
  }

  const handleDeleteTaskList = async (taskListId: string) => {
    await deleteTaskList(taskListId)
  }

  const handleTaskUpdate = async (taskId: string, listId: string, updates: Partial<Task>) => {
    const taskList = taskLists.find(list => list.id === listId)
    if (!taskList) return

    const updatedTasks = taskList.tasks.map((task: any) =>
      task.id === taskId ? { ...task, ...updates } : task
    )

    const tasksForFirebase = updatedTasks.map((task: any) => {
      const firebaseTask: any = {
        id: task.id,
        title: task.title,
        completed: task.completed || false,
        priority: task.priority || "medium",
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
        priority: task.priority || "medium",
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
    const updates: Partial<Task> = { completed }
    updates.completedAt = completed ? new Date() : null
    await handleTaskUpdate(taskId, listId, updates)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!activeListId) return
    await handleTaskUpdate(taskId, activeListId, { status })
  }

  const handleListSettingsUpdate = async (updates: { title?: string; color?: string; icon?: string }) => {
    if (!activeListId) return
    await updateTaskList(activeListId, updates)
  }

  const handleQuickAddTask = (_status?: TaskStatus) => {
    setShowQuickAdd(false)
    setManualTaskTitle("")
    setManualTaskDueDate("")
    setManualTaskNotes("")
    setManualTaskPriority('medium')
    setManualTaskStatus(_status ?? 'upcoming')
    setManualTaskTags([])
    setShowTaskAdvanced(false)
    setShowTaskForm(true)
  }

  const handleQuickAddList = () => {
    setShowQuickAdd(false)
    setManualListTitle("")
    setManualListColor('blue')
    setManualListIcon('List')
    setManualListColorTouched(false)
    setManualListIconTouched(false)
    setShowListForm(true)
  }

  const activeList = useMemo(() => {
    return taskLists.find(list => list.id === activeListId)
  }, [taskLists, activeListId])

  const filteredTasks = useMemo(() => {
    if (!activeList) return []

    let tasks = [...activeList.tasks]

    tasks = filterArchivedTasks(tasks)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.note?.toLowerCase().includes(query)
      )
    }

    if (tagFilter) {
      tasks = tasks.filter(task => {
        const taskTags = task.categories || (task.category ? [task.category] : [])
        return taskTags.includes(tagFilter)
      })
    }

    if (priorityFilter) {
      tasks = tasks.filter(task => task.priority === priorityFilter)
    }

    return tasks
  }, [activeList, searchQuery, tagFilter, priorityFilter])

  const stats = useMemo(() => {
    if (!activeList) return { today: 0, total: 0, done: 0 }

    const today = activeList.tasks.filter(t => {
      if (t.status === "today") return true
      if (!t.status && t.dueDate && !t.completed) {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const due = new Date(t.dueDate)
        due.setHours(0, 0, 0, 0)
        return due.getTime() === now.getTime()
      }
      return false
    }).length

    const total = activeList.tasks.filter(t => !t.completed).length
    const done = activeList.tasks.filter(t => t.completed || t.status === "done").length

    return { today, total, done }
  }, [activeList])

  const listColorTheme = activeList ? getListColor(activeList.color) : null
  const hasActiveFilters = Boolean(tagFilter || priorityFilter || searchQuery)

  type CommandItem = {
    id: string
    label: string
    description?: string
    action: () => void
    shortcut?: string
    disabled?: boolean
  }

  const commandItems: CommandItem[] = useMemo(() => {
    return [
      {
        id: 'quick-add-task',
        label: 'Add task',
        description: 'Open the quick task capture dialog',
        action: () => handleQuickAddTask(),
        shortcut: 'T'
      },
      {
        id: 'quick-add-list',
        label: 'Add list',
        description: 'Create a new list manually',
        action: () => handleQuickAddList(),
        shortcut: 'L'
      },
      {
        id: 'ai-assist',
        label: 'AI assistant',
        description: 'Open the AI assistant for guided task creation',
        action: () => setIsAIModalOpen(true),
        shortcut: 'A'
      },
      {
        id: 'voice-capture',
        label: 'Voice capture',
        description: voiceSupported ? 'Capture a task using your microphone' : 'Voice capture not supported in this browser',
        action: () => setShowVoiceModal(true),
        shortcut: 'V',
        disabled: !voiceSupported
      },
      {
        id: 'switch-board',
        label: 'Switch to board view',
        description: 'Focus on columns and drag & drop organization',
        action: () => handleViewModeChange('masonry'),
        shortcut: 'B',
        disabled: viewMode === 'masonry'
      },
      {
        id: 'switch-list',
        label: 'Switch to list view',
        description: 'View tasks in a sortable list',
        action: () => handleViewModeChange('timeline'),
        shortcut: 'S',
        disabled: viewMode === 'timeline'
      },
      {
        id: 'open-settings',
        label: 'List settings',
        description: 'Rename, recolor, or manage the current list',
        action: () => setSettingsOpen(true),
        shortcut: '⌥L',
        disabled: !activeList
      }
    ]
  }, [viewMode, voiceSupported, activeList])

  const filteredCommands = useMemo(() => {
    if (!commandQuery.trim()) return commandItems
    const query = commandQuery.trim().toLowerCase()
    return commandItems.filter((command) =>
      command.label.toLowerCase().includes(query) ||
      (command.description?.toLowerCase().includes(query) ?? false)
    )
  }, [commandItems, commandQuery])

  const executeCommand = (command: CommandItem) => {
    if (command.disabled) return
    setShowCommandPalette(false)
    setCommandQuery('')
    command.action()
  }

  if (!firebaseUser && !redirectUnauthed) {
    return null
  }

  const createManualTask = async () => {
    if (!activeListId || !manualTaskTitle.trim()) {
      return
    }

    const targetList = taskLists.find(list => list.id === activeListId)
    if (!targetList) return

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: manualTaskTitle.trim(),
      description: manualTaskNotes.trim() || undefined,
      completed: false,
      priority: manualTaskPriority,
      status: manualTaskStatus,
      categories: manualTaskTags,
      tags: manualTaskTags,
      note: manualTaskNotes.trim() || undefined
    }

    if (manualTaskDueDate) {
      const due = new Date(manualTaskDueDate)
      if (!isNaN(due.getTime())) {
        newTask.dueDate = due
      }
    }

    const updatedTasks = [...targetList.tasks, newTask]
    await updateTaskList(targetList.id, { tasks: updatedTasks })
    setShowTaskForm(false)
  }

  const createManualList = async () => {
    if (!manualListTitle.trim()) return
    await createTaskList(manualListTitle.trim(), [], {
      color: manualListColor,
      icon: manualListIcon
    })
    setShowListForm(false)
  }

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Voice capture is not supported in this browser yet.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        for (let i = 0; i < event.results.length; i += 1) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript = transcript
          }
        }
        setVoiceTranscript((finalTranscript + interimTranscript).trim())
      }

      recognition.onerror = (event: any) => {
        setVoiceError(event.error === 'not-allowed' ? 'Microphone permissions denied. Allow access to use voice capture.' : 'Voice capture error. Please try again.')
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        recognitionRef.current = null
      }

      recognition.start()
      recognitionRef.current = recognition
      setVoiceTranscript('')
      setVoiceError(null)
      setIsRecording(true)
    } catch (error) {
      setVoiceError('Unable to start recording. Please try again.')
      setIsRecording(false)
    }
  }

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  const commitVoiceTranscriptAsTask = () => {
    if (!voiceTranscript.trim()) {
      setVoiceError('Nothing captured yet. Try recording again.')
      return
    }
    stopVoiceRecording()
    setShowVoiceModal(false)
    setManualTaskTitle(voiceTranscript.trim())
    setManualTaskDueDate('')
    setManualTaskNotes('')
    setManualTaskPriority('medium')
    setManualTaskStatus('upcoming')
    setManualTaskTags([])
    setShowTaskAdvanced(false)
    setShowTaskForm(true)
  }

  const sendVoiceTranscriptToAI = async () => {
    if (!voiceTranscript.trim()) {
      setVoiceError('Nothing captured yet. Try recording again.')
      return
    }
    stopVoiceRecording()
    setShowVoiceModal(false)
    setIsAIModalOpen(true)
    try {
      await sendMessage(voiceTranscript.trim())
    } catch (error) {
      void error
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      void error
    }
  }

  const handleProfile = () => {
    router.push("/profile")
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "var(--board-background)",
        color: "var(--board-text-strong)"
      }}
    >
      <div className="flex-1 flex flex-row overflow-hidden h-full">
        <Sidebar
          lists={taskLists}
          activeListId={activeListId}
          onListSelect={setActiveListId}
          onNewList={() => setIsAIModalOpen(true)}
        />

        <div
          className="flex-1 flex flex-col overflow-hidden backdrop-blur-lg"
          style={{ background: "var(--board-surface-glass)" }}
        >
          <div
            className="border-b"
            style={{ borderColor: "var(--board-column-border)" }}
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold drop-shadow-sm" style={{ color: "var(--board-heading-color)" }}>
                    {activeList?.title || "Tasks"}
                  </h1>
                  <p className="text-sm mt-1" style={{ color: "var(--board-text-subtle)" }}>
                    {stats.total} active {stats.total === 1 ? "task" : "tasks"}
                    {stats.today > 0 && ` • ${stats.today} due today`}
                    {stats.done > 0 && ` • ${stats.done} completed`}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { label: "Active", value: stats.total },
                      { label: "Today", value: stats.today },
                      { label: "Done", value: stats.done }
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                        style={{
                          background: "var(--board-tag-bg)",
                          borderColor: "var(--board-tag-border)",
                          color: "var(--board-text-muted)"
                        }}
                      >
                        <span className="text-[11px] uppercase tracking-wide opacity-80 mr-2">{label}</span>
                        <span className="text-sm font-semibold" style={{ color: "var(--board-text-strong)" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-full border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]/80 p-0.5">
                    {(
                      [
                        { id: "masonry" as ViewMode, label: "Board", icon: <LayoutGrid className="h-3 w-3" /> },
                        { id: "timeline" as ViewMode, label: "List", icon: <ListIcon className="h-3 w-3" /> }
                      ]
                    ).map((option) => (
                      <Button
                        key={option.id}
                        size="sm"
                        variant={viewMode === option.id ? "default" : "ghost"}
                        onClick={() => handleViewModeChange(option.id)}
                        className={cn(
                          "h-8 px-3 text-xs font-semibold rounded-full",
                          viewMode === option.id
                            ? "bg-[color:var(--board-action-bg)] text-[color:var(--board-action-text)]"
                            : "text-[color:var(--board-text-muted)] hover:text-[color:var(--board-text-strong)]"
                        )}
                        style={
                          viewMode === option.id
                            ? { borderColor: "var(--board-action-border)" }
                            : { borderColor: "transparent" }
                        }
                      >
                        <span className="mr-1.5">{option.icon}</span>
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSettingsOpen(true)}
                    className="h-8 w-8 p-0 transition-colors hover:bg-[color:var(--board-surface-glass)]/80"
                    style={{ color: "var(--board-text-subtle)" }}
                    title="List settings"
                    disabled={!activeList}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCommandPalette(true)}
                    className="hidden md:flex items-center gap-2 h-8 px-3 text-xs rounded-full border border-[color:var(--board-column-border)]"
                  >
                    <Sparkles className="h-3 w-3" />
                    Commands
                    <span className="ml-2 inline-flex items-center rounded bg-[color:var(--board-surface-glass)] px-2 py-0.5 text-[10px] text-[color:var(--board-text-muted)] border border-[color:var(--board-column-border)]">⌘K</span>
                  </Button>
                  <ThemeToggle />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleProfile}
                    className="h-8 w-8 p-0 transition-colors hover:bg-[color:var(--board-surface-glass)]/80"
                    style={{ color: "var(--board-text-subtle)" }}
                    title="Profile"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLogout}
                    className="h-8 w-8 p-0 transition-colors hover:bg-[color:var(--board-surface-glass)]/80"
                    style={{ color: "var(--board-text-subtle)" }}
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[220px] relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: "var(--board-text-muted)" }} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="h-9 pl-9 text-sm rounded-xl border"
                    style={{
                      background: "var(--board-surface-glass)",
                      borderColor: "var(--board-column-border)",
                      color: "var(--board-text-strong)"
                    }}
                  />
                </div>

                {priorityFilter && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer border"
                    style={{
                      background: "var(--board-pill-bg)",
                      color: "var(--board-pill-text)",
                      borderColor: "var(--board-pill-border)"
                    }}
                    onClick={() => setPriorityFilter(null)}
                  >
                    Priority: {priorityFilter}
                  </Badge>
                )}

                {tagFilter && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer border"
                    style={{
                      background: "var(--board-pill-bg)",
                      color: "var(--board-pill-text)",
                      borderColor: "var(--board-pill-border)"
                    }}
                    onClick={() => setTagFilter(null)}
                  >
                    Tag: {tagFilter}
                  </Badge>
                )}

                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setSearchQuery("")
                      setTagFilter(null)
                      setPriorityFilter(null)
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!activeList ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No list selected</p>
                  <Button onClick={() => setIsAIModalOpen(true)}>
                    Create Your First List
                  </Button>
                </div>
              </div>
            ) : viewMode === "masonry" ? (
              <BoardView
                tasks={filteredTasks}
                onTaskUpdate={(taskId, updates) => handleTaskUpdate(taskId, activeListId, updates)}
                onTaskDelete={(taskId) => handleTaskDelete(taskId, activeListId)}
                onTaskToggle={(taskId, completed) => handleTaskToggle(taskId, activeListId, completed)}
                onStatusChange={handleStatusChange}
                listColorHex={listColorTheme?.hex}
                onAddTask={(status) => handleQuickAddTask(status)}
              />
            ) : (
              <ListView
                tasks={filteredTasks}
                onTaskToggle={(taskId, completed) => handleTaskToggle(taskId, activeListId, completed)}
                onTaskUpdate={(taskId, updates) => handleTaskUpdate(taskId, activeListId, updates)}
                listColorHex={listColorTheme?.hex}
                onAddTask={() => handleQuickAddTask()}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating quick actions */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {showQuickAdd && (
          <div className="flex flex-col gap-2 rounded-2xl border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]/95 p-3 shadow-xl">
            <Button
              variant="ghost"
              className="justify-start gap-2 text-sm"
              onClick={() => handleQuickAddTask()}
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-sm"
              onClick={handleQuickAddList}
            >
              <Plus className="h-4 w-4" />
              New List
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-sm"
              onClick={() => {
                setShowQuickAdd(false)
                setIsAIModalOpen(true)
              }}
            >
              <Sparkles className="h-4 w-4" />
              AI Assist
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-sm"
              onClick={() => {
                setShowQuickAdd(false)
                setShowVoiceModal(true)
              }}
            >
              <Mic className="h-4 w-4" />
              Voice Capture
            </Button>
          </div>
        )}
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-[color:var(--board-action-bg)] hover:bg-[color:var(--board-action-bg)]/80 border border-[color:var(--board-action-border)] text-[color:var(--board-action-text)] shadow-xl"
          onClick={() => setShowQuickAdd((prev) => !prev)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <FloatingAIButton onClick={() => setIsAIModalOpen(true)} messageCount={messages.length} />

      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add task to {activeList?.title ?? 'list'}</DialogTitle>
            <DialogDescription>
              Capture a quick task with a title and optional due date or note. Use AI or voice for richer capture.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-task-title">Task title</Label>
              <Input
                id="manual-task-title"
                value={manualTaskTitle}
                onChange={(e) => setManualTaskTitle(e.target.value)}
                placeholder="e.g. Follow up with marketing"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-task-due">Due date (optional)</Label>
              <Input
                id="manual-task-due"
                type="date"
                value={manualTaskDueDate}
                onChange={(e) => setManualTaskDueDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-task-notes">Notes (optional)</Label>
              <Textarea
                id="manual-task-notes"
                value={manualTaskNotes}
                onChange={(e) => setManualTaskNotes(e.target.value)}
                placeholder="Add quick context"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs text-muted-foreground">Additional options</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowTaskAdvanced((prev) => !prev)}
              >
                {showTaskAdvanced ? 'Hide' : 'Show'} advanced
              </Button>
            </div>
            {showTaskAdvanced && (
              <div className="space-y-3 rounded-xl border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]/60 p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Priority</Label>
                    <Select value={manualTaskPriority} onValueChange={(value) => setManualTaskPriority(value as 'low' | 'medium' | 'high')}>
                      <SelectTrigger className="h-9 text-sm rounded-lg border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-[color:var(--board-surface-glass)] text-[color:var(--board-text-strong)]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Destination</Label>
                    <Select value={manualTaskStatus} onValueChange={(value) => setManualTaskStatus(value as TaskStatus)}>
                      <SelectTrigger className="h-9 text-sm rounded-lg border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[color:var(--board-surface-glass)] text-[color:var(--board-text-strong)]">
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="done">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Labels</Label>
                  <TagInput
                    tags={manualTaskTags}
                    onChange={setManualTaskTags}
                    placeholder="Add label and press enter"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTaskForm(false)}>
              Cancel
            </Button>
            <Button onClick={createManualTask} disabled={!manualTaskTitle.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showListForm} onOpenChange={setShowListForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new list</DialogTitle>
            <DialogDescription>
              Organize tasks by creating focused lists. Choose a color and icon to help you spot it quickly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-list-title">List name</Label>
              <Input
                id="manual-list-title"
                value={manualListTitle}
                onChange={(e) => setManualListTitle(e.target.value)}
                placeholder="e.g. Product Launch"
                autoFocus
              />
            </div>
            <ColorPicker
              value={manualListColor}
              onChange={(color) => {
                setManualListColor(color)
                setManualListColorTouched(true)
              }}
            />
            <div className="space-y-2">
              <Label className="text-xs">Icon</Label>
              <div className="grid grid-cols-5 gap-2">
                {POPULAR_ICONS.map((iconName) => {
                  const IconComponent = getIconComponent(iconName)
                  const isSelected = manualListIcon === iconName
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        setManualListIcon(iconName)
                        setManualListIconTouched(true)
                      }}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-200',
                        'hover:scale-105 hover:shadow-lg',
                        isSelected ? 'border-[color:var(--board-action-border)] bg-[color:var(--board-action-bg)] text-[color:var(--board-action-text)]' : 'border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]'
                      )}
                      title={iconName}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowListForm(false)}>
              Cancel
            </Button>
            <Button onClick={createManualList} disabled={!manualListTitle.trim()}>
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVoiceModal} onOpenChange={setShowVoiceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice capture</DialogTitle>
            <DialogDescription>
              {voiceSupported
                ? 'Record a quick voice note. We’ll transcribe it so you can turn it into tasks.'
                : 'Voice capture is not supported in this browser yet. Try the AI assistant instead.'}
            </DialogDescription>
          </DialogHeader>
          {voiceSupported ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]/70 px-4 py-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--board-text-strong)' }}>
                    {isRecording ? 'Listening…' : voiceTranscript ? 'Recording finished' : 'Ready to record'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--board-text-muted)' }}>
                    Keep speaking clearly. Recording stops automatically after a pause.
                  </p>
                </div>
                <Button
                  variant={isRecording ? 'destructive' : 'default'}
                  size="sm"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className="gap-2 rounded-full"
                >
                  <Mic className="h-3.5 w-3.5" />
                  {isRecording ? 'Stop' : 'Start'}
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Transcript</Label>
                <Textarea
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  placeholder={isRecording ? 'Listening…' : 'Your voice transcription will appear here'}
                  rows={5}
                />
              </div>
              {voiceError && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {voiceError}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]/70 px-4 py-4 text-sm" style={{ color: 'var(--board-text-muted)' }}>
              Voice capture relies on the Web Speech API, which isn’t available in this browser yet. Try Chrome on desktop or use the AI assistant for dictation.
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowVoiceModal(false)}>
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={sendVoiceTranscriptToAI}
              disabled={!voiceTranscript.trim()}
            >
              Send to AI
            </Button>
            <Button onClick={commitVoiceTranscriptAsTask} disabled={!voiceTranscript.trim()}>
              Convert to Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
        <DialogContent className="sm:max-w-lg">
          <div className="space-y-3">
            <Input
              placeholder="Search actions..."
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              autoFocus
            />
            <div className="max-h-64 overflow-y-auto rounded-lg border border-[color:var(--board-column-border)] bg-[color:var(--board-surface-glass)]/80">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-3 text-sm" style={{ color: 'var(--board-text-muted)' }}>
                  No actions found. Try "task", "list", or "AI".
                </div>
              ) : (
                filteredCommands.map((command) => (
                  <button
                    key={command.id}
                    type="button"
                    disabled={command.disabled}
                    onClick={() => executeCommand(command)}
                    className={cn(
                      'w-full text-left px-4 py-3 flex flex-col gap-1 border-b border-[color:var(--board-column-border)] last:border-b-0 transition-colors',
                      command.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[color:var(--board-action-bg)]/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--board-text-strong)' }}>{command.label}</span>
                      {command.shortcut && (
                        <span className="text-[11px] rounded bg-[color:var(--board-surface-glass)] px-2 py-0.5 border border-[color:var(--board-column-border)] text-[color:var(--board-text-muted)]">
                          {command.shortcut}
                        </span>
                      )}
                    </div>
                    {command.description && (
                      <span className="text-xs" style={{ color: 'var(--board-text-muted)' }}>
                        {command.description}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
        loading={loading}
        error={error}
        onTaskAction={async (action, taskId, data) => {
          if (action === "create") {
            await createTaskList(data.title, data.tasks)
          }
        }}
      />

      {activeList && (
        <ListSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          list={activeList}
          onSave={handleListSettingsUpdate}
          onDelete={handleDeleteTaskList}
        />
      )}
    </div>
  )
}

export default DashboardShell
