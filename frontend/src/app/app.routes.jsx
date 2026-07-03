import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../feature/auth/pages/Login.jsx";
import Register from "../feature/auth/pages/Register.jsx";
import VerifyEmail from "../feature/auth/pages/VerifyEmail.jsx";
import Dashboard from "./../feature/chat/pages/Dashboard.jsx";
import Protected from "../feature/auth/components/Protected.jsx";
import PublicRouter from "../feature/auth/components/PublicRouter.jsx";
import Chatwrapper from "../feature/chat/layout/Chatwrapper.jsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRouter>
        <Login />
      </PublicRouter>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRouter>
        <Register />
      </PublicRouter>
    ),
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <Chatwrapper>
          <Dashboard />
        </Chatwrapper>
      </Protected>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "/chat/:id",
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Navigate to="/" replace />,
  },
]);