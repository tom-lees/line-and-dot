import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type JSX } from "react";
import * as THREE from "three";
import type { TrainRecord } from "../../types/train";
import {
  findPreviousSubsectionAndStationDetails,
  findSubsectionAndStationDetails,
  handleIdle,
  handleInitialise,
  handleMoving,
} from "./trainLogic";
import type {
  IdleTrainState,
  MovingTrainState,
  SubsectionRuntime,
  TrainState,
} from "./trainTypes";
import { Label } from "../Label";
import { normalise } from "../../utils";

// TODO Add timetracker.  If train has been sationary for longer time fade out.
// TODO How to handle object delection, is that in parent.

// TODO Issue, trains that are skipping stations, across multiple of our segments.
//      This may make the tranfer logic between lines break.

// TODO Estimate of placement before initial position is based on 1hr30-1hr50 across whole line.
//      ~ 100 minutes.  Therefore if a train is coming up to station x on initialation, we can
//      remove # of minutes / 100 from u.  IE, train est.arrival for station x is 2 mins.  Take
//      station x's u and minus 2/100 * u from it.  (U is always 1, so take 0.02 from station
//      x's u)

// TODO Add starting station
// TODO Logic for times between stations and train velocities
// TODO Start of model, estimating the position between station based on arrival times
//      This can be a rough estimate of times between stations hardcoded.
// TODO Popup or console log/error when there is not a station match.
// TODO This is running at 60 frames per second... but what if somes cpu ain't
// TODO Farrinddon => London Liverpool Street breaks
// TODO Test a delayed train.  Add tags with tEnd times and if tEnd changes indicate somehow.

// TODO Del once trainLogic complete
// function findSubsectionForNextStations(
//   nextName: string,
//   followingName: string,
//   subsections: SubsectionRuntime[],
// ) {
//   return subsections
//     .map((sub) => {
//       const next = sub.stationMatcher(nextName);
//       const following = sub.stationMatcher(followingName);
//       if (!next || !following) {
//         return null;
//       }
//       if (next.u >= following.u) {
//         return null;
//       }
//       // console.log( "findSubsectionForNextStations - subsection:", sub.name, next, following,);
//       return { subsection: sub, next, following };
//     })
//     .filter(Boolean)[0]; // first valid match
// }

export const TrainDot = ({
  subsections,
  trainTimetable,
}: {
  subsections: SubsectionRuntime[];
  trainTimetable: TrainRecord[];
  speed?: number;
}): JSX.Element | null => {
  const meshRef = useRef<THREE.Mesh>(null);

  const dotState = useRef<TrainState>({ type: "initialise" });

  // TODO Testing
  const prevTrainTimetable = useRef<TrainRecord[]>([]);
  const [prevStationName, setPrevStationName] = useState<string>("");
  useEffect(() => {
    const curr = trainTimetable;
    const prev = prevTrainTimetable.current;
    if (prev.length > 0 && curr.length > 0 && curr[0].id !== prev[0].id) {
      setPrevStationName(prev[0].stationName);
    }
    prevTrainTimetable.current = curr;
  }, [trainTimetable]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        dotState.current = { type: "initialise" };
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const now = Date.now();

    let subsectionAndStationDetails = findSubsectionAndStationDetails({
      subsections,
      trainTimetable,
    });

    //TODO Error log which subsections are failing
    if (!subsectionAndStationDetails) {
      // console.log("no subsection match");
      return;
    }
    // console.log("useEffect idle:", subsectionAndStationDetails.subsection.name);

    // If destination1 u + uAdjustment is less than 0,
    // the train is before that subsection of the line.
    // So we find the previous subsection.
    // (If does not exist, train is at start of line.)
    // TODO Estimate of line length (100), will not apply to all lines
    const uAdjustment =
      (subsectionAndStationDetails.destination1.t - now) / (100 * 60 * 1000);
    if (subsectionAndStationDetails.destination1.u - uAdjustment < 0) {
      // console.log("prev");
      const prev = findPreviousSubsectionAndStationDetails({
        subsections,
        trainTimetable,
      });
      if (prev) subsectionAndStationDetails = prev;
    }

    const { destination1, destination1Id, destination2, subsection } =
      subsectionAndStationDetails;

    dotState.current = (() => {
      switch (dotState.current.type) {
        case "initialise": {
          return handleInitialise({
            destination1,
            destination1Id,
            now,
            subsection,
            destination2,
          });
        }
        case "idle":
          return handleIdle({
            destination1,
            destination1Id,
            now,
            state: dotState.current as IdleTrainState,
            subsection,
            destination2,
          });

        case "moving":
          return handleMoving({
            destination1,
            destination1Id,
            destination2,
            now,
            state: dotState.current as MovingTrainState,
            subsection,
          });
      }
    })();
  }, [trainTimetable, subsections]);

  useFrame(() => {
    const state = dotState.current;

    if (state.type === "initialise") return;

    if (state.type === "idle") {
      // console.log("useframe idle:", state.subsection.name);
      const pos = state.subsection.curveData.curve.getPointAt(state.uStart);
      if (meshRef.current) meshRef.current.position.set(pos.x, pos.y, pos.z);
    }

    if (state.type === "moving") {
      const progress = Math.min(
        Math.max((Date.now() - state.tStart) / (state.tEnd - state.tStart), 0),
        1,
      );

      const uCurrent = state.uStart + (state.uEnd - state.uStart) * progress;

      const pos = state.subsection.curveData.curve.getPointAt(uCurrent);
      if (meshRef.current) meshRef.current.position.set(pos.x, pos.y, pos.z);

      if (progress >= 1) {
        dotState.current = {
          ...state,
          type: "idle",
          tStart: state.tEnd,
          uStart: state.uEnd,
        } as IdleTrainState;
      }
    }
  });

  if (dotState.current.type === "initialise") {
    return null;
  }
  //TODO Testing remove after
  // if (dotState.current.type === "idle") {
  //   return null;
  // }

  // const round2 = (num: number): number => Math.round(num * 100) / 100;

  // TODO Learn fromEntries and object.entries.  I guess it is the rebuilding of an object.
  // const { tStartRounded, tEndRounded } = {
  //   //   // uStartRounded: round2(dotState.current.uStart!),
  //   //   // uEndRounded: round2(dotState.current.uEnd!),
  //   tStartRounded: new Date(dotState.current.tStart!).toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   }),
  //   tEndRounded: new Date(dotState.current.tEnd!).toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   }),
  // };

  // // const isOnLegText = dotState.current.isOnLeg ? "Go" : "Stop";
  // const uValuesText = `u [${uStartRounded}, ${uEndRounded}]`;
  // // const tValuesText = `t [${tStartRounded}, ${tEndRounded}]`;

  // const labelText = `${isOnLegText} ${tValuesText} ${trainTimetable[0].vehicleId}`;
  // const labelText = `${trainTimetable[0].vehicleId.slice(-3)} ${uValuesText}`;
  // const labelText = `${normalise(prevStationName)} ${normalise(trainTimetable[0].stationName)} ${trainTimetable[0].vehicleId.slice(-3)}`;
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};
      // <Label
      //   text={labelText}
      //   position={[0, 0, 0]}
      //   fontColour="#FF0000"
      //   fontSize={12}
      //   rotate="vertical"
      // />
