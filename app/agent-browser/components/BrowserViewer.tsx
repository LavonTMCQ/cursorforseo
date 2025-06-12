'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Lock, 
  Globe,
  Loader2,
  Camera,
  MousePointer,
  Eye
} from 'lucide-react'

interface BrowserViewerProps {
  socket: any
  isConnected: boolean
}

export default function BrowserViewer({ socket, isConnected }: BrowserViewerProps) {
  const [currentUrl, setCurrentUrl] = useState('about:blank')
  const [urlInput, setUrlInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [agentAction, setAgentAction] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Listen for browser updates from WebSocket
  useEffect(() => {
    if (!socket) return

    socket.on('browser-screenshot', (data: { screenshot: string, url: string }) => {
      setScreenshot(data.screenshot)
      setCurrentUrl(data.url)
      setIsLoading(false)
    })

    socket.on('browser-loading', (loading: boolean) => {
      setIsLoading(loading)
    })

    socket.on('agent-action', (action: string) => {
      setAgentAction(action)
      setTimeout(() => setAgentAction(null), 3000)
    })

    return () => {
      socket.off('browser-screenshot')
      socket.off('browser-loading')
      socket.off('agent-action')
    }
  }, [socket])

  const handleNavigate = (url: string) => {
    if (!isConnected || !socket) return
    
    setIsLoading(true)
    socket.emit('browser-navigate', { url })
    setCurrentUrl(url)
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return
    
    let url = urlInput.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    handleNavigate(url)
    setUrlInput('')
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isConnected || !socket || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    socket.emit('browser-click', { x, y })
  }

  const browserActions = [
    { icon: ArrowLeft, label: 'Back', action: () => socket?.emit('browser-back') },
    { icon: ArrowRight, label: 'Forward', action: () => socket?.emit('browser-forward') },
    { icon: RotateCcw, label: 'Refresh', action: () => socket?.emit('browser-refresh') },
    { icon: Home, label: 'Home', action: () => handleNavigate('https://google.com') },
  ]

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Browser Controls */}
      <div className="p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2 mb-3">
          {browserActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={action.action}
              disabled={!isConnected}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
              title={action.label}
            >
              <action.icon className="w-4 h-4" />
            </Button>
          ))}
          
          <div className="flex-1 mx-2">
            <form onSubmit={handleUrlSubmit} className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 text-green-500" />
                )}
              </div>
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={currentUrl || "Enter URL..."}
                disabled={!isConnected}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
              />
            </form>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => socket?.emit('browser-screenshot')}
            disabled={!isConnected}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
            title="Take Screenshot"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        {/* Agent Action Indicator */}
        {agentAction && (
          <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-900/20 px-3 py-2 rounded">
            <MousePointer className="w-4 h-4" />
            <span>Agent: {agentAction}</span>
          </div>
        )}
      </div>

      {/* Browser Viewport */}
      <div className="flex-1 relative bg-white" ref={containerRef}>
        {!isConnected ? (
          <div className="h-full flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Browser Agent Disconnected
              </h3>
              <p className="text-slate-400">
                Connecting to browser automation service...
              </p>
            </div>
          </div>
        ) : screenshot ? (
          <div className="h-full relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-full object-contain cursor-pointer"
              style={{ 
                backgroundImage: `url(${screenshot})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  <span className="text-white">Loading page...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Ready to Browse
              </h3>
              <p className="text-slate-400 mb-4">
                Ask the agent to navigate to a website or enter a URL above
              </p>
              <Button
                onClick={() => handleNavigate('https://google.com')}
                disabled={!isConnected}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Google
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-slate-900 border-t border-slate-700 flex items-center px-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>URL: {currentUrl}</span>
          <span className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  )
}
