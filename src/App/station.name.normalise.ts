export const normaliseName = (s: string) =>
  s
    .toLowerCase()
    .replace(/rail station|underground station|station/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
