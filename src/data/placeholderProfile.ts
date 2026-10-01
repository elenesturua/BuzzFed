import type { Profile } from '../types';

// mock datar
export const PLACEHOLDER_PROFILE: Profile = {
  id: 'u1',
  email: 'bwreck@gatech.edu',
  display_name: 'Buzz',
  notifications_enabled: true,
  notify_categories: ['pizza', 'desserts'],
  notify_dietary_tags: ['vegetarian'],
  created_at: new Date(Date.now() - 30 * 24 * 3600_000).toISOString(),
};
