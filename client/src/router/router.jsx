import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import Layout from "../components/shared/Layout";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import GuestRoute from "../components/shared/GuestRoute";
import ErrorPage from "../pages/ErrorPage";
import {
  Dashboard,
  Analytics,
  Settings,
  Login,
  Signup,
  Verify,
  ForgotPassword,
  NotFound,
} from "./lazyPages";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <ErrorPage />,
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
