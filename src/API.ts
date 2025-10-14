type ApiRecord = {
  id: string;
  vehicleId: string;
  stationName: string;
  destinationName: string;
  expectedArrival: string;
  timeToLive: string;
};

type TrainRecord = {
  id: string;
  stationName: string;
  destinationName: string;
  expectedArrival: number;
  timeToLive: number;
  timeCreate: number;
  timeEdit: number;
};

const parseApiRecord = (record: ApiRecord, now: number): TrainRecord => {
  if (!record.expectedArrival.endsWith("Z")) {
    throw new Error(
      `record.expectedArrival not in Zulu format: ${record.expectedArrival} 
          VehicleId: ${record.vehicleId} 
          id: ${record.id}`
    );
  }
  if (!record.timeToLive.endsWith("Z")) {
    throw new Error(
      `record.timeToLive not in Zulu format: ${record.timeToLive} 
          VehicleId: ${record.vehicleId} 
          id: ${record.id}`
    );
  }
  const expectedArrival = Date.parse(record.expectedArrival);
  const timeToLive = Date.parse(record.timeToLive);
  //TODO Handle Nan
  return {
    id: record.id,
    stationName: record.stationName,
    destinationName: record.destinationName,
    expectedArrival,
    timeToLive,
    timeCreate: now,
    timeEdit: now,
  };
};

const upsertTrainRecord = (
  newEntry: TrainRecord,
  records: TrainRecord[]
): TrainRecord[] => {
  const index = records.findIndex((r) => r.id === newEntry.id);
  if (index !== -1 && records[index]) {
    newEntry.timeCreate = records[index].timeCreate;
    records[index] = newEntry;
  } else {
    records.push(newEntry);
  }
  return records.sort(
    (a, b) => a.expectedArrival - b.expectedArrival || a.id.localeCompare(b.id)
  );
};

//TODO Extend Error for parsing erros
//TODO Log skipped records
//TODO trainList live object creates risk, use copy and then map once loop is complete?
function updateTrainData({
  apiResponse,
  trainList,
}: {
  apiResponse: ApiRecord[];
  trainList: Record<string, TrainRecord[]>;
}): Record<string, TrainRecord[]> {
  const now = Date.now();

  for (const record of apiResponse) {
    try {
      const vehicleId = record.vehicleId;
      const newEntry = parseApiRecord(record, now);

      if (newEntry.expectedArrival - now > 30 * 60 * 1000) continue;

      trainList[vehicleId] = upsertTrainRecord(
        newEntry,
        trainList[vehicleId] ?? []
      );
    } catch (e) {
      console.error(`Error processing record: ${(e as Error).message}`);
    }
  }
  return trainList;
}

// TODO Mutation issues whilst looping.
// TODO Log dropped records, maybe...
function cleanupExpiredPredictions({
  trainList,
}: {
  trainList: Record<string, TrainRecord[]>;
}): Record<string, TrainRecord[]> {
  const now = Date.now();
  const shortExpiry = 60 * 1000;
  const longExpiry = 30 * 60 * 1000;

  const staleVehicleIds: string[] = [];

  for (const [vehicleId, records] of Object.entries(trainList)) {
    if (records.length === 0) {
      staleVehicleIds.push(vehicleId);
      continue;
    }

    const cleanedRecords = records.filter((entry) => {
      const expiryWindow = records.length === 1 ? longExpiry : shortExpiry;
      const expiryTime = Math.max(
        entry.expectedArrival,
        entry.timeEdit + expiryWindow
      );
      return now <= expiryTime;
    });

    if (cleanedRecords.length > 0) {
      trainList[vehicleId] = cleanedRecords;
    } else {
      staleVehicleIds.push(vehicleId);
    }
  }

  for (const vehicleId of staleVehicleIds) {
    delete trainList[vehicleId];
  }

  return trainList;
}

const url = "https://api.tfl.gov.uk/Line/elizabeth/Arrivals";

const trainData: Record<string, TrainRecord[]> = {};

function printTrainData(iteration: number, targetId?: string): void {
  console.log(`\n--- Snapshot at iteration ${iteration} ---`);

  const format = (ms: number) =>
    new Date(ms).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  if (targetId) {
    const records = trainData[targetId];
    if (!records || records.length === 0) {
      console.log(`\nNo records found for Vehicle ID: ${targetId}`);
      return;
    }

    console.log(`\nVehicle ID: ${targetId}`);
    for (const entry of records) {
      console.log(`  ID: ${entry.id}`);
      console.log(`  Station: ${entry.stationName}`);
      console.log(`  Destination: ${entry.destinationName}`);
      console.log(`  Expected Arrival: ${format(entry.expectedArrival)}`);
      console.log(`  Time to Live: ${format(entry.timeToLive)}`);
      console.log(`  Time Create: ${format(entry.timeCreate)}`);
      console.log(`  Time Edit: ${format(entry.timeEdit)}`);
      console.log("  ---");
    }
  } else {
    for (const [vehicleId, records] of Object.entries(trainData)) {
      console.log(`\nVehicle ID: ${vehicleId}`);
      for (const entry of records) {
        console.log(`  ID: ${entry.id}`);
        console.log(`  Station: ${entry.stationName}`);
        console.log(`  Destination: ${entry.destinationName}`);
        console.log(`  Expected Arrival: ${format(entry.expectedArrival)}`);
        console.log(`  Time to Live: ${format(entry.timeToLive)}`);
        console.log(`  Time Create: ${format(entry.timeCreate)}`);
        console.log(`  Time Edit: ${format(entry.timeEdit)}`);
        console.log("  ---");
      }
    }
  }
}

async function runPipeline(iteration: number, targetId?: string) {
  try {
    const response = await fetch(url);
    const raw = await response.json();
    if (!Array.isArray(raw)) {
      throw new Error("Unexpected API response format");
    }
    const apiResponse: ApiRecord[] = raw;

    updateTrainData({ apiResponse, trainList: trainData });
    cleanupExpiredPredictions({ trainList: trainData });
    printTrainData(iteration, targetId);
  } catch (err) {
    console.error("Pipeline error:", err);
  }
}

let iteration = 1;

// Run immediately
runPipeline(iteration++);

// Then every 30 seconds
setInterval(() => {
  runPipeline(iteration++);
}, 10000);
