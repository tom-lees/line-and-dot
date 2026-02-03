import { describe, it, expect } from "vitest";
import { handleInitialise } from "./trainLogic";
import type { SubsectionRuntime } from "./trainTypes";
import type { CatmullRomCurve3 } from "three";

const mockSubsection: SubsectionRuntime = {
  name: "mock",
  positions: [{ type: "track", x: 0, y: 0, z: 0 }],
  curveData: {
    curve: {} as CatmullRomCurve3,
    stationUs: [],
  },
  stationMatcher: () => undefined,
};

describe("handleInitialise", () => {
  it("returns moving state when train is en route", () => {
    const now = 0;
    const destination1u = 0.1;
    const destination1t = 1000;
    const destination2u = 0.2;
    const destination2t = 2000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      destination2u,
      destination2t,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("moving");
    expect(result.uStart).toBeLessThan(destination1u);
    expect(result.uEnd).toBe(destination1u);
    expect(result.tStart).toBe(now);
    expect(result.tEnd).toBe(destination1t);
  });

  it("returns idle state when train is at station", () => {
    const now = 1000;
    const destination1u = 0.1;
    const destination1t = 0;
    const destination2u = 0.2;
    const destination2t = 2000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      destination2u,
      destination2t,
      subsection: mockSubsection,
      now,
    });

    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.uEnd).toBe(destination2u);
    expect(result.tStart).toBe(destination1t);
    expect(result.tEnd).toBe(destination2t);
  });

  it("2 Records; start of line; train is at station; destination1t is now; should be idle", () => {
    const now = 1000;
    const destination1u = 0;
    const destination1t = 1000;
    const destination2u = 0.1;
    const destination2t = 2000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      destination2u,
      destination2t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
    expect(result.uEnd).toBe(destination2u);
    expect(result.tEnd).toBe(destination2t);
  });

  it("2 Records; start of line; train is at station; destination1t is in future; should be idle", () => {
    const now = 0;
    const destination1u = 0;
    const destination1t = 1000;
    const destination2u = 0.1;
    const destination2t = 2000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      destination2u,
      destination2t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
    expect(result.uEnd).toBe(destination2u);
    expect(result.tEnd).toBe(destination2t);
  });

  it("2 Records; start of line; train timetable record persists after it should have left station; should be idle", () => {
    const now = 1000;
    const destination1u = 0;
    const destination1t = 0;
    const destination2u = 0.1;
    const destination2t = 2000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      destination2u,
      destination2t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
    expect(result.uEnd).toBe(destination2u);
    expect(result.tEnd).toBe(destination2t);
  });

  it("2 Records; midpoint of line; train is approaching station; destination1t is in future; should be moving", () => {
    const now = 0;
    const destination1u = 0.5;
    const destination1t = 1000;
    const destination2u = 0.6;
    const destination2t = 2000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      destination2u,
      destination2t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("moving");
    expect(result.uStart).toBeLessThan(destination1u);
    expect(result.tStart).toBe(now);
    expect(result.uEnd).toBe(destination1u);
    expect(result.tEnd).toBe(destination1t);
  });

  it("2 Records; midpoint of line; train is at station; destination1t is in now; should be idle", () => {
    const now = 1000;
    const destination1u = 0.5;
    const destination1t = 1000;
    const destination2u = 0.6;
    const destination2t = 2000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      destination2u,
      destination2t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
    expect(result.uEnd).toBe(destination2u);
    expect(result.tEnd).toBe(destination2t);
  });

  it("2 Records; midpoint of line; train is at station; destination1t is in past; should be idle", () => {
    const now = 2000;
    const destination1u = 0.5;
    const destination1t = 1000;
    const destination2u = 0.6;
    const destination2t = 3000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      destination2u,
      destination2t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
    expect(result.uEnd).toBe(destination2u);
    expect(result.tEnd).toBe(destination2t);
  });

  it("1 Record; start of line; train is at station; destination1t is in future; should be idle", () => {
    const now = 0;
    const destination1u = 0;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
  });

  it("1 Record; start of line; train is at station; destination1t is now; should be idle", () => {
    const now = 1000;
    const destination1u = 0;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
  });

  it("1 Record; start of line; train is at station; destination1t is in past; should be idle", () => {
    const now = 1000;
    const destination1u = 0;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
  });

  it("1 Record; midpoint on line; train is approaching station; destination1t is in future; should be moving", () => {
    const now = 0;
    const destination1u = 0.5;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("moving");
    expect(result.uStart).toBeLessThan(destination1u);
    expect(result.tStart).toBe(now);
    expect(result.uEnd).toBe(destination1u);
    expect(result.tEnd).toBe(destination1t);
  });

  it("1 Record; midpoint on line; train is at station; destination1t is now; should be idle", () => {
    const now = 1000;
    const destination1u = 0.5;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
  });

  it("1 Record; midpoint on line; train is at station; destination1t is in past; should be idle", () => {
    const now = 2000;
    const destination1u = 0.5;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
  });

  it("1 Record; end of line; train is approaching station; should be moving", () => {
    const now = 0;
    const destination1u = 0.99;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("moving");
    expect(result.uStart).toBeLessThan(destination1u);
    expect(result.tStart).toBe(now);
    expect(result.uEnd).toBe(destination1u);
    expect(result.tEnd).toBe(destination1t);
  });

  it("1 Record; end of line; train has reached station; should be idle", () => {
    const now = 1000;
    const destination1u = 0.99;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
  });

  it("1 Record; end of line; train reached station in the past; should be idle", () => {
    const now = 2000;
    const destination1u = 0.99;
    const destination1t = 1000;

    const result = handleInitialise({
      destination1u,
      destination1t,
      subsection: mockSubsection,
      now,
    });
    expect(result.type).toBe("idle");
    expect(result.uStart).toBe(destination1u);
    expect(result.tStart).toBe(destination1t);
  });
});
