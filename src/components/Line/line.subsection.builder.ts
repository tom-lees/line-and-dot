import * as THREE from "three";
import type { Positions } from "../../domain/lines";
import { normaliseName } from "../../App/station.name.normalise";

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
    normalisedLabel: normaliseName(s.label),
  }));

  return { curve, stationUs };
}
