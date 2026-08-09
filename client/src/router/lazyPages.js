import { lazy } from "react";

export const Dashboard = lazy(() => import("../pages/Dashboard"));
export const Analytics = lazy(() => import("../pages/Analytics"));
export const Settings = lazy(() => import("../pages/Settings"));
export const Login = lazy(() => import("../pages/Login"));
export const Signup = lazy(() => import("../pages/Signup"));
export const Verify = lazy(() => import("../pages/Verify"));
export const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
export const NotFound = lazy(() => import("../pages/NotFound"));
