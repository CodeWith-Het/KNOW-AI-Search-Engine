import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PublicRouter from "../feature/auth/components/PublicRouter.jsx";
import Navbar from "../feature/chat/components/Navbar.jsx";

// Lazy loaded pages
const LandingPage = lazy(() => import("../Home/pages/LandingPage.jsx"));

const Login = lazy(() => import("../feature/auth/pages/Login.jsx"));

const Register = lazy(() => import("../feature/auth/pages/Register.jsx"));

const VerifyOtp = lazy(() => import("../feature/auth/pages/VerifyOtp.jsx"));

// Page Loader
const PageLoader = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
    {/* Animated Logo & Spinner */}
    <div className="relative flex items-center justify-center">
      <div
        className="
          absolute w-20 h-20
          border-4 border-transparent
          border-t-emerald-500
          border-r-emerald-500
          dark:border-t-emerald-400
          dark:border-r-emerald-400
          rounded-full
          animate-spin
          shadow-[0_0_15px_rgba(16,185,129,0.5)]
        "
      />

      <div
        className="
          w-12 h-12
          bg-gray-900 dark:bg-white
          text-white dark:text-black
          rounded-xl
          flex items-center justify-center
          font-bold text-2xl
          z-10 shadow-lg
        "
      >
        K
      </div>
    </div>

    {/* Loading Text */}
    <div className="mt-8 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight animate-pulse">
        Loading Workspace...
      </h3>

      {/* Loading Dots */}
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

// Suspense Wrapper
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Router Component
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <PublicRouter>
              <SuspenseWrapper>
                <LandingPage />
              </SuspenseWrapper>
            </PublicRouter>
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            <PublicRouter>
              <SuspenseWrapper>
                <Login />
              </SuspenseWrapper>
            </PublicRouter>
          }
        />

        {/* Register */}
        <Route
          path="/register"
          element={
            <PublicRouter>
              <SuspenseWrapper>
                <Register />
              </SuspenseWrapper>
            </PublicRouter>
          }
        />

        {/* Verify OTP */}
        <Route
          path="/verify-otp"
          element={
            <SuspenseWrapper>
              <VerifyOtp />
            </SuspenseWrapper>
          }
        />

        {/* chats */}
        <Route path="/chats" element={
          <SuspenseWrapper>
            <Navbar />
          </SuspenseWrapper>
        } />

        {/* 404 → Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
