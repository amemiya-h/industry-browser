import { createContext, useContext } from "react";
import { loadFromFile, saveToFile } from "../utils/fileUtils.ts";
import { BehaviorsProvider, useBehaviors } from "./BehaviorsContext.tsx";
import { ResearchProvider, useResearch } from "./ResearchContext.tsx";
import { SkillsProvider, useSkills } from "./SkillsContext.tsx";
import { FacilitiesProvider, useFacilities } from "./FacilitiesContext.tsx";

interface SettingsConfigContext {
    saveConfigToFile: () => void;
    loadConfigFromFile: (file: File) => void;
}

const SettingsConfigContext = createContext<SettingsConfigContext | null>(null);

const SettingsConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const {toggles, setToggles, whitelist, setWhitelist, blacklist, setBlacklist} = useBehaviors()
    const {researchMap, setResearchMap} = useResearch()
    const {skillsMap, setSkillsMap} = useSkills()
    const {engineeringFacility, setEngineeringFacility, refineryFacility, setRefineryFacility} = useFacilities()

    const saveConfigToFile = () => saveToFile({ toggles, whitelist, blacklist, researchMap, skillsMap, engineeringFacility, refineryFacility }, "settings-config.json");

    const loadConfigFromFile = async (file: File) => {
        const data = await loadFromFile(file);
        if (data) {
            setToggles(data.toggles || [true, false, false, true, true, false]);
            setWhitelist(data.whitelist || []);
            setBlacklist(data.blacklist || []);
            setResearchMap(data.researchMap || {});
            setSkillsMap(data.skillsMap || {1: {level: 1, name: "Advanced Industry"}});
            setEngineeringFacility(data.engineeringFacility || {});
            setRefineryFacility(data.refineryFacility || {});
        }
    };

    return (
        <SettingsConfigContext.Provider value={{
            saveConfigToFile,
            loadConfigFromFile,
        }}>
            {children}
        </SettingsConfigContext.Provider>
    );
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <BehaviorsProvider>
            <ResearchProvider>
                <SkillsProvider>
                    <FacilitiesProvider>
                        <SettingsConfigProvider>
                            {children}
                        </SettingsConfigProvider>
                    </FacilitiesProvider>
                </SkillsProvider>
            </ResearchProvider>
        </BehaviorsProvider>
    )
}

export const useSettings = () => {
    const context = useContext(SettingsConfigContext);
    if (!context) throw new Error("useSettings must be used within a SettingsProvider");
    return context;
};