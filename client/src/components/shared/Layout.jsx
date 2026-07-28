import Nav from "../layout/Nav";
import { Outlet } from "react-router";
import Footer from "../layout/Footer";
import { useQuery } from "@tanstack/react-query";
import refreshToken from "../../api/refresh";
import { useEffect } from "react";
import { useAuthActions } from "../../features/auth/useAuthActions";
import { useUserActions } from "../../features/user/useUserActions";
import Loading from "../ui/Loading";

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

  useEffect(() => {
    if (data?.status == 200) {
      setAccessToken(data.data.accessToken);

      const userInfo = {
        name: data.data.user.name,
        email: data.data.user.email,
        created_at: data.data.user.created_at,
        gender: data.data.user.gender,
      };

      setUserInfo(userInfo);
    }

    if (isError) {
      logout();
      removeUserInfo();
    }
  }, [data, isError, setAccessToken, setUserInfo, logout, removeUserInfo]);

  if (isLoading) {
    return <Loading message="Initializing..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
