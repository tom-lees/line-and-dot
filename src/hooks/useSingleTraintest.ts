// import { describe, it, expect, vi, type Mock } from "vitest";
// import { renderHook } from "@testing-library/react";
// import useTrainData from "./useTrainData";
// import useSingleTrain from "./useSingleTrain";

// vi.mock("./useTrainData");

// describe("useSingleTrain", () => {
//   it("auto-selects the only matching train", () => {
//     (useTrainData as Mock).mockReturnValue({
//       trainData: {
//         veh123: [
//           { destinationName: "Stratford", timeToStation: Date.now() + 30000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 60000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 90000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 120000 },
//         ],
//       },
//     });

//     const { result } = renderHook(() => useSingleTrain());

//     expect(result.current.selectedTrainId).toBe("veh123");
//     expect(result.current.data).toHaveProperty("veh123");
//   });
//   it("auto-selects the first matching train (vehThird)", () => {
//     (useTrainData as Mock).mockReturnValue({
//       trainData: {
//         vehFirst: [
//           { destinationName: "Narnia", timeToStation: Date.now() + 30000 },
//           { destinationName: "Narnia", timeToStation: Date.now() + 60000 },
//           { destinationName: "Narnia", timeToStation: Date.now() + 90000 },
//           { destinationName: "Narnia", timeToStation: Date.now() + 120000 },
//         ],
//         vehSecond: [
//           { destinationName: "Stratford", timeToStation: Date.now() + 30000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 32000 },
//         ],
//         vehThird: [
//           { destinationName: "Stratford", timeToStation: Date.now() + 30000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 60000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 90000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 120000 },
//         ],
//         vehFourth: [
//           { destinationName: "Stratford", timeToStation: Date.now() + 30000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 60000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 90000 },
//           { destinationName: "Stratford", timeToStation: Date.now() + 120000 },
//         ],
//       },
//     });

//     const { result } = renderHook(() => useSingleTrain());

//     expect(result.current.selectedTrainId).toBe("vehThird");
//     expect(result.current.data).toHaveProperty("vehThird");
//   });
// });
