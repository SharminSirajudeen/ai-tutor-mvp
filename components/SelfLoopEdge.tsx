import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';

export default function SelfLoopEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
}: EdgeProps) {
    // We ignore source/target positions for self-loop and force a top-loop
    // Assuming node width is roughly 60px.
    // sourceX, sourceY are the handle positions.

    // We use targetX/Y (which we forced to be the Top handle) as the anchor.
    const x = targetX;
    const y = targetY;

    // Draw a loop above the node.
    // Start at (x, y), go up-left, loop around to up-right, end at (x, y).
    // y is the top of the node. y-50 is above it.
    const path = `M ${x} ${y} C ${x - 30} ${y - 60}, ${x + 30} ${y - 60}, ${x} ${y}`;

    // Adjust label position to be at the top of the loop
    const labelX = x;
    const labelY = y - 55;

    return (
        <>
            <BaseEdge path={path} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: '#ffcc00',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    {label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
