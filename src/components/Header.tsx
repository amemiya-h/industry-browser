import {useState} from "react";
import industry from "../assets/graphics/industry.png"
import info from "../assets/graphics/info.png"

interface OverlayProps {
    isOpen: boolean;
    closeOverlay: () => void;
}

const Overlay= ({isOpen, closeOverlay} : OverlayProps) => {
    if (isOpen) {
        return (
            <div
                id={"about-overlay"}
                className="fixed w-screen h-screen z-50 inset-0 bg-black/50 flex items-center justify-center"
                onClick={closeOverlay}
            >
                <div
                    className="bg-window-light-active border border-window-border-active border-t-primary w-[50vw] min-w-[20em] max-h-[80vh] m-[1em] flex flex-col justify-center items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="m-0 self-stretch flex flex-row justify-start items-center">
                        <img src={info} alt="Info" className="logo" />
                        <p className="text-title text-bright">EVE Industry Browser: Information</p>
                    </div>
                    <div className="overflow-auto mx-[1em]">
                        <p className="text-regular m-[1em]">
                            Born from a personal need and an empty niche to visualize the full size of EVE Online's
                            comprehensive industry simulation, this tool distills the chaos of blueprints and materials
                            into a clear, interactive crafting tree.
                        </p>
                        <p className="text-regular m-[1em]">
                            Use the search bar on the top left to display production trees. Subsections can be hidden
                            via toggling the corresponding nodes.
                        </p>
                        <p className="text-regular m-[1em]">
                            Production summary is not available on mobile.
                        </p>
                        <p className="text-regular m-[1em]">
                            If you found this useful and would like to donate some ISK or contact me in game, please
                            reach out to Kei Aozora.
                        </p>
                        <hr className="h-px m-[1em] bg-dim border-0"/>
                        <p className="text-regular m-[1em]">
                            Built with React + Vite.
                        </p>
                        <p className="text-regular m-[1em]">
                            <a href={"https://reactflow.dev/"} className={"text-link"}>React Flow</a> © 2019-2024 webkid
                            GmbH. Licensed under the <a href={"https://github.com/xyflow/xyflow/blob/main/LICENSE"}
                                                        className={"text-link"}>MIT License</a>.
                        </p>
                        <p className="text-regular m-[1em]">
                            <a href={"https://github.com/farzher/fuzzysort/"} className={"text-link"}>fuzzysort</a> ©
                            2018 Stephen Kamenar. Licensed under the <a
                            href={"https://github.com/farzher/fuzzysort/blob/master/LICENSE"} className={"text-link"}>MIT
                            License</a>.
                        </p>
                        <p className="text-regular m-[1em]">
                            Special thanks to L.K.
                        </p>
                        <p className="text-regular text-dim m-[1em]">
                            EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved
                            worldwide. All other trademarks are the property of their respective owners. EVE Online, the
                            EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf.
                            All artwork, screenshots, characters, vehicles, storylines, world facts or other
                            recognizable features of the intellectual property relating to these trademarks are likewise
                            the intellectual property of CCP hf. CCP hf. has granted permission to EVE Industry Browser
                            to use EVE Online and all associated logos and designs for promotional and information
                            purposes on its website but does not endorse, and is not in any way affiliated with, EVE
                            Industry Browser. CCP is in no way responsible for the content on or functioning of this
                            website, nor can it be liable for any damage arising from the use of this website.
                        </p>
                    </div>
                    <div className="close-button">
                    <button onClick={closeOverlay} className="text-sm text-highlight m-[1em] px-[1em] py-[0.5em] border border-secondary bg-secondary/40 hover:cursor-pointer hover:bg-secondary/60">Close</button>
                    </div>
                </div>
            </div>
        )
    }
}

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openOverlay = () => setIsOpen(true);
    const closeOverlay = () => setIsOpen(false);


    return (
        <div id={"header"} className={"w-full h-[3em] bg-window-light-active flex flex-row items-center justify-start"}>
            <img src={industry} alt="Industry" className="logo" />
            <div className="text text-title text-dim h-full flex flex-col content-center justify-center min-w-[10em]">
                <p>EVE Industry Browser</p>
            </div>
            <button onClick={openOverlay} className="h-full hover:text-highlight hover:cursor-pointer">About</button>
            <Overlay isOpen={isOpen} closeOverlay={closeOverlay}/>
        </div>
    )
}

export default Header;