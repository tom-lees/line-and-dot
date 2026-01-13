import { useEffect, useMemo, type JSX } from "react";
import type { Network } from "./trainLines";
import { buildCurveData } from "../utils";
import { Label } from "./Label";
import useTrainData from "../hooks/useTrainData";
import { TrainDot } from "./TrainDot";

export const Elizabeth = ({ network }: { network: Network }): JSX.Element => {
  const trains = useTrainData();

  useEffect(() => {
    // Get all the arrays of train records
    const trainArrays = Object.values(trains.trainData);

    if (trainArrays.length === 0) return;

    // Take the first array
    const firstTrainArray = trainArrays[0];

    if (!firstTrainArray || firstTrainArray.length === 0) return;

    // Take the first train record
    const firstTrainRecord = firstTrainArray[0];

    console.log("first train record:", firstTrainRecord);
  }, [trains]);

  //
  // Generate Catmullcurve & stations' proportions (u) along the curve
  //
  const elizabethCurves = useMemo(() => {
    return network.elizabeth.subsections.map((subsection) => {
      const curveData = buildCurveData(subsection.positions);
      subsection.curveData = curveData;
      return curveData;
    });
  }, [network.elizabeth.subsections]);

  //
  // Curve to points for rendering line
  //
  const elizabethCurvesPoints = useMemo(() => {
    return elizabethCurves.map(({ curve }) => {
      return new Float32Array(
        curve.getPoints(200).flatMap((p) => [p.x, p.y, p.z])
      );
    });
  }, [elizabethCurves]);

  //
  // Curve & Station positions for rendering labels
  //
  const elizabethLabelPositions = useMemo(() => {
    // flatMap if you have multiple curves/subsections
    return elizabethCurves.flatMap(({ curve, stationUs }) =>
      stationUs.map((s) => ({
        label: s.label,
        position: curve.getPointAt(s.u).toArray() as [number, number, number],
      }))
    );
  }, [elizabethCurves]);

  return (
    <>
      {elizabethCurvesPoints.map((curvePoints, idx) => (
        <line key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach={"attributes-position"}
              array={curvePoints as Float32Array}
              args={[curvePoints as Float32Array, 3]}
              itemSize={3}
              count={curvePoints.length / 3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={"#ffffff"} linewidth={2} />
        </line>
      ))}
      {elizabethLabelPositions.map((lp, i) => (
        <Label
          key={i.toString() + lp.label}
          text={lp.label}
          position={lp.position}
          fontSize={10}
          fontColour="white"
        />
      ))}
      {/* {trains && (
                <TrainDot
                  curve={curve}
                  stations={stationUs}
                  speed={0.001}
                  //TODO Change to arrivals
                  trainTimetable={Object.values(singleTrainData).flat()}
                  initialU={0}
                />
              )} */}
    </>
  );
};
