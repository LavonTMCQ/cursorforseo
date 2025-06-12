'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserProfile from '../components/UserProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, XCircle, Clock, Play, FileText } from 'lucide-react'

export default function Audits() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Mock data for demonstration
  const audits = [
    {
      id: 1,
      url: 'https://teststore.com',
      status: 'completed',
      score: 85,
      issues: { critical: 2, warning: 5, info: 12 },
      lastRun: '2024-06-11T10:30:00Z',
      duration: '2m 34s'
    },
    {
      id: 2,
      url: 'https://example.com',
      status: 'running',
      score: null,
      issues: null,
      lastRun: '2024-06-11T11:00:00Z',
      duration: null
    }
  ]

  const auditIssues = [
    {
      id: 1,
      type: 'critical',
      title: 'Missing meta descriptions',
      description: '15 pages are missing meta descriptions',
      impact: 'High impact on click-through rates',
      pages: 15
    },
    {
      id: 2,
      type: 'warning',
      title: 'Large image files',
      description: 'Images larger than 1MB detected',
      impact: 'Affects page load speed',
      pages: 8
    },
    {
      id: 3,
      type: 'info',
      title: 'Alt text optimization',
      description: 'Some images could benefit from better alt text',
      impact: 'Minor accessibility improvement',
      pages: 23
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />
    }
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />
    }
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
                <Link href="/dashboard" className="nav-item">Dashboard</Link>
                <Link href="/keywords" className="nav-item">Keywords</Link>
                <Link href="/rankings" className="nav-item">Rankings</Link>
                <Link href="/audits" className="nav-item active">Audits</Link>
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

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl text-slate-900 mb-2">SEO Audits</h1>
          <p className="text-lg text-slate-600">
            Comprehensive technical SEO analysis with actionable recommendations.
          </p>
        </div>

        {/* Start New Audit */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Run New Audit</CardTitle>
            <CardDescription>
              Analyze your website for SEO issues and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start New Audit
            </Button>
          </CardContent>
        </Card>

        {/* Recent Audits */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audits</CardTitle>
              <CardDescription>
                View and manage your website audit history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(audit.status)}
                      <div>
                        <h3 className="font-semibold text-slate-900">{audit.url}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>Last run: {new Date(audit.lastRun).toLocaleDateString()}</span>
                          {audit.duration && <span>Duration: {audit.duration}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {audit.score && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{audit.score}</div>
                          <div className="text-xs text-slate-500">Score</div>
                        </div>
                      )}
                      {audit.issues && (
                        <div className="flex gap-2">
                          <Badge variant="destructive">{audit.issues.critical}</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800">{audit.issues.warning}</Badge>
                          <Badge variant="secondary">{audit.issues.info}</Badge>
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Issues</CardTitle>
            <CardDescription>
              Most recent SEO issues found across your audits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditIssues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{issue.title}</h3>
                    <p className="text-slate-600 mb-2">{issue.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{issue.pages} pages affected</span>
                      <span>{issue.impact}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Fix Issue
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
