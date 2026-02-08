import type { StationWithU } from "../../utils";
import type { Subsection } from "../trainLines";
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
