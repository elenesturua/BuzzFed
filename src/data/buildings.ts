// Common Georgia Tech buildings with their coordinates.
// Used by the post form (to auto-fill latitude/longitude) and the campus map.
// Coordinates are building-center lat/lng in decimal degrees, verified against
// OpenStreetMap building footprints (via the Overpass API) unless noted.

export type Building = {
  name: string;
  latitude: number;
  longitude: number;
};

// Rough geographic center of GT's main campus. Used to center the map.
export const CAMPUS_CENTER = {
  latitude: 33.7756,
  longitude: -84.3963,
} as const;

// Sorted roughly by how often they host events with leftover food.
export const BUILDINGS: Building[] = [
  { name: 'Klaus Advanced Computing', latitude: 33.77717, longitude: -84.39622 },
  { name: 'Clough Undergraduate Commons', latitude: 33.77467, longitude: -84.39637 },
  { name: 'Student Center', latitude: 33.77339, longitude: -84.39922 },
  { name: 'Instructional Center', latitude: 33.77542, longitude: -84.40126 },
  { name: 'College of Computing (CCB)', latitude: 33.77738, longitude: -84.39727 },
  { name: 'Van Leer', latitude: 33.77581, longitude: -84.39717 },
  { name: 'Howey Physics', latitude: 33.77742, longitude: -84.39848 },
  { name: 'Skiles Classroom', latitude: 33.77355, longitude: -84.39593 },
  { name: 'Price Gilbert Library', latitude: 33.77436, longitude: -84.39571 },
  { name: 'Scheller College of Business', latitude: 33.77633, longitude: -84.38807 },
  { name: 'Tech Square (CODA)', latitude: 33.7755, longitude: -84.38807 },
  { name: 'Ford Environmental Science & Technology', latitude: 33.77884, longitude: -84.39599 },
  { name: 'Molecular Science & Engineering', latitude: 33.77983, longitude: -84.39663 },
  { name: 'Marcus Nanotechnology', latitude: 33.77887, longitude: -84.3984 },
  { name: 'Guggenheim Aerospace', latitude: 33.7716, longitude: -84.39578 },
  { name: 'Boggs Chemistry', latitude: 33.77549, longitude: -84.39974 },
  { name: 'College of Design (East Architecture)', latitude: 33.77596, longitude: -84.39537 },
  { name: 'Campus Recreation Center (CRC)', latitude: 33.77553, longitude: -84.40395 },
  { name: 'Exhibition Hall', latitude: 33.7746, longitude: -84.40165 },
  { name: 'Bobby Dodd Stadium', latitude: 33.77255, longitude: -84.39296 },
];

// Fast lookup of a building's coordinates by its exact name.
export const BUILDINGS_BY_NAME: Record<string, Building> = Object.fromEntries(
  BUILDINGS.map((b) => [b.name, b]),
);
