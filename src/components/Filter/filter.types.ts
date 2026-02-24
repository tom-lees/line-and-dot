import type { LINE_IDS } from "../Line/line.constants";

export type VisibleTrainLinesWithOptionalLabels = Record<
  (typeof LINE_IDS)[number],
  { line: boolean; label: boolean }
>;
