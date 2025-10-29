import { describe, it, expect } from "vitest";
import { parseApiRecord } from "../data/parseApiRecord";
import type { ApiRecord } from "../types/train";

describe("parseApiRecord", () => {
  it("parses API record into TrainRecord with correct timestamps", () => {
    const now = Date.now();

    const apiRecord: ApiRecord = {
      id: "train-001",
      destinationName: "Reading",
      direction: "outbound",
      expectedArrival: new Date(now + 60000).toISOString(), // 1 min from now
      lineId: "elizabeth",
      stationName: "Canary Wharf",
      timeToLive: new Date(now + 15000).toISOString(), // 15 sec from now
      timeToStation: 15,
      vehicleId: "202510298006781",
    };

    const result = parseApiRecord(apiRecord, now);

    expect(result.id).toBe(apiRecord.id);
    expect(result.stationName).toBe(apiRecord.stationName);
    expect(result.expectedArrival).toBe(Date.parse(apiRecord.expectedArrival));
    expect(result.timeToLive).toBe(Date.parse(apiRecord.timeToLive));
    expect(result.timeCreate).toBe(now);
    expect(result.timeEdit).toBe(now);
    expect(result.vehicleId).toBe(apiRecord.vehicleId);

    const expectedTimeToStation = Math.round(
      (Date.parse(apiRecord.timeToLive) - now) / 1000
    );
    expect(result.timeToStation).toBe(expectedTimeToStation);
  });
});
