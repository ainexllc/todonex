'use client'

import { useState, useEffect } from 'react'
import { Plus, ShoppingCart, Check, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShoppingList } from '@/components/features/shopping/shopping-list'
import { ShoppingForm } from '@/components/features/shopping/shopping-form'
import { ShoppingFilters } from '@/components/features/shopping/shopping-filters'
import { 
  createDocument, 
  updateDocument, 
  deleteDocument,
  subscribeToUserDocuments,
  isOnline,
  onNetworkChange 
} from '@/lib/firebase-data'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'

interface ShoppingItem {
  id: string
  name: string
  category?: string
  quantity?: number
  unit?: string
  notes?: string
  purchased: boolean
  familyId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export default function ShoppingPage() {
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [online, setOnline] = useState(isOnline())
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, purchased
    category: 'all',
    search: ''
  })

  // Track feature usage
  useEffect(() => {
    trackFeatureUsage('shopping', 'view')
  }, [trackFeatureUsage])

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = onNetworkChange(setOnline)
    return unsubscribe
  }, [])

  // Subscribe to shopping items
  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<ShoppingItem>('shopping', (newItems) => {
      setItems(newItems)
    }, 'updatedAt')
    
    return unsubscribe
  }, [user])

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  const handleCreateItem = async (itemData: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt' | 'familyId' | 'createdBy'>) => {
    if (!user || !online) return

    try {
      await createDocument<ShoppingItem>('shopping', generateId(), {
        ...itemData,
        purchased: false
      })
      
      setShowForm(false)
      trackFeatureUsage('shopping', 'create')
    } catch (error) {
      console.error('Failed to create shopping item:', error)
    }
  }

  const handleUpdateItem = async (id: string, updates: Partial<ShoppingItem>) => {
    if (!online) return
    
    try {
      await updateDocument('shopping', id, updates)
      
      if (updates.purchased !== undefined) {
        trackFeatureUsage('shopping', updates.purchased ? 'purchase' : 'unpurchase')
      } else {
        trackFeatureUsage('shopping', 'update')
      }
    } catch (error) {
      console.error('Failed to update shopping item:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!online) return
    
    try {
      await deleteDocument('shopping', id)
      trackFeatureUsage('shopping', 'delete')
    } catch (error) {
      console.error('Failed to delete shopping item:', error)
    }
  }

  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const clearPurchased = async () => {
    if (!online) return
    
    const purchasedItems = items.filter(item => item.purchased)
    
    try {
      await Promise.all(
        purchasedItems.map(item => deleteDocument('shopping', item.id))
      )
      trackFeatureUsage('shopping', 'clear-purchased')
    } catch (error) {
      console.error('Failed to clear purchased items:', error)
    }
  }

  // Filter items based on current filters
  const filteredItems = items.filter(item => {
    // Status filter
    if (filters.status === 'pending' && item.purchased) return false
    if (filters.status === 'purchased' && !item.purchased) return false
    
    // Category filter
    if (filters.category !== 'all' && item.category !== filters.category) return false
    
    // Search filter
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    
    return true
  })

  const itemStats = {
    total: items.length,
    purchased: items.filter(i => i.purchased).length,
    pending: items.filter(i => !i.purchased).length,
    categories: [...new Set(items.map(i => i.category).filter(Boolean))].length
  }

  // Group items by category for better organization
  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category || 'Uncategorized'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shopping List</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {itemStats.pending} to buy, {itemStats.purchased} purchased
            {!online && (
              <span className="flex items-center gap-1 text-amber-600">
                <WifiOff className="h-3 w-3" />
                Offline
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          {itemStats.purchased > 0 && (
            <Button 
              variant="outline" 
              onClick={clearPurchased}
              disabled={!online}
              className="glass border-glass hover:bg-white/5"
            >
              <Check className="h-4 w-4 mr-2" />
              Clear Purchased
            </Button>
          )}
          <Button onClick={() => setShowForm(true)} disabled={!online}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{itemStats.total}</div>
          <div className="text-xs text-muted-foreground">Total Items</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{itemStats.pending}</div>
          <div className="text-xs text-muted-foreground">To Buy</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{itemStats.purchased}</div>
          <div className="text-xs text-muted-foreground">Purchased</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{itemStats.categories}</div>
          <div className="text-xs text-muted-foreground">Categories</div>
        </div>
      </div>

      {/* Filters */}
      <ShoppingFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        categories={[...new Set(items.map(i => i.category).filter(Boolean))]}
      />

      {/* Shopping List */}
      <ShoppingList
        groupedItems={groupedItems}
        onItemUpdate={handleUpdateItem}
        onItemDelete={handleDeleteItem}
        onItemEdit={handleEditItem}
      />

      {/* Shopping Form Modal */}
      {showForm && (
        <ShoppingForm
          item={editingItem}
          onSubmit={editingItem ? 
            (data) => handleUpdateItem(editingItem.id, data) : 
            handleCreateItem
          }
          onClose={handleCloseForm}
        />
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No items in your shopping list</h3>
          <p className="text-muted-foreground mb-4">
            Add items to your shopping list to keep track of what you need to buy
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Item
          </Button>
        </div>
      )}
    </div>
  )
}