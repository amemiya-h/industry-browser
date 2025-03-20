import {useEffect, useState} from "react";
import {Handle, Node, NodeProps, Position} from '@xyflow/react';

import sourcemanufacturingexpanded from "../assets/graphics/canvasUI/source/sourcemanufacturingexpanded.png"
import sourcemanufacturingexpandedhover from "../assets/graphics/canvasUI/source/sourcemanufacturingexpandedhover.png"
import sourcemanufacturingexpandedpressed from "../assets/graphics/canvasUI/source/sourcemanufacturingexpandedpressed.png"
import sourceinventionexpanded from "../assets/graphics/canvasUI/source/sourceinventionexpanded.png"
import sourceinventionexpandedhover from "../assets/graphics/canvasUI/source/sourceinventionexpandedhover.png"
import sourceinventionexpandedpressed from "../assets/graphics/canvasUI/source/sourceinventionexpandedpressed.png"
import sourcereactionexpanded from "../assets/graphics/canvasUI/source/sourcereactionexpanded.png"
import sourcereactionexpandedhover from "../assets/graphics/canvasUI/source/sourcereactionexpandedhover.png"
import sourcereactionexpandedpressed from "../assets/graphics/canvasUI/source/sourcereactionexpandedpressed.png"
import sourcepiexpanded from "../assets/graphics/canvasUI/source/sourcepiexpanded.png"
import sourcepiexpandedhover from "../assets/graphics/canvasUI/source/sourcepiexpandedhover.png"
import sourcepiexpandedpressed from "../assets/graphics/canvasUI/source/sourcepiexpandedpressed.png"
import sourcemanufacturingsuppressed from "../assets/graphics/canvasUI/source/sourcemanufacturingsuppressed.png"
import sourcemanufacturingsuppressedhover from "../assets/graphics/canvasUI/source/sourcemanufacturingsuppressedhover.png"
import sourcemanufacturingsuppressedpressed from "../assets/graphics/canvasUI/source/sourcemanufacturingsuppressedpressed.png"
import sourceinventionsuppressed from "../assets/graphics/canvasUI/source/sourceinventionsuppressed.png"
import sourceinventionsuppressedhover from "../assets/graphics/canvasUI/source/sourceinventionsuppressedhover.png"
import sourceinventionsuppressedpressed from "../assets/graphics/canvasUI/source/sourceinventionsuppressedpressed.png"
import sourcereactionsuppressed from "../assets/graphics/canvasUI/source/sourcereactionsuppressed.png"
import sourcereactionsuppressedhover from "../assets/graphics/canvasUI/source/sourcereactionsuppressedhover.png"
import sourcereactionsuppressedpressed from "../assets/graphics/canvasUI/source/sourcereactionsuppressedpressed.png"
import sourcepisuppressed from "../assets/graphics/canvasUI/source/sourcepisuppressed.png"
import sourcepisuppressedhover from "../assets/graphics/canvasUI/source/sourcepisuppressedhover.png"
import sourcepisuppressedpressed from "../assets/graphics/canvasUI/source/sourcepisuppressedpressed.png"

type SourceButtonNode = Node<{ state: "expanded" | "suppressed", variant: "manufacturing" | "invention" | "reaction" | "pi", onClick?: () => void}, 'production'>

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

const SourceButtonNode = ({ data }:NodeProps<SourceButtonNode>) => {
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
        data.onClick?.();
    };

    return (
        <button
            className="nodrag w-fit h-fit border-none inline-block hover:cursor-pointer"
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
            <Handle type={"target"} position={Position.Top} style={{width:"0", height:"0", visibility: "hidden"}}/>
            <img
                className="block"
                src={images[data.state][data.variant][status]}
                alt={`${data.state} ${data.variant} button`}
                draggable="false"
            />
            <Handle type={"source"} position={Position.Bottom} style={{width:"0", height:"0", visibility: "hidden"}}/>
        </button>
    );
}

export default SourceButtonNode