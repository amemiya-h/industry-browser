import fallback from "../assets/graphics/canvasUI/fallback.png";
import {useTouch} from "./SettingsContext.tsx";

interface Props {
    typeID?: number;
    size?: number;
}

const TypeIcon = ({ typeID = 0, size = 64 }: Props) => {
    const typeIconURL: string = `https://images.evetech.net/types/${typeID}/icon?size=64`;
    const { isTouch } = useTouch()
    return (
        <div>
            <img src={typeIconURL}
                 className="hover:cursor-pointer"
                 alt="Type Icon"
                 draggable="false"
                 width={`${size}`}
                 height={`${size}`}
                 onError={(e) => (e.currentTarget.src = fallback)}
                 {...isTouch ? (
                     {onDoubleClick: () => {window.open(`https://everef.net/types/${typeID}`, "_blank")}}
                 ) : (
                     {onClick: () => { window.open(`https://everef.net/types/${typeID}`, "_blank") }}
                 )}
            />
        </div>
        )
};

export default TypeIcon;
