// src/features/tracks/api.ts
import { EnvironmentNode } from 'three/webgpu';
import { createClient } from '../../lib/client';
import type { ArrivalDto } from '../lib/types';

const client = createClient(ENV || '/api', () => null);

export async function fetchArrivalsForStation(stopPointId: string): Promise<ArrivalDto[]> {
  const q = `?stopPointId=${encodeURIComponent(stopPointId)}`;
  return client.get<ArrivalDto[]>(`/tfl/arrivals${q}`);
}

export async function fetchTrainStateForStation(stopPointId: string) {
  const arrivals = await fetchArrivalsForStation(stopPointId);
  return arrivals.map(a => ({
    id: a.tid ?? a.id,
    destination: a.destinationName,
    position: { lat: a.lat, lon: a.lon },
    raw: a,
  }));
}