'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserProfile from '../components/UserProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Minus, Calendar, Filter } from 'lucide-react'

export default function Rankings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('7d')

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
  const rankings = [
    { id: 1, keyword: 'seo tools', currentPosition: 8, previousPosition: 12, change: 4, url: '/seo-tools', project: 'Main Site' },
    { id: 2, keyword: 'keyword research', currentPosition: 12, previousPosition: 10, change: -2, url: '/keyword-research', project: 'Main Site' },
    { id: 3, keyword: 'rank tracking', currentPosition: 5, previousPosition: 5, change: 0, url: '/rank-tracking', project: 'Main Site' },
    { id: 4, keyword: 'seo analytics', currentPosition: 15, previousPosition: 18, change: 3, url: '/analytics', project: 'Main Site' },
  ]

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-slate-400" />
  }

  const getChangeBadge = (change: number) => {
    if (change > 0) return <Badge className="bg-green-100 text-green-800">+{change}</Badge>
    if (change < 0) return <Badge variant="destructive">{change}</Badge>
    return <Badge variant="secondary">0</Badge>
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
                <Link href="/rankings" className="nav-item active">Rankings</Link>
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

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl text-slate-900 mb-2">Rank Tracking</h1>
          <p className="text-lg text-slate-600">
            Monitor your keyword positions and track ranking changes over time.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Rankings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Rankings</CardTitle>
            <CardDescription>
              Current positions and recent changes for your tracked keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rankings.map((ranking) => (
                <div key={ranking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{ranking.keyword}</h3>
                      {getChangeBadge(ranking.change)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Project: {ranking.project}</span>
                      <span>URL: {ranking.url}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">#{ranking.currentPosition}</div>
                      <div className="text-xs text-slate-500">Current</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getChangeIcon(ranking.change)}
                      <div className="text-center">
                        <div className="text-sm font-medium text-slate-600">#{ranking.previousPosition}</div>
                        <div className="text-xs text-slate-500">Previous</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {rankings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No rankings to display</h3>
              <p className="text-slate-600 mb-4">Start tracking keywords to see their ranking positions.</p>
              <Button>
                <Link href="/keywords">
                  Add Keywords to Track
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
