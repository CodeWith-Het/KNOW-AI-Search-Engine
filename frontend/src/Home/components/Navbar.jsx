import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../../app/components/ThemeToggle";

const Navbar = () => {
  return (
    <nav className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 py-6 relative z-20 border-b border-transparent dark:border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-900 dark:bg-white text-white dark:text-black rounded flex items-center justify-center font-bold text-xl transition-colors">
          K
        </div>
        <span className="font-extrabold text-xl lg:text-2xl tracking-tight text-gray-900 dark:text-white transition-colors">
          KNOW{" "}
          <span className="text-emerald-600 dark:text-emerald-500">AI</span>
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
        <a
          href="#how-it-works"
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          How it works
        </a>
        <a
          href="#engineering"
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Engineering Log
        </a>
        <a
          href="https://github.com/CodeWith-Het"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          GitHub
        </a>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <Link
          to="/login"
          className="rounded-full bg-gray-900 dark:bg-emerald-600 text-white text-sm font-medium px-5 lg:px-6 py-2 lg:py-2.5 hover:bg-black dark:hover:bg-emerald-500 transition-colors shadow-lg dark:shadow-emerald-900/50"
        >
          Try it for free
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
