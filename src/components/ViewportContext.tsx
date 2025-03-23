import {createContext, useContext, useState} from "react";

interface Item {
    name: string;
    id: number;
}

interface ActiveRootContext {
    activeRoot: Item | null;
    setActiveRoot: (value: Item) => void;
}

interface SuppressSignalContext {
    signalData: number|null;
    setSignalData: (value: number|null) => void;
}

const ActiveRootContext = createContext<ActiveRootContext | null>(null);
const SuppressSignalContext = createContext<SuppressSignalContext | null>(null);

const ActiveRootProvider = ({ children } : { children: React.ReactNode }) => {
    const [activeRoot, setActiveRoot] = useState<Item | null>(null);
    return (
        <ActiveRootContext.Provider value={{ activeRoot, setActiveRoot }}>
            {children}
        </ActiveRootContext.Provider>
    )
}

const SuppressSignalProvider = ({ children }: { children: React.ReactNode }) => {
    const [signalData, setSignalData] = useState<number|null>(null);
    return (
        <SuppressSignalContext.Provider value={{ signalData, setSignalData }}>
            {children}
        </SuppressSignalContext.Provider>
    )
}

export const ViewportProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ActiveRootProvider>
            <SuppressSignalProvider>
                            {children}
            </SuppressSignalProvider>
        </ActiveRootProvider>
    );
};

export const useActiveRoot = () => {
    const context = useContext(ActiveRootContext);
    if (!context) throw new Error("useActiveRoot must be used within a ViewportProvider");
    return context;
}

export const useSuppressSignalContext = () => {
    const context = useContext(SuppressSignalContext);
    if (!context) throw new Error("useSuppressSignalContext must be used within a ViewportProvider");
    return context;
}
