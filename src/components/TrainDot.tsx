import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type JSX } from "react";
import * as THREE from "three";
import type { TrainRecord } from "../types/train";
import { normalise, type SubsectionRuntime } from "../utils";
import { Label } from "./Label";
import { klein } from "three/examples/jsm/Addons.js";

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

function findSubsectionForNextStations(
  nextName: string,
  followingName: string,
  subsections: SubsectionRuntime[],
) {
  return subsections
    .map((sub) => {
      const next = sub.stationMatcher(nextName);
      console.log("findSubsectionForNextStations -next:", next);
      const following = sub.stationMatcher(followingName);
      console.log("findSubsectionForNextStations -following:", following);
      if (!next || !following) {
        // console.log(
        //   "findSubsectionForNextStations - no match:",
        //   nextName,
        //   followingName,
        // );
        return null;
      }
      if (next.u >= following.u) {
        // console.log(
        //   "findSubsectionForNextStations - reverse order:",
        //   nextName,
        //   followingName,
        // );
        return null;
      }
      // console.log(
      //   "findSubsectionForNextStations - subsection:",
      //   sub.name,
      //   next,
      //   following,
      // );
      return { subsection: sub, next, following };
    })
    .filter(Boolean)[0]; // first valid match
}

export const TrainDot = ({
  subsections,
  trainTimetable,
}: {
  subsections: SubsectionRuntime[];
  trainTimetable: TrainRecord[];
  speed?: number;
}): JSX.Element | null => {
  const meshRef = useRef<THREE.Mesh>(null);
  // const uRef = useRef<number | undefined>(undefined);
  // const targetURef = useRef<number | undefined>(undefined);

  // TODO ASK I do not think i can declare the times here
  // as i do not know if the timetable will have my two records.
  // Can I declare them this early?
  const dotState = useRef<{
    subsection: SubsectionRuntime | null;
    uStart: number | undefined;
    uEnd: number | undefined;
    tStart: number | undefined; // ms timestamp
    tEnd: number | undefined; // ms timestamp
    isStartUp: boolean;
    isOnLeg: boolean;
    nextStationName: string | undefined;
    isTimetableChange: boolean;
  }>({
    subsection: null,
    uStart: undefined,
    uEnd: undefined,
    tStart: undefined,
    tEnd: undefined,
    isStartUp: true,
    isOnLeg: false,
    nextStationName: undefined,
    isTimetableChange: false,
  });

  useEffect(() => {
    // TODO For Leg 2:  we should store the next and following station elsewhere, as
    // when we are storing them in very close to when they expire, risking they might
    // despawn.
    if (trainTimetable.length < 2) return;
    if (dotState.current.isOnLeg) return; // Train is moving

    const now = new Date().getTime();

    // console.log(
    //   "useEffect now: ",
    //   new Date(now).toLocaleTimeString([], {
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     second: "2-digit",
    //   }),
    // );

    const nextName = normalise(trainTimetable[0].stationName);
    const followingName = normalise(trainTimetable[1].stationName);

    // console.log("nextName: ", nextName);
    // console.log("followingName: ", followingName);

    const subsectionWithPositions = findSubsectionForNextStations(
      nextName,
      followingName,
      subsections,
    );

    if (!subsectionWithPositions) {
      console.warn(
        "No matching subsection found for stations:",
        nextName,
        "→",
        followingName,
      );
      return;
    }

    // TODO Drop second condition as handled at top
    if (dotState.current.isStartUp && !dotState.current.isOnLeg) {
      console.log("FIRST LEG ");
      if (now < trainTimetable[0].expectedArrival) {
        console.log("Before");
        dotState.current.subsection = subsectionWithPositions.subsection;
        dotState.current.tStart = now;
        dotState.current.tEnd = trainTimetable[0].expectedArrival;
        const uAdjustment =
          (trainTimetable[0].expectedArrival - now) / (100 * 60 * 1000);
        // console.log("uAdjustment: ", uAdjustment);
        // console.log("next u: ", subsectionWithPositions.next.u);
        dotState.current.uStart = subsectionWithPositions.next.u - uAdjustment; //TODO Change notatoin inline with <tStart />
        // console.log("uStart: ", dotState.current.uStart);
        dotState.current.uEnd = subsectionWithPositions.next.u;
        // console.log("uEnd: ", dotState.current.uEnd);

        dotState.current.isOnLeg = true;
        dotState.current.isStartUp = false;

        dotState.current.nextStationName = nextName;
      }

      if (now >= trainTimetable[0].expectedArrival) {
        console.log("After");
        // TODO There is a minisecond where this is set and changes for the next if and needs to be accounted for.
        dotState.current.nextStationName = nextName;
        dotState.current.isOnLeg = false;
        dotState.current.isStartUp = false;
      }
    }

    if (dotState.current.nextStationName !== nextName) {
      console.log("START SUBSEQUENT LEG");
      console.log(dotState.current.nextStationName, nextName);
      dotState.current.isOnLeg = true;
      dotState.current.nextStationName = nextName;
    }

    if (!dotState.current.isStartUp && !dotState.current.isOnLeg) {
      console.log("SET SUBSEQUENT LEG");
      dotState.current.subsection = subsectionWithPositions.subsection;
      dotState.current.tStart = now;
      dotState.current.tEnd = trainTimetable[1].expectedArrival;
      dotState.current.uStart = subsectionWithPositions.next.u;
      dotState.current.uEnd = subsectionWithPositions.following.u;
      dotState.current.nextStationName = nextName;
    }
    // TODO Drop second condition as handled at top
    // if (!dotState.current.isStartUp && !dotState.current.isOnLeg) {
  }, [trainTimetable, subsections]);

  useEffect(() => {
    // Only retime if the train is currently moving
    if (!dotState.current.isOnLeg) return;

    const nextArrival = trainTimetable[0]?.expectedArrival;
    if (!nextArrival) return;

    if (nextArrival === dotState.current.tEnd) return;

    console.log("UPDATE tEnd");

    const now = Date.now();

    const { tStart, tEnd, uStart, uEnd } = dotState.current;

    if (
      tStart === undefined ||
      tEnd === undefined ||
      uStart === undefined ||
      uEnd === undefined
    ) {
      return;
    }
    // TODO Check this logic
    if (tEnd === nextArrival) return;

    const duration = tEnd - tStart;
    if (duration <= 0) return;

    console.log("UPDATE tEnd");

    const progress = (now - tStart) / duration;
    const clamped = Math.min(Math.max(progress, 0), 1);

    dotState.current.tStart = now - clamped * (nextArrival - now);
    dotState.current.tEnd = nextArrival;
  }, [trainTimetable]);

  useFrame(() => {
    // TODO Start should have initial stations
    // Perhaps even inital station -u x by time based parameter

    if (
      dotState.current.tStart === undefined ||
      dotState.current.uStart === undefined ||
      dotState.current.tEnd === undefined ||
      dotState.current.uEnd === undefined ||
      dotState.current.subsection === null ||
      meshRef.current === null ||
      !dotState.current.subsection.curveData.curve
    ) {
      console.warn("TrainDot state not fully initialised");
      return;
    }

    if (!dotState.current.isOnLeg) return;

    const now = new Date().getTime();
    const { tStart, tEnd, uStart, uEnd } = dotState.current;

    const duration = tEnd - tStart;
    // console.log("duration: ", duration);
    if (duration <= 0) return;

    // console.log("times:", { now, tStart, tEnd });
    const progress = (now - tStart) / duration;
    // console.log("progress: ", progress);
    const clamped = Math.min(Math.max(progress, 0), 1);
    // console.log("clamped: ", clamped);

    // console.log("uStart: ", uStart);
    // console.log("uEnd: ", uStart);

    const uCurrent = uStart + (uEnd - uStart) * clamped;
    // console.log("uCurrent: ", uCurrent);

    if (clamped >= 1) {
      dotState.current.isOnLeg = false;
      dotState.current.isStartUp = false; //TODO This may be removed, do we need to double set it just in case?
    }

    const pos =
      dotState.current.subsection.curveData.curve.getPointAt(uCurrent);

    meshRef.current.position.set(pos.x, pos.y, pos.z);
  });

  const isReady =
    dotState.current.subsection !== null &&
    dotState.current.tStart !== undefined &&
    dotState.current.tEnd !== undefined &&
    dotState.current.uStart !== undefined &&
    dotState.current.uEnd !== undefined;

  if (!isReady) {
    return null;
  }

  const round2 = (num: number): number => Math.round(num * 100) / 100;

  // TODO Learn fromEntries and object.entries.  I guess it is the rebuilding of an object.
  const { uStartRounded, uEndRounded, tStartRounded, tEndRounded } = {
    uStartRounded: round2(dotState.current.uStart!),
    uEndRounded: round2(dotState.current.uEnd!),
    tStartRounded: new Date(dotState.current.tStart!).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    tEndRounded: new Date(dotState.current.tEnd!).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };

  const isOnLegText = dotState.current.isOnLeg ? "Go" : "Stop";
  const uValuesText = `u [${uStartRounded}, ${uEndRounded}]`;
  const tValuesText = `t [${tStartRounded}, ${tEndRounded}]`;

  const labelText = `${isOnLegText} ${uValuesText} ${tValuesText}`;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 16, 16]} />
      <Label
        text={labelText}
        position={[0, 0, 0]}
        fontColour="#FF0000"
        fontSize={12}
      />
      <meshBasicMaterial color="red" />
    </mesh>
  );
};
