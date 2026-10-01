import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Post from './pages/Post';
import PostDetail from './pages/PostDetail';
import Map from './pages/Map';
import Profile from './pages/Profile';

function App() {
  const location = useLocation();
  const showNav = location.pathname !== '/login';

  return (
    <Box sx={{ pb: showNav ? 7 : 0 }}>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/post" element={<Post />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/map" element={<Map />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {showNav && <BottomNav />}
    </Box>
  );
}

export default App;
