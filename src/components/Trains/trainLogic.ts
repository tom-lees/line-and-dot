import type {
  IdleTrainState,
  MovingTrainState,
  SubsectionRuntime,
} from "./trainTypes";
import { normalise, type StationU } from "../../utils";
import type { TrainRecord } from "../../types/train";

// TODO Test involves taking every single station from API, adding to js file, with perhaps line and end station
// We can then put this in an array and test for every station combination.
// Once we have the corpus of stations, we can continually check every station if in our corpus, raise an error for new station
// names.

export function findSubsectionAndStationDetails(
  // TODO Testing which includes the appended t values
  // TODO SubsectionRuntime might need adjust, like a tag for which line.
  // TODO Thoughts of shallow and deep copies.  Do not think necessary but needs more thought.
  // TODO Ask, should I proritise reassigning new parameters, or use the state. when nothing changes?
  {
    subsections,
    trainTimetable,
  }: {
    subsections: SubsectionRuntime[];
    trainTimetable: TrainRecord[];
  },
):
  | {
      destination1: StationU;
      destination1Id: string;
      destination2?: StationU;
      subsection: SubsectionRuntime;
    }
  | undefined {
  if (!trainTimetable?.length) return;

  const destination1Id = trainTimetable[0].id;
  const destination1name = normalise(trainTimetable[0].stationName);
  const destination1T = trainTimetable[0].expectedArrival;

  if (trainTimetable.length > 1) {
    const destination2name = normalise(trainTimetable[1].stationName);
    const destination2T = trainTimetable[1].expectedArrival;

    return subsections
      .map((sub) => {
        const destination1 = sub.stationMatcher(destination1name);
        const destination2 = sub.stationMatcher(destination2name);
        if (!destination1 || !destination2) return undefined;
        if (destination1.u >= destination2.u) return undefined;
        return {
          destination1: { ...destination1, t: destination1T },
          destination1Id,
          destination2: { ...destination2, t: destination2T },
          subsection: sub,
        };
      })
      .find(Boolean);
  }

  if (trainTimetable.length === 1) {
    return subsections
      .map((sub) => {
        const destination1 = sub.stationMatcher(destination1name);
        if (!destination1) return undefined;
        return {
          destination1: { ...destination1, t: destination1T },
          destination1Id,
          subsection: sub,
        };
      })
      .find(Boolean);
  }
}

export function handleInitialise({
  destination1,
  destination1Id,
  now,
  subsection,
  destination2,
}: {
  destination1: StationU;
  destination1Id: string;
  now: number;
  subsection: SubsectionRuntime;
  destination2?: StationU;
}): IdleTrainState | MovingTrainState {
  const { u: u1, t: t1 } = destination1;
  const { u: u2 = undefined, t: t2 = undefined } = destination2 || {};

  // TODO This will need adjusting for each line.  100 works for Elizabeth line. Update tests accordingly.
  const uAdjustment = (t1 - now) / (100 * 60 * 1000);

  //
  //  0  Train is moving
  //

  if (now < t1 && 0 < u1 - uAdjustment) {
    return {
      type: "moving",
      id: destination1Id,
      subsection,
      uStart: u1 - uAdjustment,
      uEnd: u1,
      tStart: now,
      tEnd: t1,
    };
  }

  //
  //  1  Train is idle (at station)
  //

  // if (now >= destination1t || 0 <= destination1u - uAdjustment) {}
  return {
    type: "idle",
    id: destination1Id,
    subsection,
    uStart: u1,
    uEnd: u2,
    tStart: t1,
    tEnd: t2,
  };
}

