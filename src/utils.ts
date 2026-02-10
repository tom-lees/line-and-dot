import * as THREE from "three";
import Fuse from "fuse.js";
import type {
  Midline,
  Network,
  Positions,
  Subsection,
} from "./components/trainLines";

export function offsetPositions(positions: Positions[]): Positions[] {
  return positions.map((p, i) => {
    const prev = positions[i - 1] ?? p;
    const next = positions[i + 1] ?? p;

    const tangent = new THREE.Vector3(
      next.x - prev.x,
      next.y - prev.y,
      next.z - prev.z,
    ).normalize();

    // perpendicular in XY plane
    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0);

    const h = p.horizontalOffset ?? 0;
    const v = p.verticalOffset ?? 0;

    return {
      ...p,
      x: p.x + normal.x * h,
      y: p.y + normal.y * h,
      z: p.z + v,
    };
  });
}

export function buildBidirectionalSubsections(
  midline: Midline,
  offset: number,
): Subsection[] {
  return [
    {
      name: `${midline.name} (Inbound)`,
      positions: offsetPositions(
        [...midline.positions].map((p) => ({ ...p, horizontalOffset: offset })),
      ),
      type: "inbound",
    },
    {
      name: `${midline.name} (Outbound)`,
      positions: offsetPositions(
        [...midline.positions]
          .reverse()
          .map((p) => ({ ...p, horizontalOffset: offset })),
      ),
      type: "outbound",
    },
  ];
}

// TODO This whole ts needs a comb over.
export function normaliseNetwork(
  network: Network,
  screenWidth: number,
): Network {
  // Flatten all stations to compute group min/max
  const allPositions = Object.values(network).flatMap((line) =>
    line.subsections.flatMap((subsection) => subsection.positions),
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
    ]),
  );
}

// TODO Hard code u values to train data.  No need to calculate.
const calculateStationUs = (
  curve: THREE.CatmullRomCurve3,
  stations: Extract<Positions, { type: "station" }>[],
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

export function buildLineData(midline: Midline){}

export function buildSubsectionData(positions: Positions[]) {
  const points = positions.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(points);

  // use arc-length based u values
  const stations = positions.filter((p) => p.type === "station") as Extract<
    Positions,
    { type: "station" }
  >[];

  const stationUs = calculateStationUs(curve, stations).map((s) => ({
    ...s,
    normalisedLabel: normalise(s.label),
  }));

  return { curve, stationUs };
}

export type StationWithU = {
  label: string;
  normalisedLabel: string;
  u: number;
};

export type StationWithUAndT = {
  label: string;
  normalisedLabel: string;
  u: number;
  t: number;
};

export const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/rail station|station/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const createStationMatcher = (stations: StationWithU[]) => {
  //TODO .test.ts
  const fuse = new Fuse(stations, {
    getFn: (obj, path) => normalise(obj[path as keyof StationWithU] as string),
    ignoreLocation: true,
    includeScore: true,
    keys: ["normalisedLabel"],
    threshold: 0.3,
  });

  return (stationName: string): StationWithU | undefined => {
    const exactMatch = stations.find(
      (s) => s.normalisedLabel === normalise(stationName),
    );
    if (exactMatch) return exactMatch;

    const results = fuse.search(stationName);

    if (!results.length) return undefined;
    const bestMatch = results[0];
    const bestMatchNumber = bestMatch.item.label.match(/\d+/)?.[0];
    const queryNumber = stationName.match(/\d+/)?.[0];

    if (queryNumber && bestMatchNumber && queryNumber !== bestMatchNumber)
      return undefined;

    const [best, second] = results;
    if (
      second &&
      best.score !== undefined &&
      second.score !== undefined &&
      best.score > second.score * 0.85
    ) {
      // console.log("Ambiguous match, returning undefined");
      return undefined;
    }
    // console.log("Matched:", best.item.label);
    return best.item;
  };
};
