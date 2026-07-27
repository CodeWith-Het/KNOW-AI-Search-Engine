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
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
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
