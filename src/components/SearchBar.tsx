import {RefObject, useEffect, useRef, useState} from "react";
import fuzzysort from "fuzzysort";

import type { Type } from "../utils/dataImport.ts"

interface SuggestionsBoxProps {
    suggestions: Type[];
    highlightedIndex: number;
    setHighlightedIndex: (index: number) => void;
    setResult: (result: Type) => void;
    setFocused: (focused: boolean) => void;
    inputRef: React.RefObject<HTMLInputElement>;
}

interface Props {
    items: Type[];
    itemFilter: (item: Type) => boolean;
    setResult: (result: Type) => void;
    placeholder?: string;
}

const SuggestionsBox = ({ suggestions, highlightedIndex, setHighlightedIndex, setResult, setFocused, inputRef }: SuggestionsBoxProps) => {
    const highlightedSuggestionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (highlightedSuggestionRef.current) {
            highlightedSuggestionRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
        }
    }, [highlightedIndex]);

    return (
        <div className="bg-window-light/80 max-h-35 overflow-y-auto absolute w-[15em]">
            {suggestions.map((item, index) => (
                <div
                    key={item.typeID}
                    ref={index === highlightedIndex ? highlightedSuggestionRef : null}
                    className={`p-[0.2em] border border-window-border bg-window-dark/60 hover:bg-window-light/60 hover:cursor-pointer text-regular ${
                        highlightedIndex === index ? "bg-window-light/80" : ""
                    }`}
                    onClick={() => {
                        setResult(item);
                        if (inputRef.current) {
                            inputRef.current.value = '';
                            inputRef.current.blur();
                        }
                        setFocused(false);
                        setHighlightedIndex(-1);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                >
                    {item.name}
                </div>
            ))}
        </div>
    );
};

const SearchBar = ({ items, itemFilter, setResult, placeholder="Search for anything" }: Props) => {
    const [focused, setFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [suggestions, setSuggestions] = useState<Type[]>([]);
    const [query, setQuery] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setFocused(false);
                setHighlightedIndex(0);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        if (query) {
            const availableItems = items.filter(itemFilter);
            const partialMatches = fuzzysort.go(query, availableItems, { key: "name", threshold: 0.75 });
            setSuggestions(partialMatches.map((m) => m["obj"]));
            setHighlightedIndex(0);
        } else {
            setSuggestions([]);
            setHighlightedIndex(0);
        }
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                const selectedItem = suggestions[highlightedIndex];
                setResult(selectedItem);
                setQuery('');
                if (inputRef.current) {
                    inputRef.current.value = '';
                    inputRef.current.blur();
                }
                setFocused(false);
                setHighlightedIndex(0);
            }
        }
    };


    return (
        <div ref={containerRef} className={"relative"}>
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyDown}
                className="p-[0.2em] z-20 border border-window-border outline-0 text-regular text-dim bg-window-dark/80 focus:bg-window-light self-stretch w-[12em]"
            />
            {focused && suggestions.length > 0 && inputRef && (
                <div className="absolute  left-0">
                    <SuggestionsBox
                        suggestions={suggestions}
                        highlightedIndex={highlightedIndex}
                        setHighlightedIndex={setHighlightedIndex}
                        setResult={setResult}
                        setFocused={setFocused}
                        inputRef={inputRef as RefObject<HTMLInputElement>}
                    />
                </div>
            )}
        </div>
    );
};

export default SearchBar;