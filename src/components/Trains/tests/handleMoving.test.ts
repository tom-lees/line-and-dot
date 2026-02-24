import { describe, it, expect } from "vitest";
import { handleMoving } from "../train.logic";
import type { MovingTrainState, SubsectionRuntime } from "../train.types";
import type { CatmullRomCurve3 } from "three";

const mockdestination1Id = "1DestinationId";
const mockSubsection: SubsectionRuntime = {
  name: "mock1",
  positions: [{ type: "track", x: 0, y: 0, z: 0 }],
  type:'inbound',
  curveData: {
    curve: {} as CatmullRomCurve3,
    stationUs: [],
  },
  stationMatcher: () => undefined,
};
const mockStateMovingDestination1: MovingTrainState = {
  type: "moving",
  id: mockdestination1Id,
  subsection: mockSubsection,
  tEnd: 1000,
  tStart: 0,
  uEnd: 0.5,
  uStart: 0,
};
const now = 500;

describe("handleMoving", () => {
  it("destination1 time change; train is delayed", () => {
    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0,
    };

    const mockUCurrent = 0.1;

    const result = handleMoving({
      destination1,
      destination1Id: mockdestination1Id,
      now,
      state: mockStateMovingDestination1,
      subsection: mockSubsection,
      uCurrent: mockUCurrent,
    });

    expect(result.id).toBe(mockdestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("moving");
    expect(result.tEnd).toBe(destination1.t);
    expect(result.tEnd).toBe(mockStateMovingDestination1.tEnd);
    expect(result.tStart).toBe(mockStateMovingDestination1.tStart);
    expect(result.uEnd).toBe(mockStateMovingDestination1.uEnd);
    expect(result.uStart).toBe(mockStateMovingDestination1.uStart);
  });

  it("1 record (destination 1) train has reached destination (uEnd)", () => {
    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };

    const mockUCurrent = 0.5;

    const result = handleMoving({
      destination1,
      destination1Id: mockdestination1Id,
      now,
      state: mockStateMovingDestination1,
      subsection: mockSubsection,
      uCurrent: mockUCurrent,
    });

    expect(result.id).toBe(mockdestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("idle");
    expect(result.tEnd).toBe(undefined);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(undefined);
    expect(result.uStart).toBe(destination1.u);
  });

  it("1 record (destination 1) train has NOT reached destination (uEnd)", () => {
    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.5,
    };

    const mockUCurrent = 0.4;

    const result = handleMoving({
      destination1,
      destination1Id: mockdestination1Id,
      now,
      state: mockStateMovingDestination1,
      subsection: mockSubsection,
      uCurrent: mockUCurrent,
    });

    expect(result.id).toBe(mockdestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("moving");
    expect(result.tEnd).toBe(mockStateMovingDestination1.tEnd);
    expect(result.tStart).toBe(mockStateMovingDestination1.tStart);
    expect(result.uEnd).toBe(mockStateMovingDestination1.uEnd);
    expect(result.uStart).toBe(mockStateMovingDestination1.uStart);
  });

  it("1 record (destination 1) train has passed destination (uEnd)", () => {
    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 1,
    };

    const mockUCurrent = 0.5;

    const result = handleMoving({
      destination1,
      destination1Id: mockdestination1Id,
      now,
      state: mockStateMovingDestination1,
      subsection: mockSubsection,
      uCurrent: mockUCurrent,
    });

    expect(result.id).toBe(mockdestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("idle");
    expect(result.tEnd).toBe(undefined);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(undefined);
    expect(result.uStart).toBe(destination1.u);
  });

  it("2 records (destination 1 & destination 2) train has reached destination (uEnd)", () => {
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
      u: 0.75,
    };

    const mockUCurrent = 0.5;

    const result = handleMoving({
      destination1,
      destination1Id: mockdestination1Id,
      destination2,
      now,
      state: mockStateMovingDestination1,
      subsection: mockSubsection,
      uCurrent: mockUCurrent,
    });

    expect(result.id).toBe(mockdestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("idle");
    expect(result.tEnd).toBe(destination2.t);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(destination2.u);
    expect(result.uStart).toBe(destination1.u);
  });

  it("2 records (destination 1 & destination 2) train has passed destination (uEnd)", () => {
    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 1000,
      u: 0.6,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.75,
    };

    const mockUCurrent = 0.5;

    const result = handleMoving({
      destination1,
      destination1Id: mockdestination1Id,
      destination2,
      now,
      state: mockStateMovingDestination1,
      subsection: mockSubsection,
      uCurrent: mockUCurrent,
    });

    expect(result.id).toBe(mockdestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("idle");
    expect(result.tEnd).toBe(destination2.t);
    expect(result.tStart).toBe(destination1.t);
    expect(result.uEnd).toBe(destination2.u);
    expect(result.uStart).toBe(destination1.u);
  });

  it("train is delayed (tEnd increases)", () => {
    const orginalStateMockDestination1 = { ...mockStateMovingDestination1 };

    const destination1: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 2000,
      u: 0.5,
    };
    const destination2: StationWithUAndT = {
      label: "",
      normalisedLabel: "",
      t: 3000,
      u: 0.75,
    };

    const mockUCurrent = 0.2;

    const result = handleMoving({
      destination1,
      destination1Id: mockdestination1Id,
      destination2,
      now,
      state: mockStateMovingDestination1,
      subsection: mockSubsection,
      uCurrent: mockUCurrent,
    });

    expect(result.id).toBe(mockdestination1Id);
    expect(result.subsection).toBe(mockSubsection);
    expect(result.type).toBe("moving");
    expect(result.tEnd).toBeGreaterThan(orginalStateMockDestination1.tEnd);
    // expect(result.tStart).toBeLessThan(mockStateMovingDestination1.tStart);
    // expect(result.uEnd).toBe(destination1.u);
    // expect(result.uStart).toBe(destination1.u);
  });
});
