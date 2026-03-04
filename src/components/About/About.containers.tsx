import { Contact } from "./Contact";

export const hireMeText = (
  <aside className="flex flex-col  max-h-full text-sm text-stone-800">
    {/* Header */}
    <header className="flex items-center px-4 pb-2 pt-4 justify-between ">
      <h2 className="text-lg font-bold ">Hire Me</h2>
      <div className="flex font-bold -mt-2">
        <Contact />
      </div>
    </header>

    <div className="overflow-auto px-4 ">
      {/* About Me */}
      <section>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            Software Engineer seeking roles within the transport industry.
          </li>
          <li>TypeScript, React, Next.js, Node.js, SQL, AWS, THREE.js.</li>
          <li>
            BEng Mechanical Engineering + PGDip Data Analytics for Government.
          </li>
          <li>Based in London.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold mt-4 mb-2">About</h2>
        <div className=" space-y-2">
          <p>
            This interactive visualisation renders the London Underground
            (including the Elizabeth Line), showing live train positions across
            the network.
          </p>
          <p>
            The z-axis is intentionally exaggerated to dramatise depth, creating
            a more immersive and visually striking view of the network.
          </p>
          <p className="mt-2">
            Built with <strong>React Three Fiber</strong> (
            <strong>TypeScript</strong>) for 3D rendering and interactive
            controls, hosted on <strong>AWS</strong>.
          </p>
          <p>
            Tube line geometry sourced from publicly available
            <strong> Transport for London (TfL) datasets</strong> (© Transport
            for London) and Freedom of Information requests.
          </p>
          <p>
            Train positions are estimated in real time using TfL’s public APIs.
          </p>
          <p></p>
        </div>
      </section>
    </div>
  </aside>
);
