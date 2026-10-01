import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import AddBoxIcon from '@mui/icons-material/AddBox';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate } from 'react-router-dom';

const items = [
  { label: 'Feed', value: '/feed', icon: <DynamicFeedIcon /> },
  { label: 'Post', value: '/post', icon: <AddBoxIcon /> },
  { label: 'Map', value: '/map', icon: <MapIcon /> },
  { label: 'Profile', value: '/profile', icon: <PersonIcon /> },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_, value) => navigate(value)}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
