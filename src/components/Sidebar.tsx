import info from "../assets/graphics/info.png";
import chevron_left from "../assets/graphics/chevron_left_double_16px.png";
import chevron_right from "../assets/graphics/chevron_right_double_16px.png";
import fallback from "../assets/graphics/canvasUI/fallback.png";
import TYPE_TO_NAME from "../assets/data/name_lookup.json";
import TYPE_TO_DESC from "../assets/data/description_lookup.json";

const names = Object.entries(TYPE_TO_NAME).map(([id, name]) => ({ id, name }));
const descriptions = Object.entries(TYPE_TO_DESC).map(([id, desc]) => ({ id, desc }));

interface Props{
    typeID?: number;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarContent = ( collapsed : boolean, typeID : number ) => {

    const typeIconURL : string = "https://images.evetech.net/types/" + typeID + "/icon?size=64";
    const typeName : string = (typeID ? (names.filter((type) => type.id == typeID.toString()))[0].name : "");
    const typeDesc : string = (typeID ? (descriptions.filter((type) => type.id == typeID.toString()))[0].desc : "");

    if (!collapsed) {
        return (
            <div className="bg-window-dark border border-window-border h-full w-[22em] self-stretch flex-grow-1 overflow-auto">
                <div className="self-stretch flex flex-row items-center justify-start">
                    <img src={info} alt="Info" className="logo" />
                    <p className= "text-title text-highlight">
                        Production Summary
                    </p>
                </div>
                {typeID ?
                    <div className="overflow-x-hidden overflow-y-auto mx-[1em] flex flex-col items-start justify-start">
                        <div className="h-[90px] flex flex-row items-start justify-center">
                            <img src={typeID ? typeIconURL : fallback} alt="Type Icon" draggable="false"/>
                            <p className={"text-regular mx-[1em]"}>{typeName}</p>
                        </div>
                        <p className="text-regular p-[0.5em] bg-window-light self-stretch">Description</p>
                        <p className={"text-regular text-justify m-[1em] self-stretch " + (typeDesc ? "" : " text-dim")}>
                            {typeDesc ? typeDesc : "This item has no description."}
                        </p>
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
            className={`transition-all duration-75 absolute ${collapsed ? 'w-[2em]' : 'w-[24em]'} h-full right-0 bottom-auto z-20 hidden md:flex flex-row items-start justify-start `}
        >
            <button onClick={() => setCollapsed(!collapsed)} className="size-[2em] hover:cursor-pointer flex items-center justify-center">
                <img src={collapsed ? chevron_left : chevron_right} alt={collapsed ? "◀" : "▶"}/>
            </button>
            { SidebarContent(collapsed, typeID) }
        </aside>
    );
}

export default Sidebar;