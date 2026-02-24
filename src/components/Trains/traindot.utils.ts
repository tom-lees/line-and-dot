export const tUnixToTimeString = (unix: number | undefined) =>
  unix &&
  new Date(unix).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export const uRounded = (u: number | undefined) =>
  u && Math.round(u * 100) / 100;

export const nameNormalised = (name: string | undefined) =>
  name && name.replace("Underground Station", "").replace("Rail Station", "");
