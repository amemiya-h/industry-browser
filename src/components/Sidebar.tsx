import info from "../assets/graphics/info.png";
import chevron_left from "../assets/graphics/chevron_left_double_16px.png";
import chevron_right from "../assets/graphics/chevron_right_double_16px.png";

interface Props{
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarContent = ( collapsed : boolean ) => {
    if (!collapsed) {
        return (
            <div className="bg-window-light border border-window-border h-full self-stretch flex-grow-1 overflow-auto">
                <div className="self-stretch flex flex-row items-center justify-start">
                    <img src={info} alt="Info" className="logo" />
                    <p className= "text text-title text-highlight">
                        Production Summary
                    </p>
                </div>
            </div>
        )
    }
}

const Sidebar = ( { collapsed, setCollapsed } : Props ) => {
    return (
        <aside
            className={`transition-all absolute ${collapsed ? 'w-[2em]' : 'w-[24em]'} h-16 bottom-0 md:h-full md:right-0 md:bottom-auto z-20 flex flex-row items-start justify-start`}
        >
            <button onClick={() => setCollapsed(!collapsed)} className="size-[2em] hover:cursor-pointer flex items-center justify-center">
                <img src={collapsed ? chevron_left : chevron_right} alt={collapsed ? "◀" : "▶"}/>
            </button>
            { SidebarContent(collapsed) }
        </aside>
    );
}

export default Sidebar;