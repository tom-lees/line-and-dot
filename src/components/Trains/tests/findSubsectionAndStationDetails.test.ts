import { normaliseName } from "../../../App/station.name.normalise";
import type { StationWithUAndT } from "../../../App/station.types";
import type { TrainRecord } from "../../../domain/train";
import { findSubsectionAndStationDetails } from "../train.logic";
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
    name: `sub-${id}`, // required
    type: "outbound",
    positions: [], // required, can be empty for tests
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

describe("findSubsectionAndStationDetails", () => {
  it("returns undefined if trainTimetable is empty", () => {
    const result = findSubsectionAndStationDetails({
      subsections: [],
      trainTimetable: [],
    });
    expect(result).toBeUndefined();
  });

  it("returns destination1 correctly for 1-item timetable", () => {
    const stationA = createStation("A", 10);
    const subsection = createSubsection("sub1", [stationA]);

    const trainTimetable = [createTrainRecord("A")];

    const result = findSubsectionAndStationDetails({
      subsections: [subsection],
      trainTimetable,
    });

    expect(result).toBeDefined();
    expect(result?.destination1).toEqual(stationA);
    expect(result?.destination1Id).toEqual(trainTimetable[0].id);
    expect(result?.destination2).toBeUndefined();
    expect(result?.subsection).toEqual(subsection);
  });

  it("returns destination1 and destination2 for 2-item timetable", () => {
    const stationA = createStation("A", 10);
    const stationB = createStation("B", 20);
    const subsection = createSubsection("sub1", [stationA, stationB]);

    const trainTimetable = [createTrainRecord("A"), createTrainRecord("B")];

    const result = findSubsectionAndStationDetails({
      subsections: [subsection],
      trainTimetable,
    });

    expect(result).toBeDefined();
    expect(result?.destination1).toEqual(stationA);
    expect(result?.destination2).toEqual(stationB);
    expect(result?.destination1Id).toEqual(trainTimetable[0].id);
    expect(result?.subsection).toEqual(subsection);
    expect(result?.destination1.u).toEqual(10);
    expect(result?.destination1.t).toEqual(1000);
    expect(result?.destination2?.u).toEqual(20);
    expect(result?.destination2?.t).toEqual(1000);
  });

  it("returns undefined if station not found in subsection", () => {
    const stationA = createStation("A", 10);
    const subsection = createSubsection("sub1", [stationA]);

    const trainTimetable = [createTrainRecord("X")]; // X doesn't exist

    const result = findSubsectionAndStationDetails({
      subsections: [subsection],
      trainTimetable,
    });

    expect(result).toBeUndefined();
  });

  it("returns undefined if destination1.u >= destination2.u", () => {
    const stationA = createStation("A", 20);
    const stationB = createStation("B", 10); // lower u than A
    const subsection = createSubsection("sub1", [stationA, stationB]);

    const trainTimetable = [createTrainRecord("A"), createTrainRecord("B")];

    const result = findSubsectionAndStationDetails({
      subsections: [subsection],
      trainTimetable,
    });

    expect(result).toBeUndefined();
  });

  it("returns the first matching subsection if multiple subsections exist", () => {
    const stationA1 = createStation("A", 10);
    const stationB1 = createStation("B", 20);
    const subsection1 = createSubsection("sub1", [stationA1, stationB1]);

    const stationA2 = createStation("A", 10);
    const stationB2 = createStation("B", 30);
    const subsection2 = createSubsection("sub2", [stationA2, stationB2]);

    const trainTimetable = [createTrainRecord("A"), createTrainRecord("B")];

    const result = findSubsectionAndStationDetails({
      subsections: [subsection1, subsection2],
      trainTimetable,
    });

    expect(result?.subsection).toEqual(subsection1); // first matching subsection
  });

  // TODO Issue, train which are inactive at stations will only appear on a single line.
  // This may look strange therefore, we may have to do some jiggery pokery to make this work.
  // (Odds and evens on the time record means selection of [0] or [1]?)
  it("returns the first matching subsection if multiple subsections exist for 1 subsection timetable", () => {
    const stationA1 = createStation("A", 10);
    const stationB1 = createStation("B", 20);
    const subsection1 = createSubsection("sub1", [stationA1, stationB1]);

    const stationA2 = createStation("A", 10);
    const stationB2 = createStation("B", 20);
    const subsection2 = createSubsection("sub2", [stationB2, stationA2]);

    const trainTimetable = [createTrainRecord("A")];

    const result = findSubsectionAndStationDetails({
      subsections: [subsection1, subsection2],
      trainTimetable,
    });

    expect(result?.subsection).toEqual(subsection1); // first matching subsection
  });
});
