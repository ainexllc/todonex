'use client'

import { useState, useEffect } from 'react'
import { Plus, CreditCard, DollarSign, Calendar, AlertTriangle, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BillsList } from '@/components/features/bills/bills-list'
import { BillForm } from '@/components/features/bills/bill-form'
import { BillFilters } from '@/components/features/bills/bill-filters'
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

interface Bill {
  id: string
  name: string
  amount: number
  dueDate: Date
  category?: string
  description?: string
  isPaid: boolean
  isRecurring?: boolean
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly'
  familyId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export default function BillsPage() {
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  
  const [bills, setBills] = useState<Bill[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [online, setOnline] = useState(isOnline())
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, paid, overdue
    category: 'all',
    search: '',
    period: 'current' // current, upcoming, all
  })

  // Track feature usage
  useEffect(() => {
    trackFeatureUsage('bills', 'view')
  }, [trackFeatureUsage])

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = onNetworkChange(setOnline)
    return unsubscribe
  }, [])

  // Subscribe to bills
  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<Bill>('bills', (newBills) => {
      setBills(newBills)
    }, 'dueDate')
    
    return unsubscribe
  }, [user])

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  const handleCreateBill = async (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'familyId' | 'createdBy'>) => {
    if (!user || !online) return

    try {
      await createDocument<Bill>('bills', generateId(), {
        ...billData,
        isPaid: false
      })
      
      setShowForm(false)
      trackFeatureUsage('bills', 'create')
    } catch (error) {
      console.error('Failed to create bill:', error)
    }
  }

  const handleUpdateBill = async (id: string, updates: Partial<Bill>) => {
    if (!online) return
    
    try {
      await updateDocument('bills', id, updates)
      
      if (updates.isPaid !== undefined) {
        trackFeatureUsage('bills', updates.isPaid ? 'pay' : 'unpay')
      } else {
        trackFeatureUsage('bills', 'update')
      }
    } catch (error) {
      console.error('Failed to update bill:', error)
    }
  }

  const handleDeleteBill = async (id: string) => {
    if (!online) return
    
    try {
      await deleteDocument('bills', id)
      trackFeatureUsage('bills', 'delete')
    } catch (error) {
      console.error('Failed to delete bill:', error)
    }
  }

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBill(null)
  }

  // Filter bills based on current filters
  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.dueDate)
    const today = new Date()
    const isOverdue = billDate < today && !bill.isPaid
    
    // Status filter
    if (filters.status === 'pending' && (bill.isPaid || isOverdue)) return false
    if (filters.status === 'paid' && !bill.isPaid) return false
    if (filters.status === 'overdue' && !isOverdue) return false
    
    // Category filter
    if (filters.category !== 'all' && bill.category !== filters.category) return false
    
    // Search filter
    if (filters.search && !bill.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    
    // Period filter
    if (filters.period === 'current') {
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const billMonth = billDate.getMonth()
      const billYear = billDate.getFullYear()
      if (billMonth !== currentMonth || billYear !== currentYear) return false
    } else if (filters.period === 'upcoming') {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1)
      if (billDate < nextMonth) return false
    }
    
    return true
  })

  const billStats = {
    total: bills.length,
    paid: bills.filter(b => b.isPaid).length,
    pending: bills.filter(b => !b.isPaid && new Date(b.dueDate) >= new Date()).length,
    overdue: bills.filter(b => !b.isPaid && new Date(b.dueDate) < new Date()).length,
    totalAmount: bills.reduce((sum, b) => sum + (b.isPaid ? 0 : b.amount), 0),
    overdueAmount: bills
      .filter(b => !b.isPaid && new Date(b.dueDate) < new Date())
      .reduce((sum, b) => sum + b.amount, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bills & Budget</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Track your bills and manage your budget
            {!online && (
              <span className="flex items-center gap-1 text-amber-600">
                <WifiOff className="h-3 w-3" />
                Offline
              </span>
            )}
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)} disabled={!online}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{billStats.total}</div>
          <div className="text-xs text-muted-foreground">Total Bills</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{billStats.pending}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{billStats.overdue}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{billStats.paid}</div>
          <div className="text-xs text-muted-foreground">Paid</div>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                Outstanding
              </h3>
              <p className="text-3xl font-bold text-blue-500 mt-2">
                {formatCurrency(billStats.totalAmount)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {billStats.pending} pending bills
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Overdue
              </h3>
              <p className="text-3xl font-bold text-red-500 mt-2">
                {formatCurrency(billStats.overdueAmount)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {billStats.overdue} overdue bills
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <BillFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        categories={[...new Set(bills.map(b => b.category).filter(Boolean))]}
      />

      {/* Bills List */}
      <BillsList
        bills={filteredBills}
        onBillUpdate={handleUpdateBill}
        onBillDelete={handleDeleteBill}
        onBillEdit={handleEditBill}
      />

      {/* Bill Form Modal */}
      {showForm && (
        <BillForm
          bill={editingBill}
          onSubmit={editingBill ? 
            (data) => handleUpdateBill(editingBill.id, data) : 
            handleCreateBill
          }
          onClose={handleCloseForm}
        />
      )}

      {/* Empty State */}
      {bills.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No bills yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your bills to track due dates and manage your budget
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Bill
          </Button>
        </div>
      )}

      {/* No Results State */}
      {bills.length > 0 && filteredBills.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No bills match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilters({ status: 'all', category: 'all', search: '', period: 'current' })}
            className="glass border-glass hover:bg-white/5"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}