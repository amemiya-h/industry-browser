import {useEffect, useRef, useState} from "react";

interface Item {
    name: string;
    id: number;
}

interface Props {
    setQuery: (query: string) => void;
    setResult: (result: Item) => void;
    suggestions?: Item[];
}

const SearchBar = ({setQuery, setResult, suggestions = []}:Props) => {
    const [focused, setFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef}>
            <input
                id="SearchBar"
                type="text"
                placeholder="Search"
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                className="p-[0.5em] z-20 border border-window-border outline-0 text-sm text-dim bg-window-dark/80 focus:bg-window-light focus:border-highlight"
            />
            {(focused && suggestions.length > 0) && (
                <div className={"bg-window-light/80 mt-2 border shadow-lg max-h-40 overflow-y-auto"}>
                    {suggestions.map((item) => (
                        <div
                            key={item.id}
                            className={"p-[0.5em] hover:bg-gray-200 hover:cursor-pointer text-sm"}
                            onClick={ () =>{
                                setResult(item);
                                setQuery('');
                                const searchbar = document.getElementById("SearchBar") as HTMLInputElement;
                                searchbar.value = '';
                                setFocused(false);
                            }}
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;