import caretDown from "../assets/graphics/caret_down_16px.png";
import caretRight from "../assets/graphics/caret_right_16px.png";
import {useState} from "react";

interface Props {
    children?: React.ReactNode;
    label: string;
    buttonLabel?: string;
    onButtonClick?: () => void;
    type?: "heading" | "subheading";
}

const Submenu = ({ children, label, buttonLabel, type="heading", onButtonClick }: Props) => {
    const [showMenu, setShowMenu] = useState(true);
    return (
        <div className={`self-stretch flex flex-col items-center justify-start`}>
            <p className={`text-regular px-[0.5em] ${type === "heading" ? "bg-window-light-active py-[0.5em]" : "py-[0.2em]"} self-stretch flex items-center justify-between`}>
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
            <div className={`${showMenu ? "block" : "hidden"} flex flex-col items-center self-stretch px-[1em] gap-[1em] ${type === "heading" ? "mt-[1em]" : ""}`}>
                {children}
            </div>
        </div>
    )
}

export default Submenu;