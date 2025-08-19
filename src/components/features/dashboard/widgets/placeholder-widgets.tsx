// Placeholder widgets for features not yet implemented
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  ShoppingCart, 
  ChefHat, 
  Calendar, 
  StickyNote,
  BarChart3,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useAdaptiveStore } from '@/store/adaptive-store'

interface WidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, any>
}

export function UpcomingBillsWidget({ size = 'medium' }: WidgetProps) {
  const { trackFeatureUsage } = useAdaptiveStore()

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5"></div>
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <CreditCard className="h-5 w-5 text-green-500" />
          <span>Upcoming Bills</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="text-center py-6 space-y-3">
          <div className="h-12 w-12 rounded-full bg-green-500/10 mx-auto flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-green-500" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Track Your Bills</h4>
            <p className="text-sm text-muted-foreground">
              Never miss a payment with automated bill tracking and reminders
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => trackFeatureUsage('bills', 'explore')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add First Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActiveShoppingListsWidget({ size = 'medium' }: WidgetProps) {
  const { trackFeatureUsage } = useAdaptiveStore()

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-indigo-500/5"></div>
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <ShoppingCart className="h-5 w-5 text-purple-500" />
          <span>Shopping Lists</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="text-center py-6 space-y-3">
          <div className="h-12 w-12 rounded-full bg-purple-500/10 mx-auto flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-purple-500" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Smart Shopping Lists</h4>
            <p className="text-sm text-muted-foreground">
              Organize groceries by store layout and share with family
            </p>
          </div>
          <Button 
            size="sm"
            onClick={() => trackFeatureUsage('shopping', 'explore')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create List
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ThisWeekMealsWidget({ size = 'medium' }: WidgetProps) {
  const { trackFeatureUsage } = useAdaptiveStore()

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-yellow-500/5"></div>
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <ChefHat className="h-5 w-5 text-orange-500" />
          <span>This Week's Meals</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="text-center py-6 space-y-3">
          <div className="h-12 w-12 rounded-full bg-orange-500/10 mx-auto flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-orange-500" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Meal Planning</h4>
            <p className="text-sm text-muted-foreground">
              Plan weekly meals and generate shopping lists automatically
            </p>
          </div>
          <Button 
            size="sm"
            onClick={() => trackFeatureUsage('recipes', 'explore')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Recipe
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function TodayEventsWidget({ size = 'medium' }: WidgetProps) {
  const { trackFeatureUsage } = useAdaptiveStore()

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-cyan-500/5"></div>
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Calendar className="h-5 w-5 text-indigo-500" />
          <span>Today's Events</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="text-center py-6 space-y-3">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 mx-auto flex items-center justify-center">
            <Calendar className="h-6 w-6 text-indigo-500" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Calendar Integration</h4>
            <p className="text-sm text-muted-foreground">
              Sync with Google Calendar and manage family schedules
            </p>
          </div>
          <Button 
            size="sm"
            onClick={() => trackFeatureUsage('calendar', 'explore')}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Connect Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecentNotesWidget({ size = 'medium' }: WidgetProps) {
  const { trackFeatureUsage } = useAdaptiveStore()

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-orange-500/5"></div>
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <StickyNote className="h-5 w-5 text-yellow-500" />
          <span>Quick Notes</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="text-center py-6 space-y-3">
          <div className="h-12 w-12 rounded-full bg-yellow-500/10 mx-auto flex items-center justify-center">
            <StickyNote className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Family Notes</h4>
            <p className="text-sm text-muted-foreground">
              Capture ideas, voice memos, and share family updates
            </p>
          </div>
          <Button 
            size="sm"
            onClick={() => trackFeatureUsage('notes', 'explore')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SubscriptionOverviewWidget({ size = 'medium' }: WidgetProps) {
  const { trackFeatureUsage } = useAdaptiveStore()

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-red-500/5"></div>
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <BarChart3 className="h-5 w-5 text-pink-500" />
          <span>Subscriptions</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="text-center py-6 space-y-3">
          <div className="h-12 w-12 rounded-full bg-pink-500/10 mx-auto flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-pink-500" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">Subscription Tracker</h4>
            <p className="text-sm text-muted-foreground">
              Monitor subscriptions and optimize your spending
            </p>
          </div>
          <Button 
            size="sm"
            onClick={() => trackFeatureUsage('subscriptions', 'explore')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Track Subscriptions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}