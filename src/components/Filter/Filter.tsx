import { useState, useEffect } from "react";
import { LINE_IDS } from "../Line/line.constants";
import { LINE_COLOURS } from "../Line/line.colours";
import type { VisibleTrainLinesWithOptionalLabels } from "./filter.types";

type TrainFilterProps = {
  visibleTrainLinesWithOptionalLabels: VisibleTrainLinesWithOptionalLabels;
  onChange: (updated: VisibleTrainLinesWithOptionalLabels) => void;
};

export const TrainFilter = ({
  visibleTrainLinesWithOptionalLabels,
  onChange,
}: TrainFilterProps) => {
  const [isOpen, setIsOpen] = useState(false); // mobile toggle

  useEffect(() => {
    // Function to check screen width and update isOpen
    const checkScreenWidth = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Set to true for medium screens and above
      } else {
        setIsOpen(false); // Set to false for mobile screens
      }
    };

    // Check on mount
    checkScreenWidth();

    // Add resize event listener
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

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
      {/* Mobile toggle button */}
      <button
        className="bg-white text-black p-2 rounded shadow mb-2 whitespace-nowrap"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Hide" : "Label & Line Filters"}
      </button>

      {/* Filter panel */}
      <div
        className={`
        bg-white p-4 rounded-lg shadow-md flex flex-col gap-2
        ${isOpen ? "block" : "hidden"} 
      `}
      >
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
                  className="w-5 h-5 rounded-sm appearance-none border-2 border-gray-300
                           checked:border-none checked:bg-gray-700 checked:flex checked:items-center checked:justify-center"
                />
                <span
                  className="pointer-events-none absolute w-5 h-5 flex items-center justify-center"
                  style={{
                    color: label ? "white" : "transparent",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
              </div>
              {/* Line Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={line}
                  onChange={() => toggleLine(lineId)}
                  className="w-5 h-5 rounded-sm appearance-none border-2 border-gray-300
                           checked:border-none checked:bg-[var(--line-color)] checked:flex checked:items-center checked:justify-center"
                  style={
                    {
                      "--line-color": LINE_COLOURS[lineId],
                    } as React.CSSProperties
                  }
                />
                <span
                  className="pointer-events-none absolute w-5 h-5 flex items-center justify-center"
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
