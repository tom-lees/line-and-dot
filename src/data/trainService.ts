// trainService.ts
import type { ApiRecord, TrainRecord } from "../types/train";
import { parseApiRecord } from "../data/parseApiRecord";

const API_URL = "https://api.tfl.gov.uk/Line/elizabeth/Arrivals";
const POLL_MS = 5000;

type Subscriber = (data: Record<string, TrainRecord[]>) => void;

function upsertRecord(
  newEntry: TrainRecord,
  records: TrainRecord[] = [],
  now: number
) {
  const copy = records.slice();
  const idx = copy.findIndex((r) => r.id === newEntry.id);

  const isTrainFarAway = newEntry.expectedArrival - now > 10 * 60 * 1000;

  if (idx === -1) {
    // new record
    // skip far away trains
    if (isTrainFarAway) return copy;
    copy.push(newEntry);
  } else {
    // update existing record
    // preserve original creation time
    newEntry.timeCreate = copy[idx].timeCreate;
    copy[idx] = newEntry;
  }
  return copy.sort(
    (a, b) => a.expectedArrival - b.expectedArrival || a.id.localeCompare(b.id)
  );
}

function cleanupExpired(trainList: Record<string, TrainRecord[]>) {
  const now = Date.now();
  const shortExpiry = 10 * 1000;
  const longExpiry = 30 * 60 * 1000;
  const cleaned: Record<string, TrainRecord[]> = {};
  for (const [vehicleId, records] of Object.entries(trainList)) {
    const filtered = records.filter((entry) => {
      const expiryWindow = records.length === 1 ? longExpiry : shortExpiry;
      const expiryTime = Math.max(
        entry.expectedArrival,
        entry.timeEdit + expiryWindow
      );
      return now <= expiryTime;
    });
    if (filtered.length > 0) cleaned[vehicleId] = filtered;
  }
  return cleaned;
}

export const trainService = (() => {
  let store: Record<string, TrainRecord[]> = {};
  const subscribers = new Set<Subscriber>();
  let timer: number | null = null;
  let running = false;

  const emit = () => {
    const snapshot = { ...store };
    subscribers.forEach((s) => {
      try {
        s(snapshot);
      } catch (e) {
        console.error("Subscriber error", e);
      }
    });
  };

  const updateFromApi = async () => {
    try {
      const res = await fetch(API_URL);
      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error("Bad API response");
      const now = Date.now();
      // Loops each (unordered by VehicleId) record from API.
      for (const row of raw as ApiRecord[]) {
        try {
          const vehicleId = row.vehicleId;
          const newEntry = parseApiRecord(row, now);
          if (newEntry.expectedArrival - now > 30 * 60 * 1000) continue;
          store[vehicleId] = upsertRecord(
            newEntry,
            store[vehicleId] ?? [],
            now
          );
        } catch (e) {
          console.error("Parse error for row", e, row);
        }
      }
      store = cleanupExpired(store);
      emit();
    } catch (e) {
      console.error("trainService fetch error:", e);
    }
  };

  const start = () => {
    if (running) return;
    running = true;
    updateFromApi();
    timer = window.setInterval(updateFromApi, POLL_MS);
  };

  const stop = () => {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
    running = false;
  };

  const refresh = () => updateFromApi();

  const subscribe = (cb: Subscriber) => {
    subscribers.add(cb);

    // deliver immediate snapshot safely
    try {
      cb({ ...store });
    } catch (err) {
      console.error("Subscriber threw during initial delivery:", err);
    }

    return () => subscribers.delete(cb);
  };

  return {
    start,
    stop,
    refresh,
    subscribe,
    _debug: () => ({ store, running }),
  };
})();
