import React, {Component} from 'react';
import './App.css';
import Carplay from 'react-js-carplay'



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
            webCam: false,
            startedUp: false
        }
        this.ws = new WebSocket('ws://localhost:3001');
        this.ws.binaryType = 'arraybuffer';
    }

    componentDidMount() {

        let fps = ipcRenderer.sendSync('fpsReq')
        this.setState({...this.state.settings, fps:fps})

        ipcRenderer.send('getSettings')

        ipcRenderer.on('plugged', () => {
            this.setState({status: true})
        })
        ipcRenderer.on('unplugged', () => {
            this.setState({status: false})
        })
        ipcRenderer.on('allSettings', (event, data) => {
            console.log("updating all settings", data)
            this.setState({settings: data, startedUp: true})
        })

        ipcRenderer.on('quitReq', () => {
            if(this.state.status) {
                this.openModal()
            }
        })

        ipcRenderer.send('statusReq')
    }

    openModal() {
        this.setState({modalOpen: true})
    }

    closeModal() {
        this.setState({modalOpen: false})
    }

    changeValue(k, v) {
        ipcRenderer.send('settingsUpdate', {type: k, value: v})
    }

    render() {

        const reload = () => {
            ipcRenderer.send('reqReload')
        }

        const touchEvent = (type, x, y) => {
            ipcRenderer.send('click', {type: type, x: x, y: y})
        }

        const openCarplay = (e) => {
            this.setState({status: true})
        }
        return (
            <div style={{height: '100%'}}>
                {this.state.startedUp===true ?
                <Carplay
                    settings={this.state.settings}
                    status={this.state.status}
                    touchEvent={touchEvent}
                    changeSetting={this.changeValue}
                    reload={reload}
                    ws={this.ws}
                    type={"ws"}
                    openModal={this.state.modalOpen}
                    openModalReq={this.openModal.bind(this)}
                    closeModalReq={this.closeModal.bind(this)}
                /> : <div>loading</div>}
            </div>
        );
    }
}

export default App;
