import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6 relative z-20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-900 text-white rounded flex items-center justify-center font-bold text-xl">
          K
        </div>
        <span className="font-extrabold text-2xl tracking-tight text-gray-900">
          KNOW <span className="text-emerald-600">AI</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <a
          href="#how-it-works"
          className="hover:text-gray-900 transition-colors"
        >
          How it works
        </a>
        <a
          href="#engineering"
          className="hover:text-gray-900 transition-colors"
        >
          Engineering Log
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900 transition-colors"
        >
          GitHub
        </a>
      </div>
      <Link
        to="/login"
        className="rounded-full bg-gray-900 text-white text-sm font-medium px-6 py-2.5 hover:bg-black transition-colors"
      >
        Try it for free
      </Link>
    </nav>
  );
};

export default Navbar;
