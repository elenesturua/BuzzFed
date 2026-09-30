// Shared data contract for BuzzFed: frontend pages, the Supabase database, and the Gemini


// Food categories a post can have. Stored in food_posts.category.
export const CATEGORIES = [
  'pizza',
  'sandwiches',
  'meals',
  'snacks',
  'desserts',
  'drinks',
  'other',
] as const;
export type FoodCategory = (typeof CATEGORIES)[number];

// Dietary tags a post can have. Stored in food_posts.dietary_tags.
export const DIETARY_TAGS = [
  'vegetarian',
  'vegan',
  'halal',
  'kosher',
  'gluten_free',
  'contains_nuts',
  'contains_dairy',
] as const;
export type DietaryTag = (typeof DIETARY_TAGS)[number];

// How much food is left. Stored in food_posts.quantity.
export const QUANTITY_LEVELS = ['a_little', 'some', 'lots'] as const;
export type QuantityLevel = (typeof QUANTITY_LEVELS)[number];

// Whether the food is still there. Stored in food_posts.status.
export const POST_STATUSES = ['available', 'running_low', 'gone'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

// How long a post stays up by default. Used for food_posts.expires_at.
export const DEFAULT_POST_DURATION_HOURS = 3;

// One per logged-in user. Table: profiles.
export type Profile = {
  id: string;
  email: string; // must end in @gatech.edu
  display_name: string | null;
  notifications_enabled: boolean;
  notify_categories: FoodCategory[]; // empty = all categories
  notify_dietary_tags: DietaryTag[]; // empty = no dietary filter
  created_at: string;
};

// A campus event that food posts can be grouped under. Table: events.
export type CampusEvent = {
  id: string;
  name: string;
  host_org: string | null;
  building: string;
  room: string | null;
  starts_at: string;
  ends_at: string;
  created_by: string; // profiles.id
  created_at: string;
};

// A post about available food, the core of the app. Table: food_posts.
export type FoodPost = {
  id: string;
  title: string;
  description: string | null;
  category: FoodCategory;
  dietary_tags: DietaryTag[];
  quantity: QuantityLevel;
  building: string;
  location_details: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  event_id: string | null; // events.id
  status: PostStatus;
  ai_suggested: boolean; // true if Gemini pre-filled the form
  expires_at: string; // defaults to DEFAULT_POST_DURATION_HOURS after created_at
  created_by: string; // profiles.id
  created_at: string;
};

// What the post form submits to food_posts. The database fills in the omitted fields.
export type NewFoodPost = Omit<FoodPost, 'id' | 'status' | 'created_by' | 'created_at'>;

// A food post joined with its event (from events), as shown in the feed.
export type FoodPostWithEvent = FoodPost & { event: CampusEvent | null };

// Display text for each value in CATEGORIES.
export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  pizza: 'Pizza',
  sandwiches: 'Sandwiches',
  meals: 'Full meals',
  snacks: 'Snacks',
  desserts: 'Desserts',
  drinks: 'Drinks',
  other: 'Other',
};

// Display text for each value in DIETARY_TAGS.
export const DIETARY_TAG_LABELS: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  halal: 'Halal',
  kosher: 'Kosher',
  gluten_free: 'Gluten-free',
  contains_nuts: 'Contains nuts',
  contains_dairy: 'Contains dairy',
};

// Display text for each value in QUANTITY_LEVELS.
export const QUANTITY_LABELS: Record<QuantityLevel, string> = {
  a_little: 'A little left',
  some: 'Some left',
  lots: 'Lots left',
};

// Display text for each value in POST_STATUSES.
export const STATUS_LABELS: Record<PostStatus, string> = {
  available: 'Available',
  running_low: 'Running low',
  gone: 'Gone',
};
