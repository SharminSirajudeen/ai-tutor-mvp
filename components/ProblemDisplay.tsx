'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AutomataCanvas = dynamic(() => import('./AutomataCanvas'), {
    ssr: false,
    loading: () => <div className="h-[500px] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400">Loading Canvas...</div>
});

// Removed shadcn imports


interface DrawAction {
    type: 'addState' | 'addTransition' | 'clearCanvas';
    label?: string;
    isStart?: boolean;
    isAccept?: boolean;
    from?: string;
    to?: string;
    symbol?: string;
}

interface ProblemDisplayProps {
    onCanvasUpdate?: (data: any) => void;
    drawCommands?: DrawAction[];
}

export default function ProblemDisplay({ onCanvasUpdate, drawCommands }: ProblemDisplayProps) {
    return (
        <div className="h-full p-6 bg-slate-50 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">NFA to DFA Conversion</h1>
                    <p className="text-slate-500">
                        Convert the following Non-Deterministic Finite Automaton (NFA) into an equivalent Deterministic Finite Automaton (DFA).
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">The NFA Specification</h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-[120px_1fr] gap-4 text-sm">
                            <div className="font-medium text-slate-500">States (Q)</div>
                            <div className="font-mono">{`{q0, q1, q2}`}</div>

                            <div className="font-medium text-slate-500">Alphabet (Σ)</div>
                            <div className="font-mono">{`{a, b}`}</div>

                            <div className="font-medium text-slate-500">Start State (q0)</div>
                            <div className="font-mono">q0</div>

                            <div className="font-medium text-slate-500">Accept States (F)</div>
                            <div className="font-mono">{`{q2}`}</div>
                        </div>

                        <div className="mt-6">
                            <div className="font-medium text-slate-500 mb-2">Transition Function (δ)</div>
                            <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm space-y-1 border border-slate-100">
                                <div className="grid grid-cols-3 gap-4 border-b border-slate-200 pb-2 mb-2 font-semibold text-slate-700">
                                    <span>State</span>
                                    <span>Input 'a'</span>
                                    <span>Input 'b'</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <span>q0</span>
                                    <span>{`{q0, q1}`}</span>
                                    <span>{`{q0}`}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <span>q1</span>
                                    <span>∅</span>
                                    <span>{`{q2}`}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <span>q2</span>
                                    <span>∅</span>
                                    <span>∅</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                    <h3 className="text-blue-900 font-semibold mb-2">Your Task</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        Construct the equivalent DFA using the <strong>subset construction algorithm</strong>.
                        Identify the start state, all reachable states, transitions for each state, and the final accepting states.
                    </p>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Interactive Workspace</h3>
                    <p className="text-slate-500 text-sm">Use this canvas to draw your DFA as you work.</p>
                    <AutomataCanvas onCanvasUpdate={onCanvasUpdate} drawCommands={drawCommands} />
                </div>
            </div>
        </div>
    );
}
