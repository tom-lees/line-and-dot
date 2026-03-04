import type {
  IdleTrainState,
  MovingTrainState,
  SubsectionRuntime,
} from "./train.types";
import type { TrainRecord } from "../../domain/train";
import { normaliseName } from "../../App/station.name.normalise";
import type { StationWithUAndT } from "../../App/station.types";
import type { TimetableStore } from "../../data/train/train.service.types";
import { tUnixToTimeString } from "./traindot.utils";

export function findSubsectionAndStationDetails(
  // TODO Testing which includes the appended t values
  // TODO Thoughts of shallow and deep copies.  Do not think necessary but needs more thought.
  // TODO Ask, should I proritise reassigning new parameters, or use the state. when nothing changes?
  {
    subsections,
    trainStore,
    debug,
  }: {
    subsections: SubsectionRuntime[];
    trainStore: TimetableStore;
    debug?: (msg: string) => void;
  },
):
  | {
      destination1: StationWithUAndT;
      destination1Id: string;
      destination2?: StationWithUAndT;
      subsection: SubsectionRuntime;
    }
  | undefined {
  if (!trainStore.timetable?.length) return;

  const timetable = trainStore.timetable;

  // const destination1Direction = timetable[0].direction;
  const destination1Id = timetable[0].id;
  const destination1name = normaliseName(timetable[0].stationName);
  const destination1T = timetable[0].expectedArrival;

  let debugText = `${destination1name}`;

  if (timetable.length > 1) {
    const destination2name = normaliseName(timetable[1].stationName);
    debugText = `${debugText} ${destination2name}`;
    const destination2T = timetable[1].expectedArrival;

    return subsections
      .map((sub) => {
        // if (sub.type !== destination1Direction) return undefined;
        const destination1 = sub.stationMatcher(destination1name);
        const destination2 = sub.stationMatcher(destination2name);
        if (!destination1 || !destination2) return undefined;
        if (destination1.u >= destination2.u) return undefined;
        debugText = `${debugText} ${sub.name}`;
        debug?.(debugText);
        return {
          destination1: { ...destination1, t: destination1T },
          destination1Id,
          destination2: { ...destination2, t: destination2T },
          subsection: sub,
        };
      })
      .find(Boolean);
  }

  if (timetable.length === 1) {
    // TODO When a train spawns in is unknown what track they are on.
    // ---- We could place trains in the centre of stations,
    // ---- they could move towards correct track when more details spawn.
    // ---- We could have trains be faded if this occurs, only when
    // ---- more details spawn do they light up

    return subsections
      .map((sub) => {
        // if (sub.type !== destination1Direction) return undefined;
        const destination1 = sub.stationMatcher(destination1name);
        if (!destination1) return undefined;
        // Handles when final record on line does not have a direction
        // TODO Unsure if this works for both start and end of line. Still getting 1% error rate
        // if (destination1.u < 1) return undefined;
        debugText = `${debugText} ${sub.name}`;
        debug?.(debugText);
        return {
          destination1: { ...destination1, t: destination1T },
          destination1Id,
          subsection: sub,
        };
      })
      .find(Boolean);
  }
}

export function findPreviousSubsectionAndStationDetails({
  subName,
  subsections,
  trainTimetable,
  debug,
}: {
  subName: string;
  subsections: SubsectionRuntime[];
  trainTimetable: TrainRecord[];
  debug?: (msg: string) => void;
}):
  | {
      destination1: StationWithUAndT;
      destination1Id: string;
      subsection: SubsectionRuntime;
    }
  | undefined {
  if (!trainTimetable?.length) return;
  debug?.(`oooo fpssd TT ${trainTimetable[0].stationName}`);

  const destination1Id = trainTimetable[0].id;
  const destination1name = normaliseName(trainTimetable[0].stationName);
  const destination1T = trainTimetable[0].expectedArrival;
  debug?.(`---- fpssd ${destination1name}`);

  return subsections
    .map((sub) => {
      const destination1 = sub.stationMatcher(destination1name);
      debug?.(`${destination1name} - ${destination1?.label}`);
      if (sub.name.includes("euston (long")) {
        // debug?.("###############");
        // debug?.(`${destination1}`);
      }
      if (!destination1) {
        // debug?.("###############");
        // debug?.(`undefined exit`);
        return undefined;
      }
      if (destination1.u < 0.5) return undefined;
      if (
        (subName.includes("Outbound") && sub.name.includes("Inbound")) ||
        (subName.includes("Inbound") && sub.name.includes("Outbound"))
      )
        return undefined;
      // debug?.(`---- fpssd ${destination1.label}`);
      // debug?.(`---- fpssd ${sub.name}`);
      return {
        destination1: { ...destination1, t: destination1T },
        destination1Id,
        subsection: sub,
      };
    })
    .find(Boolean);
}

