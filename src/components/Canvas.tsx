import SourceButton from "./SourceButton.tsx";
import Node from "./Node.tsx";


interface Props {
    typeID: number;
}

const Canvas = ({ typeID }: Props) => {
    return (
        <div className="flex-1 relative overflow-hidden z-10 bg-window-dark bg-[url('./assets/graphics/canvasUI/grid.png')] bg-repeat bg-blend-lighten">
            <div className="p-4 z-10">
                {typeID ? (
                    <div className="mt-4">
                        <h2 className="text-sm font-bold">{typeID}</h2>
                    </div>
                ) : (
                    <p className="mt-4">No item found</p>
                )}
            </div>

            <SourceButton variant="manufacturing" state="suppressed"/>
            <SourceButton variant="invention" state="suppressed"/>
            <SourceButton variant="reaction" state="expanded"/>
            <SourceButton variant="pi" state="expanded"/>
            <Node typeID={typeID} quantity={100000}/>
        </div>
    );
}

export default Canvas;