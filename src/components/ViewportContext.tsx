import {createContext, useContext, useEffect, useState} from "react";
import typeToDescData from "../assets/data/desc_data_lookup.json";

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

interface DescDataContext {
    typeToDesc: typeof typeToDesc;
}

interface TouchContext {
    isTouch: boolean;
}

interface Desc {
    category: string,
    description: string,
    group: string,
    id: number,
    name: string
}

interface TypeToDesc {
    [key: string]: Desc;
}

const typeToDesc = typeToDescData as TypeToDesc;

const ActiveRootContext = createContext<ActiveRootContext | null>(null);
const SuppressSignalContext = createContext<SuppressSignalContext | null>(null);
const DescDataContext = createContext<DescDataContext | null>(null);
const TouchContext = createContext<TouchContext | null>(null);

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

const DescDataProvider = ({ children }: { children: React.ReactNode }) => {
    return(
        <DescDataContext.Provider value={{ typeToDesc }}>
            {children}
        </DescDataContext.Provider>
    )
}

const TouchProvider = ({ children }: { children: React.ReactNode }) => {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        const checkTouchscreen = () => {
            // Check if the device supports touch events
            const touchSupported = window.matchMedia("(pointer: coarse)").matches;
            setIsTouch(touchSupported);
        };

        checkTouchscreen();
    }, []);

    return(
        <TouchContext.Provider value={{ isTouch }}>
            {children}
        </TouchContext.Provider>
    )
}

export const ViewportProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ActiveRootProvider>
            <SuppressSignalProvider>
                <DescDataProvider>
                    <TouchProvider>
                        {children}
                    </TouchProvider>
                </DescDataProvider>
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

export const useDescData = () => {
    const context = useContext(DescDataContext);
    if (!context) throw new Error("useDescData must be used within a ViewportProvider");
    return context;
}

export const useTouch = () => {
    const context = useContext(TouchContext);
    if (!context) throw new Error("useTouch must be used within a ViewportProvider");
    return context;
}