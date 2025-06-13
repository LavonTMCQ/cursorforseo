'use client'

import { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

export function useAgentChat(socket: Socket | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const [agentStatus, setAgentStatus] = useState('Ready to help')

  // Listen for agent responses
  useEffect(() => {
    if (!socket) return

    socket.on('agent-message', (data: { content: string, timestamp?: string }) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: data.content,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        status: 'sent'
      }
      
      setMessages(prev => [
        ...prev.map(msg =>
          msg.status === 'sending' ? { ...msg, status: 'sent' as const } : msg
        ),
        newMessage
      ])
      setIsAgentTyping(false)
    })

    socket.on('agent-typing', (typing: boolean) => {
      setIsAgentTyping(typing)
    })

    socket.on('agent-status', (status: string) => {
      setAgentStatus(status)
    })

    socket.on('agent-error', (error: string) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: `❌ Error: ${error}`,
        timestamp: new Date(),
        status: 'error'
      }
      
      setMessages(prev => prev.concat(errorMessage))
      setIsAgentTyping(false)
      setAgentStatus('Error occurred')
    })

    return () => {
      socket.off('agent-message')
      socket.off('agent-typing')
      socket.off('agent-status')
      socket.off('agent-error')
    }
  }, [socket])

  const sendMessage = useCallback((content: string) => {
    if (!socket || !content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => prev.concat(userMessage))

    // Send to agent
    socket.emit('user-message', {
      content: content.trim(),
      timestamp: new Date().toISOString()
    })

    // Show agent typing
    setIsAgentTyping(true)
    setAgentStatus('Processing your request...')
  }, [socket])

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'agent',
        content: `👋 Hello! I'm your SEO Browser Agent. I can help you with:

🔍 **SEO Analysis** - Analyze websites for SEO opportunities
🏢 **Business Listings** - Check and manage your Google My Business
📝 **Form Automation** - Fill out forms and applications
🔗 **Competitor Research** - Research competitor strategies
📊 **Website Audits** - Comprehensive technical SEO audits

Just tell me what you'd like to do, and I'll take control of the browser to help you!`,
        timestamp: new Date(),
        status: 'sent'
      }
      setMessages([welcomeMessage])
    }
  }, [messages.length])

  return {
    messages,
    sendMessage,
    isAgentTyping,
    agentStatus
  }
}
