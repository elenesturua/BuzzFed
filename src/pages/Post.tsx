import { useState } from 'react';
import { Container, Typography, Box, TextField, MenuItem, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs, { Dayjs } from 'dayjs';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  QUANTITY_LEVELS,
  QUANTITY_LABELS,
  DIETARY_TAGS,
  DIETARY_TAG_LABELS,
  DEFAULT_POST_DURATION_HOURS,
} from '../types';
import type { FoodCategory, QuantityLevel, DietaryTag, NewFoodPost } from '../types';

const DURATION_OPTIONS = [
  { value: 0.5, label: '30 minutes' },
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: DEFAULT_POST_DURATION_HOURS, label: '3 hours' },
  { value: 6, label: '6 hours' },
] as const;

function Post() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState<QuantityLevel>('some');
  const [building, setBuilding] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);

  const [durationMode, setDurationMode] = useState<string>(String(DEFAULT_POST_DURATION_HOURS));
  const [customEnd, setCustomEnd] = useState<Dayjs | null>(
    dayjs().add(DEFAULT_POST_DURATION_HOURS, 'hour'),
  );

  function toggleTag(tag: DietaryTag) {
    setDietaryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function computeExpiresAt(): string {
    if (durationMode === 'custom') {
      return customEnd!.toISOString();
    }
    const hours = Number(durationMode);
    return new Date(Date.now() + hours * 3600_000).toISOString();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newPost: NewFoodPost = {
      title,
      description: description || null,
      category,
      dietary_tags: dietaryTags,
      quantity,
      building,
      location_details: locationDetails || null,
      latitude: null,
      longitude: null,
      photo_url: null,
      event_id: null,
      ai_suggested: false,
      expires_at: computeExpiresAt(),
    };
    console.log('New food post', newPost);
    navigate('/feed');
  }

  const customEndValid =
    durationMode !== 'custom' ||
    (customEnd !== null && customEnd.isValid() && customEnd.isAfter(dayjs()));

  const canSubmit = title.trim() !== '' && building.trim() !== '' && customEndValid;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Post free food
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Description"
          multiline
          minRows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Category"
          select
          value={category}
          onChange={(e) => setCategory(e.target.value as FoodCategory)}
        >
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Quantity"
          select
          value={quantity}
          onChange={(e) => setQuantity(e.target.value as QuantityLevel)}
        >
          {QUANTITY_LEVELS.map((q) => (
            <MenuItem key={q} value={q}>
              {QUANTITY_LABELS[q]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Building"
          required
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
        />
        <TextField
          label="Location details"
          placeholder="e.g. 2nd floor near the stairs"
          value={locationDetails}
          onChange={(e) => setLocationDetails(e.target.value)}
        />

        <TextField
          label="Available for"
          select
          value={durationMode}
          onChange={(e) => setDurationMode(e.target.value)}
          helperText="How long the food should stay listed"
        >
          {DURATION_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </MenuItem>
          ))}
          <MenuItem value="custom">Custom end time…</MenuItem>
        </TextField>

        {durationMode === 'custom' && (
          <DateTimePicker
            label="Ends at"
            value={customEnd}
            onChange={(value) => setCustomEnd(value)}
            disablePast
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
              seconds: renderTimeViewClock,
            }}
            slotProps={{
              textField: {
                error: !customEndValid,
                helperText: !customEndValid ? 'Pick a time in the future' : undefined,
              },
            }}
          />
        )}

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Dietary tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {DIETARY_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={DIETARY_TAG_LABELS[tag]}
                color={dietaryTags.includes(tag) ? 'primary' : 'default'}
                variant={dietaryTags.includes(tag) ? 'filled' : 'outlined'}
                onClick={() => toggleTag(tag)}
              />
            ))}
          </Box>
        </Box>

        <Button type="submit" variant="contained" disabled={!canSubmit}>
          Post food
        </Button>
      </Box>
    </Container>
  );
}

export default Post;
