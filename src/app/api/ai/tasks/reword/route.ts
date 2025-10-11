import { NextRequest, NextResponse } from 'next/server'
import { unifiedAIClient } from '@/lib/ai/unified-client'

// Rate limiting store (in production, use Redis)
const rateLimits = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
  return `reword_limit:${ip}`
}

function checkRateLimit(key: string, limit: number = 30): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  
  const current = rateLimits.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

interface TaskRewordRequest {
  title: string
  description?: string
  subtasks?: string[]
  context?: {
    priority?: string
    category?: string
  }
}

const TASK_REWORD_PROMPT = `You are a professional task management expert who helps rewrite tasks to be more professional, clear, and actionable.

Task Content to Reword:
- Title: "{title}"
{description}
{subtasks}

Please rewrite this task content to be:
- More professional and business-appropriate
- Clearer and more actionable
- Better structured and organized
- Free of casual language or typos
- Focused on outcomes and deliverables

Respond with valid JSON only:
{
  "title": "Professional, actionable task title",
  "description": "Clear, professional description that explains the what, why, and expected outcome",
  "subtasks": [
    "Professional subtask 1",
    "Professional subtask 2"
  ]
}

Guidelines:
- Keep the core meaning and intent
- Use professional business language
- Make titles start with action verbs when possible
- Ensure descriptions explain value and context
- Break complex ideas into clear, actionable subtasks
- Remove unnecessary words while maintaining clarity
- Use consistent terminology throughout`

export async function POST(request: NextRequest) {
  try {
    // Validate API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      )
    }

    // Check rate limit
    const rateLimitKey = getRateLimitKey(request)
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body: TaskRewordRequest = await request.json()
    
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      )
    }

    const taskTitle = body.title.trim()
    if (taskTitle.length === 0) {
      return NextResponse.json(
        { error: 'Task title cannot be empty' },
        { status: 400 }
      )
    }

    // Build the prompt with task content
    let prompt = TASK_REWORD_PROMPT.replace('{title}', taskTitle)
    
    // Add description if provided
    const descriptionText = body.description?.trim() 
      ? `- Description: "${body.description.trim()}"` 
      : ''
    prompt = prompt.replace('{description}', descriptionText)
    
    // Add subtasks if provided
    const subtasksText = body.subtasks && body.subtasks.length > 0 
      ? `- Subtasks:\n${body.subtasks.map((st, i) => `  ${i + 1}. ${st}`).join('\n')}`
      : ''
    prompt = prompt.replace('{subtasks}', subtasksText)

    // Use Claude Haiku for cost efficiency - this is a simple rewriting task
    const startTime = Date.now()
    
    const response = await unifiedAIClient.sendRequest({
      taskType: 'task-reword',
      complexity: 'simple',
      userMessage: prompt,
      maxTokens: 800,
      temperature: 0.3 // Lower temperature for more consistent professional output
    })

    const responseTime = Date.now() - startTime

    // Parse the JSON response
    let rewordedTask
    try {
      // Clean the response to extract JSON
      const jsonText = response.content.trim()
      const jsonStart = jsonText.indexOf('{')
      const jsonEnd = jsonText.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON found in response')
      }
      
      const cleanJson = jsonText.substring(jsonStart, jsonEnd)
      rewordedTask = JSON.parse(cleanJson)
    } catch (parseError) {
      void parseError
      // Fallback to basic professional formatting
      rewordedTask = createFallbackReword(body)
    }

    // Validate and clean the response
    const validatedTask = validateRewordedTask(rewordedTask, body)

    return NextResponse.json({
      ...validatedTask,
      _meta: {
        model: response.model,
        responseTime,
        inputTokens: response.tokensUsed.input,
        outputTokens: response.tokensUsed.output,
        cost: response.cost,
        cached: response.cached
      }
    })

  } catch (error: any) {
    void error
    // Return fallback reword on error
    try {
      const body: TaskRewordRequest = await request.json()
      const fallback = createFallbackReword(body)
      
      return NextResponse.json({
        ...fallback,
        _meta: {
          model: 'fallback',
          error: 'AI temporarily unavailable',
          cost: 0
        }
      })
    } catch {
      return NextResponse.json(
        { error: 'Failed to reword task' },
        { status: 500 }
      )
    }
  }
}

function createFallbackReword(task: TaskRewordRequest) {
  // Basic professional formatting as fallback
  const title = task.title
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  const description = task.description 
    ? task.description.trim().charAt(0).toUpperCase() + task.description.slice(1).toLowerCase()
    : ''
  
  const subtasks = task.subtasks 
    ? task.subtasks.map(st => 
        st.trim().charAt(0).toUpperCase() + st.slice(1).toLowerCase()
      )
    : []
  
  return {
    title: title.startsWith('Complete') || title.startsWith('Create') || title.startsWith('Review')
      ? title
      : `Complete ${title}`,
    description: description || `Execute this task with professional standards and attention to detail.`,
    subtasks
  }
}

function validateRewordedTask(rewordedTask: any, original: TaskRewordRequest) {
  // Ensure the response has valid structure and fallback to originals if needed
  return {
    title: typeof rewordedTask.title === 'string' && rewordedTask.title.trim().length > 0
      ? rewordedTask.title.trim()
      : original.title,
    description: typeof rewordedTask.description === 'string' && rewordedTask.description.trim().length > 0
      ? rewordedTask.description.trim()
      : (original.description || ''),
    subtasks: Array.isArray(rewordedTask.subtasks) 
      ? rewordedTask.subtasks
          .filter((st: any) => typeof st === 'string' && st.trim().length > 0)
          .map((st: string) => st.trim())
          .slice(0, 8) // Limit to 8 subtasks
      : (original.subtasks || [])
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'task-reword',
    model: AI_MODELS.HAIKU,
    timestamp: new Date().toISOString()
  })
}
