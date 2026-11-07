import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LuChartLine,
  LuLayoutGrid,
  LuLink2,
  LuLoaderCircle,
  LuLogOut,
  LuMenu,
  LuMoon,
  LuSettings,
  LuSun,
  LuX,
} from "react-icons/lu";
import Logo from "../ui/Logo";
import AccountMenu from "./AccountMenu";
import { getAllLinks } from "../../api/links";
import { LogoutUser } from "../../api/auth";
import { useAuthToken, useAuthActions } from "../../features/auth/useAuthActions";
import { useUserActions } from "../../features/user/useUserActions";
import { useToast } from "../../features/toast/useToast.jsx";
import { useTheme } from "../../features/theme/ThemeProvider";
import { POLL_INTERVAL_MS, REFETCH_ON_WINDOW_FOCUS } from "../../config/polling";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LuLayoutGrid, end: true },
  { to: "/links", label: "Links", icon: LuLink2, count: true },
  { to: "/analytics", label: "Analytics", icon: LuChartLine },
];

const CRUMBS = {
  "/dashboard": "Overview",
  "/links": "Links",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = useAuthToken();
  const [navOpen, setNavOpen] = useState(false);

  const { logout } = useAuthActions();
  const { removeUserInfo } = useUserActions();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { resolved: theme, setTheme } = useTheme();

  const { data } = useQuery({
    queryKey: ["LINKS_INFO"],
    queryFn: getAllLinks,
    enabled: !!accessToken,
    staleTime: POLL_INTERVAL_MS,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });

  const signOut = useMutation({
    mutationFn: LogoutUser,
    onSuccess: () => {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      queryClient.clear();
      toast.info("Signed out", "Your session ended on this device.");
      navigate("/login");
    },
    onError: () => {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      queryClient.clear();
      toast.warning(
        "Signed out locally",
        "The server could not be reached to end the session.",
      );
      navigate("/login");
    },
  });

  const linkCount = data?.data?.links?.length ?? null;
  const pageLabel = CRUMBS[location.pathname] ?? "Workspace";

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setNavOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <div className="app-shell min-h-dvh" data-nav={navOpen ? "open" : "closed"}>
      <div className="shell">
        <aside className="shell-side" aria-label="Workspace">
          <Link to="/dashboard" className="side-brand">
            <span className="side-brand-mark">
              <Logo className="w-4 h-4" />
            </span>
            short.link
          </Link>

          <span className="side-group">Workspace</span>
          {NAV.map(({ to, label, icon: Icon, end, count }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="side-link"
              onClick={() => setNavOpen(false)}
            >
              <Icon className="icon w-4 h-4" aria-hidden />
              {label}
              {count && linkCount != null && (
                <span className="side-count">{linkCount}</span>
              )}
            </NavLink>
          ))}

          <span className="side-group">Account</span>
          <NavLink to="/settings" className="side-link">
            <LuSettings className="icon w-4 h-4" aria-hidden />
            Settings
          </NavLink>
          <button
            type="button"
            className="side-link side-link-btn"
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
          >
            {signOut.isPending ? (
              <LuLoaderCircle
                className="icon w-4 h-4 animate-spin"
                aria-hidden
              />
            ) : (
              <LuLogOut className="icon w-4 h-4" aria-hidden />
            )}
            {signOut.isPending ? "Signing out…" : "Sign out"}
          </button>

          <div className="side-foot">
            <div className="side-theme" role="group" aria-label="Theme">
              <button
                type="button"
                className={`g-tab ${theme === "light" ? "on" : ""}`}
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
              >
                <LuSun className="w-3.5 h-3.5" aria-hidden />
                Light
              </button>
              <button
                type="button"
                className={`g-tab ${theme === "dark" ? "on" : ""}`}
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                <LuMoon className="w-3.5 h-3.5" aria-hidden />
                Dark
              </button>
            </div>
            <AccountMenu />
          </div>
        </aside>

        {navOpen && (
          <div
            className="side-scrim"
            aria-hidden="true"
            onClick={() => setNavOpen(false)}
          />
        )}

        <div className="shell-body">
          <header className="topbar">
            <button
              type="button"
              className="topbar-burger"
              onClick={() => setNavOpen((open) => !open)}
              aria-label={navOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={navOpen}
            >
              {navOpen ? (
                <LuX className="w-4 h-4" />
              ) : (
                <LuMenu className="w-4 h-4" />
              )}
            </button>

            <nav className="topbar-crumb" aria-label="Breadcrumb">
              <span>Workspace</span>
              <span aria-hidden>/</span>
              <strong aria-current="page">{pageLabel}</strong>
            </nav>

            <div className="topbar-spacer" />
          </header>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
