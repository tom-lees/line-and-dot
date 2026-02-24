import type { Midline } from "../../domain/lines";

//prettier-ignore
export const highBarnet_finchleyCentral: Midline = {
  name: "high barnet ↔ finchley central",
  positions: [
    {type:'station',name:'High Barnet Underground Station',x:525030.1427,y:196180.328199999,z:98.4},
    {type:'station',name:'Totteridge & Whetstone Underground Station',x:526120.3494,y:193989.2184,z:73.8},
    {type:'station',name:'Woodside Park Underground Station',x:525718.4454,y:192588.1262,z:74.3},
    {type:'station',name:'West Finchley Underground Station',x:525546.1518,y:191626.9482,z:77.3},
    {type:'station',name:'Finchley Central Underground Station',x:525278.0259,y:190668.344000001,z:78.5},
  ],
};

//prettier-ignore
export const millHillEast_finchleyCentral: Midline = {
  name: "mill hill east ↔ finchley central",
  positions: [
    {type:'station',name:'Mill Hill East Underground Station',x:524045.7492,y:191450.480699999,z:70.8},
    {type:'station',name:'Finchley Central Underground Station',x:525278.0259,y:190668.344000001,z:78.5},
  ],
};

//prettier-ignore
export const finchleyCentral_camdenTown: Midline = {
  name: "finchley central ↔ camden town",
  positions: [
    {type:'station',name:'Finchley Central Underground Station',x:525278.0259,y:190668.344000001,z:78.5},
    {type:'station',name:'East Finchley Underground Station',x:527221.696,y:189183.6545,z:87.4},
    {type:'station',name:'Highgate Underground Station',x:528534.7964,y:188180.791099999,z:62.7},
    {type:'station',name:'Archway Underground Station',x:529363.5176,y:186721.2423,z:34.75,verticalOffset:0.3},
    {type:'station',name:'Tufnell Park Underground Station',x:529148.7021,y:185859.620100001,z:23.3,verticalOffset:3.4},
    {type:'station',name:'Kentish Town Underground Station',x:529009.0105,y:185127.159,z:14.4,verticalOffset:3},
    {type:'station',name:'Camden Town Underground Station',x:528910.2525,y:183893.5725,z:10.5,verticalOffset:3},
  ],
};

//prettier-ignore
export const edgware_camdenTown: Midline = {
  name: "edgware ↔ camden town",
  positions: [
    {type:'station',name:'Edgware Underground Station',x:519550.4974,y:191940.4673,z:54.6},
    {type:'station',name:'Burnt Oak Underground Station',x:520325.5892,y:190759.991599999,z:47},
    {type:'station',name:'Colindale Underground Station',x:521318.6301,y:189961.520300001,z:44},
    {type:'station',name:'Hendon Central Underground Station',x:522985.7318,y:188635.9596,z:61.5},
    {type:'station',name:'Brent Cross Underground Station',x:523873.7006,y:187934.037,z:51.9},
    {type:'station',name:'Golders Green Underground Station',x:525255.0926,y:187480.2837,z:73.1},
    {type:'station',name:'Hampstead Underground Station',x:526372.6132,y:185761.4121,z:49.5,verticalOffset:-0.8},
    {type:'station',name:'Belsize Park Underground Station',x:527353.7983,y:185088.897399999,z:32.4,verticalOffset:-0.8},
    {type:'station',name:'Chalk Farm Underground Station',x:528202.4569,y:184390.607000001,z:18.6,verticalOffset:-0.8},
    {type:'station',name:'Camden Town Underground Station',x:528910.2525,y:183893.5725,z:3,verticalOffset:3},
  ],
};

//prettier-ignore
export const camdenTown_eustonLongLoop: Midline = {
  name: "camden town ↔ euston (long loop)",
  positions: [
    {type:'station',name:'Camden Town Underground Station',x:528910.2525,y:183893.5725,z:3,verticalOffset:3},
    {type:'station',name:'Mornington Crescent Underground Station',x:529191.6489,y:183397.127499999,z:8.7},
    {type:'station',name:'Euston Underground Station',x:529498.32,y:182668.2502,z:3.6},
  ],
};

//prettier-ignore
export const camdenTown_eustonShortLoop: Midline = {
  name: "camden town ↔ euston (short loop)",
  positions: [
    {type:'station',name:'Camden Town Underground Station',x:528910.2525,y:183893.5725,z:3,verticalOffset:3},
    {type:'station',name:'Euston Underground Station',x:529498.32,y:182668.2502,z:-7.75,verticalOffset:-0.7},
  ],
};

