import { normaliseName } from "../../../App/station.name.normalise";
import type { StationWithUAndT } from "../../../App/station.types";
import type { TrainRecord } from "../../../domain/train";
import { findPreviousSubsectionAndStationDetails } from "../train.logic";
import type { SubsectionRuntime } from "../train.types";
import type { CatmullRomCurve3 } from "three";

// Helper to create a StationWithUAndT
function createStation(label: string, u: number): StationWithUAndT {
  return {
    label,
    normalisedLabel: normaliseName(label),
    u,
    t: 1000,
  };
}

function createSubsection(
  id: string,
  stations: StationWithUAndT[],
): SubsectionRuntime {
  return {
    name: id, // required
    positions: [], // required, can be empty for tests
    type: "outbound",
    curveData: {
      curve: {} as CatmullRomCurve3, // mock
      stationUs: stations,
    },
    stationMatcher: (name: string) =>
      stations.find((s) => s.normalisedLabel === name.toLowerCase()),
  };
}

// Helper to create a TrainRecord
function createTrainRecord(stationName: string, id = "train1"): TrainRecord {
  return {
    id,
    destinationName: "",
    direction: undefined,
    expectedArrival: 1000,
    lineId: "line1",
    stationName,
    timeCreate: 1000,
    timeEdit: 1000,
    timeToLive: 1000,
    timeToStation: 1000,
    vehicleId: "vehicle1",
  };
}

describe("findPreviousSubsectionAndStationDetails", () => {
  it("returns undefined if trainTimetable is empty", () => {
    const result = findPreviousSubsectionAndStationDetails({
      subsections: [],
      trainTimetable: [],
    });
    expect(result).toBeUndefined();
  });

  // If train is on subsection before on initialise, the logic would state that the train is on the
  // second subsection:
  // 1          2
  // o----x---o/o-----o
  // We have a clause to call previousSubsectionAndStationDetails.
  // This will find the previous subsection (if it exists) and correct the dotState.
  it("returns correct subsection for train which is approaching subsection on startup", () => {
    const stationA = createStation("A", 0);
    const stationB = createStation("B", 0.2);
    const stationC = createStation("C", 0.3);
    const subsection1 = createSubsection("sub1", [
      stationA,
      stationB,
      stationC,
    ]);

    const station1 = createStation("Y", 0.5);
    const station2 = createStation("Z", 0.75);
    const station3 = createStation("A", 1);
    const subsectionA = createSubsection("subA", [
      station1,
      station2,
      station3,
    ]);

    const trainTimetable = [createTrainRecord("A"), createTrainRecord("B")];

    const result = findPreviousSubsectionAndStationDetails({
      subsections: [subsection1, subsectionA],
      trainTimetable,
    });

    expect(result).toBeDefined();
    expect(result?.destination1).toEqual(station3);
    expect(result?.destination1Id).toEqual(trainTimetable[0].id);
    expect(result?.subsection).toEqual(subsectionA);
    expect(result?.destination1.u).toEqual(1);
    expect(result?.destination1.t).toEqual(1000);
  });

  it("returns undefined if station not found in either subsection", () => {
    const stationA = createStation("A", 0);
    const stationB = createStation("B", 0.2);
    const stationC = createStation("C", 0.3);
    const subsection1 = createSubsection("sub1", [
      stationA,
      stationB,
      stationC,
    ]);

    const station1 = createStation("Y", 0.5);
    const station2 = createStation("Z", 0.75);
    const station3 = createStation("A", 1);
    const subsectionA = createSubsection("subA", [
      station1,
      station2,
      station3,
    ]);

    const trainTimetable = [
      createTrainRecord("Station Not Here"),
      createTrainRecord("Station Not Here"),
    ];

    const result = findPreviousSubsectionAndStationDetails({
      subsections: [subsection1, subsectionA],
      trainTimetable,
    });

    expect(result).toBeUndefined();
  });
});
