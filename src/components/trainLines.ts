import { reading_shenfield } from "./elizabeth";
import { stanmore_stratford } from "./jubilee";

export type Station = {
  name: string;
  x: number;
  y: number;
};

export type Subsection = {
  name: string; // e.g. "Reading → Shenfield"
  stations: Station[]; // ordered list of stations in this subsection
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
      { name: "Reading => Shenfield", stations: reading_shenfield },
    ],
  },
  jubilee: {
    name: "Jubilee",
    subsections: [
      {
        name: "Stanmore => Stratford",
        stations: stanmore_stratford,
      },
    ],
  },
};
