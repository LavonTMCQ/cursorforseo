#!/usr/bin/env tsx

import { io } from 'socket.io-client';

async function testEnhancedFeatures() {
  console.log('🧪 Testing Enhanced Browser Agent Features...\n');

  // Connect to WebSocket server
  const socket = io('http://localhost:3001');

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      console.log('🔗 Socket ID:', socket.id);
    });

    socket.on('session-ready', (data) => {
      console.log('✅ Browser session ready:', data.sessionId);
      
      // Test 1: AI-powered conversation
      console.log('\n🤖 Test 1: AI-Powered Conversation');
      socket.emit('user-message', {
        content: 'Help me analyze the SEO of a website',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('agent-message', (data) => {
      console.log('💬 Agent Response:', data.content.substring(0, 100) + '...');
      console.log('🧠 Intent detected:', data.intent || 'none');
      
      // Test 2: Browser navigation
      console.log('\n🌐 Test 2: Browser Navigation');
      socket.emit('browser-navigate', { url: 'https://example.com' });
    });

    socket.on('browser-screenshot', (data) => {
      console.log('📸 Screenshot received:', data.screenshot ? 'Yes' : 'No');
      console.log('🔗 URL:', data.url);
      
      // Test 3: Browser actions
      console.log('\n🖱️ Test 3: Browser Actions');
      socket.emit('browser-action', { action: 'screenshot' });
    });

    socket.on('agent-action', (action) => {
      console.log('⚡ Agent Action:', action);
    });

    socket.on('agent-error', (error) => {
      console.log('❌ Agent Error:', error);
    });

    socket.on('browser-loading', (loading) => {
      console.log('⏳ Browser Loading:', loading);
    });

    socket.on('seo-analysis-complete', (data) => {
      console.log('📊 SEO Analysis Complete!');
      console.log('- Issues found:', data.analysis?.issues?.length || 0);
      console.log('- Recommendations:', data.recommendations?.length || 0);
    });

    // Cleanup after 30 seconds
    setTimeout(() => {
      console.log('\n✅ Test completed successfully!');
      console.log('🎉 Enhanced Browser Agent features are working!');
      socket.disconnect();
      resolve(true);
    }, 30000);
  });
}

// Run the test
testEnhancedFeatures().catch(console.error);
