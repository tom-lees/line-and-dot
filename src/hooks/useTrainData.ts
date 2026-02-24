import { useEffect, useState } from "react";
import { trainService } from "../data/train/train.service";
import type { TimetableStore } from "../data/train/train.service.types";

export default function useTrainData() {
  const [data, setData] = useState<Record<string, TimetableStore>>({});

  useEffect(() => {
    trainService.start();
    const unsubscribe = trainService.subscribe((data) => {
      setData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    data,
    refresh: () => trainService.refresh(),
  };
}
