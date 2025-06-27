import {useLocalStorage} from "../hooks/useLocalStorage.ts";
import {createContext, useContext} from "react";

interface ResearchContext {
    materialEfficiency: (typeID: number) => number;
    setMaterialEfficiency: (key: number, value: number) => void;
    timeEfficiency: (typeID: number) => number;
    setTimeEfficiency: (key: number, value: number) => void;
    addResearch: (typeID: number) => void;
    removeResearch: (typeID: number) => void;
    researchMap: { [key: number]: {"material": number, "time": number} },
    setResearchMap: (value: { [key: number]: {"material": number, "time": number} }) => void;
}

const ResearchContext = createContext<ResearchContext | null>(null);

export const ResearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [researchMap, setResearchMap] = useLocalStorage<{ [key: number]: { material: number; time: number } }>(
        "researchMap",
        {}
    );

    const materialEfficiency = (typeID: number): number => {
        return researchMap[typeID] ? researchMap[typeID]["material"]/100 : 0;
    };

    const timeEfficiency = (typeID: number): number => {
        return researchMap[typeID] ? researchMap[typeID]["time"]/100 : 0;
    };

    const addResearch = (typeID: number) => {
        if (researchMap[typeID] === undefined) {
            const updatedMap = {...researchMap, [typeID]: {"material": 0, "time": 0}};
            setResearchMap(updatedMap);
        }
    }

    const removeResearch = (typeID: number) => {
        const { [typeID]: _, ...updated } = researchMap;
        setResearchMap(updated);
    }

    const setEfficiency = (typeID: number, material?: number, time?: number) => {
        setResearchMap(prev => {
            return {
                ...prev,
                [typeID]: {
                    material: material !== undefined ? Math.min(Math.max(material, 0), 10) : prev[typeID]?.material || 0,
                    time: time !== undefined ? Math.min(Math.max(time, 0), 20) : prev[typeID]?.time || 0
                }
            };
        });
    };

    const setMaterialEfficiency = (typeID: number, value: number) => setEfficiency(typeID, value);
    const setTimeEfficiency = (typeID: number, value: number) => setEfficiency(typeID, undefined, value);

    return (
        <ResearchContext.Provider value={{
            materialEfficiency,
            setMaterialEfficiency,
            timeEfficiency,
            setTimeEfficiency,
            addResearch,
            removeResearch,
            researchMap,
            setResearchMap
        }}>
            {children}
        </ResearchContext.Provider>
    )
}

export const useResearch = () => {
    const context = useContext(ResearchContext);
    if (!context) throw new Error("useResearch must be used within a SettingsProvider");
    return context;
}