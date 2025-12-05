'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import AutomataCanvas to avoid SSR issues
const AutomataCanvas = dynamic(() => import('./AutomataCanvas'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-400">Loading Canvas...</div>
});

interface UserInputPanelProps {
  onProblemSubmit: (problemDescription: string) => void;
  onCanvasUpdate?: (data: any) => void;
}

export default function UserInputPanel({ onProblemSubmit, onCanvasUpdate }: UserInputPanelProps) {
  const [input, setInput] = useState('');
  const [inputHeight, setInputHeight] = useState(300); // Initial height in pixels
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onProblemSubmit(input.trim());
    }
  };

  const startDragging = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    // Constrain height between 100px and 600px
    const newHeight = Math.max(100, Math.min(600, e.clientY));
    setInputHeight(newHeight);
  };

  // Global mouse up/move handlers
  React.useEffect(() => {
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
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Section: Problem Input (Resizable) */}
      <div
        style={{ height: inputHeight }}
        className="border-b border-slate-200 bg-white shadow-sm z-10 flex flex-col"
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4 h-full flex flex-col">
            <div className="space-y-2 flex-shrink-0">
              <h1 className="text-2xl font-bold text-slate-900">Problem & Workspace</h1>
              <p className="text-slate-600 text-sm">
                Describe your problem below, then use the canvas to draw your solution.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Design a DFA that accepts strings ending in 'ab'..."
                className="w-full flex-1 p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                Set Problem Context
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Drag Handle */}
      <div
        onMouseDown={startDragging}
        className="h-2 bg-slate-100 hover:bg-indigo-100 cursor-row-resize flex items-center justify-center border-b border-slate-200 transition-colors group"
      >
        <div className="w-12 h-1 bg-slate-300 rounded-full group-hover:bg-indigo-400 transition-colors" />
      </div>

      {/* Bottom Section: Canvas (Fills remaining space) */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/50">
        <div className="absolute inset-0 p-4">
          <div className="h-full w-full border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <AutomataCanvas onCanvasUpdate={onCanvasUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}
