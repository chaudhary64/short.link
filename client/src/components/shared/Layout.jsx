import { AnimatePresence } from "motion/react";
import Nav from "../layout/Nav";
import { Outlet } from "react-router";
import Footer from "../layout/Footer";
import { useQuery } from "@tanstack/react-query";
import refreshToken from "../../api/refresh";
import { useLayoutEffect } from "react";
import { useAuthActions } from "../../features/auth/useAuthActions";
import { useUserActions } from "../../features/user/useUserActions";
import Loading from "../ui/Loading";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ScrollToTop from "./ScrollToTop";

const Layout = () => {
  const { setAccessToken, logout } = useAuthActions();
  const { setUserInfo, removeUserInfo } = useUserActions();

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
    }

    if (isError) {
      logout();
      removeUserInfo();
    }
  }, [data, isError, setAccessToken, setUserInfo, logout, removeUserInfo]);

  // Gate only on the query being genuinely in flight. `isLoading` is true
  // only while fetching with no data yet — after the first refresh settles it
  // never flips back, so a mid-session 401 that clears the token can't trap us
  // on "Initializing..." (the old `!accessToken` clause re-triggered while the
  // query stayed fresh for 14 min). The 10s timeout on the refresh request
  // bounds the hang case, and the useLayoutEffect sets the token before paint
  // so there is no flash of an unauthenticated shell on first load.
  if (isLoading) {
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
