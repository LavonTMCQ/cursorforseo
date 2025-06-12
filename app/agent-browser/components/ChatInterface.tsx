'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Loader2, Globe, Search, FileText, Settings } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isAgentTyping: boolean
  agentStatus: string
  isConnected: boolean
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isAgentTyping,
  agentStatus,
  isConnected
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isAgentTyping])

  const handleSend = () => {
    if (!inputValue.trim() || !isConnected) return
    
    onSendMessage(inputValue.trim())
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { icon: Globe, label: 'Analyze Website', command: 'Analyze the SEO of a website' },
    { icon: Search, label: 'Competitor Research', command: 'Research my competitors' },
    { icon: FileText, label: 'Fill Forms', command: 'Help me fill out business forms' },
    { icon: Settings, label: 'Manage Listings', command: 'Check my business listings' },
  ]

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">SEO Assistant</h2>
            <p className="text-xs text-slate-400">
              {isConnected ? agentStatus : 'Disconnected'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Welcome to SEO Browser Agent
              </h3>
              <p className="text-slate-400 mb-6">
                I can help you with SEO analysis, competitor research, form filling, and business automation. What would you like to do?
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 bg-slate-800 border-slate-600 hover:bg-slate-700 text-left"
                    onClick={() => onSendMessage(action.command)}
                    disabled={!isConnected}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <action.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{action.label}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'agent' && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.status === 'sending' && (
                    <Loader2 className="w-3 h-3 animate-spin opacity-70" />
                  )}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Agent Typing Indicator */}
          {isAgentTyping && (
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-slate-400">Agent is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Ask me to help with SEO, forms, or web automation..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || !isConnected}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
