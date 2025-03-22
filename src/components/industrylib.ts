import schemesLookupData from "../assets/data/schemes_lookup.json";
import schemesData from "../assets/data/schemes.json";

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
    x?: number;
    y?: number;
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

interface NodePosition {
    x: number;
    y: number;
}

interface Edge {
    id: string;
    source: string;
    target: string;
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

function computeNodePositions(root: MaterialTree, separation: number = 20): Map<string, NodePosition> {
    const positions = new Map<string, NodePosition>();
    let nextX = 0; // Tracks the next available X position for leaf nodes.

    function firstWalk(node: MaterialTree, depth: number): void {
        if (node.state === "collapsed" || node.children.length === 0) {
            node.x = nextX;
            nextX += 90 + separation;
        } else {
            node.children.forEach(child => firstWalk(child, depth + 1));

            const firstChild = node.children[0];
            const lastChild = node.children[node.children.length - 1];
            node.x = (firstChild.x! + lastChild.x!) / 2;
        }

        node.y = depth * (170 + 2 * separation); // Height per level (production + button)
    }

    function secondWalk(node: MaterialTree, offsetX: number = 0): void {
        const adjustedX = node.x! - offsetX;
        positions.set(String(node.id), { x: adjustedX, y: node.y! });

        if (node.productionType !== "") {
            positions.set(`b${node.id}`, { x: adjustedX, y: node.y! + 85 + separation });
        }

        node.children.forEach(child => secondWalk(child, offsetX));
    }

    firstWalk(root, 0);
    const rootX = root.x!;
    secondWalk(root, rootX);

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

