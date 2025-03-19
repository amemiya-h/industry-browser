interface Props {
    setQuery: (query: string) => void;
}

const SearchBar = ({setQuery}:Props) => {
    return (
        <input id="SearchBar"
            type="text"
            placeholder="Search"
            onChange={(e) => setQuery(e.target.value)}
            className="p-[0.5em] z-20 border-highlight border outline-0 text-sm text-dim focus:bg-window-light"
        />
    );
}

export default SearchBar;