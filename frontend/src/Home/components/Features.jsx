import React from "react";

const Features = () => {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Ground models with a polished auth-style interface
        </h2>
        <p className="mt-4 text-slate-300 text-lg">
          Every core feature is built to feel modern and secure, just like the
          login/register experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 hover:border-emerald-400/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
            <svg
              className="w-6 h-6 text-emerald-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Live Web Search
          </h3>
          <p className="text-slate-300 leading-relaxed">
            For news, facts, and time-sensitive data, the agent searches the
            open web and grounds its answer in real sources.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 hover:border-cyan-400/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center mb-6">
            <svg
              className="w-6 h-6 text-cyan-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Hybrid Stock Engine
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Live market data is fetched with a dual-source engine for accurate
            finance answers and verified results.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
