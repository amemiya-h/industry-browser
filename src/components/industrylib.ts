export function QuantityToString(quantity: number, format: "long"|"short") {
    if (format === "long") {
        return quantity.toLocaleString("en-US");
    } else if (format === "short") {
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
}