import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip, Divider } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PLACEHOLDER_FEED } from '../data/placeholderFeed';
import { CAMPUS_CENTER } from '../data/buildings';
import {
  CATEGORY_LABELS,
  QUANTITY_LABELS,
  DIETARY_TAG_LABELS,
} from '../types';
import type { FoodPostWithEvent } from '../types';

// A post that is shown on the map: active and has coordinates. The letter
// (A, B, C, …) is assigned in list order and used on both the pin and the
// marker list, matching the Figma design.
type MapPost = FoodPostWithEvent & { letter: string; lat: number; lng: number };

function buildMapPosts(): MapPost[] {
  const active = PLACEHOLDER_FEED.filter(
    (p) => p.status !== 'gone' && p.latitude !== null && p.longitude !== null,
  );
  return active.map((p, i) => ({
    ...p,
    letter: String.fromCharCode(65 + i), // A, B, C, …
    lat: p.latitude as number,
    lng: p.longitude as number,
  }));
}

// A dark circular lettered marker (matches the Figma available-food marker).
function letterIcon(letter: string, selected: boolean): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:${selected ? '#1976d2' : '#252525'};color:#fff;
      font-weight:700;font-size:14px;font-family:sans-serif;
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

// Short summary used in the marker list, e.g. "Pizza · lots left".
function postSummary(p: MapPost): string {
  return `${CATEGORY_LABELS[p.category]} · ${QUANTITY_LABELS[p.quantity]}`;
}

function Map() {
  const navigate = useNavigate();
  const posts = useMemo(() => buildMapPosts(), []);

  const [selectedId, setSelectedId] = useState<string | null>(posts[0]?.id ?? null);
  const selected = posts.find((p) => p.id === selectedId) ?? null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Initialize the Leaflet map once. Markers start unselected; the styling
  // effect below immediately applies the current selection.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(
      [CAMPUS_CENTER.latitude, CAMPUS_CENTER.longitude],
      15,
    );
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    posts.forEach((post) => {
      const marker = L.marker([post.lat, post.lng], {
        icon: letterIcon(post.letter, false),
      }).addTo(map);
      marker.on('click', () => setSelectedId(post.id));
      markersRef.current[post.id] = marker;
    });

    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [posts]);

  // Re-style markers when the selection changes.
  useEffect(() => {
    posts.forEach((post) => {
      markersRef.current[post.id]?.setIcon(letterIcon(post.letter, post.id === selectedId));
    });
  }, [posts, selectedId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, px: 2, pt: 1.5, pb: 1 }}>
        Free food on campus
      </Typography>

      {/* Scaled-down map */}
      <Box sx={{ px: 1.5 }}>
        <Box
          ref={containerRef}
          sx={{
            height: '38vh',
            minHeight: 220,
            maxHeight: 340,
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            '& .leaflet-container': { height: '100%', width: '100%' },
          }}
        />
      </Box>

      {/* Info blurbs */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Markers · {posts.length} available {posts.length === 1 ? 'post' : 'posts'}
        </Typography>

        {/* Marker list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: p.id === selectedId ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography component="span" sx={{ fontWeight: 700, minWidth: 16 }}>
                {p.letter}
              </Typography>
              <Typography component="span" variant="body2" color="text.secondary">
                {p.building} · {postSummary(p)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Selected food detail card */}
        {selected && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {CATEGORY_LABELS[selected.category]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {timeLeft(selected.expires_at)} · until {untilTime(selected.expires_at)}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selected.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {selected.building}
              {selected.location_details ? ` · ${selected.location_details}` : ''}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              <Typography variant="body2">{QUANTITY_LABELS[selected.quantity]}</Typography>
              {selected.dietary_tags.map((tag) => (
                <Chip key={tag} size="small" label={DIETARY_TAG_LABELS[tag]} />
              ))}
            </Box>

            {selected.event && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Event: {selected.event.name} →
              </Typography>
            )}
          </Box>
        )}

        {/* Primary action */}
        <Button
          variant="outlined"
          fullWidth
          disabled={!selected}
          onClick={() => selected && navigate(`/post/${selected.id}`)}
        >
          View selected food
        </Button>

        <Divider sx={{ mt: 0.5 }} />
        <Typography variant="caption" color="text.secondary">
          Future path: Feed → Map → Marker → Food detail. No geolocation or directions implemented.
        </Typography>
      </Box>
    </Box>
  );
}

export default Map;
