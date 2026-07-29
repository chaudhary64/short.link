import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

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

  useGSAP(() => {
    if (!mobileMenuRef.current) return;
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

  useGSAP(() => {
    if (!profileMenuRef.current) return;
    if (profileMenuOpen) {
      gsap.fromTo(".profile-dropdown",
        { opacity: 0, y: -10, display: "none" },
        { opacity: 1, y: 0, display: "flex", duration: 0.2, ease: "power2.out" }
      );
    } else {
      gsap.to(".profile-dropdown", { opacity: 0, y: -10, display: "none", duration: 0.15, ease: "power2.in" });
    }
  }, { dependencies: [profileMenuOpen], scope: profileMenuRef });

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


      <nav className="hidden sm:flex gap-4 items-center">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <div className="h-6 w-px bg-gray-400 mx-4"></div>
            {user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-full cursor-pointer"
                >
                  <Avatar seed={user.name} className="w-9 h-9 border-2 border-transparent hover:border-gray-200 transition-colors" />
                </button>

                <div className="profile-dropdown hidden absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-xl z-[9999] flex-col overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-400 flex items-center gap-3 bg-gray-50/50">
                    <Avatar seed={user.name} className="w-10 h-10 shrink-0 border border-gray-200" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                      <span className="text-xs text-gray-500 truncate">{user.email}</span>
                    </div>
                  </div>
                  <div className="p-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                    </Link>
                  </div>
                  <div className="p-1 border-t border-gray-400">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        mutation.mutate();
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                      Sign out
                    </button>
                  </div>
                </div>
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
                <div className="px-4 py-4 border-b border-gray-400 flex items-center gap-3 bg-gray-50/50">
                  <Avatar seed={user.name} className="w-10 h-10 text-sm border-2 border-white shadow-sm shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
                  </div>
                </div>
              )}
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-b border-gray-400 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-b border-gray-400 transition-colors"
              >
                Settings
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
