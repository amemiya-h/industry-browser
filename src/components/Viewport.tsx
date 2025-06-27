import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import SearchBar from "./SearchBar.tsx";

import { useViewportContext } from "../contexts/ViewportContext.tsx";

import { getTree, generateDisplayNodes, generateConnections } from "../utils/treeGenerate.ts";
import type { MaterialTree } from "../utils/treeGenerate.ts";
import { toggleNode, updateQuantities } from "../utils/treeUpdate.ts";
import { getBaseScheme, types } from "../utils/dataImport.ts";
import {useResearch} from "../contexts/ResearchContext.tsx";
import {useBehaviors} from "../contexts/BehaviorsContext.tsx";
import {useGetScheme} from "../utils/productionUtils.ts";



const Viewport = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const { runs, setRuns, activeRoot, setActiveRoot, signalData, setSignalData } = useViewportContext();
    const { materialEfficiency, researchMap } = useResearch();
    const { toggles } = useBehaviors()

    const [collapsed, setCollapsed] = useState(true);
    const [activeTree, setActiveTree] = useState<MaterialTree | null>(null);
    const [toggleState, setToggleState] = useState<boolean[]>(toggles);
    const [productionQuantity, setProductionQuantity] = useState(runs);

    const getScheme = useGetScheme();

    useEffect(() => {
        const rootId = searchParams.get("rootId");
        if (rootId) {
            const root = types.find((item) => item.typeID === parseInt(rootId));
            if (root) setActiveRoot(root);
        }
    }, [searchParams, setActiveRoot]);

    useEffect(() => {
        if (activeRoot) {
            setActiveTree(getTree(activeRoot.typeID, productionQuantity, getScheme, toggles));
            setSearchParams({ rootId: activeRoot.typeID.toString() });
        }
    }, [activeRoot, setSearchParams]);

    useEffect(() => {
        if (activeTree) {
            updateQuantities(activeTree, productionQuantity, materialEfficiency);
            setActiveTree({ ...activeTree });
        }
    }, [productionQuantity, researchMap]);

    useEffect(() => {
        if (activeTree) {
            const scheme = getBaseScheme(activeTree.typeID);
            if (scheme) {
                setProductionQuantity(runs * scheme.product.quantity)
            } else {
                setProductionQuantity(runs)
            }
        }
    }, [activeTree, runs]);


    useEffect(() => {
        if (activeTree && signalData) {
            setActiveTree(toggleNode(activeTree, signalData));
        }
        setSignalData(null);
    }, [signalData, setSignalData, activeTree]);

    const toggleProductionType = (type: "manufacturing" | "reaction" | "pi" | "fuelblock" | "ram" | "firstRow") => {
        if (!activeTree) return;

        const typeIndex = {
            manufacturing: 0,
            reaction: 1,
            pi: 2,
            fuelblock: 3,
            ram: 4,
            firstRow: 5,
        }[type];

        function traverseAndToggle(node: MaterialTree): MaterialTree {
            const updatedChildren = node.children.map(traverseAndToggle);

            if (
                (type === "fuelblock" && [4247, 4246, 4051, 4312].includes(node.typeID)) ||
                (type === "ram" && [11474, 11475, 11476, 11477, 11478, 11479, 11480, 11481, 11482, 11483, 11484, 11485, 11486].includes(node.typeID)) ||
                (type === "firstRow" && node.depth === 2) ||
                (type !== "fuelblock" && type !== "ram" && type !== "firstRow" && node.productionType === type)
            ) {
                return toggleNode(
                    { ...node, children: updatedChildren, state: toggleState[typeIndex] ? "expanded" : "collapsed" },
                    node.id
                );
            }

            return { ...node, children: updatedChildren };
        }

        const newToggleState = [...toggleState];
        newToggleState[typeIndex] = !toggleState[typeIndex];

        setActiveTree(traverseAndToggle(activeTree));
        setToggleState(newToggleState);
    };

    const nodes = useMemo(() => {
        return activeTree ? generateDisplayNodes(activeTree, [20, 50]) : [];
    }, [activeTree]);

    const edges = useMemo(() => {
        return activeTree ? generateConnections(activeTree) : [];
    }, [activeTree]);

    return (
        <div className="relative w-full h-full flex-grow-1 flex flex-row">
            <Canvas nodes={nodes} edges={edges} />

            <div className="absolute z-20 top-[1em] left-[1em] flex flex-col items-center">
                <SearchBar items={types} itemFilter={() => true} setResult={setActiveRoot}/>
                <div className="flex justify-start my-[0.5em] self-stretch">
                    <div className="flex flex-col items-center">
                        <span className="text-sm">JOB RUNS</span>
                        <input
                            type="number"
                            min={1}
                            value={runs}
                            onChange={(e) => setRuns(Number(e.target.value))}
                            className="w-[4em] outline-0 text-dim bg-window-dark/80 focus:bg-window-light border border-window-border px-2 py-1 "
                        />
                    </div>
                </div>
            </div>

            <div className="absolute z-20 bottom-[2em] left-[2em] flex flex-col gap-2">
                <span className="text-sm text-dim">Show/Hide Nodes</span>
                <hr className="h-px bg-dim border-0" />
                <div className="flex flex-row items-center gap-2">
                    <button
                        onClick={() => toggleProductionType("manufacturing")}
                        className="text-sm text-highlight w-[8em] px-[1em] py-[0.5em] border border-manufacture-yellow bg-manufacture-yellow/40 hover:cursor-pointer hover:bg-manufacture-yellow/60"
                    >
                        Manufacturing
                    </button>
                    <button
                        onClick={() => toggleProductionType("reaction")}
                        className="text-sm text-highlight w-[8em] px-[1em] py-[0.5em] border border-reaction-cyan bg-reaction-cyan/40 hover:cursor-pointer hover:bg-reaction-cyan/60"
                    >
                        Reaction
                    </button>
                    <button
                        onClick={() => toggleProductionType("pi")}
                        className="text-sm text-highlight w-[8em] px-[1em] py-[0.5em] border border-pi-green bg-pi-green/40 hover:cursor-pointer hover:bg-pi-green/60"
                    >
                        PI
                    </button>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <button
                        onClick={() => toggleProductionType("fuelblock")}
                        className="text-sm text-highlight w-[8em] px-[1em] py-[0.5em] border border-secondary bg-secondary/40 hover:cursor-pointer hover:bg-secondary/60"
                    >
                        Fuel Blocks
                    </button>
                    <button
                        onClick={() => toggleProductionType("ram")}
                        className="text-sm text-highlight w-[8em] px-[1em] py-[0.5em] border border-secondary bg-secondary/40 hover:cursor-pointer hover:bg-secondary/60"
                    >
                        R.A.M.
                    </button>
                    <button
                        onClick={() => toggleProductionType("firstRow")}
                        className="text-sm text-highlight w-[8em] px-[1em] py-[0.5em] border border-primary bg-primary/40 hover:cursor-pointer hover:bg-primary/60"
                    >
                        First Row
                    </button>
                </div>
            </div>

            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                typeID={activeRoot?.typeID}
                activeTree={activeTree}
            />
        </div>
    );
};

export default Viewport;