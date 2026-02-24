import type { Network } from "../domain/lines";

// TODO This whole ts needs a comb over.
export function normaliseNetwork(network: Network): Network {
  // Flatten all stations to compute group min/max
  const allPositions = Object.values(network)
    .filter((line) => line.name !== "Elizabeth")
    .flatMap((line) =>
      line.subsections.flatMap((subsection) => subsection.positions),
    );
  const allPositionsX = allPositions.map((p) => p.x);
  const allPositionsY = allPositions.map((p) => p.y);
  const allPositionsZ = allPositions.map((p) => p.z);

  const minX = Math.min(...allPositionsX);
  const maxX = Math.max(...allPositionsX);

  const minY = Math.min(...allPositionsY);
  const maxY = Math.max(...allPositionsY);

  const minZ = Math.min(...allPositionsZ);
  const maxZ = Math.max(...allPositionsZ);

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const midZ = (minZ + maxZ) / 2;

  const rangeX = Math.max(1, maxX - minX);
  const scale = 1000 / rangeX; // only width-based scaling

  return Object.fromEntries(
    Object.entries(network).map(([key, line]) => [
      key,
      {
        ...line,
        subsections: line.subsections.map((subsection) => ({
          ...subsection,
          positions: subsection.positions.map((s) => ({
            ...s,
            x: (s.x - midX) * scale,
            y: (s.y - midY) * scale,
            z: (s.z - midZ) 
          })),
        })),
      },
    ]),
  );
}
