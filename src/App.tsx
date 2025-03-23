import Header from "./components/Header.tsx";
import Viewport from "./components/Viewport.tsx";
import './App.css'
import {ViewportProvider} from "./components/ViewportContext.tsx";
import {BrowserRouter} from "react-router-dom";
import {SettingsProvider} from "./components/SettingsContext.tsx";

const App = ()=> {
  return (
    <div className="App flex flex-col content-center justify-start h-screen w-screen m-0 p-0">
        <BrowserRouter>
            <SettingsProvider>
                <Header />
                <ViewportProvider>
                    <Viewport />
                </ViewportProvider>
            </SettingsProvider>
        </BrowserRouter>
    </div>
  )
}

export default App
