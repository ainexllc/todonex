'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { TaskCard } from '../dashboard/TaskCard'
import {
  Search,
  Calendar,
  Clock,
  Flag,
  List as ListIcon,
  ChevronDown,
  ChevronRight,
  Trash2,
  Settings,
  User,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isToday, isTomorrow, isThisWeek, isPast } from 'date-fns'
import { ViewModeSwitcher } from './ViewModeSwitcher'
import { MasonryView } from './views/MasonryView'
import { TimelineView } from './views/TimelineView'
import { ListCustomizer } from './ListCustomizer'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getIconComponent } from '@/lib/utils/icon-matcher'
import { getListColor } from '@/lib/utils/list-colors'
import { toAllCaps } from '@/lib/utils/text-formatter'
import type { Task, TaskList, ViewMode } from '@/types/task'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

interface UnifiedTaskViewProps {
  taskLists: TaskList[]
  onTaskUpdate?: (taskId: string, listId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string, listId: string) => void
  onTaskToggle?: (taskId: string, listId: string, completed: boolean) => void
  onTaskListDelete?: (taskListId: string) => void
  onTaskListUpdate?: (listId: string, updates: Partial<TaskList>) => void
  onTaskListReorder?: (listId: string, direction: 'up' | 'down') => void
  className?: string
}

type ViewFilter = 'all' | 'today' | 'week' | 'overdue'

export function UnifiedTaskView({
  taskLists,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  onTaskListDelete,
  onTaskListUpdate,
  onTaskListReorder,
  className
}: UnifiedTaskViewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('masonry')
  const [customizingList, setCustomizingList] = useState<TaskList | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set(taskLists.map(l => l.id)))

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

  // Flatten all tasks with their list info
  const allTasks = useMemo(() => {
    return taskLists.flatMap(list =>
      list.tasks.map(task => ({
        ...task,
        listId: list.id,
        listTitle: list.title
      }))
    )
  }, [taskLists])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = allTasks

    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.listTitle?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
      )
    }

    if (viewFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return viewFilter === 'all'
        const dueDate = new Date(task.dueDate)

        switch (viewFilter) {
          case 'today':
            return isToday(dueDate)
          case 'week':
            return isThisWeek(dueDate) || isToday(dueDate)
          case 'overdue':
            return isPast(dueDate) && !isToday(dueDate) && !task.completed
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      const aOverdue = a.dueDate && isPast(new Date(a.dueDate)) && !isToday(new Date(a.dueDate))
      const bOverdue = b.dueDate && isPast(new Date(b.dueDate)) && !isToday(new Date(b.dueDate))
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1

      return 0
    })
  }, [allTasks, showCompleted, searchQuery, viewFilter])

  // Group tasks by list
  const tasksByList = useMemo(() => {
    const grouped = new Map<string, typeof filteredTasks>()
    filteredTasks.forEach(task => {
      if (!grouped.has(task.listId)) {
        grouped.set(task.listId, [])
      }
      grouped.get(task.listId)!.push(task)
    })
    return grouped
  }, [filteredTasks])

  // Calculate stats
  const stats = useMemo(() => {
    const total = allTasks.filter(t => !t.completed).length
    const today = allTasks.filter(t => !t.completed && t.dueDate && isToday(new Date(t.dueDate))).length
    const overdue = allTasks.filter(t =>
      !t.completed && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
    ).length
    const completed = allTasks.filter(t => t.completed).length

    return { total, today, overdue, completed }
  }, [allTasks])

  const viewFilters: { value: ViewFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <ListIcon className="h-3.5 w-3.5" /> },
    { value: 'today', label: 'Today', icon: <Calendar className="h-3.5 w-3.5" /> },
    { value: 'week', label: 'This Week', icon: <Clock className="h-3.5 w-3.5" /> },
    { value: 'overdue', label: 'Overdue', icon: <Flag className="h-3.5 w-3.5" /> },
  ]

  const handleTaskUpdate = (task: any, updates: Partial<Task>) => {
    onTaskUpdate?.(task.id, task.listId, updates)
  }

  const handleTaskDelete = (task: any) => {
    onTaskDelete?.(task.id, task.listId)
  }

  const handleTaskToggle = (task: any, completed: boolean) => {
    onTaskToggle?.(task.id, task.listId, completed)
  }

  const toggleListExpanded = (listId: string) => {
    const newExpanded = new Set(expandedLists)
    if (newExpanded.has(listId)) {
      newExpanded.delete(listId)
    } else {
      newExpanded.add(listId)
    }
    setExpandedLists(newExpanded)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      void error
    }
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/50">
        {/* Stats Row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h1 className="text-lg font-bold">My Tasks</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.total} active {stats.total === 1 ? 'task' : 'tasks'}
              {stats.today > 0 && ` • ${stats.today} due today`}
              {stats.overdue > 0 && ` • ${stats.overdue} overdue`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats.overdue > 0 && (
              <Badge variant="outline" className="text-xs text-red-400 border-red-500 font-semibold">
                {stats.overdue} overdue
              </Badge>
            )}
            {stats.today > 0 && (
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500 font-semibold">
                {stats.today} today
              </Badge>
            )}
            <Badge variant="outline" className="text-xs text-green-400 border-green-500 font-semibold">
              {stats.completed} done
            </Badge>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 p-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex gap-1">
            {viewFilters.map(({ value, label, icon }) => (
              <Button
                key={value}
                size="sm"
                variant={viewFilter === value ? 'default' : 'outline'}
                onClick={() => setViewFilter(value)}
                className="h-8 text-xs px-2"
              >
                {icon}
                <span className="ml-1">{label}</span>
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant={showCompleted ? 'default' : 'outline'}
            onClick={() => setShowCompleted(!showCompleted)}
            className="h-8 text-xs px-3"
          >
            {showCompleted ? 'Hide' : 'Show'} Done
          </Button>

          {/* View Mode Switcher */}
          <ViewModeSwitcher value={viewMode} onChange={handleViewModeChange} />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleProfile}
            className="h-8 w-8 p-0"
            title="Profile"
          >
            <User className="h-4 w-4" />
          </Button>

          {/* Logout Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="h-8 w-8 p-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'masonry' ? (
        <MasonryView
          taskLists={taskLists}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          onTaskToggle={onTaskToggle}
          onListCustomize={(list) => setCustomizingList(list)}
          onListDelete={onTaskListDelete}
          onListReorder={onTaskListReorder}
          className="flex-1 overflow-y-auto"
        />
      ) : (
        <TimelineView
          taskLists={taskLists}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          onTaskToggle={onTaskToggle}
          className="flex-1"
        />
      )}

      {/* List Customizer Modal */}
      {customizingList && (
        <ListCustomizer
          taskList={customizingList}
          isOpen={!!customizingList}
          onClose={() => setCustomizingList(null)}
          onSave={(updates) => {
            onTaskListUpdate?.(customizingList.id, updates)
            setCustomizingList(null)
          }}
        />
      )}
    </div>
  )
}
