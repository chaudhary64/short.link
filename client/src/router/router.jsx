import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import Layout from "../components/shared/Layout";
import MarketingLayout from "../components/shared/MarketingLayout";
import AuthLayout from "../components/shared/AuthLayout";
import AppShell from "../components/app/AppShell";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import GuestRoute from "../components/shared/GuestRoute";
import ErrorPage from "../pages/ErrorPage";
import {
  Dashboard,
  Links,
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
        Component: MarketingLayout,
        children: [
          {
            index: true,
            Component: Home,
          },
          {
            path: "*",
            Component: NotFound,
          },
        ],
      },
      {
        Component: AuthLayout,
        children: [
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
        ],
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            Component: AppShell,
            children: [
              {
                path: "dashboard",
                Component: Dashboard,
              },
              {
                path: "links",
                Component: Links,
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
        ],
      },
    ],
  },
]);

export default router;
