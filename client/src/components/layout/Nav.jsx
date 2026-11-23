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
import {
  LuArrowRight,
  LuLogOut,
  LuMenu,
  LuSettings,
  LuX,
} from "react-icons/lu";
import Logo from "../ui/Logo";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const marketingLinks = [
  // Same order as the sections on the page, so the nav reads as a table of
  // contents and a click never scrolls past a section the reader was about
  // to reach anyway. "Product" is the one label that could sit on any SaaS
  // site unchanged, so name the destination instead.
  { label: "How it works", to: "/#how" },
  { label: "Features", to: "/#product" },
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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen && !accountOpen) return;
    const onClick = (event) => {
      // Opening the menu swaps the burger's icon, which unmounts the node this
      // click started on. By the time the listener runs, `contains` is asked
      // about a detached `<line>` and reads the opening click as an outside
      // click — so the menu closed in the same tick it opened. A target that is
      // no longer in the document cannot tell us anything about where the
      // click landed.
      if (!event.target.isConnected) return;
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

  // The menu is a full-screen panel, so the page behind it must not scroll.
  // Locking it removes the scrollbar, which would widen the viewport and shift
  // the layout sideways by the scrollbar's width; pad that width back on so
  // nothing moves while the panel is open.
  useEffect(() => {
    if (!menuOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [menuOpen]);

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
              {/* Stays in the bar at every width: with the landing hero's
                  secondary sign-up link gone, this is the only visible path to
                  an account on a phone before the visitor acts. */}
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

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="m-menu"
            id="marketing-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={{
              duration: reduceMotion ? 0.12 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* The drawer opens with nothing but the close glyph: the bar behind
                already carries the wordmark, so repeating it here only pushed the
                menu links further down the screen. */}
            <div className="m-menu-top">
              <button
                type="button"
                className="m-menu-close"
                aria-label="Close menu"
                onClick={closeAll}
              >
                <LuX className="w-5 h-5" aria-hidden />
              </button>
            </div>

            <nav className="m-menu-links" aria-label="Sections">
              {marketingLinks.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="m-menu-link"
                  style={{ "--i": String(index) }}
                  onClick={closeAll}
                >
                  <span className="m-menu-idx">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && (
                <div className="m-menu-app">
                  <Link to="/dashboard" className="m-menu-app-link" onClick={closeAll}>
                    Dashboard
                  </Link>
                  <Link to="/links" className="m-menu-app-link" onClick={closeAll}>
                    Links
                  </Link>
                  <Link to="/analytics" className="m-menu-app-link" onClick={closeAll}>
                    Analytics
                  </Link>
                  <Link to="/settings" className="m-menu-app-link" onClick={closeAll}>
                    Settings
                  </Link>
                </div>
              )}
            </nav>

            {/* Logged out, the auth actions stack full width here at the foot of
                the panel, primary last so it sits closest to the thumb. */}
            <div className="m-menu-foot">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="m-btn m-btn-ghost m-menu-auth"
                  onClick={() => {
                    closeAll();
                    mutation.mutate();
                  }}
                  disabled={mutation.isPending}
                >
                  <LuLogOut className="w-4 h-4" aria-hidden />
                  {mutation.isPending ? "Signing out…" : "Sign out"}
                </button>
              ) : (
                <div className="m-menu-auth-stack">
                  {!onLogin && !onSignup && (
                    <Link
                      to="/login"
                      className="m-btn m-btn-ghost"
                      onClick={closeAll}
                    >
                      Sign in
                    </Link>
                  )}
                  <Link
                    to={onSignup ? "/login" : "/signup"}
                    className="m-btn"
                    onClick={closeAll}
                  >
                    {onSignup ? "Sign in" : "Create free account"}
                    <LuArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Nav;
