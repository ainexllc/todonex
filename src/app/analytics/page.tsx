'use client'

import { UsageAnalytics } from '@/components/features/analytics/usage-analytics'
import { IntelligentSuggestions } from '@/components/features/analytics/intelligent-suggestions'

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <UsageAnalytics />
      <IntelligentSuggestions />
    </div>
  )
}