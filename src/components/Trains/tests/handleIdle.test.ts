import { describe, it, expect } from "vitest";
import { handleIdle } from "../trainLogic";
import type { IdleTrainState, SubsectionRuntime } from "../trainTypes";
import type { CatmullRomCurve3 } from "three";
import type { StationWithUAndT } from "../../../utils";

const mockDestination1Id = "1DestinationId";
const mockDestination1IdChanged = "1DestinationIdMoved";
const mockSubsection: SubsectionRuntime = {
  name: "mock1",
  positions: [{ type: "track", x: 0, y: 0, z: 0 }],
  curveData: {
    curve: {} as CatmullRomCurve3,
    stationUs: [],
  },
  stationMatcher: () => undefined,
};
const mockSubsectionChanged: SubsectionRuntime = {
  name: "mock2",
  positions: [{ type: "track", x: 0, y: 0, z: 0 }],
  curveData: {
    curve: {} as CatmullRomCurve3,
    stationUs: [],
  },
  stationMatcher: () => undefined,
};
const mockStateIdleDestination1: IdleTrainState = {
  type: "idle",
  id: mockDestination1Id,
  subsection: mockSubsection,
  tStart: 0,
  uStart: 0,
};

const mockStateIdleDestination1And2: IdleTrainState = {
  type: "idle",
  id: mockDestination1Id,
  subsection: mockSubsection,
  tEnd: 1000,
  tStart: 0,
  uEnd: 0.5,
  uStart: 0,
};

