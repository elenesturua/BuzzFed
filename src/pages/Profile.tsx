import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { CATEGORIES, CATEGORY_LABELS, DIETARY_TAGS, DIETARY_TAG_LABELS } from '../types';
import type { FoodCategory, DietaryTag } from '../types';
import { PLACEHOLDER_PROFILE } from '../data/placeholderProfile';

function Profile() {
  const [displayName, setDisplayName] = useState(PLACEHOLDER_PROFILE.display_name ?? '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    PLACEHOLDER_PROFILE.notifications_enabled,
  );
  const [notifyCategories, setNotifyCategories] = useState<FoodCategory[]>(
    PLACEHOLDER_PROFILE.notify_categories,
  );
  const [notifyTags, setNotifyTags] = useState<DietaryTag[]>(
    PLACEHOLDER_PROFILE.notify_dietary_tags,
  );

  function toggleCategory(c: FoodCategory) {
    setNotifyCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function toggleTag(t: DietaryTag) {
    setNotifyTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function handleSave() {
    // do something for save  n stuff
    console.log('Save profile', {
      display_name: displayName || null,
      notifications_enabled: notificationsEnabled,
      notify_categories: notifyCategories,
      notify_dietary_tags: notifyTags,
    });
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Profile
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          value={PLACEHOLDER_PROFILE.email}
          disabled
          helperText="Your @gatech.edu account"
        />
        <TextField
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <Divider />

        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Notifications
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
          }
          label="Notify me about new food posts"
        />

        <Box sx={{ opacity: notificationsEnabled ? 1 : 0.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Categories (none selected = all)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={CATEGORY_LABELS[c]}
                color={notifyCategories.includes(c) ? 'primary' : 'default'}
                variant={notifyCategories.includes(c) ? 'filled' : 'outlined'}
                onClick={() => toggleCategory(c)}
                disabled={!notificationsEnabled}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Dietary filter (none selected = no filter)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {DIETARY_TAGS.map((t) => (
              <Chip
                key={t}
                label={DIETARY_TAG_LABELS[t]}
                color={notifyTags.includes(t) ? 'primary' : 'default'}
                variant={notifyTags.includes(t) ? 'filled' : 'outlined'}
                onClick={() => toggleTag(t)}
                disabled={!notificationsEnabled}
              />
            ))}
          </Box>
        </Box>

        <Button variant="contained" onClick={handleSave}>
          Save changes
        </Button>
      </Box>
    </Container>
  );
}

export default Profile;
