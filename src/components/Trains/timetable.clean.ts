import type { TrainRecord } from "../../domain/train";

export const timetableCleaned = (timetable: TrainRecord[]): TrainRecord[] => {
  let timetableCopy = [...timetable];

  // Exluding end of line records
  if (timetableCopy.length <= 2) return timetableCopy;

  // Remove nullish timetable records
  timetableCopy = timetableCopy.filter((r) => r.direction);

  // Too few records to filter
  if (timetableCopy.length <= 3) return timetableCopy;

  // Remove records with inconsistent direction to majority
  const firstDirection = timetableCopy[0].direction;

  const noMismatch = timetableCopy.every(
    (r) => r.direction && r.direction === firstDirection,
  );

  if (noMismatch) return timetableCopy;

  let inboundCount = 0;
  let outboundCount = 0;

  for (const record of timetableCopy) {
    if (record.direction === "inbound") inboundCount++;
    if (record.direction === "outbound") outboundCount++;
  }

  // TODO Raise error with counts
  if (inboundCount === outboundCount) return timetableCopy;

  const dominantDirection =
    inboundCount < outboundCount ? "outbound" : "inbound";

  timetableCopy = timetableCopy.filter(
    (r) => r.direction === dominantDirection,
  );

  return timetableCopy;
};
