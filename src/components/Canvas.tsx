import {Background, BackgroundVariant, ReactFlow, Viewport} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Production from "./Production.tsx";
import SourceButton from "./SourceButton.tsx";
import React, { useMemo } from "react";

interface ProductionNode {
    id: string;
    type: "production";
    position: { x: number; y: number };
    data: { typeID: number; quantity: number };
}

interface ButtonNode {
    id: string;
    type: "sourceButton";
    position: { x: number; y: number };
    data: { state: "expanded" | "collapsed"; variant: "manufacturing" | "invention" | "reaction" | "pi" | ""; parentID: number };
}

type DisplayNode = ProductionNode | ButtonNode;

interface Edge {
    id: string;
    source: string;
    target: string;
}

interface Props {
    nodes: DisplayNode[];
    edges: Edge[];
}

const nodeTypes = {'production': Production, 'sourceButton': SourceButton};

const getViewportCenter = (node: DisplayNode, zoom = 1): Viewport => {
    const centerX = node.position.x + window.innerWidth/2;
    const centerY = node.position.y + window.innerHeight/6;
    return { x: centerX, y: centerY, zoom };
};

const Canvas = React.memo(({ nodes, edges } : Props) => {
    const defaultViewport = useMemo(() => {
        if (nodes.length > 0) {
            return getViewportCenter(nodes[0], 0.5);
        }
        return { x: 0, y: 0, zoom: 0.5 };
    }, [nodes]);

    return (
        <div className="flex-1 relative overflow-hidden z-10 bg-window-dark">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeOrigin={[0.5, 0.5]}
                nodeTypes={nodeTypes}
                defaultViewport={defaultViewport}
                minZoom={0.1}
                maxZoom={1}
                proOptions={{ hideAttribution: true }}
            >
                <Background variant={BackgroundVariant.Cross} size={5} gap={90} lineWidth={1} color={"#777"}/>
            </ReactFlow>
        </div>
    );
});

export default Canvas;