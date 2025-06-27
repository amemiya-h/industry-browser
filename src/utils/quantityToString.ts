export function quantityToString(quantity: number, format: "long"|"short") {
    if (format === "long") {
        return quantity.toLocaleString("en-US");
    } else if (format === "short") {
        if (quantity < 1e4) {
            return quantity.toLocaleString("en-US").slice(0, 5);
        }else if (quantity < 1e5){
            return (quantity/1e3).toFixed(2) + "K";
        }else if (quantity < 1e8){
            return (quantity/1e6).toFixed(2) + "M";
        }else if (quantity < 1e11){
            return (quantity/1e9).toFixed(2) + "B";
        }else if (quantity < 1e14){
            return (quantity/1e12).toFixed(2) + "T";
        }else{
            return (quantity/1e15).toFixed(2) + "Q";
        }
    }
}