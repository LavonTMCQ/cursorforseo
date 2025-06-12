import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'
import express from 'express'
import cors from 'cors'
import { browserAutomation } from '../browser-automation'
import { openaiService } from '../openai-service'

const port = process.env.PORT || process.env.WEBSOCKET_PORT || 3001
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://localhost:3000'
]

let io: SocketIOServer | null = null

// Store active browser sessions
const activeSessions = new Map<string, {
  sessionId: string;
  currentUrl: string;
  lastActivity: Date;
  context: any;
}>()

export async function startWebSocketServer() {
  if (io) {
    console.log('🔗 WebSocket server already running')
    return io
  }

  try {
    // Create Express app for health checks and CORS
    const app = express()

    // Enable CORS
    app.use(cors({
      origin: allowedOrigins,
      credentials: true
    }))

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        activeSessions: activeSessions.size
      })
    })

    // Root endpoint
    app.get('/', (req, res) => {
      res.status(200).json({
        message: 'SEO Pro WebSocket Server',
        version: '1.0.0',
        status: 'running'
      })
    })

    // Create HTTP server with Express app
    const server = createServer(app)

    // Initialize Socket.IO
    io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    // Socket.IO connection handler
    io.on('connection', async (socket) => {
      console.log(`🔗 Client connected: ${socket.id}`)

      // Create browser session for this client
      try {
        await browserAutomation.createSession(socket.id)
        activeSessions.set(socket.id, {
          sessionId: socket.id,
          currentUrl: 'about:blank',
          lastActivity: new Date(),
          context: { messages: [] }
        })

        socket.emit('session-ready', {
          sessionId: socket.id,
          timestamp: new Date().toISOString()
        })

        // Send welcome message
        socket.emit('agent-status', 'Connected and ready to help!')
      } catch (error) {
        console.error('Failed to create browser session:', error)
        socket.emit('agent-error', 'Failed to initialize browser session')
      }

      // Handle user messages
      socket.on('user-message', async (data: { content: string, timestamp: string }) => {
        console.log(`💬 User message: ${data.content}`)

        try {
          const session = activeSessions.get(socket.id)
          if (!session) {
            socket.emit('agent-error', 'Session not found')
            return
          }

          // Update session activity
          session.lastActivity = new Date()

          // Show agent typing
          socket.emit('agent-typing', true)

          // Analyze user intent with AI
          const intent = await openaiService.interpretUserIntent(data.content)
          console.log('🧠 User intent:', intent)

          // Generate AI response
          const response = await openaiService.generateResponse(data.content, {
            currentUrl: session.currentUrl,
            previousMessages: session.context.messages || []
          })

          // Store message in context
          session.context.messages.push(
            { role: 'user', content: data.content },
            { role: 'assistant', content: response }
          )

          // Send agent response
          socket.emit('agent-message', {
            content: response,
            intent: intent.intent,
            timestamp: new Date().toISOString()
          })

          // Handle specific intents
          if (intent.intent === 'navigate' && (intent.extractedData?.url || intent.extractedData?.URL)) {
            const url = intent.extractedData.url || intent.extractedData.URL
            // Ensure URL has protocol
            const fullUrl = url.startsWith('http') ? url : `https://${url}`
            await handleNavigation(socket, fullUrl)
          } else if (intent.intent === 'analyze') {
            await handleSEOAnalysis(socket)
          } else if (intent.intent === 'form_fill' && intent.extractedData) {
            await handleFormFilling(socket, intent.extractedData)
          }

        } catch (error) {
          console.error('❌ Error processing message:', error)
          socket.emit('agent-error', 'Sorry, I encountered an error processing your request.')
        } finally {
          socket.emit('agent-typing', false)
        }
      })

      // Handle browser navigation
      socket.on('browser-navigate', async (data: { url: string }) => {
        await handleNavigation(socket, data.url)
      })

      // Handle browser actions
      socket.on('browser-action', async (data: any) => {
        try {
          const session = activeSessions.get(socket.id)
          if (!session) {
            socket.emit('agent-error', 'Session not found')
            return
          }

          switch (data.action) {
            case 'back':
              await browserAutomation.goBack(socket.id)
              socket.emit('agent-action', 'Going back')
              break
            case 'forward':
              await browserAutomation.goForward(socket.id)
              socket.emit('agent-action', 'Going forward')
              break
            case 'refresh':
              await browserAutomation.refresh(socket.id)
              socket.emit('agent-action', 'Refreshing page')
              break
            case 'screenshot':
              const screenshot = await browserAutomation.takeScreenshot(socket.id)
              socket.emit('browser-screenshot', { screenshot })
              break
            case 'click':
              await browserAutomation.clickElement(socket.id, data.x, data.y)
              socket.emit('agent-action', `Clicked at (${Math.round(data.x)}, ${Math.round(data.y)})`)
              // Take screenshot after click
              const newScreenshot = await browserAutomation.takeScreenshot(socket.id)
              socket.emit('browser-screenshot', { screenshot: newScreenshot })
              break
          }

          session.lastActivity = new Date()
        } catch (error) {
          console.error('Browser action error:', error)
          socket.emit('agent-error', `Failed to perform ${data.action}`)
        }
      })

      socket.on('disconnect', async (reason) => {
        console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`)

        // Clean up browser session
        try {
          await browserAutomation.closeSession(socket.id)
          activeSessions.delete(socket.id)
        } catch (error) {
          console.error('Error cleaning up session:', error)
        }
      })
    })

    // Start server
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 SEO Pro WebSocket server ready on port ${port}`)
      console.log(`📊 Health check available at http://localhost:${port}/health`)
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`)
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
    })

    return io
  } catch (error) {
    console.error('❌ Failed to start WebSocket server:', error)
    throw error
  }
}

// Handle browser navigation with real Playwright
async function handleNavigation(socket: any, url: string) {
  try {
    const session = activeSessions.get(socket.id)
    if (!session) {
      socket.emit('agent-error', 'Session not found')
      return
    }

    console.log('🌐 Navigate to:', url)

    socket.emit('browser-loading', true)
    socket.emit('agent-action', `Navigating to ${url}`)

    // Perform actual navigation
    await browserAutomation.navigateToUrl(socket.id, url)
    session.currentUrl = url

    // Take screenshot
    const screenshot = await browserAutomation.takeScreenshot(socket.id)

    socket.emit('browser-screenshot', {
      screenshot,
      url,
      timestamp: new Date().toISOString()
    })

    socket.emit('browser-loading', false)

  } catch (error) {
    console.error('Navigation error:', error)
    socket.emit('agent-error', `Failed to navigate to ${url}: ${error}`)
    socket.emit('browser-loading', false)
  }
}

// Handle form filling with AI
async function handleFormFilling(socket: any, formData: any) {
  try {
    const session = activeSessions.get(socket.id)
    if (!session) {
      socket.emit('agent-error', 'Session not found')
      return
    }

    console.log('📝 Form filling with data:', formData)
    socket.emit('agent-status', 'Filling out the form...')

    // Perform form filling
    await browserAutomation.fillForm(socket.id, formData)

    // Take screenshot after filling
    const screenshot = await browserAutomation.takeScreenshot(socket.id)
    socket.emit('browser-screenshot', {
      screenshot,
      url: session.currentUrl,
      timestamp: new Date().toISOString()
    })

    socket.emit('agent-message', {
      content: `✅ Form filled successfully! I've entered all the information you provided. The form is now ready for submission if needed.`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Form filling error:', error)
    socket.emit('agent-error', 'Failed to fill the form')
  }
}

// Handle SEO analysis with AI
async function handleSEOAnalysis(socket: any) {
  try {
    const session = activeSessions.get(socket.id)
    if (!session) {
      socket.emit('agent-error', 'Session not found')
      return
    }

    socket.emit('agent-status', 'Analyzing website for SEO...')

    // Perform SEO analysis
    const seoAnalysis = await browserAutomation.analyzeSEO(socket.id)

    // Generate business-friendly recommendations
    const recommendations = await openaiService.analyzeSEOForBusiness(seoAnalysis)

    // Generate report
    const report = await openaiService.generateBusinessFriendlyReport(seoAnalysis, recommendations)

    socket.emit('seo-analysis-complete', {
      analysis: seoAnalysis,
      recommendations,
      report,
      timestamp: new Date().toISOString()
    })

    socket.emit('agent-message', {
      content: `✅ SEO Analysis Complete!\n\n${report}`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('SEO analysis error:', error)
    socket.emit('agent-error', 'Failed to analyze SEO')
  }
}
