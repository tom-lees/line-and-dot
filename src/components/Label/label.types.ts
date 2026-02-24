import type { Positions } from "../../domain/lines";

export type LabelProps = {
  text: string;
  position: [number, number, number];
  offset?: [number, number]; // screen-space offset in pixels
  fontSize?: number;
  fontColour?: string;
  rotate?: "diagonal" | "horizontal" | "vertical";
};

export type StationLabelPositions = Pick<
  Extract<Positions, { type: "station" }>,
  "name" | "x" | "y" | "z"
>;
