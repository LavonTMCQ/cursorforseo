'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserProfile from '../components/UserProfile'
import CreateProjectModal from '../components/CreateProjectModal'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import ProjectsGrid from '@/components/projects/ProjectsGrid'
import { trpc } from '../../lib/trpc/client'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch user stats and projects using tRPC
  const { data: userStats, isLoading: statsLoading, refetch: refetchStats } = trpc.user.getStats.useQuery(
    undefined,
    { enabled: !!session }
  )
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = trpc.project.getAll.useQuery(
    undefined,
    { enabled: !!session }
  )

  const handleProjectCreated = () => {
    refetchStats()
    refetchProjects()
  }

  const handleEditProject = (project: any) => {
    // TODO: Implement edit project functionality
    console.log('Edit project:', project)
  }

  const handleDeleteProject = (projectId: string) => {
    // TODO: Implement delete project functionality
    console.log('Delete project:', projectId)
  }

  const handleViewProject = (project: any) => {
    // TODO: Navigate to project details page
    console.log('View project:', project)
  }

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin') // Not signed in
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="container">
          <div className="header-content">
            <div className="flex items-center gap-8">
              <div className="logo">SEO Pro</div>
              <nav className="nav-menu">
                <Link href="/dashboard" className="nav-item active">Dashboard</Link>
                <Link href="/keywords" className="nav-item">Keywords</Link>
                <Link href="/rankings" className="nav-item">Rankings</Link>
                <Link href="/audits" className="nav-item">Audits</Link>
                <Link href="/backlinks" className="nav-item">Backlinks</Link>
                <Link href="/agent-browser" className="nav-item">Browser Agent</Link>
                <Link href="/cursor-seo" className="nav-item">Cursor for SEO</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl text-slate-900 mb-2">Dashboard</h1>
          <p className="text-lg text-slate-600">
            Welcome to your SEO command center. Here's an overview of your projects and performance.
          </p>
        </div>

        {/* Enhanced Metrics Grid with shadcn/ui */}
        <MetricsGrid userStats={userStats} isLoading={statsLoading} />

        {/* Enhanced Projects Grid with shadcn/ui */}
        <ProjectsGrid
          projects={Array.isArray(projects) ? projects : []}
          isLoading={projectsLoading}
          onCreateProject={() => setIsCreateModalOpen(true)}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onViewProject={handleViewProject}
        />
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  )
}
