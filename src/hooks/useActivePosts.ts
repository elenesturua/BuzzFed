import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchActivePosts,
  isPostActive,
  subscribeToFoodPosts,
} from '../lib/posts';
import type { FoodPostWithEvent } from '../types';

/** Live list of posts that are still available and not expired. */
export function useActivePosts() {
  const [posts, setPosts] = useState<FoodPostWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    try {
      const next = await fetchActivePosts();
      setPosts(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    try {
      return subscribeToFoodPosts(() => {
        void refresh();
      });
    } catch {
      return undefined;
    }
  }, [refresh]);

  // Drop posts from the UI as soon as they expire, without waiting for a refresh.
  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const active = posts.filter((p) => isPostActive(p, now));
    if (active.length === posts.length) return;

    const nextExpiry = active
      .map((p) => new Date(p.expires_at).getTime())
      .filter((t) => t > now)
      .sort((a, b) => a - b)[0];

    if (nextExpiry == null) return;

    const delay = Math.min(Math.max(nextExpiry - now + 250, 250), 60_000);
    const timer = window.setTimeout(() => setNow(Date.now()), delay);
    return () => window.clearTimeout(timer);
  }, [posts, now]);

  const activePosts = useMemo(
    () => posts.filter((p) => isPostActive(p, now)),
    [posts, now],
  );

  return { posts: activePosts, loading, error, refresh };
}
