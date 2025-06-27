import { hierarchy, tree } from "d3-hierarchy";
import type {Material, Scheme} from "./dataImport.ts"


export type MaterialTree = {
    id: number;
    typeID: number;
    quantity: number;
    state: "expanded"|"collapsed",
    depth: number;
    productionType: "manufacturing" | "invention" | "reaction" | "pi" | "";
    children: MaterialTree[];
}
export type ProductionNode = {
    id: string;
    type: "production";
    position: { x: number; y: number };
    data: { typeID: number; quantity: number };
}
export type ButtonNode = {
    id: string;
    type: "sourceButton";
    position: { x: number; y: number };
    data: { state: "expanded" | "collapsed"; variant: "manufacturing" | "invention" | "reaction" | "pi" | ""; parentID: number };
}
export type DisplayNode = ProductionNode | ButtonNode;
export type Edge = {
    id: string;
    source: string;
    target: string;
    type?: string;
}

let currentId = 0;
function getUniqueId(isRoot: boolean = true): number {
    if (isRoot) currentId = 0;
    return ++currentId;
}

export function getTree(
    typeID: number,
    quantity: number = 1,
    getScheme: (typeID: number, quantity: number) => Scheme | null,
    toggles: boolean[],
    isRoot: boolean = true,
    depth: number = 1
): MaterialTree {
    const node: MaterialTree = {
        id: getUniqueId(isRoot),
        typeID: typeID,
        quantity: quantity,
        state: "expanded",
        depth: depth,
        productionType: "",
        children: []
    };

    const scheme= getScheme(typeID, quantity);
    if (scheme) {
        node.productionType = scheme.type;

        if (!toggles[0] && node.productionType === "manufacturing") node.state = "collapsed";
        if (!toggles[1] && node.productionType === "reaction") node.state = "collapsed";
        if (!toggles[2] && node.productionType === "pi") node.state = "collapsed";
        if (toggles[3] && [4247, 4246, 4051, 4312].includes(node.typeID)) node.state = "collapsed";
        if (toggles[4] && [11474, 11475, 11476, 11477, 11478, 11479, 11480, 11481, 11482, 11483, 11484, 11485, 11486].includes(node.typeID)) node.state = "collapsed";
        if (toggles[5] && node.depth > 1) node.state = "collapsed";

        scheme.materials.forEach((material: Material) => {
            const childTree = getTree(material.typeID, material.quantity, getScheme, toggles, false, depth + 1);
            node.children.push(childTree);
        });
    }

    return node;
}

export function computeNodePositions(
    root: MaterialTree,
    margin: number[] = [20, 60]
): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();

    const nodeWidth = 90 + 2 * margin[0];
    const nodeHeight = 170 + 2 * margin[1];

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

export function generateDisplayNodes(tree: MaterialTree, separation: number[] = [20, 60]): DisplayNode[] {
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
            edges.push({ id: `e${buttonId}-${child.id}`, source: buttonId, target: child.id.toString(), type: "step" });
            generateConnections(child, edges);
        }
    }

    return edges;
}
