import React from "react";

const TechTicker = () => {
  return (
    <section className="w-full border-y border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f] py-8 lg:py-10 px-4 transition-colors">
      <div className="w-full max-w-6xl mx-auto text-center">
        <p className="text-xs lg:text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 lg:mb-6">
          Built with enterprise-grade tech stack
        </p>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 lg:gap-16 items-center grayscale opacity-60 dark:opacity-40">
          <span className="text-lg lg:text-xl font-bold font-serif text-black dark:text-white">
            LangChain
          </span>
          <span className="text-lg lg:text-xl font-bold text-black dark:text-white">
            Node.js
          </span>
          <span className="text-lg lg:text-xl font-bold font-mono text-black dark:text-white">
            React
          </span>
          <span className="text-lg lg:text-xl font-bold text-black dark:text-white">
            MongoDB
          </span>
          <span className="text-lg lg:text-xl font-bold text-black dark:text-white">
            Redis
          </span>
        </div>
      </div>
    </section>
  );
};

export default TechTicker;