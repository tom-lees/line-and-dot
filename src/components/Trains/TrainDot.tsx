import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type JSX } from "react";
import * as THREE from "three";
import {
  findPreviousSubsectionAndStationDetails,
  findSubsectionAndStationDetails,
  handleIdle,
  handleInitialise,
  handleMoving,
} from "./train.logic";
import type {
  IdleTrainState,
  MovingTrainState,
  SubsectionRuntime,
  TrainState,
} from "./train.types";
import type { TimetableStore } from "../../data/train/train.service.types";
import { DebugLabel } from "../Label/DebugLabel";
import { Label } from "../Label/Label";
import { nameNormalised, tUnixToTimeString } from "./traindot.utils";

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
const devOn = false;

export const TrainDot = ({
  subsections,
  trainStore,
}: {
  subsections: SubsectionRuntime[];
  trainStore: TimetableStore;
}): JSX.Element | null => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const MAX_DEBUG_LINES = 5;
  const [debugText, setDebugText] = useState<string[]>([]);
  const appendDebugLine = (newLine: string) => {
    const timestamp = tUnixToTimeString(Date.now());
    const newLineWithTime = `${timestamp} ${newLine}`;
    setDebugText((prev) => {
      const updated = [...prev, newLineWithTime];
      if (updated.length > MAX_DEBUG_LINES) {
        updated.shift();
      }
      return updated;
    });
  };

  const dotState = useRef<TrainState>({ type: "initialise" });

  // TODO Testing
  // const prevTrainTimetable = useRef<TrainRecord[]>([]);
  // const [prevStationName, setPrevStationName] = useState<string>("");
  // useEffect(() => {
  //   const curr = trainStore.timetable;
  //   const prev = prevTrainTimetable.current;
  //   if (prev.length > 0 && curr.length > 0 && curr[0].id !== prev[0].id) {
  //     setPrevStationName(prev[0].stationName);
  //   }
  //   prevTrainTimetable.current = curr;
  // }, [trainStore]);

  // useEffect(() => {

  //   const onVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       dotState.current = { type: "initialise" };
  //     }
  //   };
  //   document.addEventListener("visibilitychange", onVisibilityChange);
  //   return () =>
  //     document.removeEventListener("visibilitychange", onVisibilityChange);
  // }, []);

  useEffect(() => {
    // appendDebugLine(
    //   `---- tt0: ${trainStore.timetable[0].stationName} - ${trainStore.timetable[0].direction}`,
    // );

    const now = Date.now();

    let subsectionAndStationDetails = findSubsectionAndStationDetails({
      subsections,
      trainStore,
    });

    appendDebugLine(
      `---- TT: stationName: ${nameNormalised(trainStore.timetable[0].stationName)}    timeEdit: ${tUnixToTimeString(trainStore.timetable[0].timeEdit)}    expectedArrival: ${tUnixToTimeString(trainStore.timetable[0].expectedArrival)}    timeToLive: ${tUnixToTimeString(trainStore.timetable[0].timeToLive)}    timeToStation: ${tUnixToTimeString(trainStore.timetable[0].timeToStation)}`,
    );
    appendDebugLine(
      `---- d1: ${nameNormalised(subsectionAndStationDetails?.destination1.label)} - ${tUnixToTimeString(subsectionAndStationDetails?.destination1?.t)}    d2: ${nameNormalised(subsectionAndStationDetails?.destination2?.label)} - ${tUnixToTimeString(subsectionAndStationDetails?.destination2?.t)}`,
    );

    if (!subsectionAndStationDetails) {
      // const nextTwoStations = `${nameNormalised(trainStore.timetable[0].stationName)} ${trainStore.timetable[0].direction} ${nameNormalised(trainStore.timetable[1]?.stationName)}`;
      // appendDebugLine(`#### no sub match: ${nextTwoStations}`);
      return;
    }

    // If destination1 u + uAdjustment is less than 0,
    // the train is before that subsection of the line.
    // So we find the previous subsection.
    // (If does not exist, train is at start of line.)
    // TODO Estimate of line length (100), will not apply to all lines
    // TODO This estimate is for the longest line and may
    const uAdjustment =
      (subsectionAndStationDetails.destination1.t - now) / (100 * 60 * 1000);
    if (subsectionAndStationDetails.destination1.u - uAdjustment < 0) {
      const prev = findPreviousSubsectionAndStationDetails({
        subsections,
        trainTimetable: trainStore.timetable,
      });
      if (prev) subsectionAndStationDetails = prev;
    }

    const { destination1, destination1Id, destination2, subsection } =
      subsectionAndStationDetails;

    if (destination1.t && destination2?.t && destination1.t > destination2.t) {
      appendDebugLine(
        `#### timetable: ${nameNormalised(trainStore.timetable[0].stationName)} ${tUnixToTimeString(trainStore.timetable[0].expectedArrival)} ${nameNormalised(trainStore.timetable[1].stationName)} ${tUnixToTimeString(trainStore.timetable[1].expectedArrival)}`,
      );
    }
    dotState.current = (() => {
      switch (dotState.current.type) {
        case "initialise": {
          appendDebugLine(
            `---- case initialise: ${nameNormalised(destination1.label)} ${tUnixToTimeString(destination1.t)} ${nameNormalised(destination2?.label)} ${tUnixToTimeString(destination2?.t)}`,
          );
          const trainState = handleInitialise({
            destination1,
            destination1Id,
            now,
            subsection,
            destination2,
          });
          appendDebugLine(
            `---- state: ${trainState.type} ${tUnixToTimeString(trainState.tStart)} ${tUnixToTimeString(trainState.tEnd)}`,
          );
          return trainState;
        }
        case "idle": {
          appendDebugLine(
            `---- case idle: ${nameNormalised(destination1.label)} ${tUnixToTimeString(destination1.t)} ${nameNormalised(destination2?.label)} ${tUnixToTimeString(destination2?.t)}`,
          );
          const trainState = handleIdle({
            destination1,
            destination1Id,
            now,
            state: dotState.current as IdleTrainState,
            subsection,
            destination2,
            debug: appendDebugLine,
          });
          appendDebugLine(
            `---- state: ${trainState.type} ${tUnixToTimeString(trainState.tStart)} ${tUnixToTimeString(trainState.tEnd)}`,
          );
          return trainState;
        }
        case "moving": {
          appendDebugLine(
            `---- case moving: ${nameNormalised(destination1.label)} ${tUnixToTimeString(destination1.t)} ${nameNormalised(destination2?.label)} ${tUnixToTimeString(destination2?.t)}`,
          );
          const trainState = handleMoving({
            destination1,
            destination1Id,
            destination2,
            now,
            state: dotState.current as MovingTrainState,
            subsection,
            debug: appendDebugLine,
          });
          appendDebugLine(
            `---- state: ${trainState.type} ${tUnixToTimeString(trainState.tStart)} ${tUnixToTimeString(trainState.tEnd)}`,
          );
          return trainState;
        }
      }
    })();
  }, [trainStore, subsections]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.lookAt(camera.position);

    const distance = camera.position.distanceTo(meshRef.current.position);
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const A = 33000000;
    const B = 100;
    const offset = -1 * (A / (distance * distance) + B);
    // console.log(offset);
    mat.polygonOffsetUnits = offset;

    const state = dotState.current;

    const maxOpacity =
      "timeIdle" in state &&
      state.timeIdle &&
      Date.now() - state.timeIdle > 120 * 1000
        ? 0.2
        : 0.7;
    const fade = Math.max(
      0,
      Math.min(
        maxOpacity,
        distance > 200 ? 1 - (distance - 200) / 100 : maxOpacity,
      ),
    );
    mat.opacity = fade;

    if (state.type === "initialise") {
      appendDebugLine(`frame: dotState initialise exit`);
      return;
    }

    if (state.type === "idle") {
      // appendDebugLine(
      //   `frame: dotState idle - set pos to state.uStart - ${uRounded(state.uStart)}`,
      // );
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

  const labelText = `${trainStore.timetable[0].vehicleId.slice(-4)}`;

  return (
    <mesh ref={meshRef}>
      {import.meta.env.DEV && devOn && (
        <>
          <DebugLabel
            texts={debugText}
            position={[0, 0, 0]}
            fontSize={12}
            rotate={"horizontal"}
          />
          <Label
            text={labelText}
            position={[0, 0, 0]}
            fontSize={12}
            rotate={"vertical"}
          />
        </>
      )}
      <circleGeometry args={[1, 32]} /> {/* 2D circle */}
      <meshStandardMaterial
        color="white"
        emissive="white"
        emissiveIntensity={1}
        transparent
        depthWrite={false}
        depthTest={true} // only render where in front
        polygonOffset // enable offset
      />
    </mesh>
  );
};
