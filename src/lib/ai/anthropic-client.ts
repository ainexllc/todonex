import Anthropic from '@anthropic-ai/sdk'

// Cost-optimized model selection
export const AI_MODELS = {
  HAIKU: 'claude-3-haiku-20240307',          // $0.25/$1.25 per M tokens - Primary model
  SONNET_3_5: 'claude-3-5-sonnet-20241022', // $3/$15 per M tokens - Complex tasks only
} as const

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS]

// Task complexity mapping for cost optimization
export type TaskComplexity = 'simple' | 'complex'

export interface AIRequestConfig {
  taskType: string
  complexity: TaskComplexity
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  userMessage: string
  stream?: boolean
}

export interface AIResponse {
  content: string
  model: AIModel
  tokensUsed: {
    input: number
    output: number
  }
  cost: number
  cached: boolean
}

// Cost tracking per model (per million tokens)
const MODEL_COSTS = {
  [AI_MODELS.HAIKU]: { input: 0.25, output: 1.25 },
  [AI_MODELS.SONNET_3_5]: { input: 3, output: 15 },
}

// Tasks that require complex reasoning (Sonnet 3.5)
const COMPLEX_TASKS = [
  'financial-analysis',
  'meal-planning-complex',
  'workflow-automation',
  'deep-content-analysis'
]

class AnthropicClient {
  private client: Anthropic | null = null

  /**
   * Lazy initialization of Anthropic client to prevent build-time errors
   */
  private getClient(): Anthropic {
    if (!this.client) {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is required')
      }

      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      })
    }
    return this.client
  }

  /**
   * Smart model selection based on task complexity
   */
  private selectModel(config: AIRequestConfig): AIModel {
    // Force complex tasks to use Sonnet 3.5
    if (config.complexity === 'complex' || COMPLEX_TASKS.includes(config.taskType)) {
      return AI_MODELS.SONNET_3_5
    }

    // Default to Haiku for cost efficiency
    return AI_MODELS.HAIKU
  }

  /**
   * Calculate estimated cost for a request
   */
  private calculateCost(model: AIModel, inputTokens: number, outputTokens: number): number {
    const costs = MODEL_COSTS[model]
    return ((inputTokens * costs.input) + (outputTokens * costs.output)) / 1_000_000
  }

  /**
   * Get optimized configuration for model
   */
  private getModelConfig(model: AIModel, config: AIRequestConfig) {
    const baseConfig = {
      model,
      temperature: config.temperature ?? 0.3,
      system: config.systemPrompt,
    }

    // Haiku optimizations for cost
    if (model === AI_MODELS.HAIKU) {
      return {
        ...baseConfig,
        max_tokens: Math.min(config.maxTokens ?? 300, 500), // Limit Haiku responses
        temperature: 0.2, // Lower temperature for more predictable responses
      }
    }

    // Sonnet 3.5 configuration
    return {
      ...baseConfig,
      max_tokens: config.maxTokens ?? 1000,
      temperature: config.temperature ?? 0.7,
    }
  }

  /**
   * Main method to send AI requests with cost optimization
   */
  async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const model = this.selectModel(config)
    const modelConfig = this.getModelConfig(model, config)

    try {
      const messages = [
        {
          role: 'user' as const,
          content: config.userMessage,
        },
      ]

      const response = await this.getClient().messages.create({
        ...modelConfig,
        messages,
      })

      // Extract content
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join(' ')

      // Calculate costs
      const inputTokens = response.usage?.input_tokens ?? 0
      const outputTokens = response.usage?.output_tokens ?? 0
      const cost = this.calculateCost(model, inputTokens, outputTokens)

      return {
        content,
        model,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
        },
        cost,
        cached: false,
      }
    } catch (error) {
      throw new Error(`AI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Streaming response for long-running requests
   */
  async *streamRequest(config: AIRequestConfig): AsyncGenerator<string> {
    const model = this.selectModel(config)
    const modelConfig = this.getModelConfig(model, config)

    try {
      const messages = [
        {
          role: 'user' as const,
          content: config.userMessage,
        },
      ]

      const stream = await this.getClient().messages.create({
        ...modelConfig,
        messages,
        stream: true,
      })

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text
        }
      }
    } catch (error) {
      throw new Error(`AI streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Quick helper for simple text completions
   */
  async complete(
    prompt: string, 
    options: {
      taskType?: string
      maxTokens?: number
      systemPrompt?: string
    } = {}
  ): Promise<string> {
    const response = await this.sendRequest({
      taskType: options.taskType ?? 'general',
      complexity: 'simple',
      userMessage: prompt,
      maxTokens: options.maxTokens,
      systemPrompt: options.systemPrompt,
    })

    return response.content
  }

  /**
   * Get model costs for monitoring
   */
  getModelCosts() {
    return MODEL_COSTS
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.complete('Hello', { maxTokens: 10 })
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const anthropicClient = new AnthropicClient()
