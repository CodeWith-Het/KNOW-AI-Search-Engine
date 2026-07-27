import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isDarkMode, toggleDarkMode }) => {
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
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
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
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          ) : (
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
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              ></path>
            </svg>
          )}
        </button>

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