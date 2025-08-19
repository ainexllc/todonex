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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
          <CreditCard className="h-4 w-4 text-blue-500" />
          <span>Upcoming Bills</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-center py-6">
          <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Track Your Bills</h4>
          <p className="text-sm text-gray-600 mb-4">
            Never miss a payment with automated bill tracking and reminders
          </p>
          <Button 
            size="sm" 
            variant="outline"
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
          <ShoppingCart className="h-4 w-4 text-blue-500" />
          <span>Shopping Lists</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-center py-6">
          <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Smart Shopping Lists</h4>
          <p className="text-sm text-gray-600 mb-4">
            Organize groceries by store layout and share with family
          </p>
          <Button 
            size="sm"
            variant="outline"
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
          <ChefHat className="h-4 w-4 text-blue-500" />
          <span>This Week's Meals</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-center py-6">
          <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Meal Planning</h4>
          <p className="text-sm text-gray-600 mb-4">
            Plan weekly meals and generate shopping lists automatically
          </p>
          <Button 
            size="sm"
            variant="outline"
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>Today's Events</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-center py-6">
          <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Calendar Integration</h4>
          <p className="text-sm text-gray-600 mb-4">
            Sync with Google Calendar and manage family schedules
          </p>
          <Button 
            size="sm"
            variant="outline"
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
          <StickyNote className="h-4 w-4 text-blue-500" />
          <span>Quick Notes</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-center py-6">
          <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <StickyNote className="h-5 w-5 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Family Notes</h4>
          <p className="text-sm text-gray-600 mb-4">
            Capture ideas, voice memos, and share family updates
          </p>
          <Button 
            size="sm"
            variant="outline"
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          <span>Subscriptions</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-center py-6">
          <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-900 mb-2">Subscription Tracker</h4>
          <p className="text-sm text-gray-600 mb-4">
            Monitor subscriptions and optimize your spending
          </p>
          <Button 
            size="sm"
            variant="outline"
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