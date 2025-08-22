'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuickInput } from '@/components/home/QuickInput'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { createDocument } from '@/lib/firebase-data'
import { cn } from '@/lib/utils'

// Recent activity mock data - replace with real data
const recentActivity = [
  { id: '1', type: 'task', title: 'Review project proposal', time: '2 hours ago' },
  { id: '2', type: 'note', title: 'Meeting notes - Q4 planning', time: '5 hours ago' },
  { id: '3', type: 'expense', title: 'Lunch with client', time: 'Yesterday' },
]

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  const router = useRouter()

  const handleQuickInput = async (input: string, type: string) => {
    if (!user) return

    setIsProcessing(true)
    
    try {
      // Process the input based on type
      switch (type) {
        case 'task':
          // Create a task
          await createDocument('tasks', generateId(), {
            title: input,
            completed: false,
            priority: 'medium',
            description: `Created via quick input`
          })
          trackFeatureUsage('quick-input', 'task_created')
          router.push('/tasks')
          break
          
        case 'note':
          // Create a note
          await createDocument('notes', generateId(), {
            title: input,
            content: '',
            tags: []
          })
          trackFeatureUsage('quick-input', 'note_created')
          router.push('/notes')
          break
          
        case 'reminder':
          // Create a reminder/task with due date
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          
          await createDocument('tasks', generateId(), {
            title: input,
            completed: false,
            priority: 'high',
            dueDate: tomorrow,
            description: `Reminder created via quick input`
          })
          trackFeatureUsage('quick-input', 'reminder_created')
          router.push('/tasks')
          break
          
        case 'expense':
          // Create an expense entry
          await createDocument('expenses', generateId(), {
            description: input,
            amount: 0,
            category: 'general',
            date: new Date()
          })
          trackFeatureUsage('quick-input', 'expense_created')
          router.push('/bills')
          break
          
        default:
          // General AI processing - route to most likely feature
          if (input.toLowerCase().includes('remind') || input.toLowerCase().includes('due')) {
            await handleQuickInput(input, 'reminder')
          } else if (input.toLowerCase().includes('note') || input.toLowerCase().includes('write')) {
            await handleQuickInput(input, 'note')
          } else if (input.toLowerCase().includes('cost') || input.toLowerCase().includes('spend')) {
            await handleQuickInput(input, 'expense')
          } else {
            await handleQuickInput(input, 'task')
          }
          break
      }
    } catch (error) {
      console.error('Failed to process quick input:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  return (
    <div 
      className="max-w-[50rem] px-5 pt-20 @sm:pt-18 mx-auto w-full flex flex-col h-full pb-4 transition-all duration-300" 
      style={{ maskImage: 'linear-gradient(black 85%, transparent 100%)' }}
    >
      <div className="min-h-screen flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center py-12">
          <div className="w-full">
            
            {/* Welcome Message */}
            <div className="text-center mb-12">
              <h1 className="text-2xl font-semibold text-foreground mb-4">
                Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-sm text-muted-foreground">
                What would you like to accomplish today?
              </p>
            </div>

            {/* Centered Quick Input */}
            <div className="mb-16">
              <QuickInput 
                onSubmit={handleQuickInput}
                placeholder="What would you like to track today?"
              />
            </div>

          </div>
        </div>

        {/* Recent Activity Section */}
        {recentActivity.length > 0 && (
          <div className="border-t border-border bg-muted/30">
            <div className="w-full py-8">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Recent Activity
              </h2>
              <div className="grid gap-3">
                {recentActivity.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      "grok-elevation hover:border-primary/30 cursor-pointer"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.type === 'task' ? 'bg-blue-500' :
                        item.type === 'note' ? 'bg-green-500' :
                        item.type === 'expense' ? 'bg-orange-500' : 'bg-gray-500'
                      )} />
                      <span className="text-xs font-medium text-foreground">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
