import {useEffect, useMemo, useState} from "react";
import * as fuzzysort from "fuzzysort";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import NAME_TO_TYPE from "../assets/data/type_lookup.json";
import SearchBar from "./SearchBar.tsx";
import {useActiveRoot, useSuppressSignalContext} from "./ViewportContext.tsx";
import {generateConnections, generateDisplayNodes, getTree, toggleNode} from "./industrylib.ts";

interface Item {
    name: string;
    id: number;
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

const items = Object.entries(NAME_TO_TYPE).map(([name, id]) => ({ name, id }));

const Viewport = () => {
    const [collapsed, setCollapsed] = useState(true);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Item[]>([]);
    const [activeTree, setActiveTree] = useState<MaterialTree | null>(null);

    const {activeRoot, setActiveRoot} = useActiveRoot();
    const {signalData, setSignalData} = useSuppressSignalContext();

    useEffect(() => {
        if (query) {
            const partialMatches = fuzzysort.go(query, items, {key: "name", threshold: 0.75})
            setSuggestions(partialMatches.map((m) => m["obj"]));
        } else {
            setSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        if(activeTree && signalData) {
            console.log(signalData);
            setActiveTree(toggleNode(activeTree, signalData));
        }
        setSignalData(null)
    }, [signalData, setSignalData, activeTree]);

    useEffect(() => {
        if(activeRoot){
            setActiveTree(getTree(activeRoot.id))
        }
    }, [activeRoot]);

    const nodes = useMemo(() => {
        return activeTree ? generateDisplayNodes(activeTree, 20) : [];
    }, [activeTree]);

    const edges = useMemo(() => {
        return activeTree ? generateConnections(activeTree) : [];
    }, [activeTree]);

    return (
        <div className="relative w-full h-full flex-grow-1 flex flex-row">
            <Canvas nodes={nodes} edges={edges}/>

            <div className="absolute z-20 top-[1em] left-[1em]">
                <SearchBar setQuery={setQuery} setResult={setActiveRoot} suggestions={suggestions}/>
            </div>

            <Sidebar collapsed = {collapsed} setCollapsed = {setCollapsed} typeID={activeRoot?.id}/>
        </div>
    )
}

export default Viewport