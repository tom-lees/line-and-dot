import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
// import { ApiSummary } from "./dev/ApiSummary";
// import { TrainRecordsTable } from "./dev/TrainRecordsTable";
import useTrainData from "../hooks/useTrainData";
import { TrainNetwork } from "../components/Network/TrainNetwork";
import { network } from "../components/Line/line.builder";
import { normaliseNetwork } from "./network.normalise";
import { TrainFilter } from "../components/Filter/TrainFilter";
import type { VisibleTrainLinesWithOptionalLabels } from "../components/Filter/filter.types";
import { averageStationPositions } from "../components/Label/label.positions";
import { Label } from "../components/Label/Label";
import type { Network } from "../domain/lines";
import InstructionsPopup from "../components/InstructionsPopup/InstructionsPopup";
import { OrbitControls } from "@react-three/drei";
import { TopBar } from "../components/TopBar/TopBar";
import { lineFilterOnStartup } from "./app-visible-trains-startup";
import { About } from "../components/About/About";

// TODO Testing should break down and show a count for each inidividual train for each line.
// TODO Perhaps testing could ALSO have a count for trains arriving at each station in the next 5 minutes
//      This can be compared to individual trains on each line.
// TODO Does 3js need resize logic, seems to work as is.

export default function App() {
  const modelWidthPx = 1000;

  const [dotResetToken, setDotResetToken] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(
    () => window.innerWidth >= 768,
  );
  const [showInstructions, setShowInstructions] = useState(true);
  const [showButtonsAndPanels, setShowButtonsAndPanels] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [
    visibleTrainLinesWithOptionalLabels,
    setVisibleTrainLinesWithOptionalLabels,
  ] = useState<VisibleTrainLinesWithOptionalLabels>(lineFilterOnStartup);

  useEffect(() => {
    if (showButtonsAndPanels && isMobile && isFilterOpen && isAboutOpen) {
      setIsAboutOpen(false);
      setIsFilterOpen(false);
    }
  }, [showButtonsAndPanels, isFilterOpen, isAboutOpen, isMobile]);

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

  useEffect(() => {
    const preventContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);
    return () =>
      document.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  useEffect(() => {
    const checkScreenWidth = () => setIsMobile(window.innerWidth <= 768);
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

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

  const cameraZ = useMemo(() => {
    return isMobile ? 1.5 * modelWidthPx : modelWidthPx * 0.5;
  }, [isMobile]);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {showInstructions && (
        <div className="flex max-w-full max-h-fit rounded pb-4">
          <InstructionsPopup
            isMobile={isMobile}
            onClose={() => {
              setShowInstructions(false);
              setShowButtonsAndPanels(true);
            }}
          />
        </div>
      )}
      {showButtonsAndPanels && (
        <div className="absolute top-0 right-0 left-0 bottom-0 z-50 p-4 pointer-events-none">
          <TopBar
            isAboutOpen={isAboutOpen}
            isFilterOpen={isFilterOpen}
            isMobile={isMobile}
            onToggleAbout={() => setIsAboutOpen((prev) => !prev)}
            onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
          />

          <div className="flex flex-row max-h-full justify-between">
            <div className="flex flex-col">
              {isFilterOpen && (
                <TrainFilter
                  onChange={setVisibleTrainLinesWithOptionalLabels}
                  visibleTrainLinesWithOptionalLabels={
                    visibleTrainLinesWithOptionalLabels
                  }
                />
              )}
            </div>
            <div className="flex flex-col items-end">
              {isAboutOpen && <About />}
            </div>
          </div>
        </div>
      )}
      <Canvas
        className="absolute inset-0 z-0"
        camera={{
          position: [0, -cameraZ, cameraZ],
          fov: 50,
          up: [0, 0, 1],
          near: 0.3,
          far: 5000,
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
          minDistance={modelWidthPx * 0.1}
          maxDistance={modelWidthPx * 3}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          panSpeed={1}
          rotateSpeed={1}
          zoomSpeed={1}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
          touches={{
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_ROTATE,
          }}
        />
      </Canvas>
    </main>
  );
}
