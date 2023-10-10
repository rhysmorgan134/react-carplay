import { CanConfig, CanMessage, ExtraConfig } from "../../../main/Globals";
import { Box, Button, Modal, Paper, styled, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";

interface KeyBindingsProps {
  settings: ExtraConfig,
  setOpenCan: React.Dispatch<React.SetStateAction<boolean>>,
  setSettings: (key: any, value: any) => void
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  flexDirection: 'row',
  color: theme.palette.text.secondary,
}));

export function Canbus({ settings, setOpenCan, setSettings }: KeyBindingsProps) {
  const [reverse, setReverse] = useState<CanMessage>({canId: 0x00, mask: 0x00, byte: 0})
  const [lights, setLights] = useState<CanMessage>({canId: 0x00, mask: 0x00, byte: 0})

  const handleSave = () => {
    const canConfig: CanConfig = {
      reverse,
      lights
    }
    setSettings('canbus', true)
    setSettings('canConfig', canConfig)
    setOpenCan(false)
  }

  useEffect(() => {
    console.log(settings.canConfig)
    if(settings.canConfig?.reverse) {
      setReverse(settings.canConfig.reverse)
    }
    if(settings.canConfig?.lights) {
      setLights(settings.canConfig.lights)
    }
  }, [settings]);

  return (
    <Grid container spacing={2}>
        <Grid xs={12}>
          <Typography>REVERSE</Typography>
        </Grid>
      <Grid xs={4}>
        <TextField
          id="outlined-controlled"
          label="CAN ID"
          value={reverse.canId}
          type={'number'}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setReverse({...reverse, canId: parseInt(event.target.value)})
          }}
        />
      </Grid>
      <Grid xs={4}>
        <TextField
          id="outlined-controlled"
          label="MASK"
          value={reverse.mask}
          type={'number'}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setReverse({...reverse, mask: parseInt(event.target.value)})
          }}
        />
      </Grid>
      <Grid xs={4}>
        <TextField
          id="outlined-controlled"
          label="BYTE"
          value={reverse.byte}
          type={'number'}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setReverse({...reverse, byte: parseInt(event.target.value)})
          }}
        />
      </Grid>
      <Grid xs={12}>
        <Typography>LIGHTS</Typography>
      </Grid>
      <Grid xs={4}>
        <TextField
          id="outlined-controlled"
          label="CAN ID"
          value={lights.canId}
          type={'number'}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setLights({...lights, canId: parseInt(event.target.value)})
          }}
        />
      </Grid>
      <Grid xs={4}>
        <TextField
          id="outlined-controlled"
          label="MASK"
          value={lights.mask}
          type={'number'}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setLights({...lights, mask: parseInt(event.target.value)})
          }}
        />
      </Grid>
      <Grid xs={4}>
        <TextField
          id="outlined-controlled"
          label="BYTE"
          value={lights.byte}
          type={'number'}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setLights({...lights, byte: parseInt(event.target.value)})
          }}
        />
      </Grid>
      <Button onClick={() => handleSave()}>SAVE</Button>
    </Grid>
  )
}
