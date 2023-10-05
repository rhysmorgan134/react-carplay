import { ExtraConfig } from "../../../main/Globals";
import { Box, Button, Modal, Paper, styled, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";

interface KeyBindingsProps {
  settings: ExtraConfig,
  updateKey: (key: any, value: any) => void
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  justifyContent: 'center'
};

export function KeyBindings({ settings, updateKey }: KeyBindingsProps) {
  const [keyToBind, setKeyToBind] = useState('')
  const [openWaiting, setOpenWaiting] = useState(false)

  useEffect(() => {
    if(openWaiting) {
      document.addEventListener('keydown', setKey)

      return () => document.removeEventListener('keydown', setKey)
    }

  }, [openWaiting, keyToBind]);

  const awaitKeyPress = (keyName) => {
    setKeyToBind(keyName)
    setOpenWaiting(true)
  }

  const setKey = (keyPressed: KeyboardEvent) => {
    const oldSettings = {...settings.bindings}
    oldSettings[keyToBind] = keyPressed.code
    updateKey('bindings', oldSettings)
    setOpenWaiting(false)
    setKeyToBind('')
  }

  const renderBindings = () => {
    return(
      Object.keys(settings.bindings).map((shortcut) => {
        return (
          <Grid xs={3}>
            <Item>
              <Typography>{shortcut}</Typography>
              <Button onClick={() => awaitKeyPress(shortcut)}>{settings.bindings[shortcut]}</Button>
            </Item>
          </Grid>
        )
      })
    )
  }

  return (
    <Grid container spacing={2}>
      {renderBindings()}
      <Modal
        open={openWaiting}
        onClose={() => setOpenWaiting(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Press Key For {keyToBind}
          </Typography>
          <InfinitySpin color={'blue'}/>
        </Box>
      </Modal>
    </Grid>
  )
}
