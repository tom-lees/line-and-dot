import Fuse from "fuse.js";
import { normaliseName } from "./station.name.normalise";
import type { StationWithU } from "./station.types";

export const createStationMatcher = (stations: StationWithU[]) => {
  //TODO .test.ts
  const fuse = new Fuse(stations, {
    getFn: (obj, path) =>
      normaliseName(obj[path as keyof StationWithU] as string),
    ignoreLocation: true,
    includeScore: true,
    keys: ["normalisedLabel"],
    threshold: 0.3,
  });

  return (stationName: string): StationWithU | undefined => {
    const exactMatch = stations.find(
      (s) => s.normalisedLabel === normaliseName(stationName),
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
