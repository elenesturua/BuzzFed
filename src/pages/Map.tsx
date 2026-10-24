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

// Exact values pulled from the Figma Map design (node 4:639). The page is
// white with soft-blue-outlined rounded cards; headings use Offside, body uses
// Anaheim. Tiles stay on OpenStreetMap.
const FIGMA = {
  pageBg: '#ffffff',
  cardBg: '#ffffff',
  cardBorder: '#a5d8ff', // light blue card outline
  buttonBg: '#f7f5fb', // lavender-white button / dietary tag
  selectedBg: '#f0f7ff', // light blue for selected/hover rows
  heading: '#4c5c68', // slate — section headings, titles, button (Offside)
  ink: '#252525', // primary body text
  muted: '#656565', // secondary text
  marker: '#252525', // dark circular food markers
  markerSelected: '#1976d2',
  buttonShadow: '4px 4px 2px 0px rgba(76,92,104,0.5)',
  bodyFont: "'Anaheim', sans-serif",
  headFont: "'Offside', sans-serif",
} as const;

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
      background:${selected ? FIGMA.markerSelected : FIGMA.marker};color:#fff;
      font-weight:600;font-size:14px;font-family:${FIGMA.bodyFont};
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 56px)',
        bgcolor: FIGMA.pageBg,
        fontFamily: FIGMA.bodyFont,
      }}
    >
      <Typography
        sx={{ fontFamily: FIGMA.headFont, fontSize: 28, color: FIGMA.heading, px: 2, pt: 1.5, pb: 1 }}
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
            border: `3px solid ${FIGMA.cardBorder}`,
            '& .leaflet-container': { height: '100%', width: '100%' },
          }}
        />
      </Box>

      {/* Info blurbs */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={{ fontFamily: FIGMA.headFont, fontSize: 18, color: FIGMA.heading }}>
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
                bgcolor: p.id === selectedId ? FIGMA.selectedBg : 'transparent',
                '&:hover': { bgcolor: FIGMA.selectedBg },
                '&:focus-visible': { outline: `2px solid ${FIGMA.cardBorder}`, outlineOffset: 2 },
              }}
            >
              <Box
                component="span"
                sx={{ fontFamily: FIGMA.bodyFont, fontWeight: 600, fontSize: 16, color: FIGMA.ink, minWidth: 16 }}
              >
                {p.letter}
              </Box>
              <Box component="span" sx={{ fontFamily: FIGMA.bodyFont, fontSize: 16, color: FIGMA.ink }}>
                {p.building} · {postSummary(p)}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Selected food detail card */}
        {selected && (
          <Box
            sx={{
              bgcolor: FIGMA.cardBg,
              border: `3px solid ${FIGMA.cardBorder}`,
              borderRadius: '15px',
              p: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
              <Box component="span" sx={{ fontFamily: FIGMA.bodyFont, fontWeight: 600, fontSize: 16, color: FIGMA.muted }}>
                {CATEGORY_LABELS[selected.category]}
              </Box>
              <Box component="span" sx={{ fontFamily: FIGMA.bodyFont, fontWeight: 600, fontSize: 16, color: FIGMA.ink }}>
                {timeLeft(selected.expires_at)} · until {untilTime(selected.expires_at)}
              </Box>
            </Box>

            <Box component="span" sx={{ fontFamily: FIGMA.headFont, fontSize: 17, color: FIGMA.heading }}>
              {selected.title}
            </Box>

            <Box component="span" sx={{ fontFamily: FIGMA.bodyFont, fontSize: 16, color: FIGMA.ink }}>
              {selected.building}
              {selected.location_details ? ` · ${selected.location_details}` : ''}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Box component="span" sx={{ fontFamily: FIGMA.bodyFont, fontSize: 16, color: FIGMA.ink }}>
                {QUANTITY_LABELS[selected.quantity]}
              </Box>
              {selected.dietary_tags.map((tag) => (
                <Box
                  key={tag}
                  component="span"
                  sx={{
                    fontFamily: FIGMA.bodyFont,
                    fontSize: 16,
                    color: FIGMA.muted,
                    bgcolor: FIGMA.buttonBg,
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
              <Box component="span" sx={{ fontFamily: FIGMA.bodyFont, fontSize: 16, color: FIGMA.muted }}>
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
            fontFamily: FIGMA.headFont,
            textTransform: 'none',
            fontSize: 16,
            color: FIGMA.heading,
            bgcolor: FIGMA.buttonBg,
            border: `4px solid ${FIGMA.cardBorder}`,
            borderRadius: '6px',
            minHeight: 44,
            boxShadow: FIGMA.buttonShadow,
            '&:hover': { bgcolor: FIGMA.buttonBg, boxShadow: FIGMA.buttonShadow },
            '&.Mui-disabled': { color: FIGMA.muted, bgcolor: FIGMA.buttonBg, boxShadow: 'none' },
          }}
        >
          View selected food
        </Button>
      </Box>
    </Box>
  );
}

export default Map;
