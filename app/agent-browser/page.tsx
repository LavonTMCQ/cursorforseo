'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ChatInterface } from '@/components/ui/chat-interface'
import { BrowserViewer } from '@/components/ui/browser-viewer'
import { io, Socket } from 'socket.io-client'
import { ArrowLeft, Home } from 'lucide-react'

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function AgentBrowser() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // WebSocket and UI state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [agentStatus, setAgentStatus] = useState('')

  // Browser state
  const [currentUrl, setCurrentUrl] = useState('about:blank')
  const [screenshot, setScreenshot] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Initialize WebSocket connection
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
    console.log('🔗 Connecting to WebSocket:', wsUrl);

    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('🔗 Connected to WebSocket server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server')
      setIsConnected(false)
    })

    newSocket.on('session-ready', (data) => {
      console.log('✅ Browser session ready:', data.sessionId)
    })

    newSocket.on('agent-status', (status) => {
      setAgentStatus(status)
    })

    newSocket.on('agent-typing', (typing) => {
      setIsTyping(typing)
    })

    newSocket.on('agent-message', (data) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        role: 'assistant',
        timestamp: new Date(data.timestamp)
      }
      setMessages(prev => [...prev, newMessage])
    })

    newSocket.on('browser-screenshot', (data) => {
      setScreenshot(data.screenshot)
      if (data.url) {
        setCurrentUrl(data.url)
      }
    })

    newSocket.on('browser-loading', (loading) => {
      setIsLoading(loading)
    })

    newSocket.on('agent-action', (action) => {
      setAgentStatus(action)
    })

    newSocket.on('agent-error', (error) => {
      console.error('Agent error:', error)
      setAgentStatus('Error: ' + error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [session, status, router])

  // Event handlers
  const handleSendMessage = (message: string) => {
    if (!socket || !isConnected) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    socket.emit('user-message', {
      content: message,
      timestamp: new Date().toISOString()
    })
  }

  const handleNavigate = (url: string) => {
    if (!socket || !isConnected) return
    socket.emit('browser-navigate', { url })
  }

  const handleBrowserAction = (action: string, data?: any) => {
    if (!socket || !isConnected) return
    socket.emit('browser-action', { action, ...data })
  }

  const handleElementClick = (x: number, y: number) => {
    handleBrowserAction('click', { x, y })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Clean OpenAI Canvas-inspired Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* App Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">SEO</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Browser Agent
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                AI-powered web automation
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Status and Navigation */}
        <div className="flex items-center gap-6">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'} transition-colors`} />
            <span className="text-sm text-gray-600 font-medium">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Home Button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="h-[calc(100vh-4rem)]">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30}>
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              isConnected={isConnected}
              placeholder="Ask me to help with SEO, forms, or web automation..."
            />
          </ResizablePanel>

          <ResizableHandle className="w-px bg-gray-200 hover:bg-gray-300 transition-colors" />

          <ResizablePanel defaultSize={60} minSize={40}>
            <BrowserViewer
              url={currentUrl}
              screenshot={screenshot}
              isLoading={isLoading}
              isConnected={isConnected}
              agentStatus={agentStatus}
              onNavigate={handleNavigate}
              onBack={() => handleBrowserAction('back')}
              onForward={() => handleBrowserAction('forward')}
              onRefresh={() => handleBrowserAction('refresh')}
              onHome={() => handleNavigate('about:blank')}
              onScreenshot={() => handleBrowserAction('screenshot')}
              onElementClick={handleElementClick}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
