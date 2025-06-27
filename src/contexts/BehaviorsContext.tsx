import {createContext, useContext} from "react";
import {useLocalStorage} from "../hooks/useLocalStorage.ts";

interface BehaviorsContext {
    toggles: boolean[];
    setToggles: (value: boolean[]) => void;
    toggleSetting: (index: number) => void;
    whitelist: number[];
    setWhitelist: (value: number[]) => void;
    addWhitelist: (typeID: number) => void;
    removeWhitelist: (typeID: number) => void;
    blacklist: number[];
    setBlacklist: (value: number[]) => void;
    addBlacklist: (typeID: number) => void;
    removeBlacklist: (typeID: number) => void;
}

const BehaviorsContext = createContext<BehaviorsContext | null>(null);

export const BehaviorsProvider = ({ children }: { children: React.ReactNode }) => {
    const [toggles, setToggles] = useLocalStorage<boolean[]>(
        "toggles",
        [true, false, false, true, true, false]
    );

    const [whitelist, setWhitelist] = useLocalStorage<number[]>(
        "whitelist",
        []
    );
    const [blacklist, setBlacklist] = useLocalStorage<number[]>(
        "blacklist",
        []
    );

    const toggleSetting = (index: number) => {
        const updatedToggles = [...toggles];
        updatedToggles[index] = !updatedToggles[index];
        setToggles(updatedToggles);
    };

    const addWhitelist = (typeID: number) => {
        if (!whitelist.includes(typeID)) {
            setWhitelist([...whitelist, typeID]);
        }
    };

    const removeWhitelist = (typeID: number) => {
        setWhitelist(whitelist.filter((id) => id !== typeID));
    };

    const addBlacklist = (typeID: number) => {
        if (!blacklist.includes(typeID)) {
            setBlacklist([...blacklist, typeID]);
        }
    };

    const removeBlacklist = (typeID: number) => {
        setBlacklist(blacklist.filter((id) => id !== typeID));
    };

    return (
        <BehaviorsContext.Provider value={{
            toggles,
            setToggles,
            toggleSetting,
            whitelist,
            addWhitelist,
            removeWhitelist,
            setWhitelist,
            blacklist,
            addBlacklist,
            removeBlacklist,
            setBlacklist
        }}>
            {children}
        </BehaviorsContext.Provider>
    )
}

export const useBehaviors = () => {
    const context = useContext(BehaviorsContext);
    if (!context) throw new Error("useBehaviors must be used within a SettingsProvider");
    return context;
}