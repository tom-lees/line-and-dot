export type TrainRecord = {
  id: string;
  destinationName: string;
  direction: "inbound" | "outbound" | undefined;
  expectedArrival: number;
  lineId: string;
  stationName: string;
  timeCreate: number;
  timeEdit: number;
  timeToLive: number;
  timeToStation: number;
  vehicleId: string;
};
