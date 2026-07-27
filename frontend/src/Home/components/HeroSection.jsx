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
    <section className="relative w-full flex flex-col items-center pt-20 pb-32 overflow-hidden">
      <div className="absolute top-10 z-0 flex justify-center items-center opacity-60 pointer-events-none">
        <div
          className="w-[800px] h-[500px] bg-gradient-to-r from-teal-200 via-emerald-100 to-blue-200 blur-[100px] rounded-full mix-blend-multiply animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          Connect your AI agents <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            to real-time data
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          A production-grade AI agent that intelligently routes between live
          stock data engines and real-time web search to give you verifiable
          answers.
        </p>

        <Link
          to="/register"
          className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-xl shadow-gray-900/20 mb-16"
        >
          Start researching now
        </Link>

        <div className="w-full max-w-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-5 flex flex-col text-left transition-all duration-500">
          <div className="flex items-center w-full bg-transparent p-2 border-b border-gray-200/50 pb-4">
            <div className="flex-1 text-gray-800 text-lg md:text-xl font-medium">
              {displayedText}
              <span className="inline-block w-0.5 h-6 bg-emerald-500 ml-1 align-middle animate-pulse"></span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white shrink-0">
              <svg
                className="w-5 h-5"
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
            className={`mt-4 px-2 transition-all duration-500 ${showAnswer ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"}`}
          >
            <div className="flex gap-2 mb-3">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>{" "}
                Live Data Fetched
              </span>
              <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                Source: Hybrid Engine
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
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