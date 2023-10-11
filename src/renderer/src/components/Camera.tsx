import { useEffect, useRef, useState } from "react";
import {Typography} from "@mui/material";

const Camera = ({settings}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraFound, setCameraFound] = useState(false)
  console.log(settings)

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 800, deviceId: settings.camera} })
      .then(stream => {
        console.log(stream)
        setCameraFound(true)
        let video = videoRef.current!;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  };

  return (
    <div >
      <div >
          <video ref={videoRef} style={{maxWidth: '100%', height: 'auto'}}/>
        {cameraFound ? null : <Typography>No Camera Found</Typography>}
      </div>
    </div>
  );
};

export default Camera;
