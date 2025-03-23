import { createContext, useContext, useEffect, useState } from "react";
import typeToDescData from "../assets/data/desc_data_lookup.json";

interface SettingsContext {
    runs: number;
    setRuns: (value: number) => void;
    materialEfficiency: (typeID: number) => number;
    setMaterialEfficiency: (key: number, value: number) => void;
    materialEfficiencyMap: { [key: number]: number },
    setMaterialEfficiencyMap: (value: { [key: number]: number }) => void;
    toggles: boolean[];
    setToggles: (value: boolean[]) => void;
    saveConfigToFile: () => void;
    loadConfigFromFile: (file: File) => void;
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

const DescDataContext = createContext<DescDataContext | null>(null);
const TouchContext = createContext<TouchContext | null>(null);
const SettingsContext = createContext<SettingsContext | null>(null);

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

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [runs, setRuns] = useState(1);
    const [materialEfficiencyMap, setMaterialEfficiencyMap] = useState<{ [key: number]: number }>(() => {
        const savedData = localStorage.getItem("materialEfficiencyMap");
        return savedData ? JSON.parse(savedData) : {};
    });

    const materialEfficiency = (typeID: number): number => {
        return materialEfficiencyMap[typeID] ? materialEfficiencyMap[typeID]/100 : 0;
    };

    const setMaterialEfficiency = (typeID: number, value: number) => {
        const clampedValue = Math.min(Math.max(value, 0), 10);
        const updatedMap = { ...materialEfficiencyMap, [typeID]: clampedValue };
        setMaterialEfficiencyMap(updatedMap);

        localStorage.setItem("materialEfficiencyMap", JSON.stringify(updatedMap));
    };

    const [toggles, setToggles] = useState<boolean[]>(() => {
        const savedToggles = localStorage.getItem("toggles");
        return savedToggles ? JSON.parse(savedToggles) : [true, false, false, true, true, true];
    });

    useEffect(() => {
        localStorage.setItem("toggles", JSON.stringify(toggles));
    }, [toggles]);

    const saveConfigToFile = async () => {
        const config = JSON.stringify({ materialEfficiencyMap, toggles }, null, 2);
        const blob = new Blob([config], { type: "application/json" });

        // Use the File System Access API if available.
        if ("showSaveFilePicker" in window) {
            try {
                const opts = {
                    suggestedName: "settings-config.json",
                    types: [
                        {
                            description: "Settings JSON",
                            accept: { "application/json": [".json"] },
                        },
                    ],
                };
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const fileHandle = await window.showSaveFilePicker(opts);
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                return; // Successfully saved, so exit without fallback.
            } catch (error: any) {
                // If the user cancels the dialog, an AbortError or similar is thrown.
                if (error?.name === "AbortError") {
                    console.log("Save dialog cancelled by the user.");
                    return; // Cancel download if user cancelled.
                }
                console.error("Error using File System Access API:", error);
                // If error is not due to user cancellation, fall through to the fallback.
            }
        }

        // Fallback: Trigger a download using an anchor element.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "settings-config.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const loadConfigFromFile = async (file: File) => {
        try {
            const fileText = await file.text();
            const { materialEfficiencyMap: loadedMap, toggles: loadedToggles } =
                JSON.parse(fileText);

            setMaterialEfficiencyMap(loadedMap || {});
            setToggles(loadedToggles || [true, false, false, true, true, false]);

            localStorage.setItem(
                "materialEfficiencyMap",
                JSON.stringify(loadedMap || {})
            );
            localStorage.setItem(
                "toggles",
                JSON.stringify(loadedToggles || [true, false, false, true, true, false])
            );
        } catch (error) {
            console.error("Error processing config file:", error);
        }
    };

    return (
        <SettingsContext.Provider value={{
            runs,
            setRuns,
            materialEfficiency,
            setMaterialEfficiency,
            materialEfficiencyMap,
            setMaterialEfficiencyMap,
            toggles,
            setToggles,
            saveConfigToFile,
            loadConfigFromFile,
        }}>
            <DescDataProvider>
                <TouchProvider>
                    {children}
                </TouchProvider>
            </DescDataProvider>
        </SettingsContext.Provider>
    );
};

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

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within a ViewportProvider");
    return context;
};