'use client'

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

interface SplitLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
}

export default function SplitLayout({ leftPanel, rightPanel }: SplitLayoutProps) {
  return (
    <PanelGroup direction="horizontal" className="h-full">
      {/* Left Panel - Chat Interface */}
      <Panel 
        defaultSize={40} 
        minSize={25} 
        maxSize={60}
        className="bg-slate-900"
      >
        {leftPanel}
      </Panel>
      
      {/* Resize Handle */}
      <PanelResizeHandle className="w-1 bg-slate-700 hover:bg-slate-600 transition-colors cursor-col-resize relative group">
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-slate-600 group-hover:bg-blue-500 transition-colors"></div>
      </PanelResizeHandle>
      
      {/* Right Panel - Browser Viewer */}
      <Panel 
        defaultSize={60} 
        minSize={40} 
        maxSize={75}
        className="bg-slate-800"
      >
        {rightPanel}
      </Panel>
    </PanelGroup>
  )
}
