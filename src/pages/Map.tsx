import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
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
import { figma } from '../theme';

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
      background:${selected ? figma.markerSelected : figma.marker};color:#fff;
      font-weight:600;font-size:14px;font-family:${figma.bodyFont};
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

// Remembers the last-selected marker across navigation (e.g. viewing a post
// and pressing back) for the lifetime of the browser tab.
const SELECTED_KEY = 'map.selectedPostId';

function Map() {
  const navigate = useNavigate();
  const posts = useMemo(() => buildMapPosts(), []);

  // Restore the previously selected marker if it still exists, otherwise fall
  // back to the first post.
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const saved = sessionStorage.getItem(SELECTED_KEY);
    if (saved && posts.some((p) => p.id === saved)) return saved;
    return posts[0]?.id ?? null;
  });
  const selected = posts.find((p) => p.id === selectedId) ?? null;

  // Persist the selection so it survives leaving and returning to this page.
  useEffect(() => {
    if (selectedId) sessionStorage.setItem(SELECTED_KEY, selectedId);
  }, [selectedId]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Load the Figma fonts (Anaheim for body, Offside for headings) on demand,
  // scoped to this page so no shared file (index.html) is touched. Guarded so
  // it is only injected once.
  useEffect(() => {
    const id = 'map-figma-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Anaheim&family=Offside&display=swap';
    document.head.appendChild(link);
  }, []);

  // Initialize the Leaflet map once. Markers start unselected; the styling
  // effect below immediately applies the current selection.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current);
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

    if (posts.length === 0) {
      map.setView([CAMPUS_CENTER.latitude, CAMPUS_CENTER.longitude], 15);
    } else {
      const markerBounds = L.latLngBounds(
        posts.map((p) => [p.lat, p.lng] as [number, number]),
      );

      // Panning is allowed until only one marker stays on screen: extend the
      // marker bounds by about one viewport span on each side. This is
      // recomputed on every zoom so the allowance grows as you zoom out
      // (otherwise a span measured at the fitted zoom feels too strict when
      // zoomed further out).
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

      const frameMarkers = () => {
        // Clear maxBounds first so fitBounds isn't clamped by a prior pass.
        map.setMaxBounds(undefined as unknown as L.LatLngBounds);
        map.fitBounds(markerBounds, { padding: [48, 48], maxZoom: 17 });
        map.setMinZoom(Math.max(map.getZoom() - 1, 14));
        updateMaxBounds();
      };

      map.on('zoomend', updateMaxBounds);
      frameMarkers();

      // Recalculate size once the container has laid out, then re-frame so the
      // bounds reflect the real dimensions.
      setTimeout(() => {
        map.invalidateSize();
        frameMarkers();
      }, 0);
    }

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 56px)',
        bgcolor: figma.pageBg,
        fontFamily: figma.bodyFont,
      }}
    >
      <Typography
        sx={{ fontFamily: figma.headFont, fontSize: 28, color: figma.heading, px: 2, pt: 1.5, pb: 1 }}
      >
        Food near campus
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
            borderRadius: '15px',
            overflow: 'hidden',
            border: `3px solid ${figma.cardBorder}`,
            '& .leaflet-container': { height: '100%', width: '100%' },
          }}
        />
      </Box>

      {/* Info blurbs */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={{ fontFamily: figma.headFont, fontSize: 18, color: figma.heading }}>
          Markers · {posts.length} available {posts.length === 1 ? 'post' : 'posts'}
        </Typography>

        {/* Marker list */}
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
                sx={{ fontFamily: figma.bodyFont, fontWeight: 600, fontSize: 16, color: figma.ink, minWidth: 16 }}
              >
                {p.letter}
              </Box>
              <Box component="span" sx={{ fontFamily: figma.bodyFont, fontSize: 16, color: figma.ink }}>
                {p.building} · {postSummary(p)}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Selected food detail card */}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
              <Box component="span" sx={{ fontFamily: figma.bodyFont, fontWeight: 600, fontSize: 16, color: figma.muted }}>
                {CATEGORY_LABELS[selected.category]}
              </Box>
              <Box component="span" sx={{ fontFamily: figma.bodyFont, fontWeight: 600, fontSize: 16, color: figma.ink }}>
                {timeLeft(selected.expires_at)} · until {untilTime(selected.expires_at)}
              </Box>
            </Box>

            <Box component="span" sx={{ fontFamily: figma.headFont, fontSize: 17, color: figma.heading }}>
              {selected.title}
            </Box>

            <Box component="span" sx={{ fontFamily: figma.bodyFont, fontSize: 16, color: figma.ink }}>
              {selected.building}
              {selected.location_details ? ` · ${selected.location_details}` : ''}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Box component="span" sx={{ fontFamily: figma.bodyFont, fontSize: 16, color: figma.ink }}>
                {QUANTITY_LABELS[selected.quantity]}
              </Box>
              {selected.dietary_tags.map((tag) => (
                <Box
                  key={tag}
                  component="span"
                  sx={{
                    fontFamily: figma.bodyFont,
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
              <Box component="span" sx={{ fontFamily: figma.bodyFont, fontSize: 16, color: figma.muted }}>
                Event: {selected.event.name} →
              </Box>
            )}
          </Box>
        )}

        {/* Primary action */}
        <Button
          fullWidth
          disabled={!selected}
          onClick={() => selected && navigate(`/post/${selected.id}`)}
          disableElevation
          sx={{
            fontFamily: figma.headFont,
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
