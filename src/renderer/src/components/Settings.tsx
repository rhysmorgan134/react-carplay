import { ExtraConfig } from "../../../main";
import React, { useEffect, useState } from "react";
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
  FormGroup,
  FormControl,
  FormLabel,
  Button,
  Select,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';
import MostStream from './MostStream'
import { TransitionProps } from '@mui/material/transitions/transition'
import { KeyBindings } from './KeyBindings'

interface SettingsProps {
  settings: ExtraConfig
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Settings({ settings }: SettingsProps) {
  const [activeSettings, setActiveSettings] = useState<ExtraConfig>(settings)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
  const [openStream, setOpenStream] = useState<boolean>(false)
  const [openKeyBindings, setOpenKeyBindings] = useState<boolean>(false)

  const settingsChange = (key, value) => {
    console.log("changing settings to ", {
      ...settings,
      [key]: value
    }, key, value)
    setActiveSettings((prevState) => ({...prevState, [key]: value}))
  }

  const renderInput = {
    height: () => <Grid xs={4}><TextField label={'HEIGHT'} inputProps={{ inputMode: 'numeric'}} value={activeSettings.height} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      settingsChange('height', parseInt(event.target.value))
    }}/></Grid>,
    width: () => <Grid xs={4}><TextField label={'WIDTH'} inputProps={{ inputMode: 'numeric'}} value={activeSettings.width} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      settingsChange('width', parseInt(event.target.value))
    }}/></Grid>,
    dpi: () => <Grid xs={4}><TextField label={'DPI'} inputProps={{ inputMode: 'numeric'}} value={activeSettings.dpi} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      settingsChange('dpi', parseInt(event.target.value))
    }}/></Grid>,
    format: () => <Grid xs={4}><TextField label={'FORMAT'} inputProps={{ inputMode: 'numeric'}} value={activeSettings.format} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      settingsChange('format', parseInt(event.target.value))
    }}/></Grid>,
    fps: () => <Grid xs={4}><TextField label={'FPS'} inputProps={{ inputMode: 'numeric'}} value={activeSettings.fps} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      settingsChange('fps', parseInt(event.target.value))
    }}/></Grid>,
    iBoxVersion: () => <Grid xs={4}><TextField label={'IBOX VERSION'} inputProps={{ inputMode: 'numeric'}} value={activeSettings.iBoxVersion} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      settingsChange('iBoxVersion', parseInt(event.target.value))
            }}/></Grid>,
    mediaDelay: () => <Grid xs={4}><TextField label={'MEDIA DELAY'} inputProps={{ inputMode: 'numeric'}} value={activeSettings.mediaDelay} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      settingsChange('mediaDelay', parseInt(event.target.value))
              }}/></Grid>,
    phoneWorkMode: () => <Grid xs={4}><TextField label={'PHONE WORK MODE'} inputProps={{ inputMode: 'numeric'}} value={activeSettings.phoneWorkMode} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      settingsChange('phoneWorkMode', parseInt(event.target.value))
                }}/></Grid>,
    kiosk: () => {
      return (
        <Grid xs={4}>
          <FormControl>
            <FormControlLabel id={'kiosk'}  label={'KIOSK'} control={<Checkbox checked={activeSettings.kiosk} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              settingsChange('kiosk', event.target.checked)
            }}/>} />
          </FormControl>
        </Grid>
      )
    },
    piMost: () => {
      return (
        <Grid xs={4}>
          <FormControl>
            <FormControlLabel id={'pimost'}  label={'PIMOST'} control={<Checkbox checked={activeSettings.piMost} onChange={(_: React.ChangeEvent<HTMLInputElement>) => {
              // settingsChange('piMost', event.target.checked)
              if(activeSettings.piMost) {
                settingsChange('piMost', false)
                settingsChange('most', {})
              } else {
                setOpenStream(true)
              }
            }}/>} />
          </FormControl>
        </Grid>
      )
    },
    nightMode: () => {
      return (
        <Grid xs={4}>
          <FormGroup>
            <FormControlLabel id={'nightMode'} label={'DARK MODE'} control={<Checkbox checked={activeSettings.nightMode} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              settingsChange('nightMode', event.target.checked)
            }}/>} />
          </FormGroup>
        </Grid>
      )
    },
    wifiType: () => {
      return (
        <Grid xs={4}>
          <FormControl>
            <FormLabel id={"WIFI"}>MIC TYPE</FormLabel>
            <RadioGroup row value={activeSettings.wifiType} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              settingsChange('wifiType', (event.target as HTMLInputElement).value)
            }}>
              <FormControlLabel value={'2.4ghz'} control={<Radio />} label={'2.4Ghz'} />
              <FormControlLabel value={'5ghz'} control={<Radio />} label={'5Ghz'} />
            </RadioGroup>
          </FormControl>
        </Grid>
      )
    },
    micType: () => {
      return (
        <Grid xs={4}>
          <FormControl>
            <FormLabel id={"micType"}>MIC TYPE</FormLabel>
            <RadioGroup row value={activeSettings.micType} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              settingsChange('micType', (event.target as HTMLInputElement).value)
            }}>
              <FormControlLabel value={'os'} control={<Radio />} label={'OS'} />
              <FormControlLabel value={'box'} control={<Radio />} label={'BOX'} />
            </RadioGroup>
          </FormControl>
        </Grid>
      )
    }
  }
  const renderCameras = () => {
    return  (
      <Grid xs={6}>
        <FormControl fullWidth>
          <InputLabel id={'cameraSelectLabel'}>CAMERA</InputLabel>
          <Select
            labelId={"cameraSelectLabel"}
            id={"cameraSelect"}
            value={activeSettings.camera}
            autoWidth
            onChange={(event: SelectChangeEvent) => {
              settingsChange('camera', event.target.value)
            }}
          >
            {cameras.map((camera) => {
              return <MenuItem value={camera.deviceId}>{camera.label}</MenuItem>
            })}
          </Select>
        </FormControl>
      </Grid>
    )
  }

  const renderMicrophones = () => {
    return  (
      <Grid xs={6}>
        <FormControl fullWidth>
          <InputLabel id={'cameraSelectLabel'}>MICROPHONE</InputLabel>
          <Select
            labelId={"cameraSelectLabel"}
            id={"cameraSelect"}
            value={activeSettings.microphone}
            autoWidth
            onChange={(event: SelectChangeEvent) => {
              settingsChange('microphone', event.target.value)
            }}
          >
            {microphones.map((microphone) => {
              return <MenuItem value={microphone.deviceId}>{microphone.label}</MenuItem>
            })}
          </Select>
        </FormControl>
      </Grid>
    )
  }

  useEffect(() => {
    if(!navigator.mediaDevices?.enumerateDevices) {
      setMicrophones([])
      setCameras([])
    } else {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const microphones: MediaDeviceInfo[] = []
          const webcams: MediaDeviceInfo[] = []
          devices.forEach((device) => {
            if(device.kind === "audioinput") {
              microphones.push(device)
            } else if (device.kind === "videoinput") {
              webcams.push(device)
            }
          })
          console.log(webcams, microphones)
          setCameras(webcams)
          setMicrophones(microphones)
        })
    }
  }, []);
  const renderSettings = () => {
    console.log(activeSettings)
    return (
      <Grid container spacing={2}>
        {Object.keys(activeSettings).map((k) => {
          return renderInput[k]?.()
        })}
        <Grid xs={12} container>
          {cameras.length > 0 ? renderCameras() : null}
          {microphones.length > 0 ? renderMicrophones() : null}
        </Grid>
        <Grid xs={12} >
          <Box>
            <Button onClick={() => window.electronAPI.saveSettings(activeSettings)}>SAVE</Button>
          </Box>
          <Box>
            <Button onClick={() => setOpenKeyBindings(true)}>KEY BINDINGS</Button>
          </Box>
        </Grid>
        <Dialog
        open={openStream}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{style: {minHeight: '80%'}}}
        onClose={() => setOpenStream(false)}
        >
          <DialogTitle>{'PiMost Stream Settings'}</DialogTitle>
          <DialogContent >
            <MostStream setSettings={settingsChange} setOpenStream={setOpenStream}/>
          </DialogContent>
        </Dialog>
        <Dialog
          open={openKeyBindings}
          TransitionComponent={Transition}
          keepMounted
          PaperProps={{style: {minHeight: '80%'}}}
          onClose={() => setOpenKeyBindings(false)}
        >
          <DialogTitle>{'PiMost Stream Settings'}</DialogTitle>
          <DialogContent >
            <KeyBindings />
          </DialogContent>
        </Dialog>
      </Grid>
    )
  }

  // const renderInput = (name: string, value: string) => {
  //   return <div key={name}>{name} - {value}</div>
  // }

  return (
    <Box>{activeSettings ? renderSettings() : null}</Box>
  )
}

export default Settings
