import { Paper, Box, Typography, Chip, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import type { FoodPostWithEvent } from '../types';
import { CATEGORY_LABELS, QUANTITY_LABELS, STATUS_LABELS } from '../types';
import type { PostStatus } from '../types';

const STATUS_COLOR: Record<PostStatus, 'success' | 'warning' | 'default'> = {
  available: 'success',
  running_low: 'warning',
  gone: 'default',
};

function minutesUntil(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diffMs / 60_000);
  if (mins <= 0) return 'expired';
  if (mins < 60) return `${mins}m left`;
  return `${Math.round(mins / 60)}h left`;
}

type Props = {
  post: FoodPostWithEvent;
};

function FeedRow({ post }: Props) {
  const navigate = useNavigate();

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2,
      }}
    >
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
            {post.title}
          </Typography>
          <Chip size="small" label={STATUS_LABELS[post.status]} color={STATUS_COLOR[post.status]} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            color: 'text.secondary',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon fontSize="inherit" />
            <Typography variant="body2" noWrap>
              {post.building}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon fontSize="inherit" />
            <Typography variant="body2">{minutesUntil(post.expires_at)}</Typography>
          </Box>
          <Typography variant="body2">
            {CATEGORY_LABELS[post.category]} · {QUANTITY_LABELS[post.quantity]}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <Button size="small" variant="contained" onClick={() => navigate(`/post/${post.id}`)}>
          View
        </Button>
      </Box>
    </Paper>
  );
}

export default FeedRow;
