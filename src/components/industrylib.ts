import schemesLookupData from "../assets/data/schemes_lookup.json";
import schemesData from "../assets/data/schemes.json";
import typeLookup from "../assets/data/type_lookup.json";

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
    type?: string;
}

export const schemesLookup = schemesLookupData as SchemesLookup;
export const schemes = schemesData as Schemes;
export const types = Object.entries(typeLookup).map(([name, id]) => ({ name, id }));

export function typeOfScheme(typeID: number): string {
    const typeIDStr = typeID.toString();
    if (Object.prototype.hasOwnProperty.call(schemesLookup, typeIDStr)) {
        const schemeID = schemesLookup[typeIDStr].toString();
        if (Object.prototype.hasOwnProperty.call(schemes, schemeID)) {
            const recipe: Scheme = schemes[schemeID];
            return recipe.type;
        }
    }
    return "";
}

export function quantityToString(quantity: number, format: "long"|"short") {
    if (format === "long") {
        return quantity.toLocaleString("en-US");
    } else if (format === "short") {
        if (quantity < 1e4) {
            return quantity.toLocaleString("en-US").slice(0, 5);
        }else if (quantity < 1e5){
            return (quantity/1e3).toFixed(2) + "K";
        }else if (quantity < 1e8){
            return (quantity/1e6).toFixed(2) + "M";
        }else if (quantity < 1e11){
            return (quantity/1e9).toFixed(2) + "B";
        }else if (quantity < 1e14){
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

export function getTree(
    typeID: number,
    multiplier: number = 1,
    getMaterialEfficiency: (typeID: number) => number,
    toggles: boolean[],
    isRoot: boolean = true,
    depth: number = 1
): MaterialTree {
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
            node.productionType = recipe.type as "manufacturing" | "invention" | "reaction" | "pi";

            // Apply toggles to handle node state
            if (!toggles[0] && node.productionType === "manufacturing") {
                node.state = "collapsed";
            }
            if (!toggles[1] && node.productionType === "reaction") {
                node.state = "collapsed";
            }
            if (!toggles[2] && node.productionType === "pi") {
                node.state = "collapsed";
            }
            if (toggles[3] && [4247, 4246, 4051, 4312].includes(node.typeID)) {
                node.state = "collapsed";
            }
            if (toggles[4] && [11474, 11475, 11476, 11477, 11478, 11479, 11480, 11481, 11482, 11483, 11484, 11485, 11486].includes(node.typeID)) {
                node.state = "collapsed";
            }
            if (toggles[5] && node.depth > 1) {
                node.state = "collapsed";
            }

            recipe.materials.forEach((material: Material) => {
                const efficiency = getMaterialEfficiency(material.typeID);
                const materialQuantity = (material.quantity === 1 || recipe.type != "manufacturing")
                    ? material.quantity * Math.ceil(multiplier / recipe.products[0].quantity)
                    : Math.ceil(material.quantity * (1 - efficiency) * Math.ceil(multiplier / recipe.products[0].quantity));

                const childTree = getTree(material.typeID, materialQuantity, getMaterialEfficiency, toggles, false, depth + 1);
                node.children.push(childTree);
            });
        }
    }
    return node;
}


export function updateQuantities(
    tree: MaterialTree,
    runs: number,
    getMaterialEfficiency: (typeID: number) => number
): MaterialTree {
    // Update the current node's quantity
    tree.quantity = runs;

    // Recursively update children
    tree.children.forEach(child => {
        const typeIDStr = tree.typeID.toString();
        if (Object.prototype.hasOwnProperty.call(schemesLookup, typeIDStr)) {
            const schemeID = schemesLookup[typeIDStr].toString();
            if (Object.prototype.hasOwnProperty.call(schemes, schemeID)) {
                const recipe: Scheme = schemes[schemeID];
                const efficiency = getMaterialEfficiency(tree.typeID);
                const newRuns = (child.quantity === 1 || recipe.type != "manufacturing")
                    ? recipe.materials.filter(material => material.typeID === child.typeID)[0].quantity * Math.ceil(runs / recipe.products[0].quantity)
                    : Math.ceil(recipe.materials.filter(material => material.typeID === child.typeID)[0].quantity * (1 - efficiency) * Math.ceil(runs / recipe.products[0].quantity));

                updateQuantities(child, newRuns, getMaterialEfficiency);
            }
        }
    });
    return tree;
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

interface BaseMaterials {
    [typeID: string]: number;
}

export function getBaseMaterials(tree: MaterialTree, collapsed: boolean = false): BaseMaterials {
    const materials: BaseMaterials = {};

    function traverse(node: MaterialTree) {
        if (collapsed && node.state === "collapsed" || node.children.length === 0) {
            const key = node.typeID.toString();
            materials[key] = (materials[key] || 0) + node.quantity;
            return;
        }

        node.children.forEach(traverse);
    }

    traverse(tree);
    return materials;
}