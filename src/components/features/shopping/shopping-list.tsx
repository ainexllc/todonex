'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Edit2, Trash2, MoreVertical, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ShoppingItem {
  id: string
  name: string
  category?: string
  quantity?: number
  unit?: string
  purchased: boolean
  createdAt: Date
  updatedAt: Date
}

interface ShoppingListProps {
  groupedItems: Record<string, ShoppingItem[]>
  onItemUpdate: (id: string, updates: Partial<ShoppingItem>) => void
  onItemDelete: (id: string) => void
  onItemEdit: (item: ShoppingItem) => void
}

export function ShoppingList({ groupedItems, onItemUpdate, onItemDelete, onItemEdit }: ShoppingListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(groupedItems)))

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const togglePurchased = (item: ShoppingItem) => {
    onItemUpdate(item.id, { purchased: !item.purchased })
  }

  const formatQuantity = (item: ShoppingItem) => {
    if (!item.quantity) return ''
    return `${item.quantity}${item.unit ? ' ' + item.unit : ''}`
  }

  const getCategoryIcon = (category: string) => {
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
      'Bakery': '🍞',
      'Uncategorized': '📦'
    }
    return iconMap[category] || '📦'
  }

  const categoryOrder = [
    'Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Bakery', 
    'Snacks', 'Beverages', 'Household', 'Personal Care', 'Uncategorized'
  ]

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  if (Object.keys(groupedItems).length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {sortedCategories.map((category) => {
        const items = groupedItems[category]
        const isExpanded = expandedCategories.has(category)
        const purchasedCount = items.filter(item => item.purchased).length
        const totalCount = items.length

        return (
          <Card key={category} className="glass border-glass">
            <CardHeader 
              className="cursor-pointer hover:bg-white/5 transition-colors pb-3"
              onClick={() => toggleCategory(category)}
            >
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                  <span className="text-xs text-muted-foreground">
                    ({purchasedCount}/{totalCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {purchasedCount === totalCount && totalCount > 0 && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-white/10"
                  >
                    <span className={cn(
                      "transition-transform duration-200",
                      isExpanded ? "rotate-90" : "rotate-0"
                    )}>
                      ▶
                    </span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {items
                    .sort((a, b) => {
                      // Sort by purchased status (pending first), then by name
                      if (a.purchased !== b.purchased) {
                        return a.purchased ? 1 : -1
                      }
                      return a.name.localeCompare(b.name)
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors",
                          item.purchased && "opacity-60"
                        )}
                      >
                        {/* Purchase Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6 rounded-full hover:bg-white/10"
                          onClick={() => togglePurchased(item)}
                        >
                          {item.purchased ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </Button>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium",
                              item.purchased && "line-through text-muted-foreground"
                            )}>
                              {item.name}
                            </span>
                            
                            {formatQuantity(item) && (
                              <span className="text-sm text-muted-foreground">
                                {formatQuantity(item)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 w-8 hover:bg-white/10"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onItemEdit(item)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => togglePurchased(item)}
                              className={item.purchased ? "text-orange-600" : "text-green-600"}
                            >
                              {item.purchased ? (
                                <>
                                  <Circle className="h-4 w-4 mr-2" />
                                  Mark Needed
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark Purchased
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onItemDelete(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}