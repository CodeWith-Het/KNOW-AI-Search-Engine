import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-900 text-white rounded flex items-center justify-center font-bold text-xs">
            K
          </div>
          <span className="font-extrabold text-lg tracking-tight text-gray-900">
            KNOW AI
          </span>
        </div>

        <p className="text-sm text-gray-500">
          Built by{" "}
          <span className="font-semibold text-gray-900">Het Patel</span>.
          Trusted by developers.
        </p>

        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <a
            href="https://github.com/CodeWith-Het"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900"
          >
            GitHub
          </a>
          <Link to="/login" className="hover:text-gray-900">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;