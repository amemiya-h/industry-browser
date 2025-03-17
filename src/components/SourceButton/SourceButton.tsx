import {useEffect, useState} from "react";
import "./SourceButton.css"

interface Props {
    stateInit?: "expanded" | "suppressed";
    variant: "manufacturing" | "invention" | "reaction" | "pi";
    onClick?: () => void;
}

const images = {
    expanded: {
        manufacturing: {
            idle: "src/assets/graphics/canvasUI/source/sourcemanufacturingexpanded.png",
            hover: "src/assets/graphics/canvasUI/source/sourcemanufacturingexpandedhover.png",
            pressed: "src/assets/graphics/canvasUI/source/sourcemanufacturingexpandedpressed.png",
        },
        invention: {
            idle: "src/assets/graphics/canvasUI/source/sourceinventionexpanded.png",
            hover: "src/assets/graphics/canvasUI/source/sourceinventionexpandedhover.png",
            pressed: "src/assets/graphics/canvasUI/source/sourceinventionexpandedpressed.png",
        },
        reaction: {
            idle: "src/assets/graphics/canvasUI/source/sourcereactionexpanded.png",
            hover: "src/assets/graphics/canvasUI/source/sourcereactionexpandedhover.png",
            pressed: "src/assets/graphics/canvasUI/source/sourcereactionexpandedpressed.png",
        },
        pi: {
            idle: "src/assets/graphics/canvasUI/source/sourcepiexpanded.png",
            hover: "src/assets/graphics/canvasUI/source/sourcepiexpandedhover.png",
            pressed: "src/assets/graphics/canvasUI/source/sourcepiexpandedpressed.png",
        },
    },
    suppressed: {
        manufacturing: {
            idle: "src/assets/graphics/canvasUI/source/sourcemanufacturingsuppressed.png",
            hover: "src/assets/graphics/canvasUI/source/sourcemanufacturingsuppressedhover.png",
            pressed: "src/assets/graphics/canvasUI/source/sourcemanufacturingsuppressedpressed.png",
        },
        invention: {
            idle: "src/assets/graphics/canvasUI/source/sourceinventionsuppressed.png",
            hover: "src/assets/graphics/canvasUI/source/sourceinventionsuppressedhover.png",
            pressed: "src/assets/graphics/canvasUI/source/sourceinventionsuppressedpressed.png",
        },
        reaction: {
            idle: "src/assets/graphics/canvasUI/source/sourcereactionsuppressed.png",
            hover: "src/assets/graphics/canvasUI/source/sourcereactionsuppressedhover.png",
            pressed: "src/assets/graphics/canvasUI/source/sourcereactionsuppressedpressed.png",
        },
        pi: {
            idle: "src/assets/graphics/canvasUI/source/sourcepisuppressed.png",
            hover: "src/assets/graphics/canvasUI/source/sourcepisuppressedhover.png",
            pressed: "src/assets/graphics/canvasUI/source/sourcepisuppressedpressed.png",
        },
    },
};

const SourceButton = ({ stateInit = "suppressed", variant, onClick }:Props) => {
    const [status, setStatus] = useState<"idle" | "hover" | "pressed">("idle");
    const [state, setState] = useState<"expanded" | "suppressed">(stateInit);
    const [pressedInside, setPressedInside] = useState(false);
    const [isMousePressed, setIsMousePressed] = useState(false);

    useEffect(() => {
        const handleMouseDown = () => setIsMousePressed(true);
        const handleMouseUp = () => setIsMousePressed(false);

        // Add event listeners to document to track mouse button state globally
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mouseup", handleMouseUp);

        // Cleanup listeners on component unmount
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isMousePressed]);

    const handlePress = () => {
        setStatus("pressed");
        setPressedInside(true);
    };

    const handleClick = () => {
        setPressedInside(false);
        setState(prevState => prevState == "expanded"?"suppressed":"expanded");
        setStatus("hover")
        onClick?.();
    };

    return (
        <button
            className="source-button"
            onMouseDown={handlePress}
            onMouseLeave={() => setStatus("idle")}
            onMouseEnter={() => {
                if (pressedInside && isMousePressed) {
                    setStatus("pressed");
                } else {
                    setStatus("hover");
                    setPressedInside(false);
                }
            }}
            onClick={handleClick}
        >
            <img
                src={images[state][variant][status]}
                alt={`${state} ${variant} button`}
                draggable="false"
            />
        </button>
    );
}

export default SourceButton