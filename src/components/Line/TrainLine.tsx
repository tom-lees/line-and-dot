import { useMemo, type JSX } from "react";
import * as THREE from "three";
import { TrainDot } from "../Trains/TrainDot";
import type { SubsectionRuntime } from "../Trains/train.types";
import type { Subsection } from "../../domain/lines";
import { createStationMatcher } from "../../App/station.matcher";
import { buildSubsectionData } from "./line.subsection.builder";
import type { TimetableStore } from "../../data/train/train.service.types";

export const TrainLine = ({
  colour,
  dotResetToken,
  trainStore,
  line,
}: {
  colour: string;
  dotResetToken: number;
  trainStore: Record<string, TimetableStore>;
  line: Subsection[];
}): JSX.Element => {
  // if (import.meta.env.DEV) {
  //   useEffect(() => {
  //     console.log(`DEV: TrainLine.tsx`);

  //     const sortedTrainData = Object.entries(trainData).sort(([a], [b]) =>
  //       a.localeCompare(b),
  //     );

  //     let arrivalsLog = "";
  //     sortedTrainData.forEach(([trainId, arrivals]) => {
  //       let arrivalsLine = `${trainId}:- `;
  //       const firstArrival = arrivals.timetable[0];
  //       if (firstArrival)
  //         arrivalsLine += `${firstArrival.stationName.replace("Underground Station", "").trim()} at ${firstArrival.expectedArrival}\n`;
  //       arrivalsLog += arrivalsLine;
  //     });

  //     // const firstTrain = sortedTrainData[0];
  //     // const [, firstTrainRecord] = firstTrain[1];
  //     // const firstTrainArrival = firstTrainRecord?.expectedArrival;

  //     // console.log(arrivalsLog);
  //   }, [trainData]);
  // }
  //
  // Generate Catmullcurve & stations' proportions (u) along the curve
  //

  // useEffect(() => {
  //   // Print if line is wrong
  //   Object.entries(trainData).forEach(([k, v]) => {
  //     console.log(v.lineId);
  //   });
  // }, [trainData]);

  const subsections: SubsectionRuntime[] = useMemo(() => {
    //
    //  Handle misaligned stations at subsection ends; find average position for these stations
    //
    const stationPositionsMap = new Map<string, THREE.Vector3[]>();

    // TODO Can this be done in App.tsx
    line.forEach((sub) => {
      sub.positions.forEach((p) => {
        if (p.type === "station") {
          const key = `${p.name}|${sub.type}`; // combine name + type
          const pos = new THREE.Vector3(p.x, p.y, p.z);
          if (!stationPositionsMap.has(key)) stationPositionsMap.set(key, []);
          stationPositionsMap.get(key)!.push(pos);
        }
      });
    });

    const stationAvgPositions = new Map<string, THREE.Vector3>();

    stationPositionsMap.forEach((positions, key) => {
      if (positions.length > 1) {
        // only average repeated stations
        const avg = new THREE.Vector3();
        positions.forEach((pos) => avg.add(pos));
        avg.divideScalar(positions.length);
        stationAvgPositions.set(key, avg);
      }
    });

    line.forEach((sub) => {
      sub.positions.forEach((p) => {
        if (p.type === "station") {
          const key = `${p.name}|${sub.type}`;
          if (stationAvgPositions.has(key)) {
            const avg = stationAvgPositions.get(key)!;
            p.x = avg.x;
            p.y = avg.y;
            p.z = avg.z;
          }
        }
      });
    });

    return line.map((subsection) => {
      const curveData = buildSubsectionData(subsection.positions);

      const runtime: SubsectionRuntime = {
        ...subsection,
        curveData,
        stationMatcher: createStationMatcher(curveData.stationUs),
      };

      return runtime;
    });
  }, [line]);

  return (
    <>
      <>
        {subsections.map((s, idx) => {
          const curve = s.curveData.curve;
          const radius = 2; // same as tube radius

          // Start and end points
          const startPoint = curve.getPoint(0);
          const endPoint = curve.getPoint(1);

          return (
            <group key={idx}>
              {/* Solid tube */}
              <mesh>
                <tubeGeometry args={[curve, 200, radius, 16, false]} />
                <meshStandardMaterial
                  color={colour}
                  emissive={colour}
                  roughness={0.5}
                  metalness={0}
                  transparent={false}
                  side={THREE.DoubleSide} // render both sides
                />
              </mesh>

              {/* Sphere at start */}
              <mesh position={startPoint}>
                <sphereGeometry args={[radius, 16, 16]} />
                <meshStandardMaterial
                  color={colour}
                  emissive={colour}
                  roughness={0.5}
                  metalness={0}
                  transparent={false}
                />
              </mesh>

              {/* Sphere at end */}
              <mesh position={endPoint}>
                <sphereGeometry args={[radius, 16, 16]} />
                <meshStandardMaterial
                  color={colour}
                  emissive={colour}
                  roughness={0.5}
                  metalness={0}
                  transparent={false}
                />
              </mesh>
            </group>
          );
        })}
      </>
      {Object.entries(trainStore).map(
        ([trainId, trainStore]) =>
          trainStore.timetable.length > 0 && (
            <TrainDot
              //TODO Add back in
              // key={`${trainId}-${dotResetToken}`}
              key={`${trainId}-0`}
              subsections={subsections}
              trainStore={trainStore}
            />
          ),
      )}
    </>
  );
};
