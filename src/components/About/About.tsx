import { hireMeText } from "./About.containers";

export const About = () => {
  return (
    <div className="flex max-w-96 max-h-full pointer-events-auto pb-10">
      <div className="flex flex-col bg-stone-100 rounded  ">
        <div className="flex flex-col max-h-full w-full gap-2 ">
          {hireMeText}
        </div>
      </div>
    </div>
  );
};

// <div className=" pointer-event-auto overflow-auto flex flex-col w-1/3 h-full bg-stone-100 rounded p-4  border border-red-500 ">
//   <div className=" flex overflow-auto pointer-event-auto">
//   {/* Panel */}
//   {/* <div
//     className="
//   bg-white px-5 pt-4 pb-6 rounded-lg shadow-md flex flex-col gap-8
//   w-full md:w-1/3    max-h-[calc(100vh-8rem)]       overflow-y-auto
// "
//   > */}
//   {/* Hire Me Section */}
//   {hireMeText}

//   {/* Info Section */}
//   {infoText}
//   </div>
// </div>
