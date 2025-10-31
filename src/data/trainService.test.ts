import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trainService } from "../data/trainService";
import type { ApiRecord, TrainRecord } from "../types/train";

const mockApiResponse: ApiRecord[] = [
  {
    id: "train-001",
    destinationName: "Reading",
    direction: "outbound",
    expectedArrival: new Date(Date.now() + 60000).toISOString(), // 1 min from now
    lineId: "elizabeth",
    stationName: "Canary Wharf",
    timeToLive: new Date(Date.now() + 15000).toISOString(), // 15 sec from now
    timeToStation: 15,
    vehicleId: "veh-001",
  },
];

describe("trainService", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockApiResponse),
    });
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    trainService.stop();
    vi.restoreAllMocks();
  });

  it("parses and emits TrainRecords from API", async () => {
    const snapshotPromise = new Promise<Record<string, TrainRecord[]>>(
      (resolve) => {
        trainService.subscribe((snapshot) => {
          if (Object.keys(snapshot).length > 0) resolve(snapshot);
        });
      }
    );

    trainService.refresh();
    const snapshot = await snapshotPromise;

    expect(Object.keys(snapshot)).toContain("veh-001");
    const records = snapshot["veh-001"];
    expect(records).toHaveLength(1);

    const train = records[0];
    expect(train.id).toBe("train-001");
    expect(train.stationName).toBe("Canary Wharf");
    expect(train.destinationName).toBe("Reading");
    expect(train.lineId).toBe("elizabeth");
    expect(train.timeToStation).toBeGreaterThanOrEqual(14); // allow 1s drift
    expect(train.timeCreate).toBe(train.timeEdit);
  });

  it("cleans up expired records", async () => {
    const expiredRecord: ApiRecord = {
      ...mockApiResponse[0],
      id: "train-002",
      vehicleId: "veh-002",
      expectedArrival: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 min ago
      timeToLive: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
      timeToStation: -300,
    };

    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve([expiredRecord]),
    });

    const snapshotPromise = new Promise<Record<string, TrainRecord[]>>(
      (resolve) => {
        trainService.subscribe((snapshot) => {
          if (Object.keys(snapshot).length > 0) resolve(snapshot);
        });
      }
    );

    trainService.refresh();
    const snapshot = await snapshotPromise;

    expect(snapshot["veh-002"]).toBeUndefined();
  });
});

import {} from "./trainService";
