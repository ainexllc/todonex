import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewMode = 'dashboard' | 'today' | 'upcoming' | 'priority' | 'list' | 'board'
export type GroupBy = 'none' | 'list' | 'priority' | 'date' | 'category'
export type SortBy = 'dueDate' | 'priority' | 'createdAt' | 'manual' | 'aiSuggested'

interface DashboardState {
  // View State
  viewMode: ViewMode
  groupBy: GroupBy
  sortBy: SortBy
  searchQuery: string

  // Selection State
  selectedTaskIds: Set<string>
  bulkActionMode: boolean

  // UI State
  aiPanelWidth: number
  aiPanelCollapsed: boolean
  sidebarWidth: number

  // Filter State
  showCompleted: boolean
  priorityFilter: ('low' | 'medium' | 'high')[] | null
  dateFilter: 'all' | 'today' | 'week' | 'overdue' | 'upcoming'

  // Active Context
  activeListId: string | null
  scrollPosition: number

  // Actions
  setViewMode: (mode: ViewMode) => void
  setGroupBy: (groupBy: GroupBy) => void
  setSortBy: (sortBy: SortBy) => void
  setSearchQuery: (query: string) => void

  toggleTaskSelection: (taskId: string) => void
  selectAllTasks: (taskIds: string[]) => void
  clearSelection: () => void
  setBulkActionMode: (enabled: boolean) => void

  setAIPanelWidth: (width: number) => void
  toggleAIPanel: () => void
  setSidebarWidth: (width: number) => void

  setShowCompleted: (show: boolean) => void
  setPriorityFilter: (priorities: ('low' | 'medium' | 'high')[] | null) => void
  setDateFilter: (filter: 'all' | 'today' | 'week' | 'overdue' | 'upcoming') => void

  setActiveListId: (id: string | null) => void
  setScrollPosition: (position: number) => void

  // Utility
  reset: () => void
}

const initialState = {
  viewMode: 'dashboard' as ViewMode,
  groupBy: 'none' as GroupBy,
  sortBy: 'dueDate' as SortBy,
  searchQuery: '',

  selectedTaskIds: new Set<string>(),
  bulkActionMode: false,

  aiPanelWidth: 400,
  aiPanelCollapsed: false,
  sidebarWidth: 280,

  showCompleted: false,
  priorityFilter: null,
  dateFilter: 'all' as const,

  activeListId: null,
  scrollPosition: 0,
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setViewMode: (mode) => set({ viewMode: mode }),
      setGroupBy: (groupBy) => set({ groupBy }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      toggleTaskSelection: (taskId) => set((state) => {
        const newSelection = new Set(state.selectedTaskIds)
        if (newSelection.has(taskId)) {
          newSelection.delete(taskId)
        } else {
          newSelection.add(taskId)
        }
        return { selectedTaskIds: newSelection }
      }),

      selectAllTasks: (taskIds) => set({ selectedTaskIds: new Set(taskIds) }),

      clearSelection: () => set({ selectedTaskIds: new Set(), bulkActionMode: false }),

      setBulkActionMode: (enabled) => set({ bulkActionMode: enabled }),

      setAIPanelWidth: (width) => set({ aiPanelWidth: Math.max(300, Math.min(800, width)) }),

      toggleAIPanel: () => set((state) => ({ aiPanelCollapsed: !state.aiPanelCollapsed })),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      setShowCompleted: (show) => set({ showCompleted: show }),

      setPriorityFilter: (priorities) => set({ priorityFilter: priorities }),

      setDateFilter: (filter) => set({ dateFilter: filter }),

      setActiveListId: (id) => set({ activeListId: id }),

      setScrollPosition: (position) => set({ scrollPosition: position }),

      reset: () => set(initialState),
    }),
    {
      name: 'nexttaskpro-dashboard',
      partialize: (state) => ({
        viewMode: state.viewMode,
        groupBy: state.groupBy,
        sortBy: state.sortBy,
        aiPanelWidth: state.aiPanelWidth,
        aiPanelCollapsed: state.aiPanelCollapsed,
        sidebarWidth: state.sidebarWidth,
        showCompleted: state.showCompleted,
        dateFilter: state.dateFilter,
      }),
    }
  )
)
