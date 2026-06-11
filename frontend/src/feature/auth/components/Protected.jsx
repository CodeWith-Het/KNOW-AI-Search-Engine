import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const Protected = ({children}) => {

    const { user,loading } = useSelector((state) => state.auth);

    if (loading) {
        return (
          <div className="text-white bg-slate-950 min-h-screen flex items-center justify-center">
            Loading...
          </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

  return children
}

export default Protected;
