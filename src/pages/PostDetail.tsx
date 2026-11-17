import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Container, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import FoodPhoto from '../components/FoodPhoto';
import { fetchPostById, isPostActive, updatePostStatus } from '../lib/posts';
import { CATEGORY_LABELS, QUANTITY_LABELS, STATUS_LABELS, DIETARY_TAG_LABELS } from '../types';
import type { FoodPostWithEvent } from '../types';

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
  const [post, setPost] = useState<FoodPostWithEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [markingGone, setMarkingGone] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setPost(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPostById(id)
      .then((next) => {
        if (!cancelled) setPost(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load this post.');
          setPost(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleMarkGone() {
    if (!post) return;
    setActionError(null);
    setMarkingGone(true);
    try {
      await updatePostStatus(post.id, 'gone');
      setPost({ ...post, status: 'gone' });
      navigate('/feed', { replace: true });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not mark this post as gone.');
    } finally {
      setMarkingGone(false);
    }
  }

  const active = post ? isPostActive(post) : false;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && !post && <Typography>Post not found.</Typography>}

      {!loading && post && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <FoodPhoto photoUrl={post.photo_url} title={post.title} height={260} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {post.title}
          </Typography>
          <Chip
            label={active ? STATUS_LABELS[post.status] : post.status === 'gone' ? 'Gone' : 'Expired'}
            color={active ? (post.status === 'running_low' ? 'primary' : 'info') : 'default'}
            sx={{ alignSelf: 'flex-start' }}
          />
          {!active && post.status !== 'gone' && (
            <Alert severity="info">This listing has expired and no longer appears in the feed.</Alert>
          )}
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

          {actionError && <Alert severity="error">{actionError}</Alert>}

          {active && (
            <Button
              variant="outlined"
              color="error"
              disabled={markingGone}
              onClick={() => void handleMarkGone()}
              sx={{ mt: 1, alignSelf: 'stretch' }}
            >
              {markingGone ? 'Updating…' : "Food's gone"}
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
}

export default PostDetail;
