import type { ApiRecord } from "../../api/tfl.types";

const now = Date.now();

export const hammersmithCityApiMock: ApiRecord[] = [
  {
    id: "581899543",
    vehicleId: "267",
    stationName: "Plaistow Underground Station",
    lineId: "hammersmith-city",
    direction: "inbound",
    destinationName: "Hammersmith (H&C Line) Underground Station",
    expectedArrival: new Date(now + 20 * 60 * 1000).toISOString(), // 20 min from now
    timeToStation: 1223,
    timeToLive: new Date(now + 20 * 60 * 1000).toISOString(),
  },
  {
    id: "532488852",
    vehicleId: "272",
    stationName: "Whitechapel Underground Station",
    lineId: "hammersmith-city",
    direction: "outbound",
    destinationName: "Barking Underground Station",
    expectedArrival: new Date(now + 4 * 60 * 1000).toISOString(), // 4 min from now
    timeToStation: 234,
    timeToLive: new Date(now + 4 * 60 * 1000).toISOString(),
  },
  {
    id: "1075283548",
    vehicleId: "275",
    stationName: "Farringdon Underground Station",
    lineId: "hammersmith-city",
    direction: "outbound",
    destinationName: "Barking Underground Station",
    expectedArrival: new Date(now + 21 * 60 * 1000).toISOString(),
    timeToStation: 1283,
    timeToLive: new Date(now + 21 * 60 * 1000).toISOString(),
  },
  {
    id: "-42150992",
    vehicleId: "201",
    stationName: "Farringdon Underground Station",
    lineId: "hammersmith-city",
    direction: "inbound",
    destinationName: "Hammersmith (H&C Line) Underground Station",
    expectedArrival: new Date(now + 1.5 * 60 * 1000).toISOString(),
    timeToStation: 83,
    timeToLive: new Date(now + 1.5 * 60 * 1000).toISOString(),
  },
  {
    id: "-537448367",
    vehicleId: "072",
    stationName: "Bayswater Underground Station",
    lineId: "hammersmith-city",
    direction: "outbound",
    destinationName: "Hammersmith (H&C Line) Underground Station",
    expectedArrival: new Date(now + 18 * 60 * 1000).toISOString(),
    timeToStation: 1103,
    timeToLive: new Date(now + 18 * 60 * 1000).toISOString(),
  },
  // Add a station that is **not allowed** to test filtering
  {
    id: "999999999",
    vehicleId: "999",
    stationName: "Random Not Allowed Station",
    lineId: "hammersmith-city",
    direction: "inbound",
    destinationName: "Hammersmith (H&C Line) Underground Station",
    expectedArrival: new Date(now + 10 * 60 * 1000).toISOString(),
    timeToStation: 600,
    timeToLive: new Date(now + 10 * 60 * 1000).toISOString(),
  },
];
