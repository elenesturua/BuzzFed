import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import FeedRow from '../components/FeedRow';
import { useActivePosts } from '../hooks/useActivePosts';

function Feed() {
  const { posts, loading, error } = useActivePosts();

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Free food near you
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && posts.length === 0 && (
        <Typography color="text.secondary">
          No free food right now. Be the first — tap Post and share leftovers.
        </Typography>
      )}

      {!loading && posts.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {posts.map((post) => (
            <FeedRow key={post.id} post={post} />
          ))}
        </Box>
      )}
    </Container>
  );
}

export default Feed;
