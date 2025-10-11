import { NextRequest, NextResponse } from 'next/server'
import { unifiedAIClient } from '@/lib/ai/unified-client'
import { aiCache, templateCache } from '@/lib/ai/cache'

interface TaskCreationRequest {
  input: string
  action: 'create' | 'prioritize' | 'breakdown' | 'suggest_due_date'
  context?: {
    existingTasks?: any[]
    userPreferences?: any
  }
}

const TASK_SYSTEM_PROMPT = `You are a task management assistant. Always respond with valid JSON only.

For task creation, return a JSON object with:
- title: Clear, actionable task name (required)
- description: Brief details (optional, can be empty string)
- priority: "high", "medium", or "low" (required)
- suggestedDueDate: ISO date string or null (optional)

Example: {"title": "Buy groceries", "description": "", "priority": "medium", "suggestedDueDate": null}

Always return only valid JSON, no other text.`

export async function POST(req: NextRequest) {
  try {
    const body: TaskCreationRequest = await req.json()
    const { input, action, context } = body

    if (!input || input.length > 1000) {
      return NextResponse.json(
        { error: 'Invalid input (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Try template first for common operations
    let prompt = input
    if (action === 'create') {
      const template = templateCache.get('create_simple_task', input)
      if (template) prompt = template
    } else if (action === 'prioritize') {
      const template = templateCache.get('prioritize_tasks', input)
      if (template) prompt = template
    }

    // Add context if provided
    let fullPrompt = prompt
    if (context?.existingTasks?.length) {
      fullPrompt += `\n\nExisting tasks for context: ${JSON.stringify(context.existingTasks.slice(0, 5))}`
    }

    // Check cache
    const cached = aiCache.get(fullPrompt, 'claude-3-haiku-20240307', TASK_SYSTEM_PROMPT, 400)
    if (cached) {
      return NextResponse.json({
        result: JSON.parse(cached.response),
        cached: true,
        cost: 0,
      })
    }

    // AI request with Haiku for cost efficiency
    const response = await unifiedAIClient.sendRequest({
      taskType: `task_${action}`,
      complexity: 'simple',
      userMessage: fullPrompt,
      systemPrompt: TASK_SYSTEM_PROMPT,
      maxTokens: 400,
      temperature: 0.2, // Lower temperature for consistent task formatting
    })

    // Parse response
    let result
    try {
      result = JSON.parse(response.content)
    } catch {
      // Fallback if not valid JSON
      result = {
        title: response.content.trim(),
        priority: 'medium',
        description: '',
        suggestedDueDate: null
      }
    }

    // Cache the response
    aiCache.set(
      fullPrompt,
      response.model,
      JSON.stringify(result),
      response.cost,
      60, // Cache for 1 hour
      TASK_SYSTEM_PROMPT,
      400
    )

    return NextResponse.json({
      result,
      model: response.model,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      cached: false,
    })

  } catch (error) {
    void error
    return NextResponse.json(
      { error: 'Task AI service unavailable' },
      { status: 500 }
    )
  }
}

// Batch task creation endpoint
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { description } = body

    if (!description || description.length > 2000) {
      return NextResponse.json(
        { error: 'Invalid description (max 2000 characters)' },
        { status: 400 }
      )
    }

    const batchPrompt = `Break this request into individual, actionable tasks and respond with ONLY valid JSON:

"${description}"

Return a JSON array with each task having:
- title: Clear, actionable task name (required)
- description: Brief details (optional)
- priority: "high", "medium", or "low"
- category: "personal", "work", "home", or "other"

Example format:
[{"title": "Task 1", "description": "Details", "priority": "medium", "category": "personal"}]

Maximum 8 tasks. Return only the JSON array, no other text.`

    const response = await unifiedAIClient.sendRequest({
      taskType: 'task_breakdown',
      complexity: 'simple',
      userMessage: batchPrompt,
      systemPrompt: TASK_SYSTEM_PROMPT,
      maxTokens: 800,
      temperature: 0.3,
    })

    let tasks
    try {
      tasks = JSON.parse(response.content)
      if (!Array.isArray(tasks)) {
        tasks = [tasks]
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tasks,
      count: tasks.length,
      model: response.model,
      cost: response.cost,
    })

  } catch (error) {
    void error
    return NextResponse.json(
      { error: 'Batch task creation failed' },
      { status: 500 }
    )
  }
}
