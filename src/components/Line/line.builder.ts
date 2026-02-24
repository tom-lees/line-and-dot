import { harrowWealdstone_elephantCastle } from "../../data/coordinates/bakerloo";
import {
  epping_woodford,
  laytonstone_northActon,
  northActon_EalingBroadway,
  northActon_westRuislip,
  woodford_leytonstone,
  woodford_leytonstone_loop,
} from "../../data/coordinates/central";
import { paddington_stanmore } from "../../data/coordinates/circle";
import {
  earlsCourt_kensingtonOlympia,
  earlsCourt_turnhamGreen,
  earlsCourt_wimbledon,
  edgwareRoad_earlsCourt,
  turnhamGreen_ealingBroadway,
  turnhamGreen_richmond,
  upminster_earlsCourt,
} from "../../data/coordinates/district";
import {
  hayesHarlington_whitechapel,
  heathrow2And3_hayesHarlington,
  heathrow4_heathrow2And3,
  heathrow5_heathrow2And3,
  reading_hayesHarlington,
  whitechapel_abbeywood,
  whitechapel_shenfield,
} from "../../data/coordinates/elizabeth";
import { barking_hammersmith } from "../../data/coordinates/hammersmithCity";
import { stratford_stanmore } from "../../data/coordinates/jubilee";
import {
  aldgate_harrowOnTheHill,
  chalfontAndLatimer_amersham,
  chalfontAndLatimer_chesham,
  harrowOnTheHill_moorPark,
  harrowOnTheHill_uxbridge,
  moorPark_chalfontAndLatimer,
  moorPark_watford,
} from "../../data/coordinates/metropolitian";
import {
  camdenTown_eustonLongLoop,
  camdenTown_eustonShortLoop,
  edgware_camdenTown,
  euston_kenningtonViaBank,
  euston_kenningtonViaCharingX,
  finchleyCentral_camdenTown,
  highBarnet_finchleyCentral,
  kennington_battersea,
  kennington_morden,
  millHillEast_finchleyCentral,
} from "../../data/coordinates/northern";
import {
  actonTown_hattonCross,
  actonTown_uxbridge,
  cockfosters_actonTown,
  hattonCross_heathrowTerminals2And3LargeLoop,
  hattonCross_heathrowTerminals2And3SmallLoop,
  heathrowTerminals2And3_heathrowTerminals5,
} from "../../data/coordinates/piccadilly";
import { walthamstowCentral_brixton } from "../../data/coordinates/victoria";
import { waterloo_bank } from "../../data/coordinates/waterlooCity";
import type { Network } from "../../domain/lines";
import { buildBidirectionalSubsections } from "./line.builder.helper";
const trackSpacing = 200;
const overlapSpacing = 75
// prettier-ignore
export const network: Network = {
  bakerloo: {
    name: "Bakerloo",
    subsections: [
      ...buildBidirectionalSubsections(harrowWealdstone_elephantCastle, trackSpacing),
    ],
  },
  central: {
    name: "Central",
    subsections: [
      ...buildBidirectionalSubsections(northActon_westRuislip, trackSpacing),
      ...buildBidirectionalSubsections(northActon_EalingBroadway, trackSpacing),
      ...buildBidirectionalSubsections(laytonstone_northActon, trackSpacing),
      ...buildBidirectionalSubsections(woodford_leytonstone, trackSpacing),
      ...buildBidirectionalSubsections(epping_woodford, trackSpacing),
      ...buildBidirectionalSubsections(woodford_leytonstone_loop, trackSpacing),
    ],
  },
  circle: {
    name: "Circle",
    subsections: [
      ...buildBidirectionalSubsections(paddington_stanmore, trackSpacing),
    ],
  },
  district: {
    name: "District",
    subsections: [
      ...buildBidirectionalSubsections(upminster_earlsCourt, trackSpacing-overlapSpacing,-0.5),
      ...buildBidirectionalSubsections(edgwareRoad_earlsCourt, trackSpacing-overlapSpacing,-0.5),
      ...buildBidirectionalSubsections(earlsCourt_wimbledon, trackSpacing-overlapSpacing,-0.5),
      ...buildBidirectionalSubsections(earlsCourt_kensingtonOlympia, trackSpacing-overlapSpacing,-0.5),
      ...buildBidirectionalSubsections(earlsCourt_turnhamGreen, trackSpacing-overlapSpacing,-0.5),
      ...buildBidirectionalSubsections(turnhamGreen_ealingBroadway, trackSpacing-overlapSpacing,-0.5),
      ...buildBidirectionalSubsections(turnhamGreen_richmond, trackSpacing-overlapSpacing,-0.5),
    ],
  },
  elizabeth: {
    name: "Elizabeth",
    subsections: [
      ...buildBidirectionalSubsections(reading_hayesHarlington, trackSpacing),
      ...buildBidirectionalSubsections( hayesHarlington_whitechapel, trackSpacing), 
      ...buildBidirectionalSubsections( heathrow2And3_hayesHarlington, trackSpacing),
      ...buildBidirectionalSubsections(heathrow4_heathrow2And3, trackSpacing),
      ...buildBidirectionalSubsections(heathrow5_heathrow2And3, trackSpacing),
      ...buildBidirectionalSubsections(whitechapel_shenfield, trackSpacing),
      ...buildBidirectionalSubsections(whitechapel_abbeywood, trackSpacing),
    ],
  },
  hammersmithCity: {
    name: "Hammersmith & City",
    subsections: [
      ...buildBidirectionalSubsections(barking_hammersmith, trackSpacing+overlapSpacing,-0.2 ),
    ],
  },
  jubilee: {
    name: "Jubilee",
    subsections: [
      ...buildBidirectionalSubsections(stratford_stanmore, trackSpacing),
    ],
  },
  metropolitan: {
    name: "Metropolitan",
    subsections: [
      ...buildBidirectionalSubsections(aldgate_harrowOnTheHill, trackSpacing -overlapSpacing,-0.2),
      ...buildBidirectionalSubsections(harrowOnTheHill_uxbridge, trackSpacing -overlapSpacing,-0.2),
      ...buildBidirectionalSubsections(harrowOnTheHill_moorPark, trackSpacing -overlapSpacing,-0.2),
      ...buildBidirectionalSubsections(moorPark_watford, trackSpacing -overlapSpacing,-0.2),
      ...buildBidirectionalSubsections(moorPark_chalfontAndLatimer, trackSpacing -overlapSpacing,-0.2),
      ...buildBidirectionalSubsections(chalfontAndLatimer_amersham, trackSpacing -overlapSpacing,-0.2),
      ...buildBidirectionalSubsections(chalfontAndLatimer_chesham, trackSpacing -overlapSpacing,-0.2),
    ],
  },
  northern: {
    name: "Northern",
    subsections: [
      ...buildBidirectionalSubsections(highBarnet_finchleyCentral, trackSpacing),
      ...buildBidirectionalSubsections(millHillEast_finchleyCentral, trackSpacing),
      ...buildBidirectionalSubsections(finchleyCentral_camdenTown, trackSpacing),
      ...buildBidirectionalSubsections(edgware_camdenTown, trackSpacing),
      ...buildBidirectionalSubsections(camdenTown_eustonLongLoop, trackSpacing),
      ...buildBidirectionalSubsections(camdenTown_eustonShortLoop, trackSpacing),
      ...buildBidirectionalSubsections(euston_kenningtonViaBank, trackSpacing),
      ...buildBidirectionalSubsections(euston_kenningtonViaCharingX, trackSpacing),
      ...buildBidirectionalSubsections(kennington_morden, trackSpacing),
      ...buildBidirectionalSubsections(kennington_battersea, trackSpacing),
    ],
  },
  piccadilly: {
    name: "Piccadilly",
    subsections:[
      ...buildBidirectionalSubsections(cockfosters_actonTown, trackSpacing,0.2),
      ...buildBidirectionalSubsections(actonTown_hattonCross, trackSpacing,0.2),
      ...buildBidirectionalSubsections(hattonCross_heathrowTerminals2And3LargeLoop, trackSpacing,0.2),
      ...buildBidirectionalSubsections(hattonCross_heathrowTerminals2And3SmallLoop, trackSpacing,0.2),
      ...buildBidirectionalSubsections(heathrowTerminals2And3_heathrowTerminals5, trackSpacing,0.2),
      ...buildBidirectionalSubsections(actonTown_uxbridge, trackSpacing,0.2),
    ]
  },
  victoria: {
    name: "Victoria",
    subsections:[
      ...buildBidirectionalSubsections(walthamstowCentral_brixton, trackSpacing),
    ]
  },
  waterlooCity: {
    name: "Waterloo & City",
    subsections:[
      ...buildBidirectionalSubsections(waterloo_bank, trackSpacing),
    ]
  }
};
