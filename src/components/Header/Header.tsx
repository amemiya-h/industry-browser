import "./Header.css"
import {useState} from "react";
import industry from "/src/assets/graphics/industry.png"
import info from "/src/assets/graphics/info.png"

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openOverlay = () => setIsOpen(true);
    const closeOverlay = () => setIsOpen(false);


    return (
        <div className="Header">
            <img src={industry} alt="Industry" className="logo" />
            <p className="text text-title text-dim">Industry Browser</p>
            <button onClick={openOverlay} className="about text">About</button>

            {isOpen && (
                <div
                    className="overlay"
                    onClick={closeOverlay}
                >
                    <div
                        className="textbox"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="title">
                            <img src={info} alt="Info" className="logo" />
                            <p className="text text-title text-bright">Industry Browser: Information</p>
                        </div>
                        <div className="content">
                            <p className="text">
                                Born from a personal need and an empty niche to visualize the full size of EVE Online's comprehensive industry simulation, this tool distills the chaos of blueprints and materials into a clear, interactive crafting tree.
                            </p>
                            <p/>
                            <p className="text">
                                If you found this useful and would like to donate some ISK or contact me in game, please reach out to Kei Aozora.
                            </p>
                            <p/>
                            <p className="text text-dim">
                                EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide. All other trademarks are the property of their respective owners. EVE Online, the EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf. All artwork, screenshots, characters, vehicles, storylines, world facts or other recognizable features of the intellectual property relating to these trademarks are likewise the intellectual property of CCP hf. CCP hf. has granted permission to Industry Browser to use EVE Online and all associated logos and designs for promotional and information purposes on its website but does not endorse, and is not in any way affiliated with, Industry Browser. CCP is in no way responsible for the content on or functioning of this website, nor can it be liable for any damage arising from the use of this website.
                            </p>
                        </div>
                        <div className="close-button">
                            <button onClick={closeOverlay} className="text-sm text-highlight">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header;