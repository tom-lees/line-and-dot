import { buildCurveData, normaliseNetwork } from "./utils";
import { Canvas } from "@react-three/fiber";
import { Label } from "./components/Label";
import { network } from "./components/trainLines";
import { useMemo } from "react";
import useSingleTrain from "./hooks/useSingleTrain";
import { ApiSummary } from "./dev/ApiSummary";
import { SingleTrainRecordTable } from "./dev/SingleTrainRecordTable";
import { TrainDot } from "./components/TrainDot";
import { OrbitControls } from "@react-three/drei";

// TODO Add screenwidth tracker
const screenWidth = 1000;

export default function App() {
  const normalisedNetwork = useMemo(
    () => normaliseNetwork(network, screenWidth),
    // TODO add screenwidth when it can be adjusted
    []
  );

  const { selectedTrainId, data: singleTrainData } = useSingleTrain();

  const stationList = normalisedNetwork.elizabeth.subsections[0].stations;

  //TODO Runs four similar scripts that should be consolidated.
  const { curve, linePoints, labelPositions, stationUs } = useMemo(
    () => buildCurveData(stationList),
    [stationList]
  );

  // TODO Create <TrainDot> tsx
  // const dot = useMemo(() => {
  //   return new Dot("veh-1", curve, stationUs, 0.01);
  // }, [curve, stationUs]);

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
              {/* Track line */}
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
              {/* Station labels */}
              {labelPositions.map((lp, i) => (
                <Label
                  key={i.toString() + lp.label}
                  text={lp.label}
                  position={lp.position}
                  fontSize={16}
                  fontColour="white"
                />
              ))}
              {/* Train dot moving along line */}
              {/* Single moving train dot */}
              {singleTrainData && (
                <TrainDot
                  curve={curve}
                  stations={stationUs}
                  speed={0.01}
                  trainUpdates={Object.values(singleTrainData).flat()}
                  initialU={0}
                />
              )}
              {/* TODO  Pan, 1 finger, left mouse.  Drag, 2 finger, right mouse.  Zoom, pinch, wheel  */}
              <OrbitControls
                enablePan
                enableZoom
                enableRotate={true}
                enableDamping
                dampingFactor={0.08}
                minDistance={cameraZ * 0.3}
                maxDistance={cameraZ * 2}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>
          </div>
        </div>
      </main>
      <aside className="p-4">
        <div className=" border rounded-md h-[400px] overflow-y-auto overflow-x-hidden">
          <div className="p-2">
            {import.meta.env.DEV && <ApiSummary />}
            {selectedTrainId ? (
              <>
                {selectedTrainId && singleTrainData && (
                  <SingleTrainRecordTable
                    trainId={selectedTrainId}
                    trainData={singleTrainData}
                  />
                )}
              </>
            ) : (
              <span>Null</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
