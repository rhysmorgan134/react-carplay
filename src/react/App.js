import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import "@fontsource/montserrat";
import JsmpegPlayer from "./JsmpegPlayer";
import JMuxer from 'jmuxer';



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
            videoDuration: 0
        }

    }



    componentDidMount() {
        const jmuxer = new JMuxer({
            node: 'player',
            mode: 'video',
            //readFpsFromTrack: true,
            maxDelay: 10,
	    fps: 60,
            flushingTime: 1,
            debug: true
        });
        const height = this.divElement.clientHeight
        const width = this.divElement.clientWidth
        this.setState({height, width}, () => {
            console.log(this.state.height, this.state.width)
        })

        ipcRenderer.on('plugged', () => {
            this.setState({status: true})
        })
        ipcRenderer.on('unplugged', () => {
            this.setState({status: false})
        })
        ipcRenderer.send('statusReq')
        const ws = new WebSocket("ws://localhost:3001");
        ws.binaryType = 'arraybuffer';
        ws.onmessage = (event) => {
            //  let duration = 0
            // if(!(this.state.start)) {
            //     this.setState({start: new Date().getTime()})
            // } else {
            //     let now = new Date().getTime()
            //     duration = (now - this.state.start)
            //     this.setState({start: now})
            // }
            let buf = Buffer.from(event.data)
            let duration = buf.readInt32BE(0)
            let video = buf.slice(4)
            //console.log("duration was: ", duration)
            jmuxer.feed({video: new Uint8Array(video), duration:duration})
            //this.setState({videoDuration: this.state.videoDuration + duration})
            //console.log(new Date().getTime() - this.state.start, this.state.videoDuration)
            //this.setState({playing: true})
        }
    }


    /* Now feed media data using feed method. audio and video is buffer data and duration is in milliseconds */



    render() {

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


        return (
            <div style={{height: '100%'}}>

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
                    <video  style={{display: this.state.status ? "block" : "none"}} autoPlay onPause={() => console.log("paused")}
                            id="player"></video>
                    {this.state.status ? <div></div>
                         : <div style={{marginTop: 'auto', marginBottom: 'auto', textAlign: 'center', flexGrow: '1'}}>CONNECT IPHONE TO BEGIN CARPLAY</div>}
                </div>
            </div>
        );
    }
}

export default App;
