import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CAMPUS_CENTER } from '../data/buildings';
import { CATEGORY_LABELS, QUANTITY_LABELS, DIETARY_TAG_LABELS } from '../types';
import type { FoodPostWithEvent } from '../types';
import { figma, fontStack } from '../theme';
import { useActivePosts } from '../hooks/useActivePosts';

type MapPost = FoodPostWithEvent & { letter: string; lat: number; lng: number };

function toMapPosts(source: FoodPostWithEvent[]): MapPost[] {
  const active = source.filter((p) => p.latitude !== null && p.longitude !== null);
  return active.map((p, i) => ({
    ...p,
    letter: String.fromCharCode(65 + i),
    lat: p.latitude as number,
    lng: p.longitude as number,
  }));
}

function letterIcon(letter: string, selected: boolean): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:${selected ? figma.markerSelected : figma.marker};color:#fff;
      font-weight:600;font-size:14px;font-family:${fontStack};
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);
    ">${letter}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function timeLeft(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diffMs / 60_000);
  if (mins <= 0) return 'expired';
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hours}h left` : `${hours}h ${rem}m left`;
}

function untilTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function postSummary(p: MapPost): string {
  return `${CATEGORY_LABELS[p.category]} · ${QUANTITY_LABELS[p.quantity]}`;
}

const SELECTED_KEY = 'map.selectedPostId';

function Map() {
  const navigate = useNavigate();
  const { posts: feedPosts, loading, error } = useActivePosts();
  const posts = useMemo(() => toMapPosts(feedPosts), [feedPosts]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = posts.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    const saved = sessionStorage.getItem(SELECTED_KEY);
    if (saved && posts.some((p) => p.id === saved)) {
      setSelectedId(saved);
      return;
    }
    setSelectedId(posts[0]?.id ?? null);
  }, [posts]);

  useEffect(() => {
    if (selectedId) sessionStorage.setItem(SELECTED_KEY, selectedId);
  }, [selectedId]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    map.setView([CAMPUS_CENTER.latitude, CAMPUS_CENTER.longitude], 15);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Keep markers in sync with the live post list.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextIds = new Set(posts.map((p) => p.id));

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!nextIds.has(id)) {
        map.removeLayer(marker);
        delete markersRef.current[id];
      }
    });

    posts.forEach((post) => {
      const existing = markersRef.current[post.id];
      if (existing) {
        existing.setLatLng([post.lat, post.lng]);
        existing.setIcon(letterIcon(post.letter, post.id === selectedId));
        return;
      }

      const marker = L.marker([post.lat, post.lng], {
        icon: letterIcon(post.letter, post.id === selectedId),
      }).addTo(map);
      marker.on('click', () => setSelectedId(post.id));
      markersRef.current[post.id] = marker;
    });

    if (posts.length === 0) {
      map.setMaxBounds(undefined as unknown as L.LatLngBounds);
      map.setMinZoom(0);
      map.setView([CAMPUS_CENTER.latitude, CAMPUS_CENTER.longitude], 15);
      return;
    }

    const markerBounds = L.latLngBounds(posts.map((p) => [p.lat, p.lng] as [number, number]));

    const updateMaxBounds = () => {
      const view = map.getBounds();
      const latSpan = view.getNorth() - view.getSouth();
      const lngSpan = view.getEast() - view.getWest();
      map.setMaxBounds(
        L.latLngBounds(
          [markerBounds.getSouth() - latSpan, markerBounds.getWest() - lngSpan],
          [markerBounds.getNorth() + latSpan, markerBounds.getEast() + lngSpan],
        ),
      );
    };

    map.setMaxBounds(undefined as unknown as L.LatLngBounds);
    map.fitBounds(markerBounds, { padding: [48, 48], maxZoom: 17 });
    map.setMinZoom(Math.max(map.getZoom() - 1, 14));
    updateMaxBounds();
    map.off('zoomend');
    map.on('zoomend', updateMaxBounds);
  }, [posts, selectedId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 56px)',
        bgcolor: figma.pageBg,
      }}
    >
      <Typography sx={{ fontSize: 28, color: figma.heading, px: 2, pt: 1.5, pb: 1 }}>
        Food near campus
      </Typography>

      <Box sx={{ px: 1.5 }}>
        <Box
          ref={containerRef}
          sx={{
            height: '38vh',
            minHeight: 220,
            maxHeight: 340,
            width: '100%',
            borderRadius: '15px',
            overflow: 'hidden',
            border: `3px solid ${figma.cardBorder}`,
            '& .leaflet-container': { height: '100%', width: '100%' },
          }}
        />
      </Box>

      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <Typography sx={{ fontSize: 18, color: figma.heading }}>
            Markers · {posts.length} available {posts.length === 1 ? 'post' : 'posts'}
          </Typography>
        )}

        {!loading && !error && posts.length === 0 && (
          <Typography color="text.secondary">
            No mapped food right now. New posts with a building pin will show up here.
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {posts.map((p) => (
            <Box
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedId(p.id);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 1,
                px: 1,
                py: 0.5,
                borderRadius: '6px',
                cursor: 'pointer',
                bgcolor: p.id === selectedId ? figma.selectedBg : 'transparent',
                '&:hover': { bgcolor: figma.selectedBg },
                '&:focus-visible': { outline: `2px solid ${figma.cardBorder}`, outlineOffset: 2 },
              }}
            >
              <Box
                component="span"
                sx={{ fontWeight: 600, fontSize: 16, color: figma.ink, minWidth: 16 }}
              >
                {p.letter}
              </Box>
              <Box component="span" sx={{ fontSize: 16, color: figma.ink }}>
                {p.building} · {postSummary(p)}
              </Box>
            </Box>
          ))}
        </Box>

        {selected && (
          <Box
            sx={{
              bgcolor: figma.cardBg,
              border: `3px solid ${figma.cardBorder}`,
              borderRadius: '15px',
              p: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 1,
              }}
            >
              <Box component="span" sx={{ fontWeight: 600, fontSize: 16, color: figma.muted }}>
                {CATEGORY_LABELS[selected.category]}
              </Box>
              <Box component="span" sx={{ fontWeight: 600, fontSize: 16, color: figma.ink }}>
                {timeLeft(selected.expires_at)} · until {untilTime(selected.expires_at)}
              </Box>
            </Box>

            <Box component="span" sx={{ fontSize: 17, color: figma.heading }}>
              {selected.title}
            </Box>

            <Box component="span" sx={{ fontSize: 16, color: figma.ink }}>
              {selected.building}
              {selected.location_details ? ` · ${selected.location_details}` : ''}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Box component="span" sx={{ fontSize: 16, color: figma.ink }}>
                {QUANTITY_LABELS[selected.quantity]}
              </Box>
              {selected.dietary_tags.map((tag) => (
                <Box
                  key={tag}
                  component="span"
                  sx={{
                    fontSize: 16,
                    color: figma.muted,
                    bgcolor: figma.buttonBg,
                    px: '6px',
                    py: '3px',
                    borderRadius: '3px',
                  }}
                >
                  {DIETARY_TAG_LABELS[tag]}
                </Box>
              ))}
            </Box>

            {selected.event && (
              <Box component="span" sx={{ fontSize: 16, color: figma.muted }}>
                Event: {selected.event.name} →
              </Box>
            )}
          </Box>
        )}

        <Button
          fullWidth
          disabled={!selected}
          onClick={() => selected && navigate(`/post/${selected.id}`)}
          disableElevation
          sx={{
            textTransform: 'none',
            fontSize: 16,
            color: figma.heading,
            bgcolor: figma.buttonBg,
            border: `4px solid ${figma.cardBorder}`,
            borderRadius: '6px',
            minHeight: 44,
            boxShadow: figma.buttonShadow,
            '&:hover': { bgcolor: figma.buttonBg, boxShadow: figma.buttonShadow },
            '&.Mui-disabled': { color: figma.muted, bgcolor: figma.buttonBg, boxShadow: 'none' },
          }}
        >
          View selected food
        </Button>
      </Box>
    </Box>
  );
}

export default Map;
