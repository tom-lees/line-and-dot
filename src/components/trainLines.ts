import {
  heathrow4_shenfield,
  heathrow5_heathrow2and3,
  reading_shenfield,
} from "../data/elizabeth";
import type { buildCurveData } from "../utils";

export type Positions =
  | {
      type: "station";
      name: string;
      x: number;
      y: number;
      z: number;
    }
  | { type: "track"; x: number; y: number; z: number };

// TODO curveData exists here and on SubsectionRuntime, does it need to be on both
// TODO Add notes explaining curveData
export type Subsection = {
  name: string; // e.g. "Reading → Shenfield"
  positions: Positions[]; // ordered list of positions along the line
  curveData?: ReturnType<typeof buildCurveData>;
};

// TODO Change to TrainLine
export type Line = {
  name: string; // e.g. "Elizabeth"
  subsections: Subsection[];
};

export type Network = {
  [lineName: string]: Line;
};

export const network: Network = {
  elizabeth: {
    name: "Elizabeth",
    subsections: [
      { name: "Reading => Shenfield", positions: reading_shenfield },
      { name: "Heathrow 4 => Shenfield", positions: heathrow4_shenfield },
      { name: "Heathrow 5 => Shenfield", positions: heathrow5_heathrow2and3 },
    ],
  },
};
