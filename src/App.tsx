import { buildCurveData } from "./utils";
import { Canvas } from "@react-three/fiber";
import { Label } from "./components/Label";
import { network } from "./components/trainLines";
import { useMemo } from "react";
import useSingleTrain from "./hooks/useSingleTrain";
import { ApiSummary } from "./dev/ApiSummary";

export default function App() {
  const { selectedTrainId, setSelectedTrainId, singleTrain } = useSingleTrain();

  const { curve, linePoints, labelPositions } = useMemo(
    () => buildCurveData(network.jubilee.subsections[0].stations, 1000, 400),
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
    return span * 1;
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
        <div className="border rounded-md overflow-hidden">
          <div className="w-full h-[400px]">
            {import.meta.env.DEV && <ApiSummary />}

            {selectedTrainId ? (
              <span>{selectedTrainId}</span>
            ) : (
              <span>Null</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
