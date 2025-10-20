import { xai } from '@ai-sdk/xai'
import { generateText, generateObject, streamText } from 'ai'

// x.ai models configuration
export const XAI_MODELS = {
  GROK_FAST: 'grok-4-fast',                // Fast, cost-effective model (Grok 4 Fast)
  GROK_BETA: 'grok-beta',                 // Latest beta features
  GROK_VISION: 'grok-vision-beta',        // Vision capabilities
} as const

export type XAIModel = typeof XAI_MODELS[keyof typeof XAI_MODELS]

// Task complexity mapping for model selection
export type TaskComplexity = 'simple' | 'complex'

// Cost tracking per model (per million tokens) - x.ai pricing
const MODEL_COSTS = {
  [XAI_MODELS.GROK_FAST]: { input: 0.10, output: 0.40 },    // $0.10/$0.40 per M tokens
  [XAI_MODELS.GROK_BETA]: { input: 0.50, output: 1.50 },    // $0.50/$1.50 per M tokens
  [XAI_MODELS.GROK_VISION]: { input: 0.50, output: 1.50 },  // $0.50/$1.50 per M tokens
}

// Tasks that require complex reasoning or vision
const COMPLEX_TASKS = [
  'financial-analysis',
  'meal-planning-complex',
  'workflow-automation',
  'deep-content-analysis',
  'image-analysis'
]

const VISION_TASKS = [
  'image-description',
  'visual-analysis',
  'screenshot-analysis'
]

export interface XAIRequestConfig {
  taskType: string
  complexity: TaskComplexity
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  userMessage: string
  stream?: boolean
  imageUrl?: string  // For vision tasks
}

export interface XAIResponse {
  content: string
  model: XAIModel
  tokensUsed: {
    input: number
    output: number
  }
  cost: number
  cached: boolean
}

class XAIClient {
  private model: XAIModel

  constructor() {
    if (!process.env.XAI_API_KEY) {
      throw new Error('XAI_API_KEY is required')
    }

    // Default to the fast model as requested
    this.model = XAI_MODELS.GROK_FAST
  }

  /**
   * Smart model selection based on task complexity and type
   */
  private selectModel(config: XAIRequestConfig): XAIModel {
    // Vision tasks require vision model
    if (config.imageUrl || VISION_TASKS.includes(config.taskType)) {
      return XAI_MODELS.GROK_VISION
    }

    // Complex tasks use beta model
    if (config.complexity === 'complex' || COMPLEX_TASKS.includes(config.taskType)) {
      return XAI_MODELS.GROK_BETA
    }

    // Default to fast model for speed and cost efficiency
    return XAI_MODELS.GROK_FAST
  }

  /**
   * Calculate estimated cost for a request
   */
  private calculateCost(model: XAIModel, inputTokens: number, outputTokens: number): number {
    const costs = MODEL_COSTS[model]
    return ((inputTokens * costs.input) + (outputTokens * costs.output)) / 1_000_000
  }

  /**
   * Get optimized configuration for model
   */
  private getModelConfig(model: XAIModel, config: XAIRequestConfig) {
    const baseConfig = {
      model: xai(model),
      temperature: config.temperature ?? 0.3,
      system: config.systemPrompt,
    }

    // Vision model configuration
    if (model === XAI_MODELS.GROK_VISION && config.imageUrl) {
      return {
        ...baseConfig,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: config.userMessage },
              { type: 'image', image: config.imageUrl }
            ]
          }
        ]
      }
    }

    // Standard text configuration
    return {
      ...baseConfig,
      messages: [
        {
          role: 'user',
          content: config.userMessage
        }
      ]
    }
  }

  /**
   * Main method to send AI requests with cost optimization
   */
  async sendRequest(config: XAIRequestConfig): Promise<XAIResponse> {
    const model = this.selectModel(config)
    const modelConfig = this.getModelConfig(model, config)

    try {
      const response = await generateText(modelConfig as any)

      // Calculate costs based on usage
      const inputTokens = response.usage?.promptTokens ?? 0
      const outputTokens = response.usage?.completionTokens ?? 0
      const cost = this.calculateCost(model, inputTokens, outputTokens)

      return {
        content: response.text,
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
  async *streamRequest(config: XAIRequestConfig): AsyncGenerator<string> {
    const model = this.selectModel(config)
    const modelConfig = this.getModelConfig(model, config)

    try {
      const result = await streamText(modelConfig as any)

      for await (const delta of result.textStream) {
        yield delta
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

  /**
   * Get available models
   */
  getAvailableModels(): XAIModel[] {
    return Object.values(XAI_MODELS)
  }
}

// Singleton instance
export const xaiClient = new XAIClient()
