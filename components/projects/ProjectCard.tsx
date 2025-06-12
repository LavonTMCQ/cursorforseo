'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  MoreHorizontal, 
  ExternalLink, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Key,
  Calendar,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Project {
  id?: string
  name?: string
  domain?: string
  userId?: string
  settings?: any
  createdAt?: Date | string
  updatedAt?: Date | string
  _count?: {
    keywords: number
    audits: number
    backlinks: number
  }
  avgPosition?: number | null
  keywords?: Array<{
    id: string
    keyword: string
    rankings: Array<{
      position: number
      date: Date
    }>
  }>
}

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  onView?: (project: Project) => void
  className?: string
}

export default function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onView, 
  className 
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Calculate project health score based on various metrics
  const getProjectHealth = () => {
    let score = 0
    const keywordCount = project._count?.keywords || 0
    const avgPosition = project.avgPosition

    // Keywords count scoring (0-40 points)
    if (keywordCount >= 50) score += 40
    else if (keywordCount >= 20) score += 30
    else if (keywordCount >= 10) score += 20
    else if (keywordCount >= 5) score += 10

    // Average position scoring (0-60 points)
    if (avgPosition && avgPosition > 0) {
      if (avgPosition <= 3) score += 60
      else if (avgPosition <= 10) score += 50
      else if (avgPosition <= 20) score += 40
      else if (avgPosition <= 50) score += 30
      else score += 20
    }

    return Math.min(score, 100)
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-amber-600'
    return 'text-rose-500'
  }

  const getHealthBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    if (score >= 40) return 'outline'
    return 'destructive'
  }

  const getPositionTrend = () => {
    // This would typically compare current vs previous period
    // For now, we'll use a simple heuristic based on position
    if (!project.avgPosition || project.avgPosition <= 0) return 'stable'
    if (project.avgPosition <= 10) return 'up'
    if (project.avgPosition <= 30) return 'stable'
    return 'down'
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Unknown'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  const healthScore = getProjectHealth()
  const positionTrend = getPositionTrend()

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
          "border-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl",
          "hover:scale-[1.02] hover:shadow-xl cursor-pointer",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView?.(project)}
        data-testid={`project-card-${project.id || 'unknown'}`}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-slate-800 truncate">
                {project.name || 'Untitled Project'}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Globe className="h-3 w-3" />
                <span className="truncate">{project.domain || 'No domain'}</span>
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Badge 
                variant={getHealthBadgeVariant(healthScore)}
                className="text-xs"
                data-testid={`health-score-${project.id || 'unknown'}`}
              >
                {healthScore}% Health
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle menu actions
                }}
                data-testid={`project-menu-${project.id || 'unknown'}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Health Score Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Project Health</span>
              <span className={cn("font-medium", getHealthColor(healthScore))}>
                {healthScore}%
              </span>
            </div>
            <Progress 
              value={healthScore} 
              className="h-2"
              data-testid={`health-progress-${project.id || 'unknown'}`}
            />
          </div>

          <Separator />

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Key className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-500">Keywords</span>
              </div>
              <div className="text-lg font-semibold text-slate-800">
                {project._count?.keywords || 0}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-500">Avg. Position</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg font-semibold text-slate-800">
                  {project.avgPosition && project.avgPosition > 0 ? project.avgPosition.toFixed(1) : '--'}
                </span>
                {positionTrend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                {positionTrend === 'down' && <TrendingDown className="h-3 w-3 text-rose-500" />}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-500">Created</span>
              </div>
              <div className="text-sm font-medium text-slate-600">
                {formatDate(project.createdAt)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    onView?.(project)
                  }}
                  data-testid={`view-project-${project.id || 'unknown'}`}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View project details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(project)
                  }}
                  data-testid={`edit-project-${project.id || 'unknown'}`}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit project</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(project)
                  }}
                  data-testid={`delete-project-${project.id || 'unknown'}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete project</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
