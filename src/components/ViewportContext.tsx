import { createContext, useContext, useState } from "react";

type ViewportContextType = {
    data: string;
    setData: (value: string) => void;
};

const ViewportContext = createContext<ViewportContextType | null>(null);

export const useViewport = () => {
    const context = useContext(ViewportContext);
    if (!context) throw new Error("useViewport must be used within a ViewportProvider.");
    return context;
};

export const ViewportProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<string>("");

    return (
        <ViewportContext.Provider value={{ data, setData }}>
            {children}
        </ViewportContext.Provider>
    );
};
