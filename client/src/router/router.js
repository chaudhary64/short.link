import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import NotFound from "../pages/NotFound";
import Layout from "../components/shared/Layout";
import ForgotPassword from "../pages/ForgotPassword";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import Settings from "../pages/Settings";

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
        path: "login",
        Component: Login,
      },
      {
        path: "forgot-password",
        Component: ForgotPassword,
      },
      {
        path: "signup",
        Component: Signup,
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "dashboard",
            Component: Dashboard,
          },
          {
            path: "settings",
            Component: Settings,
          }
        ]
      }
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

export default router;
