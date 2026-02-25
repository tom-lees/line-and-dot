import { hireMeText, infoText } from "./InfoHireMe.containers";

export const InfoHireMe = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: () => void;
}) => {
  return (
    <div className="flex flex-col items-end  justify-end">
      {/* toggle filter button */}
      <button
        className="bg-white text-black p-2 rounded shadow mb-2 whitespace-nowrap"
        onClick={setIsOpen}
      >
        {isOpen ? "Hide" : "About / Hire Me <3"}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="
      bg-white px-5 pt-4 pb-6 rounded-lg shadow-md flex flex-col gap-8 
      w-full md:w-1/3    max-h-[calc(100vh-8rem)]       overflow-y-auto

    "
        >
          {/* Info Section */}
          {infoText}

          {/* Divider */}
          {/* <div className="border-t border-gray-200" /> */}

          {/* Hire Me Section */}
          {hireMeText}
        </div>
      )}
    </div>
  );
};
