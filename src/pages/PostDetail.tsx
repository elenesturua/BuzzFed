import { Container, Typography, Button, Box, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { PLACEHOLDER_FEED } from '../data/placeholderFeed';
import { CATEGORY_LABELS, QUANTITY_LABELS, STATUS_LABELS, DIETARY_TAG_LABELS } from '../types';

function formatTimeLeft(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diffMs / 60_000);
  if (mins <= 0) return 'Expired';
  if (mins < 60) return `${mins} min left`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hours}h left` : `${hours}h ${rem}m left`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = PLACEHOLDER_FEED.find((p) => p.id === id);

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {!post ? (
        <Typography>Post not found.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {post.title}
          </Typography>
          <Chip label={STATUS_LABELS[post.status]} sx={{ alignSelf: 'flex-start' }} />
          {post.description && <Typography color="text.secondary">{post.description}</Typography>}
          <Typography>
            <strong>Where:</strong> {post.building}
            {post.location_details ? ` — ${post.location_details}` : ''}
          </Typography>
          <Typography>
            <strong>Category:</strong> {CATEGORY_LABELS[post.category]}
          </Typography>
          <Typography>
            <strong>Quantity:</strong> {QUANTITY_LABELS[post.quantity]}
          </Typography>
          <Typography>
            <strong>Available until:</strong> {formatDateTime(post.expires_at)} (
            {formatTimeLeft(post.expires_at)})
          </Typography>
          {post.dietary_tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {post.dietary_tags.map((tag) => (
                <Chip key={tag} size="small" label={DIETARY_TAG_LABELS[tag]} />
              ))}
            </Box>
          )}
          {post.event && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>Event</Typography>
              <Typography color="text.secondary">
                {post.event.name}
                {post.event.host_org ? ` · ${post.event.host_org}` : ''}
              </Typography>
              <Typography color="text.secondary">
                {post.event.building}
                {post.event.room ? `, Room ${post.event.room}` : ''}
              </Typography>
              <Typography color="text.secondary">
                {formatDateTime(post.event.starts_at)} – {formatDateTime(post.event.ends_at)}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

export default PostDetail;