//prettier-ignore
export const euston_kenningtonViaBank: Midline = {
  name: "euston ↔ kennington",
  positions: [
    {type:'station',name:'Euston Underground Station',x:529498.32,y:182668.2502,z:-7.75,verticalOffset:-0.7},
    {type:'station',name:"King's Cross St. Pancras Underground Station",x:530174.7976,y:182874.774700001,z:-11.1},
    {type:'station',name:'Angel Underground Station',x:531560.5615,y:183099.9257,z:-1.6},
    {type:'station',name:'Old Street Underground Station',x:532764.4507,y:182418.811100001,z:-8},
    {type:'station',name:'Moorgate Underground Station',x:532667.8252,y:181668.244999999,z:-11.25,verticalOffset:-0.1},
    {type:'station',name:'Bank Underground Station',x:532710.1551,y:181119.8978,z:-15.6},
    {type:'station',name:'London Bridge Underground Station',x:532683.0478,y:180188.852299999,z:-19.6},
    {type:'station',name:'Borough Underground Station',x:532439.9633,y:179751.461100001,z:-13.45,verticalOffset:2.7, horizontalOffset:-125},
    {type:'station',name:'Elephant & Castle Underground Station',x:531908.9646,y:179141.8869,z:-15.35,verticalOffset:-0.1},
    {type:'station',name:'Kennington Underground Station',x:531615,y:178309,z:-14.25,verticalOffset:2.7},
  ],
};

//prettier-ignore
export const euston_kenningtonViaCharingX: Midline = {
  name: "euston ↔ kennington",
  positions: [
    {type:'station',name:'Euston Underground Station',x:529498.32,y:182668.2502,z:3.6},
    {type:'station',name:'Warren Street Underground Station',x:529248.7448,y:182266.0339,z:1.65,verticalOffset:0.1},
    {type:'station',name:'Goodge Street Underground Station',x:529537.2731,y:181836.5931,z:-1.9},
    {type:'station',name:'Tottenham Court Road Underground Station',x:529815.381,y:181382.496200001,z:-5.7},
    {type:'station',name:'Leicester Square Underground Station',x:529980.4296,y:180824.482000001,z:-6.5},
    {type:'station',name:'Charing Cross Underground Station',x:530057.6992,y:180378.381899999,z:-8.4},
    {type:'station',name:'Embankment Underground Station',x:530419.3254,y:180395.871400001,z:-11.3,verticalOffset:-0.2},
    {type:'station',name:'Waterloo Underground Station',x:530968.1802,y:179961.9154,z:-17.2},
    {type:'station',name:'Kennington Underground Station',x:531615,y:178309,z:-14.25,verticalOffset:2.3},
  ],
};

//prettier-ignore
export const kennington_morden: Midline = {
  name: "kennington ↔ morden",
  positions: [
    {type:'station',name:'Kennington Underground Station',x:531615,y:178309,z:-14.25,verticalOffset:2.3},
    {type:'station',name:'Oval Underground Station',x:531170.2991,y:177564.9022,z:-11.7,verticalOffset:3.2},
    {type:'station',name:'Stockwell Underground Station',x:530460.3355,y:176432.887399999,z:-7.7,verticalOffset:-0.2},
    {type:'station',name:'Clapham North Underground Station',x:530038.9661,y:175743.4515,z:-1.3},
    {type:'station',name:'Clapham Common Underground Station',x:529504.8104,y:175338.249199999,z:0.8},
    {type:'station',name:'Clapham South Underground Station',x:528834.0334,y:174322.7074,z:10.1},
    {type:'station',name:'Balham Underground Station',x:528480.3274,y:173244.480799999,z:12.6},
    {type:'station',name:'Tooting Bec Underground Station',x:528047.2745,y:172373.6505,z:11.6},
    {type:'station',name:'Tooting Broadway Underground Station',x:527433.7399,y:171443.250700001,z:3.2},
    {type:'station',name:'Colliers Wood Underground Station',x:526787.9528,y:170368.2575,z:-1.1},
    {type:'station',name:'South Wimbledon Underground Station',x:525736.3947,y:169989.4476,z:1.3},
    {type:'station',name:'Morden Underground Station',x:525669.7872,y:168602.371300001,z:13.6},
  ],
};

//prettier-ignore
export const kennington_battersea: Midline = {
  name: "kennington ↔ battersea power station",
  positions: [
    {type:'station',name:'Kennington Underground Station',x:531615,y:178309,z:-14.25,verticalOffset:2.7},
    {type:'station',name:'Nine Elms Underground Station',x:529989.2567,y:177345.628799999,z:-16.2},
    {type:'station',name:'Battersea Power Station Underground Station',x:529024.8784,y:177247.2655,z:-13.5},
  ],
};
