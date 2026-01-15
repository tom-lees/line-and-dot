import type { TrainRecord } from "../types/train";

const formatUnixTime = (unix: number | string) => {
  const date = new Date(Number(unix));
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

export const TrainRecordsTable = ({
  trainData,
}: {
  trainData: Record<string, TrainRecord[]>;
}) => {
  const trainRows = Object.entries(trainData).map(([vehicleId, records]) => ({
    vehicleId,
    station0: records[0]?.stationName ?? "N/A",
    arrival0: records[0]?.expectedArrival
      ? formatUnixTime(records[0].expectedArrival)
      : "N/A",
    station1: records[1]?.stationName ?? "N/A",
    arrival1: records[1]?.expectedArrival
      ? formatUnixTime(records[1].expectedArrival)
      : "N/A",
  }));

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">
              Vehicle ID
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              0th Station
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              0th Arrival
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              1st Station
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              1st Arrival
            </th>
          </tr>
        </thead>
        <tbody>
          {trainRows.map((row) => (
            <tr key={row.vehicleId} className="even:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                {row.vehicleId}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {row.station0}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {row.arrival0}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {row.station1}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {row.arrival1}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
