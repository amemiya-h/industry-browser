import {useEffect, useState} from "react";
import * as fuzzysort from "fuzzysort";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import NAME_TO_TYPE from "../assets/data/type_lookup.json";
import SearchBar from "./SearchBar.tsx";

interface Item {
    name: string;
    id: number;
}
const items = Object.entries(NAME_TO_TYPE).map(([name, id]) => ({ name, id }));

const Viewport = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<Item | null>(null);
    const [suggestions, setSuggestions] = useState<Item[]>([]);

    useEffect(() => {
        if (query) {
            const partialMatches = fuzzysort.go(query, items, {key: "name", threshold: 0.8})
            setSuggestions(partialMatches.map((m) => m["obj"]));
        } else {
            setSuggestions([]);
        }
    }, [query]);

    return (
        <div className="relative w-full h-full flex-grow-1 flex flex-row">
            <Canvas />

            <div className="absolute z-20 top-[1em] left-[1em]">
                <SearchBar setQuery={setQuery} setResult={setResult} suggestions={suggestions}/>
            </div>

            <Sidebar collapsed = {collapsed} setCollapsed = {setCollapsed} typeID={result?.id}/>
        </div>
    )
}

export default Viewport