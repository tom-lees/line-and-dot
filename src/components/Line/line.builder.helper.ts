import * as THREE from "three";
import type { Midline, Positions, Subsection } from "../../domain/lines";

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
  offsetXY: number,
  offsetZ?: number, // For moving overlapping lines, e.g. central/district overlap, we move central up to make it move visible
): Subsection[] {
  return [
    {
      name: `${midline.name} (Inbound)`,
      positions: offsetPositions(
        [...midline.positions].map((p) => ({
          ...p,
          horizontalOffset: p.horizontalOffset
            ? p.horizontalOffset + offsetXY
            : offsetXY,
          verticalOffset:
            p.verticalOffset && offsetZ
              ? -0.5 * p.verticalOffset + offsetZ
              : offsetZ
                ? offsetZ
                : p.verticalOffset
                  ? -0.5 * p.verticalOffset
                  : 0,
        })),
      ),
      type: "inbound",
    },
    {
      name: `${midline.name} (Outbound)`,
      positions: offsetPositions(
        [...midline.positions].reverse().map((p) => ({
          ...p,
          horizontalOffset: p.horizontalOffset
            ? p.horizontalOffset + offsetXY
            : offsetXY,
          verticalOffset:
            p.verticalOffset && offsetZ
              ? 0.5 * p.verticalOffset + offsetZ
              : offsetZ
                ? offsetZ
                : p.verticalOffset
                  ? 0.5 * p.verticalOffset
                  : 0,
        })),
      ),
      type: "outbound",
    },
  ];
}
