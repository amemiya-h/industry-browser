import Header from "./components/Header.tsx";
import Viewport from "./components/Viewport.tsx";
import './App.css'
import {ViewportProvider} from "./components/ViewportContext.tsx";

const App = ()=> {
  return (
    <div className="App flex flex-col content-center justify-start h-screen w-screen m-0 p-0">
        <Header />
        <ViewportProvider>
            <Viewport />
        </ViewportProvider>
    </div>
  )
}

export default App
