import { getBaseScheme } from "./dataImport.ts";
import type { MaterialTree } from "./treeGenerate.ts";

export function updateQuantities(
    tree: MaterialTree,
    quantity: number,
    getMaterialEfficiency: (typeID: number) => number
) {
    tree.quantity = quantity;
    const scheme= getBaseScheme(tree.typeID);
    if (scheme) {
        tree.children.forEach(child => {
            const schemeMaterialQuantity = scheme.materials.filter(material => material.typeID === child.typeID)[0].quantity;
            let materialQuantity = schemeMaterialQuantity * Math.ceil(quantity / scheme.product.quantity)
            if (schemeMaterialQuantity != 1 && scheme.type === "manufacturing"){
                const materialEfficiency = getMaterialEfficiency(tree.typeID);
                materialQuantity = Math.ceil(materialQuantity * (1 - materialEfficiency))
            }
            updateQuantities(child, materialQuantity, getMaterialEfficiency);
        })
    }
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