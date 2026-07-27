import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/10 pt-16 pb-8 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top Section: Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-black rounded flex items-center justify-center font-bold text-xl transition-colors">
                K
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white transition-colors">
                KNOW{" "}
                <span className="text-emerald-600 dark:text-emerald-500">
                  AI
                </span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
              The next-generation AI agent that connects to real-time financial
              markets and web search to provide grounded, verifiable research.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/CodeWith-Het"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              {/* Add more social icons here if needed */}
            </div>
          </div>

          {/* Product Column */}
          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Live Demo
                </Link>
              </li>
              <li>
                <a
                  href="#engineering"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Engineering
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="col-span-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Connect
            </h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a
                  href="https://github.com/CodeWith-Het"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  CodeWith-Het
                </a>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
            © {new Date().getFullYear()} KNOW AI. Built by{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Het Patel
            </span>
            .
          </p>
          <div className="flex gap-4 lg:gap-6 text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400">
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;