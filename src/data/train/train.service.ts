// trainService.ts
import type { TrainRecord } from "../../domain/train";
import { parseApiRecord } from "../api/tfl.parser";
import type { ApiRecord } from "../api/tfl.types";
import { getAllowedStationNames } from "./train.service.allowed.stations";
import { checkRecordConsistency } from "./train.service.helper";
import type {
  Subscriber,
  TrainRecordLineIds,
  TimetableStore,
} from "./train.service.types";

const API_URL =
  "https://api.tfl.gov.uk/Line/bakerloo,central,circle,district,elizabeth,hammersmith-city,jubilee,metropolitan,northern,piccadilly,victoria,waterloo-city/Arrivals";
const POLL_MS = 10 * 1000;
export const FILTER_OUT_FUTURE_TRAINS = 15 * 60 * 1000;
export const SHORT_EXPIRY = 5 * 1000;
export const LONG_EXPIRY = 5 * 60 * 1000;

function hasRecordChanged(
  existing: TrainRecord,
  newEntry: TrainRecord,
): boolean {
  return (
    existing.destinationName !== newEntry.destinationName ||
    existing.direction !== newEntry.direction ||
    existing.expectedArrival !== newEntry.expectedArrival ||
    existing.id !== newEntry.id ||
    existing.lineId !== newEntry.lineId ||
    existing.stationName !== newEntry.stationName ||
    existing.timeToLive !== newEntry.timeToLive ||
    existing.timeToStation !== newEntry.timeToStation ||
    existing.vehicleId !== newEntry.vehicleId
  );
}
// TODO Create and add to types file
// TODO Could move creation of new trainStore record OUT to another func and then inputs wouldn't be undefined
function upsertRecord(
  newEntry: TrainRecord,
  trainStore: TimetableStore | undefined,
): TimetableStore {
  // If train does not have a store, create record
  if (!trainStore) {
    trainStore = {
      lineId: newEntry.lineId as TrainRecordLineIds,
      timetable: [newEntry],
    };
  }

  // TODO Change TrainRecord to TimetableRecord throughout
  const timetable = [...trainStore.timetable];

  // Find index of existing record with newEntry's id
  const ttId = timetable.findIndex((tt) => tt.id === newEntry.id);

  // New record
  if (ttId === -1) {
    timetable.push(newEntry);
    // Update record
  } else {
    const existing = timetable[ttId];

    const recordChanged = hasRecordChanged(existing, newEntry);

    const updated: TrainRecord = recordChanged
      ? {
          ...newEntry,
          // Preserve direction if new direction is undefined
          direction: newEntry.direction ?? existing.direction,
          // Preserve original creation time
          timeCreate: existing.timeCreate,
        }
      : {
          // Preserve record if no changes
          ...existing,
        };

    // Data checks - id, direction, lineId, stationName, vehicleId should be consistent
    if (import.meta.env.DEV) {
      const updateCheck = checkRecordConsistency(updated, existing);
      if (updateCheck.consistent === false) {
        //TODO
        // console.warn(
        //   `message:-\n`,
        //   updateCheck.message,
        //   `fields:-\n`,
        //   updateCheck.fields,
        // );
      }
    }

    timetable[ttId] = updated;
  }

  timetable.sort(
    (a, b) => a.expectedArrival - b.expectedArrival || a.id.localeCompare(b.id),
  );

  return { lineId: trainStore.lineId, timetable };
}

function cleanupExpired(
  store: Record<string, TimetableStore>,
): Record<string, TimetableStore> {
  const now = Date.now();

  const cleaned: Record<string, TimetableStore> = {};

  for (const [vehicleId, trainStore] of Object.entries(store)) {
    const { lineId, timetable } = trainStore;

    const filtered = timetable.filter((entry) => {
      const expiryWindow = timetable.length === 1 ? LONG_EXPIRY : SHORT_EXPIRY;
      const expiryTime = Math.max(
        entry.expectedArrival,
        entry.timeEdit + expiryWindow,
      );
      return now <= expiryTime;
    });
    if (filtered.length > 0)
      cleaned[vehicleId] = { lineId, timetable: filtered };
  }
  return cleaned;
}

export const trainService = (() => {
  let store: Record<string, TimetableStore> = {};
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
  // TODO Check new time filter
  const updateFromApi = async () => {
    try {
      const res = await fetch(API_URL);
      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error("Bad API response");
      const now = Date.now();
      // Loops each (unordered by VehicleId) record from API.
      for (const row of raw as ApiRecord[]) {
        try {
          const newEntry = parseApiRecord(row, now);

          const vehicleId = newEntry.vehicleId;

          // If newEntry vehicle ID is placeholder (000): exit
          if (newEntry.vehicleId.includes("000")) continue;

          // If newEntry's arrival time over ## minutes away: exit
          if (newEntry.expectedArrival - now > FILTER_OUT_FUTURE_TRAINS)
            continue;

          // If newEntry's stationName not in allowed list: exit
          const lineId = newEntry.lineId as TrainRecordLineIds;
          const allowedStationNames = getAllowedStationNames(lineId);
          if (!allowedStationNames.has(newEntry.stationName)) {
            // Skips for known anomalies.
            // Metropolitan uses Jubilee to get to yard: Neasden, Willesden Green, Wembley Park use
            if (
              lineId === "hammersmith-city" &&
              [
                "Aldgate Underground Station",
                "Bayswater Underground Station",
                "Blackfriars Underground Station",
                "Cannon Street Underground Station",
                "Embankment Underground Station",
                "Finchley Road Underground Station",
                "High Street Kensington Underground Station",
                "Mansion House Underground Station",
                "Monument Underground Station",
                "Notting Hill Gate Underground Station",
                "Paddington Underground Station",
                "Temple Underground Station",
                "Tower Hill Underground Station",
                "Westminster Underground Station",
              ].includes(newEntry.stationName)
            ) {
              continue;
            }

            if (
              lineId === "elizabeth" &&
              [
                "Abbey Wood",
                "Farringdon",
                "Bond Street",
                "Paddington",
                "Liverpool Street",
                "Whitechapel",
              ].includes(newEntry.stationName)
            )
              continue;

            if (
              lineId === "metropolitan" &&
              [
                "Neasden Underground Station",
                "Willesden Green Underground Station",
              ].includes(newEntry.stationName)
            )
              continue;

            // TODO
            // console.warn(
            //   `upsertRecord:- newEntry.stationName does not exist in ${lineId} allowedStationNames`,
            //   newEntry.stationName,
            //   allowedStationNames,
            // );
            continue;
          }

          const updatedStore = upsertRecord(newEntry, store[vehicleId]);

          if (updatedStore) {
            store[vehicleId] = updatedStore;
          } else {
            delete store[vehicleId];
          }
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
