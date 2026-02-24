import type { Midline } from "../../domain/lines";

import { harrowWealdstone_elephantCastle } from "../coordinates/bakerloo";
import {
  northActon_westRuislip,
  northActon_EalingBroadway,
  laytonstone_northActon,
  woodford_leytonstone,
  woodford_leytonstone_loop,
  epping_woodford,
} from "../coordinates/central";
import { paddington_stanmore } from "../coordinates/circle";
import {
  upminster_earlsCourt,
  edgwareRoad_earlsCourt,
  earlsCourt_wimbledon,
  earlsCourt_kensingtonOlympia,
  earlsCourt_turnhamGreen,
  turnhamGreen_ealingBroadway,
  turnhamGreen_richmond,
} from "../coordinates/district";
import {
  reading_hayesHarlington,
  hayesHarlington_whitechapel,
  whitechapel_abbeywood,
  whitechapel_shenfield,
  heathrow2And3_hayesHarlington,
  heathrow4_heathrow2And3,
  heathrow5_heathrow2And3,
} from "../coordinates/elizabeth";
import { barking_hammersmith } from "../coordinates/hammersmithCity";
import { stratford_stanmore } from "../coordinates/jubilee";
import {
  aldgate_harrowOnTheHill,
  harrowOnTheHill_uxbridge,
  harrowOnTheHill_moorPark,
  moorPark_watford,
  moorPark_chalfontAndLatimer,
  chalfontAndLatimer_amersham,
  chalfontAndLatimer_chesham,
} from "../coordinates/metropolitian";
import {
  highBarnet_finchleyCentral,
  millHillEast_finchleyCentral,
  finchleyCentral_camdenTown,
  edgware_camdenTown,
  camdenTown_eustonLongLoop,
  camdenTown_eustonShortLoop,
  euston_kenningtonViaBank,
  euston_kenningtonViaCharingX,
  kennington_morden,
  kennington_battersea,
} from "../coordinates/northern";
import {
  cockfosters_actonTown,
  actonTown_hattonCross,
  hattonCross_heathrowTerminals2And3LargeLoop,
  hattonCross_heathrowTerminals2And3SmallLoop,
  heathrowTerminals2And3_heathrowTerminals5,
  actonTown_uxbridge,
} from "../coordinates/piccadilly";
import { walthamstowCentral_brixton } from "../coordinates/victoria";
import { waterloo_bank } from "../coordinates/waterlooCity";
import type { TrainRecordLineIds } from "./train.service.types";

const midlinesByLine: Record<TrainRecordLineIds, Midline[]> = {
  bakerloo: [harrowWealdstone_elephantCastle],
  central: [
    northActon_westRuislip,
    northActon_EalingBroadway,
    laytonstone_northActon,
    woodford_leytonstone,
    woodford_leytonstone_loop,
    epping_woodford,
  ],
  circle: [paddington_stanmore],
  district: [
    upminster_earlsCourt,
    edgwareRoad_earlsCourt,
    earlsCourt_wimbledon,
    earlsCourt_kensingtonOlympia,
    earlsCourt_turnhamGreen,
    turnhamGreen_ealingBroadway,
    turnhamGreen_richmond,
  ],
  elizabeth: [
    reading_hayesHarlington,
    hayesHarlington_whitechapel,
    whitechapel_abbeywood,
    whitechapel_shenfield,
    heathrow2And3_hayesHarlington,
    heathrow4_heathrow2And3,
    heathrow5_heathrow2And3,
  ],
  "hammersmith-city": [barking_hammersmith],
  jubilee: [stratford_stanmore],
  metropolitan: [
    aldgate_harrowOnTheHill,
    harrowOnTheHill_uxbridge,
    harrowOnTheHill_moorPark,
    moorPark_watford,
    moorPark_chalfontAndLatimer,
    chalfontAndLatimer_amersham,
    chalfontAndLatimer_chesham,
  ],
  northern: [
    highBarnet_finchleyCentral,
    millHillEast_finchleyCentral,
    finchleyCentral_camdenTown,
    edgware_camdenTown,
    camdenTown_eustonLongLoop,
    camdenTown_eustonShortLoop,
    euston_kenningtonViaBank,
    euston_kenningtonViaCharingX,
    kennington_morden,
    kennington_battersea,
  ],
  piccadilly: [
    cockfosters_actonTown,
    actonTown_hattonCross,
    hattonCross_heathrowTerminals2And3LargeLoop,
    hattonCross_heathrowTerminals2And3SmallLoop,
    heathrowTerminals2And3_heathrowTerminals5,
    actonTown_uxbridge,
  ],
  victoria: [walthamstowCentral_brixton],
  "waterloo-city": [waterloo_bank],
};

const stationSetsByLine: Record<TrainRecordLineIds, Set<string>> = {} as Record<
  TrainRecordLineIds,
  Set<string>
>;

for (const lineId of Object.keys(midlinesByLine) as TrainRecordLineIds[]) {
  const midlines = midlinesByLine[lineId];
  stationSetsByLine[lineId] = new Set(
    midlines.flatMap((line) =>
      line.positions
        .filter((pos) => pos.type === "station")
        .map((pos) => pos.name),
    ),
  );
}

for (const lineId of Object.keys(midlinesByLine) as TrainRecordLineIds[]) {
  const midlines = midlinesByLine[lineId];
  stationSetsByLine[lineId] = new Set(
    midlines.flatMap((line) =>
      line.positions
        .filter((pos) => pos.type === "station")
        .map((pos) => pos.name),
    ),
  );
}

// =======================
// Export lookup function
// =======================
export const getAllowedStationNames = (lineId: TrainRecordLineIds): Set<string> =>
  stationSetsByLine[lineId] ?? new Set();
