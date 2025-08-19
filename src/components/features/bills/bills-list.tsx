'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Calendar, Edit2, Trash2, MoreVertical, AlertTriangle, Clock, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Bill } from '@/types'

interface BillsListProps {
  bills: Bill[]
  onBillUpdate: (id: string, updates: Partial<Bill>) => void
  onBillDelete: (id: string) => void
  onBillEdit: (bill: Bill) => void
}

export function BillsList({ bills, onBillUpdate, onBillDelete, onBillEdit }: BillsListProps) {
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set())

  const toggleExpanded = (billId: string) => {
    const newExpanded = new Set(expandedBills)
    if (newExpanded.has(billId)) {
      newExpanded.delete(billId)
    } else {
      newExpanded.add(billId)
    }
    setExpandedBills(newExpanded)
  }

  const togglePaid = (bill: Bill) => {
    onBillUpdate(bill.id, { isPaid: !bill.isPaid })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date)
  }

  const getBillStatus = (bill: Bill) => {
    if (bill.isPaid) return 'paid'
    
    const today = new Date()
    const dueDate = new Date(bill.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'overdue'
    if (diffDays <= 3) return 'due-soon'
    return 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'overdue': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'due-soon': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'pending': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-3 w-3" />
      case 'overdue': return <AlertTriangle className="h-3 w-3" />
      case 'due-soon': return <Clock className="h-3 w-3" />
      case 'pending': return <Calendar className="h-3 w-3" />
      default: return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid'
      case 'overdue': return 'Overdue'
      case 'due-soon': return 'Due Soon'
      case 'pending': return 'Pending'
      default: return 'Unknown'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'utilities': 'bg-blue-500/20 text-blue-400',
      'rent': 'bg-purple-500/20 text-purple-400',
      'insurance': 'bg-green-500/20 text-green-400',
      'subscriptions': 'bg-orange-500/20 text-orange-400',
      'loans': 'bg-red-500/20 text-red-400',
      'credit-cards': 'bg-pink-500/20 text-pink-400',
      'healthcare': 'bg-teal-500/20 text-teal-400',
      'other': 'bg-gray-500/20 text-gray-400'
    }
    return colors[category.toLowerCase()] || colors['other']
  }

  if (bills.length === 0) {
    return null
  }

  // Group bills by status for better organization
  const groupedBills = bills.reduce((groups, bill) => {
    const status = getBillStatus(bill)
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(bill)
    return groups
  }, {} as Record<string, Bill[]>)

  // Sort groups by priority: overdue, due-soon, pending, paid
  const statusOrder = ['overdue', 'due-soon', 'pending', 'paid']
  const sortedGroups = statusOrder.filter(status => groupedBills[status]?.length > 0)

  return (
    <div className="space-y-6">
      {sortedGroups.map((status) => {
        const billsInGroup = groupedBills[status]
        const statusColor = getStatusColor(status)

        return (
          <div key={status} className="space-y-3">
            {/* Group Header */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border",
                statusColor
              )}>
                {getStatusIcon(status)}
                {getStatusLabel(status)}
                <span className="text-xs">({billsInGroup.length})</span>
              </div>
            </div>

            {/* Bills in Group */}
            <div className="space-y-3">
              {billsInGroup
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((bill) => {
                  const isExpanded = expandedBills.has(bill.id)
                  const billStatus = getBillStatus(bill)

                  return (
                    <Card
                      key={bill.id}
                      className={cn(
                        "glass border-glass hover:bg-white/5 transition-all duration-200",
                        bill.isPaid && "opacity-60",
                        billStatus === 'overdue' && "border-red-500/30",
                        billStatus === 'due-soon' && "border-orange-500/30"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Payment Toggle */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-6 w-6 rounded-full hover:bg-white/10 mt-1"
                            onClick={() => togglePaid(bill)}
                          >
                            {bill.isPaid ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            )}
                          </Button>

                          {/* Bill Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title and Amount */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3
                                  className={cn(
                                    "font-medium cursor-pointer text-lg",
                                    bill.isPaid && "line-through text-muted-foreground"
                                  )}
                                  onClick={() => toggleExpanded(bill.id)}
                                >
                                  {bill.name}
                                  {bill.isRecurring && (
                                    <Repeat className="h-4 w-4 inline ml-2 text-muted-foreground" />
                                  )}
                                </h3>
                                <p className="text-2xl font-bold text-primary">
                                  {formatCurrency(bill.amount)}
                                </p>
                              </div>
                            </div>

                            {/* Due Date and Category */}
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className={cn(
                                  billStatus === 'overdue' && "text-red-500",
                                  billStatus === 'due-soon' && "text-orange-500"
                                )}>
                                  Due {formatDate(new Date(bill.dueDate))}
                                </span>
                              </div>

                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs", getCategoryColor(bill.category))}
                              >
                                {bill.category}
                              </Badge>
                            </div>

                            {/* Description (when expanded) */}
                            {isExpanded && bill.description && (
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                {bill.description}
                              </p>
                            )}

                            {/* Recurring Info (when expanded) */}
                            {isExpanded && bill.isRecurring && (
                              <div className="text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <Repeat className="h-4 w-4" />
                                  <span>Repeats {bill.recurringInterval}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-8 w-8 hover:bg-white/10 mt-1"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => onBillEdit(bill)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Bill
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => togglePaid(bill)}
                                className={bill.isPaid ? "text-orange-600" : "text-green-600"}
                              >
                                {bill.isPaid ? (
                                  <>
                                    <Circle className="h-4 w-4 mr-2" />
                                    Mark Unpaid
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark Paid
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onBillDelete(bill.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Bill
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        )
      })}
    </div>
  )
}