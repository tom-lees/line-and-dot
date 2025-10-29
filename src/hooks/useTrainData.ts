// useTrainData.ts
import { useEffect, useState } from "react";
import { trainService } from "../data/trainService";
import type { TrainRecord } from "../types/train";

export default function useTrainData() {
  const [data, setData] = useState<Record<string, TrainRecord[]>>({});

  useEffect(() => {
    trainService.start();
    const unsubscribe = trainService.subscribe(setData);
    return () => {
      unsubscribe();
      // keep service running if other subscribers remain — do not stop globally here
    };
  }, []);

  return {
    trainData: data,
    refresh: () => trainService.refresh(),
  };
}
