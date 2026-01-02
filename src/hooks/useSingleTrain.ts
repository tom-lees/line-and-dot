import { useEffect, useState } from "react";
import type { TrainRecord } from "../types/train";
import useTrainData from "./useTrainData";

// TODO Make function universal, not just R 2 S line.
// TODO Control the deletion of records from within a train record.
// - 1) as new records come in, perhaps try the encyption thing and update when
// record changes.
// TODO Code broke when no 'Stratford' came up as destination.  Should have handled null/empty return
/**
 * Locates a moving train on the Reading to Shenfield line.
 */

// const data: Record<string, TrainRecord[]>

export default function useSingleTrain(): {
  selectedTrainId: string | null;
  setSelectedTrainId: (id: string | null) => void;
  data: Record<string, TrainRecord[]> | null;
} {
  const { trainData } = useTrainData();

  // the id of the train the user wants to follow. Parent can set this.
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);

  // currently selected TrainRecord (keeps updating as trainData refreshes)
  const [singleTrainData, setSingleTrainData] = useState<Record<
    string,
    TrainRecord[]
  > | null>(null);

  useEffect(() => {
    // If an id is already selected, keep updating that train's latest record
    if (selectedTrainId) {
      const records = trainData[selectedTrainId];
      setSingleTrainData(
        records && records.length > 0 ? { [selectedTrainId]: records } : null
      );
      return;
    }

    // No explicit selection: auto-select the first matching train, but only when
    // nothing is already selected. This prevents re-selecting on every refresh.
    const movingTrain = Object.entries(trainData)
      .filter(([vehicleId]) => vehicleId !== "000")
      .find(
        ([, records]) =>
          records.length > 3 &&
          records[0].destinationName.toLowerCase().includes("shenfield") &&
          records[0].timeToStation <= Date.now() + 60000 // arriving in the next minute
      );

    if (!movingTrain) {
      setSingleTrainData(null);
      console.log("set single train:", "null");
      return;
    }
    const [trainId, trainRecords] = movingTrain;

    setSelectedTrainId((prev) => prev ?? trainId);
    setSingleTrainData({ [trainId]: trainRecords });
    console.log("set single train:", selectedTrainId);
  }, [trainData, selectedTrainId]);

  return {
    selectedTrainId,
    setSelectedTrainId,
    data: singleTrainData,
  };
}
