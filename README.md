# React-Carplay

<a href="https://www.buymeacoffee.com/rhysm" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

This is a react based carplay application, that utilised the Carlinkit dongle to provide raspberry pi (and others) compatible
carplay application.

## Features

 - Carplay fully configurable upto 60fps @ 1080p (hardware capability dependent)
 - Canbus integration to allow showing a camera when a canbus signal is received
 - PiMost integration to allow streaming Pi Audio over mostbus
 - Configurable key bindings
 - Ability to choose microphone device and camera device

## Installation
The easiest method is to install via the setup-pi script, this handles usb permissions and also creates and autostart script
to launch the app on start up.

`git clone https://github.com/rhysmorgan134/react-carplay.git`

`cd react-carplay`

`./setup-pi.sh`

## Manual installation

Download the latest app image from the link below, choose 64bit or armv7l for 32bit

`https://github.com/rhysmorgan134/react-carplay/releases`

Create the required udev rules

`FILE=/etc/udev/rules.d/52-nodecarplay.rules`
`echo "SUBSYSTEM==\"usb\", ATTR{idVendor}==\"1314\", ATTR{idProduct}==\"152*\", MODE=\"0660\", GROUP=\"plugdev\"" | sudo tee $FILE`

Make the app image executable - navigate to the downloaded file eg:

`cd /home/pi/Downloads`

Then run the below command, replacing the file name with the one downloaded

`chmod +x react-carplay-4.0.0-arm64.AppImage`

Then run the AppImage

`./react-carplay-4.0.0-arm64.AppImage`

## Canbus configuration

The application supports canbus messages when a compatible socketcan interface is present, it will default to can0 (for now).
The first requirement is to know the required can message that you want to trigger the camera. As an example in a freelander 2
the parking sensors when active set a bit to true and set it to false when inactive, this is an ideal trigger. You need
3 values to enter it successfully. If we take the below can message

`188#13400000FF0000FF`

This message is made up of multiple parts, first is the can ID

`0x188`

Then there are 8 bytes

`0x13 0x40 0x00 0x00 0xFF 0x00 0x00 0xFF`

If we write these out as binary representations they would look like the below

```
binary - 00010011  01000000  00000000  00000000  11111111  00000000  00000000  11111111
hex -      0x13      0x40      0x00      0x00      0xFF      0x00      0x00      0xFF
```
When I toggle the parking sensors on and off, byte 1 switches between 0x40 and 0x00, this is because byte 1 bit 6 represents
the sensors. This byte could be showing 0x41 in the on state, and 0x01 in the off state, but bit 6 is still the bit that toggles
(bits start at 0)

So now we know the three values needed to be entered into react-carplay

 - canID = 0x188 hex = 392 decimal
 - mask = 0x40 hex = 64 decimal
 - byte = 1

In the settings page, click the canbus option, a pop up then appears and fill out the boxes with numbers found for your car
(these will be different, unless you also have a freelander 2)

## MOST bus PiMost integration

The MOST bus is a multimedia network, to find out more around how it works, take a look here https://moderndaymods.com/how-most-bus-works/

React-Carplay has the capability to disconnect the cars amplifier from it's current source and connect it to the pi instead
which then streams the carplay audio directly onto the MOST bus network. To do this, tick the box for PiMost on the settings page,
then enter the fBlockID (typically 0x22 for an amplifier) then the instance ID, the sink ID, the finally the address high and low
for the amplifier.

## Keybindings

To configure key bindings, click the Bindings button in settings, then choose the function you need by clicking, then press
the desired key.

## Thanks

React-carplay uses node-carplay for interfacing to the dongle, recently there has been amazing contributions from both
@gozmanyoni and @steelbrain without their help alot of the carplay improvements would not of been possible

gozmanyoni coffee link if you wish to show appreciation - https://www.buymeacoffee.com/ygoz

<!-- CONTACT -->
## Contact

https://forums.moderndaymods.com/
