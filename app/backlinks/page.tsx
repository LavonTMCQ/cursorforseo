'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserProfile from '../components/UserProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, Search, Filter, TrendingUp, Shield, Globe } from 'lucide-react'

export default function Backlinks() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

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
  const backlinks = [
    {
      id: 1,
      sourceUrl: 'https://techblog.com/seo-tools-review',
      targetUrl: 'https://teststore.com',
      anchorText: 'best SEO tools',
      domainAuthority: 75,
      pageAuthority: 68,
      linkType: 'dofollow',
      firstSeen: '2024-05-15',
      status: 'active'
    },
    {
      id: 2,
      sourceUrl: 'https://marketingguide.net/resources',
      targetUrl: 'https://teststore.com/features',
      anchorText: 'SEO analytics platform',
      domainAuthority: 62,
      pageAuthority: 55,
      linkType: 'dofollow',
      firstSeen: '2024-05-20',
      status: 'active'
    },
    {
      id: 3,
      sourceUrl: 'https://forum.seo.com/discussion/123',
      targetUrl: 'https://teststore.com',
      anchorText: 'check this out',
      domainAuthority: 45,
      pageAuthority: 32,
      linkType: 'nofollow',
      firstSeen: '2024-06-01',
      status: 'lost'
    }
  ]

  const stats = {
    totalBacklinks: 156,
    dofollow: 89,
    nofollow: 67,
    newThisMonth: 12,
    lostThisMonth: 3
  }

  const getLinkTypeBadge = (type: string) => {
    return type === 'dofollow' 
      ? <Badge className="bg-green-100 text-green-800">DoFollow</Badge>
      : <Badge variant="secondary">NoFollow</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'lost':
        return <Badge variant="destructive">Lost</Badge>
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
                <Link href="/audits" className="nav-item">Audits</Link>
                <Link href="/backlinks" className="nav-item active">Backlinks</Link>
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
          <h1 className="text-3xl text-slate-900 mb-2">Backlink Analysis</h1>
          <p className="text-lg text-slate-600">
            Monitor your backlink profile and discover new link building opportunities.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.totalBacklinks}</div>
              <div className="text-sm text-slate-600">Total Backlinks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.dofollow}</div>
              <div className="text-sm text-slate-600">DoFollow</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-600">{stats.nofollow}</div>
              <div className="text-sm text-slate-600">NoFollow</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</div>
              <div className="text-sm text-slate-600">New This Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.lostThisMonth}</div>
              <div className="text-sm text-slate-600">Lost This Month</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search backlinks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Links</SelectItem>
              <SelectItem value="dofollow">DoFollow Only</SelectItem>
              <SelectItem value="nofollow">NoFollow Only</SelectItem>
              <SelectItem value="active">Active Links</SelectItem>
              <SelectItem value="lost">Lost Links</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Backlinks List */}
        <Card>
          <CardHeader>
            <CardTitle>Backlink Profile</CardTitle>
            <CardDescription>
              Complete list of backlinks pointing to your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backlinks.map((backlink) => (
                <div key={backlink.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 truncate">{backlink.sourceUrl}</h3>
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      {getLinkTypeBadge(backlink.linkType)}
                      {getStatusBadge(backlink.status)}
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">Anchor text:</span> "{backlink.anchorText}"
                    </div>
                    <div className="text-sm text-slate-500">
                      Target: {backlink.targetUrl} • First seen: {backlink.firstSeen}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium">{backlink.domainAuthority}</span>
                      </div>
                      <div className="text-xs text-slate-500">DA</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium">{backlink.pageAuthority}</span>
                      </div>
                      <div className="text-xs text-slate-500">PA</div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
