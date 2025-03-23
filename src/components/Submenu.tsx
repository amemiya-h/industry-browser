import caretDown from "../assets/graphics/caret_down_16px.png";
import caretRight from "../assets/graphics/caret_right_16px.png";
import {useState} from "react";

interface Props {
    children?: React.ReactNode;
    label: string;
    buttonLabel?: string;
    onButtonClick?: () => void;
}

const Submenu = ({ children, label, buttonLabel, onButtonClick }: Props) => {
    const [showMenu, setShowMenu] = useState(true);
    return (
        <>
            <p className="text-regular p-[0.5em] bg-window-light-active self-stretch flex items-center justify-between">
                <label className="flex flex-row items-center hover:cursor-pointer">
                    <button onClick={()=> setShowMenu(!showMenu)}/>
                    <img src={showMenu ? caretDown : caretRight} alt={"toggle"} width={"16px"} height={"16px"}/>
                    {label}
                </label>
                <button
                    onClick={onButtonClick}
                    className="text-regular text-primary/40 hover:underline hover:text-primary hover:cursor-pointer"
                >
                    {buttonLabel}
                </button>
            </p>
            {showMenu && (
                children
            )}
        </>
    )
}

export default Submenu;