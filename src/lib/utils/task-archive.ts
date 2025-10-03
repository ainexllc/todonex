/**
 * Task Auto-Archive Utility
 *
 * Automatically archives tasks that have been in the "Done" status
 * for more than 24 hours. Archived tasks are hidden from the main view
 * but can be accessed through an archive view.
 */

import type { Task, TaskList } from '@/types/task'

/**
 * Check if a task should be auto-archived
 * Tasks in "Done" status that were completed more than 24 hours ago are archived
 */
export function shouldArchiveTask(task: Task): boolean {
  // Don't archive if already archived
  if (task.archived) return false

  // Only archive completed tasks in "done" status
  if (task.status !== 'done' || !task.completed) return false

  // Must have a completion timestamp
  if (!task.completedAt) return false

  // Check if completed more than 24 hours ago
  const completedDate = new Date(task.completedAt)
  const now = new Date()
  const hoursSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60)

  return hoursSinceCompletion >= 24
}

/**
 * Archive tasks that meet the auto-archive criteria
 * Returns updated task list with archived tasks marked
 */
export function autoArchiveTasks(taskList: TaskList): TaskList {
  const updatedTasks = taskList.tasks.map(task => {
    if (shouldArchiveTask(task)) {
      return {
        ...task,
        archived: true,
        archivedAt: new Date()
      }
    }
    return task
  })

  return {
    ...taskList,
    tasks: updatedTasks
  }
}

/**
 * Filter out archived tasks from a task array
 */
export function filterArchivedTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => !task.archived)
}

/**
 * Get only archived tasks from a task array
 */
export function getArchivedTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.archived === true)
}

/**
 * Process all task lists and auto-archive eligible tasks
 */
export function autoArchiveAllLists(taskLists: TaskList[]): TaskList[] {
  return taskLists.map(list => autoArchiveTasks(list))
}
