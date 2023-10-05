import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import CameraIcon from '@mui/icons-material/Camera';
import { Link, useLocation } from "react-router-dom";
import ExitToApp from '@mui/icons-material/ExitToApp';

export default function Nav({ receivingVideo, settings }) {
  const [value, setValue] = React.useState(0);
  const { pathname } = useLocation()
console.log(window.api)
  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const quit = () => {
    window.api.quit()
  }

  return (
    <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" centered sx={receivingVideo === true && pathname === '/' ? {minHeight: '0px', height: '0px'} : {}}>
      <Tab icon={<PhoneIcon />} to={'/'} component={Link}/>
      <Tab icon={<SettingsIcon />} to={'/settings'}  component={Link}/>
      <Tab icon={<InfoIcon />} to={'/info'} component={Link}/>
      {settings?.camera !== '' ? <Tab icon={<CameraIcon />} to={'/camera'} component={Link}/> : null}
      <Tab icon={<ExitToApp />} onClick={() => quit()} />
    </Tabs>
  );
}
