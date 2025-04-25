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
import { useTheme } from '@mui/material/styles';

interface NavProps {
  settings: Record<string, any>;
}

export default function Nav({ settings }: NavProps) {
  const [isPlugged] = useStatusStore(state => [state.isPlugged]);
  const { pathname } = useLocation();
  const theme = useTheme();

  if (isPlugged && pathname === '/') {
    return null;
  }

  const routeToIndex: Record<string, number> = {
    '/': 0,
    '/settings': 1,
    '/info': 2,
    '/camera': 3,
  };
  const value = routeToIndex[pathname] ?? 0;

  const quit = () => window.api.quit();

  return (
    <Tabs
      value={value}
      aria-label="Navigation Tabs"
      variant="fullWidth"
    >
      {/* Phone Tab: icon turns green when plugged */}
      <Tab
        sx={{
          '& svg': {
            color: isPlugged ? theme.palette.success.main : 'inherit',
          },
        }}
        icon={<PhoneIcon />}
        component={Link}
        to="/"
      />
      {/* Other Tabs */}
      <Tab
        icon={<SettingsIcon />}
        component={Link}
        to="/settings"
      />
      <Tab
        icon={<InfoIcon />}
        component={Link}
        to="/info"
      />
      {settings?.camera && (
        <Tab
          icon={<CameraIcon />}
          component={Link}
          to="/camera"
        />
      )}
      <Tab
        icon={<ExitToApp />}
        onClick={quit}
      />
    </Tabs>
  );
}

