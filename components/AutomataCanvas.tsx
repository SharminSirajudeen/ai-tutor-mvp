'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Panel,
    Handle,
    Position,
    MarkerType,
    Node,
    Edge,
    Connection,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import SelfLoopEdge from './SelfLoopEdge';

// Custom node component for automata states
const StateNode = ({ data, selected }: { data: any, selected: boolean }) => {
    const isAccept = data.isAccept;
    const isStart = data.isStart;

    return (
        <div
            style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                border: isAccept ? '4px double #51cf66' : '2px solid #333',
                backgroundColor: selected ? '#ff6b6b' : (isStart ? '#339af0' : '#f1f3f5'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                color: selected || isStart ? 'white' : 'black',
                position: 'relative',
            }}
        >
            <Handle type="target" position={Position.Top} id="top" className="w-3 h-3 bg-slate-400" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3 bg-slate-400" />
            <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-slate-400" />
            <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-slate-400" />
            {data.label}
            {isStart && (
                <div
                    style={{
                        position: 'absolute',
                        left: -30,
                        fontSize: '20px',
                    }}
                >
                    →
                </div>
            )}
        </div>
    );
};

const nodeTypes = {
    state: StateNode,
};

const edgeTypes = {
    selfLoop: SelfLoopEdge,
};

interface DrawAction {
    type: 'addState' | 'addTransition' | 'clearCanvas';
    label?: string;
    isStart?: boolean;
    isAccept?: boolean;
    from?: string;
    to?: string;
    symbol?: string;
}

interface AutomataCanvasProps {
    onCanvasUpdate?: (data: { nodes: Node[], edges: Edge[] }) => void;
    drawCommands?: DrawAction[];
}

