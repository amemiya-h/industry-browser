import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import * as fuzzysort from "fuzzysort";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import SearchBar from "./SearchBar.tsx";
import { useActiveRoot, useSuppressSignalContext } from "./ViewportContext.tsx";
import { getTree, toggleNode, generateDisplayNodes, generateConnections, updateQuantities } from "./industrylib.ts";
import { useSettings } from "./SettingsContext.tsx";
import { types } from "./industrylib.ts";

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

const Viewport = () => {
    const { activeRoot, setActiveRoot } = useActiveRoot();
    const { signalData, setSignalData } = useSuppressSignalContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const { runs, setRuns, materialEfficiency, materialEfficiencyMap, toggles } = useSettings();

    const [collapsed, setCollapsed] = useState(true);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Item[]>([]);
    const [activeTree, setActiveTree] = useState<MaterialTree | null>(null);
    const [toggleState, setToggleState] = useState<boolean[]>(toggles);

    useEffect(() => {
        // Sync activeTree with URL query parameter
        const rootId = searchParams.get("rootId");
        if (rootId) {
            const root = types.find((item) => item.id === parseInt(rootId, 10));
            if (root) setActiveRoot(root);
        }
    }, [searchParams, setActiveRoot]);

    useEffect(() => {
        if (activeRoot) {
            setActiveTree(getTree(activeRoot.id, runs, materialEfficiency, toggles));
            setSearchParams({ rootId: activeRoot.id.toString() }); // Update URL when activeRoot changes
        }
    }, [activeRoot, setSearchParams]);

    useEffect(() => {
        if (activeTree) {
            // Only update quantities on the existing tree structure
            updateQuantities(activeTree, runs, materialEfficiency);
            // Force a re-render by setting a new reference if necessary
            setActiveTree({ ...activeTree });
        }
    }, [runs, materialEfficiencyMap]);

    useEffect(() => {
        if (query) {
            const partialMatches = fuzzysort.go(query, types, { key: "name", threshold: 0.75 });
            setSuggestions(partialMatches.map((m) => m["obj"]));
        } else {
            setSuggestions([]);
        }
    }, [query]);

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

        const newToggleState = [...toggleState];
        newToggleState[typeIndex] = !toggleState[typeIndex];

        function traverseAndToggle(node: MaterialTree): MaterialTree {
            const updatedChildren = node.children.map(traverseAndToggle);

            if (
                (type === "fuelblock" && [4247, 4246, 4051, 4312].includes(node.typeID)) ||
                (type === "ram" && [11474, 11475, 11476, 11477, 11478, 11479, 11480, 11481, 11482, 11483, 11484, 11485, 11486].includes(node.typeID)) ||
                (type === "firstRow" && node.depth === 2) ||
                (type !== "fuelblock" && type !== "ram" && type !== "firstRow" && node.productionType === type)
            ) {
                return toggleNode(
                    { ...node, children: updatedChildren, state: newToggleState[typeIndex] ? "collapsed" : "expanded" },
                    node.id
                );
            }

            return { ...node, children: updatedChildren };
        }

        setToggleState(newToggleState);
        setActiveTree(traverseAndToggle(activeTree));
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
                <SearchBar setQuery={setQuery} setResult={setActiveRoot} suggestions={suggestions} />
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
                typeID={activeRoot?.id}
                activeTree={activeTree}
            />
        </div>
    );
};

export default Viewport;