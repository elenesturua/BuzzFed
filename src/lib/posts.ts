import type { FoodPost, FoodPostWithEvent, NewFoodPost, PostStatus } from '../types';
import { GONE_REPORT_THRESHOLD } from '../types';
import { ensureProfile } from './profiles';
import { requireSupabase } from './supabase';

const POST_SELECT = '*, event:events(*)';

type FoodPostRow = FoodPost & {
  event?: FoodPostWithEvent['event'];
};

function normalizePost(
  row: FoodPostRow,
  extras?: { gone_report_count?: number; reported_gone_by_me?: boolean },
): FoodPostWithEvent {
  const { event, ...post } = row;
  return {
    ...post,
    dietary_tags: post.dietary_tags ?? [],
    event: event ?? null,
    gone_report_count: extras?.gone_report_count ?? 0,
    reported_gone_by_me: extras?.reported_gone_by_me ?? false,
  };
}

async function attachGoneReports(posts: FoodPostWithEvent[]): Promise<FoodPostWithEvent[]> {
  if (posts.length === 0) return posts;

  const profile = await ensureProfile();
  const client = requireSupabase();
  const ids = posts.map((p) => p.id);

  const { data, error } = await client
    .from('food_gone_reports')
    .select('post_id, reporter_id')
    .in('post_id', ids);

  if (error) {
    // Older deploys / missing table should not break the feed.
    return posts;
  }

  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const row of data ?? []) {
    counts.set(row.post_id, (counts.get(row.post_id) ?? 0) + 1);
    if (row.reporter_id === profile.id) mine.add(row.post_id);
  }

  return posts.map((post) => ({
    ...post,
    gone_report_count: counts.get(post.id) ?? 0,
    reported_gone_by_me: mine.has(post.id),
  }));
}

/** Still listed: not marked gone and not past expires_at. */
export function isPostActive(post: Pick<FoodPost, 'status' | 'expires_at'>, now = Date.now()): boolean {
  return post.status !== 'gone' && new Date(post.expires_at).getTime() > now;
}

export function isPossiblyGone(post: Pick<FoodPostWithEvent, 'gone_report_count' | 'status'>): boolean {
  return post.status !== 'gone' && post.gone_report_count > 0;
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

  const posts = ((data ?? []) as FoodPostRow[]).map((row) => normalizePost(row)).filter((p) => isPostActive(p));
  return attachGoneReports(posts);
}

export async function fetchPostById(id: string): Promise<FoodPostWithEvent | null> {
  const client = requireSupabase();
  const { data, error } = await client.from('food_posts').select(POST_SELECT).eq('id', id).maybeSingle();

  if (error) {
    throw new Error('Could not load this post. Please try again.');
  }
  if (!data) return null;

  const [withReports] = await attachGoneReports([normalizePost(data as FoodPostRow)]);
  return withReports;
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

/** Poster confirms the food is gone — removes it from the feed. */
export async function confirmFoodGone(id: string): Promise<void> {
  const profile = await ensureProfile();
  const client = requireSupabase();

  const { data: post, error: readError } = await client
    .from('food_posts')
    .select('id, created_by')
    .eq('id', id)
    .maybeSingle();

  if (readError || !post) {
    throw new Error('Could not update this post. Please try again.');
  }
  if (post.created_by !== profile.id) {
    throw new Error('Only the person who posted this can mark it fully gone.');
  }

  const { error } = await client.from('food_posts').update({ status: 'gone' }).eq('id', id);
  if (error) {
    throw new Error('Could not mark this post as gone. Please try again.');
  }
}

/**
 * Anyone can say it looks gone. Stays on the feed as "Possibly gone"
 * until enough people agree (or the poster confirms).
 */
export async function reportFoodLooksGone(id: string): Promise<{ reportCount: number; removed: boolean }> {
  const profile = await ensureProfile();
  const client = requireSupabase();

  const { error } = await client.from('food_gone_reports').insert({
    post_id: id,
    reporter_id: profile.id,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('You already reported that this looks gone.');
    }
    throw new Error('Could not send your report. Please try again.');
  }

  const { count, error: countError } = await client
    .from('food_gone_reports')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id);

  if (countError) {
    return { reportCount: 1, removed: false };
  }

  const reportCount = count ?? 1;
  return { reportCount, removed: reportCount >= GONE_REPORT_THRESHOLD };
}

/** @deprecated use confirmFoodGone / reportFoodLooksGone */
export async function updatePostStatus(id: string, status: PostStatus): Promise<void> {
  if (status === 'gone') {
    await confirmFoodGone(id);
    return;
  }
  await ensureProfile();
  const client = requireSupabase();
  const { error } = await client.from('food_posts').update({ status }).eq('id', id);
  if (error) {
    throw new Error('Could not update this post. Please try again.');
  }
}

/** Subscribe to food_posts / gone-report changes. Returns an unsubscribe function. */
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
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'food_gone_reports' },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
