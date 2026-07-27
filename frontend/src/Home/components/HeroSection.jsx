import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DEMO_QUERIES = [
  "What is the live share price of Tata Motors?",
  "What's the latest news in AI this week?",
  "Bitcoin price in INR right now?",
];

const HeroSection = () => {
  const [queryIndex, setQueryIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fullText = DEMO_QUERIES[queryIndex];
    setDisplayedText("");
    setShowAnswer(false);

    let i = 0;
    const typeTimer = setInterval(() => {
      i += 1;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(typeTimer);
        setTimeout(() => setShowAnswer(true), 600);
      }
    }, 50);

    return () => clearInterval(typeTimer);
  }, [queryIndex]);

  useEffect(() => {
    const cycle = setTimeout(() => {
      setQueryIndex((i) => (i + 1) % DEMO_QUERIES.length);
    }, 6000);
    return () => clearTimeout(cycle);
  }, [queryIndex]);

  return (
    <section className="relative w-full flex flex-col items-center pt-16 lg:pt-24 pb-20 lg:pb-32 overflow-hidden px-4 lg:px-0">
      <div className="absolute top-10 z-0 flex justify-center items-center opacity-60 dark:opacity-30 pointer-events-none transition-opacity duration-500">
        <div
          className="w-[80vw] lg:w-[50vw] max-w-3xl aspect-square bg-gradient-to-r from-teal-200 via-emerald-100 to-blue-200 dark:from-emerald-900 dark:via-teal-900 dark:to-gray-900 blur-[80px] lg:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-lighten animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight transition-colors">
          Connect your AI agents <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
            to real-time data
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-8 lg:mb-10 max-w-2xl px-4 lg:px-0 transition-colors">
          A production-grade AI agent that intelligently routes between live
          stock data engines and real-time web search.
        </p>

        <Link
          to="/register"
          className="bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black px-6 lg:px-8 py-3 lg:py-3.5 rounded-full font-medium transition-all shadow-xl shadow-gray-900/20 dark:shadow-white/10 mb-12 lg:mb-16"
        >
          Start researching now
        </Link>

        <div className="w-full max-w-3xl bg-white/40 dark:bg-[#121212]/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col text-left transition-all duration-500">
          <div className="flex items-center w-full bg-transparent p-2 border-b border-gray-200/50 dark:border-white/10 pb-3 lg:pb-4 transition-colors">
            <div className="flex-1 text-gray-800 dark:text-gray-200 text-base sm:text-lg lg:text-xl font-medium">
              {displayedText}
              <span className="inline-block w-0.5 h-5 lg:h-6 bg-emerald-500 ml-1 align-middle animate-pulse"></span>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0 transition-colors">
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                ></path>
              </svg>
            </div>
          </div>

          <div
            className={`mt-3 lg:mt-4 px-2 transition-all duration-500 ${showAnswer ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] lg:text-xs font-semibold px-2 lg:px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>{" "}
                Live Data Fetched
              </span>
              <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] lg:text-xs px-2 lg:px-3 py-1 rounded-full transition-colors">
                Source: Hybrid Engine
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm leading-relaxed transition-colors">
              Routing query to appropriate tool... <br />
              Synthesizing real-time information from verified financial sources
              and web indexing to generate a grounded response.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;