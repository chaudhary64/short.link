import { AnimatePresence } from "motion/react";
import Nav from "../layout/Nav";
import { Outlet } from "react-router";
import Footer from "../layout/Footer";
import { useQuery } from "@tanstack/react-query";
import refreshToken from "../../api/refresh";
import { useLayoutEffect, useState } from "react";
import { useAuthActions } from "../../features/auth/useAuthActions";
import { store } from "../../store/store";
import { useUserActions } from "../../features/user/useUserActions";
import Loading from "../ui/Loading";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  const { setAccessToken, logout } = useAuthActions();
  const { setUserInfo, removeUserInfo } = useUserActions();
  const [authReady, setAuthReady] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["REFRESH_TOKEN"],
    queryFn: refreshToken,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 14 * 60 * 1000,
  });

  useLayoutEffect(() => {
    if (data?.status === 200) {
      setAccessToken(data.data.accessToken);

      const userInfo = {
        name: data.data.user.name,
        email: data.data.user.email,
        created_at: data.data.user.created_at,
        gender: data.data.user.gender,
        password_changed_at: data.data.user.password_changed_at,
        has_password: data.data.user.has_password,
        has_google: data.data.user.has_google ?? false,
      };

      setUserInfo(userInfo);
      /* eslint-disable react-hooks/set-state-in-effect */
      setAuthReady(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    if (isError) {
      if (!store.getState().auth.accessToken) {
        logout();
        removeUserInfo();
      }
      setAuthReady(true);
    }
  }, [data, isError, setAccessToken, setUserInfo, logout, removeUserInfo]);

  if (isLoading || !authReady) {
    return <Loading message="Initializing..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <KeyboardShortcuts />
      <Nav />
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default Layout;
