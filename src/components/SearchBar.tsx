import { useEffect, useRef, useState } from "react";

interface Item {
    name: string;
    id: number;
}

interface Props {
    setQuery: (query: string) => void;
    setResult: (result: Item) => void;
    suggestions?: Item[];
}

const SearchBar = ({ setQuery, setResult, suggestions = [] }: Props) => {
    const [focused, setFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const highlightedSuggestionRef = useRef<HTMLDivElement>(null);

    // Scroll the highlighted suggestion into view when it changes
    useEffect(() => {
        if (highlightedSuggestionRef.current) {
            highlightedSuggestionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [highlightedIndex]);

    // Global keydown event listener to focus input on letter key press
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Only focus if the key is a single letter and no modifier keys are pressed
            if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
                if (inputRef.current && document.activeElement !== inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setFocused(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) => {
                const nextIndex = prev + 1;
                return nextIndex >= suggestions.length ? suggestions.length - 1 : nextIndex;
            });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) => {
                const nextIndex = prev - 1;
                return nextIndex < 0 ? 0 : nextIndex;
            });
        } else if (e.key === "Enter") {
            if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                const selectedItem = suggestions[highlightedIndex];
                setResult(selectedItem);
                setQuery('');
                if (inputRef.current) {
                    inputRef.current.value = '';
                    inputRef.current.blur(); // Lose focus after selection
                }
                setFocused(false);
                setHighlightedIndex(-1);
            }
        }
    };

    return (
        <div ref={containerRef}>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search for anything"
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onKeyDown={handleKeyDown}
                className="p-[0.2em] z-20 border border-window-border outline-0 text-regular text-dim bg-window-dark/80 focus:bg-window-light self-stretch w-[15em]"
            />
            {focused && suggestions.length > 0 && (
                <div className="bg-window-light/80 max-h-35 overflow-y-auto absolute w-[15em]">
                    {suggestions.map((item, index) => (
                        <div
                            key={item.id}
                            ref={index === highlightedIndex ? highlightedSuggestionRef : null}
                            className={`p-[0.2em] border border-window-border bg-window-dark/60 hover:bg-window-light/60 hover:cursor-pointer text-regular ${
                                highlightedIndex === index ? "bg-window-light/80" : ""
                            }`}
                            onClick={() => {
                                setResult(item);
                                setQuery('');
                                if (inputRef.current) {
                                    inputRef.current.value = '';
                                    inputRef.current.blur(); // Lose focus on click selection
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
            )}
        </div>
    );
};

export default SearchBar;
