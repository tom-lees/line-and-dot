// TODOs
// Line in not centred, is scaling or normalisation off.
import { Dot } from "./components/dot";
import { network } from "./components/trainLines";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import useTrainData from "./hooks/useTrainData";
import type { TrainRecord } from "./types/train";

type stationWithU = {
  label: string;
  u: number;
};
const calculateTrainPosition = (
  train: TrainRecord,
  stations: stationWithU[]
): number => {
  const stationName = train.stationName.toLowerCase().replace(" ", "").trim();
  console.log("station name", stationName);
  const station = stations.find(
    (s) => s.label.toLowerCase().replace(" ", "").trim() === stationName
  );
  if (!station) {
    console.warn(`Station ${train.stationName} not found in stations list.`);
    return 0;
  }
  return station.u;
};

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const { trainData } = useTrainData();

  const [shenfieldTrains, setShenfieldTrains] = useState<
    Record<string, TrainRecord[]>
  >({});

  useEffect(() => {
    const shenfield = Object.fromEntries(
      Object.entries(trainData).filter(
        ([, records]) =>
          records.length > 0 &&
          records[0].destinationName === "Shenfield Rail Station"
      )
    );
    console.log("Trains to Shenfield ", shenfield);
    setShenfieldTrains(shenfield);
  }, [trainData]);

  //
  //  Stations & Station Sizing
  //
  const rawStations = network.elizabeth.subsections[0].stations;
  const minX = Math.min(...rawStations.map((n) => n.x));
  const maxX = Math.max(...rawStations.map((n) => n.x));
  const minY = Math.min(...rawStations.map((n) => n.y));
  const maxY = Math.max(...rawStations.map((n) => n.y));
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const maxDeviationX = Math.max(
    ...rawStations.map((n) => Math.abs(n.x - midX))
  );
  const maxDeviationY = Math.max(
    ...rawStations.map((n) => Math.abs(n.y - midY))
  );
  const maxDeviation = Math.max(maxDeviationX, maxDeviationY);

  const labeledPoints = network.elizabeth.subsections[0].stations.map((n) => ({
    label: n.name,
    position: new THREE.Vector3(
      (100 * (n.x - midX)) / maxDeviation,
      (100 * (n.y - midY)) / maxDeviation,
      0
    ),
  }));
  // TODO Add useMemo
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        labeledPoints.map((p) => p.position),
        false,
        "centripetal"
      ),
    [labeledPoints]
  );

  const stations: stationWithU[] = rawStations.map((s, i) => ({
    label: s.name,
    u: i / (rawStations.length - 1), // evenly spaced for now
  }));

  const dotsRef = useRef<Dot[]>([]);

  useEffect(() => {
    // TODO Logic to remove old dots
    dotsRef.current = [];

    Object.values(shenfieldTrains).forEach((records) => {
      const train = records[0];
      const u = calculateTrainPosition(train, stations);
      const dot = new Dot(curve, stations, u);
      dotsRef.current.push(dot);
    });
  }, [shenfieldTrains, curve, stations]);

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === "Enter" && dotRef.current) {
  //       dotRef.current.resume();
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    camera.position.z = 150;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountNode.appendChild(renderer.domElement);

    const curvePoints = curve.getPoints(100); // 100 = number of segments for smoothness
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    if (dotsRef.current) {
      dotsRef.current.forEach((dot) => {
        scene.add(dot.mesh);
      });
    }

    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (dotsRef.current) {
        dotsRef.current.forEach((dot) => {
          dot.update();
        });
      }
      renderer.render(scene, camera);
    };
    animate();
    // Cleanup
    return () => {
      if (typeof rafId === "number") cancelAnimationFrame(rafId);
      if (mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [curve]);

  return (
    <>
      <div
        className="h-screen w-screen overflow-hidden m-0 p-0"
        ref={mountRef}
      />
    </>
  );
}

export default App;
