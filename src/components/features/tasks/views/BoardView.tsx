'use client'

import { useMemo, useState } from 'react'
import { TaskCard, type Task } from '../../dashboard/TaskCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/task'
import { LIST_COLORS } from '@/lib/utils/list-colors'
import { Inbox, Plus } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface BoardViewProps {
  tasks: Task[]
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onTaskToggle?: (taskId: string, completed: boolean) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  listColorHex?: string
  className?: string
  onAddTask?: (status: TaskStatus) => void
}

interface BoardColumn {
  id: TaskStatus
  title: string
  description: string
}

const COLUMNS: BoardColumn[] = [
  {
    id: 'upcoming',
    title: 'Upcoming',
    description: 'Future tasks'
  },
  {
    id: 'today',
    title: 'Today',
    description: 'Tasks for today'
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Completed tasks'
  }
]

// Droppable Column Wrapper
interface DroppableColumnProps {
  id: TaskStatus
  children: React.ReactNode
  accentColor: string
}

function DroppableColumn({ id, children, accentColor }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className="flex-1 p-5 space-y-3 min-h-[300px] transition-all"
      style={{
        borderRadius: 'calc(var(--board-column-radius) - 12px)',
        background: isOver ? 'var(--board-column-bg)' : 'transparent',
        outline: isOver ? `2px dashed ${accentColor}` : 'none',
        boxShadow: isOver ? 'var(--board-column-hover-shadow)' : 'none'
      }}
    >
      {children}
    </div>
  )
}

// Draggable Task Card Wrapper
interface DraggableTaskCardProps {
  task: Task
  onToggleComplete?: (taskId: string, completed: boolean) => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onDelete?: (taskId: string) => void
}

function DraggableTaskCard({ task, onToggleComplete, onUpdate, onDelete }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        compact={false}
        onToggleComplete={onToggleComplete}
        onUpdate={onUpdate}
        onDelete={onDelete}
        showCompleteToggle={false}
        showCategories={false}
      />
    </div>
  )
}

export function BoardView({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  onStatusChange,
  listColorHex,
  className,
  onAddTask
}: BoardViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const accentBorder = listColorHex ?? 'var(--board-column-border)'
  const accentPillBorder = listColorHex ?? 'var(--board-pill-border)'

  // Setup sensors for drag and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Helper function to derive status from task data (for backward compatibility)
  const getTaskStatus = (task: Task): TaskStatus => {
    // If task has explicit status, use it
    if (task.status) return task.status

    // Otherwise, derive from other fields
    if (task.completed) return 'done'

    // Check if due today
    if (task.dueDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const due = new Date(task.dueDate)
      due.setHours(0, 0, 0, 0)

      if (due.getTime() === today.getTime()) {
        return 'today'
      }
    }

    return 'upcoming'
  }

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      today: [],
      upcoming: [],
      done: []
    }

    tasks.forEach(task => {
      const status = getTaskStatus(task)
      grouped[status].push(task)
    })

    return grouped
  }, [tasks])

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    // If status is being changed, call onStatusChange
    if (updates.status && onStatusChange) {
      onStatusChange(taskId, updates.status)
    }
    onTaskUpdate?.(taskId, updates)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTaskId = active.id as string
    const overId = over.id as string

    // Find which column the task was dropped on
    let newStatus: TaskStatus | null = null

    // Check if dropped directly on a column
    if (overId === 'upcoming' || overId === 'today' || overId === 'done') {
      newStatus = overId as TaskStatus
    } else {
      // If dropped on another task, find that task's column
      const overTask = tasks.find(t => t.id === overId)
      if (overTask) {
        newStatus = getTaskStatus(overTask)
      }
    }

    if (newStatus && onStatusChange) {
      onStatusChange(activeTaskId, newStatus)
    }
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
          <div
            className={cn('p-4 h-full', className)}
            style={{
              background: 'var(--board-background)',
              color: 'var(--board-text-strong)'
            }}
          >
        {/* 3-column Kanban layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {COLUMNS.map((column) => {
            const columnTasks = tasksByStatus[column.id] || []

            return (
              <SortableContext
                key={column.id}
                id={column.id}
                items={columnTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={cn(
                    'flex flex-col h-full overflow-hidden border',
                    'backdrop-blur-md'
                  )}
                  style={{
                    borderRadius: 'var(--board-column-radius)',
                    background: 'var(--board-column-bg)',
                    borderColor: accentBorder,
                    boxShadow: 'var(--board-column-shadow)'
                  }}
                >
                  {/* Column Header */}
                  <div
                    className="p-5 border-b"
                    style={{ borderColor: accentBorder }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="text-lg font-semibold drop-shadow-sm"
                        style={{ color: 'var(--board-heading-color)' }}
                      >
                        {column.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm"
                          style={{
                            background: 'var(--board-pill-bg)',
                            color: 'var(--board-pill-text)',
                            border: `1px solid ${accentPillBorder}`
                          }}
                        >
                          {columnTasks.length}
                        </span>
                        {onAddTask && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onAddTask(column.id)}
                            className="h-7 px-2 text-xs rounded-full border"
                            style={{
                              background: 'var(--board-action-bg)',
                              color: 'var(--board-action-text)',
                              borderColor: 'var(--board-action-border)'
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--board-text-muted)' }}
                    >
                      {column.description}
                    </p>
                  </div>

                  {/* Column Content - Droppable Area */}
                  <DroppableColumn id={column.id} accentColor={accentBorder}>
                    {columnTasks.length > 0 ? (
                      columnTasks.map((task) => (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={(taskId, completed) =>
                            onTaskToggle?.(taskId, completed)
                          }
                          onUpdate={(taskId, updates) =>
                            handleTaskUpdate(taskId, updates)
                          }
                          onDelete={(taskId) => onTaskDelete?.(taskId)}
                        />
                      ))
                    ) : (
                      /* Empty State - Droppable */
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className="w-24 h-24 flex items-center justify-center"
                            style={{
                              borderRadius: '0.75rem',
                              border: '2px dashed var(--board-column-border)',
                              background: 'var(--board-column-bg)'
                            }}
                          >
                            <Inbox className="w-12 h-12" strokeWidth={1.5} style={{ color: 'var(--board-icon-muted)' }} />
                          </div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--board-text-subtle)' }}
                          >
                            No tasks yet
                          </p>
                          {onAddTask && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onAddTask(column.id)}
                              className="h-8 px-3 text-xs rounded-full border"
                              style={{
                                background: 'var(--board-action-bg)',
                                color: 'var(--board-action-text)',
                                borderColor: 'var(--board-action-border)'
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Task
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </DroppableColumn>
                </div>
              </SortableContext>
            )
          })}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90">
            <TaskCard
              task={activeTask}
              compact={false}
              showCompleteToggle={false}
              showCategories={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
