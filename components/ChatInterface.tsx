'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Eye, Settings, ChevronDown, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Available models (must match API route) - From Groq API
const MODELS = [
    { key: 'llama-3.3-70b', name: 'LLaMA 3.3 70B', description: 'Most capable' },
    { key: 'llama-4-scout', name: 'LLaMA 4 Scout', description: 'Newest model' },
    { key: 'qwen3-32b', name: 'Qwen 3 32B', description: 'Good balance' },
    { key: 'llama-3.1-8b', name: 'LLaMA 3.1 8B', description: 'Fastest' },
];

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface DrawAction {
    type: 'addState' | 'addTransition' | 'clearCanvas';
    label?: string;
    isStart?: boolean;
    isAccept?: boolean;
    from?: string;
    to?: string;
    symbol?: string;
}

interface ChatInterfaceProps {
    canvasContext?: any;
    onDrawCommands?: (actions: DrawAction[]) => void;
}

// Parse draw commands from AI response
function parseDrawCommands(content: string): { actions: DrawAction[], cleanContent: string } {
    const drawCommandRegex = /```draw-commands\s*([\s\S]*?)```/;
    const match = content.match(drawCommandRegex);

    if (!match) {
        return { actions: [], cleanContent: content };
    }

    try {
        const jsonStr = match[1].trim();
        const parsed = JSON.parse(jsonStr);
        const cleanContent = content.replace(drawCommandRegex, '').trim();
        return { actions: parsed.actions || [], cleanContent };
    } catch (e) {
        console.error('Failed to parse draw commands:', e);
        return { actions: [], cleanContent: content };
    }
}

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

export default function ChatInterface({ canvasContext, onDrawCommands }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your Socratic Tutor for this problem. I won't give you the answer, but I'll guide you through the subset construction method. Where would you like to start?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('llama-3.3-70b');
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
    const handleModelChange = (modelKey: string) => {
        setSelectedModel(modelKey);
        localStorage.setItem('ai-tutor-model', modelKey);
        setShowModelSelector(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            console.log('Sending message with context:', canvasContext, 'model:', selectedModel);
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }],
                    canvasContext,
                    modelKey: selectedModel
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();

            // Parse draw commands from AI response
            const { actions, cleanContent } = parseDrawCommands(data.content);

            // Execute draw commands if any
            if (actions.length > 0 && onDrawCommands) {
                console.log('Executing draw commands:', actions);
                onDrawCommands(actions);
            }

            // Display the clean content (without the JSON block)
            setMessages(prev => [...prev, { role: 'assistant', content: cleanContent || data.content }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                        <h2 className="font-semibold">AI Socratic Tutor</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <Eye className="w-3.5 h-3.5" />
                            <span>
                                {canvasContext?.nodes?.length > 0
                                    ? `${canvasContext.nodes.length} state${canvasContext.nodes.length > 1 ? 's' : ''}`
                                    : 'Watching'
                                }
                            </span>
                        </div>
                        {/* Usage Indicator */}
                        <div className={`text-xs px-2 py-1 rounded-full ${
                            usage.count >= DAILY_MESSAGE_LIMIT * 0.8
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                        }`}>
                            {DAILY_MESSAGE_LIMIT - usage.count} left today
                        </div>
                        {/* Model Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowModelSelector(!showModelSelector)}
                                className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full transition-colors"
                            >
                                <Settings className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-slate-700">{MODELS.find(m => m.key === selectedModel)?.name.split(' ')[0]}</span>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                            {showModelSelector && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
                                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 border-b border-slate-100">
                                        Select Model
                                    </div>
                                    {MODELS.map((model) => (
                                        <button
                                            key={model.key}
                                            onClick={() => handleModelChange(model.key)}
                                            className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between ${
                                                selectedModel === model.key ? 'bg-indigo-50' : ''
                                            }`}
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{model.name}</div>
                                                <div className="text-xs text-slate-500">{model.description}</div>
                                            </div>
                                            {selectedModel === model.key && (
                                                <span className="text-indigo-600">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-600'
                            }`}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={`rounded-2xl p-4 max-w-[85%] text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-none'
                            : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                            }`}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-sm prose-slate max-w-none
                                    prose-headings:text-indigo-900 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
                                    prose-h3:text-base prose-h3:border-b prose-h3:border-slate-200 prose-h3:pb-1
                                    prose-p:my-2 prose-p:leading-relaxed
                                    prose-ul:my-2 prose-ul:pl-4
                                    prose-li:my-1
                                    prose-code:bg-indigo-100 prose-code:text-indigo-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                                    prose-strong:text-slate-900
                                    prose-table:border-collapse prose-table:w-full prose-table:text-xs
                                    prose-th:bg-slate-100 prose-th:border prose-th:border-slate-300 prose-th:px-2 prose-th:py-1 prose-th:text-left
                                    prose-td:border prose-td:border-slate-300 prose-td:px-2 prose-td:py-1
                                    [&>*:first-child]:mt-0">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question or explain your step..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
                {/* Feedback Link */}
                <div className="mt-3 flex justify-center">
                    <a
                        href="https://github.com/SharminSirajudeen/ai-tutor-mvp/issues/new?title=Feedback&labels=feedback"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Give Feedback to Author</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
