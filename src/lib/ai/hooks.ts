import { useState, useCallback } from 'react'
import { FeatureType } from './types'

interface AIResponse {
  response: string
  model: string
  cost?: number
  cached: boolean
  tokensUsed?: {
    input: number
    output: number
  }
}

interface AIError {
  message: string
  code?: string
}

interface UseAIResult {
  response: string | null
  loading: boolean
  error: AIError | null
  sendMessage: (message: string, options?: AIOptions) => Promise<void>
  reset: () => void
}

interface AIOptions {
  feature?: FeatureType
  taskType?: string
  maxTokens?: number
}

export function useAI(): UseAIResult {
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AIError | null>(null)

  const sendMessage = useCallback(async (
    message: string, 
    options: AIOptions = {}
  ) => {
    if (!message.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          feature: options.feature ?? 'general',
          taskType: options.taskType ?? 'chat',
          maxTokens: options.maxTokens ?? 300,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'AI request failed')
      }

      const data: AIResponse = await res.json()
      setResponse(data.response)

    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        code: 'AI_REQUEST_FAILED',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResponse(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    response,
    loading,
    error,
    sendMessage,
    reset,
  }
}

// Specialized hook for task management
interface TaskAIResult {
  result: any | null
  loading: boolean
  error: AIError | null
  createTask: (input: string, context?: any) => Promise<any>
  breakdownTask: (description: string) => Promise<any[]>
  prioritizeTasks: (tasks: string[]) => Promise<any>
}

export function useTaskAI(): TaskAIResult {
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AIError | null>(null)

  const createTask = useCallback(async (input: string, context?: any) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/assistant/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          action: 'create',
          context,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Task creation failed')
      }

      const data = await res.json()
      setResult(data.result)
      return data.result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task creation failed'
      setError({ message: errorMessage, code: 'TASK_CREATION_FAILED' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const breakdownTask = useCallback(async (description: string) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/assistant/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Task breakdown failed')
      }

      const data = await res.json()
      setResult(data.tasks)
      return data.tasks

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task breakdown failed'
      setError({ message: errorMessage, code: 'TASK_BREAKDOWN_FAILED' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const prioritizeTasks = useCallback(async (tasks: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/assistant/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: tasks.join(', '),
          action: 'prioritize',
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Task prioritization failed')
      }

      const data = await res.json()
      setResult(data.result)
      return data.result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task prioritization failed'
      setError({ message: errorMessage, code: 'TASK_PRIORITIZATION_FAILED' })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    result,
    loading,
    error,
    createTask,
    breakdownTask,
    prioritizeTasks,
  }
}

// Hook for streaming responses (for longer AI interactions)
export function useAIStream() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AIError | null>(null)

  const streamMessage = useCallback(async (
    message: string,
    options: AIOptions = {}
  ) => {
    setLoading(true)
    setError(null)
    setContent('')

    try {
      const res = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          feature: options.feature ?? 'general',
          taskType: options.taskType ?? 'chat',
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Streaming failed')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        
        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                setContent(prev => prev + parsed.content)
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Streaming failed',
        code: 'STREAM_FAILED',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setContent('')
    setError(null)
    setLoading(false)
  }, [])

  return {
    content,
    loading,
    error,
    streamMessage,
    reset,
  }
}

// Utility hook for AI feature availability
export function useAIAvailability() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)

  const checkAvailability = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/ai/chat')
      const data = await res.json()
      setIsAvailable(data.status === 'healthy')
    } catch {
      setIsAvailable(false)
    } finally {
      setChecking(false)
    }
  }, [])

  return {
    isAvailable,
    checking,
    checkAvailability,
  }
}