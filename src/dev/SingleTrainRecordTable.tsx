import type { TrainRecord } from "../domain/train";

export const SingleTrainRecordTable = ({
  trainId,
  trainData,
}: {
  trainId: string;
  trainData: Record<string, TrainRecord[]>;
}) => {
  return (
    <div className="flex flex-col">
      <span>
        <strong>Selected train ID</strong>: {trainId}
      </span>
      <span>
        <div className="overflow-x-auto">
          {trainData &&
            Object.entries(trainData).map(([vehicleId, records]) => (
              <div key={vehicleId} className="mt-2 mb-4">
                <div className="border rounded">
                  <table className="min-w-full rounded text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Train ID</th>
                        <th className="px-3 py-2">Time To Station</th>
                        <th className="px-3 py-2">Current Time</th>
                        <th className="px-3 py-2">Time To Live</th>
                        <th className="px-3 py-2">Station</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id} className="even:bg-gray-50">
                          <td className="px-3 py-1 font-mono">
                            {record.vehicleId}
                          </td>
                          <td className="px-3 py-1 font-mono">
                            {record.timeToStation}
                          </td>
                          <td className="px-3 py-1 font-mono">
                            {new Date().toLocaleTimeString()}
                          </td>
                          <td className="px-3 py-1 font-mono">
                            {new Date(
                              Number(record.timeToLive),
                            ).toLocaleTimeString()}
                          </td>

                          <td className="px-3 py-1 font-mono">
                            {record.stationName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      </span>
    </div>
  );
};
