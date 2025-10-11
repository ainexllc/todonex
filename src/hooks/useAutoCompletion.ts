/**
 * React hook for automatic task completion
 * Periodically checks for tasks due today and marks them as completed
 */

import { useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { autoCompleteTasksDueToday } from '@/lib/utils/auto-completion'

interface AutoCompletionResult {
  completedCount: number
  updatedLists: string[]
  errors: string[]
}

interface UseAutoCompletionOptions {
  // Interval in milliseconds (default: 30 minutes)
  checkInterval?: number
  // Whether to run check immediately on mount
  runImmediately?: boolean
  // Callback when tasks are auto-completed
  onAutoComplete?: (result: AutoCompletionResult) => void
  // Whether auto-completion is enabled
  enabled?: boolean
}

export function useAutoCompletion(options: UseAutoCompletionOptions = {}) {
  const {
    checkInterval = 30 * 60 * 1000, // 30 minutes default
    runImmediately = true,
    onAutoComplete,
    enabled = true
  } = options

  const { user } = useAuthStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckRef = useRef<number>(0)

  const runAutoCompletion = useCallback(async () => {
    if (!user || !enabled) return

    const now = Date.now()
    const timeSinceLastCheck = now - lastCheckRef.current

    // Prevent rapid successive calls (minimum 5 minutes between checks)
    if (timeSinceLastCheck < 5 * 60 * 1000 && lastCheckRef.current > 0) return

    try {
      lastCheckRef.current = now

      const result = await autoCompleteTasksDueToday()

      if (result.completedCount > 0) {
        onAutoComplete?.(result)
      }
    } catch (error) {
      void error
    }
  }, [user, enabled, onAutoComplete])

  // Set up periodic checks
  useEffect(() => {
    if (!enabled || !user) return

    // Run immediately if requested
    if (runImmediately) runAutoCompletion()

    // Set up interval for periodic checks
    intervalRef.current = setInterval(() => {
      runAutoCompletion()
    }, checkInterval)

    // Cleanup interval on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [user, enabled, checkInterval, runImmediately, runAutoCompletion])

  // Also run when user becomes active (e.g., returns to tab)
  useEffect(() => {
    if (!enabled || !user) return

    const handleVisibilityChange = () => {
      if (!document.hidden) runAutoCompletion()
    }

    const handleFocus = () => {
      runAutoCompletion()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, enabled, runAutoCompletion])

  // Return manual trigger function for external use
  return {
    runAutoCompletion,
    isEnabled: enabled && !!user
  }
}
