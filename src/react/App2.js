import React, {Component} from 'react';
import './App.css';
import "@fontsource/montserrat";
import JMuxer from 'jmuxer';
import Modal from "react-modal";
import Settings from "./Settings";
import webCam from "./webCam";
import WebCam from "./webCam";

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        minWidth: '50%',
        transform: 'translate(-50%, -50%)',
    },
};



const {ipcRenderer} = window;

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            height: 0,
            width: 0,
            mouseDown: false,
            lastX: 0,
            lastY: 0,
            status: false,
            playing: false,
            frameCount: 0,
            fps: 0,
            start: null,
            videoDuration: 0,
            modalOpen: false,
            settings: {},
            running: false,
            webCam: false
        }

    }

    componentDidMount() {
        Modal.setAppElement(document.getElementById('main'));
        let fps = 60
        console.log(fps)
        fps = ipcRenderer.sendSync('fpsReq')
        console.log(fps)
        const jmuxer = new JMuxer({
            node: 'player',
            mode: 'video',
            maxDelay: 100,
	        fps: 60,
            flushingTime: 100,
            debug: false
        });
        const height = this.divElement.clientHeight
        const width = this.divElement.clientWidth
        this.setState({height, width}, () => {
            console.log(this.state.height, this.state.width)
        })

        ipcRenderer.send('getSettings')

        ipcRenderer.on('plugged', () => {
            this.setState({status: true, running: true})
        })
        ipcRenderer.on('unplugged', () => {
            this.setState({status: false})
        })
        ipcRenderer.on('allSettings', (event, data) => {
            console.log("updating all settings", data)
            this.setState({settings: data})
        })

        ipcRenderer.on('quitReq', () => {
            if(this.state.status) {
                this.setState({modalOpen: true})
            }
        })

        ipcRenderer.send('statusReq')
        const ws = new WebSocket("ws://localhost:3001");
        ws.binaryType = 'arraybuffer';
        ws.onmessage = (event) => {
            if(this.state.webCam) {
                console.log("frame")
            }
           //
            let buf = Buffer.from(event.data)
            let duration = buf.readInt32BE(0)
            let video = buf.slice(4)
            jmuxer.feed({video: new Uint8Array(video), duration:duration})
        }

    }

    changeValue(k, v) {
        ipcRenderer.send('settingsUpdate', {type: k, value: v})
    }

    render() {

        const openModal = () => {
            this.setState({modalOpen: true})
        }

        const closeModal = () => {
            this.setState({modalOpen: false})
        }

        const openWebCam = () => {
            this.setState({webCam: true})
        }

        const closeWebcam = () => {
            this.setState({webCam: false})
        }

        const reload = () => {
            ipcRenderer.send('reqReload')
        }

        const handleMDown = (e) => {
            //console.log("touched", e, e.target.getBoundingClientRect())
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.clientX - currentTargetRect.left
            let y = e.clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            this.setState({lastX: x, lastY: y})
            this.setState({mouseDown: true})
            ipcRenderer.send('click', {type: 14, x: x, y: y})
        }
        const handleMUp = (e) => {
            //console.log("touched end", e)
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.clientX - currentTargetRect.left
            let y = e.clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            this.setState({mouseDown: false})
            ipcRenderer.send('click', {type: 16, x: x, y: y})
        }


        const handleMMove = (e) => {
            //console.log("touched drag", e)
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.clientX - currentTargetRect.left
            let y = e.clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            ipcRenderer.send('click', {type: 15, x: x, y: y})
        }

        const handleDown = (e) => {
            
            //console.log("touched", e, e.target.getBoundingClientRect())
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.touches[0].clientX - currentTargetRect.left
            let y = e.touches[0].clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            this.setState({lastX: x, lastY: y})
            this.setState({mouseDown: true})
            ipcRenderer.send('click', {type: 14, x: x, y: y})
            e.preventDefault()
	}
        const handleUp = (e) => {
           
            //console.log("touched end", e)
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = this.state.lastX
            let y = this.state.lastY
            this.setState({mouseDown: false})
            ipcRenderer.send('click', {type: 16, x: x, y: y})
            e.preventDefault()
	}

        const openCarplay = (e) => {
            this.setState({status: true})
        }
        const handleMove = (e) => {
            
            //console.log("touched drag", e)
            let currentTargetRect = e.target.getBoundingClientRect();
            let x = e.touches[0].clientX - currentTargetRect.left
            let y = e.touches[0].clientY - currentTargetRect.top
            x = x / this.state.width
            y = y / this.state.height
            ipcRenderer.send('click', {type: 15, x: x, y: y})
            //e.preventDefault()
	}

        const onPause = () => {
            console.log('paused')
        }

        const onError = () => {
            console.log('error')
        }

        const onStopped = () => {
            console.log('stopped')
        }

        const onPlay = () => {
            console.log('play')
        }




        return (
            <div style={{height: '100%'}}  id={'main'}>

                <button onClick={openWebCam}>Show webCam </button>
                <div ref={(divElement) => {
                    this.divElement = divElement
                }}
                     className="App"
                     onTouchStart={handleDown}
                     onTouchEnd={handleUp}
                     onTouchMove={(e) => {
                         if (this.state.mouseDown) {
                             handleMove(e)
                         }
                     }}
                     onMouseDown={handleMDown}
                     onMouseUp={handleMUp}
                     onMouseMove={(e) => {
                         if (this.state.mouseDown) {
                             handleMMove(e)
                         }
                     }}
                     style={{height: '100%', width: '100%', padding: 0, margin: 0, display: 'flex'}}>
                    <video  style={{display: this.state.running ? "block" : "none"}} autoPlay onPause={() => console.log("paused")} onError={() => console.log("error")} onEnded={() => console.log("ended")} onPlay={() => console.log("playing")} onSuspend={() => console.log("suspended")}
                            onAbort={() => console.log("aborted")} onStalled={() => console.log("stalled")} onEmptied={() => console.log("emptied")}
                            id="player" />
                    {this.state.status ? <div></div>
                         :
                        <div style={{marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', flexGrow: '1'}}>
                            <div style={{marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', flexGrow: '1'}}>CONNECT IPHONE TO BEGIN CARPLAY</div>
                            <button onClick={openModal}>Open Modal</button>
                            {this.state.running ? <button onClick={openCarplay}>Open Carplay</button> : <div></div>}
                        </div>
                        }
                </div>
                <Modal
                    isOpen={this.state.modalOpen}
                    // onAfterOpen={afterOpenModal}
                    onRequestClose={closeModal}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={true}
                >
                    <Settings settings={this.state.settings} changeValue={this.changeValue} reqReload={reload}/>
                </Modal>
                <Modal
                    isOpen={this.state.webCam}
                    // onAfterOpen={afterOpenModal}
                    onRequestClose={closeWebcam}
                    style={customStyles}
                    contentLabel="Example Modal"
                    ariaHideApp={true}
                >
                    <WebCam />
                </Modal>
            </div>
        );
    }
}

export default App;
