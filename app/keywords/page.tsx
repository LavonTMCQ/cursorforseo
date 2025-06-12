'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserProfile from '../components/UserProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, TrendingUp, Target, BarChart3 } from 'lucide-react'

export default function Keywords() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

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
  const keywords = [
    { id: 1, keyword: 'seo tools', volume: 12000, difficulty: 65, position: 8, trend: 'up' },
    { id: 2, keyword: 'keyword research', volume: 8500, difficulty: 72, position: 12, trend: 'down' },
    { id: 3, keyword: 'rank tracking', volume: 5200, difficulty: 58, position: 5, trend: 'up' },
    { id: 4, keyword: 'seo analytics', volume: 3800, difficulty: 61, position: 15, trend: 'stable' },
  ]

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
                <Link href="/keywords" className="nav-item active">Keywords</Link>
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

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl text-slate-900 mb-2">Keyword Research</h1>
          <p className="text-lg text-slate-600">
            Discover high-value keywords and track their performance across your projects.
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search for keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Keywords
          </Button>
        </div>

        {/* Keywords Grid */}
        <div className="grid gap-4">
          {keywords.map((keyword) => (
            <Card key={keyword.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{keyword.keyword}</h3>
                      <Badge variant={keyword.trend === 'up' ? 'default' : keyword.trend === 'down' ? 'destructive' : 'secondary'}>
                        {keyword.trend === 'up' ? '↗' : keyword.trend === 'down' ? '↘' : '→'} {keyword.trend}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>Volume: {keyword.volume.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>Difficulty: {keyword.difficulty}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Position: #{keyword.position}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Track
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {keywords.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No keywords found</h3>
              <p className="text-slate-600 mb-4">Start by adding keywords to track their performance.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Keyword
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
