import { useState } from "react";

export const InfoHireMe = () => {
  //   const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 768);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 flex flex-col items-end  justify-end">
      {/* toggle filter button */}
      <button
        className="bg-white text-black p-2 rounded shadow mb-2 whitespace-nowrap"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Hide" : "Info / Hire Me <3"}
      </button>

      {/* info / hire me panel */}
      <div
        className={`
        bg-white px-4 pt-2 pb-4 rounded-lg shadow-md flex flex-col gap-2
        ${isOpen ? "block" : "hidden"} 
      `}
      >
        {/* Header row */}
        <div className="flex flex-row mt-4 items-end justify-start font-bold border-b border-gray-300 pb-6 "></div>
      </div>
    </div>
  );
};
