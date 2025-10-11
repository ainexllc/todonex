import { NextRequest, NextResponse } from 'next/server'
import { unifiedAIClient } from '@/lib/ai/unified-client'
import { aiCache, shouldCache, getCacheDuration } from '@/lib/ai/cache'
import { FeatureType, SYSTEM_PROMPTS } from '@/lib/ai/types'

// Rate limiting store (in production, use Redis)
const rateLimits = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
  return `rate_limit:${ip}`
}

function checkRateLimit(key: string, limit: number = 60): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, feature = 'general', taskType = 'chat', maxTokens = 300 } = body

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitKey = getRateLimitKey(req)
    if (!checkRateLimit(rateLimitKey, 20)) { // 20 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const featureType = feature as FeatureType
    const systemPrompt = SYSTEM_PROMPTS[featureType]

    // Check cache first
    const cacheEnabled = shouldCache(featureType, taskType)
    let cachedResponse = null
    
    if (cacheEnabled) {
      cachedResponse = aiCache.get(message, 'claude-3-haiku-20240307', systemPrompt, maxTokens)
      if (cachedResponse) {
        return NextResponse.json({
          response: cachedResponse.response,
          model: cachedResponse.model,
          cached: true,
          cost: 0, // No cost for cached responses
        })
      }
    }

    // Make AI request
    const aiResponse = await unifiedAIClient.sendRequest({
      taskType,
      complexity: 'simple',
      userMessage: message,
      systemPrompt,
      maxTokens,
      temperature: 0.3,
    })

    // Cache response if enabled
    if (cacheEnabled) {
      const cacheDuration = getCacheDuration(featureType)
      aiCache.set(
        message,
        aiResponse.model,
        aiResponse.content,
        aiResponse.cost,
        cacheDuration,
        systemPrompt,
        maxTokens
      )
    }

    return NextResponse.json({
      response: aiResponse.content,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost,
      cached: false,
    })

  } catch (error) {
    void error
    return NextResponse.json(
      { error: 'AI service temporarily unavailable' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  try {
    const healthStatus = await unifiedAIClient.healthCheck()
    const cacheStats = aiCache.getStats()

    return NextResponse.json({
      status: healthStatus.overall ? 'healthy' : 'unhealthy',
      providers: healthStatus,
      cache: cacheStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Health check failed' },
      { status: 503 }
    )
  }
}
