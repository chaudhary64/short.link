import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Verify from "../pages/Verify";
import NotFound from "../pages/NotFound";
import Layout from "../components/shared/Layout";
import ForgotPassword from "../pages/ForgotPassword";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import GuestRoute from "../components/shared/GuestRoute";
import Settings from "../pages/Settings";
import Analytics from "../pages/Analytics";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        Component: GuestRoute,
        children: [
          {
            path: "login",
            Component: Login,
          },
          {
            path: "signup",
            Component: Signup,
          },
          {
            path: "verify",
            Component: Verify,
          },
        ],
      },
      {
        path: "forgot-password",
        Component: ForgotPassword,
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "dashboard",
            Component: Dashboard,
          },
          {
            path: "analytics",
            Component: Analytics,
          },
          {
            path: "settings",
            Component: Settings,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);

export default router;
