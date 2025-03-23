import info from "../assets/graphics/info.png";
import chevron_left from "../assets/graphics/chevron_left_double_16px.png";
import chevron_right from "../assets/graphics/chevron_right_double_16px.png";
import TypeIcon from "./TypeIcon.tsx";
import {useDescData} from "./ViewportContext.tsx";
import { getBaseMaterials, quantityToString } from "./industrylib.ts";
import { useState } from "react";
import caretDown from "../assets/graphics/caret_down_16px.png";
import caretRight from "../assets/graphics/caret_right_16px.png";

interface BaseMaterials {
    [typeID: string]: number;
}

interface MaterialTree {
    id: number;
    typeID: number;
    quantity: number;
    state: "expanded" | "collapsed";
    depth: number;
    productionType: "manufacturing" | "invention" | "reaction" | "pi" | "";
    children: MaterialTree[];
}

interface Props {
    typeID?: number;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    activeTree: MaterialTree | null;
}

const MaterialsList = ({ materials, typeToDesc }: { materials: BaseMaterials, typeToDesc: any }) => {
    return (
        <div className="flex flex-col gap-2">
            {Object.entries(materials).map(([typeID, quantity]) => (
                <div key={typeID} className="flex items-center gap-2">
                    <TypeIcon typeID={parseInt(typeID)} size={32}/>
                    <div>
                        <p className="text-regular">{typeToDesc[typeID].name}</p>
                        <p className="text-regular text-dim">{`${quantityToString(quantity, "long")} ${quantity === 1 ? "Unit" : "Units"}`}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const copyMaterialsToClipboard = (materials: BaseMaterials, typeToDesc: any, setCopied: (value: boolean) => void) => {
    const materialList = Object.entries(materials)
        .map(([typeID, quantity]) => `${typeToDesc[typeID].name} ${Math.ceil(quantity)}`)
        .join("\n");
    navigator.clipboard.writeText(materialList).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    });
};

const SidebarContent = (collapsed: boolean, typeID: number, activeTree: MaterialTree | null, typeToDesc: any) => {
    const [copiedTree, setCopiedTree] = useState(false);
    const [copiedFull, setCopiedFull] = useState(false);
    const [showMaterialTree, setShowMaterialTree] = useState(true);
    const [showMaterialFull, setShowMaterialFull] = useState(true);
    const [showDescription, setShowDescription] = useState(true);

    const typeName : string = (typeID ? typeToDesc[typeID.toString()].name : "");
    const typeDesc : string = (typeID ? typeToDesc[typeID.toString()].description : "");
    const typeGroup : string = (typeID ? typeToDesc[typeID.toString()].group : "");
    const typeCategory : string = (typeID ? typeToDesc[typeID.toString()].category : "");

    if (!collapsed) {
        return (
            <div className="bg-window-dark-active border border-window-border-active border-t-primary h-full w-[30em] self-stretch flex-grow-1 overflow-auto">
                <div className="self-stretch flex flex-row items-center justify-start">
                    <img src={info} alt="Info" className="logo" />
                    <p className= "text-title text-dim">
                        Production Summary
                    </p>
                </div>
                {typeID && activeTree ? (
                    <div className="overflow-x-hidden overflow-y-auto mx-[1em] flex flex-col items-start justify-start gap-[0.5em]">
                        <div className="h-[90px] flex flex-row items-center justify-start self-stretch">
                            <TypeIcon typeID={typeID}/>
                            <div className={"flex flex-col items-start justify-center"}>
                                <p className={"text-regular mx-[1em]"}>{typeName}</p>
                                <p className={"text-regular text-dim mx-[1em]"}>{typeGroup}</p>
                                <p className={"text-regular text-dim mx-[1em]"}>{typeCategory}</p>
                            </div>
                        </div>

                        <p className="text-regular p-[0.5em] bg-window-light-active self-stretch flex items-center justify-between">
                            <label className="flex flex-row items-center hover:cursor-pointer">
                                <button onClick={()=> setShowMaterialTree(!showMaterialTree)}/>
                                <img src={showMaterialTree ? caretDown : caretRight} alt={"toggle"} width={"16px"} height={"16px"}/>
                                Input materials (Tree)
                            </label>
                            <button
                                onClick={() => copyMaterialsToClipboard(getBaseMaterials(activeTree, true), typeToDesc, setCopiedTree)}
                                className="text-regular text-primary/40 hover:underline hover:text-primary hover:cursor-pointer"
                            >
                                {copiedTree ? "Copied!" : "Copy"}
                            </button>
                        </p>
                        {showMaterialTree &&
                            <div className="self-stretch">
                                <MaterialsList
                                    materials={getBaseMaterials(activeTree, true)}
                                    typeToDesc={typeToDesc}
                                />
                            </div>
                        }

                        <p className="text-regular p-[0.5em] bg-window-light-active self-stretch flex items-center justify-between">
                            <label className="flex flex-row items-center hover:cursor-pointer">
                                <button onClick={()=> setShowMaterialFull(!showMaterialFull)}/>
                                <img src={showMaterialFull ? caretDown : caretRight} alt={"toggle"} width={"16px"} height={"16px"}/>
                                Input materials (Full)
                            </label>
                            <button
                                onClick={() => copyMaterialsToClipboard(getBaseMaterials(activeTree, false), typeToDesc, setCopiedFull)}
                                className="text-regular text-primary/40 hover:underline hover:text-primary hover:cursor-pointer"
                            >
                                {copiedFull ? "Copied!" : "Copy"}
                            </button>
                        </p>
                        {showMaterialFull &&
                        <div className="self-stretch">
                            <MaterialsList 
                                materials={getBaseMaterials(activeTree, false)} 
                                typeToDesc={typeToDesc}
                            />
                        </div>
                        }
                        <p className="text-regular p-[0.5em] bg-window-light-active self-stretch">
                            <label className="flex flex-row items-center hover:cursor-pointer">
                                <button onClick={()=> setShowDescription(!showDescription)}/>
                                <img src={showDescription ? caretDown : caretRight} alt={"toggle"} width={"16px"} height={"16px"}/>
                                Description
                            </label>
                        </p>
                        {showDescription &&
                        <p className={`text-regular text-justify m-[1em] self-stretch ${(typeDesc ? "" : "text-dim")}`} dangerouslySetInnerHTML={typeDesc ? {__html: typeDesc} : {__html: "This item has no description."}}/>
                        }

                        <div className={"h-[2em]"}/>
                    </div>
                ) : (
                    <div className="overflow-auto mx-[1em] flex flex-col items-start justify-start">
                        <p className={"text-regular text-dim mx-[1em]"}>Select an item to display</p>
                    </div>
                )}
            </div>
        );
    }
}

const Sidebar = ({ collapsed, setCollapsed, typeID = 0, activeTree }: Props) => {
    const { typeToDesc } = useDescData();
    return (
        <aside
            className={`transition-all duration-75 absolute ${collapsed ? 'w-[2em]' : 'w-[32em]'} h-full right-0 bottom-auto z-20 hidden md:flex flex-row items-start justify-start `}
        >
            <button onClick={() => setCollapsed(!collapsed)} className="size-[2em] hover:cursor-pointer flex items-center justify-center">
                <img src={collapsed ? chevron_left : chevron_right} alt={collapsed ? "◀" : "▶"}/>
            </button>
            { SidebarContent(collapsed, typeID, activeTree, typeToDesc) }
        </aside>
    );
}

export default Sidebar;