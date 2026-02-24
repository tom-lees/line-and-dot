import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
// import { ApiSummary } from "./dev/ApiSummary";
import { OrbitControls } from "@react-three/drei";
// import { TrainRecordsTable } from "./dev/TrainRecordsTable";
import useTrainData from "../hooks/useTrainData";
import { TrainNetwork } from "../components/Network/TrainNetwork";
import { network } from "../components/Line/line.builder";
import { normaliseNetwork } from "./network.normalise";
import { TrainFilter } from "../components/Filter/Filter";
import type { VisibleTrainLinesWithOptionalLabels } from "../components/Filter/filter.types";
import { averageStationPositions } from "../components/Label/label.positions";
import { Label } from "../components/Label/Label";
import type { Network } from "../domain/lines";

// TODO Testing should break down and show a count for each inidividual train for each line.
// TODO Perhaps testing could ALSO have a count for trains arriving at each station in the next 5 minutes
//      This can be compared to individual trains on each line.
// TODO Does 3js need resize logic, seems to work as is.

export default function App() {
  const screenWidth = 1000;

  const [dotResetToken, setDotResetToken] = useState(0);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setDotResetToken((prev) => prev + 1); // trigger dot reset
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const [
    visibleTrainLinesWithOptionalLabels,
    setVisibleTrainLinesWithOptionalLabels,
  ] = useState<VisibleTrainLinesWithOptionalLabels>({
    bakerloo: { line: true, label: false },
    central: { line: true, label: false },
    circle: { line: true, label: false },
    district: { line: true, label: false },
    elizabeth: { line: true, label: false },
    hammersmithCity: { line: true, label: false },
    jubilee: { line: true, label: false },
    metropolitan: { line: true, label: false },
    northern: { line: true, label: false },
    piccadilly: { line: true, label: false },
    victoria: { line: true, label: false },
    waterlooCity: { line: true, label: false },
  });

  const normalisedNetwork = useMemo(() => normaliseNetwork(network), []);

  // TODO Learn pattern
  const filteredNetwork = useMemo(() => {
    return Object.fromEntries(
      Object.entries(normalisedNetwork).filter(
        ([lineId]) =>
          visibleTrainLinesWithOptionalLabels[
            lineId as keyof VisibleTrainLinesWithOptionalLabels
          ].label,
      ),
    ) as Network;
  }, [normalisedNetwork, visibleTrainLinesWithOptionalLabels]);

  const stationLabelPositions = useMemo(
    () => averageStationPositions(filteredNetwork),
    [filteredNetwork],
  );

  const { data: trainStore } = useTrainData();

  if (import.meta.env.DEV) {
    // DEV: Data check are all timetable records associated with the correct line
    Object.entries(trainStore).map(([k, v]) => {
      const lineId = v.lineId;
      v.timetable.forEach((tt) => {
        if (tt.lineId !== lineId) {
          console.log(k, v.timetable);
        }
      });
    });
  }

  const cameraZ = useMemo(() => screenWidth * 0.5, []);

  return (
    <main className="relative w-full h-full">
      <div className="w-full h-full overflow-hidden">
        <div className="absolute top-4 left-4 z-100">
          <TrainFilter
            visibleTrainLinesWithOptionalLabels={
              visibleTrainLinesWithOptionalLabels
            }
            onChange={setVisibleTrainLinesWithOptionalLabels}
          />
        </div>
        <Canvas
          className="absolute inset-0 z-0"
          camera={{
            position: [0, -cameraZ, cameraZ],
            fov: 50,
            up: [0, 0, 1],
            near: 0.3,
            far: 2000,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <color attach="background" args={["#000000"]} />

          <directionalLight
            color="#ffffff"
            intensity={0.6}
            position={[0, 0, 100]}
            target-position={[0, 0, 0]}
          />

          {stationLabelPositions.map((x) => (
            <Label
              key={x.name}
              position={[x.x, x.y, x.z]}
              text={x.name.replace("Underground Station", "")}
              fontSize={10}
            />
          ))}

          <TrainNetwork
            dotResetToken={dotResetToken}
            network={normalisedNetwork}
            trainStore={trainStore}
            visibleTrainLines={visibleTrainLinesWithOptionalLabels}
          />

          <OrbitControls
            enablePan
            enableZoom
            enableRotate={true}
            enableDamping
            dampingFactor={0.08}
            minDistance={cameraZ * 0.1}
            maxDistance={cameraZ * 2}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            zoomSpeed={1}
          />
        </Canvas>
      </div>
    </main>
  );
}
