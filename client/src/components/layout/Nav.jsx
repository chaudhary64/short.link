import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import Logo from "../ui/Logo";
import {
  useAuthActions,
  useAuthToken,
} from "../../features/auth/useAuthActions";
import { LogoutUser } from "../../api/auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../../features/toast/useToast.jsx";

const Nav = ({ user }) => {
  const isAuthenticated = useAuthToken();
  const { logout } = useAuthActions();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  const mutation = useMutation({
    mutationFn: LogoutUser,
    invalidateQueries: ["REFRESH_TOKEN"],
    onSuccess: () => {
      logout();
      toast.info("Logged out", "You have been successfully logged out.");
    },
    onError: () => {
      logout();
      toast.warning("Logged out locally", "Could not reach server to invalidate session.");
    }
  });

  return (
    <header
      className={`px-6 py-4 flex justify-between items-center border-b sticky top-0 z-50 ${isAuthenticated
        ? "border-gray-200 bg-white"
        : "border-gray-200/60 bg-white/50 backdrop-blur-sm"
        }`}
    >
      <Link to="/" className="flex items-center gap-2">
        <Logo />
        <h3 className="font-semibold text-lg tracking-tight m-0 text-gray-900">
          short.link
        </h3>
      </Link>

      {isAuthenticated ? (
        <>
          {/* Desktop Nav */}
          <nav className="hidden sm:flex gap-4 items-center">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            {user && (
              <div className="flex items-center gap-3 cursor-default group">
                <span className="text-sm font-semibold group-hover:text-gray-600">
                  {user.name}
                </span>
                <Avatar initials={user.initials} />
              </div>
            )}
            <Button
              variant="secondary"
              size="small"
              onClick={mutation.mutate}
            >
              Logout
            </Button>
          </nav>

          {/* Mobile Nav Toggle */}
          <div className="sm:hidden relative" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -mr-2 text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-md z-[9999] flex flex-col">
                {user && (
                  <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <Avatar initials={user.initials} className="w-10 h-10 text-sm border-2 border-white shadow-sm shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                    </div>
                  </div>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-b border-gray-100 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    mutation.mutate();
                  }}
                  className="px-4 py-3 text-sm font-medium text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <nav className="flex gap-2 items-center">
          <Button as={Link} variant="ghost" size="small" to="/login">
            Login
          </Button>
          <Button as={Link} variant="primary" size="small" to="/signup">
            Sign Up
          </Button>
        </nav>
      )}
    </header>
  );
};

export default Nav;
