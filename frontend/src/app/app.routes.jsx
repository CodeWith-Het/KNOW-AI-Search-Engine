
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../feature/auth/pages/Login';
import Register from '../feature/auth/pages/Register';
import Dashboard from './../feature/chat/pages/Dashboard';
import Protected from '../feature/auth/components/Protected';
import PublicRouter from '../feature/auth/components/publicRouter';
import Chatwrapper from '../feature/chat/components/Chatwrapper';

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
    path: "/",
    element: (
      <Protected>
        <Chatwrapper>
          <Dashboard />
        </Chatwrapper>
      </Protected>
    ),
  },
  {
    path: "/dashboard",
    element: <Navigate to="/" replace />,
  },
]);