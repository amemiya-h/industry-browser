import {useEffect, useState} from "react";
import * as fuzzysort from "fuzzysort";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import NAME_TO_TYPE from "../assets/data/type_lookup.json";
import SearchBar from "./SearchBar.tsx";
import {Node} from "@xyflow/react";

interface Item {
    name: string;
    id: number;
}
const items = Object.entries(NAME_TO_TYPE).map(([name, id]) => ({ name, id }));

const Viewport = () => {
    const [collapsed, setCollapsed] = useState(true);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<Item | null>(null);
    const [suggestions, setSuggestions] = useState<Item[]>([]);

    const initialNodes : Node[] = [
        { id: '1', type: 'production', position: { x: 0, y: 0 }, data: { typeID: 626, quantity: 1 }},
        { id: '2', type: 'sourceButton', position: { x: 0, y: 150 }, data: { state: "suppressed", variant: "manufacturing" }},
        { id: '3', type: 'production', position: { x: -450, y: 300 }, data: { typeID: 34, quantity: 540000 }},
        { id: '4', type: 'production', position: { x: -300, y: 300 }, data: { typeID: 35, quantity: 180000 }},
        { id: '5', type: 'production', position: { x: -150, y: 300 }, data: { typeID: 36, quantity: 36000 }},
        { id: '6', type: 'production', position: { x: 0, y: 300 }, data: { typeID: 37, quantity: 10000 }},
        { id: '7', type: 'production', position: { x: 150, y: 300 }, data: { typeID: 38, quantity: 1500 }},
        { id: '8', type: 'production', position: { x: 300, y: 300 }, data: { typeID: 39, quantity: 350 }},
        { id: '9', type: 'production', position: { x: 450, y: 300 }, data: { typeID: 40, quantity: 140 }},
    ];
    const initialEdges = [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e2-4', source: '2', target: '4' },
        { id: 'e2-5', source: '2', target: '5' },
        { id: 'e2-6', source: '2', target: '6' },
        { id: 'e2-7', source: '2', target: '7' },
        { id: 'e2-8', source: '2', target: '8' },
        { id: 'e2-9', source: '2', target: '9' },
    ];

    useEffect(() => {
        if (query) {
            const partialMatches = fuzzysort.go(query, items, {key: "name", threshold: 0.75})
            setSuggestions(partialMatches.map((m) => m["obj"]));
        } else {
            setSuggestions([]);
        }
    }, [query]);

    return (
        <div className="relative w-full h-full flex-grow-1 flex flex-row">
            <Canvas nodes={initialNodes} edges={initialEdges}/>

            <div className="absolute z-20 top-[1em] left-[1em]">
                <SearchBar setQuery={setQuery} setResult={setResult} suggestions={suggestions}/>
            </div>

            <Sidebar collapsed = {collapsed} setCollapsed = {setCollapsed} typeID={result?.id}/>
        </div>
    )
}

export default Viewport