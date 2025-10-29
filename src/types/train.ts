export type ApiRecord = {
  id: string;
  destinationName: string;
  direction: string;
  expectedArrival: string;
  lineId: string;
  stationName: string;
  timeToLive: string;
  timeToStation: number; // TODO Test this is the sam as timeToLive.unix - now().unix
  vehicleId: string;
};

export type TrainRecord = {
  id: string;
  destinationName: string;
  direction: string;
  expectedArrival: number;
  lineId: string;
  stationName: string;
  timeCreate: number;
  timeEdit: number;
  timeToLive: number;
  timeToStation: number; // TODO Test this is the sam as timeToLive.unix - now().unix
  vehicleId: string;
};
