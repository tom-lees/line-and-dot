import type { TrainRecord } from "../../domain/train";

const consistencyKeys: (keyof TrainRecord)[] = [
  "id",
  "direction",
  "lineId",
  "stationName",
  "vehicleId",
];

export function checkRecordConsistency(
  newEntry: TrainRecord,
  oldEntry: TrainRecord,
) {
  const oldEntryVehicleId = oldEntry.vehicleId;
  // Compare only the keys that matter
  const differingFields = consistencyKeys.filter(
    (key) => newEntry[key] !== oldEntry[key],
  );

  if (differingFields.length === 0) {
    return { consistent: true, message: "" };
  }

  // Build concise message
  const fieldMessages = differingFields.map((key) => {
    return `${oldEntry.lineId} ${key}: "${oldEntry[key]}" → "${newEntry[key]}"`;
  });

  return {
    consistent: false,
    message: `Inconsistent fields on vehicle:${oldEntryVehicleId}: ${fieldMessages.join(", ")}`,
    fields: differingFields, // optional, can be useful for tests
  };
}