describe("handleIdle", () => {
  it("1 record (destination 1) returns input (idle) state when destination1 details have not changed", () => {
    const now = 0;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 0,
      u: 0,
    };

    const result = handleIdle({
      destination1,
      destination1Id: mockDestination1Id,
      now,
      state: mockStateIdleDestination1,
      subsection: mockSubsection,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });

  it("1 record (destination 1) returns new (idle) state, with updated values when idle (time) parameters have updated", () => {
    const now = 0;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0,
    };

    const result = handleIdle({
      destination1,
      destination1Id: mockDestination1Id,
      now,
      state: mockStateIdleDestination1,
      subsection: mockSubsection,
    });

    expect(result.id).toBe(mockDestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });

  // TODO Needs more thought.  Teleports the train if the single timetable record changes station (abnormal behaviour)
  it("1 record (destination 1) returns new (idle) state, with updated values when moving (position (u) or subsection) parameters have updated", () => {
    const now = 0;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };

    const result = handleIdle({
      destination1,
      destination1Id: mockDestination1IdChanged,
      now,
      state: mockStateIdleDestination1,
      subsection: mockSubsectionChanged,
    });

    expect(result.id).toBe(mockDestination1IdChanged);
    expect(result.subsection).toBe(mockSubsectionChanged);
    expect(result.tStart).toBe(destination1.t);
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
  });

  //return idle  - when northing changes
  //return idle  - data change, same id and same subsection
  //return idle  - data change, same id different subsection
  //return idle  - complete timetable dropout (parent will eventually del the component)
  //return moving - id change and same subsection.  Start the next u values
  //  moving checks so that u is never over 1
  //

  it("2 records (destination 1 & destination 2) return (idle) state, when destination details have not changed", () => {
    const now = 0;

    const mockDestination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 0,
      u: 0,
    };
    const mockDestination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };

    const result = handleIdle({
      destination1: mockDestination1,
      destination1Id: mockDestination1Id,
      destination2: mockDestination2,
      now,
      state: mockStateIdleDestination1And2,
      subsection: mockSubsection,
    });

    expect(result.id).toBe(mockDestination1Id);
    expect(result.type).toBe("idle");
    expect(result.tEnd).toBe(mockDestination2.t);
    expect(result.tStart).toBe(mockDestination1.t);
    expect(result.uEnd).toBe(mockDestination2.u);
    expect(result.uStart).toBe(mockDestination1.u);

    expect(result.id).toBe(mockStateIdleDestination1And2.id);
    expect(result.type).toBe("idle");
    expect(result.tEnd).toBe(mockStateIdleDestination1And2.tEnd);
    expect(result.tStart).toBe(mockStateIdleDestination1And2.tStart);
    expect(result.uEnd).toBe(mockStateIdleDestination1And2.uEnd);
    expect(result.uStart).toBe(mockStateIdleDestination1And2.uStart);
  });

  it("2 records (destination 1 & destination 2) return (idle) state, with updated values when idle (time) parameters have updated", () => {
    const now = 0;

    const mockDestination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 500,
      u: 0,
    };
    const mockDestination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1500,
      u: 0.5,
    };

    const result = handleIdle({
      destination1: mockDestination1,
      destination1Id: mockDestination1Id,
      destination2: mockDestination2,
      now,
      state: mockStateIdleDestination1And2,
      subsection: mockSubsection,
    });

    expect(result.id).toBe(mockDestination1Id);
    expect(result.id).toBe(mockStateIdleDestination1And2.id);
    expect(result.type).toBe("idle");
    expect(result.tEnd).toBe(mockDestination2.t);
    expect(result.tStart).toBe(mockDestination1.t);
    expect(result.uEnd).toBe(mockDestination2.u);
    expect(result.uStart).toBe(mockDestination1.u);
  });

  it("2 records (destination 1 & destination 2) return (moving) state, with updated values when id parameters have updated", () => {
    const now = 0;
    const mockDestination1Id = "timetable[1]=>timetable[0]";

    const mockDestination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.25,
    };
    const mockDestination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.5,
    };

    const result = handleIdle({
      destination1: mockDestination1,
      destination1Id: mockDestination1Id,
      destination2: mockDestination2,
      now,
      state: mockStateIdleDestination1And2,
      subsection: mockSubsection,
    });

    expect(result.id).toBe(mockDestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("moving");
    expect(result.tEnd).toBe(mockDestination1.t);
    expect(result.tStart).toBe(now);
    expect(result.uEnd).toBe(mockDestination1.u);
    expect(result.uStart).toBe(mockStateIdleDestination1And2.uStart);
  });

  it("2 records (destination 1 & destination 2) return (moving) state, with updated values when id and subsection parameters have updated (unexpected behaviour)", () => {
    const now = 0;
    const mockDestination1Id = "timetable[1]=>timetable[0]";

    const mockDestination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };
    const mockDestination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 1,
    };

    const result = handleIdle({
      destination1: mockDestination1,
      destination1Id: mockDestination1Id,
      destination2: mockDestination2,
      now,
      state: mockStateIdleDestination1And2,
      subsection: mockSubsectionChanged,
    });

    expect(result.id).toBe(mockDestination1Id);
    expect(result.subsection).toBe(mockSubsectionChanged);
    expect(result.type).toBe("moving");
    expect(result.tEnd).toBe(mockDestination1.t);
    expect(result.tStart).toBe(now);
    expect(result.uEnd).toBe(mockDestination1.u);
    expect(result.uStart).toBe(0);
  });

  it("2 records (destination 1 & destination 2) return (idle) state, when only subsection has changed mid-subsection", () => {
    const now = 0;

    const mockDestination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.25,
    };
    const mockDestination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.5,
    };

    const result = handleIdle({
      destination1: mockDestination1,
      destination1Id: mockDestination1Id,
      destination2: mockDestination2,
      now,
      state: mockStateIdleDestination1And2,
      subsection: mockSubsectionChanged,
    });

    expect(result.id).toBe(mockDestination1Id);
    expect(result.subsection).toBe(mockSubsectionChanged);
    expect(result.type).toBe("idle");
    expect(result.tStart).toBe(mockDestination1.t);
    expect(result.uStart).toBe(mockDestination1.u);
  });

  // TODO Metropolitian line and Elizabeth line issue.  Will do once model is up so can visualise.
  // May be able to plan lines according to stop patterns.
  // ... (would like something more robust)
  // it("2 records (destination 1 & destination 3), train skips station where segment change should have occured", () => {
  //   //          |
  //   // ---d1---d2---d3---
  //   //          |

  //   const now = 0;

  //   const mockDestination1: StationWithUAndT = {
  //     label: "",
  //     normalisedLabel: "",
  //     t: 1000,
  //     u: 0.75,
  //   };
  //   const mockDestination3: StationWithUAndT = {
  //     label: "",
  //     normalisedLabel: "",
  //     t: 3000,
  //     u: 0.25,
  //   };

  //   const result = handleIdle({
  //     destination1: mockDestination1,
  //     destination1Id: mockDestination1Id,
  //     destination2: mockDestination3,
  //     now,
  //     state: mockStateIdleDestination1And2,
  //     subsection: mockSubsectionChanged,
  //   });

  //   expect(result.id).toBe(mockDestination1Id);
  //   expect(result.subsection).toBe(mockSubsectionChanged);
  //   expect(result.type).toBe("idle");
  //   expect(result.tStart).toBe(mockDestination1.t);
  //   expect(result.uStart).toBe(mockDestination1.u);
  // });
});
