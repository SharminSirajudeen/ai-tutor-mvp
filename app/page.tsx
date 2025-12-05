'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ChatInterface from '@/components/ChatInterface';
import { Moon, Sun, Maximize2, Minimize2 } from 'lucide-react';

// Dynamically import AutomataCanvas
const AutomataCanvas = dynamic(() => import('@/components/AutomataCanvas'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[var(--surface)] flex items-center justify-center text-[var(--muted)]">Loading Canvas...</div>
});

export default function Home() {
  const [problemContext, setProblemContext] = useState<string | null>(null);
  const [canvasContext, setCanvasContext] = useState<any>(null);
  const [sidebarWidth, setSidebarWidth] = useState(400); // Initial width in pixels
  const [isDragging, setIsDragging] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [aiDrawCommands, setAiDrawCommands] = useState<any[]>([]);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('ai-tutor-theme');
    if (stored) {
      const isDark = stored === 'dark';
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('ai-tutor-theme', newMode ? 'dark' : 'light');
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProblemChange = useCallback((problem: string) => {
    setProblemContext(problem);
  }, []);

  const handleCanvasUpdate = useCallback((data: any) => {
    setCanvasContext(data);
  }, []);

  const handleAiDraw = useCallback((commands: any[]) => {
    setAiDrawCommands(commands);
  }, []);

  const startDragging = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    // Calculate new width from the right edge of the screen
    const newWidth = window.innerWidth - e.clientX;
    // Constrain width between 300px and 800px
    const constrainedWidth = Math.max(300, Math.min(800, newWidth));
    setSidebarWidth(constrainedWidth);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('mousemove', onDrag as any);
    } else {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('mousemove', onDrag as any);
    }
    return () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('mousemove', onDrag as any);
    };
  }, [isDragging]);

  return (
    <main className="flex flex-col h-screen w-full bg-[var(--background)] overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-[var(--surface)] border-b border-[var(--border)] animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold text-sm shadow-md">
              AT
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--foreground)]">AI Tutor</h1>
              <p className="text-[10px] text-[var(--muted)]">Theory of Computation</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-lg bg-[var(--background)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] transition-all"
            aria-label="Toggle dark mode"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-[var(--foreground)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--foreground)]" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-lg bg-[var(--background)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] transition-all hidden md:block"
            aria-label="Toggle fullscreen"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-[var(--foreground)]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[var(--foreground)]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content: Canvas (Fills remaining space) */}
        <div className="flex-1 h-full relative bg-[var(--canvas-bg)] md:flex hidden">
          <AutomataCanvas
            onCanvasUpdate={handleCanvasUpdate}
            drawCommands={aiDrawCommands}
          />
        </div>

        {/* Resize Handle - Desktop Only */}
        <div
          onMouseDown={startDragging}
          className="w-1 h-full bg-[var(--border)] hover:bg-[var(--primary)] cursor-col-resize flex items-center justify-center transition-all z-20 hidden md:flex"
        >
          <div className="h-12 w-1.5 bg-[var(--muted)] rounded-full transition-colors" />
        </div>

        {/* Right Sidebar: Chat Interface (Resizable on Desktop, Full Width on Mobile) */}
        <div
          style={{ width: sidebarWidth }}
          className="h-full bg-[var(--chat-bg)] border-l border-[var(--border)] flex-shrink-0 relative z-10 w-full md:w-auto"
        >
          <ChatInterface
            problemContext={problemContext}
            canvasContext={canvasContext}
            onProblemChange={handleProblemChange}
            onAiDraw={handleAiDraw}
          />
        </div>
      </div>

      {/* Mobile Canvas View (Full Screen Overlay) */}
      <div className="md:hidden fixed inset-0 bg-[var(--background)] z-50 hidden" id="mobile-canvas">
        <AutomataCanvas
          onCanvasUpdate={handleCanvasUpdate}
          drawCommands={aiDrawCommands}
        />
      </div>
    </main>
  );
}
