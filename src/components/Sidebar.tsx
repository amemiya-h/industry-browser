import info from "../assets/graphics/info.png";
import chevron_left from "../assets/graphics/chevron_left_double_16px.png";
import chevron_right from "../assets/graphics/chevron_right_double_16px.png";
import TYPE_TO_DESC_DATA from "../assets/data/desc_data_lookup.json";
import TypeIcon from "./TypeIcon.tsx";

const descData = Object.entries(TYPE_TO_DESC_DATA).map(([id, data]) => ({ id, data }));

interface Props{
    typeID?: number;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarContent = ( collapsed : boolean, typeID : number ) => {
    const typeName : string = (typeID ? (descData.filter((type) => type.data.id == typeID))[0].data.name : "");
    const typeDesc : string = (typeID ? (descData.filter((type) => type.data.id == typeID))[0].data.description : "");
    const typeGroup : string = (typeID ? (descData.filter((type) => type.data.id == typeID))[0].data.group : "");
    const typeCategory : string = (typeID ? (descData.filter((type) => type.data.id == typeID))[0].data.category : "");

    if (!collapsed) {
        return (
            <div className="bg-window-dark-active border border-window-border h-full w-[30em] self-stretch flex-grow-1 overflow-auto">
                <div className="self-stretch flex flex-row items-center justify-start">
                    <img src={info} alt="Info" className="logo" />
                    <p className= "text-title text-dim">
                        Production Summary
                    </p>
                </div>
                {typeID ?
                    <div className="overflow-x-hidden overflow-y-auto mx-[1em] flex flex-col items-start justify-start">
                        <div className="h-[90px] flex flex-row items-start justify-center">
                            <TypeIcon typeID={typeID}/>
                            <div className={"flex flex-col items-start justify-center"}>
                                <p className={"text-regular mx-[1em]"}>{typeName}</p>
                                <p className={"text-regular text-dim mx-[1em]"}>{typeGroup}</p>
                                <p className={"text-regular text-dim mx-[1em]"}>{typeCategory}</p>
                            </div>
                        </div>
                        <p className="text-regular p-[0.5em] bg-window-light self-stretch">Input materials (Tree)</p>
                        <p className={"text-regular text-justify m-[1em] self-stretch text-dim"}>To be added</p>
                        <p className="text-regular p-[0.5em] bg-window-light self-stretch">Input materials (Full)</p>
                        <p className={"text-regular text-justify m-[1em] self-stretch text-dim"}>To be added</p>
                        <p className="text-regular p-[0.5em] bg-window-light self-stretch">Description</p>
                        <p className={`text-regular text-justify m-[1em] self-stretch ${(typeDesc ? "" : "text-dim")}`} dangerouslySetInnerHTML={typeDesc ? {__html: typeDesc} : {__html: "This item has no description."}}/>

                        <div className={"h-[2em]"}/>
                    </div>
                    :
                    <div className="overflow-auto mx-[1em] flex flex-col items-start justify-start">
                        <p className={"text-regular text-dim mx-[1em]"}>Select an item to display</p>
                    </div>
                }

            </div>
        )
    }
}

const Sidebar = ( { collapsed, setCollapsed, typeID = 0 } : Props ) => {
    return (
        <aside
            className={`transition-all duration-75 absolute ${collapsed ? 'w-[2em]' : 'w-[32em]'} h-full right-0 bottom-auto z-20 hidden md:flex flex-row items-start justify-start `}
        >
            <button onClick={() => setCollapsed(!collapsed)} className="size-[2em] hover:cursor-pointer flex items-center justify-center">
                <img src={collapsed ? chevron_left : chevron_right} alt={collapsed ? "◀" : "▶"}/>
            </button>
            { SidebarContent(collapsed, typeID) }
        </aside>
    );
}

export default Sidebar;