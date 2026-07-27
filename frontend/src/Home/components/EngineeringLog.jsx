import React from "react";

const engineeringLog = [
  {
    tag: "fix",
    title: "Hybrid Stock Engine for Indian Markets",
    detail:
      "Most free APIs block NSE/BSE stock data. Engineered a fallback routing system that gracefully switches from Twelve Data to a custom Yahoo Finance scraper to fetch live Indian stocks for free.",
  },
  {
    tag: "feature",
    title: "Smart Tool Routing",
    detail:
      "The agent dynamically decides when to use the stockQuoteTool for exact real-time numbers and when to use the searchInternetTool for historical data, news, and facts.",
  },
  {
    tag: "fix",
    title: "Silent bad data from a third-party API",
    detail:
      "A financial provider's synthetic cross-currency pairs returned numerically implausible values. Detected the pattern and recomputed conversions manually via a live forex-rate lookup.",
  },
  {
    tag: "perf",
    title: "Redis Caching Layer",
    detail:
      "To prevent rate-limiting on cloud infrastructure and deliver millisecond response times, every successful stock quote is cached in Redis for 30 seconds.",
  },
];

const EngineeringLog = () => {
  return (
    <section id="engineering" className="bg-gray-900 py-24 text-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase bg-emerald-400/10 px-3 py-1 rounded-full">
            /engineering-log
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-6 tracking-tight">
            Built by debugging it in production.
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl">
            No demo is finished on the first try. Here's what actually broke,
            and how we engineered the solutions.
          </p>
        </div>

        <div className="space-y-6">
          {engineeringLog.map((entry, i) => (
            <div
              key={i}
              className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${entry.tag === "fix" ? "bg-red-500/20 text-red-400" : entry.tag === "perf" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}
                >
                  {entry.tag}
                </span>
                <h3 className="text-xl font-bold">{entry.title}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">{entry.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EngineeringLog;