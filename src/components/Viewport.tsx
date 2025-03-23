import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import * as fuzzysort from "fuzzysort";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import NAME_TO_TYPE from "../assets/data/type_lookup.json";
import SearchBar from "./SearchBar.tsx";
import {
    useActiveRoot,
    useSuppressSignalContext,
    useSettings
} from "./ViewportContext.tsx";
import {
    getTree,
    toggleNode, generateDisplayNodes, generateConnections, updateQuantities,
} from "./industrylib.ts";

interface Item {
    name: string;
    id: number;
}

interface MaterialTree {
    id: number;
    typeID: number;
    quantity: number;
    state: "expanded" | "collapsed";
    depth: number;
    productionType: "manufacturing" | "invention" | "reaction" | "pi" | "";
    children: MaterialTree[];
}

const items = Object.entries(NAME_TO_TYPE).map(([name, id]) => ({ name, id }));

const Viewport = () => {
    const [collapsed, setCollapsed] = useState(true);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Item[]>([]);
    const [activeTree, setActiveTree] = useState<MaterialTree | null>(null);

    const { activeRoot, setActiveRoot } = useActiveRoot();
    const { signalData, setSignalData } = useSuppressSignalContext();
    const [searchParams, setSearchParams] = useSearchParams(); // Initialize search params
    const { runs, setRuns, materialEfficiency, setMaterialEfficiency, toggles, setToggles } = useSettings();

    const toggleLabels = ["Suppress manufacturing", "Suppress reactions", "Suppress PI", "Suppress fuel blocks", "Show only first row"]; // Labels for checkboxes

    useEffect(() => {
        // Sync activeTree with URL query parameter
        const rootId = searchParams.get("rootId");
        if (rootId) {
            const root = items.find((item) => item.id === parseInt(rootId, 10));
            if (root) setActiveRoot(root);
        }
    }, [searchParams, setActiveRoot]);

    useEffect(() => {
        if (activeRoot) {
            setActiveTree(getTree(activeRoot.id, runs, materialEfficiency / 100, toggles));
            setSearchParams({ rootId: activeRoot.id.toString() }); // Update URL when activeRoot changes
        }
    }, [activeRoot, setSearchParams]);


    useEffect(() => {
        if (activeTree) {
            // Only update quantities on the existing tree structure
            updateQuantities(activeTree, runs, materialEfficiency / 100);
            // Force a re-render by setting a new reference if necessary
            setActiveTree({ ...activeTree });
        }
    }, [runs, materialEfficiency]);


    useEffect(() => {
        if (query) {
            const partialMatches = fuzzysort.go(query, items, { key: "name", threshold: 0.75 });
            setSuggestions(partialMatches.map((m) => m["obj"]));
        } else {
            setSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        if (activeTree && signalData) {
            console.log(signalData);
            setActiveTree(toggleNode(activeTree, signalData));
        }
        setSignalData(null);
    }, [signalData, setSignalData, activeTree]);

    const toggleProductionType = (type: "manufacturing" | "reaction" | "pi" | "specific" | "firstRow") => {
        if (!activeTree) return;

        function traverseAndToggle(node: MaterialTree): MaterialTree {
            const updatedChildren = node.children.map(traverseAndToggle);

            if (
                (type === "specific" && [4247, 4246, 4051, 4312].includes(node.typeID)) ||
                (type === "firstRow" && node.depth === 2) ||
                (type !== "specific" && type !== "firstRow" && node.productionType === type)
            ) {
                return toggleNode({ ...node, children: updatedChildren }, node.id);
            }

            return { ...node, children: updatedChildren };
        }

        setActiveTree(traverseAndToggle(activeTree));
    };

    const nodes = useMemo(() => {
        return activeTree ? generateDisplayNodes(activeTree, [20, 50]) : [];
    }, [activeTree]);

    const edges = useMemo(() => {
        return activeTree ? generateConnections(activeTree) : [];
    }, [activeTree]);

    const handleToggle = (index: number) => {
        const updatedToggles = [...toggles];
        updatedToggles[index] = !updatedToggles[index];
        setToggles(updatedToggles);
    };

    return (
        <div className="relative w-full h-full flex-grow-1 flex flex-row">
            <Canvas nodes={nodes} edges={edges} />

            <div className="absolute z-20 top-[1em] left-[1em]">
                <SearchBar setQuery={setQuery} setResult={setActiveRoot} suggestions={suggestions} />
                <div className="mt-[1em] p-[0.5em] flex flex-col gap-2 bg-window-light border border-window-border text-sm">
                    <span>Default behaviour</span>
                    <hr className="h-px bg-dim border-0"/>
                    {toggleLabels.map((label, index) => (
                        <label key={index} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={toggles[index]}
                                onChange={() => handleToggle(index)}
                                className="w-4 h-4"
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="absolute z-20 top-[1em] left-[15em]">
                <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                        <span className="text-sm">Runs</span>
                        <input
                            type="number"
                            min={1}
                            value={runs}
                            onChange={(e) => setRuns(Number(e.target.value))}
                            className="w-[4em] outline-0 text-dim bg-window-dark/80 focus:bg-window-light border border-window-border px-2 py-1 "
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm">ME</span>
                        <input
                            type="number"
                            min={0}
                            max={10}
                            value={materialEfficiency}
                            onChange={(e) => setMaterialEfficiency(Number(e.target.value))}
                            className="w-[4em] outline-0 text-dim bg-window-dark/80 focus:bg-window-light border border-window-border px-2 py-1 "
                        />
                    </div>
                </div>
            </div>

            <div className="absolute z-20 bottom-[2em] left-[2em] flex flex-col gap-2">
                <span className="text-sm text-dim">Show/Hide Production</span>
                <hr className="h-px bg-dim border-0"/>
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
                        onClick={() => toggleProductionType("specific")}
                        className="text-sm text-highlight w-[8em] px-[1em] py-[0.5em] border border-secondary bg-secondary/40 hover:cursor-pointer hover:bg-secondary/60"
                    >
                        Fuel Blocks
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
                typeID={activeRoot?.id} 
                activeTree={activeTree}
            />
        </div>
    );
};

export default Viewport;