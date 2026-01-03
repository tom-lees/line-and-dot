import { useEffect, useState } from "react";
import { trainService } from "../data/trainService";
import type { TrainRecord } from "../types/train";

export default function useTrainData() {
  const [data, setData] = useState<Record<string, TrainRecord[]>>({});

  useEffect(() => {
    trainService.start();
    const unsubscribe = trainService.subscribe((data) => {
      setData(data);
    });

    const interval = setInterval(() => {
      trainService.refresh();
    }, 5000); // refresh every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    trainData: data,
    refresh: () => trainService.refresh(),
  };
}
