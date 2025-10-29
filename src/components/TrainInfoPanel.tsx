// TrainInfoPanel.tsx
import useTrainData from "../hooks/useTrainData";
import type { TrainRecord } from "../types/train";

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function TrainInfoPanel() {
  const { trainData, refresh } = useTrainData();

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
        fontFamily: "sans-serif",
        fontSize: "0.9em",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Live Train Arrivals</h3>
      <button onClick={refresh} style={{ marginBottom: 12 }}>
        Refresh
      </button>
      {Object.entries(trainData).map(([vehicleId, records]) => (
        <div key={vehicleId} style={{ marginBottom: "1.5em" }}>
          <strong>Vehicle ID:</strong> {vehicleId}
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {records.map((entry: TrainRecord) => (
              <li key={entry.id} style={{ marginBottom: "0.75em" }}>
                <div>
                  <strong>Line:</strong> {entry.lineId}
                </div>
                <div>
                  <strong>Station:</strong> {entry.stationName}
                </div>
                <div>
                  <strong>Destination:</strong> {entry.destinationName}
                </div>
                <div>
                  <strong>Direction:</strong> {entry.direction}
                </div>
                <div>
                  <strong>Platform:</strong> {entry.platformDirection}
                </div>
                <div>
                  <strong>Arrival Time:</strong>{" "}
                  {formatTime(entry.expectedArrival)}
                </div>
                <div>
                  <strong>Countdown:</strong> {entry.timeToStation}s
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
