import {useEffect, useRef, useState} from "react";
import * as fuzzysort from "fuzzysort";

import industry from "../assets/graphics/industry.png"
import info from "../assets/graphics/info.png"
import settings from "../assets/graphics/settings.png"
import checked from "../assets/graphics/check_true.png";
import unchecked from "../assets/graphics/check_false.png";
import minimize from "../assets/graphics/minimize_16px.png"
import {useSettings, useDescData} from "./SettingsContext.tsx";
import Submenu from "./Submenu.tsx";
import SearchBar from "./SearchBar";
import {types} from "./industrylib.ts";


interface OverlayProps {
    isOpen: boolean;
    closeOverlay: () => void;
}

const AboutOverlay= ({isOpen, closeOverlay} : OverlayProps) => {
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
                            comprehensive industry simulation.
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
                            <a href={"https://d3js.org/d3-hierarchy"} className={"text-link"}>d3-hierarchy</a> ©
                            2010-2021 Mike Bostock. Licensed under the <a
                            href={"https://github.com/d3/d3-hierarchy?tab=ISC-1-ov-file#readme"} className={"text-link"}>ISC
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


const SettingsOverlay = ({ isOpen, closeOverlay }: OverlayProps) => {
    const { toggles, setToggles, setMaterialEfficiency, materialEfficiencyMap, setMaterialEfficiencyMap, saveConfigToFile, loadConfigFromFile } = useSettings();
    const { typeToDesc } = useDescData();
    const toggleLabels = [
        "Show manufacturing",
        "Show reactions",
        "Show PI",
        "Suppress fuel blocks",
        "Suppress R.A.M.",
        "Show only first row",
    ];

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ name: string; id: number }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const availableItems = types.filter(item => materialEfficiencyMap[item.id] === undefined);
        if (query) {
            const partialMatches = fuzzysort.go(query, availableItems, { key: "name", threshold: 0.75 });
            setSuggestions(partialMatches.map((m) => m["obj"]));
        } else {
            setSuggestions([]);
        }
    }, [query]);

    const handleToggle = (index: number) => {
        const updatedToggles = [...toggles];
        updatedToggles[index] = !updatedToggles[index];
        setToggles(updatedToggles);
    };

    const handleAddEfficiency = (item: { name: string; id: number }) => {
        if (materialEfficiencyMap[item.id] === undefined) {
            setMaterialEfficiency(item.id, 0);
        }
    };

    const handleRemoveEfficiency = (typeID: number) => {
        const { [typeID]: _, ...updated } = materialEfficiencyMap;
        setMaterialEfficiencyMap(updated);
    };

    const handleEfficiencyChange = (typeID: number, value: number) => {
        const clampedValue = Math.min(Math.max(value, 0), 10);
        setMaterialEfficiency(typeID, clampedValue);
    };

    const handleFileInputChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await loadConfigFromFile(file);
    };

    // Trigger the hidden file input’s click to open the system dialog
    const handleUploadButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };


    if (!isOpen) return null;

    return (
        <div
            className="fixed w-screen h-screen z-50 inset-0 bg-black/50 flex items-center justify-center"
            onClick={closeOverlay}
        >
            <div
                className="bg-window-dark-active border border-window-border-active border-t-primary w-[50vw] min-w-[20em] max-h-[80vh] flex flex-col justify-center items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="m-0 self-stretch flex flex-row justify-between items-center">
                    <div className={"h-full w-[16em] flex flex-row items-center justify-start"}>
                        <img src={settings} alt="Settings" className="logo" />
                        <p className="text-title text-bright">Settings</p>
                    </div>
                    <img src={minimize} onClick={closeOverlay} alt={"Minimize"} className={"m-[1em] hover:cursor-pointer opacity-60 hover:opacity-100"}/>
                </div>
                <div className="overflow-auto mx-[1em] self-stretch flex flex-col justify-start items-center gap-[1em]">
                    <Submenu label={"Default behaviour"}>
                        <div className="flex flex-col justify-start items-start gap-[1em] self-stretch mx-[1em]">
                            {toggleLabels.map((label, index) => (
                                <label key={index} className="flex items-center gap-2 hover:cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={toggles[index]}
                                        onChange={() => handleToggle(index)}
                                        className="sr-only peer"
                                    />
                                    <img
                                        src={checked}
                                        alt="Checked"
                                        width="16px"
                                        height="16px"
                                        className="hidden hover:cursor-pointer bg-window-dark border border-window-border peer-checked:block"
                                    />
                                    <div
                                        className="size-[16px] hover:cursor-pointer bg-window-dark border border-window-border peer-checked:hidden"
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </Submenu>
                    <Submenu label={"Material Efficiency"}>
                        <div className="relative flex flex-col items-center self-stretch gap-[1em] mx-[1em]">
                            <p className="text-regular text-dim self-stretch">Add material efficiency value for items here.</p>
                            <div className="flex flex-col gap-[1em] mx-[1em] w-[80%]">
                                <SearchBar setQuery={setQuery} setResult={handleAddEfficiency} suggestions={suggestions} />
                                <div className="h-[10em] flex flex-col gap-[0.2em] overflow-y-scroll text-sm bg-window-dark-active border border-window-border-active">
                                    {Object.entries(materialEfficiencyMap).map(([typeID, efficiency]) => (
                                        <div key={typeID} className="flex justify-between items-center self-stretch bg-window-light-active border border-window-border-active p-[0.2em]">
                                            <span className="text-regular mx-[0.5em]">{`${typeToDesc[typeID.toString()].name}`}</span>
                                            <div className="flex">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={10}
                                                    value={efficiency}
                                                    onChange={(e) => handleEfficiencyChange(Number(typeID), Number(e.target.value))}
                                                    className="w-[6em] outline-0 text-sm bg-window-dark focus:bg-window-light border border-window-border px-2 py-1"

                                                />
                                                <img
                                                    src={unchecked}
                                                    onClick={() => handleRemoveEfficiency(Number(typeID))}
                                                    className="m-[0.5em] 40 hover:cursor-pointer"
                                                >
                                                </img>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Submenu>
                </div>
                <div className="">
                    <button
                        onClick={saveConfigToFile}
                        className="text-sm text-highlight w-[12em] m-[1em] px-[1em] py-[0.5em] border border-secondary bg-secondary/40 hover:cursor-pointer hover:bg-secondary/60"
                    >
                        Download Settings
                    </button>
                    <button
                        onClick={handleUploadButtonClick}
                        className="text-sm text-highlight w-[12em] m-[1em] px-[1em] py-[0.5em] border border-secondary bg-secondary/40 hover:cursor-pointer hover:bg-secondary/60"
                    >
                        Upload Settings
                    </button>
                </div>
                <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileInputChange}
                />
            </div>
        </div>
    );
};



const Header = () => {
    const [isOpenAbout, setIsOpenAbout] = useState(false);
    const [isOpenSettings, setIsOpenSettings] = useState(false);

    const openAboutOverlay = () => setIsOpenAbout(true);
    const closeAboutOverlay = () => setIsOpenAbout(false);
    const openSettingsOverlay = () => setIsOpenSettings(true);
    const closeSettingsOverlay = () => setIsOpenSettings(false);


    return (
        <div id={"header"} className={"w-full h-[4em] bg-window-light-active flex flex-row items-center justify-start gap-[1em]"}>
            <div className="h-full w-[16em] flex flex-row items-center justify-start">
                <img src={industry} alt="Industry" className="logo" />
                <p className="text-title text-dim text-nowrap">EVE Industry Browser</p>
            </div>

            <button onClick={openSettingsOverlay} className="h-full mx-[0.5em] hover:text-highlight hover:cursor-pointer">Settings</button>
            <button onClick={openAboutOverlay} className="h-full mx-[0.5em] hover:text-highlight hover:cursor-pointer">About</button>

            <AboutOverlay isOpen={isOpenAbout} closeOverlay={closeAboutOverlay}/>
            <SettingsOverlay isOpen={isOpenSettings} closeOverlay={closeSettingsOverlay}/>
        </div>
    )
}

export default Header;