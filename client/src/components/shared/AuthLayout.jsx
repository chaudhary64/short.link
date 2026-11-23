import { Link, Outlet } from "react-router";
import Logo from "../ui/Logo";
import { useForceLightTheme } from "../../features/theme/useForceLightTheme";

const AuthLayout = () => {
  useForceLightTheme();

  return (
    <div className="auth-shell">
      <header className="auth-top">
        <Link to="/" className="auth-brand" aria-label="short.link — home">
          <Logo className="auth-brand-logo" />
          <span>short.link</span>
        </Link>
      </header>

      <main className="auth-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
