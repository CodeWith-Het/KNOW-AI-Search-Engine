import React from "react";

const Features = () => {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Ground models with fresh context
        </h2>
        <p className="mt-4 text-gray-600 text-lg">
          Most AI chatbots guess numbers from memory. KNOW AI decides per
          question what it actually needs to fetch, eliminating hallucinations.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
            <svg
              className="w-6 h-6 text-teal-600"
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
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Live Web Search
          </h3>
          <p className="text-gray-600 leading-relaxed">
            For news, facts, and anything time-sensitive, the agent searches the
            open web and grounds its answer in what it finds — every claim
            traced back to a clickable source.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
            <svg
              className="w-6 h-6 text-emerald-600"
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
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Hybrid Stock Engine
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Stock and crypto prices skip search entirely. Live numbers are
            pulled straight from our custom hybrid engine (Twelve Data + Yahoo
            Finance) to guarantee exact figures.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;