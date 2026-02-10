import {
  hayesHarlington_whitechapel,
  heathrow2And3_hayesHarlington,
  heathrow4_heathrow2And3,
  heathrow5_heathrow2And3,
  reading_hayesHarlington,
  whitechapel_abbeywood,
  whitechapel_shenfield,
} from "../data/elizabeth";
import {
  buildBidirectionalSubsections,
  type buildSubsectionData,
} from "../utils";

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

const trackSpacing = 250;
// prettier-ignore
export const network: Network = {
  elizabeth: {
    name: "Elizabeth",
    subsections: [
      ...buildBidirectionalSubsections(reading_hayesHarlington, trackSpacing),
      ...buildBidirectionalSubsections( hayesHarlington_whitechapel, trackSpacing), 
      ...buildBidirectionalSubsections( heathrow2And3_hayesHarlington, trackSpacing),
      ...buildBidirectionalSubsections(heathrow4_heathrow2And3, trackSpacing),
      ...buildBidirectionalSubsections(heathrow5_heathrow2And3, trackSpacing),
      ...buildBidirectionalSubsections(whitechapel_shenfield, trackSpacing),
      ...buildBidirectionalSubsections(whitechapel_abbeywood, trackSpacing),
    ],
  },
};
