import { useRef, useEffect } from "react";
import useTrainData from "../hooks/useTrainData";

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function TrainInfoPanel() {
  console.log("Panel render", new Date().toLocaleTimeString());

  const { trainData } = useTrainData();

  const previousArrivalTimes = useRef<Record<string, number>>({});
  const changedArrivalFlags = useRef<Record<string, boolean>>({});

  useEffect(() => {
    for (const [vehicleId, records] of Object.entries(trainData)) {
      const currentArrival = records[0]?.expectedArrival;
      const previousArrival = previousArrivalTimes.current[vehicleId];

      if (currentArrival !== undefined) {
        const changed =
          previousArrival !== undefined && previousArrival !== currentArrival;
        changedArrivalFlags.current[vehicleId] = changed;
        previousArrivalTimes.current[vehicleId] = currentArrival;
      }
    }
  }, [trainData]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        background: "#1e1e1e",
        color: "#eee",
        padding: "1em",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        maxHeight: "90vh",
        overflowY: "auto",
        fontFamily: "system-ui, sans-serif",
        fontSize: "0.9em",
        width: "320px",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "0.5em" }}>
        🚆 Live Train Arrivals
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #555" }}>
            <th style={{ textAlign: "left", paddingBottom: "0.5em" }}>
              Vehicle ID
            </th>
            <th style={{ textAlign: "right", paddingBottom: "0.5em" }}>
              Records
            </th>
            <th style={{ textAlign: "right", paddingBottom: "0.5em" }}>
              Next Arrival
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(trainData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([vehicleId, records]) => {
              const count = records.length;
              const nextArrival = count > 0 ? records[0].expectedArrival : null;
              const changed = changedArrivalFlags.current[vehicleId];

              return (
                <tr key={vehicleId} style={{ borderBottom: "1px solid #333" }}>
                  <td>{vehicleId}</td>
                  <td style={{ textAlign: "right" }}>{count}</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: changed ? "#ff4d4d" : "#eee",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {nextArrival ? formatTime(nextArrival) : "—"}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
