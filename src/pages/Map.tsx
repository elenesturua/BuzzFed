import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { PLACEHOLDER_FEED } from '../data/placeholderFeed';
import { CAMPUS_CENTER } from '../data/buildings';
import { CATEGORY_LABELS, QUANTITY_LABELS, STATUS_LABELS } from '../types';

// Vite's bundler rewrites asset paths, which breaks Leaflet's default marker
// icon lookup. Point Leaflet at the imported URLs so pins actually render.
const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function escapeHtml(value: string): string {
  const el = document.createElement('div');
  el.textContent = value;
  return el.innerHTML;
}

function minutesUntil(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diffMs / 60_000);
  if (mins <= 0) return 'expired';
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hours}h left` : `${hours}h ${rem}m left`;
}

function Map() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

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

    // One pin per active post that has coordinates.
    const activePosts = PLACEHOLDER_FEED.filter(
      (p) => p.status !== 'gone' && p.latitude !== null && p.longitude !== null,
    );

    activePosts.forEach((post) => {
      const marker = L.marker([post.latitude!, post.longitude!]).addTo(map);

      // Popup card showing this post's food info (title, where, what, how
      // much, how long), plus a button into the full detail page.
      const card = document.createElement('div');
      card.style.minWidth = '180px';
      card.innerHTML = `
        <div style="font-weight:700;font-size:14px;margin-bottom:2px;">${escapeHtml(post.title)}</div>
        <div style="
          display:inline-block;font-size:11px;font-weight:600;
          padding:1px 8px;border-radius:10px;margin-bottom:6px;
          background:#eef1f4;color:#333;">
          ${escapeHtml(STATUS_LABELS[post.status])}
        </div>
        <div style="color:#555;font-size:12px;margin-bottom:2px;">📍 ${escapeHtml(post.building)}${
          post.location_details ? ` — ${escapeHtml(post.location_details)}` : ''
        }</div>
        <div style="color:#555;font-size:12px;margin-bottom:2px;">🍽️ ${escapeHtml(
          `${CATEGORY_LABELS[post.category]} · ${QUANTITY_LABELS[post.quantity]}`,
        )}</div>
        <div style="color:#555;font-size:12px;margin-bottom:8px;">⏱️ ${escapeHtml(
          minutesUntil(post.expires_at),
        )}</div>
        <button type="button" style="
          border:none;background:#1976d2;color:#fff;
          padding:6px 12px;border-radius:6px;font-size:13px;
          cursor:pointer;width:100%;">
          View post
        </button>
      `;

      const button = card.querySelector('button');
      button?.addEventListener('click', () => navigate(`/post/${post.id}`));

      marker.bindPopup(card);
    });

    // Leaflet needs a size recalculation once the container has laid out.
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [navigate]);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, px: 2, py: 1.5 }}>
        Free food on campus
      </Typography>
      <Box
        ref={containerRef}
        sx={{
          flexGrow: 1,
          width: '100%',
          '& .leaflet-container': { height: '100%', width: '100%' },
        }}
      />
    </Box>
  );
}

export default Map;
