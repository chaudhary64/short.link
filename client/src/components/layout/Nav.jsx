import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import Logo from "../ui/Logo";
import {
  useAuthActions,
  useAuthToken,
} from "../../features/auth/useAuthActions";
import { useUserInfo } from "../../features/user/useUserActions";
import { LogoutUser } from "../../api/auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../../features/toast/useToast.jsx";

const Nav = () => {
  const isAuthenticated = useAuthToken();
  const user = useUserInfo();
  const { logout } = useAuthActions();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const isDashboardPage = location.pathname.startsWith("/dashboard");

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
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

  const mutation = useMutation({
    mutationFn: LogoutUser,
    invalidateQueries: ["REFRESH_TOKEN"],
    onSuccess: () => {
      logout();
      toast.info("Logged out", "You have been successfully logged out.");
      navigate("/login");
    },
    onError: () => {
      logout();
      toast.warning("Logged out locally", "Could not reach server to invalidate session.");
      navigate("/login");
    }
  });

  return (
    <header className="px-4 sm:px-6 py-3 flex justify-between items-center border-b border-gray-200/80 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <Logo />
        <h3 className="font-semibold text-lg tracking-tight m-0 text-gray-900">
          short.link
        </h3>
      </Link>

      <nav className="hidden sm:flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                isDashboardPage
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Dashboard
              {isDashboardPage && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gray-900 rounded-full" />
              )}
            </Link>

            {user && (
              <div className="relative ml-2 pl-3 border-l border-gray-200" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer"
                  aria-label={`${user.name}'s account menu`}
                >
                  <Avatar seed={user.name} className="w-8 h-8" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-xl z-[9999] flex flex-col overflow-hidden animate-in">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                      <Avatar seed={user.name} className="w-10 h-10 shrink-0" />
                      <div className="flex flex-col overflow-hidden min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                        <span className="text-xs text-gray-500 truncate">{user.email}</span>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                      >
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Settings
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          mutation.mutate();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-150 text-left cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <Button as={Link} variant="ghost" size="small" to="/login">
              Login
            </Button>
            <Button as={Link} variant="primary" size="small" to="/signup">
              Sign Up
            </Button>
          </>
        )}
      </nav>

      <div className="sm:hidden relative" ref={mobileMenuRef}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 -mr-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150 focus:outline-none relative z-10 ${
            mobileMenuOpen ? "bg-gray-100" : ""
          }`}
          aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {mobileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-xl z-[9999] flex flex-col overflow-hidden animate-in">
            {isAuthenticated ? (
              <>
                {user && (
                  <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                    <Avatar seed={user.name} className="w-10 h-10 shrink-0" />
                    <div className="flex flex-col overflow-hidden min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                      <span className="text-xs text-gray-500 truncate">{user.email}</span>
                    </div>
                  </div>
                )}
                <div className="p-1.5">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      isDashboardPage
                        ? "text-gray-900 bg-gray-100"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                  </Link>
                </div>
                <div className="p-1.5 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      mutation.mutate();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-150 text-left cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Sign out
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
          </div>
        )}
      </div>
    </header>
  );
};

export default Nav;
