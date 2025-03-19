import fallback from "../assets/graphics/canvasUI/fallback.png"

interface Props {
    typeID: number;
    quantity: number;
}

const QuantityToString = (quantity: number) => {
    const length = quantity.toString().length;
    if (length < 5) {
        return quantity.toLocaleString("en-US");
    }else if (length == 5){
        return (quantity/1e3).toFixed(2) + "K";
    }else if (length < 9){
        return (quantity/1e6).toFixed(2) + "M";
    }else if (length < 12){
        return (quantity/1e9).toFixed(2) + "B";
    }else if (length < 15){
        return (quantity/1e12).toFixed(2) + "T";
    }else{
        return (quantity/1e15).toFixed(2) + "Q";
    }
}

const ProductionNode = ({ typeID, quantity } : Props) => {
    const typeIconURL : string = "https://images.evetech.net/types/" + typeID + "/icon?size=64";
    return (
        <div className="h-[120px] w-[90px] bg-[url('./assets/graphics/canvasUI/bg.png')]">
            <div className="h-[90px] w-[90px] relative inset-0 flex items-center justify-center">
                <img src={typeID ? typeIconURL : fallback} alt="Type Icon" draggable="false"/>
            </div>
            <div className="h-[26px] w-[90px] relative top-[6px] left-0 flex items-center justify-center select-none">
                <p>{QuantityToString(quantity)}</p>
            </div>
        </div>
    )
}

export default ProductionNode;