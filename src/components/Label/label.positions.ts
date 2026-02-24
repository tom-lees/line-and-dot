import type { StationLabelPositions } from "./label.types";
import type { Network } from "../../domain/lines";

type Accumulator = {
  sumX: number;
  sumY: number;
  sumZ: number;
  count: number;
};

export function averageStationPositions(
  network: Network,
): StationLabelPositions[] {
  const map = new Map<string, Accumulator>();

  Object.values(network).forEach((line) => {
    line.subsections.forEach((subsection) => {
      subsection.positions.forEach((pos) => {
        if (pos.type !== "station") return;

        const existing = map.get(pos.name);

        if (!existing) {
          map.set(pos.name, {
            sumX: pos.x,
            sumY: pos.y,
            sumZ: pos.z,
            count: 1,
          });
        return
        } 
        existing.sumX += pos.x;
        existing.sumY += pos.y;
        existing.sumZ += pos.z;
        existing.count += 1;
      });
    });
  });

  return Array.from(map.entries()).map(([name, data]) => ({
    name,
    x: data.sumX / data.count,
    y: data.sumY / data.count,
    z: data.sumZ / data.count,
  }));
}
