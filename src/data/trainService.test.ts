import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trainService } from "../data/trainService";
import type { ApiRecord, TrainRecord } from "../types/train";

// Test 1 – parses API data into TrainRecords and emits them to subscribers
// Test 2 – removes expired train records from the store
// Test 3 – unsubscribe() prevents further updates from reaching the callback
// Test 4 – multiple subscribers all receive updates
// Test 5 – one subscriber throwing an error does not stop others from receiving updates
// Test 6 – trains more than 30 minutes away are ignored/skipped
// Test 7 – start() sets polling interval and stop() clears it

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

// function nextSnapshot(): Promise<Record<string, TrainRecord[]>> {
//   return new Promise((resolve) => {
//     const unsubscribe = trainService.subscribe((snapshot) => {
//       unsubscribe();
//       resolve(snapshot);
//     });
//   });
// }

describe("trainService", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  //
  // Test Harness - Preparing a clean env for each test and
  //                restoring after each test.
  //
  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockApiResponse),
    });
    // Set global fetch to my mock, avoids actual API call in trainService.
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

  it("unsubscribe stops receiving updates", async () => {
    const cb = vi.fn();
    const unsubscribe = trainService.subscribe(cb);

    // First call happens immediately
    expect(cb).toHaveBeenCalledTimes(1);

    unsubscribe();

    // Trigger an update
    await trainService.refresh();

    // Should still be 1
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("notifies multiple subscribers", async () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    trainService.subscribe(cb1);
    trainService.subscribe(cb2);

    await trainService.refresh();

    expect(cb1).toHaveBeenCalledTimes(2); // initial + refresh
    expect(cb2).toHaveBeenCalledTimes(2);
  });

  it("continues notifying other subscribers even if one throws", async () => {
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();

    trainService.subscribe(bad);
    trainService.subscribe(good);

    await trainService.refresh();

    // bad subscriber called but throws
    expect(bad).toHaveBeenCalled();

    // good subscriber still gets called
    expect(good).toHaveBeenCalled();
  });

  it("skips trains more than 30 minutes away", async () => {
    const farRecord = {
      ...mockApiResponse[0],
      vehicleId: "veh-far",
      expectedArrival: new Date(Date.now() + 31 * 60 * 1000).toISOString(),
    };

    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve([farRecord]),
    });

    const snapshotPromise = new Promise<Record<string, TrainRecord[]>>(
      (resolve) => {
        trainService.subscribe((snapshot) => {
          resolve(snapshot);
        });
      }
    );

    trainService.refresh();
    const snapshot = await snapshotPromise;

    expect(snapshot["veh-far"]).toBeUndefined();
  });

  it("start sets interval and stop clears it", () => {
    vi.useFakeTimers();

    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    trainService.start();

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    trainService.stop();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  //TODO Do not rely on AI
  // it("updates train delayed to more than 30 minutes away", async () => {
  //   vi.useFakeTimers();
  //   vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

  //   const vehicleId = "veh-close-then-far";

  //   const closeRecord: ApiRecord = {
  //     ...mockApiResponse[0],
  //     vehicleId,
  //     expectedArrival: "2024-01-01T00:10:00.000Z",
  //   };

  //   fetchMock.mockResolvedValueOnce({
  //     json: () => Promise.resolve([closeRecord]),
  //   });

  //   trainService.refresh();
  //   const snapshot1 = await nextSnapshot();

  //   expect(snapshot1[vehicleId]).toBeDefined();
  //   expect(snapshot1[vehicleId][0].expectedArrival).toBe(
  //     "2024-01-01T00:10:00.000Z"
  //   );

  //   const farRecord: ApiRecord = {
  //     ...closeRecord,
  //     expectedArrival: "2024-01-01T00:31:00.000Z",
  //   };

  //   fetchMock.mockResolvedValueOnce({
  //     json: () => Promise.resolve([farRecord]),
  //   });

  //   trainService.refresh();
  //   const snapshot2 = await nextSnapshot();

  //   const updated = snapshot2[vehicleId][0];

  //   expect(updated.expectedArrival).toBe("2024-01-01T00:31:00.000Z");
  //   expect(updated.timeCreate).toBe(snapshot1[vehicleId][0].timeCreate);
  // });
});

import {} from "./trainService";
