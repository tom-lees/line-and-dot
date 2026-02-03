import { normaliseNetwork } from "./utils";
import { Canvas } from "@react-three/fiber";
import { network } from "./components/trainLines";
import { useMemo } from "react";
import { ApiSummary } from "./dev/ApiSummary";
import { OrbitControls } from "@react-three/drei";
import { Elizabeth } from "./components/Elizabeth";
import { TrainRecordsTable } from "./dev/TrainRecordsTable";
import useTrainData from "./hooks/useTrainData";


// TODO Testing should break down and show a count for each inidividual train for each line.
// TODO Perhaps testing could ALSO have a count for trains arriving at each station in the next 5 minutes
//      This can be compared to individual trains on each line.

// TODO Add screenwidth tracker
const screenWidth = 1000;

export default function App() {
  const normalisedNetwork = useMemo(
    () => normaliseNetwork(network, screenWidth),
    // TODO add screenwidth when it can be adjusted
    []
  );

  const trains = useTrainData();
  // const elizabethStations =
  //   normalisedNetwork.elizabeth.subsections[0].positions;

  //TODO Runs four similar scripts that should be consolidated.
  // const { curve, stationUs } = useMemo(
  //   () => buildCurveData(elizabethStations),
  //   [elizabethStations]
  // );

  const cameraZ = useMemo(() => {
    return screenWidth * 0.5;
  }, []);

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
              <Elizabeth network={normalisedNetwork} />
              {/* TODO  Pan, 1 finger, left mouse.  Drag, 2 finger, right mouse.  Zoom, pinch, wheel  */}
              <OrbitControls
                enablePan
                enableZoom
                enableRotate={true}
                enableDamping
                dampingFactor={0.08}
                minDistance={cameraZ * 0.1}
                maxDistance={cameraZ * 5}
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
            {trains ? (
              <TrainRecordsTable trainData={trains.trainData} />
            ) : (
              <span>Null</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
