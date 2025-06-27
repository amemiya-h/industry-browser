import { useEffect, useState } from "react";

export const useTouch = (): { isTouch: boolean } => {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        const checkTouchscreen = () => {
            const touchSupported = window.matchMedia("(pointer: coarse)").matches;
            setIsTouch(touchSupported);
        };

        checkTouchscreen();
    }, []);

    return { isTouch };
};