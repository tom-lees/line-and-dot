import type { ApiRecord, TrainRecord } from "../types/train";

export function parseApiRecord(record: ApiRecord, now: number): TrainRecord {
  return {
    id: record.id,
    destinationName: record.destinationName,
    direction: record.direction,
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
