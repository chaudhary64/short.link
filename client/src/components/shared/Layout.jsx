import Nav from "../layout/Nav";
import { Outlet } from "react-router";
import Footer from "../layout/Footer";
import { useQuery } from "@tanstack/react-query";
import refreshToken from "../../api/refresh";
import { useEffect } from "react";
import { useAuthActions } from "../../features/auth/useAuthActions";
import { useUserActions } from "../../features/user/useUserActions";

const Layout = () => {
  const { setAccessToken } = useAuthActions();
  const { setUserInfo } = useUserActions();

  const { data } = useQuery({
    queryKey: ["REFRESH_TOKEN"],
    queryFn: refreshToken,
  });

  useEffect(() => {
    if (data?.status == 200) {
      setAccessToken(data.data.accessToken);

      const userInfo = {
        name: data.data.user.name,
        email: data.data.user.email,
      };

      setUserInfo(userInfo);
    }
  }, [data, setAccessToken, setUserInfo]);

  return (
    <>
      <Nav />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
