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
import dagre from 'dagre';

const nodeWidth = 60;
const nodeHeight = 60;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: 100,
        nodesep: 80
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};

// Custom node component for automata states
const StateNode = ({ data, selected }: { data: any, selected: boolean }) => {
    const isAccept = data.isAccept;
    const isStart = data.isStart;

    return (
        <div
            style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: isAccept ? '3px double var(--success)' : '2.5px solid var(--border)',
                backgroundColor: selected ? 'var(--primary)' : (isStart ? 'var(--accent)' : 'var(--surface-elevated)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '15px',
                color: selected || isStart ? 'white' : 'var(--foreground)',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 200ms ease',
            }}
            className="hover:scale-105"
        >
            <Handle type="target" position={Position.Top} id="top" className="w-2.5 h-2.5 !bg-[var(--primary)] !border-2 !border-white" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="w-2.5 h-2.5 !bg-[var(--primary)] !border-2 !border-white" />
            <Handle type="target" position={Position.Left} id="left" className="w-2.5 h-2.5 !bg-[var(--primary)] !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="right" className="w-2.5 h-2.5 !bg-[var(--primary)] !border-2 !border-white" />
            {data.label}
            {isStart && (
                <div
                    style={{
                        position: 'absolute',
                        left: -32,
                        fontSize: '24px',
                        color: 'var(--accent)',
                        fontWeight: 'bold',
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

    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);

    useEffect(() => {
        nodesRef.current = nodes;
        edgesRef.current = edges;
    }, [nodes, edges]);

    // Process incoming draw commands from AI
    useEffect(() => {
        if (!drawCommands || !Array.isArray(drawCommands) || drawCommands.length === 0) return;

        console.log('AutomataCanvas processing draw commands:', drawCommands);

        let newNodes = [...nodesRef.current];
        let newEdges = [...edgesRef.current];
        let newCounter = stateCounter;

        // If we are appending, we need to know the max ID to avoid collisions if stateCounter is stale
        // But stateCounter is state, so it might be stale in this closure if not in deps.
        // Let's just recalculate a safe counter base on existing nodes.
        const maxId = newNodes.reduce((max, node) => {
            const match = node.id.match(/ai-(\d+)/);
            if (match) return Math.max(max, parseInt(match[1]));
            return max;
        }, 0);
        newCounter = Math.max(stateCounter, maxId + 1);

        // First pass: Create all nodes and edges
        for (const action of drawCommands) {
            if (action.type === 'clearCanvas') {
                newNodes = [];
                newEdges = [];
                newCounter = 0;
            } else if (action.type === 'addState' && action.label) {
                // Check if state with this label already exists
                const exists = newNodes.some(n => n.data.label === action.label);
                if (!exists) {
                    const newNode: Node = {
                        id: `ai-${newCounter}`,
                        type: 'state',
                        position: { x: 0, y: 0 }, // Initial position, will be fixed by dagre
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

        // Apply Dagre layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            newEdges,
            'LR' // Left-to-Right layout
        );

        // Update state
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setStateCounter(newCounter);

        // Fit view to show the new graph
        if (reactFlowInstance) {
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
            }, 50);
        }
    }, [drawCommands, reactFlowInstance]);

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
        <div className="h-full w-full bg-[var(--canvas-bg)] overflow-hidden">
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
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={24}
                            size={1.5}
                            style={{ opacity: 0.4 }}
                        />
                        <MiniMap
                            nodeStrokeWidth={3}
                            nodeColor={(node) => {
                                if (node.data.isStart) return 'var(--accent)';
                                if (node.data.isAccept) return 'var(--success)';
                                return 'var(--surface-elevated)';
                            }}
                            maskColor="rgba(0, 0, 0, 0.1)"
                            style={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                            }}
                        />
                        <Controls
                            style={{
                                backgroundColor: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                            }}
                        />

                        <Panel position="top-left">
                            <div className="bg-[var(--surface-elevated)] p-4 rounded-xl shadow-lg border border-[var(--border)] backdrop-blur-sm animate-fade-in max-w-xs">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                                    <h3 className="font-semibold text-sm text-[var(--foreground)]">Automata Builder</h3>
                                </div>

                                <div className="mb-3">
                                    <label className="text-[10px] font-semibold text-[var(--muted)] mb-1.5 block tracking-wide">MODE</label>
                                    <select
                                        value={mode}
                                        onChange={(e) => setMode(e.target.value)}
                                        className="w-full p-2.5 text-xs border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 bg-[var(--background)] text-[var(--foreground)] transition-all font-medium"
                                        aria-label="Builder mode"
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
                                        className="px-3 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-xs font-semibold hover:bg-[var(--primary)]/20 transition-all w-full border border-[var(--primary)]/20"
                                        aria-label="Add self loop"
                                    >
                                        Add Self Loop
                                    </button>
                                    <button
                                        onClick={clearCanvas}
                                        className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all border border-amber-200 dark:border-amber-800"
                                        aria-label="Clear canvas"
                                    >
                                        Clear Canvas
                                    </button>
                                </div>

                                <div className="mt-3 pt-3 border-t border-[var(--border)] text-[10px] text-[var(--muted)] space-y-1.5">
                                    <p className="flex items-start gap-1.5">
                                        <span className="text-[var(--primary)] mt-0.5">•</span>
                                        <span>Click canvas to add state</span>
                                    </p>
                                    <p className="flex items-start gap-1.5">
                                        <span className="text-[var(--primary)] mt-0.5">•</span>
                                        <span>Drag between states for transition</span>
                                    </p>
                                    <p className="flex items-start gap-1.5">
                                        <span className="text-[var(--primary)] mt-0.5">•</span>
                                        <span><strong>Double-click</strong> state to edit label</span>
                                    </p>
                                    <p className="flex items-start gap-1.5">
                                        <span className="text-[var(--primary)] mt-0.5">•</span>
                                        <span>Use labels like {'{q0}'}, {'{q0,q1}'}</span>
                                    </p>
                                </div>
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
        </div>
    );
}
