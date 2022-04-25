const Store = require('electron-store')

class SettingsStore {
    constructor() {
        this.schema = {
            fps: {
                type: 'integer',
                // maximum: 60,
                // minimum: 10,
                default: 30
            },
            kiosk: {
                type: 'boolean',
                default: true
            },
            height: {
                type: 'integer',
                default: 480
            },
            width: {
                type: 'integer',
                default: 800
            },
            lhd: {
                type: 'integer',
                // maximum: 1,
                // minimum: 0,
                default: 0
            },
            dpi: {
                type: 'integer',
                // maximum: 800,
                // minimum: 80,
                default: 240
            }
            // },
            // canbus: {
            //     type: 'boolean',
            //     default: false
            // },
            // reverse: {
            //     enum: ['disabled', 'canbus', 'gpio'],
            //     default: 'disabled'
            // },
            // reverseId: {
            //     type: 'integer',
            //     minimum: 0,
            //     default: 0
            // },
            // reverseByte: {
            //     type: 'integer',
            //     minimum: 0,
            //     maximum: 7,
            //     default: 0
            // },
            // reverseVal: {
            //     enum: [0, 1, 2, 4, 8, 16, 32, 64, 128, 256],
            //     default: 0
            // }

        }
        this.store = new Store({schema: this.schema})
    }
}

module.exports = SettingsStore