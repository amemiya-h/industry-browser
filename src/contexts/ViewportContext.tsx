import {createContext, useContext, useState} from "react";

import type { Type } from "../utils/dataImport.ts"

interface ViewportContext {
    runs: number;
    setRuns: (value: number) => void;
    activeRoot: Type | null;
    setActiveRoot: (value: Type) => void;
    signalData: number|null;
    setSignalData: (value: number|null) => void;
}

const ViewportContext = createContext<ViewportContext | null>(null);

export const ViewportProvider = ({ children }: { children: React.ReactNode }) => {
    const [runs, setRuns] = useState(1);
    const [activeRoot, setActiveRoot] = useState<Type | null>(null);
    const [signalData, setSignalData] = useState<number|null>(null);
    return (
        <ViewportContext.Provider value={{
            runs,
            setRuns,
            activeRoot,
            setActiveRoot,
            signalData,
            setSignalData
        }}>
            {children}
        </ViewportContext.Provider>
    );
};

export const useViewportContext = () => {
    const context = useContext(ViewportContext);
    if (!context) throw new Error("useActiveRoot must be used within a ViewportProvider");
    return context;
}
