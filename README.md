
<h3 align="center">React Carplay</h3>


<a href="https://www.buymeacoffee.com/rhysm" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>   



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

### There is an audio issue with later dongles sending out audio packets at a different sample rate please log any audio distortion issues [here](https://github.com/rhysmorgan134/react-carplay/issues/23)

<!-- ABOUT THE PROJECT -->
## About The Project

![node carplay Screen Shot](https://i.imgur.com/egkvgau.png)

[example video](https://youtu.be/mBeYd7RNw1w)

This is a small react app wrapped in electron. It loads an electron app that awaits the carlinkit adapter to be plugged into an iphone.
On detecting the phone its sends the h264 stream to a websocket, that then gets sent to a jsmpeg player instance.

### Built With

This project would not of been possible without electric monks work on a python version. It also heavily uses node-usb jsmpeg player
* [PyCarplay](https://github.com/electric-monk/pycarplay)
* [Node-usb](https://github.com/tessel/node-usb)
* [JSmpeg](https://github.com/phoboslab/jsmpeg)
* [JSmpeg-player](https://github.com/cycjimmy/jsmpeg-player)



<!-- GETTING STARTED -->
## Getting Started



### Prerequisites

You need to have a calinkit adapter [link](https://amzn.to/3jwLT46) 

The target machine should have FFMPEG/FFPLAY installed and working.

### Installation

Download correct package from [releases](https://github.com/rhysmorgan134/react-carplay/releases)



<!-- USAGE EXAMPLES -->
## Usage

* ```chmod +x {AppImage}```
* ```sudo ./{AppImage} --no-sandbox```


<!-- ROADMAP -->
## Roadmap

*  - [ ] Enabled hardware accelleration
*  - [x] Replace jsmpeg with lighter alternative
*  - [x] Make wireless operational 
*  - [x] Integrate microphone

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request





<!-- CONTACT -->
## Contact

Your Name - Rhys Morgan - rhysm134@gmail.com

