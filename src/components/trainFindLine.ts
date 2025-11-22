import type { Line, Subsection } from "./trainLines";

export default function findLineForTrain(
  line: Line,
  currentStation: string, // API variable: stationName
  endOfLineStation: string // API variable: destinationName
): Subsection | null {
  // TODO Does null get dropped once all lines are added
  for (const subsection of line.subsections) {
    const stationNames = subsection.stations.map((s) => s.name);

    // TODO Improve search pattern?
    currentStation = currentStation.replace(" Rail Station", "");
    endOfLineStation = endOfLineStation.replace(" Rail Station", "");

    const currentIndex = stationNames.indexOf(currentStation);
    const endIndex = stationNames.indexOf(endOfLineStation);

    // TODO Check the <
    if (currentIndex > -1 && endIndex > -1 && currentIndex < endIndex) {
      console.log(subsection.name);
      return subsection;
    }
  }
  return null;
}
