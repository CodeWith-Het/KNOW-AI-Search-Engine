import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRouter = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  // Agar app load ho raha hai (refresh ke time)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#101214] text-[#e8a33d]">
        Loading...
      </div>
    );
  }

  // Agar user pehle se login hai, toh usko Chat page par bhej do
  if (user) {
    return <Navigate to="/chats" replace />;
  }

  // Agar user login nahi hai, toh Login/Register page dekhne do
  return children;
};

export default PublicRouter;