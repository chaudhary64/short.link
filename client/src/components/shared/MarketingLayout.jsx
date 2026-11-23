import { Outlet } from "react-router";
import Nav from "../layout/Nav";
import Footer from "../layout/Footer";
import { useForceLightTheme } from "../../features/theme/useForceLightTheme";
import "../../styles/marketing.css";

const MarketingLayout = () => {
  useForceLightTheme();

  return (
    <div className="m-shell">
      <Nav />
      <main className="m-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
