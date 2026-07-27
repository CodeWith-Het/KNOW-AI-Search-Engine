import React from "react";

const engineeringLog = [
  {
    tag: "architecture",
    title: "Hybrid Stock Engine Implementation",
    detail:
      "Most free APIs block NSE/BSE stock data. Engineered a fallback routing system that gracefully switches from Twelve Data to a custom Yahoo Finance scraper to fetch live Indian stocks for free.",
  },
  {
    tag: "feature",
    title: "Dynamic Tool Routing",
    detail:
      "The agent dynamically decides when to use the stockQuoteTool for exact real-time numbers and when to use the searchInternetTool for historical data, news, and facts.",
  },
  {
    tag: "fix",
    title: "Third-party Data Correction",
    detail:
      "A financial provider's synthetic cross-currency pairs returned numerically implausible values. Detected the pattern and recomputed conversions manually via a live forex-rate lookup.",
  },
  {
    tag: "perf",
    title: "Redis Caching Layer",
    detail:
      "To prevent rate-limiting on cloud infrastructure and deliver millisecond response times, every successful stock quote is cached in Redis for 30 seconds.",
  },
  {
    tag: "ui/ux",
    title: "Stateful Chat & Streaming",
    detail:
      "Integrated Socket.io with LangChain to provide word-by-word streaming responses and implemented MongoDB to persist chat history across user sessions.",
  },
];

const EngineeringLog = () => {
  return (
    <section
      id="engineering"
      className="w-full bg-[#111] dark:bg-[#050505] py-16 lg:py-24 text-white transition-colors border-t border-transparent dark:border-white/5"
    >
      <div className="w-full max-w-4xl mx-auto px-6 lg:px-12">
        <div className="mb-10 lg:mb-12 text-center lg:text-left">
          <span className="text-emerald-400 font-mono text-xs lg:text-sm tracking-widest uppercase bg-emerald-400/10 px-3 py-1 rounded-full">
            /engineering-log
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold mt-6 lg:mt-8 tracking-tight">
            Built by debugging it in production.
          </h2>
          <p className="mt-3 lg:mt-4 text-gray-400 text-base lg:text-lg max-w-2xl mx-auto lg:mx-0">
            No demo is finished on the first try. Here's what actually broke,
            and how we engineered the solutions to build a resilient AI
            platform.
          </p>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {engineeringLog.map((entry, i) => (
            <div
              key={i}
              className="w-full bg-white/5 dark:bg-white/[0.02] border border-white/10 dark:border-white/5 p-5 lg:p-6 rounded-xl lg:rounded-2xl hover:bg-white/10 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <span
                  className={`w-fit text-[10px] lg:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${entry.tag === "fix" ? "bg-red-500/20 text-red-400" : entry.tag === "perf" ? "bg-blue-500/20 text-blue-400" : entry.tag === "architecture" ? "bg-purple-500/20 text-purple-400" : "bg-emerald-500/20 text-emerald-400"}`}
                >
                  {entry.tag}
                </span>
                <h3 className="text-lg lg:text-xl font-bold text-gray-100">
                  {entry.title}
                </h3>
              </div>
              <p className="text-sm lg:text-base text-gray-400 leading-relaxed">
                {entry.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EngineeringLog;