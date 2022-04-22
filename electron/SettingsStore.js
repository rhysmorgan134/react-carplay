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
        }
        this.store = new Store({schema: this.schema})
    }
}

module.exports = SettingsStore