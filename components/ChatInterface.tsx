'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, Settings2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Available models (must match API route) - From Groq API
const MODELS = [
    { key: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B', description: 'Most capable' },
    { key: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B', description: 'Fastest' },
    { key: 'llama-guard-3-8b', name: 'LLaMA Guard', description: 'Safety' },
];

// Rate limiting config
const DAILY_MESSAGE_LIMIT = 50; // Messages per day per student
const RATE_LIMIT_KEY = 'ai-tutor-usage';

interface UsageData {
    count: number;
    date: string;
}

function getUsage(): UsageData {
    if (typeof window === 'undefined') return { count: 0, date: new Date().toDateString() };
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return { count: 0, date: new Date().toDateString() };
    const data = JSON.parse(stored) as UsageData;
    // Reset if it's a new day
    if (data.date !== new Date().toDateString()) {
        return { count: 0, date: new Date().toDateString() };
    }
    return data;
}

function incrementUsage(): UsageData {
    const usage = getUsage();
    usage.count += 1;
    usage.date = new Date().toDateString();
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(usage));
    return usage;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    problemContext?: string | null;
    canvasContext?: any;
    onProblemChange?: (problem: string) => void;
    onAiDraw?: (commands: any[]) => void;
}

export default function ChatInterface({ problemContext, canvasContext, onProblemChange, onAiDraw }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your Socratic Tutor. Define your problem above to get started." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProblemExpanded, setIsProblemExpanded] = useState(true);
    const [localProblem, setLocalProblem] = useState('');

    const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
    const [showModelSelector, setShowModelSelector] = useState(false);
    const [usage, setUsage] = useState<UsageData>({ count: 0, date: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load saved model preference and usage from localStorage
    useEffect(() => {
        const savedModel = localStorage.getItem('ai-tutor-model');
        if (savedModel && MODELS.find(m => m.key === savedModel)) {
            setSelectedModel(savedModel);
        }
        setUsage(getUsage());
    }, []);

    // Save model preference to localStorage
    useEffect(() => {
        localStorage.setItem('ai-tutor-model', selectedModel);
    }, [selectedModel]);

    // Sync local problem state with prop
    useEffect(() => {
        if (problemContext) {
            setLocalProblem(problemContext);
            // Collapse problem section after it's set to save space
            setIsProblemExpanded(false);
            setMessages([
                { role: 'assistant', content: `I see you want to work on: "${problemContext}". Let's break this down. What is the first thing we need to define for this problem?` }
            ]);
        }
    }, [problemContext]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleProblemSubmit = () => {
        if (onProblemChange && localProblem.trim()) {
            onProblemChange(localProblem.trim());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Check rate limit
        const currentUsage = getUsage();
        if (currentUsage.count >= DAILY_MESSAGE_LIMIT) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `You've reached the daily limit of ${DAILY_MESSAGE_LIMIT} messages. Please come back tomorrow! This limit helps keep the service free for everyone.`
            }]);
            return;
        }

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Increment usage
        const newUsage = incrementUsage();
        setUsage(newUsage);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }],
                    modelKey: selectedModel,
                    problemContext,
                    canvasContext
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();

            // Handle text response
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);

            // Handle draw commands if present
            if (data.drawCommands && data.drawCommands.length > 0 && onAiDraw) {
                console.log('Received draw commands:', data.drawCommands);
                onAiDraw(data.drawCommands);
            }

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };



    // ... (existing code)

    return (
        <div className="flex flex-col h-full bg-[var(--chat-bg)] border-l border-[var(--border)]">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center animate-fade-in">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                        <div className="absolute -inset-1 bg-[var(--primary)] opacity-20 blur-md rounded-full animate-pulse-glow" />
                    </div>
                    <h2 className="font-semibold text-[var(--foreground)] text-base">AI Tutor</h2>
                </div>
                <div className="flex items-center gap-2">
                    {/* Usage Indicator */}
                    {usage.date && (
                        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium transition-all ${usage.count >= DAILY_MESSAGE_LIMIT * 0.8
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            }`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>{DAILY_MESSAGE_LIMIT - usage.count} left</span>
                        </div>
                    )}

                    {/* Model Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowModelSelector(!showModelSelector)}
                            className="flex items-center gap-1.5 text-xs bg-[var(--surface)] hover:bg-[var(--surface-elevated)] px-2.5 py-1.5 rounded-full transition-all font-medium border border-[var(--border)]"
                            aria-label="Select AI model"
                        >
                            <Settings2 className="w-3.5 h-3.5 text-[var(--muted)]" />
                            <span className="text-[var(--foreground)]">{MODELS.find(m => m.key === selectedModel)?.name.split(' ')[0]}</span>
                            <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
                        </button>
                        {showModelSelector && (
                            <div className="absolute right-0 top-full mt-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-xl py-1.5 min-w-[220px] z-50 animate-fade-in">
                                <div className="px-3 py-2 text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)]">
                                    Select Model
                                </div>
                                {MODELS.map((model) => (
                                    <button
                                        key={model.key}
                                        onClick={() => {
                                            setSelectedModel(model.key);
                                            setShowModelSelector(false);
                                        }}
                                        className={`w-full px-3 py-2.5 text-left hover:bg-[var(--surface)] flex items-center justify-between transition-colors ${selectedModel === model.key ? 'bg-[var(--primary)]/10' : ''
                                            }`}
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-[var(--foreground)]">{model.name}</div>
                                            <div className="text-xs text-[var(--muted)] mt-0.5">{model.description}</div>
                                        </div>
                                        {selectedModel === model.key && (
                                            <span className="text-[var(--primary)] text-lg">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Problem Definition Section */}
            <div className="border-b border-[var(--border)] bg-[var(--surface)]">
                <button
                    onClick={() => setIsProblemExpanded(!isProblemExpanded)}
                    className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-elevated)] transition-all"
                    aria-expanded={isProblemExpanded}
                    aria-label="Toggle problem context"
                >
                    <span className="tracking-wide">PROBLEM CONTEXT</span>
                    {isProblemExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isProblemExpanded && (
                    <div className="p-4 space-y-3 animate-fade-in">
                        <textarea
                            value={localProblem}
                            onChange={(e) => setLocalProblem(e.target.value)}
                            placeholder="Describe the problem (e.g., 'DFA for strings ending in ab')..."
                            className="w-full h-24 p-3 text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none resize-none transition-all"
                            aria-label="Problem description"
                        />
                        <button
                            onClick={handleProblemSubmit}
                            disabled={!localProblem.trim()}
                            className="w-full py-2.5 bg-[var(--primary)] text-white rounded-xl text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                            Update Context
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[var(--background)]">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[var(--message-user-bg)] text-white' : 'bg-[var(--primary)]/10 text-[var(--primary)]'}`}>
                            {msg.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                        </div>
                        <div className={`rounded-2xl p-4 max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[var(--message-user-bg)] text-white rounded-tr-none' : 'bg-[var(--message-ai-bg)] text-[var(--foreground)] border border-[var(--border)] rounded-tl-none'}`}>
                            <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 animate-fade-in">
                        <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Bot className="w-4.5 h-4.5" />
                        </div>
                        <div className="bg-[var(--message-ai-bg)] border border-[var(--border)] rounded-2xl rounded-tl-none p-4 flex items-center gap-2 shadow-sm">
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all shadow-sm"
                        disabled={isLoading || !problemContext}
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || !problemContext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                        aria-label="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
