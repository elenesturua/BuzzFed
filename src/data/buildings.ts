// Common Georgia Tech buildings with their coordinates.
// Used by the post form (to auto-fill latitude/longitude) and the campus map.
// Coordinates are approximate building-center lat/lng in decimal degrees.

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
  { name: 'Klaus Advanced Computing', latitude: 33.7773, longitude: -84.3963 },
  { name: 'Clough Undergraduate Commons', latitude: 33.7745, longitude: -84.3963 },
  { name: 'Student Center', latitude: 33.7739, longitude: -84.3989 },
  { name: 'Instructional Center', latitude: 33.7757, longitude: -84.4012 },
  { name: 'College of Computing (CCB)', latitude: 33.7772, longitude: -84.3972 },
  { name: 'Van Leer', latitude: 33.7759, longitude: -84.3964 },
  { name: 'Howey Physics', latitude: 33.7773, longitude: -84.3985 },
  { name: 'Skiles Classroom', latitude: 33.7738, longitude: -84.3958 },
  { name: 'Price Gilbert Library', latitude: 33.7746, longitude: -84.3957 },
  { name: 'Scheller College of Business', latitude: 33.7764, longitude: -84.3875 },
  { name: 'Tech Square (CODA)', latitude: 33.7767, longitude: -84.3892 },
  { name: 'Ford Environmental Science & Technology', latitude: 33.7787, longitude: -84.3963 },
  { name: 'Molecular Science & Engineering', latitude: 33.7817, longitude: -84.3972 },
  { name: 'Marcus Nanotechnology', latitude: 33.7808, longitude: -84.3975 },
  { name: 'Guggenheim Aerospace', latitude: 33.7721, longitude: -84.3955 },
  { name: 'Boggs Chemistry', latitude: 33.7781, longitude: -84.3996 },
  { name: 'College of Design (East Architecture)', latitude: 33.7760, longitude: -84.3949 },
  { name: 'Campus Recreation Center (CRC)', latitude: 33.7757, longitude: -84.4035 },
  { name: 'Exhibition Hall', latitude: 33.7772, longitude: -84.3934 },
  { name: 'Bobby Dodd Stadium', latitude: 33.7725, longitude: -84.3928 },
];

// Fast lookup of a building's coordinates by its exact name.
export const BUILDINGS_BY_NAME: Record<string, Building> = Object.fromEntries(
  BUILDINGS.map((b) => [b.name, b]),
);
