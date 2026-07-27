import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 relative z-20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/10 text-white rounded flex items-center justify-center font-bold text-lg">
          K
        </div>
        <span className="font-extrabold text-2xl tracking-tight text-white">
          KNOW <span className="text-emerald-400">AI</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#how-it-works" className="hover:text-white transition-colors">
          How it works
        </a>
        <a href="#engineering" className="hover:text-white transition-colors">
          Engineering Log
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          GitHub
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="rounded-full border border-white/10 text-white text-sm font-medium px-5 py-2.5 hover:bg-white/10 transition-colors"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 text-sm font-medium px-5 py-2.5 hover:opacity-95 transition-all"
        >
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
