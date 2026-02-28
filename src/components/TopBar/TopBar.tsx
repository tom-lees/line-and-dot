export const TopBar = ({
  isAboutOpen,
  isFilterOpen,
  isMobile,
  onToggleAbout,
  onToggleFilter,
}: {
  isAboutOpen: boolean;
  isFilterOpen: boolean;
  isMobile: boolean;
  onToggleAbout: () => void;
  onToggleFilter: () => void;
}) => {
  return (
    <header>
      <div className="flex justify-between">
        <button
          className="bg-stone-100 text-black p-2 rounded  mb-2 whitespace-nowrap pointer-events-auto"
          onClick={() => {
            onToggleFilter();
            if (isMobile && isAboutOpen) {
              onToggleAbout();
            }
          }}
        >
          {isFilterOpen ? "Hide" : "Label & Line Filters"}
        </button>

        <button
          className="bg-stone-100 text-black p-2 rounded  mb-2 whitespace-nowrap pointer-events-auto"
          onClick={() => {
            onToggleAbout();
            if (isMobile && isFilterOpen) {
              onToggleFilter();
            }
          }}
        >
          {isAboutOpen ? "Hide" : "About / Hire Me <3"}
        </button>
      </div>
    </header>
  );
};
