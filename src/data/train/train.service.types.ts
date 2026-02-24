import type { TrainRecord } from "../../domain/train";

type Snapshot = Record<string, TimetableStore>;
export type Subscriber = (data: Snapshot) => void;

export type TrainRecordLineIds =
  | "bakerloo"
  | "central"
  | "circle"
  | "district"
  | "elizabeth"
  | "hammersmith-city"
  | "jubilee"
  | "metropolitan"
  | "northern"
  | "piccadilly"
  | "victoria"
  | "waterloo-city";

export type TimetableStore = {
  lineId: TrainRecordLineIds;
  timetable: TrainRecord[];
};
