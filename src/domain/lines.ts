import type { buildSubsectionData } from "../components/Line/line.subsection.builder";

export type Positions =
  | {
      type: "station";
      name: string;
      x: number;
      y: number;
      z: number;
      horizontalOffset?: number;
      verticalOffset?: number;
    }
  | {
      type: "track";
      x: number;
      y: number;
      z: number;
      horizontalOffset?: number;
      verticalOffset?: number;
    };

export type Midline = {
  name: string;
  positions: Positions[];
};

// TODO curveData exists here and on SubsectionRuntime, does it need to be on both
// TODO Add notes explaining curveData
// TODO Split, build SubsectionCurve type, current type is domain and component
export type Subsection = {
  curveData?: ReturnType<typeof buildSubsectionData>;
  name: string; // e.g. "Reading → Shenfield"
  positions: Positions[]; // ordered list of positions along the line
  type: "inbound" | "outbound";
};

// TODO Change to TrainLine
export type Line = {
  name: string; // e.g. "Elizabeth"
  // line:
  subsections: Subsection[];
};

export type Network = {
  [lineName: string]: Line;
};
