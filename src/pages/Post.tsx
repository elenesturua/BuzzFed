import { useState } from 'react';
import { Container, Typography, Box, TextField, MenuItem, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

function Post() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState<QuantityLevel>('some');
  const [building, setBuilding] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);

  function toggleTag(tag: DietaryTag) {
    setDietaryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
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
      expires_at: new Date(Date.now() + DEFAULT_POST_DURATION_HOURS * 3600_000).toISOString(),
    };
    // TODO: send to Supabase. For now just log and return to the feed.
    console.log('New food post', newPost);
    navigate('/feed');
  }

  const canSubmit = title.trim() !== '' && building.trim() !== '';

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
