import {useState} from "react";
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {QuantityToString} from "./industrylib.ts";
import TypeIcon from './TypeIcon';
import TYPE_TO_DESC_DATA from "../assets/data/desc_data_lookup.json";

type ProductionNode = Node<{ typeID: number, quantity: number}, 'production'>

const descData = Object.entries(TYPE_TO_DESC_DATA).map(([id, data]) => ({ id, data }));

const ProductionNode = ({ data } : NodeProps<ProductionNode>) => {
    const [isHovered, setIsHovered] = useState(false);
    const typeName : string = (data.typeID ? (descData.filter((type) => type.data.id == data.typeID))[0].data.name : "");
    const typeGroup : string = (data.typeID ? (descData.filter((type) => type.data.id == data.typeID))[0].data.group : "");
    return (
        <div className="nodrag relative h-[120px] w-[90px] hover:cursor-default bg-[url('./assets/graphics/canvasUI/bg.png')]" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Handle type={"target"} position={Position.Top} style={{width:"0", height:"0", visibility: "hidden"}}/>
            <div className="h-[90px] w-[90px] relative inset-0 flex items-center justify-center">
                <TypeIcon typeID={data.typeID}/>
            </div>
            <div className="h-[26px] w-[90px] relative top-[6px] left-0 flex items-center justify-center select-none">
                <p className="text-sm-canvas">{QuantityToString(data.quantity, "short")}</p>
            </div>
            {isHovered &&
                <div className={`absolute right-[calc(100%+1em)] top-[50%] translate-y-[-50%] max-h-[120px] bg-window-light-active/80 border border-window-border-active text-regular-canvas flex flex-col items-end justify-center py-[0.5em]`}>
                     <p className="text-regular-canvas text-right mx-[1em] text-nowrap">{typeName}</p>
                     <p className="text-regular-canvas text-dim text-right mx-[1em] text-nowrap">{typeGroup}</p>
                     <p className="text-regular-canvas text-dim text-right mx-[1em] text-nowrap">{`${QuantityToString(data.quantity, "long")} ${data.quantity == 1 ? "Unit" : "Units"}`}</p>
                </div>
            }
            <Handle type={"source"} position={Position.Bottom} style={{width:"0", height:"0", visibility: "hidden"}}/>
        </div>
    )
}

export default ProductionNode;