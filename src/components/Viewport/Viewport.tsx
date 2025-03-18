import "./Viewport.css"
import SourceButton from "../SourceButton/SourceButton.tsx";
import Node from "../Node/Node.tsx";



const Viewport = () => {
    return (
        <div className="Viewport">
            <p className="text">Yay</p>
            <SourceButton variant="manufacturing" state="suppressed"/>
            <SourceButton variant="invention" state="suppressed"/>
            <SourceButton variant="reaction" state="expanded"/>
            <SourceButton variant="pi" state="expanded"/>
            <Node typeID={626} quantity={100000}/>
        </div>
    )
}

export default Viewport