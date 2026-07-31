import { Navigate, Outlet } from "react-router";
import { useAuthToken } from "../../features/auth/useAuthActions";

const GuestRoute = () => {
  const isAuthenticated = useAuthToken();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
