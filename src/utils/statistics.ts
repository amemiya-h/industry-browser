import type { MaterialTree } from "./treeGenerate.ts";
import { getBaseScheme, Material } from "./dataImport.ts";

interface materialsLedger {
    [typeID: string]: {
        required: number,
        deferred: number,
        runs:number,
        stocks: number,
        depth: number
    };
}

export type productionInfo = {
    [typeID: string]: {
        stocksCount: number,
        consumedCount: number,
        runs: number,
        depth: number
    };
}

export function getProductionInfo(tree: MaterialTree, runs: number = 1, collapsed: boolean = false, materialEfficiency: (typeID: number) => number = () => 0, existingStocks: {[typeID: string]: number} = {}): productionInfo {
    const ledger: materialsLedger = {};
    const infoOut: productionInfo = {};

    function addEntry(typeID: number) {
        if (!Object.prototype.hasOwnProperty.call(ledger, typeID)) {
            ledger[typeID] = {required: 0, deferred: 0, runs: 0, stocks: 0, depth: 0};
        }
    }

    function addRuns(node: MaterialTree, materialEfficiency: (typeID: number) => number = () => 0) {
        const typeID = node.typeID;
        addEntry(typeID);
        ledger[typeID].depth = node.depth;
        if (getBaseScheme(typeID)) {
            const scheme = getBaseScheme(typeID)!;
            if (ledger[typeID].required > ledger[typeID].stocks) {
                const requiredRuns = Math.ceil((ledger[typeID].required - ledger[typeID].stocks) / scheme.product.quantity);
                ledger[typeID].runs += requiredRuns;
                ledger[typeID].stocks += requiredRuns * scheme.product.quantity;

                scheme.materials.forEach((material: Material) => {
                    addEntry(material.typeID);
                    let requiredMaterial = requiredRuns * material.quantity;
                    if (material.quantity !== 1 && scheme.type === "manufacturing") {
                        requiredMaterial = Math.ceil(requiredMaterial * (1 - materialEfficiency(node.typeID)));
                    }

                    if (node.children.filter((child) => child.typeID === material.typeID)[0].state === "collapsed" && collapsed){
                        ledger[material.typeID].deferred += requiredMaterial;
                    } else {
                        ledger[material.typeID].required += requiredMaterial;
                    }
                });
            }
        }
    }

    function traverse(node: MaterialTree) {
        if (collapsed && node.state === "collapsed") {
            return
        }
        addRuns(node, materialEfficiency);
        node.children.forEach(traverse);
    }

    Object.keys(existingStocks).forEach(key => {
        addEntry(Number(key));
        ledger[key].stocks += existingStocks[key];
    })

    addEntry(tree.typeID);
    ledger[tree.typeID].required = runs * (getBaseScheme(tree.typeID)?.product.quantity ?? 1);
    traverse(tree);

    Object.keys(ledger).forEach(key => {
        const totalRequired = ledger[key].required + ledger[key].deferred; // Include deferred requirements
        infoOut[key] = {stocksCount: 0, consumedCount: 0, runs: 0, depth: 0}
        infoOut[key].stocksCount = ledger[key].stocks;
        infoOut[key].consumedCount = totalRequired;
        infoOut[key].runs = ledger[key].runs;
        infoOut[key].depth = ledger[key].depth;
    });
    return infoOut;
}