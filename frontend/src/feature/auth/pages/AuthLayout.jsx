import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../../../app/components/ThemeToggle";

const AuthLayout = ({ children, leftTitle, leftSubtitle, icon }) => {
  return (
    // dark: classes add ki hain taaki layout dark/light mode handle kare
    <div className="min-h-screen flex w-full bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* LEFT SIDE (Brand Banner - remains dark always for premium feel) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative bg-[#121212] border-r border-gray-200 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute -left-20 top-1/3 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <Link
          to="/"
          className="relative z-10 font-bold text-2xl tracking-widest flex items-center gap-2 text-white transition-colors"
        >
          <div className="w-8 h-8 bg-white text-black flex justify-center items-center rounded-sm">
            K
          </div>
          KNOW <span className="text-emerald-500">AI</span>
        </Link>

        <div className="relative z-10 mb-20 text-white">
          <div className="w-16 h-16 bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center rounded-2xl mb-8 shadow-xl">
            {icon}
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            {leftTitle}
          </h1>
          <p className="text-lg text-gray-400 max-w-md leading-relaxed">
            {leftSubtitle}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Form Container) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-24 relative">
        <div className="absolute top-6 right-6 lg:top-10 lg:right-10 z-50">
          <ThemeToggle className="" />
        </div>

        <div className="w-full max-w-md z-10">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;