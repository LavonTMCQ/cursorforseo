#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
import { startWebSocketServer } from '../lib/websocket/server'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  try {
    console.log('🚀 Starting WebSocket server...')

    // Verify OpenAI API key is loaded
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.warn('⚠️  OpenAI API key not found or not configured properly')
      console.log('🔧 Using fallback responses for chat functionality')
    } else {
      console.log('✅ OpenAI API key loaded successfully')
    }

    await startWebSocketServer()
    console.log('✅ WebSocket server started successfully')
  } catch (error) {
    console.error('❌ Failed to start WebSocket server:', error)
    process.exit(1)
  }
}

main()
