const EventEmitter = require('events')
const can = require('socketcan');
const {exec} = require('child_process')

class Canbus extends EventEmitter {
    constructor(channel, reverse, id, byte, val) {
        super();
        try {
            this.channel = can.createRawChannel("can0", true);
        } catch {
            console.log("no can device found, creating virtual")
            exec("sudo modprobe vcan")
            exec("sudo ip link add dev can0 type vcan")
            exec("sudo ip link add dev can1 type vcan")
            exec("sudo ip link set up can0")
            exec("sudo ip link set up can1")
            this.channel = can.createRawChannel("can0", true);
        }
        this.reverse = false
        this.channel.setRxFilters([{id: id, mask: id}])

        this.channel.addListener("onMessage", (message) => {
            let data = [...message.data]
            let reverseData = data[byte]
            if(reverseData & val) {
                if(this.reverse === false) {
                    this.reverse = true
                    reverse(true)
                }
            } else if(this.reverse){
                this.reverse = false
                reverse(false)
            }
        })

        this.reverse = reverse;
    }
}