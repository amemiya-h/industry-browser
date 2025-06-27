export const saveToFile = (data: object, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const loadFromFile = async (file: File): Promise<any> => {
    try {
        const fileText = await file.text();
        return JSON.parse(fileText);
    } catch (error) {
        console.error("Error processing config file:", error);
        return null;
    }
};
