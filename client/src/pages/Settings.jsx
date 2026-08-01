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
import {
  LuCalendarDays,
  LuCheck,
  LuEye,
  LuEyeOff,
  LuLock,
  LuLockKeyhole,
  LuMail,
  LuShield,
  LuTriangleAlert,
  LuUser,
} from "react-icons/lu";
import { SiGoogle } from "react-icons/si";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: "person" },
  { id: "signin", label: "Sign-in Methods", icon: "lock" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "danger", label: "Danger Zone", icon: "warning" },
];

function SectionIcon({ name, className = "w-4 h-4" }) {
  const icons = {
    person: <LuUser className={className} />,
    lock: <LuLockKeyhole className={className} />,
    shield: <LuShield className={className} />,
    warning: <LuTriangleAlert className={className} />,
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
            <LuTriangleAlert className="w-5 h-5 text-red-600" />
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
  return open ? (
    <LuEyeOff className="w-4 h-4" />
  ) : (
    <LuEye className="w-4 h-4" />
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
                              <LuCalendarDays className="w-3 h-3 text-gray-400" />
                              Member since {memberYear}
                            </span>
                            {canLoginWithPassword && (
                              <span className="inline-flex items-center gap-1.5 border border-gray-200 px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                                <LuLock className="w-3 h-3 text-gray-400" />
                                Email & Password
                              </span>
                            )}
                            {canLoginWithGoogle && (
                              <span className="inline-flex items-center gap-1.5 border border-gray-200 px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                                <SiGoogle className="w-3 h-3" />
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
                      <LuMail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
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
                      <LuCheck className="w-4 h-4" />
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
                      <SiGoogle className="w-4 h-4 sm:w-5 sm:h-5" />
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
                      <LuCheck className="w-4 h-4" />
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
