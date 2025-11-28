'use client';

import React, { useState, useCallback } from 'react';
import ProblemDisplay from '@/components/ProblemDisplay';
import ChatInterface from '@/components/ChatInterface';

interface DrawAction {
  type: 'addState' | 'addTransition' | 'clearCanvas';
  label?: string;
  isStart?: boolean;
  isAccept?: boolean;
  from?: string;
  to?: string;
  symbol?: string;
}

export default function Home() {
  const [canvasContext, setCanvasContext] = useState<any>(null);
  const [drawCommands, setDrawCommands] = useState<DrawAction[]>([]);

  const handleCanvasUpdate = useCallback((data: any) => {
    setCanvasContext(data);
  }, []);

  const handleDrawCommands = useCallback((actions: DrawAction[]) => {
    console.log('Home received draw commands:', actions);
    setDrawCommands(actions);
    // Clear commands after a short delay to allow re-triggering
    setTimeout(() => setDrawCommands([]), 100);
  }, []);

  return (
    <main className="flex h-screen w-full bg-slate-100 overflow-hidden">
      {/* Left Panel: Problem Display */}
      <div className="w-1/2 h-full border-r border-slate-200 bg-slate-50">
        <ProblemDisplay onCanvasUpdate={handleCanvasUpdate} drawCommands={drawCommands} />
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="w-1/2 h-full bg-white">
        <ChatInterface canvasContext={canvasContext} onDrawCommands={handleDrawCommands} />
      </div>
    </main>
  );
}
