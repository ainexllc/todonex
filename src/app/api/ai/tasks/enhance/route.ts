import { NextRequest, NextResponse } from 'next/server'
import { unifiedAIClient } from '@/lib/ai/unified-client'

// Rate limiting store (in production, use Redis)
const rateLimits = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
  return `enhance_limit:${ip}`
}

function checkRateLimit(key: string, limit: number = 20): boolean {
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

interface TaskEnhanceRequest {
  title: string
  context?: {
    currentDescription?: string
    currentPriority?: string
    userHistory?: any[]
    currentWorkload?: any[]
  }
}

const TASK_ENHANCEMENT_PROMPT = `You are a task management expert that helps users create better, more actionable tasks. 

Analyze the given task title and provide helpful enhancements. Respond with valid JSON only.

For the task: "{title}"

Provide a JSON response with:
{
  "subtasks": [
    {"title": "specific actionable subtask", "selected": true}
  ],
  "scheduling": {
    "estimatedDuration": "realistic time estimate",
    "bestTimeOfDay": "optimal time to work on this",
    "suggestedDueDate": "YYYY-MM-DD format if applicable"
  },
  "priority": {
    "level": "low|medium|high",
    "reasoning": "brief explanation for priority recommendation"
  },
  "strategies": [
    "specific actionable tip for success"
  ],
  "risks": [
    "potential challenge or blocker"
  ],
  "category": "suggested category if applicable"
}

Guidelines:
- Make subtasks specific and actionable
- Keep strategies practical and relevant
- Suggest realistic time estimates
- Only include applicable fields
- Be concise but helpful
- Focus on productivity and success`

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

    const body: TaskEnhanceRequest = await request.json()
    
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

    // Use Claude Haiku for cost efficiency
    const startTime = Date.now()
    
    const prompt = TASK_ENHANCEMENT_PROMPT.replace('{title}', taskTitle)
    
    const response = await unifiedAIClient.sendRequest({
      taskType: 'task-enhancement',
      complexity: 'simple',
      userMessage: prompt,
      maxTokens: 1000,
      temperature: 0.7
    })

    const responseTime = Date.now() - startTime

    // Parse the JSON response
    let enhancement
    try {
      // Clean the response to extract JSON
      const jsonText = response.content.trim()
      const jsonStart = jsonText.indexOf('{')
      const jsonEnd = jsonText.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON found in response')
      }
      
      const cleanJson = jsonText.substring(jsonStart, jsonEnd)
      enhancement = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.content)
      
      // Fallback enhancement based on task title analysis
      enhancement = createFallbackEnhancement(taskTitle)
    }

    // Validate and clean the enhancement
    const validatedEnhancement = validateEnhancement(enhancement)

    return NextResponse.json({
      ...validatedEnhancement,
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
    console.error('Task enhancement error:', error)
    
    // Return fallback enhancement on error
    try {
      const body: TaskEnhanceRequest = await request.json()
      const fallback = createFallbackEnhancement(body.title || 'Task')
      
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
        { error: 'Failed to enhance task' },
        { status: 500 }
      )
    }
  }
}

function createFallbackEnhancement(title: string) {
  // Simple keyword-based fallback
  const lowerTitle = title.toLowerCase()
  
  let priority: 'low' | 'medium' | 'high' = 'medium'
  let estimatedDuration = '1-2 hours'
  
  // Priority detection
  if (lowerTitle.includes('urgent') || lowerTitle.includes('asap') || lowerTitle.includes('deadline')) {
    priority = 'high'
  } else if (lowerTitle.includes('someday') || lowerTitle.includes('maybe') || lowerTitle.includes('explore')) {
    priority = 'low'
  }
  
  // Duration estimation
  if (lowerTitle.includes('quick') || lowerTitle.includes('brief') || lowerTitle.includes('check')) {
    estimatedDuration = '15-30 minutes'
  } else if (lowerTitle.includes('project') || lowerTitle.includes('plan') || lowerTitle.includes('prepare')) {
    estimatedDuration = '2-4 hours'
  }
  
  return {
    subtasks: [],
    scheduling: {
      estimatedDuration,
      bestTimeOfDay: 'morning',
      suggestedDueDate: ''
    },
    priority: {
      level: priority,
      reasoning: `Based on task keywords, this appears to be ${priority} priority.`
    },
    strategies: [
      'Break the task into smaller steps',
      'Set a clear completion criteria',
      'Block time on your calendar'
    ],
    risks: [
      'Task scope might be unclear',
      'May need additional information'
    ],
    category: ''
  }
}

function validateEnhancement(enhancement: any) {
  // Ensure the response has the correct structure
  return {
    subtasks: Array.isArray(enhancement.subtasks) ? enhancement.subtasks.slice(0, 5) : [],
    scheduling: {
      estimatedDuration: typeof enhancement.scheduling?.estimatedDuration === 'string' 
        ? enhancement.scheduling.estimatedDuration 
        : '1-2 hours',
      bestTimeOfDay: typeof enhancement.scheduling?.bestTimeOfDay === 'string' 
        ? enhancement.scheduling.bestTimeOfDay 
        : 'morning',
      suggestedDueDate: typeof enhancement.scheduling?.suggestedDueDate === 'string' 
        ? enhancement.scheduling.suggestedDueDate 
        : ''
    },
    priority: {
      level: ['low', 'medium', 'high'].includes(enhancement.priority?.level) 
        ? enhancement.priority.level 
        : 'medium',
      reasoning: typeof enhancement.priority?.reasoning === 'string' 
        ? enhancement.priority.reasoning 
        : 'Standard priority task'
    },
    strategies: Array.isArray(enhancement.strategies) 
      ? enhancement.strategies.slice(0, 4) 
      : [],
    risks: Array.isArray(enhancement.risks) 
      ? enhancement.risks.slice(0, 3) 
      : [],
    category: typeof enhancement.category === 'string' 
      ? enhancement.category 
      : ''
  }
}


// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'task-enhancement',
    model: AI_MODELS.HAIKU,
    timestamp: new Date().toISOString()
  })
}