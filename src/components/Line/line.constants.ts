export type LineId =
  | "bakerloo"
  | "central"
  | "circle"
  | "district"
  | "elizabeth"
  | "hammersmithCity"
  | "jubilee"
  | "metropolitan"
  | "northern"
  | "piccadilly"
  | "victoria"
  | "waterlooCity";

export const LINE_IDS: LineId[] = [
  "bakerloo",
  "central",
  "circle",
  "district",
  "elizabeth",
  "hammersmithCity",
  "jubilee",
  "metropolitan",
  "northern",
  "piccadilly",
  "victoria",
  "waterlooCity",
] as const;
