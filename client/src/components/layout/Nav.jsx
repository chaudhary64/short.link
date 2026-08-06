import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import Avatar from "../ui/Avatar";
import Logo from "../ui/Logo";
import {
  useAuthActions,
  useAuthToken,
} from "../../features/auth/useAuthActions";
import { useUserInfo, useUserActions } from "../../features/user/useUserActions";
import { LogoutUser } from "../../api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../features/toast/useToast.jsx";
import {
  LuLoaderCircle,
  LuLogOut,
  LuMenu,
  LuSettings,
  LuX,
} from "react-icons/lu";

const Nav = () => {
  const isAuthenticated = useAuthToken();
  const user = useUserInfo();
  const { logout } = useAuthActions();
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const isHomePage = location.pathname === "/";
  const isDashboardPage = location.pathname.startsWith("/dashboard");
  const isAnalyticsPage = location.pathname.startsWith("/analytics");


  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
      if (profileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen, profileMenuOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const { removeUserInfo } = useUserActions();

  const mutation = useMutation({
    mutationFn: LogoutUser,
    onSuccess: () => {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      toast.info("Logged out", "You have been successfully logged out.");
      navigate("/login");
    },
    onError: () => {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      toast.warning("Logged out locally", "Could not reach server to invalidate session.");
      navigate("/login");
    },
  });

  const navLink = (to, active, label) => (
    <Link to={to} className={`g-nav-link ${active ? "on" : ""}`}>
      <span className="g-nav-dot" aria-hidden />
      {label}
    </Link>
  );

  return (
    <header className="g-nav">
      <div className="g-nav-row">
        <Link to="/" className="g-mast-brand" aria-label="short.link — home">
          <Logo className="w-6 h-6" />
          <span className="hidden sm:inline">short.link</span>
        </Link>

        {isAuthenticated && (
          <nav className="g-nav-links" aria-label="Primary">
            {navLink("/", isHomePage, "HOME")}
            {navLink("/dashboard", isDashboardPage, "DASHBOARD")}
            {navLink("/analytics", isAnalyticsPage, "ANALYTICS")}
          </nav>
        )}

        <div className="g-nav-actions">
          {isAuthenticated ? (
            <div className="relative hidden sm:flex items-center" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((o) => !o)}
                className={`g-nav-user ${profileMenuOpen ? "open" : ""}`}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                aria-label={`${user.name}'s account menu`}
              >
                <Avatar seed={user.name} className="w-8 h-8" />
              </button>

              {profileMenuOpen && (
                <div className="g-menu" role="menu">
                  <div className="g-menu-head">
                    <Avatar seed={user.name} className="w-10 h-10 shrink-0" />
                    <div className="min-w-0">
                      <p className="g-menu-name">{user.name}</p>
                      <p className="g-menu-mail">{user.email}</p>
                    </div>
                  </div>
                  <span className="g-menu-label">Account</span>
                  <Link
                    to="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    role="menuitem"
                    className="g-menu-item g-menu-item-no-sep"
                  >
                    <LuSettings className="w-4 h-4 shrink-0" aria-hidden />
                    Settings
                  </Link>
                  <div className="g-menu-sep" aria-hidden />
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      mutation.mutate();
                    }}
                    disabled={mutation.isPending}
                    role="menuitem"
                    className="g-menu-item danger"
                  >
                    {mutation.isPending ? (
                      <LuLoaderCircle className="w-4 h-4 shrink-0 animate-spin" />
                    ) : (
                      <LuLogOut className="w-4 h-4 shrink-0" />
                    )}
                    {mutation.isPending ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button className="g-btn g-btn-line g-btn-sm" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="g-btn g-btn-sm" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </div>
          )}

          <button
            className="g-nav-burger"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <LuX className="w-5 h-5" /> : <LuMenu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="g-menu g-menu-mobile" ref={mobileMenuRef}>
            {isAuthenticated && user && (
              <div className="g-menu-head">
                <Avatar seed={user.name} className="w-10 h-10 shrink-0" />
                <div className="min-w-0">
                  <p className="g-menu-name">{user.name}</p>
                  <p className="g-menu-mail">{user.email}</p>
                </div>
              </div>
            )}
            {isAuthenticated ? (
              <>
                <span className="g-menu-label">Navigate</span>
                {[
                  { to: "/", label: "Home", active: isHomePage },
                  { to: "/dashboard", label: "Dashboard", active: isDashboardPage },
                  { to: "/analytics", label: "Analytics", active: isAnalyticsPage },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="g-menu-item"
                    aria-current={item.active ? "page" : undefined}
                  >
                    <span className={`g-nav-dot ${item.active ? "g-sq-red" : ""}`} aria-hidden />
                    {item.label}
                  </Link>
                ))}
                <span className="g-menu-label">Account</span>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="g-menu-item"
                >
                  <LuSettings className="w-4 h-4 shrink-0" aria-hidden />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    mutation.mutate();
                  }}
                  disabled={mutation.isPending}
                  className="g-menu-item danger"
                >
                  {mutation.isPending ? (
                    <LuLoaderCircle className="w-4 h-4 shrink-0 animate-spin" />
                  ) : (
                    <LuLogOut className="w-4 h-4 shrink-0" />
                  )}
                  {mutation.isPending ? "Signing out…" : "Sign out"}
                </button>
              </>
            ) : (
              <div className="p-4 flex flex-col gap-2">
                <button className="g-btn g-btn-line g-btn-sm w-full" onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}>
                  Login
                </button>
                <button className="g-btn g-btn-sm w-full" onClick={() => { setMobileMenuOpen(false); navigate("/signup"); }}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Nav;
