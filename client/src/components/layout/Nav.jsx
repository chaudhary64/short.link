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
import { LuArrowRight, LuLogOut, LuSettings } from "react-icons/lu";
import Logo from "../ui/Logo";

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
  const [accountOpen, setAccountOpen] = useState(false);
  const shellRef = useRef(null);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (event) => {
      if (shellRef.current && !shellRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

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

  return (
    <header className="m-nav" ref={shellRef}>
      <div className="m-wrap m-nav-row">
        {/* The mark alone: at phone widths the wordmark sat beside the two
            actions and pushed the bar into an overflow. */}
        <Link to="/" className="m-brand" aria-label="short.link — home">
          <Logo className="m-brand-logo" />
        </Link>

        <div className="m-nav-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="m-btn m-btn-sm">
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
                      onClick={() => setAccountOpen(false)}
                    >
                      <LuSettings className="w-4 h-4" aria-hidden />
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="m-popover-item m-danger"
                      onClick={() => {
                        setAccountOpen(false);
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
                <Link to="/login" className="m-nav-link">
                  Sign in
                </Link>
              )}
              {/* Both auth actions stay in the bar at every width: there is no
                  drawer left to hold them, so this is the only route to an
                  account on a phone. */}
              <Link
                to={onSignup ? "/login" : "/signup"}
                className="m-btn m-btn-sm"
              >
                {onSignup ? "Sign in" : "Create account"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Nav;
