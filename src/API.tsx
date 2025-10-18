import { useEffect, useState } from "react";

const url = "https://api.tfl.gov.uk/Line/elizabeth/Arrivals";

type ApiRecord = {
  id: string;
  vehicleId: string;
  stationName: string;
  destinationName: string;
  expectedArrival: string;
  timeToLive: string;
  platformDirection: string;
  towards: string;
};

type TrainRecord = {
  id: string;
  stationName: string;
  destinationName: string;
  expectedArrival: number;
  timeToLive: number;
  timeCreate: number;
  timeEdit: number;
  platformDirection: string;
  towards: string;
};

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function TrainInfoPanel() {
  const [trainData, setTrainData] = useState<Record<string, TrainRecord[]>>({});

  useEffect(() => {
    const parseApiRecord = (record: ApiRecord, now: number): TrainRecord => {
      const expectedArrival = Date.parse(record.expectedArrival);
      const timeToLive = Date.parse(record.timeToLive);
      return {
        id: record.id,
        stationName: record.stationName,
        destinationName: record.destinationName,
        expectedArrival,
        timeToLive,
        timeCreate: now,
        timeEdit: now,
        platformDirection: record.platformDirection,
        towards: record.towards,
      };
    };

    const upsertTrainRecord = (
      newEntry: TrainRecord,
      records: TrainRecord[]
    ): TrainRecord[] => {
      const index = records.findIndex((r) => r.id === newEntry.id);
      if (index !== -1) {
        newEntry.timeCreate = records[index].timeCreate;
        records[index] = newEntry;
      } else {
        records.push(newEntry);
      }
      return records.sort(
        (a, b) =>
          a.expectedArrival - b.expectedArrival || a.id.localeCompare(b.id)
      );
    };

    const updateTrainData = (
      apiResponse: ApiRecord[],
      trainList: Record<string, TrainRecord[]>
    ) => {
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
          console.error("Error parsing record:", e);
        }
      }
      return trainList;
    };

    const cleanupExpiredPredictions = (
      trainList: Record<string, TrainRecord[]>
    ) => {
      const now = Date.now();
      const shortExpiry = 60 * 1000;
      const longExpiry = 30 * 60 * 1000;

      const cleaned: Record<string, TrainRecord[]> = {};
      for (const [vehicleId, records] of Object.entries(trainList)) {
        const filtered = records.filter((entry) => {
          const expiryWindow = records.length === 1 ? longExpiry : shortExpiry;
          const expiryTime = Math.max(
            entry.expectedArrival,
            entry.timeEdit + expiryWindow
          );
          return now <= expiryTime;
        });
        if (filtered.length > 0) {
          cleaned[vehicleId] = filtered;
        }
      }
      return cleaned;
    };

    const runPipeline = async () => {
      try {
        const response = await fetch(url);
        const raw = await response.json();
        if (!Array.isArray(raw)) throw new Error("Invalid API format");

        let updated = updateTrainData(raw, { ...trainData });
        updated = cleanupExpiredPredictions(updated);
        setTrainData(updated);
      } catch (err) {
        console.error("Pipeline error:", err);
      }
    };

    runPipeline();
    const interval = setInterval(runPipeline, 10000);
    return () => clearInterval(interval);
  }, [trainData]);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "#222",
        color: "#fff",
        padding: "1em",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <h3>Live Train Arrivals</h3>
      {Object.entries(trainData).map(([vehicleId, records]) => (
        <div key={vehicleId} style={{ marginBottom: "1em" }}>
          <strong>Vehicle ID: {vehicleId}</strong>
          <ul>
            {records.map((entry) => (
              <li key={entry.id}>
                <div>Station: {entry.stationName}</div>
                <div>Destination: {entry.destinationName}</div>
                <div>Direction: {entry.platformDirection}</div>
                <div>Towards: {entry.towards}</div>
                <div>Arrival: {formatTime(entry.expectedArrival)}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
