import schemesLookupData from "../assets/data/schemes_lookup.json";
import schemesData from "../assets/data/schemes.json";
import {hierarchy, tree} from "d3-hierarchy";

interface Material {
    quantity: number;
    typeID: number;
}

interface Scheme {
    materials: Material[];
    products: Material[];
    type: string;
}

interface Schemes {
    [key: string]: Scheme;
}

interface SchemesLookup {
    [key: string]: number;
}

interface MaterialTree {
    id: number;
    typeID: number;
    quantity: number;
    state: "expanded"|"collapsed",
    depth: number;
    productionType: "manufacturing" | "invention" | "reaction" | "pi" | "";
    children: MaterialTree[];
}

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

interface DAGNode {
    id: string; // Unique identifier for the node
    typeID: number;
    quantity: number; // Total quantity aggregated from all occurrences
    state: "expanded" | "collapsed";
    depth: number;
    productionType: "manufacturing" | "invention" | "reaction" | "pi" | "";
}

interface DAGEdge {
    source: string; // Source node ID
    target: string; // Target node ID
}

interface DirectedAcyclicGraph {
    nodes: DAGNode[];
    edges: DAGEdge[];
}

const schemesLookup = schemesLookupData as SchemesLookup;
const schemes = schemesData as Schemes;

export function quantityToString(quantity: number, format: "long"|"short") {
    if (format === "long") {
        return quantity.toLocaleString("en-US");
    } else if (format === "short") {
        const length = quantity.toString().length;
        if (length < 5) {
            return quantity.toLocaleString("en-US");
        }else if (length == 5){
            return (quantity/1e3).toFixed(2) + "K";
        }else if (length < 9){
            return (quantity/1e6).toFixed(2) + "M";
        }else if (length < 12){
            return (quantity/1e9).toFixed(2) + "B";
        }else if (length < 15){
            return (quantity/1e12).toFixed(2) + "T";
        }else{
            return (quantity/1e15).toFixed(2) + "Q";
        }
    }
}

let currentId = 0;
function getUniqueId(isRoot: boolean = true): number {
    if (isRoot) currentId = 0;
    return ++currentId;
}

export function getTree(typeID: number, multiplier: number = 1, isRoot: boolean = true, depth: number = 1): MaterialTree {
    const node: MaterialTree = {
        id: getUniqueId(isRoot),
        typeID,
        quantity: multiplier,
        state: "expanded",
        depth: depth,
        productionType: "",
        children: []
    };


    const typeIDStr = typeID.toString();
    if (Object.prototype.hasOwnProperty.call(schemesLookup, typeIDStr)) {
        const schemeID = schemesLookup[typeIDStr].toString();
        if (Object.prototype.hasOwnProperty.call(schemes, schemeID)) {
            const recipe: Scheme = schemes[schemeID];
            node.productionType = recipe.type as "manufacturing" | "invention" | "reaction" | "pi"
            if (node.productionType === "pi") {
                node.state = "collapsed";
            }
            recipe.materials.forEach((material: Material) => {
                const childTree = getTree(material.typeID, material.quantity * multiplier, false, depth + 1);
                node.children.push(childTree);
            });
        }
    }
    return node;
}

export function toggleNode(tree: MaterialTree, targetId: number): MaterialTree {
    if (tree.id === targetId) {
        if(tree.state === "expanded") {
            return {...tree, state: "collapsed"};
        }else if (tree.state === "collapsed") {
            return {...tree, state: "expanded"};
        }
    }
    return {
        ...tree,
        children: tree.children.map((child) => toggleNode(child, targetId))
    };
}

export function computeNodePositions(
    root: MaterialTree,
    margin: number = 20
): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();

    const nodeWidth = 90 + 2 * margin;
    const nodeHeight = 170 + 2 * margin;

    const d3Root = hierarchy(root, (node) => (node.state === "expanded" ? node.children : []));

    const treeLayout = tree<MaterialTree>().nodeSize([nodeWidth, nodeHeight]);

    treeLayout(d3Root);

    d3Root.each((node) => {
        positions.set(String(node.data.id), { x: node.x!, y: node.y! });

        // Add a position for the button node if applicable
        if (node.data.productionType !== "") {
            positions.set(`b${node.data.id}`, { x: node.x!, y: node.y! + nodeHeight / 2 });
        }
    });

    return positions;
}




export function generateDisplayNodes(tree: MaterialTree, separation: number = 20): DisplayNode[] {
    const positions = computeNodePositions(tree, separation);

    const getPosition = (id: number | string): { x: number; y: number } =>
        positions.get(String(id)) || { x: 0, y: 0 };

    const nodes: DisplayNode[] = [];

    function traverse(node: MaterialTree): void {
        const pos = getPosition(node.id);

        const productionNode: ProductionNode = {
            id: node.id.toString(),
            type: "production",
            position: pos,
            data: { typeID: node.typeID, quantity: node.quantity }
        };
        nodes.push(productionNode);

        if (node.productionType !== "") {
            const buttonId = `b${node.id}`;
            nodes.push({
                id: buttonId,
                type: "sourceButton",
                position: getPosition(buttonId),
                data: { state: node.state, variant: node.productionType, parentID: node.id }
            });
        }

        if (node.state === "collapsed") return;

        node.children.forEach(traverse);
    }

    traverse(tree);

    return nodes;
}

