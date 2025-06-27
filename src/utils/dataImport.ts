import schemesLookupData from "../assets/data/schemes_lookup.json";
import schemesData from "../assets/data/schemes.json";
import typeLookup from "../assets/data/type_lookup.json";
import typeToDescData from "../assets/data/desc_data_lookup.json";


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

export type Type = {
    name: string,
    typeID: number
}

export type Material = {
    quantity: number;
    typeID: number;
}

export type Scheme = {
    materials: Material[];
    product: Material;
    type: "manufacturing" | "invention" | "reaction" | "pi";
    time: number;
}

export type Schemes = {
    [key: string]: Scheme;
}

export type SchemesLookup = {
    [key: string]: number;
}

export const schemesLookup = schemesLookupData as SchemesLookup;
export const schemes = schemesData as Schemes;
export const types = Object.entries(typeLookup).map(([name, typeID]) => ({ name, typeID })) as Type[];
export const typeToDesc = typeToDescData as TypeToDesc;

export function getBaseScheme(typeID: number): Scheme | null {
    const typeIDStr = typeID.toString();
    if (Object.prototype.hasOwnProperty.call(schemesLookup, typeIDStr)) {
        const schemeID = schemesLookup[typeIDStr].toString();
        if (Object.prototype.hasOwnProperty.call(schemes, schemeID)) {
            return schemes[schemeID];
        }
    }
    return null
}