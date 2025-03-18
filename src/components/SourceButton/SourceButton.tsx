import {useEffect, useState} from "react";
import "./SourceButton.css"
import sourcemanufacturingexpanded from "/src/assets/graphics/canvasUI/source/sourcemanufacturingexpanded.png"
import sourcemanufacturingexpandedhover from "/src/assets/graphics/canvasUI/source/sourcemanufacturingexpandedhover.png"
import sourcemanufacturingexpandedpressed from "/src/assets/graphics/canvasUI/source/sourcemanufacturingexpandedpressed.png"
import sourceinventionexpanded from "/src/assets/graphics/canvasUI/source/sourceinventionexpanded.png"
import sourceinventionexpandedhover from "/src/assets/graphics/canvasUI/source/sourceinventionexpandedhover.png"
import sourceinventionexpandedpressed from "/src/assets/graphics/canvasUI/source/sourceinventionexpandedpressed.png"
import sourcereactionexpanded from "/src/assets/graphics/canvasUI/source/sourcereactionexpanded.png"
import sourcereactionexpandedhover from "/src/assets/graphics/canvasUI/source/sourcereactionexpandedhover.png"
import sourcereactionexpandedpressed from "/src/assets/graphics/canvasUI/source/sourcereactionexpandedpressed.png"
import sourcepiexpanded from "/src/assets/graphics/canvasUI/source/sourcepiexpanded.png"
import sourcepiexpandedhover from "/src/assets/graphics/canvasUI/source/sourcepiexpandedhover.png"
import sourcepiexpandedpressed from "/src/assets/graphics/canvasUI/source/sourcepiexpandedpressed.png"
import sourcemanufacturingsuppressed from "/src/assets/graphics/canvasUI/source/sourcemanufacturingsuppressed.png"
import sourcemanufacturingsuppressedhover from "/src/assets/graphics/canvasUI/source/sourcemanufacturingsuppressedhover.png"
import sourcemanufacturingsuppressedpressed from "/src/assets/graphics/canvasUI/source/sourcemanufacturingsuppressedpressed.png"
import sourceinventionsuppressed from "/src/assets/graphics/canvasUI/source/sourceinventionsuppressed.png"
import sourceinventionsuppressedhover from "/src/assets/graphics/canvasUI/source/sourceinventionsuppressedhover.png"
import sourceinventionsuppressedpressed from "/src/assets/graphics/canvasUI/source/sourceinventionsuppressedpressed.png"
import sourcereactionsuppressed from "/src/assets/graphics/canvasUI/source/sourcereactionsuppressed.png"
import sourcereactionsuppressedhover from "/src/assets/graphics/canvasUI/source/sourcereactionsuppressedhover.png"
import sourcereactionsuppressedpressed from "/src/assets/graphics/canvasUI/source/sourcereactionsuppressedpressed.png"
import sourcepisuppressed from "/src/assets/graphics/canvasUI/source/sourcepisuppressed.png"
import sourcepisuppressedhover from "/src/assets/graphics/canvasUI/source/sourcepisuppressedhover.png"
import sourcepisuppressedpressed from "/src/assets/graphics/canvasUI/source/sourcepisuppressedpressed.png"


interface Props {
    state: "expanded" | "suppressed";
    variant: "manufacturing" | "invention" | "reaction" | "pi";
    onClick?: () => void;
}

const images = {
    expanded: {
        manufacturing: {
            idle: sourcemanufacturingexpanded,
            hover: sourcemanufacturingexpandedhover,
            pressed: sourcemanufacturingexpandedpressed,
        },
        invention: {
            idle: sourceinventionexpanded,
            hover: sourceinventionexpandedhover,
            pressed: sourceinventionexpandedpressed,
        },
        reaction: {
            idle: sourcereactionexpanded,
            hover: sourcereactionexpandedhover,
            pressed: sourcereactionexpandedpressed,
        },
        pi: {
            idle: sourcepiexpanded,
            hover: sourcepiexpandedhover,
            pressed: sourcepiexpandedpressed,
        },
    },
    suppressed: {
        manufacturing: {
            idle: sourcemanufacturingsuppressed,
            hover: sourcemanufacturingsuppressedhover,
            pressed: sourcemanufacturingsuppressedpressed,
        },
        invention: {
            idle: sourceinventionsuppressed,
            hover: sourceinventionsuppressedhover,
            pressed: sourceinventionsuppressedpressed,
        },
        reaction: {
            idle: sourcereactionsuppressed,
            hover: sourcereactionsuppressedhover,
            pressed: sourcereactionsuppressedpressed,
        },
        pi: {
            idle: sourcepisuppressed,
            hover: sourcepisuppressedhover,
            pressed: sourcepisuppressedpressed,
        },
    },
};

const SourceButton = ({ state, variant, onClick }:Props) => {
    const [status, setStatus] = useState<"idle" | "hover" | "pressed">("idle");
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