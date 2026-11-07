import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Avatar from "../ui/Avatar";
import { LogoutUser } from "../../api/auth";
import {
  useAuthActions,
  useAuthToken,
} from "../../features/auth/useAuthActions";
import {
  useUserActions,
  useUserInfo,
} from "../../features/user/useUserActions";
import { useToast } from "../../features/toast/useToast.jsx";
import { LuArrowRight, LuLogOut, LuMenu, LuSettings, LuX } from "react-icons/lu";
import Logo from "../ui/Logo";

const marketingLinks = [
  // "Product" is the one label that could sit on any SaaS site unchanged;
  // name the destination instead. "How it works" and "FAQ" are already the
  // clearest, most-scanned terms for their sections.
  { label: "Features", to: "/#product" },
  { label: "How it works", to: "/#how" },
  { label: "FAQ", to: "/#faq" },
];

const Nav = () => {
  const { pathname } = useLocation();
  const onLogin = pathname === "/login";
  const onSignup = pathname === "/signup";
  const isAuthenticated = useAuthToken();
  const user = useUserInfo();
  const { logout } = useAuthActions();
  const { removeUserInfo } = useUserActions();
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const shellRef = useRef(null);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return;
    const onClick = (event) => {
      if (shellRef.current && !shellRef.current.contains(event.target)) {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, accountOpen]);

  const clearSession = () => {
    logout();
    removeUserInfo();
    queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
  };

  const mutation = useMutation({
    mutationFn: LogoutUser,
    onSuccess: () => {
      clearSession();
      toast.info("Logged out", "You have been successfully logged out.");
      navigate("/login");
    },
    onError: () => {
      clearSession();
      toast.warning(
        "Logged out locally",
        "Could not reach the server to invalidate this session.",
      );
      navigate("/login");
    },
  });

  const closeAll = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  return (
    <header className="m-nav" ref={shellRef}>
      <div className="m-wrap m-nav-row">
        <Link to="/" className="m-brand" aria-label="short.link — home">
          <Logo className="m-brand-logo" />
          short.link
        </Link>

        <nav className="m-nav-links" aria-label="Primary">
          {marketingLinks.map((item) => (
            <Link key={item.to} to={item.to} className="m-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="m-nav-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="m-btn m-btn-sm m-hide-sm">
                Open app
                <LuArrowRight className="w-3.5 h-3.5" aria-hidden />
              </Link>
              <div className="m-account">
                <button
                  type="button"
                  className="m-avatar-btn"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label={`${user.name} — account menu`}
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <Avatar seed={user.name} className="w-8 h-8" />
                </button>
                {accountOpen && (
                  <div className="m-popover" role="menu">
                    <div className="m-popover-head">
                      <Avatar seed={user.name} className="w-9 h-9 shrink-0" />
                      <div className="m-popover-id">
                        <p className="m-popover-name">{user.name}</p>
                        <p className="m-popover-mail">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/settings"
                      role="menuitem"
                      className="m-popover-item"
                      onClick={closeAll}
                    >
                      <LuSettings className="w-4 h-4" aria-hidden />
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="m-popover-item m-danger"
                      onClick={() => {
                        closeAll();
                        mutation.mutate();
                      }}
                      disabled={mutation.isPending}
                    >
                      <LuLogOut className="w-4 h-4" aria-hidden />
                      {mutation.isPending ? "Signing out…" : "Sign out"}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="m-auth-actions">
              {!onLogin && !onSignup && (
                <Link to="/login" className="m-nav-link m-hide-sm">
                  Sign in
                </Link>
              )}
              <Link
                to={onSignup ? "/login" : "/signup"}
                className="m-btn m-btn-sm"
              >
                {onSignup ? "Sign in" : "Create account"}
              </Link>
            </div>
          )}

          <button
            type="button"
            className="m-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="marketing-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <LuX className="w-5 h-5" aria-hidden />
            ) : (
              <LuMenu className="w-5 h-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="m-drawer" id="marketing-menu">
          <nav className="m-drawer-links" aria-label="Menu">
            {marketingLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="m-drawer-link"
                onClick={closeAll}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="m-drawer-link" onClick={closeAll}>
                  Dashboard
                </Link>
                <Link to="/links" className="m-drawer-link" onClick={closeAll}>
                  Links
                </Link>
                <Link to="/analytics" className="m-drawer-link" onClick={closeAll}>
                  Analytics
                </Link>
                <Link to="/settings" className="m-drawer-link" onClick={closeAll}>
                  Settings
                </Link>
                <button
                  type="button"
                  className="m-drawer-link m-danger"
                  onClick={() => {
                    closeAll();
                    mutation.mutate();
                  }}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Signing out…" : "Sign out"}
                </button>
              </>
            ) : (
              <>
                {!onLogin && !onSignup && (
                  <Link to="/login" className="m-drawer-link" onClick={closeAll}>
                    Sign in
                  </Link>
                )}
                <Link
                  to={onSignup ? "/login" : "/signup"}
                  className="m-btn m-drawer-cta"
                  onClick={closeAll}
                >
                  {onSignup ? "Sign in" : "Create free account"}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Nav;
