import { xai } from '@ai-sdk/xai'
import { generateText, streamText } from 'ai'

// Grok model configuration
export const GROK_MODELS = {
  FAST: 'grok-4-fast',          // Primary fast model (Grok 4 Fast)
  BETA: 'grok-beta',            // Beta version
  VISION_BETA: 'grok-vision-beta', // Vision model
} as const

export type GrokModel = typeof GROK_MODELS[keyof typeof GROK_MODELS]

// Task complexity mapping for cost optimization
export type TaskComplexity = 'simple' | 'complex'

export interface GrokRequestConfig {
  taskType: string
  complexity: TaskComplexity
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  userMessage: string
  stream?: boolean
}

export interface GrokResponse {
  content: string
  model: GrokModel
  tokensUsed: {
    input: number
    output: number
  }
  cost: number
  cached: boolean
}

// Cost tracking per model (estimated - adjust based on actual xAI pricing)
const GROK_MODEL_COSTS = {
  [GROK_MODELS.FAST]: { input: 2.0, output: 8.0 }, // Estimated pricing per million tokens
  [GROK_MODELS.BETA]: { input: 1.5, output: 6.0 },
  [GROK_MODELS.VISION_BETA]: { input: 2.0, output: 8.0 },
}

class GrokClient {
  private apiKey: string | null = null

  /**
   * Lazy initialization of API key to prevent build-time errors
   */
  private getApiKey(): string {
    if (!this.apiKey) {
      if (!process.env.XAI_API_KEY) {
        throw new Error('XAI_API_KEY is required')
      }
      this.apiKey = process.env.XAI_API_KEY
    }
    return this.apiKey
  }

  /**
   * Smart model selection based on task complexity
   */
  private selectModel(config: GrokRequestConfig): GrokModel {
    // Use the fast model for all tasks as primary
    // Can be enhanced later based on performance and cost analysis
    return GROK_MODELS.FAST
  }

  /**
   * Calculate estimated cost for a request
   */
  private calculateCost(model: GrokModel, inputTokens: number, outputTokens: number): number {
    const costs = GROK_MODEL_COSTS[model]
    return ((inputTokens * costs.input) + (outputTokens * costs.output)) / 1_000_000
  }

  /**
   * Main method to send AI requests with cost optimization
   */
  async sendRequest(config: GrokRequestConfig): Promise<GrokResponse> {
    const model = this.selectModel(config)

    try {
      const messages = [
        ...(config.systemPrompt ? [{ role: 'system' as const, content: config.systemPrompt }] : []),
        { role: 'user' as const, content: config.userMessage }
      ]

      const result = await generateText({
        model: xai(model, {
          apiKey: this.getApiKey(),
        }),
        messages,
        maxTokens: config.maxTokens ?? 1000,
        temperature: config.temperature ?? 0.7,
      })

      // Calculate costs (rough estimation until we get actual usage data)
      const inputTokens = result.usage?.promptTokens ?? 0
      const outputTokens = result.usage?.completionTokens ?? 0
      const cost = this.calculateCost(model, inputTokens, outputTokens)

      return {
        content: result.text,
        model,
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
        },
        cost,
        cached: false,
      }
    } catch (error) {
      throw new Error(`Grok request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Streaming response for long-running requests
   */
  async *streamRequest(config: GrokRequestConfig): AsyncGenerator<string> {
    const model = this.selectModel(config)

    try {
      const messages = [
        ...(config.systemPrompt ? [{ role: 'system' as const, content: config.systemPrompt }] : []),
        { role: 'user' as const, content: config.userMessage }
      ]

      const result = await streamText({
        model: xai(model, {
          apiKey: this.getApiKey(),
        }),
        messages,
        maxTokens: config.maxTokens ?? 1000,
        temperature: config.temperature ?? 0.7,
      })

      for await (const delta of result.textStream) {
        yield delta
      }
    } catch (error) {
      throw new Error(`Grok streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    return GROK_MODEL_COSTS
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
export const grokClient = new GrokClient()
