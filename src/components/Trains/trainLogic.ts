import type {
  ActiveTrainState,
  IdleTrainState,
  MovingTrainState,
  SubsectionRuntime,
  TrainState,
} from "./trainTypes";
import type { StationU } from "../../utils";
import type { TrainRecord } from "../../types/train";

// TODO Test involves taking every single station from API, adding to js file, with perhaps line and end station
// We can then put this in an array and test for every station combination.
// Once we have the corpus of stations, we can continually check every station if in our corpus, raise an error for new station
// names.
function findSubsectionForStations(
  station1name: string,
  station2name: string,
  subsections: SubsectionRuntime[],
):
  | { subsection: SubsectionRuntime; next: StationU; following: StationU }
  | undefined {
  return subsections
    .map((sub) => {
      const next = sub.stationMatcher(station1name);
      const following = sub.stationMatcher(station2name);
      if (!next || !following) return undefined;
      if (next.u >= following.u) return undefined;
      return { subsection: sub, next, following };
    })
    .find(Boolean);
}

export function handleInitialise({
  destination1u,
  destination1t,
  now,
  stationId,
  subsection,
  destination2u,
  destination2t,
}: {
  destination1u: number;
  destination1t: number;
  now: number;
  stationId: string;
  subsection: SubsectionRuntime;
  destination2u?: number;
  destination2t?: number;
}): ActiveTrainState {
  // TODO This will need adjusting for each line.  100 works for Elizabeth line. Update tests accordingly.
  const uAdjustment = (destination1t - now) / (100 * 60 * 1000);

  //
  //  0  Train is moving
  //

  if (now < destination1t && 0 < destination1u - uAdjustment) {
    return {
      type: "moving",
      stationId,
      subsection,
      uStart: destination1u - uAdjustment,
      uEnd: destination1u,
      tStart: now,
      tEnd: destination1t,
    };
  }

  //
  //  1  Train is idle (at station)
  //

  // if (now >= destination1t || 0 <= destination1u - uAdjustment) {}
  return {
    type: "idle",
    stationId,
    subsection,
    uStart: destination1u,
    uEnd: destination2u || undefined,
    tStart: destination1t,
    tEnd: destination2t || undefined,
  };
}

export function handleIdle(
  state: IdleTrainState,
  timetable: TrainRecord[],
  now: number,
): TrainState {
  const head = timetable[0];

  if (!head) return state;

  if (head.id === state.stationId) return state;

  if (!state.tEnd || !state.uEnd) return state;

  return {
    type: "moving",
    stationId: state.stationId,
    subsection: state.subsection,
    uStart: state.uStart,
    uEnd: state.uEnd,
    tStart: now,
    tEnd: state.tEnd,
  };
}


export function handleMoving(
  state: MovingTrainState,
  timetable: TrainRecord[],
  now: number,
): TrainState {
  const head = timetable[0];

  if (!head) return state;

  if (head.id === state.stationId) return state;

  if (!state.tEnd || !state.uEnd) return state;

  return {
    type: "moving",
    stationId: state.stationId,
    subsection: state.subsection,
    uStart: state.uStart,
    uEnd: state.uEnd,
    tStart: now,
    tEnd: state.tEnd,
  };
}