import type { FoodPost, FoodPostWithEvent, NewFoodPost, PostStatus } from '../types';
import { ensureProfile } from './profiles';
import { requireSupabase } from './supabase';

const POST_SELECT = '*, event:events(*)';

type FoodPostRow = FoodPost & {
  event?: FoodPostWithEvent['event'];
};

function normalizePost(row: FoodPostRow): FoodPostWithEvent {
  const { event, ...post } = row;
  return {
    ...post,
    dietary_tags: post.dietary_tags ?? [],
    event: event ?? null,
  };
}

/** Still listed: not marked gone and not past expires_at. */
export function isPostActive(post: Pick<FoodPost, 'status' | 'expires_at'>, now = Date.now()): boolean {
  return post.status !== 'gone' && new Date(post.expires_at).getTime() > now;
}

export async function fetchActivePosts(): Promise<FoodPostWithEvent[]> {
  const client = requireSupabase();
  const nowIso = new Date().toISOString();

  const { data, error } = await client
    .from('food_posts')
    .select(POST_SELECT)
    .neq('status', 'gone')
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Could not load the feed. Please try again.');
  }

  return ((data ?? []) as FoodPostRow[]).map(normalizePost).filter((p) => isPostActive(p));
}

export async function fetchPostById(id: string): Promise<FoodPostWithEvent | null> {
  const client = requireSupabase();
  const { data, error } = await client.from('food_posts').select(POST_SELECT).eq('id', id).maybeSingle();

  if (error) {
    throw new Error('Could not load this post. Please try again.');
  }
  if (!data) return null;
  return normalizePost(data as FoodPostRow);
}

export async function createFoodPost(input: NewFoodPost): Promise<FoodPostWithEvent> {
  const profile = await ensureProfile();
  const client = requireSupabase();

  const { data, error } = await client
    .from('food_posts')
    .insert({
      title: input.title.trim(),
      description: input.description,
      category: input.category,
      dietary_tags: input.dietary_tags,
      quantity: input.quantity,
      building: input.building,
      location_details: input.location_details,
      latitude: input.latitude,
      longitude: input.longitude,
      photo_url: input.photo_url,
      event_id: input.event_id,
      ai_suggested: input.ai_suggested,
      expires_at: input.expires_at,
      created_by: profile.id,
    })
    .select(POST_SELECT)
    .single();

  if (error) {
    const detail = error.message || '';
    if (/row-level security|policy/i.test(detail)) {
      throw new Error('Could not create post (permission denied). Sign out, sign back in, and try again.');
    }
    if (/food_posts_max_duration|check constraint/i.test(detail)) {
      throw new Error('Posts can only stay up for 12 hours. Pick an earlier end time.');
    }
    throw new Error(`Could not create post: ${detail || 'please try again.'}`);
  }

  return normalizePost(data as FoodPostRow);
}

export async function updatePostStatus(id: string, status: PostStatus): Promise<void> {
  await ensureProfile();
  const client = requireSupabase();
  const { error } = await client.from('food_posts').update({ status }).eq('id', id);

  if (error) {
    throw new Error('Could not update this post. Please try again.');
  }
}

/** Subscribe to food_posts changes. Returns an unsubscribe function. */
export function subscribeToFoodPosts(onChange: () => void): () => void {
  const client = requireSupabase();
  const channel = client
    .channel('food-posts-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'food_posts' },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
