import Header from "./components/Header.tsx";
import Viewport from "./components/Viewport.tsx";
import './App.css'

const App = ()=> {
  return (
    <div className="flex flex-col content-center justify-start h-screen w-screen m-0 p-0">
        <Header />
        <Viewport />
    </div>
  )
}

export default App
