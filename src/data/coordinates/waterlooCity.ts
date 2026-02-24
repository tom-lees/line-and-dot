import type { Midline } from "../../domain/lines";

//prettier-ignore
export const waterloo_bank: Midline = {
  name: "waterloo ↔ bank",
  positions: [
    {type:'station',name:'Waterloo Underground Station',x:530968.1802,y:179961.9154,z:-1.8},
    { type: "track", x: 531111, y: 180178, z: -10}, // Estimated z
    { type: "track", x: 531398, y: 180359, z: -15}, // Estimated z
    { type: "track", x: 531777, y: 180945, z: -12}, // Estimated z
    { type: "track", x: 532243, y: 180944, z: -8}, // Estimated z
    { type: "track", x: 532681, y: 181116, z: -6}, // Estimated z
    {type:'station',name:'Bank Underground Station',x:532710.1551,y:181119.8978,z:-6},
  ],
};
