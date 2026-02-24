import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ApiRecord } from "../../api/tfl.types";
import {
  trainService,
  FILTER_OUT_FUTURE_TRAINS,
  SHORT_EXPIRY,
} from "../train.service";
import { hammersmithCityApiMock } from "./train.service.test.data";
import type { TimetableStore } from "../train.service.types";

// TODO Read through all tests
const now = Date.now();

describe("trainService", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(hammersmithCityApiMock),
    });
    globalThis.fetch = fetchMock;

    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    trainService.stop();
    vi.restoreAllMocks();
  });

  it("parses API data into TrainRecords and emits to subscribers", async () => {
    const snapshotPromise = new Promise<Record<string, TimetableStore>>(
      (resolve) => {
        trainService.subscribe((snapshot) => {
          if (Object.keys(snapshot).length > 0) resolve(snapshot);
        });
      },
    );

    await trainService.refresh();
    const snapshot = await snapshotPromise;

    expect(Object.keys(snapshot)).toContain("267"); // Plaistow
    expect(Object.keys(snapshot)).toContain("272"); // Whitechapel

    const store267 = snapshot["267"];
    expect(store267.timetable[0].stationName).toBe(
      "Plaistow Underground Station",
    );
    expect(store267.timetable[0].destinationName).toBe(
      "Hammersmith (H&C Line) Underground Station",
    );
    expect(store267.lineId).toBe("hammersmith-city");
  });

  it("removes expired train records", async () => {
    const expired: ApiRecord = {
      id: "expired-001",
      vehicleId: "888",
      stationName: "Plaistow Underground Station",
      lineId: "hammersmith-city",
      direction: "inbound",
      expectedArrival: new Date(now - 10 * 60 * 1000).toISOString(),
      timeToStation: -600,
      timeToLive: new Date(now - SHORT_EXPIRY).toISOString(),
      destinationName: "Hammersmith (H&C Line) Underground Station",
    };

    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve([expired]) });

    const snapshotPromise = new Promise<Record<string, TimetableStore>>(
      (resolve) => {
        trainService.subscribe((snapshot) => resolve(snapshot));
      },
    );

    await trainService.refresh();
    const snapshot = await snapshotPromise;

    expect(snapshot["888"]).toBeUndefined();
  });

  it("unsubscribe stops receiving updates", async () => {
    const cb = vi.fn();
    const unsubscribe = trainService.subscribe(cb);

    expect(cb).toHaveBeenCalledTimes(1);

    unsubscribe();
    await trainService.refresh();

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("notifies multiple subscribers", async () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    trainService.subscribe(cb1);
    trainService.subscribe(cb2);

    await trainService.refresh();

    expect(cb1).toHaveBeenCalledTimes(2);
    expect(cb2).toHaveBeenCalledTimes(2);
  });

  it("continues notifying others even if one subscriber throws", async () => {
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();

    trainService.subscribe(bad);
    trainService.subscribe(good);

    await trainService.refresh();

    expect(bad).toHaveBeenCalled();
    expect(good).toHaveBeenCalled();
  });

  it("skips trains more than FILTER_OUT_FUTURE_TRAINS away", async () => {
    const farRecord: ApiRecord = {
      id: "far-away",
      vehicleId: "9999",
      stationName: "Whitechapel Underground Station",
      lineId: "hammersmith-city",
      direction: "outbound",
      expectedArrival: new Date(
        now + FILTER_OUT_FUTURE_TRAINS + 60 * 1000,
      ).toISOString(),
      timeToStation: (FILTER_OUT_FUTURE_TRAINS + 60 * 1000) / 1000,
      timeToLive: new Date(
        now + FILTER_OUT_FUTURE_TRAINS + 60 * 1000,
      ).toISOString(),
      destinationName: "Barking Underground Station",
    };

    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve([farRecord]),
    });

    const snapshotPromise = new Promise<Record<string, TimetableStore>>(
      (resolve) => {
        trainService.subscribe((snapshot) => resolve(snapshot));
      },
    );

    await trainService.refresh();
    const snapshot = await snapshotPromise;

    expect(snapshot["9999"]).toBeUndefined();
  });

  it("start sets interval and stop clears it", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    trainService.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    trainService.stop();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it("maintains timeCreate and updates timeEdit when record changes", async () => {
    const vehicleId = "edit-test-001";
    const now = Date.now();

    const initial: ApiRecord = {
      id: vehicleId,
      vehicleId,
      stationName: "Plaistow Underground Station",
      lineId: "hammersmith-city",
      direction: "inbound",
      expectedArrival: new Date(now + 5000).toISOString(),
      timeToStation: 5000,
      timeToLive: new Date(now + 5000).toISOString(),
      destinationName: "Hammersmith (H&C Line) Underground Station",
    };

    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve([initial]) });
    await trainService.refresh();

    const firstTrain = trainService._debug().store[vehicleId].timetable[0];
    const firstTimeCreate = firstTrain.timeCreate;

    // Advance the fake timer so Date.now() increases
    vi.advanceTimersByTime(1000);

    // Update record (simulate API sending new expectedArrival)
    const updated: ApiRecord = {
      ...initial,
      expectedArrival: new Date(now + 10000).toISOString(),
      timeToStation: 10000,
    };
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve([updated]) });
    await trainService.refresh();

    const updatedTrain = trainService._debug().store[vehicleId].timetable[0];
    expect(updatedTrain.timeCreate).toBe(firstTimeCreate);
    expect(updatedTrain.timeEdit).toBeGreaterThan(firstTimeCreate);
  });

  // TODO Long expiry test
  // it("retains trains with LONG_EXPIRY until TTL passes", async () => {
  //   const vehicleId = "long-expiry-001";
  //   const now = Date.now();

  //   // Train that would normally expire quickly if multiple in timetable
  //   const record = {
  //     id: vehicleId,
  //     vehicleId,
  //     stationName: "Plaistow Underground Station",
  //     lineId: "hammersmith-city",
  //     direction: "inbound",
  //     expectedArrival: now + 5000, // 5s in future
  //     timeToStation: 5000,
  //     timeToLive: now + 5000,
  //     destinationName: "Hammersmith (H&C Line) Underground Station",
  //     timeCreate: now,
  //     timeEdit: now,
  //   };

  //   fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve([record]) });

  //   // Refresh the service (synchronously add the train)
  //   await trainService.refresh();

  //   // Access the store directly instead of async subscribe
  //   const store1 = trainService._debug().store;
  //   expect(store1[vehicleId]).toBeDefined();

  //   // Advance to just before LONG_EXPIRY
  //   vi.advanceTimersByTime(LONG_EXPIRY - 1000);
  //   const store2 = trainService._debug().store;
  //   expect(store2[vehicleId]).toBeDefined();

  //   // Advance past LONG_EXPIRY
  //   vi.advanceTimersByTime(2000);
  //   await trainService.refresh(); // triggers cleanupExpired
  //   const store3 = trainService._debug().store;
  //   expect(store3[vehicleId]).toBeUndefined();
  // });
});
