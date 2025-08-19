'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Home, 
  CreditCard, 
  ChefHat, 
  CheckSquare,
  TrendingUp,
  Users
} from 'lucide-react'
import { User } from '@/types'
import { cn } from '@/lib/utils'

interface DashboardHeroProps {
  type: string
  user: User | null
}

export function DashboardHero({ type, user }: DashboardHeroProps) {
  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there'

  const heroContent = {
    'welcome': {
      icon: Sparkles,
      title: `${getTimeGreeting()}, ${displayName}!`,
      subtitle: 'Welcome to your adaptive home management hub',
      description: 'NextTaskPro learns from how you use it and adapts to show you what matters most.',
      gradient: 'from-blue-500/20 via-purple-500/20 to-pink-500/20',
      accent: 'text-blue-500'
    },
    'financial-overview': {
      icon: CreditCard,
      title: 'Financial Command Center',
      subtitle: 'Your bills and budget at a glance',
      description: 'Stay on top of your family\'s finances with smart tracking and insights.',
      gradient: 'from-green-500/20 via-emerald-500/20 to-teal-500/20',
      accent: 'text-green-500'
    },
    'meal-planner': {
      icon: ChefHat,
      title: 'Family Kitchen Hub',
      subtitle: 'Plan meals, save recipes, shop smart',
      description: 'Organize your family\'s meals and automatically generate shopping lists.',
      gradient: 'from-orange-500/20 via-amber-500/20 to-yellow-500/20',
      accent: 'text-orange-500'
    },
    'productivity-hub': {
      icon: CheckSquare,
      title: 'Productivity Central',
      subtitle: 'Tasks, projects, and family coordination',
      description: 'Keep your family organized with smart task management and scheduling.',
      gradient: 'from-indigo-500/20 via-blue-500/20 to-cyan-500/20',
      accent: 'text-indigo-500'
    },
    'adaptive-dashboard': {
      icon: TrendingUp,
      title: 'Your Personalized Hub',
      subtitle: 'Adapted to your family\'s needs',
      description: 'This dashboard has evolved based on what you use most. It will continue adapting as your needs change.',
      gradient: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
      accent: 'text-violet-500'
    }
  }

  const content = heroContent[type as keyof typeof heroContent] || heroContent.welcome
  const Icon = content.icon

  return (
    <Card glass className={cn(
      "relative overflow-hidden border-0 shadow-lg",
      "bg-gradient-to-br", content.gradient
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      
      <CardContent className="relative p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "rounded-2xl p-3 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20"
              )}>
                <Icon className={cn("h-8 w-8", content.accent)} />
              </div>
              
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {content.title}
                </h1>
                <p className={cn("text-lg font-medium", content.accent)}>
                  {content.subtitle}
                </p>
              </div>
            </div>
            
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              {content.description}
            </p>

            {/* Quick stats or actions based on hero type */}
            {type === 'adaptive-dashboard' && (
              <div className="flex items-center space-x-6 pt-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Family of</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Active since</span>
                  <span className="font-medium">Today</span>
                </div>
              </div>
            )}

            {type === 'welcome' && (
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  variant="glass" 
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 dark:bg-black/10 dark:hover:bg-black/20"
                >
                  Take Tour
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Learn More
                </Button>
              </div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="hidden lg:block relative">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/5 dark:bg-black/5 blur-xl" />
            <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-white/10 dark:bg-black/10 blur-lg" />
            <div className="relative h-12 w-12 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center backdrop-blur-sm">
              <Icon className={cn("h-6 w-6", content.accent)} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}