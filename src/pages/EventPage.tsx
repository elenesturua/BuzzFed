import { Container, Typography, Box, Paper, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { mockEvents } from '../data/placeholderEvents';
import { PLACEHOLDER_FEED } from '../data/placeholderFeed';

function EventPage() {
  const { id } = useParams<{ id: string }>();

  // Find the event by its ID
  const event = mockEvents.find((event) => event.id === id);

  // Find active, unexpired posts associated with the event
  const eventPosts = PLACEHOLDER_FEED.filter(
    (post) =>
      post.event_id === id &&
      post.status !== 'gone' &&
      new Date(post.expires_at).getTime() > Date.now(),
  );

  if (!event) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography variant="h5">Event not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        {event.name}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography>
          <strong>Hosted by:</strong> {event.host_org ?? 'Unknown'}
        </Typography>

        <Typography>
          <strong>Building:</strong> {event.building}
        </Typography>

        {event.room && (
          <Typography>
            <strong>Room:</strong> {event.room}
          </Typography>
        )}

        <Typography>
          <strong>Starts:</strong> {new Date(event.starts_at).toLocaleString()}
        </Typography>

        <Typography>
          <strong>Ends:</strong> {new Date(event.ends_at).toLocaleString()}
        </Typography>
      </Paper>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Available Food
      </Typography>

      {eventPosts.length === 0 ? (
        <Typography color="text.secondary">No active food posts for this event yet.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {eventPosts.map((post) => (
            <Paper key={post.id} sx={{ p: 2 }}>
              <Typography variant="h6">{post.title}</Typography>

              <Typography color="text.secondary">{post.description}</Typography>

              <Typography variant="body2">{post.building}</Typography>

              <Chip
                label={post.status.replace('_', ' ')}
                size="small"
                color="success"
                sx={{ mt: 1 }}
              />
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default EventPage;
