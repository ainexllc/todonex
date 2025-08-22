'use client'

import { TaskEnhancement } from '@/types/ai'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Target, 
  Lightbulb, 
  CheckCircle,
  ArrowRight,
  X,
  Zap,
  Clock,
  Flag
} from 'lucide-react'

interface TaskEnhancementCardProps {
  enhancement: TaskEnhancement
  onApply: (enhancement: TaskEnhancement) => void
  onClose: () => void
  cached?: boolean
  cost?: number
  remainingRequests?: number
  responseTime?: number
}

export function TaskEnhancementCard({ 
  enhancement, 
  onApply, 
  onClose, 
  cached = false, 
  cost = 0,
  remainingRequests,
  responseTime
}: TaskEnhancementCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50/50 dark:from-primary/10 dark:to-blue-950/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Task Enhancement
            {cached && (
              <Badge variant="secondary" className="text-xs">
                Cached
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Usage and Cost Information */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {!cached && cost > 0 && (
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>Cost: ${cost.toFixed(4)}</span>
            </div>
          )}
          {responseTime && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{responseTime}ms</span>
            </div>
          )}
          {remainingRequests !== undefined && (
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>{remainingRequests} requests left today</span>
            </div>
          )}
          {cached && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <span>🎯</span>
              <span>Free (from cache)</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enhanced Description */}
        {enhancement.description && (
          <div>
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Enhanced Description
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {enhancement.description}
            </p>
          </div>
        )}

        {/* Priority and Timing */}
        <div className="flex gap-4">
          {enhancement.priority && (
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-muted-foreground" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(enhancement.priority)}`}>
                {enhancement.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          )}
          
          {enhancement.estimatedDuration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                ~{enhancement.estimatedDuration}
              </span>
            </div>
          )}
        </div>

        {/* Success Tips & Strategies */}
        {enhancement.tips && enhancement.tips.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 p-4 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  💡 Success Tips
                </h5>
                <ul className="space-y-1">
                  {enhancement.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                      • {tip}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  💪 These strategies will help you complete this task effectively
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subtasks */}
        {enhancement.subtasks && enhancement.subtasks.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Suggested Subtasks
            </h5>
            <div className="space-y-2">
              {enhancement.subtasks.map((subtask, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{subtask}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {enhancement.dependencies && enhancement.dependencies.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              Dependencies
            </h5>
            <div className="flex flex-wrap gap-2">
              {enhancement.dependencies.map((dep, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <Button
          onClick={() => onApply(enhancement)}
          className="w-full"
          size="sm"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Apply AI Suggestions to Task
        </Button>
      </CardContent>
    </Card>
  )
}