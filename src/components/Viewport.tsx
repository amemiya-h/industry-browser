import { useEffect, useMemo, useState } from "react";
import * as fuzzysort from "fuzzysort";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import NAME_TO_TYPE from "../assets/data/type_lookup.json";
import SearchBar from "./SearchBar.tsx";
import {
    useActiveRoot,
    //useDescData,
    useSuppressSignalContext
} from "./ViewportContext.tsx";
import {
    //materialTreeToDAG,
    //computeNodePositionsDAG,
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

    const nodes = useMemo(() => {
        return activeTree ? generateDisplayNodes(activeTree, 40) : [];
    }, [activeTree]);

    const edges = useMemo(() => {
        return activeTree ? generateConnections(activeTree) : [];
    }, [activeTree]);

    // Generate DAG data from the active tree
    // const dag = useMemo(() => {
    //     return activeTree ? materialTreeToDAG(activeTree) : { nodes: [], edges: [] };
    // }, [activeTree]);
    //
    // const { typeToDesc } = useDescData()
    //
    // // Compute positions for DAG nodes
    // const positions = useMemo(() => {
    //     return computeNodePositionsDAG(dag.nodes, dag.edges, typeToDesc);
    // }, [dag.edges, dag.nodes, typeToDesc]);
    //
    // // Map DAG nodes to display nodes with computed positions
    // const displayNodes = useMemo(() => {
    //     return dag.nodes.map((node) => ({
    //         id: node.id,
    //         type: "production",
    //         position: positions.get(node.id) || { x: 0, y: 0 },
    //         data: { typeID: node.typeID, quantity: node.quantity },
    //     }));
    // }, [dag.nodes, positions]);
    //
    // // Use DAG edges directly
    // const displayEdges = useMemo(() => {
    //     return dag.edges.map((edge) => ({
    //         id: `${edge.source}-${edge.target}`,
    //         source: edge.source,
    //         target: edge.target,
    //         type: "simplebezier"
    //     }));
    // }, [dag.edges]);

    return (
        <div className="relative w-full h-full flex-grow-1 flex flex-row">
            <Canvas nodes={nodes} edges={edges} />

            <div className="absolute z-20 top-[1em] left-[1em]">
                <SearchBar setQuery={setQuery} setResult={setActiveRoot} suggestions={suggestions} />
            </div>

            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} typeID={activeRoot?.id} />
        </div>
    );
};

export default Viewport;