export function handleIdle({
  destination1,
  destination1Id,
  now,
  state,
  subsection,
  destination2,
}: {
  destination1: StationU;
  destination1Id: string;
  now: number;
  state: IdleTrainState;
  subsection: SubsectionRuntime;
  destination2?: StationU;
}): IdleTrainState | MovingTrainState {
  // TODO could this break when destination1 changes mid run.
  // When does this run, why does it run, do they overlap...?

  //
  //  Line change over
  //

  if (destination2) {
    if (
      destination1.t === state.tStart &&
      destination1.u === state.uStart &&
      destination1Id === state.id &&
      subsection === state.subsection &&
      destination2.t === state.tEnd &&
      destination2.u === state.uEnd
    )
      return state;

    if (subsection === state.subsection && destination1Id === state.id) {
      return {
        type: "idle",
        id: destination1Id,
        subsection,
        tEnd: destination2.t,
        tStart: destination1.t,
        uEnd: destination2.u,
        uStart: destination1.u,
      };
    }

    if (subsection === state.subsection && destination1Id !== state.id) {
      return {
        type: "moving",
        id: destination1Id,
        subsection,
        tEnd: destination1.t,
        tStart: now,
        uEnd: destination1.u,
        uStart: state.uStart,
      };
    }

    if (subsection !== state.subsection && destination1Id === state.id) {
      return {
        type: "idle",
        id: destination1Id,
        subsection,
        tEnd: destination2.t,
        tStart: destination1.t,
        uEnd: destination2.u,
        uStart: destination1.u,
      };
    }

    if (subsection !== state.subsection && destination1Id !== state.id) {
      console.error(
        "handleIdle: subsection and destination change; train has changed direction and changed subsection in an exepected manner",
        {
          expected: {
            id: state.id,
            subsection: state.subsection,
          },
          actual: {
            id: destination1Id,
            subsection,
          },
          state,
          destination1,
          now,
        },
      );
      return {
        type: "moving",
        id: destination1Id,
        subsection,
        tEnd: destination1.t,
        tStart: now,
        uEnd: destination1.u,
        uStart: 0,
      };
    }
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
    return state;

  //
  // only destination1 and parameters have changed
  //

  if (destination1Id === state.id)
    return {
      type: "idle",
      id: destination1Id,
      subsection,
      tStart: destination1.t,
      uStart: destination1.u,
    };

  //
  // only destination1 and record OR subsection (line) has changed
  // (this should be a rare occurance)

  if (destination1Id !== state.id || subsection !== state.subsection) {
    // TODO Improve record keeping if this ever gets raised
    console.error(
      "handleIdle: train timetable updated single record to new station OR changed subsection",
      {
        expected: {
          id: state.id,
          subsection: state.subsection,
        },
        actual: {
          id: destination1Id,
          subsection,
        },
        state,
        destination1,
        now,
      },
    );
    return {
      type: "idle",
      id: destination1Id,
      subsection,
      tStart: destination1.t,
      uStart: destination1.u,
    };
  }

  console.error(
    "handleIdle: all conditional has not captured idle train; please investigate",
  );
  return state;
}

export function handleMoving({
  destination1,
  destination1Id,
  destination2,
  now,
  state,
  subsection,
  uCurrent,
}: {
  destination1: StationU;
  destination1Id: string;
  destination2?: StationU;
  now: number;
  state: MovingTrainState;
  subsection: SubsectionRuntime;
  uCurrent?: number;
}): IdleTrainState | MovingTrainState {
  if (uCurrent) {
    if (destination2 && uCurrent >= state.uEnd) {
      return {
        type: "idle",
        id: destination1Id,
        subsection,
        tEnd: destination2.t,
        tStart: destination1.t,
        uEnd: destination2.u,
        uStart: destination1.u,
      };
    }

    if (uCurrent >= state.uEnd) {
      return {
        type: "idle",
        id: destination1Id,
        subsection,
        tStart: destination1.t,
        uStart: destination1.u,
      };
    }
  }

  // Delay to next station; Update tEnd if destintion1.t has changed
  if (state.id === destination1Id && state.tEnd !== destination1.t) {
    if (state.tEnd - state.tStart < 0) {
      console.error("handleMoving train delay: tEnd - tStart < 0");
      return state;
    }

    const progress = Math.min(
      Math.max((now - state.tStart) / (state.tEnd - state.tStart), 0),
      1,
    );

    // state.tStart = now - progress * (destination1.t - now);
    state.tStart = (progress * destination1.t - now) / (progress - 1);
    state.tEnd = destination1.t;

    return state;
  }

  return state;
}
