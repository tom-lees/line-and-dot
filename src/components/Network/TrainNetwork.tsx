import { type JSX } from "react";
import { TrainLine } from "../Line/TrainLine";
import type { Network } from "../../domain/lines";
import { LINE_IDS } from "../Line/line.constants";
import { LINE_COLOURS } from "../Line/line.colours";
import type { VisibleTrainLinesWithOptionalLabels } from "../Filter/filter.types";
import type { TimetableStore } from "../../data/train/train.service.types";

const normaliseLineId = (id: string) => id.replace(/\W/g, "").toLowerCase(); // remove non-alphanumeric chars, lowercase

export const TrainNetwork = ({
  dotResetToken,
  network,
  trainStore,
  visibleTrainLines,
}: {
  dotResetToken: number;
  network: Network;
  trainStore: Record<string, TimetableStore>;
  visibleTrainLines: VisibleTrainLinesWithOptionalLabels;
}): JSX.Element => {
  return (
    <>
      {LINE_IDS.map((lineId) =>
        visibleTrainLines[lineId].line ? (
          <TrainLine
            key={lineId}
            colour={LINE_COLOURS[lineId]}
            dotResetToken={dotResetToken}
            line={network[lineId].subsections}
            trainStore={Object.fromEntries(
              Object.entries(trainStore).filter(([, store]) => {
                const storeId = normaliseLineId(store.lineId);
                const line = normaliseLineId(lineId);
                return storeId.includes(line);
              }),
            )}
          />
        ) : null,
      )}
    </>
  );
};
