'use client'

import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface WelcomeWidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, unknown>
}

export function WelcomeWidget({ size = 'medium' }: WelcomeWidgetProps) {
  const { user } = useAuthStore()
  
  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there'

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
      <CardHeader className="relative">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">
            {getTimeGreeting()}, {displayName}!
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-3">
          <p className="text-muted-foreground">
            Welcome to your personalized home management hub. HomeKeep adapts to how you use it, 
            showing you the most relevant information and features.
          </p>
          
          <div className="rounded-lg bg-white/5 dark:bg-black/5 p-3">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> The more you use HomeKeep, the smarter your dashboard becomes. 
              Start by adding a task, tracking a bill, or saving a recipe.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}