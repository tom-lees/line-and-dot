import * as THREE from "three";
import type { Network, Station } from "./components/trainLines";

// TODO This whole ts needs a comb over.

export function normaliseNetwork(
  network: Network,
  screenWidth: number
): Network {
  // Flatten all stations to compute group min/max
  const allStations = Object.values(network).flatMap((line) =>
    line.subsections.flatMap((subsection) => subsection.stations)
  );
  const allStationsX = allStations.map((s) => s.x);
  const allStationsY = allStations.map((s) => s.y);

  const minX = Math.min(...allStationsX);
  const maxX = Math.max(...allStationsX);

  const minY = Math.min(...allStationsY);
  const maxY = Math.max(...allStationsY);

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  const rangeX = Math.max(1, maxX - minX);
  const scale = screenWidth / rangeX; // only width-based scaling

  return Object.fromEntries(
    Object.entries(network).map(([key, line]) => [
      key,
      {
        ...line,
        subsections: line.subsections.map((subsection) => ({
          ...subsection,
          stations: subsection.stations.map((s) => ({
            ...s,
            x: (s.x - midX) * scale, // scale X
            y: (s.y - midY) * scale, // scale Y (or just center)
          })),
        })),
      },
    ])
  );
}

// TODO Hard code u values to train data.  No need to calculate.
const calculateStationUs = (
  curve: THREE.CatmullRomCurve3,
  stations: Station[]
) => {
  const sampleCount = Math.max(200, stations.length * 50);
  const samples = curve.getPoints(sampleCount);
  const cumLengths: number[] = new Array(samples.length).fill(0);
  for (let i = 1; i < samples.length; i++) {
    cumLengths[i] = cumLengths[i - 1] + samples[i].distanceTo(samples[i - 1]);
  }
  const total = cumLengths[cumLengths.length - 1] || 1;

  const stationUs = stations.map((s) => {
    const stationVec = new THREE.Vector3(s.x, s.y, 0);
    let closestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const d = samples[i].distanceTo(stationVec);
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }
    return { label: s.name, u: cumLengths[closestIdx] / total };
  });

  return stationUs;
};

export function buildCurveData(stations: Station[]) {
  const points = stations.map((s) => new THREE.Vector3(s.x, s.y, 0));
  const curve = new THREE.CatmullRomCurve3(points);

  // use arc-length based u values
  const stationUs = calculateStationUs(curve, stations);

  // bounds
  const curvePoints = curve.getPoints(200);

  // line positions
  const _array = new Float32Array(curvePoints.length * 3);
  curvePoints.forEach((p, i) => {
    _array[i * 3] = p.x;
    _array[i * 3 + 1] = p.y;
    _array[i * 3 + 2] = p.z;
  });

  // label positions (use arc-length u)
  const labelPositions = stationUs.map((s) => {
    const p = curve.getPointAt(s.u);
    const x = p.x;
    const y = p.y;
    const z = p.z;
    return { label: s.label, position: [x, y, z] as [number, number, number] };
  });

  return { curve, linePoints: _array, labelPositions, stationUs };
}
