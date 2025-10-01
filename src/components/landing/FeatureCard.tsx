'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 backdrop-blur">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">
              {title}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
