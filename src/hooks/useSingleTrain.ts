import { useEffect, useState } from "react";
import type { TrainRecord } from "../types/train";
import useTrainData from "./useTrainData";

// TODO Make function universal, not just R 2 S line.
// TODO Control the deletion of records from within a train record.
// - 1) as new records come in, perhaps try the encyption thing and update when
// record changes.
/**
 * Locates a moving train on the Reading to Shenfield line.
 */

export default function useSingleTrain(): {
  selectedTrainId: string | null;
  setSelectedTrainId: (id: string | null) => void;
  singleTrain: TrainRecord | null;
} {
  const { trainData } = useTrainData();

  // the id of the train the user wants to follow. Parent can set this.
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);

  // currently selected TrainRecord (keeps updating as trainData refreshes)
  const [singleTrain, setSingleTrain] = useState<TrainRecord | null>(null);

  useEffect(() => {
    // If an id is already selected, keep updating that train's latest record
    if (selectedTrainId) {
      const records = trainData[selectedTrainId];
      setSingleTrain(records && records.length > 0 ? records[0] : null);
      return;
    }

    // No explicit selection: auto-select the first matching train, but only when
    // nothing is already selected. This prevents re-selecting on every refresh.
    const movingTrain = Object.entries(trainData).find(
      ([, records]) =>
        records.length > 3 &&
        records[0].destinationName === "Shenfield Rail Station" &&
        records[0].timeToStation <= Date.now() + 60000 // arriving in the next minute
    );

    if (movingTrain) {
      setSelectedTrainId((prev) => prev ?? movingTrain[0]);
      setSingleTrain(movingTrain[1][0]);
      console.log("set single train:", selectedTrainId);
    } else {
      // leave selectedTrainId alone (parent may have set it); clear singleTrain
      setSingleTrain(null);
      console.log("set single train:", "null");
    }
  }, [trainData, selectedTrainId]);

  return { selectedTrainId, setSelectedTrainId, singleTrain };
}
