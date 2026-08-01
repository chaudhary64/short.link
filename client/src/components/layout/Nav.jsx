import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Button from "../ui/Button";
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
  LuChartNoAxesColumn,
  LuHouse,
  LuLayoutDashboard,
  LuLoaderCircle,
  LuLogOut,
  LuMenu,
  LuSettings,
  LuX,
} from "react-icons/lu";

const menuVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
};

const menuTransition = {
  duration: 0.15,
  ease: "easeOut",
};

const navLinkClass = (isActive) =>
  `relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
    isActive
      ? "text-[#0A0A0A]"
      : "text-[#6B6B6B] hover:bg-[#F3F4F6] hover:text-[#0A0A0A]"
  }`;

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
      queryClient.invalidateQueries({ queryKey: ["REFRESH_TOKEN"] });
      toast.info("Logged out", "You have been successfully logged out.");
      navigate("/login");
    },
    onError: () => {
      logout();
      removeUserInfo();
      queryClient.invalidateQueries({ queryKey: ["REFRESH_TOKEN"] });
      toast.warning("Logged out locally", "Could not reach server to invalidate session.");
      navigate("/login");
    }
  });

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-[#E8E8EC] bg-[#FAFAFA]/95 backdrop-blur-md">
      <div className="relative mx-auto flex h-full w-full items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Logo />
          <h3 className="font-display text-lg font-bold tracking-[-0.03em] text-[#0A0A0A] m-0">
            short.link
          </h3>
        </Link>

        {isAuthenticated && (
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 sm:flex">
            <Link to="/" className={navLinkClass(isHomePage)}>
              Home
              {isHomePage && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[#6366F1]" />
              )}
            </Link>

            <Link to="/dashboard" className={navLinkClass(isDashboardPage)}>
              Dashboard
              {isDashboardPage && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[#6366F1]" />
              )}
            </Link>

            <Link to="/analytics" className={navLinkClass(isAnalyticsPage)}>
              Analytics
              {isAnalyticsPage && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[#6366F1]" />
              )}
            </Link>
          </nav>
        )}

        <div className="flex items-center shrink-0">
          {isAuthenticated ? (
            <div className="relative ml-2 pl-3 border-l border-[#E8E8EC] hidden sm:block" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F3F4F6] transition-colors duration-150 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 cursor-pointer"
                aria-label={`${user.name}'s account menu`}
              >
                <Avatar seed={user.name} className="w-8 h-8" />
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={menuTransition}
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E8E8EC] shadow-lg rounded-lg z-[9999] flex flex-col overflow-hidden origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-[#F1F1F4] flex items-center gap-3">
                      <Avatar seed={user.name} className="w-10 h-10 shrink-0" />
                      <div className="flex flex-col overflow-hidden min-w-0">
                        <span className="text-sm font-semibold text-[#0A0A0A] truncate">{user.name}</span>
                        <span className="text-xs text-[#6B6B6B] truncate">{user.email}</span>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors duration-150"
                      >
                        <LuSettings className="w-4 h-4 text-[#9C9C9C] shrink-0" />
                        Settings
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-[#F1F1F4]">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          mutation.mutate();
                        }}
                        disabled={mutation.isPending}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#6B6B6B] hover:bg-[#FEF2F2] hover:text-[#EF4444] rounded-lg transition-colors duration-150 text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {mutation.isPending ? (
                          <LuLoaderCircle className="w-4 h-4 text-[#9C9C9C] shrink-0 animate-spin" />
                        ) : (
                          <LuLogOut className="w-4 h-4 text-[#9C9C9C] shrink-0" />
                        )}
                        {mutation.isPending ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button as={Link} variant="ghost" size="small" to="/login">
                Login
              </Button>
              <Button as={Link} variant="primary" size="small" to="/signup">
                Sign Up
              </Button>
            </div>
          )}
        </div>

        <div className="sm:hidden relative" ref={mobileMenuRef}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 -mr-2 text-[#0A0A0A] hover:bg-[#F3F4F6] rounded-lg transition-colors duration-150 focus:outline-none relative z-10 ${
              mobileMenuOpen ? "bg-[#F3F4F6]" : ""
            }`}
            aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          >
            {mobileMenuOpen ? (
              <LuX className="w-6 h-6" />
            ) : (
              <LuMenu className="w-6 h-6" />
            )}
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={menuTransition}
                className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E8E8EC] shadow-lg rounded-xl z-[9999] flex flex-col overflow-hidden origin-top-right"
              >
                {isAuthenticated ? (
                  <>
                    {user && (
                      <div className="px-4 py-4 border-b border-[#F1F1F4] flex items-center gap-3">
                        <Avatar seed={user.name} className="w-10 h-10 shrink-0" />
                        <div className="flex flex-col overflow-hidden min-w-0">
                          <span className="text-sm font-semibold text-[#0A0A0A] truncate">{user.name}</span>
                          <span className="text-xs text-[#6B6B6B] truncate">{user.email}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-1.5">
                      <Link
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                          isHomePage
                            ? "text-[#6366F1] bg-[#6366F1]/10"
                            : "text-[#6B6B6B] hover:bg-[#F3F4F6]"
                        }`}
                      >
                        <LuHouse className={`w-4 h-4 shrink-0 ${isHomePage ? "text-[#6366F1]" : "text-[#9C9C9C]"}`} />
                        Home
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                          isDashboardPage
                            ? "text-[#6366F1] bg-[#6366F1]/10"
                            : "text-[#6B6B6B] hover:bg-[#F3F4F6]"
                        }`}
                      >
                        <LuLayoutDashboard className={`w-4 h-4 shrink-0 ${isDashboardPage ? "text-[#6366F1]" : "text-[#9C9C9C]"}`} />
                        Dashboard
                      </Link>
                      <Link
                        to="/analytics"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                          isAnalyticsPage
                            ? "text-[#6366F1] bg-[#6366F1]/10"
                            : "text-[#6B6B6B] hover:bg-[#F3F4F6]"
                        }`}
                      >
                        <LuChartNoAxesColumn className={`w-4 h-4 shrink-0 ${isAnalyticsPage ? "text-[#6366F1]" : "text-[#9C9C9C]"}`} />
                        Analytics
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#6B6B6B] hover:bg-[#F3F4F6] rounded-lg transition-colors duration-150"
                      >
                        <LuSettings className="w-4 h-4 text-[#9C9C9C] shrink-0" />
                        Settings
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-[#F1F1F4]">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          mutation.mutate();
                        }}
                        disabled={mutation.isPending}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#6B6B6B] hover:bg-[#FEF2F2] hover:text-[#EF4444] rounded-lg transition-colors duration-150 text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {mutation.isPending ? (
                          <LuLoaderCircle className="w-4 h-4 text-[#9C9C9C] shrink-0 animate-spin" />
                        ) : (
                          <LuLogOut className="w-4 h-4 text-[#9C9C9C] shrink-0" />
                        )}
                        {mutation.isPending ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col p-4 gap-2">
                    <Button as={Link} variant="ghost" className="w-full justify-center" to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Button>
                    <Button as={Link} variant="primary" className="w-full justify-center" to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Nav;
