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
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Shopping List
          </CardTitle>
          <Link href="/shopping">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10"
              onClick={() => trackFeatureUsage('shopping', 'navigate')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="h-10 w-10 mx-auto mb-2 rounded-lg glass flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">Shopping list is empty</p>
            <Link href="/shopping">
              <Button 
                size="sm" 
                variant="outline" 
                className="glass border-glass hover:bg-white/5"
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
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Shopping List
          <span className="ml-2 text-xs text-muted-foreground">
            ({items.length} items)
          </span>
        </CardTitle>
        <Link href="/shopping">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={() => trackFeatureUsage('shopping', 'navigate')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-white/10"
                onClick={() => toggleItem(item.id, !item.purchased)}
              >
                <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm truncate">{item.name}</span>
                  {formatQuantity(item) && (
                    <span className="text-xs text-muted-foreground">
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
        
        <div className="mt-3 pt-3 border-t border-glass/50">
          <Link href="/shopping">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full hover:bg-white/10"
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