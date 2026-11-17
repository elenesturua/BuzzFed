import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import FoodPhoto from '../components/FoodPhoto';
import { useAuth } from '../lib/AuthContext';
import {
  confirmFoodGone,
  fetchPostById,
  isPossiblyGone,
  isPostActive,
  reportFoodLooksGone,
} from '../lib/posts';
import { CATEGORY_LABELS, QUANTITY_LABELS, STATUS_LABELS, DIETARY_TAG_LABELS, GONE_REPORT_THRESHOLD } from '../types';
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
  const { user } = useAuth();
  const [post, setPost] = useState<FoodPostWithEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionInfo, setActionInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const active = post ? isPostActive(post) : false;
  const isCreator = Boolean(post && user && post.created_by === user.id);
  const possiblyGone = post ? isPossiblyGone(post) : false;

  async function handleConfirmAction() {
    if (!post) return;
    setActionError(null);
    setActionInfo(null);
    setBusy(true);
    try {
      if (isCreator) {
        await confirmFoodGone(post.id);
        setPost({ ...post, status: 'gone', gone_report_count: post.gone_report_count });
        setConfirmOpen(false);
        navigate('/feed', { replace: true });
        return;
      }

      const result = await reportFoodLooksGone(post.id);
      setPost({
        ...post,
        gone_report_count: result.reportCount,
        reported_gone_by_me: true,
        status: result.removed ? 'gone' : post.status,
      });
      setConfirmOpen(false);

      if (result.removed) {
        navigate('/feed', { replace: true });
        return;
      }

      setActionInfo(
        result.reportCount >= GONE_REPORT_THRESHOLD - 1
          ? 'Marked as possibly gone. One more report will take it off the feed.'
          : 'Thanks — this listing now shows as possibly gone so others can double-check.',
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update this post.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
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

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={
                active ? STATUS_LABELS[post.status] : post.status === 'gone' ? 'Gone' : 'Expired'
              }
              color={active ? (post.status === 'running_low' ? 'primary' : 'info') : 'default'}
            />
            {possiblyGone && (
              <Chip
                label={
                  post.gone_report_count === 1
                    ? 'Possibly gone · 1 report'
                    : `Possibly gone · ${post.gone_report_count} reports`
                }
                color="warning"
                variant="outlined"
              />
            )}
          </Box>

          {possiblyGone && active && (
            <Alert severity="warning">
              Someone said this might already be gone. Check before you walk over
              {post.gone_report_count === 1
                ? ` — one more report takes it off the feed.`
                : '.'}
            </Alert>
          )}

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
          {actionInfo && <Alert severity="success">{actionInfo}</Alert>}

          {active && (
            <Button
              variant="outlined"
              color="warning"
              disabled={busy || (!isCreator && post.reported_gone_by_me)}
              onClick={() => setConfirmOpen(true)}
              sx={{ mt: 1, alignSelf: 'stretch' }}
            >
              {!isCreator && post.reported_gone_by_me
                ? 'You reported this as possibly gone'
                : isCreator
                  ? "Food's gone"
                  : 'Looks like it’s gone'}
            </Button>
          )}
        </Box>
      )}

      <Dialog open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)}>
        <DialogTitle>
          {isCreator ? 'Mark this food as gone?' : 'Report that this looks gone?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isCreator
              ? 'Are you sure there is no food left? This will remove the listing from the feed for everyone.'
              : `Are you sure there is no more left? This will mark the post as “possibly gone” for other students. It stays on the feed until ${GONE_REPORT_THRESHOLD} people report it (or the poster confirms).`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={isCreator ? 'error' : 'warning'}
            onClick={() => void handleConfirmAction()}
            disabled={busy}
          >
            {busy ? 'Saving…' : isCreator ? 'Yes, it’s gone' : 'Yes, looks gone'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PostDetail;
