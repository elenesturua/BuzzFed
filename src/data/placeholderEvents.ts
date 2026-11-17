import type { CampusEvent } from '../types';

export const mockEvents: CampusEvent[] = [
  {
    id: 'e1',
    name: 'GDC Info Session',
    host_org: 'Game Developers Club',
    building: 'Klaus Advanced Computing',
    room: '1116',
    starts_at: new Date(Date.now() - 60 * 60_000).toISOString(),
    ends_at: new Date(Date.now() + 60 * 60_000).toISOString(),
    created_by: 'u1',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
];
