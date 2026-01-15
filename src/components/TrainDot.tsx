import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type JSX } from "react";
import * as THREE from "three";
import type { TrainRecord } from "../types/train";
import { normalise, type SubsectionRuntime } from "../utils";

// TODO Add starting station
// TODO Logic for times between stations and train velocities
// TODO Start of model, estimating the position between station based on arrival times
//      This can be a rough estimate of times between stations hardcoded.
// TODO Popup or console log/error when there is not a station match.
// TODO This is running at 60 frames per second... but what if somes cpu ain't

function findSubsectionForNextStations(
  nextName: string,
  followingName: string,
  subsections: SubsectionRuntime[]
) {
  return subsections
    .map((sub) => {
      const next = sub.stationMatcher(nextName);
      const following = sub.stationMatcher(followingName);
      if (!next || !following) return null;
      if (next.u >= following.u) return null;
      return { subsection: sub, next, following };
    })
    .filter(Boolean)[0]; // first valid match
}

export const TrainDot = ({
  subsections,
  trainTimetable,
  speed = 0.01,
}: {
  subsections: SubsectionRuntime[];
  trainTimetable: TrainRecord[];
  speed?: number;
}): JSX.Element | null => {
  const meshRef = useRef<THREE.Mesh>(null);
  const uRef = useRef(0);
  const targetURef = useRef(0);

  const [activeSubsection, setActiveSubsection] =
    useState<SubsectionRuntime | null>(null);

  useEffect(() => {
    if (trainTimetable.length < 2) return;

    const nextName = normalise(trainTimetable[0].stationName);
    const followingName = normalise(trainTimetable[1].stationName);

    const matchResult = findSubsectionForNextStations(
      nextName,
      followingName,
      subsections
    );

    if (!matchResult) {
      console.warn(
        "No matching subsection found for stations:",
        nextName,
        "→",
        followingName
      );
      return;
    }

    console.log("Matched subsection:", matchResult.subsection.name);
    console.log(
      `Next: ${matchResult.next.label} (u=${matchResult.next.u}) → Following: ${matchResult.following.label} (u=${matchResult.following.u})`
    );

    setActiveSubsection(matchResult.subsection);

    // Set targetU to the next station's u
    targetURef.current = matchResult.next.u;
  }, [trainTimetable, subsections]);

  useFrame(() => {
    if (!meshRef.current) return;
    if (!activeSubsection) {
      console.warn("Active subsection not set yet");
      return;
    }
    if (!activeSubsection.curveData) {
      console.warn(
        "Active subsection has no curve data:",
        activeSubsection.name
      );
      return;
    }

    const delta = targetURef.current - uRef.current;
    const step = Math.sign(delta) * Math.min(Math.abs(delta), speed);
    uRef.current += step;

    // Clamp u between 0 and 1 for safety
    uRef.current = Math.min(Math.max(uRef.current, 0), 1);

    const pos = activeSubsection.curveData.curve.getPointAt(uRef.current);
    meshRef.current.position.set(pos.x, pos.y, pos.z);

    // Optional: log position every 10 frames to avoid spamming
    if (Math.floor(performance.now() / 100) % 10 === 0) {
      console.log(
        `TrainDot at u=${uRef.current.toFixed(3)}, pos=(${pos.x.toFixed(
          1
        )},${pos.y.toFixed(1)},${pos.z.toFixed(1)})`
      );
    }
  });

  if (!activeSubsection) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};

//   // Use trainTimetable to find which curve the the dot is on.
//   // trainTimetable: TrainRecord[]
//   // (alias) type TrainRecord = {
//   //     id: string;
//   //     destinationName: string;
//   //     direction: string;
//   //     expectedArrival: number;
//   //     lineId: string;
//   //     stationName: string;
//   //     timeCreate: number;
//   //     timeEdit: number;
//   //     timeToLive: number;
//   //     timeToStation: number;
//   //     vehicleId: string;
//   //
//   // This will involve matching the first and next station names to the network/lines/segments
//   // We will then have the curve and the stationUs for that segment.
//   // We will then have the current u and next u for the train dot to move between.
//   //
//   // If the next station is not found in the network, we need to need to recalculate the curve it is on.

//   const { curve, stationUs } = useMemo(() => {
//     // Use the trainTimetable to find the next station name
//     if (!trainTimetable.length) return
//     const nextStationName = trainTimetable[0].stationName;
//     const nextStationTime = trainTimetable[0].expectedArrival;

//     const match = matchTrainToCurve(nextStationName, network);

//   const stationMatcher = useMemo(() => {
//     // console.log(
//     //   "Stations normalised for matching:",
//     //   stations.map((s) => ({
//     //     original: s.label,
//     //     normalised: normalise(s.label),
//     //     u: s.u,
//     //   }))
//     // );

//     return createStationMatcher(stations);
//   }, [stations]);

//   const initialStation = useMemo(() => {
//     if (!trainTimetable.length) return stations[0];
//     const matchedStation = stationMatcher(
//       normalise(trainTimetable[0].stationName)
//     );

//     return {
//       ...matchedStation,
//       t: trainTimetable[0].expectedArrival,
//     };
//   }, []);

//   const state = useRef({
//     u: initialStation.u,
//     targetU: initialStation.u,
//     t: new Date().getTime(),
//     targetT: initialStation.t,
//     // TODO Estimate initial speed and initial position.
//     speed: speed,
//     moving: false,
//     targetLabel: initialStation.label,
//     ready: false,
//   });

//   useEffect(() => {
//     if (!trainTimetable.length) return;

//     const nextStation = stationMatcher(
//       normalise(trainTimetable[0].stationName)
//     );
//     stationNameTest =
//       "timetable: " +
//       trainTimetable[0].stationName +
//       " | next station matcher: " +
//       nextStation.label;

//     state.current.targetU = nextStation.u;
//     state.current.targetLabel = nextStation.label;
//     state.current.moving = true;
//     state.current.targetT = trainTimetable[0].expectedArrival;
//     state.current.speed =
//       (nextStation.u - state.current.u) /
//       ((trainTimetable[0].expectedArrival - new Date().getTime()) / 1000);
//   }, [trainTimetable, stationMatcher]);

//   useEffect(() => {
//     // console.log(stationNameTest);
//   }, [stationNameTest]);

//   useFrame((_, delta) => {
//     const s = state.current;

//     if (!stations.length || !trainTimetable.length) return;

//     if (!s.moving && s.targetU > s.u) {
//       s.moving = true;
//     }

//     if (s.moving) {
//       // console.log("moving: ", s.moving);
//       s.u += s.speed * delta;
//       // console.log("state u: ", s.u, s.speed, delta);

//       if (s.u >= s.targetU) {
//         // console.log("reached target", s.u, ">=", s.targetU);
//         s.u = s.targetU;
//         s.moving = false;
//       }
//     }

//     const pos = curve.getPointAt(THREE.MathUtils.clamp(s.u, 0, 1));
//     meshRef.current.position.copy(pos);
//   });

//   return (
//     <mesh ref={meshRef} position={curve.getPointAt(initialU)}>
//       <sphereGeometry args={[3, 100, 100]} />
//       <meshBasicMaterial color="#ff0000" />
//     </mesh>
//   );
// };
