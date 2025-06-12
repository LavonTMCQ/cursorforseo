'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔗 WebSocket connected')
      setIsConnected(true)
      reconnectAttempts.current = 0
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('🚫 WebSocket connection error:', error)
      reconnectAttempts.current++
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached')
        newSocket.disconnect()
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`)
      setIsConnected(true)
      reconnectAttempts.current = 0
    })

    newSocket.on('reconnect_error', (error) => {
      console.error('🔄❌ WebSocket reconnection error:', error)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('🔄❌ WebSocket reconnection failed')
      setIsConnected(false)
    })

    // Browser automation events
    newSocket.on('browser-ready', () => {
      console.log('🌐 Browser automation ready')
    })

    newSocket.on('browser-error', (error) => {
      console.error('🌐❌ Browser automation error:', error)
    })

    // Agent events
    newSocket.on('agent-status', (status) => {
      console.log('🤖 Agent status:', status)
    })

    newSocket.on('agent-error', (error) => {
      console.error('🤖❌ Agent error:', error)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection')
      newSocket.disconnect()
    }
  }, [])

  return {
    socket,
    isConnected
  }
}
