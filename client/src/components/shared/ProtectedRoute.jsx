import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthToken } from "../../features/auth/useAuthActions";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthToken();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
