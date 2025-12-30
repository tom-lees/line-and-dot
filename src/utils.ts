import * as THREE from "three";
import type { Station } from "./components/trainLines";

export function buildCurveData(
  stations: Station[],
  screenWidth: number,
  screenHeight: number
) {
  const points = stations.map((s) => new THREE.Vector3(s.x, s.y, 0));
  const curve = new THREE.CatmullRomCurve3(points);

  // chord lengths → normalized u
  const distances: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    distances[i] = distances[i - 1] + points[i].distanceTo(points[i - 1]);
  }
  const total = distances[distances.length - 1] || 1;
  const stationUs = stations.map((s, i) => ({
    label: s.name,
    u: distances[i] / total,
  }));

  // bounds
  const curvePoints = curve.getPoints(200);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  curvePoints.forEach((p) => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });

  const rangeX = Math.max(1, maxX - minX);
  const rangeY = Math.max(1, maxY - minY);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const scale = Math.max(screenWidth / rangeX, screenHeight / rangeY);

  // line positions
  const _array = new Float32Array(curvePoints.length * 3);
  curvePoints.forEach((p, i) => {
    _array[i * 3] = (p.x - midX) * scale;
    _array[i * 3 + 1] = (p.y - midY) * scale;
    _array[i * 3 + 2] = p.z;
  });

  // label positions
  const labelPositions = stationUs.map((s) => {
    const p = curve.getPointAt(s.u);
    const x = (p.x - midX) * scale;
    const y = (p.y - midY) * scale + 10;
    const z = p.z;
    return { label: s.label, position: [x, y, z] as [number, number, number] };
  });

  return { curve, linePoints: _array, labelPositions };
}