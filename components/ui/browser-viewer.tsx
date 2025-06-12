"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Camera, 
  Globe,
  Loader2,
  Eye,
  Activity
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface BrowserViewerProps {
  url: string;
  screenshot?: string;
  isLoading?: boolean;
  isConnected?: boolean;
  agentStatus?: string;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onScreenshot: () => void;
  onElementClick?: (x: number, y: number) => void;
}

export function BrowserViewer({
  url,
  screenshot,
  isLoading = false,
  isConnected = false,
  agentStatus,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onHome,
  onScreenshot,
  onElementClick
}: BrowserViewerProps) {
  const [urlInput, setUrlInput] = useState(url);
  const [imageLoaded, setImageLoaded] = useState(false);
  const screenshotRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setUrlInput(url);
  }, [url]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onNavigate(urlInput.trim());
    }
  };

  const handleScreenshotClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (onElementClick && screenshotRef.current) {
      const rect = screenshotRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onElementClick(x, y);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Clean Browser Controls */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={!isConnected}
            className="h-9 w-9 p-0 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onForward}
            disabled={!isConnected}
            className="h-9 w-9 p-0 hover:bg-gray-200 rounded-lg"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={!isConnected}
            className="h-9 w-9 p-0 hover:bg-gray-200 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onHome}
            disabled={!isConnected}
            className="h-9 w-9 p-0 hover:bg-gray-200 rounded-lg"
          >
            <Home className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <form onSubmit={handleUrlSubmit} className="flex-1">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL..."
                disabled={!isConnected}
                className="h-9 text-sm border-gray-200 focus:ring-gray-900 focus:border-gray-900 rounded-lg"
              />
            </form>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onScreenshot}
            disabled={!isConnected}
            className="h-9 w-9 p-0 hover:bg-gray-200 rounded-lg"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Clean Agent Status */}
      {agentStatus && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-b border-blue-100 animate-fade-in">
          <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="text-sm text-blue-700 font-medium">
            Agent: {agentStatus}
          </span>
        </div>
      )}

      {/* Browser Content */}
      <div className="flex-1 relative bg-white">
        {screenshot ? (
          <div className="relative w-full h-full">
            <img
              ref={screenshotRef}
              src={screenshot}
              alt="Browser screenshot"
              className={`w-full h-full object-contain cursor-pointer transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onClick={handleScreenshotClick}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
            {isLoading && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200">
                <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
                <span className="text-sm font-medium text-gray-700">Loading...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
              <Eye className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Ready to Browse
            </h3>
            <p className="text-gray-600 mb-8 max-w-sm">
              Ask the agent to navigate to a website or enter a URL above
            </p>
            <Button
              onClick={() => onNavigate('https://google.com')}
              disabled={!isConnected}
              className="bg-gray-900 hover:bg-gray-800 rounded-lg px-6 py-2"
            >
              <Globe className="w-4 h-4 mr-2" />
              Go to Google
            </Button>
          </div>
        )}
      </div>

      {/* Clean Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-mono">
            URL: {url || 'about:blank'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
}
