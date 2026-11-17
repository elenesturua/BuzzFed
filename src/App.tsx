import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import NavBar, { NAV_HEIGHT_DESKTOP, NAV_HEIGHT_MOBILE } from './components/NavBar';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Post from './pages/Post';
import PostDetail from './pages/PostDetail';
import Map from './pages/Map';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './lib/AuthContext';

function App() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isLoggedIn = user !== null;
  const showNav = isLoggedIn && location.pathname !== '/login';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        pt: showNav
          ? {
              xs: `calc(${NAV_HEIGHT_MOBILE}px + 4px + env(safe-area-inset-top))`,
              sm: `calc(${NAV_HEIGHT_DESKTOP}px + 4px + env(safe-area-inset-top))`,
            }
          : 0,
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      {showNav && <NavBar />}
      <Routes>
        <Route path="/" element={<Navigate to={isLoggedIn ? '/feed' : '/login'} replace />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/feed" replace /> : <Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/post" element={<Post />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/map" element={<Map />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to={isLoggedIn ? '/feed' : '/login'} replace />} />
      </Routes>
    </Box>
  );
}

export default App;
