import useTrainData from "../hooks/useTrainData";
import type { TrainRecord } from "../types/train";

interface SingleTrainPanelProps {
  trainId: string; // the ID of the train you want to show
}

export default function SingleTrainPanel({ trainId }: SingleTrainPanelProps) {
  const { trainData } = useTrainData();

  // Flatten all station arrays into one big array
  const allTrains: TrainRecord[] = Object.values(trainData).flat();

  // Find the train by ID
  const train = allTrains.find((t) => t.vehicleId === trainId);

  if (!train) {
    return <div>No train found with ID {trainId}</div>;
  }

  return (
    <div className="flex flex-col train-panel justify-end items-end">
      <h2>Train {train.id}</h2>
      <p>
        <strong>Status:</strong> {train.destinationName}
      </p>
      <p>
        <strong>Origin:</strong> {train.stationName}
      </p>
      <p>
        <strong>Destination:</strong> {train.timeCreate}
      </p>
      <p>
        <strong>Scheduled:</strong> {train.timeEdit}
      </p>
      <p>
        <strong>Platform:</strong> {train.vehicleId}
      </p>
    </div>
  );
}
