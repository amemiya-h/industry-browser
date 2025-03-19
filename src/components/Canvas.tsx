import SourceButton from "./SourceButton.tsx";
import Node from "./Node.tsx";


interface Props {
    typeID: number;
}

const Canvas = ({ typeID }: Props) => {
    return (
        <div className="flex-1 relative overflow-hidden z-10 bg-window-dark bg-[url('./assets/graphics/canvasUI/grid.png')] bg-repeat bg-blend-lighten">
            <SourceButton variant="manufacturing" state="suppressed"/>
            <SourceButton variant="invention" state="suppressed"/>
            <SourceButton variant="reaction" state="expanded"/>
            <SourceButton variant="pi" state="expanded"/>
            <Node typeID={typeID} quantity={100000}/>
        </div>
    );
}

export default Canvas;