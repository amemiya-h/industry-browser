import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import * as fuzzysort from "fuzzysort";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import NAME_TO_TYPE from "../assets/data/type_lookup.json";
import SearchBar from "./SearchBar.tsx";
import {
    useActiveRoot,
    useSuppressSignalContext
} from "./ViewportContext.tsx";
import {
    getTree,
    toggleNode, generateDisplayNodes, generateConnections,
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
            setActiveTree(getTree(activeRoot.id));
            setSearchParams({ rootId: activeRoot.id.toString() }); // Update URL when activeRoot changes
        }
    }, [activeRoot, setSearchParams]);

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

    useEffect(() => {
        if (activeRoot) {
            setActiveTree(getTree(activeRoot.id));
        }
    }, [activeRoot]);

    const toggleProductionType = (type: "manufacturing" | "reaction" | "pi" | "specific") => {
        if (!activeTree) return;

        function traverseAndToggle(node: MaterialTree): MaterialTree {
            const updatedChildren = node.children.map(traverseAndToggle);

            if (
                (type === "specific" && [4247, 4246, 4051, 4312].includes(node.typeID)) ||
                (type !== "specific" && node.productionType === type)
            ) {
                return toggleNode({ ...node, children: updatedChildren }, node.id);
            }

            return { ...node, children: updatedChildren };
        }

        setActiveTree(traverseAndToggle(activeTree));
    };

    const nodes = useMemo(() => {
        return activeTree ? generateDisplayNodes(activeTree, 60) : [];
    }, [activeTree]);

    const edges = useMemo(() => {
        return activeTree ? generateConnections(activeTree) : [];
    }, [activeTree]);

    return (
        <div className="relative w-full h-full flex-grow-1 flex flex-row">
            <Canvas nodes={nodes} edges={edges} />

            <div className="absolute z-20 top-[1em] left-[1em]">
                <SearchBar setQuery={setQuery} setResult={setActiveRoot} suggestions={suggestions} />
            </div>

            <div className="absolute z-20 bottom-[1em] left-[1em] flex flex-col gap-2">
                <button
                    onClick={() => toggleProductionType("manufacturing")}
                    className="text-sm text-highlight px-[1em] py-[0.5em] border border-manufacture-yellow bg-manufacture-yellow/40 hover:cursor-pointer hover:bg-manufacture-yellow/60"
                >
                    Toggle Manufacturing
                </button>
                <button
                    onClick={() => toggleProductionType("reaction")}
                    className="text-sm text-highlight px-[1em] py-[0.5em] border border-reaction-cyan bg-reaction-cyan/40 hover:cursor-pointer hover:bg-reaction-cyan/60"
                >
                    Toggle Reaction
                </button>
                <button
                    onClick={() => toggleProductionType("pi")}
                    className="text-sm text-highlight px-[1em] py-[0.5em] border border-pi-green bg-pi-green/40 hover:cursor-pointer hover:bg-pi-green/60"
                >
                    Toggle PI
                </button>
                <button
                    onClick={() => toggleProductionType("specific")}
                    className="text-sm text-highlight px-[1em] py-[0.5em] border border-secondary bg-secondary/40 hover:cursor-pointer hover:bg-secondary/60"
                >
                    Toggle Fuel Blocks
                </button>
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