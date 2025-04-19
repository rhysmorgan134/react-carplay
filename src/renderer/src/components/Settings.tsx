import { ExtraConfig } from "../../../main/Globals";
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
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  Stack
} from '@mui/material'
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import MostStream from './MostStream';
import { TransitionProps } from '@mui/material/transitions/transition';
import { KeyBindings } from "./KeyBindings";
import { Canbus } from "./Canbus";
import { useCarplayStore } from "../store/store";

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

export default function Settings({ settings }: SettingsProps) {
  const [activeSettings, setActiveSettings] = useState<ExtraConfig>(settings)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
  const [openStream, setOpenStream] = useState(false)
  const [openBindings, setOpenBindings] = useState(false)
  const [openCan, setOpenCan] = useState(false)
  const saveSettings = useCarplayStore(state => state.saveSettings)
  const theme = useTheme();
  const headerClass = theme.palette.mode === 'dark' ? 'App-header-dark' : 'App-header-light';

  const settingsChange = (key: keyof ExtraConfig, value: any) => {
    setActiveSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderInput: Record<string, () => React.ReactNode> = {
    height:   () => renderField('HEIGHT', 'height'),
    width:    () => renderField('WIDTH', 'width'),
    dpi:      () => renderField('DPI', 'dpi'),
    format:   () => renderField('FORMAT', 'format'),
    fps:      () => renderField('FPS', 'fps'),
    iBoxVersion: () => renderField('IBOX VERSION', 'iBoxVersion'),
    mediaDelay:  () => renderField('MEDIA DELAY', 'mediaDelay'),
    phoneWorkMode: () => renderField('PHONE WORK MODE', 'phoneWorkMode'),
  };

  function renderField(label: string, key: keyof ExtraConfig) {
    return (
      <Grid key={key} xs={4}>
        <TextField
          label={label}
          type="number"
          fullWidth
          value={activeSettings[key] as number | string}
          onChange={e => settingsChange(key, e.target.value)}
        />
      </Grid>
    );
  }

  function renderCameras() {/*...*/}
  function renderMicrophones() {/*...*/}

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices?.().then(devices => {
      setMicrophones(devices.filter(d => d.kind === 'audioinput'));
      setCameras(devices.filter(d => d.kind === 'videoinput'));
    }).catch(() => {
      setCameras([]);
      setMicrophones([]);
    });
  }, []);

  const renderSettings = () => (
  <Grid container spacing={2}>
    {/* Row 1: Height, Width, DPI, Format */}
    <Grid xs={3}>{renderField('HEIGHT', 'height')}</Grid>
    <Grid xs={3}>{renderField('WIDTH', 'width')}</Grid>
    <Grid xs={3}>{renderField('DPI', 'dpi')}</Grid>
    <Grid xs={3}>{renderField('FORMAT', 'format')}</Grid>

    {/* Row 2: FPS, IBOX VERSION, MEDIA DELAY, PHONE WORK MODE */}
    <Grid xs={3}>{renderField('FPS', 'fps')}</Grid>
    <Grid xs={3}>{renderField('IBOX VERSION', 'iBoxVersion')}</Grid>
    <Grid xs={3}>{renderField('MEDIA DELAY', 'mediaDelay')}</Grid>
    <Grid xs={3}>{renderField('PHONE WORK MODE', 'phoneWorkMode')}</Grid>

    {/* Row 3: Checkboxes, WiFi Type, Mic Type */}
    <Grid xs={3}>
      <Stack direction="column" spacing={1}>
        <FormControlLabel
          control={
            <Checkbox checked={activeSettings.kiosk} onChange={e => settingsChange('kiosk', e.target.checked)} />
          }
          label="KIOSK"
        />
        <FormControlLabel
          control={
            <Checkbox checked={activeSettings.nightMode} onChange={e => settingsChange('nightMode', e.target.checked)} />
          }
          label="DARK MODE"
        />
        <FormControlLabel
          control={
            <Checkbox checked={activeSettings.piMost} onChange={e => settingsChange('piMost', e.target.checked)} />
          }
          label="PI MOST"
        />
      </Stack>
    </Grid>
    <Grid xs={3}>
      <FormControl component="fieldset">
        <FormLabel component="legend">WIFI TYPE</FormLabel>
        <RadioGroup row value={activeSettings.wifiType} onChange={e => settingsChange('wifiType', e.target.value)}>
          <FormControlLabel value="2.4ghz" control={<Radio />} label="2.4G" />
          <FormControlLabel value="5ghz" control={<Radio />} label="5G" />
        </RadioGroup>
      </FormControl>
    </Grid>
    <Grid xs={3}>
      <FormControl component="fieldset">
        <FormLabel component="legend">MIC TYPE</FormLabel>
        <RadioGroup row value={activeSettings.micType} onChange={e => settingsChange('micType', e.target.value)}>
          <FormControlLabel value="os" control={<Radio />} label="OS" />
          <FormControlLabel value="box" control={<Radio />} label="BOX" />
        </RadioGroup>
      </FormControl>
    </Grid>
    <Grid xs={3} />

    {/* Row 4: Camera & Mic selectors */}
    <Grid xs={12} container spacing={2}>
      {cameras.length > 0 && renderCameras()}
      {microphones.length > 0 && renderMicrophones()}
    </Grid>

    {/* Row 5: Save, Bindings, Canbus buttons */}
    <Grid xs={12}>
      <Box display="flex" justifyContent="center" gap={2}>
        <Button onClick={() => saveSettings(activeSettings)}>SAVE</Button>
        <Button onClick={() => setOpenBindings(true)}>BINDINGS</Button>
        <Button onClick={() => setOpenCan(true)}>CANBUS</Button>
      </Box>
    </Grid>
  </Grid>
);

return (
    <>
      <Box className={headerClass}>{renderSettings()}</Box>

      <Dialog
        open={openStream}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{ style: { minHeight: '80%' } }}
        onClose={() => setOpenStream(false)}
      >
        <DialogTitle>PiMost Stream Settings</DialogTitle>
        <DialogContent>
          <MostStream setSettings={settingsChange} setOpenStream={setOpenStream} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openBindings}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{ style: { minHeight: '80%', minWidth: '80%' } }}
        onClose={() => setOpenBindings(false)}
      >
        <DialogTitle>Key Bindings</DialogTitle>
        <DialogContent>
          <KeyBindings settings={activeSettings} updateKey={settingsChange} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openCan}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{ style: { minHeight: '80%' } }}
        onClose={() => setOpenCan(false)}
      >
        <DialogTitle>CANbus Settings</DialogTitle>
        <DialogContent>
          <Canbus settings={activeSettings} setSettings={settingsChange} setOpenCan={setOpenCan} />
        </DialogContent>
      </Dialog>
    </>
  );
}