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
          className="w-[800px] h-[500px] bg-gradient-to-r from-emerald-400/20 via-cyan-400/10 to-violet-500/10 blur-[120px] rounded-full mix-blend-multiply animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Your AI search assistant
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
            built for instant, reliable answers.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl">
          Experience a polished AI landing page that matches the same premium
          login and register interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 py-3.5 text-sm font-semibold text-slate-950 shadow-xl shadow-emerald-400/25 transition-all hover:opacity-95"
          >
            Create account
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/15"
          >
            Log in
          </Link>
        </div>

        <div className="w-full max-w-3xl bg-slate-900/80 border border-white/10 shadow-2xl rounded-3xl p-6 flex flex-col text-left transition-all duration-500">
          <div className="flex items-center w-full bg-slate-950/40 p-2 rounded-3xl border border-white/10 mb-4">
            <div className="flex-1 text-white text-lg md:text-xl font-medium">
              {displayedText}
              <span className="inline-block w-0.5 h-6 bg-emerald-400 ml-1 align-middle animate-pulse"></span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-300 shrink-0">
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
              <span className="bg-emerald-500/15 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Live Data Fetched
              </span>
              <span className="bg-white/5 text-slate-300 text-xs px-3 py-1 rounded-full">
                Source: Hybrid Engine
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Routing queries to the right tool and grounding answers in
              real-time sources — the same polished experience as your
              login/register UI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
