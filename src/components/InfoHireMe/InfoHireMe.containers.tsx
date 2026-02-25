import { HireMeContact } from "./HireMeContact";

export const infoText = (
  <aside className="flex flex-col gap-6 text-sm text-gray-800">
    {/* Header */}
    <header>
      <h2 className="text-lg font-bold">About This Project</h2>
      <p className="text-gray-600">
        Real-time 3D London Underground Visualisation
      </p>
    </header>

    {/* Overview */}
    <section>
      <h3 className="font-semibold uppercase text-xs tracking-wide text-gray-500">
        Overview
      </h3>
      <p className="mt-2">
        This visualisation renders the London Underground (including the
        Elizabeth Line) in real time, showing live train positions across the
        network.
      </p>
      <p className="mt-2">
        The z-axis is intentionally exaggerated to dramatise depth, creating a
        more immersive and visually striking interpretation of the network.
      </p>
    </section>

    {/* Tech */}
    <section>
      <h3 className="font-semibold uppercase text-xs tracking-wide text-gray-500">
        Technology
      </h3>
      <p className="mt-2">
        Built with React Three Fiber (TypeScript) for 3D rendering and
        interactive controls. Hosted on AWS.
      </p>
    </section>

    {/* Data Sources */}
    <section>
      <h3 className="font-semibold uppercase text-xs tracking-wide text-gray-500">
        Data
      </h3>
      <p className="mt-2">
        Tube line geometry was sourced from publicly available Transport for
        London (TfL) datasets and Freedom of Information requests.
      </p>
      <p className="mt-2">
        Train positions are estimated in real time using TfL’s public APIs.
      </p>
    </section>
  </aside>
);

export const hireMeText = (
  <aside className="flex flex-col gap-6 text-sm text-gray-800">
    {/* Header */}
    <header>
      <h2 className="text-lg font-bold">Hire Me</h2>
      <p className="text-gray-600">Software Engineer • London</p>
    </header>

    {/* Contact */}
    <HireMeContact />

    {/* Tech Stack */}
    <section>
      <h3 className="font-semibold uppercase text-xs tracking-wide text-gray-500">
        Tech Stack
      </h3>
      <p className="mt-2">
        TypeScript, JavaScript, React, Next.js, ES6, Tailwind, Node.js, Docker,
        SQL, PostgreSQL, Prisma, AWS, Microsoft Graph API, Git.
      </p>
      <p className="mt-2 italic text-gray-600">
        Always happy to learn on the job.
      </p>
    </section>

    {/* Experience */}
    <section>
      <h3 className="font-semibold uppercase text-xs tracking-wide text-gray-500">
        Experience
      </h3>
      <p className="mt-2">
        2 years professional experience as a Software Engineer.
      </p>
    </section>

    {/* Education */}
    <section>
      <h3 className="font-semibold uppercase text-xs tracking-wide text-gray-500">
        Education
      </h3>
      <ul className="mt-2 list-disc list-inside">
        <li>BEng in Mechanical Engineering</li>
        <li>Postgraduate Diploma in Data Analytics for Government</li>
      </ul>
    </section>
  </aside>
);