export function generateConnections(tree: MaterialTree, edges: Edge[] = []): Edge[] {
    const nodeId = tree.id;
    const buttonId = `b${nodeId}`;

    if (tree.productionType !== "") {
        edges.push({ id: `e${nodeId}-${buttonId}`, source: nodeId.toString(), target: buttonId });
    }

    if (tree.state === "expanded") {
        for (const child of tree.children) {
            edges.push({ id: `e${buttonId}-${child.id}`, source: buttonId, target: child.id.toString() });
            generateConnections(child, edges);
        }
    }

    return edges;
}

export function materialTreeToDAG(tree: MaterialTree): DirectedAcyclicGraph {
    const nodeMap = new Map<number, DAGNode>(); // Unique nodes by typeID
    const edges: DAGEdge[] = []; // Array to store edges

    function traverse(node: MaterialTree, parentId: string | null = null): void {
        // Create or update the DAG node for the current material
        if (!nodeMap.has(node.typeID)) {
            nodeMap.set(node.typeID, {
                id: node.typeID.toString(),
                typeID: node.typeID,
                quantity: node.quantity,
                state: node.state,
                depth: node.depth,
                productionType: node.productionType,
            });
        } else {
            const dagNode = nodeMap.get(node.typeID)!;
            dagNode.quantity += node.quantity;
            dagNode.depth = Math.max(dagNode.depth, node.depth);
        }

        // If there is a parent, add an edge from the parent (product) to the current material
        if (parentId) {
            edges.push({
                source: parentId,
                target: node.typeID.toString(),
            });
        }

        // Recursively process children
        node.children.forEach(child => traverse(child, node.typeID.toString()));
    }

    // Start traversal from the root
    traverse(tree);

    // Prune redundant edges by keeping only unique source-target pairs
    const uniqueEdgesMap = new Map<string, DAGEdge>();
    edges.forEach(edge => {
        const key = `${edge.source}-${edge.target}`;
        if (!uniqueEdgesMap.has(key)) {
            uniqueEdgesMap.set(key, edge);
        }
    });
    const uniqueEdges = Array.from(uniqueEdgesMap.values());

    // Convert the node map to an array
    const nodes = Array.from(nodeMap.values());
    return { nodes, edges: uniqueEdges };
}


export function computeNodePositionsDAG(
    nodes: DAGNode[],
    edges: DAGEdge[],
    typeToDesc: { [key: string]: { group: string } },
    layerSeparation: number = 200,  // Increased vertical spacing
    nodeSeparation: number = 150    // Increased horizontal spacing
): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();
    const nodeLayer = new Map<string, number>();

    // Build maps of incoming and outgoing edges for clarity.
    const incomingEdges = new Map<string, DAGEdge[]>();
    const outgoingEdges = new Map<string, DAGEdge[]>();
    edges.forEach(edge => {
        if (!incomingEdges.has(edge.target)) {
            incomingEdges.set(edge.target, []);
        }
        incomingEdges.get(edge.target)!.push(edge);

        if (!outgoingEdges.has(edge.source)) {
            outgoingEdges.set(edge.source, []);
        }
        outgoingEdges.get(edge.source)!.push(edge);
    });

    // Step 1: Initialize layers.
    // Base materials (nodes with no outgoing edges) are set to layer 0.
    nodes.forEach(node => {
        if (!outgoingEdges.has(node.id)) {
            // Base material: no children
            nodeLayer.set(node.id, 0);
        } else {
            nodeLayer.set(node.id, 0);
        }
    });

    // Step 2: Propagate layers upward.
    // For each edge (from product to material), the product should be placed one layer above the material.
    let changed = true;
    while (changed) {
        changed = false;
        edges.forEach(edge => {
            const materialLayer = nodeLayer.get(edge.target) ?? 0;
            const newProductLayer = materialLayer + 1;
            const currentProductLayer = nodeLayer.get(edge.source) ?? 0;
            if (newProductLayer > currentProductLayer) {
                nodeLayer.set(edge.source, newProductLayer);
                changed = true;
            }
        });
    }

    // Step 3: Find the maximum layer depth to correctly invert Y positions.
    const maxLayer = Math.max(...nodeLayer.values());

    // Step 4: Group nodes by layer.
    const layerNodes = new Map<number, string[]>();
    nodeLayer.forEach((layer, nodeId) => {
        if (!layerNodes.has(layer)) {
            layerNodes.set(layer, []);
        }
        layerNodes.get(layer)!.push(nodeId);
    });

    // Step 5: Sort nodes within each layer by group.
    layerNodes.forEach((nodeIds, layer) => {
        nodeIds.sort((a, b) => {
            const groupA = typeToDesc[a] ? typeToDesc[a].group : "";
            const groupB = typeToDesc[b] ? typeToDesc[b].group : "";
            return groupA.localeCompare(groupB);
        });

        // Calculate horizontal starting position for this layer.
        const totalWidth = nodeIds.length * nodeSeparation;
        const startX = -totalWidth / 2;
        nodeIds.forEach((nodeId, index) => {
            positions.set(nodeId, {
                x: startX + index * (nodeSeparation + 40),
                // Invert Y so base materials are at the bottom
                y: (maxLayer - layer) * layerSeparation
            });
        });
    });

    return positions;
}

