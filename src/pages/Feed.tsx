import { Container, Typography, Box } from '@mui/material';
import FeedRow from '../components/FeedRow';
import { PLACEHOLDER_FEED } from '../data/placeholderFeed';

function Feed() {
  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Free food near you
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {PLACEHOLDER_FEED.map((post) => (
          <FeedRow key={post.id} post={post} />
        ))}
      </Box>
    </Container>
  );
}

export default Feed;
