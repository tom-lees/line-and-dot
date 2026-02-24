// import { describe, expect, it } from "vitest";
// import type { Network } from "./components/trainLines";
// import { normaliseNetwork } from "./utils";

// describe("normaliseNetworkWithSingleLine", () => {
//   it("should normalise a simple network to fit on specified screen width", () => {
//     // Mock network with known min/max
//     const mockNetwork: Network = {
//       line1: {
//         name: "Line1",
//         subsections: [
//           {
//             name: "stationA => stationC",
//             stations: [
//               { name: "StationA", x: 0, y: 0 },
//               { name: "StationB", x: 10, y: 20 },
//               { name: "StationC", x: 5, y: 15 },
//             ],
//           },
//         ],
//       },
//     };

//     const screenWidth = 1000;

//     const normalised = normaliseNetwork(mockNetwork, screenWidth);

//     const stations = normalised.line1.subsections[0].stations;

//     const xs = stations.map((s) => s.x);
//     const ys = stations.map((s) => s.y);

//     const minX = Math.min(...xs);
//     const maxX = Math.max(...xs);
//     const minY = Math.min(...ys);
//     const maxY = Math.max(...ys);

//     const midX = (minX + maxX) / 2;
//     expect(midX).toBeCloseTo(0, 5);

//     const midY = (minY + maxY) / 2;
//     expect(midY).toBeCloseTo(0, 5);

//     const rangeX = maxX - minX;
//     expect(rangeX).toBeCloseTo(screenWidth, 5);

//     const stationB = stations.find((s) => s.name === "StationB");
//     expect(stationB).toBeDefined();
//     if (!stationB) throw new Error("StationB should be defined");
//     expect(stationB.x).toBeGreaterThan(0);
//     expect(stationB.y).toBeGreaterThan(0);
//   });
// });

// describe("normaliseNetworkWithMultipleLines", () => {
//   it("should normalise a network to fit on specified screen width", () => {
//     // Mock network with known min/max
//     const mockNetwork: Network = {
//       line1: {
//         name: "Line1",
//         subsections: [
//           {
//             name: "section-1",
//             stations: [
//               { name: "A", x: 0, y: 0 },
//               { name: "B", x: 50, y: 10 },
//             ],
//           },
//           {
//             name: "section-2",
//             stations: [
//               { name: "C", x: 100, y: 20 },
//               { name: "D", x: 200, y: 40 },
//             ],
//           },
//           {
//             name: "section-3",
//             stations: [
//               { name: "E", x: -100, y: -20 },
//               { name: "F", x: -50, y: -10 },
//             ],
//           },
//         ],
//       },
//     };

//     const screenWidth = 1000;

//     const normalised = normaliseNetwork(mockNetwork, screenWidth);

//     const stations = normalised.line1.subsections.flatMap(
//       (sub) => sub.stations
//     );

//     const xs = stations.map((s) => s.x);
//     const ys = stations.map((s) => s.y);

//     const minX = Math.min(...xs);
//     const maxX = Math.max(...xs);
//     const minY = Math.min(...ys);
//     const maxY = Math.max(...ys);

//     const midX = (minX + maxX) / 2;
//     expect(midX).toBeCloseTo(0, 5);

//     const midY = (minY + maxY) / 2;
//     expect(midY).toBeCloseTo(0, 5);

//     const rangeX = maxX - minX;
//     expect(rangeX).toBeCloseTo(screenWidth, 5);
//   });
// });

// // TODO Create test with multiple lines