export default function AutomataCanvas({ onCanvasUpdate, drawCommands }: AutomataCanvasProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [stateCounter, setStateCounter] = useState(0);
    const [mode, setMode] = useState('state'); // 'state', 'transition', 'delete'
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // Notify parent of changes with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onCanvasUpdate) {
                onCanvasUpdate({ nodes, edges });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [nodes, edges, onCanvasUpdate]);

    // Process incoming draw commands from AI
    useEffect(() => {
        if (!drawCommands || drawCommands.length === 0) return;

        console.log('AutomataCanvas processing draw commands:', drawCommands);

        // Calculate positions for new states in a grid layout
        const getNextPosition = (existingCount: number) => {
            const cols = 3;
            const spacingX = 150;
            const spacingY = 120;
            const startX = 100;
            const startY = 100;
            const col = existingCount % cols;
            const row = Math.floor(existingCount / cols);
            return { x: startX + col * spacingX, y: startY + row * spacingY };
        };

        let newNodes = [...nodes];
        let newEdges = [...edges];
        let newCounter = stateCounter;

        for (const action of drawCommands) {
            if (action.type === 'clearCanvas') {
                newNodes = [];
                newEdges = [];
                newCounter = 0;
            } else if (action.type === 'addState' && action.label) {
                // Check if state with this label already exists
                const exists = newNodes.some(n => n.data.label === action.label);
                if (!exists) {
                    const position = getNextPosition(newNodes.length);
                    const newNode: Node = {
                        id: `ai-${newCounter}`,
                        type: 'state',
                        position,
                        data: {
                            label: action.label,
                            isAccept: action.isAccept || false,
                            isStart: action.isStart || false,
                        },
                    };
                    newNodes.push(newNode);
                    newCounter++;
                }
            } else if (action.type === 'addTransition' && action.from && action.to && action.symbol) {
                // Find source and target nodes by label
                const sourceNode = newNodes.find(n => n.data.label === action.from);
                const targetNode = newNodes.find(n => n.data.label === action.to);

                if (sourceNode && targetNode) {
                    const isSelfLoop = sourceNode.id === targetNode.id;
                    const edgeId = `e-${sourceNode.id}-${targetNode.id}-${action.symbol}-${Date.now()}`;

                    // Check if edge already exists
                    const edgeExists = newEdges.some(
                        e => e.source === sourceNode.id && e.target === targetNode.id && e.label === action.symbol
                    );

                    if (!edgeExists) {
                        const newEdge: Edge = {
                            id: edgeId,
                            source: sourceNode.id,
                            target: targetNode.id,
                            label: action.symbol,
                            labelStyle: { fill: '#000', fontWeight: 700 },
                            markerEnd: { type: MarkerType.ArrowClosed },
                            style: { strokeWidth: 2 },
                            ...(isSelfLoop && {
                                type: 'selfLoop',
                                sourceHandle: 'right',
                                targetHandle: 'top',
                            }),
                        };
                        newEdges.push(newEdge);
                    }
                } else {
                    console.warn(`Could not find nodes for transition: ${action.from} -> ${action.to}`);
                }
            }
        }

        // Update state
        setNodes(newNodes);
        setEdges(newEdges);
        setStateCounter(newCounter);
    }, [drawCommands]);

    // Add new state with custom label prompt
    const addState = useCallback((position: { x: number, y: number }) => {
        const isFirst = nodes.length === 0;
        const defaultLabel = isFirst ? '{q0}' : `{q${stateCounter}}`;
        const label = prompt('Enter state label (e.g., {q0}, {q0,q1}):', defaultLabel);

        if (label === null || label.trim() === '') return; // Cancelled or empty

        // Check if label already exists
        const exists = nodes.some(n => n.data.label === label.trim());
        if (exists) {
            alert(`State "${label}" already exists!`);
            return;
        }

        const newNode = {
            id: `state-${Date.now()}`,
            type: 'state',
            position,
            data: {
                label: label.trim(),
                isAccept: false,
                isStart: isFirst, // First state is start by default
            },
        };
        setNodes((nds) => nds.concat(newNode));
        setStateCounter((c) => c + 1);
    }, [stateCounter, setNodes, nodes]);

    // Handle canvas click
    const onCanvasClick = useCallback((event: React.MouseEvent) => {
        if (mode === 'state' && reactFlowInstance) {
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            addState(position);
        }
    }, [mode, reactFlowInstance, addState]);

    // Handle node click
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        event.stopPropagation();
        if (mode === 'delete') {
            setNodes((nds) => nds.filter((n) => n.id !== node.id));
            setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
        } else if (mode === 'accept') {
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node.id) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                isAccept: !n.data.isAccept,
                            },
                        };
                    }
                    return n;
                })
            );
        } else if (mode === 'start') {
            // Toggle start state - only one can be start
            setNodes((nds) =>
                nds.map((n) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isStart: n.id === node.id ? !n.data.isStart : false,
                    },
                }))
            );
        } else if (mode === 'edit') {
            // Edit label mode
            const newLabel = prompt('Edit state label:', node.data.label);
            if (newLabel !== null && newLabel.trim() !== '') {
                // Check if new label already exists (excluding current node)
                const exists = nodes.some(n => n.id !== node.id && n.data.label === newLabel.trim());
                if (exists) {
                    alert(`State "${newLabel}" already exists!`);
                    return;
                }
                setNodes((nds) =>
                    nds.map((n) => {
                        if (n.id === node.id) {
                            return {
                                ...n,
                                data: {
                                    ...n.data,
                                    label: newLabel.trim(),
                                },
                            };
                        }
                        return n;
                    })
                );
            }
        }
    }, [mode, setNodes, setEdges, nodes]);

    // Handle node double-click to edit label (works in any mode)
    const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
        event.stopPropagation();
        const newLabel = prompt('Edit state label:', node.data.label);
        if (newLabel !== null && newLabel.trim() !== '') {
            // Check if new label already exists (excluding current node)
            const exists = nodes.some(n => n.id !== node.id && n.data.label === newLabel.trim());
            if (exists) {
                alert(`State "${newLabel}" already exists!`);
                return;
            }
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === node.id) {
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                label: newLabel.trim(),
                            },
                        };
                    }
                    return n;
                })
            );
        }
    }, [setNodes, nodes]);

    // Handle connection
    const onConnect = useCallback((params: Connection) => {
        const label = prompt('Enter transition symbol (e.g., 0, 1, ε):', 'a');
        if (label !== null) {
            const newEdge = {
                ...params,
                label,
                labelStyle: { fill: '#000', fontWeight: 700 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                },
                style: {
                    strokeWidth: 2,
                },
            };
            setEdges((eds) => addEdge(newEdge, eds));
        }
    }, [setEdges]);

    // Handle edge click to edit
    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        const newLabel = prompt('Edit transition symbol:', edge.label as string);
        if (newLabel !== null) {
            setEdges((eds) => eds.map((e) => {
                if (e.id === edge.id) {
                    return { ...e, label: newLabel };
                }
                return e;
            }));
        }
    }, [setEdges]);

    // Add self loop to selected node
    const addSelfLoop = useCallback(() => {
        // We need to find the selected node. 
        // Since we don't have a persistent 'selectedNode' state that tracks selection from ReactFlow's internal state easily without hooks,
        // we'll rely on our local 'onNodeClick' or just check 'nodes' for 'selected: true' if we were using that.
        // But wait, onNodeClick sets selectedNode? No, it sets it for our internal logic but ReactFlow handles selection too.
        // Let's iterate nodes to find the selected one.
        const selected = nodes.find(n => n.selected);
        if (!selected) {
            alert('Please select a state first!');
            return;
        }

        const label = prompt('Enter transition symbol for self-loop:', 'a');
        if (label !== null) {
            const newEdge = {
                id: `e${selected.id}-${selected.id}-${Date.now()}`,
                source: selected.id,
                target: selected.id,
                label,
                labelStyle: { fill: '#000', fontWeight: 700 },
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { strokeWidth: 2 },
                type: 'selfLoop',
                sourceHandle: 'right',
                targetHandle: 'top',
            };
            setEdges((eds) => addEdge(newEdge, eds));
        }
    }, [nodes, setEdges]);

    // Clear canvas
    const clearCanvas = () => {
        setNodes([]);
        setEdges([]);
        setStateCounter(0);
    };

    return (
        <div className="h-[500px] border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <ReactFlowProvider>
                <div ref={reactFlowWrapper} className="h-full w-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onPaneClick={onCanvasClick}
                        onNodeClick={onNodeClick}
                        onNodeDoubleClick={onNodeDoubleClick}
                        onEdgeClick={onEdgeClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                    >
                        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                        <MiniMap />
                        <Controls />

                        <Panel position="top-left">
                            <div className="bg-white p-3 rounded-lg shadow-md border border-slate-100">
                                <h3 className="font-semibold mb-2 text-sm text-slate-800">🎨 Builder</h3>

                                <div className="mb-3">
                                    <select
                                        value={mode}
                                        onChange={(e) => setMode(e.target.value)}
                                        className="w-full p-2 text-sm border border-slate-200 rounded-md outline-none focus:border-indigo-500"
                                    >
                                        <option value="state">Add State</option>
                                        <option value="transition">Add Transition (Drag)</option>
                                        <option value="edit">Edit Label (Click)</option>
                                        <option value="start">Toggle Start State</option>
                                        <option value="accept">Toggle Accept State</option>
                                        <option value="delete">Delete Item</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={addSelfLoop}
                                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium hover:bg-indigo-200 transition-colors w-full"
                                    >
                                        Add Self Loop (Select State First)
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={clearCanvas}
                                            className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-md text-xs font-medium hover:bg-amber-200 transition-colors flex-1"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 text-[10px] text-slate-500 space-y-1">
                                    <p>• Click canvas to add state</p>
                                    <p>• Drag between states for edge</p>
                                    <p>• <strong>Double-click</strong> state to edit label</p>
                                    <p>• Labels: {'{q0}'}, {'{q0,q1}'}, etc.</p>
                                </div>
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
        </div>
    );
}
