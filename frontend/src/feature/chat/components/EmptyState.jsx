import React from "react";

const SUGGESTED = [
  "Latest AI news",
  "Explain quantum computing",
  "Compare React and Next.js",
  "Research Tesla",
  "What's a good approach for learning DSA?",
];

const EmptyState = ({ onPick, children }) => {
  return (
    <div className="w-full px-4">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em] text-[#e8a33d]">
          Know AI
        </span>
        <h1 className="mt-3 text-3xl font-bold text-[#ece9e2] sm:text-4xl">
          Ask anything.{" "}
          <span className="text-[#e8a33d]">Discover everything.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#ece9e2]/50">
          Search the web, analyze information, and explore ideas with an AI that
          shows its sources.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">{children}</div>

      <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
        {SUGGESTED.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-[#ece9e2]/60 transition-colors hover:border-[#e8a33d]/30 hover:text-[#ece9e2]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;