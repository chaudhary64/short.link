import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
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
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const Nav = () => {
  const isAuthenticated = useAuthToken();
  const user = useUserInfo();
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

  useGSAP(() => {
    if (!mobileMenuRef.current) return;
    
    // Using GSAP context to limit scope to the mobile menu container
    if (mobileMenuOpen) {
      gsap.to(".line-top", { y: 6, rotation: 45, transformOrigin: "center", duration: 0.3, ease: "power2.inOut" });
      gsap.to(".line-mid", { opacity: 0, duration: 0.2 });
      gsap.to(".line-bot", { y: -6, rotation: -45, transformOrigin: "center", duration: 0.3, ease: "power2.inOut" });
      
      gsap.fromTo(".mobile-dropdown", 
        { opacity: 0, y: -10, display: "none" },
        { opacity: 1, y: 0, display: "flex", duration: 0.3, ease: "power2.out" }
      );
    } else {
      gsap.to(".line-top", { y: 0, rotation: 0, transformOrigin: "center", duration: 0.3, ease: "power2.inOut" });
      gsap.to(".line-mid", { opacity: 1, duration: 0.2, delay: 0.1 });
      gsap.to(".line-bot", { y: 0, rotation: 0, transformOrigin: "center", duration: 0.3, ease: "power2.inOut" });
      
      gsap.to(".mobile-dropdown", { opacity: 0, y: -10, display: "none", duration: 0.2, ease: "power2.in" });
    }
  }, { dependencies: [mobileMenuOpen], scope: mobileMenuRef });

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

      {/* Desktop Nav */}
      <nav className="hidden sm:flex gap-4 items-center">
        {isAuthenticated ? (
          <>
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

      {/* Mobile Nav Hamburger */}
      <div className="sm:hidden relative" ref={mobileMenuRef}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none relative z-10"
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path className="line-top" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16" />
            <path className="line-mid" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 12h16" />
            <path className="line-bot" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 18h16" />
          </svg>
        </button>

        <div className="mobile-dropdown hidden absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-md z-[9999] flex-col">
          {isAuthenticated ? (
            <>
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
            </>
          ) : (
            <div className="flex flex-col p-4 gap-3">
              <Button as={Link} variant="ghost" className="w-full justify-center" to="/login" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Button>
              <Button as={Link} variant="primary" className="w-full justify-center" to="/signup" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Nav;
