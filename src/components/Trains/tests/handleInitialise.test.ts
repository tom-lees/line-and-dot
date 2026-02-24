import { describe, it, expect } from "vitest";
import { handleInitialise } from "../train.logic";
import type { SubsectionRuntime } from "../train.types";
import type { CatmullRomCurve3 } from "three";
import type { StationWithUAndT } from "../../../utils";

const mockSubsection: SubsectionRuntime = {
  name: "mock",
  positions: [{ type: "track", x: 0, y: 0, z: 0 }],
  curveData: {
    curve: {} as CatmullRomCurve3,
    stationUs: [],
  },
  stationMatcher: () => undefined,
};

const mockDestination1Id = "mockId";

describe("handleInitialise", () => {
  it("returns idle state when train is at station", () => {
    const now = 1000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 0,
      u: 0.1,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.2,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      destination2,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.uEnd).toBe(destination2.u);
    expect(result.tStart).toBe(destination1.t);
    expect(result.tEnd).toBe(destination2.t);
  });

  it("2 Records; start of line; train is at station; destination1t is now; should be idle", () => {
    const now = 1000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.1,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      destination2,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(destination2.u);
    expect(result.tEnd).toBe(destination2.t);
  });

  it("2 Records; start of line; train is at station; destination1t is in future; should be idle", () => {
    const now = 0;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.1,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      destination2,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(destination2.u);
    expect(result.tEnd).toBe(destination2.t);
  });

  it("2 Records; start of line; train timetable record persists after it should have left station; should be idle", () => {
    const now = 1000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 0,
      u: 0,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.1,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      destination2,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(destination2.u);
    expect(result.tEnd).toBe(destination2.t);
  });

  it("2 Records; midpoint of line; train is approaching station; destination1t is in future; should be moving", () => {
    const now = 0;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.6,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      destination2,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("moving");
    expect(result.uStart).toBeLessThan(destination1.u);
    expect(result.tStart).toBe(now);
    expect(result.uEnd).toBe(destination1.u);
    expect(result.tEnd).toBe(destination1.t);
  });

  it("2 Records; midpoint of line; train is at station; destination1t is in now; should be idle", () => {
    const now = 1000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.6,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      destination2,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(destination2.u);
    expect(result.tEnd).toBe(destination2.t);
  });

  it("2 Records; midpoint of line; train is at station; destination1t is in past; should be idle", () => {
    const now = 2000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 3000,
      u: 0.6,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      destination2,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(destination2.u);
    expect(result.tEnd).toBe(destination2.t);
  });

  it("1 Record; start of line; train is at station; destination1t is in future; should be idle", () => {
    const now = 0;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });

  it("1 Record; start of line; train is at station; destination1t is now; should be idle", () => {
    const now = 1000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });

  it("1 Record; start of line; train is at station; destination1t is in past; should be idle", () => {
    const now = 1000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });

  it("1 Record; midpoint on line; train is approaching station; destination1t is in future; should be moving", () => {
    const now = 0;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("moving");
    expect(result.uStart).toBeLessThan(destination1.u);
    expect(result.tStart).toBe(now);
    expect(result.uEnd).toBe(destination1.u);
    expect(result.tEnd).toBe(destination1.t);
  });

  it("1 Record; midpoint on line; train is at station; destination1t is now; should be idle", () => {
    const now = 1000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });

  it("1 Record; midpoint on line; train is at station; destination1t is in past; should be idle", () => {
    const now = 2000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });

  it("1 Record; end of line; train is approaching station; should be moving", () => {
    const now = 0;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.99,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("moving");
    expect(result.uStart).toBeLessThan(destination1.u);
    expect(result.tStart).toBe(now);
    expect(result.uEnd).toBe(destination1.u);
    expect(result.tEnd).toBe(destination1.t);
  });

  it("1 Record; end of line; train has reached station; should be idle", () => {
    const now = 1000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.99,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });

  it("1 Record; end of line; train reached station in the past; should be idle", () => {
    const now = 2000;

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.99,
    };

    const result = handleInitialise({
      destination1,
      destination1Id: mockDestination1Id,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1.u);
    expect(result.tStart).toBe(destination1.t);
  });
});
