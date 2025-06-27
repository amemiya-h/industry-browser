import {createContext, useContext} from "react";
import {useLocalStorage} from "../hooks/useLocalStorage.ts";

interface EngineeringFacility {
    security: "high" | "low" | "null";
    type: "npc" | "citadel" | "complex" | "refinery";
    size: "m" | "l" | "xl";
    rigs: number[];
}

interface RefineryFacility {
    security: "low" | "null";
    size: "m" | "l";
    rigs: number[];
}

interface FacilitiesContext {
    engineeringFacility: EngineeringFacility;
    setEngineeringFacility: (engineeringFacility: EngineeringFacility) => void;
    refineryFacility: RefineryFacility;
    setRefineryFacility: (refineryFacility: RefineryFacility) => void;
    setSecurity: (facility: "engineering" | "refinery", security: "high" | "low" | "null") => void;
    setSize: (facility: "engineering" | "refinery", size: "m" | "l" | "xl") => void;
    setType: (type: "npc" | "citadel" | "complex" | "refinery") => void;
    addRigs: (facility: "engineering" | "refinery", typeID: number) => void;
    removeRigs: (facility: "engineering" | "refinery", typeID: number) => void;
}

const FacilitiesContext = createContext<FacilitiesContext | null>(null);

export const FacilitiesProvider = ({ children }: { children: React.ReactNode }) => {
    const [engineeringFacility, setEngineeringFacility] = useLocalStorage<EngineeringFacility>(
        "engineeringFacility",
        {
            security: "high",
            type: "npc",
            size: "m",
            rigs: [],
        }
    )

    const [refineryFacility, setRefineryFacility] = useLocalStorage<RefineryFacility>(
        "refineryFacility",
        {
            security: "low",
            size: "m",
            rigs: [],
        }
    )

    const setSecurity = (facility: "engineering" | "refinery", security: "high" | "low" | "null")  => {
        if (facility === "engineering") {
            setEngineeringFacility((prev) => ({ ...prev, security: security }))
        }else if(security !== "high") {
            setRefineryFacility((prev) => ({ ...prev, security: security }))
        }
    }

    const setSize = (facility: "engineering" | "refinery", size: "m" | "l" | "xl")  => {
        if (facility === "engineering") {
            setEngineeringFacility((prev) => ({ ...prev, size: size }))
        }else if(size !== "xl") {
            setRefineryFacility((prev) => ({ ...prev, size: size }))
        }
    }

    const setType = (type: "npc" | "citadel" | "complex" | "refinery")  => {
        setEngineeringFacility((prev) => ({ ...prev, type : type }))
    }

    const addRigs = (facility: "engineering" | "refinery", id: number)  => {
        if (facility === "engineering") {
            if (!engineeringFacility.rigs.includes(id)) {
                setEngineeringFacility((prev) => ({ ...prev, rigs: [...prev.rigs, id] }))
            }
        } else {
            if (!engineeringFacility.rigs.includes(id)) {
                setRefineryFacility((prev) => ({ ...prev, rigs: [...prev.rigs, id] }))
            }
        }
    }

    const removeRigs = (facility: "engineering" | "refinery", id: number) => {
        if (facility === "engineering") {
            const updated = {
                ...engineeringFacility,
                rigs: engineeringFacility.rigs.filter((rigId) => rigId !== id),
            };
            setEngineeringFacility(updated);
        } else {
            const updated = {
                ...refineryFacility,
                rigs: refineryFacility.rigs.filter((rigId) => rigId !== id),
            };
            setRefineryFacility(updated);
        }
    };

    return (
        <FacilitiesContext.Provider value={{
            engineeringFacility,
            setEngineeringFacility,
            refineryFacility,
            setRefineryFacility,
            setSecurity,
            setSize,
            addRigs,
            setType,
            removeRigs
        }}>
            {children}
        </FacilitiesContext.Provider>
    )
}

export const useFacilities = () => {
    const context = useContext(FacilitiesContext);
    if (!context) throw new Error("useFacilities must be used within a SettingsProvider");
    return context;
}