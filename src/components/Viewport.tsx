import {useEffect, useState} from "react";

import Canvas from "./Canvas.tsx";
import Sidebar from "./Sidebar.tsx";
import NAME_TO_TYPE from "../assets/data/type_lookup.json";
import SearchBar from "./SearchBar.tsx";

interface Item {
    name: string;
    id: number;
}

const Viewport = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<Item | null>(null);
    const [suggestions, setSuggestions] = useState<Item[]>([]);

    const items = Object.entries(NAME_TO_TYPE).map(([name, id]) => ({ name, id }));

    useEffect(() => {
        if (query) {
            const partialMatches = items.filter((item) =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(partialMatches);
        } else {
            setSuggestions([]);
        }
    }, [query, items]);

    return (
        <div className="relative w-full h-full flex-grow-1 flex flex-row">
            <Canvas typeID={result ? result.id : 0} />

            <div className="absolute z-20 top-[1em] left-[1em]">
                <SearchBar setQuery={setQuery}/>
                {suggestions.length > 0 && (
                    <div className="bg-window-light/80 mt-2  border rounded shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.map((item) => (
                            <div key={item.id} className={"p-[1em] hover:bg-gray-200 hover:cursor-pointer"} onClick={ () =>{
                                setResult(item);
                                setQuery('');
                                const searchbar = document.getElementById("SearchBar") as HTMLInputElement;
                                searchbar.value = '';
                            }}>
                                {item.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Sidebar collapsed = {collapsed} setCollapsed = {setCollapsed}/>
        </div>
    )
}

export default Viewport