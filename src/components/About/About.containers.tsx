import { Contact } from "./Contact";

export const hireMeText = (
  <aside className="flex flex-col  max-h-full gap-6 text-sm text-stone-800">
    {/* Header */}
    <header className="flex items-center px-4 pt-4 justify-between">
      <h2 className="text-lg font-bold">Hire Me</h2>
      <div className="font-bold">
        <Contact />
      </div>
    </header>

    <div className="overflow-auto px-4 space-y-6">
      {/* About Me */}
      <section className="space-y-2">
        <p>Seeking software engineering roles within the transport industry.</p>
        <p>2 years’ professional experience as a Software Engineer.</p>
        <p>
          TypeScript, React, Next.js, ES6, Tailwind, Node.js, Docker, SQL,
          PostgreSQL, Prisma, AWS, Git, Vim.
        </p>

        <ul className="list-disc list-inside">
          <li>BEng in Mechanical Engineering</li>
          <li>Postgraduate Diploma in Data Analytics for Government</li>
        </ul>
      </section>

      {/* Overview */}
      <section>
        <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-500">
          Overview
        </h3>
        <div className="mt-2 space-y-2">
          <p>
            This visualisation renders the London Underground (including the
            Elizabeth Line) in real time, showing live train positions across
            the network.
          </p>
          <p>
            The Z-axis is intentionally exaggerated to dramatise depth, creating
            a more immersive and visually striking interpretation of the
            network.
          </p>
        </div>
      </section>

      {/* Technology */}
      <section>
        <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-500">
          Technology
        </h3>
        <p className="mt-2">
          Built with React Three Fiber (TypeScript) for 3D rendering and
          interactive controls. Hosted on AWS.
        </p>
      </section>

      {/* Data */}
      <section>
        <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-500">
          Data
        </h3>
        <div className="mt-2 space-y-2">
          <p>
            Tube line geometry sourced from publicly available Transport for
            London (TfL) datasets and Freedom of Information requests.
          </p>
          <p>Train positions estimated in real time using TfL’s public APIs.</p>
        </div>
      </section>
    </div>
  </aside>
);
