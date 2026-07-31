import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { updateUser, deleteUser, changePassword, setPassword, linkGoogleAccount } from "../api/auth";
import { useUserInfo, useUserActions } from "../features/user/useUserActions";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useToast } from "../features/toast/useToast.jsx";
import { useGoogleLogin } from "@react-oauth/google";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: "person" },
  { id: "signin", label: "Sign-in Methods", icon: "lock" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "danger", label: "Danger Zone", icon: "warning" },
];

function SectionIcon({ name, className = "w-4 h-4" }) {
  const icons = {
    person: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    lock: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    warning: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function DeleteModal({ open, onClose, onConfirm, isPending }) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const confirmed = confirmText === "DELETE";

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in cursor-pointer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Delete account confirmation"
        className="relative w-full max-w-sm bg-white border border-gray-200 shadow-xl animate-in p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-50 flex items-center justify-center border border-red-200 shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Delete account?</h3>
            <p className="text-sm text-gray-500">This cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          All your links, analytics, and account data will be permanently removed.
        </p>

        <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5 block">
          Type <span className="text-red-600">DELETE</span> to confirm
        </label>
        <input
          ref={inputRef}
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white placeholder-gray-400 transition-all mb-4"
          placeholder="DELETE"
        />

        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="medium"
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending || !confirmed}
          >
            {isPending ? "Deleting…" : "Delete my account"}
          </Button>
          <Button variant="secondary" size="medium" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

const Settings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { name, email, created_at, gender, has_password, has_google } = useUserInfo();
  const { setUserInfo, removeUserInfo } = useUserActions();
  const { logout } = useAuthActions();

  const [activeSection, setActiveSection] = useState("profile");
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const refs = sectionRefs.current;
    Object.values(refs).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(name);

  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (res) => {
      const serverName = res?.data?.user?.name ?? editName;
      setUserInfo({ name: serverName, email, created_at, gender, has_password, has_google });
      setIsEditingProfile(false);
      toast.success("Profile updated!", "Your profile has been updated successfully.");
    },
    onError: (err) => {
      toast.error("Update failed", err.response?.data?.message || "Could not update profile.");
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      setIsPasswordFormOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setUserInfo({ name, email, created_at, gender, has_password: true, has_google });
      toast.success("Password set!", "Your password has been created. You can now log in with email and password.");
    },
    onError: (err) => {
      toast.error("Failed to set password", err.response?.data?.message || "Could not set password.");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setIsPasswordFormOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed!", "Your password has been updated successfully.");
    },
    onError: (err) => {
      toast.error("Password change failed", err.response?.data?.message || "Could not change password.");
    },
  });

  const linkGoogleMutation = useMutation({
    mutationFn: linkGoogleAccount,
    onSuccess: () => {
      setUserInfo({ name, email, created_at, gender, has_password, has_google: true });
      toast.success("Google linked!", "Your Google account has been linked successfully. You can now sign in with Google.");
    },
    onError: (err) => {
      toast.error("Link failed", err.response?.data?.message || "Could not link Google account.");
    },
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      linkGoogleMutation.mutate({ token: tokenResponse.access_token });
    },
    onError: () => {
      toast.error("Google Error", "Failed to authenticate with Google.");
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      logout();
      removeUserInfo();
      toast.info("Account deleted", "Your account has been permanently deleted.");
      navigate("/");
    },
    onError: (err) => {
      toast.error("Deletion failed", err.response?.data?.message || "Could not delete account.");
    },
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.warning("Name required", "Please enter your name.");
      return;
    }
    updateProfileMutation.mutate({ name: editName.trim() });
  };

  const handleSetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.warning("Incomplete", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Mismatch", "Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.warning("Too short", "Password must be at least 8 characters.");
      return;
    }
    setPasswordMutation.mutate({ newPassword });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning("Incomplete", "Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Mismatch", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.warning("Too short", "New password must be at least 8 characters.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.warning("Same password", "New password must be different from current password.");
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const canLoginWithPassword = has_password;
  const canLoginWithGoogle = has_google;
  const memberYear = created_at ? new Date(created_at).getFullYear() : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="text-gray-900 flex flex-col flex-1 font-sans pb-0 sm:pb-12"
    >
      <DeleteModal
        key={showDeleteConfirm ? "open" : "closed"}
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteAccountMutation.mutate();
          setShowDeleteConfirm(false);
        }}
        isPending={deleteAccountMutation.isPending}
      />        <main className="flex-1 w-full mx-auto px-4 sm:px-6 mt-4 sm:mt-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, type: "spring", stiffness: 300, damping: 24 }}
            className="mb-5 sm:mb-10"
          >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Manage your account, security, and preferences.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <nav className="hidden lg:flex flex-col w-48 shrink-0 sticky top-24 self-start">
            <div className="border-l border-gray-200 flex flex-col gap-0.5">
              {SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`
                      group flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium
                      transition-all duration-150 border-l-2 -ml-px cursor-pointer
                      ${isActive
                        ? "border-gray-900 text-gray-900 bg-gray-100 font-semibold"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    <SectionIcon
                      name={sec.icon}
                      className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                        isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-10">
            <div className="lg:hidden border-b border-gray-200 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`
                        flex items-center gap-2 px-3 py-3 text-xs font-semibold w-full
                        border transition-all duration-150 cursor-pointer h-full
                        ${isActive
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }
                      `}
                    >
                      <SectionIcon
                        name={sec.icon}
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-gray-400"
                        }`}
                      />
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.section
              id="profile"
              ref={(el) => { sectionRefs.current.profile = el; }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 24 }}
            >
              <div className="bg-white border border-gray-100 shadow-sm">
                <div className="relative h-16 sm:h-24 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
                  <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)]" />
                  <div className="absolute -bottom-8 sm:-bottom-12 left-6 z-10">
                    <Avatar
                      seed={name}
                      className="w-16 h-16 sm:w-24 sm:h-24 text-xl sm:text-3xl border-4 border-white shadow-md"
                    />
                  </div>
                </div>

                <div className="px-4 sm:px-6 pb-4 pt-12 sm:pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                    <div className="flex-1 min-w-0 sm:ml-28 lg:ml-32">
                      {isEditingProfile ? (
                        <form onSubmit={handleProfileSave} className="flex flex-col gap-4 max-w-sm">
                          <div>
                            <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white transition-all"
                              placeholder="Your name"
                              autoFocus
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" variant="primary" size="small" disabled={updateProfileMutation.isPending}>
                              {updateProfileMutation.isPending ? "Saving…" : "Save"}
                            </Button>
                            <Button type="button" variant="secondary" size="small" onClick={() => { setIsEditingProfile(false); setEditName(name); }}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
                            {name}
                          </h2>
                          <p className="text-sm text-gray-500 mt-0.5">{email}</p>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 border border-gray-200 px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Member since {memberYear}
                            </span>
                            {canLoginWithPassword && (
                              <span className="inline-flex items-center gap-1.5 border border-gray-200 px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Email & Password
                              </span>
                            )}
                            {canLoginWithGoogle && (
                              <span className="inline-flex items-center gap-1.5 border border-gray-200 px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditingProfile && (
                      <Button
                        variant="accent"
                        size="medium"
                        className="w-full sm:w-auto sm:shrink-0"
                        onClick={() => { setIsEditingProfile(true); setEditName(name); }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              id="signin"
              ref={(el) => { sectionRefs.current.signin = el; }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
              className="pt-6 sm:pt-8 border-t border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                  <SectionIcon name="lock" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Sign-in Methods</h2>
                  <p className="text-xs text-gray-500">Manage how you sign in to your account.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white flex items-center justify-center border border-gray-200 shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Email & Password</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {canLoginWithPassword
                          ? "Sign in with your email and password."
                          : "Set a password to enable email sign-in."}
                      </p>
                    </div>
                  </div>
                  {canLoginWithPassword ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-medium shrink-0 self-start sm:self-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Enabled
                    </span>
                  ) : (
                    <Button variant="accent" size="small" className="w-full sm:w-auto sm:shrink-0" onClick={() => setIsPasswordFormOpen(true)}>
                      Set Password
                    </Button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white flex items-center justify-center border border-gray-200 shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Google Account</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {canLoginWithGoogle
                          ? "Your Google account is linked."
                          : "Link your Google account to sign in with Google."}
                      </p>
                    </div>
                  </div>
                  {canLoginWithGoogle ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-medium shrink-0 self-start sm:self-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Linked
                    </span>
                  ) : (
                    <Button
                      variant="accent"
                      size="small"
                      className="w-full sm:w-auto sm:shrink-0"
                      onClick={() => loginWithGoogle()}
                      disabled={linkGoogleMutation.isPending}
                    >
                      {linkGoogleMutation.isPending ? "Linking…" : "Link Google"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section
              id="security"
              ref={(el) => { sectionRefs.current.security = el; }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, type: "spring", stiffness: 300, damping: 24 }}
              className="pt-6 sm:pt-8 border-t border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                  <SectionIcon name="shield" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Security</h2>
                  <p className="text-xs text-gray-500">Update your password.</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 shadow-sm p-4 sm:p-5 hover:border-gray-300 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {has_password ? "Password" : "Set a Password"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {has_password
                        ? "Last changed — you'll need to re-enter it next time."
                        : "Add email & password sign-in to your account."}
                    </p>
                  </div>
                  {!isPasswordFormOpen && (
                    <Button
                      variant="accent"
                      size="small"
                      className="w-full sm:w-auto sm:shrink-0"
                      onClick={() => setIsPasswordFormOpen(true)}
                    >
                      {has_password ? "Change" : "Set Password"}
                    </Button>
                  )}
                </div>

                {isPasswordFormOpen && (
                  <form
                    onSubmit={has_password ? handlePasswordChange : handleSetPassword}
                    className="flex flex-col gap-4 pt-4 border-t border-gray-100"
                  >
                    {has_password && (
                      <div>
                        <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white transition-all"
                            placeholder="Enter current password"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showCurrentPassword} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                        {has_password ? "New Password" : "Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white transition-all"
                          placeholder={has_password ? "Enter new password" : "Enter a password"}
                          autoFocus={!has_password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showNewPassword} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                        {has_password ? "Confirm New Password" : "Confirm Password"}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white transition-all"
                        placeholder={has_password ? "Confirm new password" : "Confirm password"}
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        size="small"
                        disabled={changePasswordMutation.isPending || setPasswordMutation.isPending}
                      >
                        {has_password
                          ? (changePasswordMutation.isPending ? "Changing…" : "Change Password")
                          : (setPasswordMutation.isPending ? "Setting…" : "Set Password")}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setIsPasswordFormOpen(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.section>

            <motion.section
              id="danger"
              ref={(el) => { sectionRefs.current.danger = el; }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, type: "spring", stiffness: 300, damping: 24 }}
              className="pt-6 sm:pt-8 border-t border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-50 flex items-center justify-center border border-red-200 shrink-0">
                  <SectionIcon name="warning" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Danger Zone</h2>
                  <p className="text-xs text-gray-500">Irreversible actions.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-red-50/50 border border-red-200 shadow-sm hover:border-red-300 transition-all duration-200">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Delete Account</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="medium"
                  className="w-full sm:w-auto sm:shrink-0"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              </div>
            </motion.section>

            <div className="h-6 sm:h-8" />

          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Settings;
