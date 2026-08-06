import { createRoot } from "react-dom/client";
import "./index.css";
import "./design.css";
import { RouterProvider } from "react-router";
import { MotionConfig } from "motion/react";
import router from "./router/router.js";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store/store.js";
import { ToastProvider } from "./features/toast/useToast.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/react";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MotionConfig reducedMotion="user">
            <RouterProvider router={router} />
            <Analytics />
          </MotionConfig>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  </GoogleOAuthProvider>,
);
