import { grokClient, GrokRequestConfig, GrokResponse } from './grok-client'
import { anthropicClient, AIRequestConfig, AIResponse } from './anthropic-client'

// Unified model types
export const UNIFIED_MODELS = {
  // Primary models (Grok)
  GROK_FAST: 'grok-2-1212',
  GROK_BETA: 'grok-beta',
  // Fallback models (Anthropic)
  CLAUDE_HAIKU: 'claude-3-haiku-20240307',
  CLAUDE_SONNET: 'claude-3-5-sonnet-20241022',
} as const

export type UnifiedModel = typeof UNIFIED_MODELS[keyof typeof UNIFIED_MODELS]

export interface UnifiedRequestConfig {
  taskType: string
  complexity: 'simple' | 'complex'
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  userMessage: string
  stream?: boolean
  preferredProvider?: 'grok' | 'anthropic'
}

export interface UnifiedResponse {
  content: string
  model: UnifiedModel
  provider: 'grok' | 'anthropic'
  tokensUsed: {
    input: number
    output: number
  }
  cost: number
  cached: boolean
}

// Cost tracking for all models (per million tokens)
const UNIFIED_MODEL_COSTS = {
  [UNIFIED_MODELS.GROK_FAST]: { input: 2.0, output: 8.0 },
  [UNIFIED_MODELS.GROK_BETA]: { input: 1.5, output: 6.0 },
  [UNIFIED_MODELS.CLAUDE_HAIKU]: { input: 0.25, output: 1.25 },
  [UNIFIED_MODELS.CLAUDE_SONNET]: { input: 3, output: 15 },
}

class UnifiedAIClient {
  /**
   * Smart model and provider selection
   */
  private selectModelAndProvider(config: UnifiedRequestConfig): {
    model: UnifiedModel
    provider: 'grok' | 'anthropic'
  } {
    // Use preferred provider if specified
    if (config.preferredProvider === 'anthropic') {
      return {
        model: config.complexity === 'complex' ? UNIFIED_MODELS.CLAUDE_SONNET : UNIFIED_MODELS.CLAUDE_HAIKU,
        provider: 'anthropic'
      }
    }

    // Default to Grok as primary (per user request)
    return {
      model: UNIFIED_MODELS.GROK_FAST, // Use grok-2-1212 as primary
      provider: 'grok'
    }
  }

  /**
   * Convert unified config to provider-specific config
   */
  private convertToProviderConfig(
    config: UnifiedRequestConfig,
    provider: 'grok' | 'anthropic'
  ): GrokRequestConfig | AIRequestConfig {
    const baseConfig = {
      taskType: config.taskType,
      complexity: config.complexity,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      systemPrompt: config.systemPrompt,
      userMessage: config.userMessage,
      stream: config.stream,
    }

    return baseConfig
  }

  /**
   * Convert provider response to unified response
   */
  private convertToUnifiedResponse(
    response: GrokResponse | AIResponse,
    provider: 'grok' | 'anthropic'
  ): UnifiedResponse {
    return {
      content: response.content,
      model: response.model as UnifiedModel,
      provider,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      cached: response.cached,
    }
  }

  /**
   * Main method to send AI requests with fallback support
   */
  async sendRequest(config: UnifiedRequestConfig): Promise<UnifiedResponse> {
    const { model, provider } = this.selectModelAndProvider(config)
    const providerConfig = this.convertToProviderConfig(config, provider)

    try {
      if (provider === 'grok') {
        console.log('Using Grok as primary AI provider')
        const response = await grokClient.sendRequest(providerConfig as GrokRequestConfig)
        return this.convertToUnifiedResponse(response, 'grok')
      } else {
        console.log('Using Anthropic as fallback AI provider')
        const response = await anthropicClient.sendRequest(providerConfig as AIRequestConfig)
        return this.convertToUnifiedResponse(response, 'anthropic')
      }
    } catch (error) {
      console.error(`${provider} request failed:`, error)

      // Fallback to Anthropic if Grok fails
      if (provider === 'grok') {
        console.log('Falling back to Anthropic due to Grok failure')
        try {
          const fallbackConfig = this.convertToProviderConfig(config, 'anthropic')
          const response = await anthropicClient.sendRequest(fallbackConfig as AIRequestConfig)
          return this.convertToUnifiedResponse(response, 'anthropic')
        } catch (fallbackError) {
          console.error('Fallback to Anthropic also failed:', fallbackError)
          throw new Error(`Both AI providers failed: Grok (${error instanceof Error ? error.message : 'Unknown'}), Anthropic (${fallbackError instanceof Error ? fallbackError.message : 'Unknown'})`)
        }
      }

      throw error
    }
  }

  /**
   * Streaming response with fallback support
   */
  async *streamRequest(config: UnifiedRequestConfig): AsyncGenerator<string> {
    const { model, provider } = this.selectModelAndProvider(config)
    const providerConfig = this.convertToProviderConfig(config, provider)

    try {
      if (provider === 'grok') {
        console.log('Using Grok streaming')
        yield* grokClient.streamRequest(providerConfig as GrokRequestConfig)
      } else {
        console.log('Using Anthropic streaming')
        yield* anthropicClient.streamRequest(providerConfig as AIRequestConfig)
      }
    } catch (error) {
      console.error(`${provider} streaming failed:`, error)

      // Fallback to Anthropic if Grok fails
      if (provider === 'grok') {
        console.log('Falling back to Anthropic streaming')
        try {
          const fallbackConfig = this.convertToProviderConfig(config, 'anthropic')
          yield* anthropicClient.streamRequest(fallbackConfig as AIRequestConfig)
        } catch (fallbackError) {
          console.error('Fallback streaming also failed:', fallbackError)
          throw new Error(`Both streaming providers failed`)
        }
      } else {
        throw error
      }
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
      preferredProvider?: 'grok' | 'anthropic'
    } = {}
  ): Promise<string> {
    const response = await this.sendRequest({
      taskType: options.taskType ?? 'general',
      complexity: 'simple',
      userMessage: prompt,
      maxTokens: options.maxTokens,
      systemPrompt: options.systemPrompt,
      preferredProvider: options.preferredProvider,
    })

    return response.content
  }

  /**
   * Get all model costs for monitoring
   */
  getModelCosts() {
    return UNIFIED_MODEL_COSTS
  }

  /**
   * Health check for both providers
   */
  async healthCheck(): Promise<{
    grok: boolean
    anthropic: boolean
    overall: boolean
  }> {
    const results = {
      grok: false,
      anthropic: false,
      overall: false,
    }

    try {
      await grokClient.healthCheck()
      results.grok = true
    } catch (error) {
      console.warn('Grok health check failed:', error)
    }

    try {
      await anthropicClient.healthCheck()
      results.anthropic = true
    } catch (error) {
      console.warn('Anthropic health check failed:', error)
    }

    results.overall = results.grok || results.anthropic
    return results
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): {
    primary: string
    fallback: string
    models: {
      grok: string[]
      anthropic: string[]
    }
  } {
    return {
      primary: 'Grok (grok-2-1212)',
      fallback: 'Anthropic Claude',
      models: {
        grok: [UNIFIED_MODELS.GROK_FAST, UNIFIED_MODELS.GROK_BETA],
        anthropic: [UNIFIED_MODELS.CLAUDE_HAIKU, UNIFIED_MODELS.CLAUDE_SONNET],
      }
    }
  }
}

// Singleton instance
export const unifiedAIClient = new UnifiedAIClient()

// Export for backward compatibility
export { unifiedAIClient as aiClient }