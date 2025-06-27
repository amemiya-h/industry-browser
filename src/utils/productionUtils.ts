import { getBaseScheme, Scheme } from "./dataImport.ts";
import { useResearch } from "../contexts/ResearchContext.tsx";

export function useGetScheme(): (typeID: number, runs?: number) => Scheme | null {
    const { materialEfficiency } = useResearch();

    return (typeID: number, runs: number = 1): Scheme | null => {
        const baseScheme = getBaseScheme(typeID);
        if (baseScheme) {
            const scheme = {...baseScheme}
            scheme.product.quantity = baseScheme.product.quantity * runs;
            scheme.materials.forEach((material) => {
                material.quantity *= runs;
                if (scheme.type === "manufacturing" && material.quantity !== 1) {
                    material.quantity *= 1 - materialEfficiency(material.typeID);
                }
            });
            return scheme;
        }
        return null;
    };
}