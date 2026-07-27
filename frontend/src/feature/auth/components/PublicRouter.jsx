import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRouter = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="text-white bg-slate-950 min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
