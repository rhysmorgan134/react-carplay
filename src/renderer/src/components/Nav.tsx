import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import CameraIcon from '@mui/icons-material/Camera';
import ExitToApp from '@mui/icons-material/ExitToApp';
import { Link, useLocation } from 'react-router-dom';
import { useStatusStore } from '../store/store';

export default function Nav({ receivingVideo, settings }) {
  const [isPlugged] = useStatusStore(state => [state.isPlugged]);
  const { pathname } = useLocation();

  if (receivingVideo && pathname === "/") {
    return null;
  }

  const routeToIndex: Record<string, number> = {
    '/': 0,
    '/settings': 1,
    '/info': 2,
    '/camera': 3,
  };
  const value = routeToIndex[pathname] ?? false;

  const quit = () => {
    window.api.quit()
  }

  return (
    <Tabs
      value={value}
      aria-label="icon label tabs example"
      variant="fullWidth"
    >
      <Tab icon={<PhoneIcon />}      component={Link} to="/" />
      <Tab icon={<SettingsIcon />}   component={Link} to="/settings" />
      <Tab icon={<InfoIcon />}       component={Link} to="/info" />
      {settings?.camera && (
        <Tab icon={<CameraIcon />} component={Link} to="/camera" />
      )}
      <Tab icon={<ExitToApp />} onClick={quit} />
    </Tabs>
  );
}