export function handleInitialise({
  destination1,
  destination1Id,
  now,
  subsection,
  destination2,
  debug,
}: {
  destination1: StationWithUAndT;
  destination1Id: string;
  now: number;
  subsection: SubsectionRuntime;
  destination2?: StationWithUAndT;
  debug?: (msg: string) => void;
}): IdleTrainState | MovingTrainState {
  const { u: u1, t: t1 } = destination1;
  const { u: u2 = undefined, t: t2 = undefined } = destination2 || {};

  // TODO This will need adjusting for each line.  100 works for Elizabeth line. Update tests accordingly.
  const uAdjustment = (t1 - now) / (100 * 60 * 1000);

  //
  //  0  Train is moving
  //

  if (t1 > now && u1 - uAdjustment > 0) {
    debug?.("---- handleInit - train is moving");
    return {
      type: "moving",
      id: destination1Id,
      subsection,
      tEnd: t1,
      timeLastChange: now,
      tStart: now,
      uEnd: u1,
      uStart: u1 - uAdjustment,
    };
  }

  //
  //  1  Train is idle (at station)
  //

  // if (now >= destination1t || 0 <= destination1u - uAdjustment) {}
  // console.log(u1);
  debug?.("---- handleInit - train is idle");
  return {
    type: "idle",
    id: destination1Id,
    subsection,
    tEnd: t2,
    timeLastChange: now,
    tStart: t1,
    uEnd: u2,
    uStart: u1,
  };
}

export function handleIdle({
  destination1,
  destination1Id,
  now,
  state,
  subsection,
  destination2,
  debug,
}: {
  destination1: StationWithUAndT;
  destination1Id: string;
  now: number;
  state: IdleTrainState;
  subsection: SubsectionRuntime;
  destination2?: StationWithUAndT;
  debug?: (msg: string) => void;
}): IdleTrainState | MovingTrainState {
  // TODO could this break when destination1 changes mid run.
  // When does this run, why does it run, do they overlap...?

  //
  //  Line change over
  //

  if (destination2) {
    if (destination2.t - now < 60000) {
      debug?.(`-------- handleIdle: d2 && 60s GO`);
      return {
        type: "moving",
        id: "60 seconds forced move",
        subsection,
        tEnd: destination2.t,
        timeLastChange: now,
        tStart: now,
        uEnd: destination2.u,
        uStart: destination1.u,
      };
    }
    if (
      destination1.t === state.tStart &&
      destination1.u === state.uStart &&
      destination1Id === state.id &&
      subsection === state.subsection &&
      destination2.t === state.tEnd &&
      destination2.u === state.uEnd
    ) {
      debug?.(`-------- handleIdle: d2 && no change`);
      return { ...state, timeLastChange: now };
    }

    if (subsection === state.subsection && destination1Id === state.id) {
      debug?.(`-------- handleIdle: d2 && t or u data change`);
      return {
        type: "idle",
        id: destination1Id,
        subsection,
        tEnd: destination2.t,
        timeLastChange: now,
        tStart: destination1.t,
        uEnd: destination2.u,
        uStart: destination1.u,
      };
    }

    if (subsection === state.subsection && destination1Id !== state.id) {
      debug?.(`-------- handleIdle: d2 && GO`);
      return {
        type: "moving",
        id: destination1Id,
        subsection,
        tEnd: destination1.t,
        timeLastChange: now,
        tStart: now,
        uEnd: destination1.u,
        uStart: state.uStart,
      };
    }

    if (subsection !== state.subsection && destination1Id === state.id) {
      debug?.(
        `-------- handleIdle: d2 && sub change - state ${state.subsection.name}  new ${subsection.name}`,
      );
      return {
        type: "idle",
        id: destination1Id,
        subsection,
        tEnd: destination2.t,
        timeLastChange: now,
        tStart: destination1.t,
        uEnd: destination2.u,
        uStart: destination1.u,
      };
    }

    if (subsection !== state.subsection && destination1Id !== state.id) {
      // TODO Needs serious testing
      debug?.(
        `-------- handleIdle: d2 && sub & id change - state ${state.subsection.name}  new ${subsection.name} - state ${state.id}  new ${destination1Id}`,
      );
      const setUStart =
        destination1.u - (destination2.u - destination1.u) > 0.2
          ? destination1.u
          : 0;
      return {
        type: "moving",
        id: destination1Id,
        subsection,
        tEnd: destination1.t,
        timeLastChange: now,
        tStart: now,
        uEnd: destination1.u,
        uStart: setUStart,
      };
    }
  }

  //
  // destination2 has despawned, make sure train finishes on same line
  //
  if (state.tEnd && state.uEnd) {
    return {
      type: "moving",
      id: destination1Id,
      subsection: state.subsection,
      tEnd: destination1.t,
      timeLastChange: now,
      tStart: now,
      uEnd: destination1.u,
      uStart: state.uStart,
    };
  }

  //
  //  only destination1 and no records changed, exit.
  //
  if (
    destination1.t === state.tStart &&
    destination1.u === state.uStart &&
    destination1Id === state.id &&
    subsection === state.subsection
  )
    return { ...state, timeLastChange: now };

  //
  // only destination1 and parameters have changed
  //

  if (destination1Id === state.id)
    return {
      type: "idle",
      id: destination1Id,
      subsection,
      timeLastChange: now,
      tStart: destination1.t,
      uStart: destination1.u,
    };

  //
  // only destination1 and record OR subsection (line) has changed
  // (this should be a rare occurance)

  if (destination1Id !== state.id || subsection !== state.subsection) {
    return {
      type: "idle",
      id: destination1Id,
      subsection,
      timeLastChange: now,
      tStart: destination1.t,
      uStart: destination1.u,
    };
  }

  console.error(
    "handleIdle: all conditional has not captured idle train; please investigate",
  );
  return { ...state, timeLastChange: now };
}

