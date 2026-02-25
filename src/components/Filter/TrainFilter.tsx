import { LINE_IDS } from "../Line/line.constants";
import { LINE_COLOURS } from "../Line/line.colours";
import type { VisibleTrainLinesWithOptionalLabels } from "./filter.types";

export const TrainFilter = ({
  isOpen,
  onChange,
  setIsOpen,
  visibleTrainLinesWithOptionalLabels,
}: {
  isOpen: boolean;
  onChange: (updated: VisibleTrainLinesWithOptionalLabels) => void;
  setIsOpen: () => void;
  visibleTrainLinesWithOptionalLabels: VisibleTrainLinesWithOptionalLabels;
}) => {
  const toggleLine = (lineId: keyof VisibleTrainLinesWithOptionalLabels) => {
    const current = visibleTrainLinesWithOptionalLabels[lineId];
    onChange({
      ...visibleTrainLinesWithOptionalLabels,
      [lineId]: {
        line: !current.line,
        label: !current.line ? current.label : false,
      },
    });
  };

  const toggleLabel = (lineId: keyof VisibleTrainLinesWithOptionalLabels) => {
    const current = visibleTrainLinesWithOptionalLabels[lineId];
    if (!current.line) return;
    onChange({
      ...visibleTrainLinesWithOptionalLabels,
      [lineId]: {
        ...current,
        label: !current.label,
      },
    });
  };

  return (
    <div className="absolute top-4 left-4 ">
      {/* toggle filter button */}
      <button
        className="bg-white text-black p-2 rounded shadow mb-2 whitespace-nowrap"
        onClick={setIsOpen}
      >
        {isOpen ? "Hide" : "Label & Line Filters"}
      </button>

      {/* filter panel */}
      <div
        className={`
        bg-white px-4 pt-2 pb-4 rounded-lg shadow-md flex flex-col gap-2
        ${isOpen ? "block" : "hidden"} 
      `}
      >
        {/* Header row */}
        <div className="flex flex-row mt-6 items-end justify-start font-bold border-b border-gray-300 pb-6 ">
          <div className="flex -mb-6 ml-4 items-end w-min justify-center ">
            <span className="rotate-[-45deg] origin-bottom-left inline-block whitespace-nowrap">
              Label
            </span>
          </div>

          <div className="flex -mb-6 items-end  justify-center">
            <span className="rotate-[-45deg] origin-bottom-left inline-block whitespace-nowrap">
              Line
            </span>
          </div>
        </div>

        {LINE_IDS.map((lineId) => {
          const { line, label } = visibleTrainLinesWithOptionalLabels[lineId];
          return (
            <div
              key={lineId}
              className="flex flex-row items-center justify-start gap-4"
            >
              {/* Label Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={label}
                  disabled={!line}
                  onChange={() => toggleLabel(lineId)}
                  className="w-6 h-6 rounded-sm appearance-none border-2 border-gray-300
                           checked:border-none checked:bg-gray-700 checked:flex checked:items-center checked:justify-center"
                />
                <span
                  className="pointer-events-none absolute w-6 h-6 flex items-center justify-center"
                  style={{
                    color: label ? "white" : "transparent",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
              </div>

              {/* line checkbox */}
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={line}
                  onChange={() => toggleLine(lineId)}
                  className="w-6 h-6 rounded-sm appearance-none border-2 border-gray-300
                           checked:border-none checked:bg-[var(--line-color)] checked:flex checked:items-center checked:justify-center"
                  style={
                    {
                      "--line-color": LINE_COLOURS[lineId],
                    } as React.CSSProperties
                  }
                />
                <span
                  className="pointer-events-none absolute w-6 h-6 flex items-center justify-center"
                  style={{
                    color: line ? "white" : "transparent",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
                <span className="capitalize whitespace-nowrap">
                  {lineId.replace(/([A-Z])/g, " $1")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
