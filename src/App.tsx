import { buildCurveData } from "./utils";
import { Canvas } from "@react-three/fiber";
import { Label } from "./components/Label";
import { network } from "./components/trainLines";
import { useMemo } from "react";
import useSingleTrain from "./hooks/useSingleTrain";
import { ApiSummary } from "./dev/ApiSummary";

export default function App() {
  const { selectedTrainId, data: singleTrainData } = useSingleTrain();

  const { curve, linePoints, labelPositions } = useMemo(
    () => buildCurveData(network.elizabeth.subsections[0].stations, 1000, 400),
    []
  );

  const cameraZ = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < linePoints.length; i += 3) {
      xs.push(linePoints[i]);
      ys.push(linePoints[i + 1]);
    }
    const span = Math.max(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
      100
    );
    // TODO why does jubilee need span = 1 and eliz span = 0.5
    return span * 0.5;
  }, [linePoints]);

  return (
    <>
      <main className="mt-8 p-4">
        <div className="border rounded-md overflow-hidden">
          <div className="w-full h-[400px]">
            <Canvas
              camera={{ position: [0, 0, cameraZ], fov: 50 }}
              style={{ width: "100%", height: "100%" }}
            >
              <color attach="background" args={["#0c0c0f"]} />
              {/* declarative line: R3F will handle creation/disposal */}
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach={"attributes-position"}
                    array={linePoints as Float32Array}
                    args={[linePoints as Float32Array, 3]}
                    itemSize={3}
                    count={linePoints.length / 3}
                  />
                </bufferGeometry>

                {/* set color/linewidth here — material props control the look */}
                <lineBasicMaterial color={"#ffffff"} linewidth={2} />
              </line>
              {labelPositions.map((lp, i) => (
                <Label
                  key={i.toString() + lp.label}
                  text={lp.label}
                  position={lp.position}
                />
              ))}
            </Canvas>
          </div>
        </div>
      </main>
      <aside className="p-4">
        <div className=" border rounded-md h-[400px] overflow-y-auto overflow-x-hidden">
          <div className="p-2">
            {import.meta.env.DEV && <ApiSummary />}
            {selectedTrainId ? (
              <div className="flex flex-col">
                <span>
                  <strong>Selected train ID</strong>: {selectedTrainId}
                </span>
                <span>
                  <div className="overflow-x-auto">
                    {singleTrainData &&
                      Object.entries(singleTrainData).map(
                        ([vehicleId, records]) => (
                          <div key={vehicleId} className="mt-2 mb-4">
                            <div className="border rounded">
                              <table className="min-w-full rounded text-sm text-left text-gray-700">
                                <thead className="bg-gray-100 sticky top-0">
                                  <tr>
                                    <th className="px-3 py-2">Train ID</th>
                                    <th className="px-3 py-2">
                                      Time To Station
                                    </th>
                                    <th className="px-3 py-2">Current Time</th>
                                    <th className="px-3 py-2">Time To Live</th>
                                    <th className="px-3 py-2">Station</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {records.map((record) => (
                                    <tr
                                      key={record.id}
                                      className="even:bg-gray-50"
                                    >
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
                                          Number(record.timeToLive)
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
                        )
                      )}
                  </div>
                </span>
              </div>
            ) : (
              <span>Null</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
