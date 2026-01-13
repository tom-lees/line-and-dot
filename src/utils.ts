import * as THREE from "three";
import type { Network, Positions } from "./components/trainLines";

// TODO This whole ts needs a comb over.
export function normaliseNetwork(
  network: Network,
  screenWidth: number
): Network {
  // Flatten all stations to compute group min/max
  const allPositions = Object.values(network).flatMap((line) =>
    line.subsections.flatMap((subsection) => subsection.positions)
  );
  const allPositionsX = allPositions.map((p) => p.x);
  const allPositionsY = allPositions.map((p) => p.y);

  const minX = Math.min(...allPositionsX);
  const maxX = Math.max(...allPositionsX);

  const minY = Math.min(...allPositionsY);
  const maxY = Math.max(...allPositionsY);

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
          positions: subsection.positions.map((s) => ({
            ...s,
            x: (s.x - midX) * scale, // scale X
            y: (s.y - midY) * scale, // scale Y (or just center)
            //TODO consider z scaling?
          })),
        })),
      },
    ])
  );
}

// TODO Hard code u values to train data.  No need to calculate.
const calculateStationUs = (
  curve: THREE.CatmullRomCurve3,
  stations: Extract<Positions, { type: "station" }>[]
) => {
  const sampleCount = Math.max(200, stations.length * 50);
  const samples = curve.getPoints(sampleCount);
  const cumLengths: number[] = new Array(samples.length).fill(0);
  for (let i = 1; i < samples.length; i++) {
    cumLengths[i] = cumLengths[i - 1] + samples[i].distanceTo(samples[i - 1]);
  }
  const total = cumLengths[cumLengths.length - 1] || 1;

  const stationUs = stations.map((s) => {
    const stationVec = new THREE.Vector3(s.x, s.y, s.z);
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

export function buildCurveData(positions: Positions[]) {
  const points = positions.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(points);

  // use arc-length based u values
  const stations = positions.filter((p) => p.type === "station") as Extract<
    Positions,
    { type: "station" }
  >[];
  const stationUs = calculateStationUs(curve, stations);

  return { curve, stationUs };
}
