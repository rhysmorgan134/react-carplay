import React, { useEffect, useRef, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { ExtraConfig} from "../../main";
import Settings from "./components/Settings";
import Info from "./components/Info";
import Home from "./components/Home";
import Nav from "./components/Nav";
import Carplay from './components/Carplay'
import { AudioData, VideoData } from 'node-carplay/web'
import Camera from './components/Camera'

// rm -rf node_modules/.vite; npm run dev

const width = window.innerWidth
const height = window.innerHeight

const RETRY_DELAY_MS = 5000


function App() {
  const [settings, setSettings] = useState<ExtraConfig | null>(null)
  const intialized = useRef(false)
  const intialized2 = useRef(false)
  const [receivingVideo, setReceivingVideo] = useState(false)


  console.log("rendering")

  useEffect(() => {
    if(!intialized.current) {
      intialized.current = true
      window.electronAPI.settings((event, value: ExtraConfig) => {
        console.log("setting settings")
        setSettings(value)
      })
    }

  }, [window.electronAPI]);

  useEffect(() => {
    if(!intialized2.current) {
      window.electronAPI.getSettings()
    }
  }, [window.electronAPI]);




  const recvVideo = (video: VideoData) => {
    console.log('video', video)
  }

  const recvAudio = (audio: AudioData) => {
    console.log('video', audio)
  }

  const setPlugged = (plugged: boolean) => {
    console.log("plugged", plugged)
  }



  return (
    <Router>
      <div
        style={{ height: '100%', touchAction: 'none' }}
        id={'main'}
        className="App"

      >
        <Nav receivingVideo={receivingVideo} settings={settings}/>
        {settings ? <Carplay  receivingVideo={receivingVideo} setReceivingVideo={setReceivingVideo} settings={settings}/> : null}
        <Routes>
          <Route path={"/"} element={<Home />} />
          <Route path={"/settings"} element={<Settings settings={settings!}/>} />
          <Route path={"/info"} element={<Info />} />
          <Route path={"/camera"} element={<Camera settings={settings!}/>} />
        </Routes>
      </div>
    </Router>

  )
}

export default App
