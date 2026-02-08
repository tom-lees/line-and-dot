import type { ApiRecord, TrainRecord } from "../types/train";

// TODO Tests
function normaliseDirection(direction: string): TrainRecord["direction"] {
  const lower = direction.toLowerCase().replace(/[^a-z]/g, "");
  if (lower === "inbound") return "inbound";
  if (lower === "outbound") return "outbound";
  return undefined;
}

export function parseApiRecord(record: ApiRecord, now: number): TrainRecord {
  const direction = normaliseDirection(record.direction);

  return {
    id: record.id,
    destinationName: record.destinationName,
    direction: direction,
    expectedArrival: Date.parse(record.expectedArrival),
    lineId: record.lineId,
    stationName: record.stationName,
    timeCreate: now,
    timeEdit: now,
    timeToLive: Date.parse(record.timeToLive),
    timeToStation: record.timeToStation,
    vehicleId: record.vehicleId,
  };
}
