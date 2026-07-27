import React from "react";

const Features = () => {
  return (
    <section
      id="how-it-works"
      className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24"
    >
      <div className="text-center w-full max-w-3xl mx-auto mb-12 lg:mb-16">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
          Ground models with fresh context
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-base lg:text-lg transition-colors">
          Most AI chatbots guess numbers from memory. KNOW AI decides per
          question what it actually needs to fetch, eliminating hallucinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Feature 1 */}
        <div className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-xl dark:hover:shadow-emerald-900/10 transition-all duration-300">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4 lg:mb-6">
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6 text-teal-600 dark:text-teal-400"
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
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">
            Live Web Search
          </h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            For news, facts, and anything time-sensitive, the agent searches the
            open web and grounds its answer in what it finds — every claim
            traced back to a clickable source.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-xl dark:hover:shadow-emerald-900/10 transition-all duration-300">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 lg:mb-6">
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 dark:text-emerald-400"
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
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">
            Hybrid Stock Engine
          </h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Live numbers are pulled straight from our custom hybrid engine
            (Twelve Data + Yahoo Finance Fallback) to guarantee exact figures
            for US and Indian NSE/BSE markets.
          </p>
        </div>

        {/* Feature 3 (New) */}
        <div className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-xl dark:hover:shadow-emerald-900/10 transition-all duration-300">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4 lg:mb-6">
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">
            Real-time Streaming
          </h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Experience word-by-word streaming responses powered by WebSockets
            (Socket.io), creating a natural, conversational feel without waiting
            for the full generation to complete.
          </p>
        </div>

        {/* Feature 4 (New) */}
        <div className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:shadow-xl dark:hover:shadow-emerald-900/10 transition-all duration-300">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 lg:mb-6">
            <svg
              className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">
            MERN Stack Security
          </h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Built on a robust Full-Stack architecture utilizing MongoDB,
            Express, React, and Node.js. Protected routes and encrypted data
            handling ensure your research stays private.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;