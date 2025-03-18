import "./Node.css"

interface Props {
    typeID: number;
    quantity: number;
}

const Node = ({ typeID, quantity } : Props) => {
    const QuantityToString = (quantity: number) => {
        const length = quantity.toString().length;
        console.log(quantity.toString())
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

    const typeIconURL : string = "https://images.evetech.net/types/" + typeID + "/icon?size=64";

    return (
        <div className="Node">
            <div className="IconFrame">
                <img src={typeIconURL} alt="Type Icon" draggable="false"/>
            </div>
            <div className="TextFrame">
                <p className="text-canvas">{QuantityToString(quantity)}</p>
            </div>
        </div>
    )
}

export default Node;