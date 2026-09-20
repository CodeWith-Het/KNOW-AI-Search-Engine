import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const Protected = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#101214] text-[#e8a33d]">
        Loading Workspace...
      </div>
    );
  }
  if (!user) {

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default Protected;
