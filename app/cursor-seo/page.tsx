'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PiPlusBold } from 'react-icons/pi';
import { io, Socket } from 'socket.io-client';
import CursorMessageList from './components/CursorMessageList';
import CursorChatInput from './components/CursorChatInput';
import './cursor-seo.css';

// Message types for our SEO-focused interface
interface SEOMessage {
  actor: 'USER' | 'SYSTEM' | 'SEO_AGENT';
  content: string;
  timestamp: number;
}

const CursorSEOPage = () => {
  const [messages, setMessages] = useState<SEOMessage[]>([]);
  const [inputEnabled, setInputEnabled] = useState(true);
  const [showStopButton, setShowStopButton] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Check for dark mode preference
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Socket.IO connection management
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
      console.log('🔗 Connecting to WebSocket:', wsUrl);

      const newSocket = io(wsUrl, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('🔗 Connected to Cursor SEO Socket.IO server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from Cursor SEO Socket.IO server');
        setIsConnected(false);
        setInputEnabled(true);
        setShowStopButton(false);
      });

      newSocket.on('session-ready', (data) => {
        console.log('✅ Browser session ready:', data.sessionId);
      });

      newSocket.on('agent-message', (data) => {
        console.log('📨 Received agent message:', data);
        appendMessage({
          actor: 'SEO_AGENT',
          content: data.content,
          timestamp: Date.now(),
        });
        setInputEnabled(true);
        setShowStopButton(false);
      });

      newSocket.on('agent-status', (status) => {
        console.log('📊 Agent status:', status);
      });

      newSocket.on('agent-error', (error) => {
        console.error('❌ Agent error:', error);
        appendMessage({
          actor: 'SYSTEM',
          content: `Error: ${error}`,
          timestamp: Date.now(),
        });
        setInputEnabled(true);
        setShowStopButton(false);
      });

      socketRef.current = newSocket;
    } catch (error) {
      console.error('Failed to connect to Socket.IO:', error);
      setIsConnected(false);
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connectSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectSocket]);

  const appendMessage = useCallback((newMessage: SEOMessage) => {
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !isConnected) return;

    // Add user message
    const userMessage: SEOMessage = {
      actor: 'USER',
      content: text,
      timestamp: Date.now(),
    };
    appendMessage(userMessage);

    // Disable input and show stop button
    setInputEnabled(false);
    setShowStopButton(true);

    // Send to Socket.IO server
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('user-message', {
          content: text,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error('Socket.IO not connected');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      appendMessage({
        actor: 'SYSTEM',
        content: 'Failed to send message. Please check your connection.',
        timestamp: Date.now(),
      });
      setInputEnabled(true);
      setShowStopButton(false);
    }
  };

  const handleStopTask = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stop-task', {
        timestamp: new Date().toISOString(),
      });
    }
    setInputEnabled(true);
    setShowStopButton(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputEnabled(true);
    setShowStopButton(false);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div
          className={`flex h-screen flex-col ${
            isDarkMode ? 'bg-slate-900' : "bg-gradient-to-br from-blue-50 to-indigo-100"
          } overflow-hidden border ${
            isDarkMode ? 'border-sky-800' : 'border-blue-200'
          } rounded-2xl shadow-2xl`}
        >
          {/* Header */}
          <header className="cursor-header relative">
            <div className="cursor-header-logo">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Cursor for SEO
                  </h1>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    AI-Powered SEO Automation
                  </p>
                </div>
              </div>
            </div>
            <div className="cursor-header-icons">
              <button
                type="button"
                onClick={handleNewChat}
                className={`cursor-header-icon ${
                  isDarkMode ? 'text-sky-400 hover:text-sky-300' : 'text-blue-500 hover:text-blue-600'
                } cursor-pointer`}
                aria-label="New Chat"
              >
                <PiPlusBold size={20} />
              </button>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </header>

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-2xl">C</span>
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome to Cursor for SEO
                </h2>
                <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your AI-powered SEO automation assistant. I can help you with website analysis, 
                  keyword research, competitor analysis, form filling, and much more.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                    <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🔍 SEO Analysis
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Analyze websites for SEO optimization opportunities
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                    <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      📝 Form Automation
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Automatically fill out forms and submit data
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                    <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🏢 Competitor Research
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Research competitor websites and strategies
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                    <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🌐 Web Navigation
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Navigate websites and extract information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          {messages.length > 0 && (
            <div className={`scrollbar-gutter-stable flex-1 overflow-x-hidden overflow-y-scroll scroll-smooth p-4 ${
              isDarkMode ? 'bg-slate-900/80' : ''
            }`}>
              <CursorMessageList messages={messages} isDarkMode={isDarkMode} />
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          <div className={`border-t ${
            isDarkMode ? 'border-sky-900' : 'border-blue-100'
          } p-4 shadow-sm backdrop-blur-sm`}>
            <CursorChatInput
              onSendMessage={handleSendMessage}
              onStopTask={handleStopTask}
              disabled={!inputEnabled || !isConnected}
              showStopButton={showStopButton}
              isDarkMode={isDarkMode}
              placeholder="Ask me to help with SEO analysis, form filling, or web automation..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursorSEOPage;