export function handleMoving({
  destination1,
  destination1Id,
  destination2,
  now,
  state,
  subsection,
  debug,
}: {
  destination1: StationWithUAndT;
  destination1Id: string;
  destination2?: StationWithUAndT;
  now: number;
  state: MovingTrainState;
  subsection: SubsectionRuntime;
  debug?: (msg: string) => void;
}): IdleTrainState | MovingTrainState {
  if (destination2 && now >= state.tEnd) {
    debug?.(`-------- handleMoving: d2 && now >= state.tEnd`);
    return {
      type: "idle",
      id: destination1Id,
      subsection,
      tEnd: destination2.t,
      timeLastChange: now,
      tStart: destination1.t,
      uEnd: destination2.u,
      uStart: destination1.u,
    };
  }

  if (now >= state.tEnd) {
    debug?.(`-------- handleMoving: d1 - now >= state.tEnd`);
    return {
      type: "idle",
      id: destination1Id,
      subsection,
      timeLastChange: now,
      tStart: destination1.t,
      uStart: destination1.u,
    };
  }

  // Delay to next station; Update tEnd if destintion1.t has changed
  if (state.id === destination1Id && state.tEnd !== destination1.t) {
    debug?.(`-------- handleMoving: handle delay/early`);

    if (state.tEnd - state.tStart <= 0) {
      debug?.(`######## handleMoving: state.tEnd < state.tStart`);
      // console.error("handleMoving train delay: tEnd - tStart < 0");
      // console.log(
      //   `handle moving: tEnd before tStart`,
      //   state.subsection.name,
      //   destination1.label,
      // );
      return { ...state, timeLastChange: now };
    }

    // Trains currect progress proportionally between uStart and uEnd
    const progress = Math.min(
      Math.max((now - state.tStart) / (state.tEnd - state.tStart), 0),
      1,
    );
    debug?.(`-------- handleMoving: delay - progress ${progress}`);

    // To keep the train's position (u) consistent when tEnd changes
    // We will have to also adjust tStart accordingly
    // 0      tstart     tcurrent     tend-->         a delay happens
    // 1   <--tstart       tcurent           tend     we adjust tstart
    // 2   tstart        tcurent      tend            this keeps the proportion/position consistent
    let newTStart = (progress * destination1.t - now) / (progress - 1);
    let newTEnd = destination1.t;

    // However if newTEnd < newTStart, due to destination1.t being set
    // too early the train will reverse, we need to manually counter this.
    // TODO Test with extra 5 seconds
    if (newTEnd < newTStart + 5000) {
      const now = Date.now();
      newTStart = (progress * 5000) / (progress - 1);
      newTEnd = now + 5000;
      debug?.(
        `###### handleMoving: delay - tE<tS ${tUnixToTimeString(newTStart)} ${tUnixToTimeString(newTEnd)}`,
      );
    }
    return { ...state, timeLastChange: now };
  }

  return { ...state, timeLastChange: now };
}
