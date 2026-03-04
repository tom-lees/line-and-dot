import { hireMeText } from "./About.containers";

export const About = () => {
  return (
    <div className="flex w-full sm:max-w-96  max-h-full  pb-10">
      <div className="flex flex-col bg-stone-100 rounded pointer-events-auto ">
        <div className="flex flex-col max-h-full w-full gap-2 ">
          {hireMeText}
        </div>
      </div>
    </div>
  );
};
