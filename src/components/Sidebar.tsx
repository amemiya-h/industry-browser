import { useState } from "react";

import info from "../assets/graphics/info.png";
import chevron_left from "../assets/graphics/chevron_left_double_16px.png";
import chevron_right from "../assets/graphics/chevron_right_double_16px.png";

import TypeIcon from "./TypeIcon.tsx";
import Submenu from "./Submenu.tsx";

import { quantityToString } from "../utils/quantityToString.ts";
import {getProductionInfo, productionInfo} from "../utils/statistics.ts";
import { typeToDesc } from "../utils/dataImport.ts";
import {useViewportContext} from "../contexts/ViewportContext.tsx";
import {useResearch} from "../contexts/ResearchContext.tsx";

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

const MaterialsList = ({ materials }: { materials: productionInfo }) => {
    return (
        <div className="flex flex-col gap-[0.2em] self-stretch">
            {Object.entries(materials)
                .filter(([_, { stocksCount, consumedCount }]) => stocksCount < consumedCount)
                .map(([typeID, {stocksCount, consumedCount}]) => (
                <div key={typeID} className="flex items-center gap-2">
                    <TypeIcon typeID={parseInt(typeID)} size={32}/>
                    <div>
                        <p className="text-regular">{`${quantityToString(consumedCount - stocksCount, "long")} x ${typeToDesc[typeID].name}`}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const RunsList = ({ materials }: { materials: productionInfo }) => {
    return (
        <div className="flex flex-col gap-[0.2em] self-stretch">
            {Object.entries(materials)
                .filter(([_, { runs }]) => runs > 0)
                .sort(([, materialA], [, materialB]) =>  materialB.depth - materialA.depth)
                .map(([typeID, {stocksCount, consumedCount, runs}]) => (
                <div key={typeID} className="flex items-center gap-2">
                    <TypeIcon typeID={parseInt(typeID)} size={32}/>
                    <div>
                        <p className="text-regular">{typeToDesc[typeID].name}</p>
                        <p className="text-regular text-dim">
                            {`${runs} ${runs === 1 ? "Run" : "Runs"} ${
                                consumedCount < stocksCount
                                    ? `| ${stocksCount - consumedCount} ${stocksCount - consumedCount === 1 ? "Unit" : "Units"} in surplus.`
                                    : ""
                            }`}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const copyMaterialsToClipboard = (materials: productionInfo, setCopied: (value: boolean) => void) => {
    const materialList = Object.entries(materials)
        .filter(([_, { stocksCount, consumedCount }]) => stocksCount < consumedCount)
        .map(([typeID, {stocksCount, consumedCount}]) => `${typeToDesc[typeID].name} ${Math.ceil(consumedCount - stocksCount)}`)
        .join("\n");
    navigator.clipboard.writeText(materialList).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    });
};

const SidebarContent = (collapsed: boolean, typeID: number, activeTree: MaterialTree | null) => {
    const [copiedTree, setCopiedTree] = useState(false);
    const [copiedFull, setCopiedFull] = useState(false);

    const typeName : string = (typeID ? typeToDesc[typeID.toString()].name : "");
    const typeDesc : string = (typeID ? typeToDesc[typeID.toString()].description : "");
    const typeGroup : string = (typeID ? typeToDesc[typeID.toString()].group : "");
    const typeCategory : string = (typeID ? typeToDesc[typeID.toString()].category : "");
    const { runs } = useViewportContext();
    const { materialEfficiency } = useResearch();

    const treeInfoShown = activeTree ? getProductionInfo(activeTree, runs, true, materialEfficiency) : null;
    const treeInfoFull = activeTree ? getProductionInfo(activeTree, runs, false, materialEfficiency) : null;

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
                        <Submenu label={"Input materials"}>
                            <Submenu label={"Shown only"} type={"subheading"} buttonLabel={copiedTree ? "Copied!" : "Copy"} onButtonClick={() => copyMaterialsToClipboard(treeInfoShown!, setCopiedTree)}>
                                <MaterialsList
                                    materials={treeInfoShown!}
                                />
                            </Submenu>
                            <Submenu label={"Full chain"} type={"subheading"} buttonLabel={copiedFull ? "Copied!" : "Copy"} onButtonClick={() => copyMaterialsToClipboard(treeInfoFull!, setCopiedFull)}>
                                <MaterialsList
                                    materials={treeInfoFull!}
                                />
                            </Submenu>
                        </Submenu>
                        <Submenu label={"Job Runs"}>
                            <Submenu label={"Shown only"} type={"subheading"}>
                                <RunsList materials={treeInfoShown!}/>
                            </Submenu>
                            <Submenu label={"Full chain"} type={"subheading"}>
                                <RunsList materials={treeInfoFull!}/>
                            </Submenu>
                        </Submenu>

                        <Submenu label={"Description"}>
                            <p className={`text-regular text-justify mx-[1em] self-stretch ${(typeDesc ? "" : "text-dim")}`} dangerouslySetInnerHTML={typeDesc ? {__html: typeDesc} : {__html: "This item has no description."}}/>
                        </Submenu>

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

    return (
        <aside
            className={`transition-all duration-75 absolute ${collapsed ? 'w-[2em]' : 'w-[32em]'} h-full right-0 bottom-auto z-20 hidden md:flex flex-row items-start justify-start `}
        >
            <button onClick={() => setCollapsed(!collapsed)} className="size-[2em] hover:cursor-pointer flex items-center justify-center">
                <img src={collapsed ? chevron_left : chevron_right} alt={collapsed ? "◀" : "▶"}/>
            </button>
            { SidebarContent(collapsed, typeID, activeTree) }
        </aside>
    );
}

export default Sidebar;