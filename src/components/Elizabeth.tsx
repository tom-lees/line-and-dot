import { useMemo, type JSX } from "react";
import type { Network } from "./trainLines";
import { buildSubsectionData, createStationMatcher } from "../utils";
import { Label } from "./Label";
import useTrainData from "../hooks/useTrainData";
import * as THREE from "three";
import { TrainDot } from "./Trains/TrainDot";
import type { SubsectionRuntime } from "./Trains/trainTypes";

export const Elizabeth = ({ network }: { network: Network }): JSX.Element => {
  const trains = useTrainData();
  const colour = "#800080";

  //
  // Generate Catmullcurve & stations' proportions (u) along the curve
  //
  const elizabethSubsections: SubsectionRuntime[] = useMemo(() => {
    const stationPositionsMap = new Map<string, THREE.Vector3[]>();
    const line = network.elizabeth.subsections;

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
  }, [network.elizabeth.subsections]);

  //
  // Curve & Station positions for rendering labels
  //
  const elizabethLabelPositions = useMemo(() => {
    return elizabethSubsections
      .filter((s) => s.type === "outbound")
      .flatMap(({ curveData }) => {
        const { curve, stationUs } = curveData;

        return stationUs.map((s) => ({
          label: s.label,
          position: curve.getPointAt(s.u).toArray() as [number, number, number],
        }));
      });
  }, [elizabethSubsections]);

  return (
    <>
      <>
        {elizabethSubsections.map((s, idx) => {
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
                  opacity={1}
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
                  opacity={1}
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
                  opacity={1}
                />
              </mesh>
            </group>
          );
        })}
      </>

      {elizabethLabelPositions.map((lp, i) => (
        <Label
          key={i.toString() + lp.label}
          text={lp.label}
          position={lp.position}
          fontSize={10}
          fontColour="white"
          rotate="diagonal"
        />
      ))}
      {Object.entries(trains.trainData)
        //TODO Filter for testing
        // .filter(([trainId]) => trainId === "202602107124620")
        .map(
          ([trainId, trainArrivalList]) =>
            trainArrivalList.length > 0 && (
              <TrainDot
                key={trainId}
                subsections={elizabethSubsections}
                trainTimetable={trainArrivalList}
              />
            ),
        )}
    </>
  );
};
