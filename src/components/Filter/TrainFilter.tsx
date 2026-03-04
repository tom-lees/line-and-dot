import { LINE_IDS } from "../Line/line.constants";
import { LINE_COLOURS } from "../Line/line.colours";
import type { VisibleTrainLinesWithOptionalLabels } from "./filter.types";

export const TrainFilter = ({
  onChange,
  visibleTrainLinesWithOptionalLabels,
}: {
  onChange: (updated: VisibleTrainLinesWithOptionalLabels) => void;
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

  const header = (
    <div className="flex flex-row mt-8 w-full items-end justify-start font-bold border-b border-stone-300 pb-6 ">
      <div className="flex -mb-6 ml-8 items-end w-min justify-center ">
        <span className="rotate-[-30deg] origin-bottom-left inline-block whitespace-nowrap">
          Stations
        </span>
      </div>

      <div className="flex -mb-6 -ml-6 items-end  justify-center">
        <span className="rotate-[-30deg] origin-bottom-left inline-block whitespace-nowrap">
          Lines
        </span>
      </div>
    </div>
  );

  const checkbox = (
    <>
      {LINE_IDS.map((lineId) => {
        const { line, label } = visibleTrainLinesWithOptionalLabels[lineId];
        return (
          <div
            key={lineId}
            className="flex flex-row items-center justify-start gap-4 "
          >
            {/* Label Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={label}
                disabled={!line}
                onChange={() => toggleLabel(lineId)}
                className="w-6 h-6 rounded-sm appearance-none border-2 border-stone-300
                           checked:border-none checked:bg-stone-700 checked:flex checked:items-center checked:justify-center
                                        checked:before:content-['✓'] checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center"
              />
            </div>

            {/* line checkbox */}
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={line}
                onChange={() => toggleLine(lineId)}
                className="w-6 h-6 rounded-sm appearance-none border-2 border-stone-300
                           checked:border-none checked:bg-[var(--line-color)] checked:flex checked:items-center checked:justify-center
                                        checked:before:content-['✓'] checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center"
                style={
                  {
                    "--line-color": LINE_COLOURS[lineId],
                  } as React.CSSProperties
                }
              />
              <span className="capitalize whitespace-nowrap">
                {lineId.replace(/([A-Z])/g, " $1")}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <div className="flex w-full max-h-full pb-10">
      <div className="flex flex-col bg-stone-100 rounded pointer-events-auto ">
        <div className="flex w-full">{header}</div>
        <div className="flex flex-col w-full gap-2  overflow-auto p-4">
          {checkbox}
        </div>
      </div>
    </div>
  );
};
