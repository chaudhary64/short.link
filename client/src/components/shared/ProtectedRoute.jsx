import { Navigate, Outlet } from "react-router";
import { useAuthToken } from "../../features/auth/useAuthActions";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthToken();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
