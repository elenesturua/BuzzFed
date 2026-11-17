import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import NavBar from './components/NavBar';
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
    <Box sx={{ pt: showNav ? '76px' : 0 }}>
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
