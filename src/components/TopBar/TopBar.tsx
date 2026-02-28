export const TopBar = ({
  isFilterOpen,
  isAboutOpen,
  onToggleFilter,
  onToggleAbout,
}: {
  isFilterOpen: boolean;
  isAboutOpen: boolean;
  onToggleFilter: () => void;
  onToggleAbout: () => void;
}) => {
  return (
    <header>
      <div className="flex justify-between">
        <button
          className="bg-white text-black p-2 rounded  mb-2 whitespace-nowrap pointer-events-auto"
          onClick={onToggleFilter}
        >
          {isFilterOpen ? "Hide" : "Label & Line Filters"}
        </button>

        <button
          className="bg-white text-black p-2 rounded  mb-2 whitespace-nowrap pointer-events-auto"
          onClick={onToggleAbout}
        >
          {isAboutOpen ? "Hide" : "About / Hire Me <3"}
        </button>
      </div>
    </header>
  );
};
