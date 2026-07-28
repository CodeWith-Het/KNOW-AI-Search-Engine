import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRouter = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
        {/* Animated Logo & Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 border-4 border-transparent border-t-emerald-500 dark:border-t-emerald-400 border-r-emerald-500 dark:border-r-emerald-400 rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-2xl z-10 shadow-lg transition-colors">
            K
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-8 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight animate-pulse transition-colors">
            Authenticating...
          </h3>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (user?.isVerified) {
    return <Navigate to="/chat" replace />;
  }

  if (user) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default PublicRouter;