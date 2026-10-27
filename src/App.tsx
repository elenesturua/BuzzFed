import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Post from './pages/Post';
import PostDetail from './pages/PostDetail';
import Map from './pages/Map';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { getCurrentUser } from './lib/auth';

function App() {
  const location = useLocation();
  const isLoggedIn = getCurrentUser() !== null;
  const showNav = isLoggedIn && location.pathname !== '/login';

  return (
    <Box sx={{ pb: showNav ? 7 : 0 }}>
      <Routes>
        <Route path="/" element={<Navigate to={isLoggedIn ? '/feed' : '/login'} replace />}/>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/feed" replace /> : <Login />}/>
        <Route element={<ProtectedRoute />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/post" element={<Post />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/map" element={<Map />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      {showNav && <BottomNav />}
    </Box>
  );
}

export default App;
