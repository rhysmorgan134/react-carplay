import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import JsmpegPlayer from "./JsmpegPlayer";
const { ipcRenderer } = window;


class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			height: 0,
			width: 0,
			mouseDown: false,
			lastX: 0,
			lastY: 0
		}
	}

	componentDidMount() {
		const height = this.divElement.clientHeight
		const width = this.divElement.clientWidth
		this.setState({height, width}, () => {console.log(this.state.height, this.state.width)})
	}


render() {

  const handleMDown = (e) => {
	console.log("touched", e, e.target.getBoundingClientRect())
	let currentTargetRect = e.target.getBoundingClientRect();
	let x = e.clientX - currentTargetRect.left
	let y = e.clientY - currentTargetRect.top
	x = x/this.state.width
	y = y/this.state.height
	this.setState({lastX: x, lastY: y})
	this.setState({mouseDown: true})
	ipcRenderer.send('click', {type:14, x:x, y:y})
}
  const handleMUp = (e) => {
	console.log("touched end", e)
	let currentTargetRect = e.target.getBoundingClientRect();
	let x = e.clientX - currentTargetRect.left
	let y = e.clientY - currentTargetRect.top
	x = x/this.state.width
	y = y/this.state.height
	this.setState({mouseDown: false})
	ipcRenderer.send('click', {type:16,  x:x, y:y})
}


  const handleMMove = (e) => {
	console.log("touched drag", e)
	let currentTargetRect = e.target.getBoundingClientRect();
	let x = e.clientX - currentTargetRect.left
	let y = e.clientY - currentTargetRect.top
	x = x/this.state.width
	y = y/this.state.height
	ipcRenderer.send('click', {type:15,  x:x, y:y})
}

  const handleDown = (e) => {
	console.log("touched", e, e.target.getBoundingClientRect())
	let currentTargetRect = e.target.getBoundingClientRect();
	let x = e.touches[0].clientX - currentTargetRect.left
	let y = e.touches[0].clientY - currentTargetRect.top
	x = x/this.state.width
	y = y/this.state.height
	this.setState({lastX: x, lastY: y})
	this.setState({mouseDown: true})
	ipcRenderer.send('click', {type:14, x:x, y:y})
}
  const handleUp = (e) => {
	console.log("touched end", e)
	let currentTargetRect = e.target.getBoundingClientRect();
	let x = this.state.lastX
	let y = this.state.lastY
	this.setState({mouseDown: false})
	ipcRenderer.send('click', {type:16,  x:x, y:y})
}


  const handleMove = (e) => {
	console.log("touched drag", e)
	let currentTargetRect = e.target.getBoundingClientRect();
	let x = e.touches[0].clientX - currentTargetRect.left
	let y = e.touches[0].clientY - currentTargetRect.top
	x = x/this.state.width
	y = y/this.state.height
	ipcRenderer.send('click', {type:15,  x:x, y:y})
}


  return (
    <div style={{height: '100%'}}>
    <div ref={(divElement)=>{this.divElement = divElement}}  
	className="App" 
	onTouchStart={handleDown}
	onTouchEnd={handleUp}
	onTouchMove={(e) => {if(this.state.mouseDown){handleMove(e)}}}
	onMouseDown={handleMDown}
	onMouseUp={handleMUp}
	onMouseMove={(e) => {if(this.state.mouseDown){handleMMove(e)}}}
	style={{height: '100%', width:'100%', padding: 0, margin: 0}}>
            <JsmpegPlayer
                wrapperClassName={"video-wrapper"}
                videoUrl={"ws://localhost:8082/supersecret"}
                options={{
                    autoplay: true
                }}
            ></JsmpegPlayer>
    </div>
    </div>
  );
}
}
export default App;
