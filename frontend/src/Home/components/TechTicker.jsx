import React from "react";

const TechTicker = () => {
  return (
    <section className="border-y border-gray-200 bg-white py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
          Built with enterprise-grade tech stack
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center grayscale opacity-60">
          <span className="text-xl font-bold font-serif">LangChain</span>
          <span className="text-xl font-bold">Node.js</span>
          <span className="text-xl font-bold font-mono">React</span>
          <span className="text-xl font-bold">MongoDB</span>
          <span className="text-xl font-bold">Redis</span>
        </div>
      </div>
    </section>
  );
};

export default TechTicker;