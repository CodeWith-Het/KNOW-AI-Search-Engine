import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import Protected from "../feature/auth/components/Protected.jsx";
import PublicRouter from "../feature/auth/components/PublicRouter.jsx";
import Chatwrapper from "../feature/chat/layout/Chatwrapper.jsx";

const LandingPage = lazy(() => import("../Home/pages/LandingPage.jsx"));
const Login = lazy(() => import("../feature/auth/pages/Login.jsx"));
const Register = lazy(() => import("../feature/auth/pages/Register.jsx"));
const VerifyEmail = lazy(() => import("../feature/auth/pages/VerifyEmail.jsx"));
const Dashboard = lazy(() => import("../feature/chat/pages/Dashboard.jsx"));

const PageLoader = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
    {/* Animated Logo & Spinner */}
    <div className="relative flex items-center justify-center">
      <div className="absolute w-20 h-20 border-4 border-transparent border-t-emerald-500 dark:border-t-emerald-400 border-r-emerald-500 dark:border-r-emerald-400 rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
      <div className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-2xl z-10 shadow-lg transition-colors">
        K
      </div>
    </div>

    <div className="mt-8 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight animate-pulse transition-colors">
        Loading Workspace...
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

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRouter>
        <SuspenseWrapper>
          <LandingPage />
        </SuspenseWrapper>
      </PublicRouter>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRouter>
        <SuspenseWrapper>
          <Login />
        </SuspenseWrapper>
      </PublicRouter>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRouter>
        <SuspenseWrapper>
          <Register />
        </SuspenseWrapper>
      </PublicRouter>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <SuspenseWrapper>
        <VerifyEmail />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/chat",
    element: (
      <Protected>
        <Chatwrapper>
          <SuspenseWrapper>
            <Outlet />
          </SuspenseWrapper>
        </Chatwrapper>
      </Protected>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: ":id",
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Navigate to="/chat" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);