import {Background, BackgroundVariant, ReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export interface TreeNode {
    id: number;
    quantity: number;
    productionType: "manufacturing"|"invention"|"reaction"|"pi"|"none";
    input: TreeNode[];
    isSuppressed: boolean;
}


const Canvas = () => {

    return (
        <div className="flex-1 relative overflow-hidden z-10 bg-window-dark">
            <ReactFlow
                defaultViewport={{x: 0, y:0, zoom: 0.5}}
                minZoom={0.1}
                maxZoom={1}
                fitView={false}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnDoubleClick={false}
            >
                <Background variant={BackgroundVariant.Cross} size={5} gap={90} lineWidth={1} color={"#777"}/>
            </ReactFlow>
        </div>
    );
}

export default Canvas;