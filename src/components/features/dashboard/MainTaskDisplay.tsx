'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TaskCard, Task } from './TaskCard'
import { useDashboardStore, ViewMode } from '@/store/dashboard-store'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Grid3x3,
  List,
  Columns,
  Search,
  Filter,
  SortAsc,
  CheckSquare,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isToday, isTomorrow, isThisWeek, isPast, parseISO } from 'date-fns'

interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
}

interface MainTaskDisplayProps {
  taskLists: TaskList[]
  onTaskUpdate?: (taskId: string, listId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string, listId: string) => void
  onTaskToggle?: (taskId: string, listId: string, completed: boolean) => void
  className?: string
}

export function MainTaskDisplay({
  taskLists,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  className
}: MainTaskDisplayProps) {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedTaskIds,
    toggleTaskSelection,
    clearSelection,
    showCompleted,
    setShowCompleted,
    dateFilter,
    setDateFilter,
    groupBy,
    setGroupBy
  } = useDashboardStore()

  // Flatten all tasks from all lists
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

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
      )
    }

    // Filter by date
    if (dateFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)

        switch (dateFilter) {
          case 'today':
            return isToday(dueDate)
          case 'week':
            return isThisWeek(dueDate)
          case 'overdue':
            return isPast(dueDate) && !isToday(dueDate) && !task.completed
          case 'upcoming':
            return !isPast(dueDate)
          default:
            return true
        }
      })
    }

    return filtered
  }, [allTasks, showCompleted, searchQuery, dateFilter])

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': filteredTasks }
    }

    const groups: Record<string, typeof filteredTasks> = {}

    filteredTasks.forEach(task => {
      let key = 'Uncategorized'

      switch (groupBy) {
        case 'list':
          key = task.listTitle || 'No List'
          break
        case 'priority':
          key = task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
          break
        case 'date':
          if (!task.dueDate) {
            key = 'No Due Date'
          } else {
            const dueDate = new Date(task.dueDate)
            if (isToday(dueDate)) key = 'Today'
            else if (isTomorrow(dueDate)) key = 'Tomorrow'
            else if (isThisWeek(dueDate)) key = 'This Week'
            else if (isPast(dueDate)) key = 'Overdue'
            else key = 'Later'
          }
          break
        case 'category':
          key = task.category || 'Uncategorized'
          break
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })

    // Sort groups for date-based grouping
    if (groupBy === 'date') {
      const order = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later', 'No Due Date']
      const sorted: Record<string, typeof filteredTasks> = {}
      order.forEach(key => {
        if (groups[key]) sorted[key] = groups[key]
      })
      return sorted
    }

    return groups
  }, [filteredTasks, groupBy])

  // Calculate stats
  const stats = useMemo(() => {
    const total = allTasks.length
    const completed = allTasks.filter(t => t.completed).length
    const today = allTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))).length
    const overdue = allTasks.filter(t =>
      t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && !t.completed
    ).length

    return { total, completed, today, overdue }
  }, [allTasks])

  const viewModes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard' },
    { mode: 'today', icon: <Calendar className="h-4 w-4" />, label: 'Today' },
    { mode: 'upcoming', icon: <Clock className="h-4 w-4" />, label: 'Upcoming' },
    { mode: 'priority', icon: <Grid3x3 className="h-4 w-4" />, label: 'Priority' },
    { mode: 'list', icon: <List className="h-4 w-4" />, label: 'List' },
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

  return (
    <div className={cn('flex flex-col h-full bg-gray-900', className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-950/50">
        {/* View Mode Tabs */}
        <div className="flex items-center justify-between p-3 pb-0">
          <div className="flex gap-1">
            {viewModes.map(({ mode, icon, label }) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? 'default' : 'ghost'}
                onClick={() => setViewMode(mode)}
                className="h-8"
              >
                {icon}
                <span className="ml-2 text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Total:</span>
            <Badge variant="outline" className="text-xs">{stats.total}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Today:</span>
            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500">
              {stats.today}
            </Badge>
          </div>
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Overdue:</span>
              <Badge variant="outline" className="text-xs text-red-400 border-red-500">
                {stats.overdue}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Completed:</span>
            <Badge variant="outline" className="text-xs text-green-400 border-green-500">
              {stats.completed}
            </Badge>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 pt-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="h-8 pl-8 text-xs"
            />
          </div>

          {/* Filters */}
          <Button
            size="sm"
            variant={dateFilter !== 'all' ? 'default' : 'outline'}
            onClick={() => {
              const filters: typeof dateFilter[] = ['all', 'today', 'week', 'overdue', 'upcoming']
              const currentIndex = filters.indexOf(dateFilter)
              const nextIndex = (currentIndex + 1) % filters.length
              setDateFilter(filters[nextIndex])
            }}
            className="h-8 text-xs"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            {dateFilter === 'all' ? 'All' : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
          </Button>

          {/* Group By */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const groups: typeof groupBy[] = ['none', 'list', 'priority', 'date', 'category']
              const currentIndex = groups.indexOf(groupBy)
              const nextIndex = (currentIndex + 1) % groups.length
              setGroupBy(groups[nextIndex])
            }}
            className="h-8 text-xs"
          >
            <Columns className="h-3.5 w-3.5 mr-1" />
            {groupBy === 'none' ? 'Group' : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
          </Button>

          {/* Show Completed Toggle */}
          <Button
            size="sm"
            variant={showCompleted ? 'default' : 'outline'}
            onClick={() => setShowCompleted(!showCompleted)}
            className="h-8 text-xs"
          >
            <CheckSquare className="h-3.5 w-3.5 mr-1" />
            {showCompleted ? 'Hide' : 'Show'} Done
          </Button>
        </div>

        {/* Selection Bar */}
        {selectedTaskIds.size > 0 && (
          <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-t border-primary/30">
            <span className="text-xs text-primary">
              {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? 's' : ''} selected
            </span>
            <Button size="sm" variant="ghost" onClick={clearSelection} className="h-7 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-500 mb-2">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No tasks found</p>
              <p className="text-xs mt-1">
                {searchQuery ? 'Try a different search' : 'Create a task to get started'}
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedTasks).map(([groupName, tasks]) => (
            <div key={groupName}>
              {groupBy !== 'none' && (
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  {groupName}
                  <Badge variant="outline" className="text-xs">
                    {tasks.length}
                  </Badge>
                </h3>
              )}
              <div className="space-y-2">
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    selected={selectedTaskIds.has(task.id)}
                    onToggleComplete={(_, completed) => handleTaskToggle(task, completed)}
                    onUpdate={(_, updates) => handleTaskUpdate(task, updates)}
                    onDelete={() => handleTaskDelete(task)}
                    onSelect={() => toggleTaskSelection(task.id)}
                    showCheckbox={selectedTaskIds.size > 0}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
