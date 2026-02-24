import type { StationWithU } from "../../App/station.types";
import type { Subsection } from "../../domain/lines";
import * as THREE from "three";

export type SubsectionRuntime = Subsection & {
  curveData: {
    curve: THREE.CatmullRomCurve3;
    stationUs: StationWithU[]; // TODO Decide where this finally lives
  };
  stationMatcher: (stationName: string) => StationWithU | undefined;
};

export type IdleTrainState = {
  type: "idle";
  id: string;
  subsection: SubsectionRuntime;
  tEnd?: number;
  timeIdle:number;
  tStart: number;
  uEnd?: number;
  uStart: number;
};

export type InitialTrainState = {
  type: "initialise";
};

export type MovingTrainState = {
  type: "moving";
  id: string;
  subsection: SubsectionRuntime;
  tEnd: number;
  tStart: number;
  uEnd: number;
  uStart: number;
};

export type TrainState = IdleTrainState | InitialTrainState | MovingTrainState;
