import {Background, BackgroundVariant, ReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Production from "./Production.tsx";
import SourceButton from "./SourceButton.tsx";
import React from "react";

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

const Canvas = React.memo(({ nodes, edges } : Props) => {
    const defaultViewport = {x: window.innerWidth / 2, y: window.innerHeight / 6, zoom: 0.5};

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