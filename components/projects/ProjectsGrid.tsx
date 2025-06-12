'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Search, Filter, SortAsc, Folder, TrendingUp } from 'lucide-react'
import ProjectCard from './ProjectCard'
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

interface ProjectsGridProps {
  projects: Project[]
  isLoading: boolean
  onCreateProject: () => void
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onViewProject: (project: Project) => void
  className?: string
}

type SortOption = 'name' | 'created' | 'keywords' | 'position' | 'health'
type FilterOption = 'all' | 'high-performance' | 'needs-attention' | 'new'

export default function ProjectsGrid({
  projects,
  isLoading,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onViewProject,
  className
}: ProjectsGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('created')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)

  // Calculate project health score
  const getProjectHealth = (project: Project) => {
    let score = 0
    const keywordCount = project._count?.keywords || 0
    const avgPosition = project.avgPosition

    if (keywordCount >= 50) score += 40
    else if (keywordCount >= 20) score += 30
    else if (keywordCount >= 10) score += 20
    else if (keywordCount >= 5) score += 10

    if (avgPosition && avgPosition > 0) {
      if (avgPosition <= 3) score += 60
      else if (avgPosition <= 10) score += 50
      else if (avgPosition <= 20) score += 40
      else if (avgPosition <= 50) score += 30
      else score += 20
    }

    return Math.min(score, 100)
  }

  // Filter projects based on selected filter
  const filteredProjects = (projects || []).filter(project => {
    switch (filterBy) {
      case 'high-performance':
        return getProjectHealth(project) >= 80
      case 'needs-attention':
        return getProjectHealth(project) < 60
      case 'new':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return project.createdAt && new Date(project.createdAt) > weekAgo
      default:
        return true
    }
  })

  // Sort projects based on selected sort option
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '')
      case 'created':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case 'keywords':
        return (b._count?.keywords || 0) - (a._count?.keywords || 0)
      case 'position':
        if (!a.avgPosition || a.avgPosition === 0) return 1
        if (!b.avgPosition || b.avgPosition === 0) return -1
        return a.avgPosition - b.avgPosition
      case 'health':
        return getProjectHealth(b) - getProjectHealth(a)
      default:
        return 0
    }
  })

  const handleDeleteConfirm = () => {
    if (deleteProject && deleteProject.id) {
      onDeleteProject(deleteProject.id)
      setDeleteProject(null)
    }
  }

  const getFilterBadgeCount = (filter: FilterOption) => {
    const projectsArray = projects || []
    switch (filter) {
      case 'high-performance':
        return projectsArray.filter(p => getProjectHealth(p) >= 80).length
      case 'needs-attention':
        return projectsArray.filter(p => getProjectHealth(p) < 60).length
      case 'new':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return projectsArray.filter(p => p.createdAt && new Date(p.createdAt) > weekAgo).length
      default:
        return projectsArray.length
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="border-dashed border-2 border-slate-300">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Folder className="w-8 h-8 text-slate-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-slate-900 mb-2">
            No projects yet
          </CardTitle>
          <CardDescription className="text-center mb-6 max-w-sm">
            Create your first SEO project to start tracking keywords, rankings, and performance metrics.
          </CardDescription>
          <Button onClick={onCreateProject} data-testid="create-first-project">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)} data-testid="projects-grid">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900">Your Projects</h2>
          <p className="text-sm text-slate-600">
            Manage and monitor your SEO projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-40" data-testid="filter-select">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Projects ({getFilterBadgeCount('all')})
              </SelectItem>
              <SelectItem value="high-performance">
                High Performance ({getFilterBadgeCount('high-performance')})
              </SelectItem>
              <SelectItem value="needs-attention">
                Needs Attention ({getFilterBadgeCount('needs-attention')})
              </SelectItem>
              <SelectItem value="new">
                New Projects ({getFilterBadgeCount('new')})
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-36" data-testid="sort-select">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="keywords">Keywords</SelectItem>
              <SelectItem value="position">Position</SelectItem>
              <SelectItem value="health">Health Score</SelectItem>
            </SelectContent>
          </Select>

          {/* Create Project Button */}
          <Button onClick={onCreateProject} data-testid="create-project-button">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {filterBy !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Active filters:</span>
          <Badge variant="secondary" className="capitalize">
            {filterBy.replace('-', ' ')}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterBy('all')}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={onEditProject}
            onDelete={setDeleteProject}
            onView={onViewProject}
          />
        ))}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t">
        <span>
          Showing {sortedProjects.length} of {projects.length} projects
        </span>
        {sortedProjects.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Avg Health: {Math.round(sortedProjects.reduce((acc, p) => acc + getProjectHealth(p), 0) / sortedProjects.length)}%
            </span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProject} onOpenChange={() => setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProject?.name}"? This action cannot be undone.
              All keywords, rankings, and associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-project"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
