import {Background, BackgroundVariant, ReactFlow, Viewport, Node} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ProductionNode from "./ProductionNode.tsx";
import SourceButtonNode from "./SourceButtonNode.tsx";

interface Edge {
    id: string;
    source: string;
    target: string;
}

interface Props {
    nodes: Node[];
    edges: Edge[];
}

const nodeTypes = {'production': ProductionNode, 'sourceButton': SourceButtonNode};

const getViewportCenter = (node: Node, zoom = 1): Viewport => {
    const centerX = node.position.x + window.innerWidth/2;
    const centerY = node.position.y + window.innerHeight/6;
    console.log(centerX, centerY, zoom);
    return { x: centerX, y: centerY, zoom };
};

const Canvas = ({ nodes, edges } : Props) => {
    const defaultViewport = getViewportCenter(nodes[0], 0.5);
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
}

export default Canvas;