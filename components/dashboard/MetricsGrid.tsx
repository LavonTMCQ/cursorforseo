'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, BarChart3, Key, Target, Link } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserStats {
  projectCount: number
  keywordCount: number
  avgPosition: number | null
  totalRankings: number
}

interface MetricsGridProps {
  userStats?: UserStats
  isLoading: boolean
}

interface MetricCardProps {
  title: string
  value: string | number
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  gradient: string
  delay?: number
  isLoading?: boolean
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  gradient, 
  delay = 0, 
  isLoading 
}: MetricCardProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-rose-500" />
      default:
        return <Minus className="h-4 w-4 text-slate-400" />
    }
  }

  const getBadgeVariant = () => {
    switch (changeType) {
      case 'positive':
        return 'default'
      case 'negative':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-500 hover:shadow-lg group",
        "border-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl",
        "hover:scale-[1.02] hover:shadow-xl",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ 
        background: gradient,
        animationDelay: `${delay}ms`
      }}
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
          {icon}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div 
            className="text-2xl font-bold text-slate-800"
            data-testid={`metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
            ) : (
              value
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <Badge 
              variant={getBadgeVariant()}
              className="text-xs"
              data-testid={`metric-change-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {isLoading ? 'Loading...' : change}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MetricsGrid({ userStats, isLoading }: MetricsGridProps) {
  const getPositionChangeType = (avgPosition: number | null): 'positive' | 'negative' | 'neutral' => {
    if (!avgPosition) return 'neutral'
    if (avgPosition <= 10) return 'positive'
    if (avgPosition <= 20) return 'neutral'
    return 'negative'
  }

  const positionChangeType = getPositionChangeType(userStats?.avgPosition || null)

  const metrics: Array<{
    title: string
    value: string | number
    change: string
    changeType: 'positive' | 'negative' | 'neutral'
    icon: React.ReactNode
    gradient: string
    delay: number
  }> = [
    {
      title: 'Projects',
      value: isLoading ? '...' : userStats?.projectCount || 0,
      change: userStats?.projectCount ? 'Active projects' : 'Create your first project',
      changeType: userStats?.projectCount ? 'positive' : 'neutral',
      icon: <BarChart3 className="h-4 w-4 text-blue-600" />,
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.2))',
      delay: 0
    },
    {
      title: 'Keywords',
      value: isLoading ? '...' : userStats?.keywordCount || 0,
      change: userStats?.keywordCount ? 'Tracking keywords' : 'Add keywords to track',
      changeType: userStats?.keywordCount ? 'positive' : 'neutral',
      icon: <Key className="h-4 w-4 text-emerald-600" />,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(110, 231, 183, 0.2))',
      delay: 100
    },
    {
      title: 'Avg. Position',
      value: isLoading ? '...' : userStats?.avgPosition ? userStats.avgPosition.toFixed(1) : '--',
      change: userStats?.avgPosition ? 'Current average' : 'Start tracking rankings',
      changeType: positionChangeType,
      icon: <Target className="h-4 w-4 text-amber-600" />,
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(252, 211, 77, 0.2))',
      delay: 200
    },
    {
      title: 'Rankings',
      value: isLoading ? '...' : userStats?.totalRankings || 0,
      change: userStats?.totalRankings ? 'Total data points' : 'Rankings will appear here',
      changeType: userStats?.totalRankings ? 'positive' : 'neutral',
      icon: <Link className="h-4 w-4 text-rose-500" />,
      gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(251, 113, 133, 0.2))',
      delay: 300
    }
  ]

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      data-testid="metrics-grid"
    >
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
          icon={metric.icon}
          gradient={metric.gradient}
          delay={metric.delay}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
