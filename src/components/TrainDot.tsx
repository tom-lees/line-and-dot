import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type JSX } from "react";
import * as THREE from "three";
import type { CatmullRomCurve3 } from "three";
import type { TrainRecord } from "../types/train";
import Fuse from "fuse.js";

// TODO Add starting station
// TODO Logic for times between stations and train velocities
// TODO Start of model, estimating the position between station based on arrival times
//      This can be a rough estimate of times between stations hardcoded.
// TODO Popup or console log/error when there is not a station match.
// TODO This is running at 60 frames per second... but what if somes cpu ain't

let stationNameTest: string;

type StationU = {
  label: string;
  u: number;
  t?: number;
};

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/rail station|station/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const createStationMatcher = (stations: StationU[]) => {
  const fuse = new Fuse(stations, {
    keys: ["label"],
    threshold: 0.3,
    ignoreLocation: true,
    getFn: (obj, path) => normalise(obj[path as keyof StationU] as string),
  });

  return (stationName: string): StationU => {
    if (!stationName || !stations.length) {
      return stations[0];
    }

    const results = fuse.search(stationName);

    if (!results.length) {
      return stations[0];
    }

    const [best, second] = results;

    // Confidence gate: best must clearly win
    if (
      second &&
      best.score !== undefined &&
      second.score !== undefined &&
      best.score > second.score * 0.85
    ) {
      // ambiguous → fallback
      return stations[0];
    }

    return best.item;
  };
};

export const TrainDot = ({
  curve,
  stations,
  trainTimetable, // dynamic array, top entry = next station
  speed = 0.01,
  initialU = 0,
}: {
  curve: CatmullRomCurve3;
  stations: StationU[];
  trainTimetable: TrainRecord[];
  speed?: number;
  initialU?: number;
}): JSX.Element => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const stationMatcher = useMemo(() => {
    // console.log(
    //   "Stations normalised for matching:",
    //   stations.map((s) => ({
    //     original: s.label,
    //     normalised: normalise(s.label),
    //     u: s.u,
    //   }))
    // );
    return createStationMatcher(stations);
  }, [stations]);

  const initialStation = useMemo(() => {
    if (!trainTimetable.length) return stations[0];
    const matchedStation = stationMatcher(
      normalise(trainTimetable[0].stationName)
    );

    return {
      ...matchedStation,
      t: trainTimetable[0].expectedArrival,
    };
  }, []);

  const state = useRef({
    u: initialStation.u,
    targetU: initialStation.u,
    t: new Date().getTime(),
    targetT: initialStation.t,
    // TODO Estimate initial speed and initial position.
    speed: speed,
    moving: false,
    targetLabel: initialStation.label,
    ready: false,
  });

  useEffect(() => {
    if (!trainTimetable.length) return;

    const nextStation = stationMatcher(
      normalise(trainTimetable[0].stationName)
    );
    stationNameTest =
      "timetable: " +
      trainTimetable[0].stationName +
      " | next station matcher: " +
      nextStation.label;

    state.current.targetU = nextStation.u;
    state.current.targetLabel = nextStation.label;
    state.current.moving = true;
    state.current.targetT = trainTimetable[0].expectedArrival;
    state.current.speed =
      (nextStation.u - state.current.u) /
      ((trainTimetable[0].expectedArrival - new Date().getTime()) / 1000);
  }, [trainTimetable, stationMatcher]);

  useEffect(() => {
    // console.log(stationNameTest);
  }, [stationNameTest]);

  useFrame((_, delta) => {
    const s = state.current;

    if (!stations.length || !trainTimetable.length) return;

    if (!s.moving && s.targetU > s.u) {
      s.moving = true;
    }

    if (s.moving) {
      // console.log("moving: ", s.moving);
      s.u += s.speed * delta;
      // console.log("state u: ", s.u, s.speed, delta);

      if (s.u >= s.targetU) {
        // console.log("reached target", s.u, ">=", s.targetU);
        s.u = s.targetU;
        s.moving = false;
      }
    }

    const pos = curve.getPointAt(THREE.MathUtils.clamp(s.u, 0, 1));
    meshRef.current.position.copy(pos);
  });

  return (
    <mesh ref={meshRef} position={curve.getPointAt(initialU)}>
      <sphereGeometry args={[3, 100, 100]} />
      <meshBasicMaterial color="#ff0000" />
    </mesh>
  );
};
