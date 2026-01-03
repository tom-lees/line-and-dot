import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { CatmullRomCurve3 } from "three";
import type { TrainRecord } from "../types/train";

type StationU = {
  label: string;
  u: number;
};

export const TrainDot = ({
  curve,
  stations,
  trainUpdates, // dynamic array, top entry = next station
  speed = 0.01,
  initialU = 0,
}: {
  curve: CatmullRomCurve3;
  stations: StationU[];
  trainUpdates: TrainRecord[];
  speed?: number;
  initialU?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const state = useRef({
    u: initialU, // current position along the curve
    targetU: initialU, // u of the current target station
    moving: false, // is the train currently moving
    targetLabel: "", // label of the current target station
  });

  // TODO Does tracking use a partial match for station names.
  useFrame(() => {
    const s = state.current;

    if (!stations.length || !trainUpdates.length) return;

    // The next station is always the top entry in trainUpdates
    const nextUpdate = trainUpdates[0];
    const nextLabel = nextUpdate.stationName;

    // Find the u coordinate of that station
    const nextStation = stations.find((st) => st.label === nextLabel);
    if (!nextStation) return;

    // If the target changed, start moving toward it
    if (s.targetLabel !== nextLabel) {
      s.targetU = nextStation.u;
      s.targetLabel = nextLabel;
      s.moving = true;
    }

    // Move toward target
    if (s.moving) {
      s.u += speed;

      if (s.u >= s.targetU) {
        s.u = s.targetU;
        s.moving = false;
        console.log(`Arrived at ${nextLabel}`);
      }
    }

    // Update dot position along the curve
    const pos = curve.getPointAt(THREE.MathUtils.clamp(s.u, 0, 1));
    meshRef.current.position.copy(pos);
  });

  return (
    <mesh ref={meshRef} position={curve.getPointAt(initialU)}>
      <sphereGeometry args={[5, 10, 10]} />
      <meshBasicMaterial color="#ff0000" />
    </mesh>
  );
};
