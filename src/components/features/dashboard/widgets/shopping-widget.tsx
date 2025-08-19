'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { subscribeToUserDocuments, updateDocument, isOnline } from '@/lib/firebase-data'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { cn } from '@/lib/utils'

interface ShoppingItem {
  id: string
  name: string
  category?: string
  quantity?: number
  unit?: string
  purchased: boolean
  familyId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export function ShoppingWidget() {
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<ShoppingItem>('shopping', (allItems) => {
      // Show only pending items, limit to 6 most recent
      const pendingItems = allItems
        .filter(item => !item.purchased)
        .slice(0, 6)
      
      setItems(pendingItems)
      setLoading(false)
    }, 'updatedAt')
    
    return unsubscribe
  }, [user])

  const toggleItem = async (itemId: string, purchased: boolean) => {
    if (!isOnline()) return
    
    try {
      await updateDocument('shopping', itemId, { purchased })
      trackFeatureUsage('shopping', purchased ? 'purchase' : 'unpurchase')
    } catch (error) {
      console.error('Failed to update shopping item:', error)
    }
  }

  const formatQuantity = (item: ShoppingItem) => {
    if (!item.quantity) return ''
    return `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
  }

  const getCategoryIcon = (category?: string) => {
    const iconMap: Record<string, string> = {
      'Produce': '🥬',
      'Dairy': '🥛',
      'Meat': '🥩',
      'Snacks': '🍪',
      'Beverages': '🥤',
      'Household': '🧽',
      'Personal Care': '🧴',
      'Frozen': '🧊',
      'Pantry': '🥫',
      'Bakery': '🍞'
    }
    return iconMap[category || ''] || '📦'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center text-gray-900">
            <ShoppingCart className="h-4 w-4 mr-2 text-blue-500" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center text-gray-900">
            <ShoppingCart className="h-4 w-4 mr-2 text-blue-500" />
            Shopping List
          </CardTitle>
          <Link href="/shopping">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={() => trackFeatureUsage('shopping', 'navigate')}
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">Shopping list is empty</p>
            <Link href="/shopping">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => trackFeatureUsage('shopping', 'navigate')}
              >
                Add Items
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium flex items-center text-gray-900">
          <ShoppingCart className="h-4 w-4 mr-2 text-blue-500" />
          Shopping List
          <span className="ml-2 text-xs text-gray-500">
            ({items.length} items)
          </span>
        </CardTitle>
        <Link href="/shopping">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 hover:bg-gray-100"
            onClick={() => trackFeatureUsage('shopping', 'navigate')}
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all bg-white"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-gray-100 rounded-full"
                onClick={() => toggleItem(item.id, !item.purchased)}
              >
                <Circle className="h-4 w-4 text-gray-400 hover:text-blue-500" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                  {formatQuantity(item) && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {formatQuantity(item)}
                    </span>
                  )}
                </div>
              </div>
              
              {item.category && (
                <span className="text-sm flex-shrink-0">
                  {getCategoryIcon(item.category)}
                </span>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link href="/shopping">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-gray-600 hover:bg-gray-100"
              onClick={() => trackFeatureUsage('shopping', 'navigate')}
            >
              View Shopping List
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}