import {createContext, useContext} from "react";
import {useLocalStorage} from "../hooks/useLocalStorage.ts";

interface Skill{
    level: number,
    name: string
}

interface SkillsContext {
    skillsMap: { [id: number]: Skill};
    setSkillsMap: (value: { [id: number]: Skill }) => void;
    setSkills: (id: number, level: number) => void;
    getSkills: (id: number) => Skill;
}

const SkillsContext = createContext<SkillsContext | null>(null);

export const SkillsProvider = ({ children }: { children: React.ReactNode }) => {
    const [skillsMap, setSkillsMap] = useLocalStorage<{ [id: number]: Skill }>(
        "skillsMap",
        {
            1: {level: 1, name: "Advanced Industry"},
        }
    )

    const setSkills = (id: number, level: number) => {
        setSkillsMap((prev) => ({
            ...prev,
            [id]: {...prev[id], level: Math.min(Math.max(level, 0), 5)},
        }));
    };

    const getSkills = (id: number) => {
        return skillsMap[id];
    }

    return (
        <SkillsContext.Provider value={{
            skillsMap,
            setSkillsMap,
            setSkills,
            getSkills
        }}>
            {children}
        </SkillsContext.Provider>
    )
}

export const useSkills = () => {
    const context = useContext(SkillsContext);
    if (!context) throw new Error("useSkills must be used within a SettingsProvider");
    return context;
}