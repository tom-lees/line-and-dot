import { useState } from "react";

const CopyIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M16 1H4a2 2 0 00-2 2v12h2V3h12V1z" />
    <path d="M20 5H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h12v14z" />
  </svg>
);

export const HireMeContact = () => {
  const [copied, setCopied] = useState(false);
  const email = "hire-tom@outlook.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <section>
      <h3 className="font-semibold uppercase text-xs tracking-wide text-gray-500">
        Contact
      </h3>

      <div className="relative inline-block mt-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 underline hover:text-gray-600 transition"
        >
          {email}
          <CopyIcon className="w-4 h-4 opacity-60" />
        </button>

        {/* Tooltip */}
        <span
          className={`
            absolute -top-6 left-1/2 -translate-x-1/2
            text-xs bg-black text-white px-2 py-1 rounded
            transition-all duration-200
            ${copied ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
          `}
        >
          Copied ✓
        </span>
      </div>
    </section>
  );
};
