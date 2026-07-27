import React from "react";

const AuthLayout = ({ children, leftTitle, leftSubtitle, icon = "▶" }) => {
  return (
    <div className="h-screen w-screen m-0 p-0 overflow-hidden font-sans flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE — Dynamic Gradient Banner */}
      <div className="hidden md:flex md:w-[50%] h-full bg-gradient-to-tr from-[#cbe4ff] via-[#d7cbfb] to-[#fbcfe8] p-8 lg:p-16 flex-col justify-center relative overflow-hidden">
        {/* Decorative Background Shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        {/* Frosted Glass Content Box */}
        <div className="relative z-10 bg-white/25 backdrop-blur-xl border border-white/40 p-8 lg:p-12 rounded-3xl shadow-lg">
          <span className="text-2xl font-bold text-gray-900 inline-block mb-3">
            {icon}
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-[1.2] tracking-tight">
            {leftTitle}
          </h1>
          <p className="mt-4 text-sm lg:text-base text-gray-700 leading-relaxed font-medium whitespace-pre-line">
            {leftSubtitle}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — Form Area */}
      <div className="w-full md:w-[50%] h-full p-6 sm:p-10 lg:p-16 flex flex-col justify-center overflow-y-auto bg-white">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
