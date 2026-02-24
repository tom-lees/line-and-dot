import useTrainData from "../hooks/useTrainData";
import type { TrainRecord } from "../domain/train";
import findLineForTrain from "./trainFindLine";
import { network } from "../domain/lines";

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

  const trainLine = findLineForTrain(
    network.elizabeth,
    train.stationName,
    train.destinationName,
  );

  return (
    <div className="flex flex-col train-panel justify-end items-end">
      <h2>Train {train.id}</h2>
      <p>
        <strong>Destination:</strong> {train.destinationName}
      </p>
      <p>
        <strong>Station Name:</strong> {train.stationName}
      </p>
      <p>
        <strong>Created:</strong>{" "}
        {new Date(train.timeCreate).toLocaleTimeString()}
      </p>
      <p>
        <strong>Edited:</strong> {new Date(train.timeEdit).toLocaleTimeString()}
      </p>
      <p>
        <strong>Vehicle:</strong> {train.vehicleId}
      </p>
      <p>
        <strong>Line:</strong> {trainLine?.name}
      </p>
    </div>
  );
}
// 202511228007616
