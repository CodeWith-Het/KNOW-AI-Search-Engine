import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 text-white rounded flex items-center justify-center font-bold text-base">
            K
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            KNOW AI
          </span>
        </div>

        <p className="text-sm text-slate-400">
          Built by <span className="font-semibold text-white">Het Patel</span>.
          Trusted by developers.
        </p>

        <div className="flex gap-6 text-sm font-medium text-slate-300">
          <a
            href="https://github.com/CodeWith-Het"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            GitHub
          </a>
          <Link to="/login" className="hover:text-white">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
