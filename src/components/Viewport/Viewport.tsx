import "./Viewport.css"
import SourceButton from "../SourceButton/SourceButton.tsx";

const Viewport = () => {
    return (
        <div className="Viewport">
            <p className="text">Yay</p>
            <SourceButton variant="manufacturing"/>
            <SourceButton variant="invention"/>
            <SourceButton variant="reaction"/>
            <SourceButton variant="pi"/>
        </div>
    )
}

export default Viewport