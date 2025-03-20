import fallback from "../assets/graphics/canvasUI/fallback.png";

interface Props {
    typeID?: number;
}

const TypeIcon = ({ typeID = 0 }: Props) => {
    const typeIconURL: string = `https://images.evetech.net/types/${typeID}/icon?size=64`;
    return (
        <div className="size-[64px]">
            <a href={`https://everef.net/types/${typeID}`} target="_blank" rel="noopener noreferrer">
                <img src={typeIconURL}
                     alt="Type Icon"
                     draggable="false"
                     onError={(e) => (e.currentTarget.src = fallback)}
                />
            </a>
        </div>
        )
};

export default TypeIcon;
