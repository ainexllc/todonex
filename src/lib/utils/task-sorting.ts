/**
 * Utility functions for intelligent task sorting
 */

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: Date | string
  priority?: 'low' | 'medium' | 'high'
}

/**
 * Get the sort priority for a task based on its due date
 * Lower numbers = higher priority (shown first)
 */
export function getTaskSortPriority(task: Task): number {
  if (task.completed) return 1000 // Completed tasks always last

  if (!task.dueDate) return 900 // No due date tasks near the end

  // Ensure we have a valid Date object
  const dueDate = new Date(task.dueDate)

  // Check if the date is valid
  if (isNaN(dueDate.getTime())) {
    console.warn('Invalid date in getTaskSortPriority:', task.dueDate)
    return 900 // Treat as no due date
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  const diffDays = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Overdue tasks have highest priority
  if (diffDays < 0) return -1000 + diffDays // More overdue = higher priority

  // Today's tasks
  if (diffDays === 0) return 1

  // Tomorrow's tasks
  if (diffDays === 1) return 2

  // This week (next 7 days)
  if (diffDays <= 7) return 10 + diffDays

  // Future tasks
  return 100 + Math.min(diffDays, 365)
}

/**
 * Sort tasks intelligently by due date and priority
 */
export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityA = getTaskSortPriority(a)
    const priorityB = getTaskSortPriority(b)

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // If same date priority, sort by task priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const taskPriorityA = priorityOrder[a.priority || 'medium']
    const taskPriorityB = priorityOrder[b.priority || 'medium']

    if (taskPriorityA !== taskPriorityB) {
      return taskPriorityA - taskPriorityB
    }

    // Finally, sort alphabetically by title
    return a.title.localeCompare(b.title)
  })
}

/**
 * Get a color class for a task based on its due date
 */
export function getDueDateColorClass(dueDate?: Date | string): string {
  if (!dueDate) return ''

  // Ensure we have a valid Date object
  const due = new Date(dueDate)

  // Check if the date is valid
  if (isNaN(due.getTime())) {
    console.warn('Invalid date provided to getDueDateColorClass:', dueDate)
    return ''
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-red-500' // Overdue
  if (diffDays === 0) return 'text-orange-500' // Due today
  if (diffDays === 1) return 'text-yellow-500' // Due tomorrow
  if (diffDays <= 7) return 'text-blue-400' // This week
  return 'text-gray-400' // Future
}

/**
 * Format a due date for compact display in sidebar
 */
export function formatCompactDueDate(dueDate?: Date | string): string {
  if (!dueDate) return ''

  // Ensure we have a valid Date object
  const due = new Date(dueDate)

  // Check if the date is valid
  if (isNaN(due.getTime())) {
    console.warn('Invalid date provided to formatCompactDueDate:', dueDate)
    return ''
  }

  // Format as MM/DD
  const month = due.getMonth() + 1 // getMonth() returns 0-11
  const day = due.getDate()
  return `${month}/${day}`
}