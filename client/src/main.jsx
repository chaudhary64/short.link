import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Suspense } from "react";
import "./index.css";
import "./design.css";
import { RouterProvider } from "react-router";
import { MotionConfig } from "motion/react";
import router from "./router/router.jsx";
import Loading from "./components/ui/Loading.jsx";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store/store.js";
import { ToastProvider } from "./features/toast/useToast.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/react";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const root = createRoot(document.getElementById("root"));

try {
  flushSync(() => {
    root.render(
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <MotionConfig reducedMotion="user">
                <Suspense fallback={<Loading />}>
                  <RouterProvider router={router} />
                </Suspense>
                <Analytics />
              </MotionConfig>
            </ToastProvider>
          </QueryClientProvider>
        </Provider>
      </GoogleOAuthProvider>,
    );
  });
} finally {
  document.getElementById("boot-loader")?.remove();
}
