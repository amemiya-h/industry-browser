import fallback from "../assets/graphics/canvasUI/fallback.png";
import {useTouch} from "./ViewportContext.tsx";

interface Props {
    typeID?: number;
}

const TypeIcon = ({ typeID = 0 }: Props) => {
    const typeIconURL: string = `https://images.evetech.net/types/${typeID}/icon?size=64`;
    const { isTouch } = useTouch()
    return (
        <div className="size-[64px]">
            <img src={typeIconURL}
                 className="hover:cursor-pointer"
                 alt="Type Icon"
                 draggable="false"
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
