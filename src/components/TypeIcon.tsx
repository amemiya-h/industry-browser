import fallback from "../assets/graphics/canvasUI/fallback.png";

interface Props {
    typeID?: number;
}

const TypeIcon = ({ typeID = 0 }: Props) => {
    const typeIconURL: string = `https://images.evetech.net/types/${typeID}/icon?size=64`;
    return (
        <div className="size-[64px]">
            <img src={typeIconURL}
                 alt="Type Icon"
                 draggable="false"
                 onError={(e) => (e.currentTarget.src = fallback)}
                 onDoubleClick={() => window.open(`https://everef.net/types/${typeID}`, "_blank")}
            />
        </div>
        )
};

export default TypeIcon;
