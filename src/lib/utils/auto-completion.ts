/**
 * Auto-completion utility for tasks due today
 * Automatically marks tasks as completed when their due date matches today's date
 */

import { normalizeDate } from './date'
import { updateDocument, getUserDocuments } from '../firebase-data'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  category?: string
  completedAt?: Date
}

interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
  updatedAt?: Date
}

/**
 * Check if a date matches today's date (ignoring time)
 */
function isDueToday(dueDate: Date | null | undefined): boolean {
  if (!dueDate) return false

  const dueDateObj = normalizeDate(dueDate)
  if (!dueDateObj) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDateNormalized = new Date(dueDateObj)
  dueDateNormalized.setHours(0, 0, 0, 0)

  return dueDateNormalized.toDateString() === today.toDateString()
}

/**
 * Auto-complete tasks that are due today
 * Returns the number of tasks that were automatically completed
 */
export async function autoCompleteTasksDueToday(): Promise<{
  completedCount: number
  updatedLists: string[]
  errors: string[]
}> {
  const result = {
    completedCount: 0,
    updatedLists: [] as string[],
    errors: [] as string[]
  }

  try {
    // Get all task lists for the current user
    const taskLists = await getUserDocuments<TaskList>('taskLists', 'updatedAt')

    if (!taskLists.length) {
      return result
    }

    // Process each task list
    for (const taskList of taskLists) {
      let hasUpdates = false
      const updatedTasks = taskList.tasks.map(task => {
        // Skip if already completed or no due date
        if (task.completed || !task.dueDate) {
          return task
        }

        // Check if task is due today
        if (isDueToday(task.dueDate)) {
          hasUpdates = true
          result.completedCount++

          return {
            ...task,
            completed: true,
            completedAt: new Date()
          }
        }

        return task
      })

      // Update the task list if there were changes
      if (hasUpdates) {
        try {
          // Prepare tasks for Firebase (convert Date objects to ISO strings)
          const tasksForFirebase = updatedTasks.map((task: Task) => {
            const firebaseTask: any = {
              ...task,
              completedAt: task.completedAt ? task.completedAt.toISOString() : null
            }
            // Only add dueDate if it exists (Firebase doesn't accept undefined)
            if (task.dueDate) {
              firebaseTask.dueDate = task.dueDate.toISOString()
            }
            return firebaseTask
          })

          await updateDocument('taskLists', taskList.id, {
            tasks: tasksForFirebase,
            updatedAt: new Date()
          })

          result.updatedLists.push(taskList.title)
        } catch (error) {
          const errorMsg = `Failed to update task list "${taskList.title}": ${error instanceof Error ? error.message : String(error)}`
          result.errors.push(errorMsg)
        }
      }
    }

  } catch (error) {
    const errorMsg = `Auto-completion failed: ${error instanceof Error ? error.message : String(error)}`
    result.errors.push(errorMsg)
  }

  return result
}

/**
 * Get tasks that are due today (for preview/debugging)
 */
export async function getTasksDueToday(): Promise<{
  taskLists: Array<{
    listTitle: string
    tasks: Array<{
      title: string
      dueDate: Date
      completed: boolean
    }>
  }>
}> {
  const result = {
    taskLists: [] as Array<{
      listTitle: string
      tasks: Array<{
        title: string
        dueDate: Date
        completed: boolean
      }>
    }>
  }

  try {
    const taskLists = await getUserDocuments<TaskList>('taskLists', 'updatedAt')

    for (const taskList of taskLists) {
      const tasksDueToday = taskList.tasks.filter(task =>
        task.dueDate && isDueToday(task.dueDate)
      )

      if (tasksDueToday.length > 0) {
        result.taskLists.push({
          listTitle: taskList.title,
          tasks: tasksDueToday.map(task => ({
            title: task.title,
            dueDate: task.dueDate!,
            completed: task.completed
          }))
        })
      }
    }
  } catch (error) {
    void error
  }

  return result
}
