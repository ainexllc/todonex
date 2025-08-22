'use client'

import { UsageAnalytics } from '@/components/features/analytics/usage-analytics'
import { IntelligentSuggestions } from '@/components/features/analytics/intelligent-suggestions'

export default function AnalyticsPage() {
  return (
    <div 
      className="max-w-[50rem] px-5 pt-20 @sm:pt-18 mx-auto w-full flex flex-col h-full pb-4 transition-all duration-300" 
      style={{ maskImage: 'linear-gradient(black 85%, transparent 100%)' }}
    >
      <div className="space-y-8">
        <UsageAnalytics />
        <IntelligentSuggestions />
      </div>
    </div>
  )
}