import { useMemo, type JSX } from "react";
import type { Network } from "./trainLines";
import {
  buildCurveData,
  createStationMatcher,
  type SubsectionRuntime,
} from "../utils";
import { Label } from "./Label";
import useTrainData from "../hooks/useTrainData";
import { TrainDot } from "./TrainDot";
// TODO Hayes and Harington two labels overlaping.  drop one lablel.  Label on tag in data or component.
// TODO Handle stations that reach an NA, they jump off the line, should remain at current u position.
// TODO Paddington and London Paddington Rail Station breaks logic.
export const Elizabeth = ({ network }: { network: Network }): JSX.Element => {
  const trains = useTrainData();

  //
  // Generate Catmullcurve & stations' proportions (u) along the curve
  //
  const elizabethSubsections: SubsectionRuntime[] = useMemo(() => {
    return network.elizabeth.subsections.map((subsection) => {
      const curveData = buildCurveData(subsection.positions);

      const runtime: SubsectionRuntime = {
        ...subsection,
        curveData,
        stationMatcher: createStationMatcher(curveData.stationUs),
      };

      return runtime;
    });
  }, [network.elizabeth.subsections]);

  //
  // Curve to points for rendering line
  //
  const elizabethCurvesPoints = useMemo(() => {
    return elizabethSubsections.map((s) => {
      const curve = s.curveData.curve;
      return new Float32Array(
        curve.getPoints(200).flatMap((p) => [p.x, p.y, p.z]),
      );
    });
  }, [elizabethSubsections]);

  //
  // Curve & Station positions for rendering labels
  //
  const elizabethLabelPositions = useMemo(() => {
    return elizabethSubsections.flatMap(({ curveData }) => {
      const { curve, stationUs } = curveData;

      return stationUs.map((s) => ({
        label: s.label,
        position: curve.getPointAt(s.u).toArray() as [number, number, number],
      }));
    });
  }, [elizabethSubsections]);

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
      {Object.entries(trains.trainData)
        //TODO Filter for testing
        // .filter(([trainId]) => trainId === "202601217124102")
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
