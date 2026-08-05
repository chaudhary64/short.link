import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import Chip from "../components/ui/Chip";
import PageHeader from "../components/ui/PageHeader";
import PasswordStrength from "../components/ui/PasswordStrength";
import { useScrollSpy } from "../hooks/useScrollSpy";
import Avatar from "../components/ui/Avatar";
import { updateUser, deleteUser, changePassword, setPassword, linkGoogleAccount, requestEmailChange, verifyEmailChange, getSessions, revokeSession, revokeAllSessions } from "../api/auth";
import { BrowserIcon, DeviceIcon, OsIcon } from "../components/analytics/DeviceIcons";
import { formatDateTime } from "../utils/format";
import { useUserInfo, useUserActions } from "../features/user/useUserActions";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useToast } from "../features/toast/useToast.jsx";
import { useGoogleLogin } from "@react-oauth/google";
import {
  LuCalendarDays,
  LuCheck,
  LuEye,
  LuEyeOff,
  LuLoaderCircle,
  LuLock,
  LuLockKeyhole,
  LuLogOut,
  LuMail,
  LuMapPin,
  LuMonitorSmartphone,
  LuShield,
  LuTriangleAlert,
  LuUser,
} from "react-icons/lu";
import GoogleLogo from "../components/ui/GoogleLogo";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    : null;

const useFocusTrap = (isOpen, containerRef) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    document.addEventListener("keydown", handleTab);

    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen, containerRef]);
};

const SECTIONS = [
  { id: "profile", label: "Profile", icon: "person" },
  { id: "signin", label: "Sign-in Methods", icon: "lock" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "sessions", label: "Sessions", icon: "devices" },
  { id: "danger", label: "Danger Zone", icon: "warning" },
];

const sessionDeviceLabel = (s) => {
  if (s.browser && s.os) return `${s.browser} on ${s.os}`;
  if (s.browser) return s.browser;
  if (s.os) return s.os;
  return "Unknown device";
};

const sessionLocation = (s) => {
  const parts = [s.city, s.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location unknown";
};

function SectionIcon({ name, className = "w-4 h-4" }) {
  const icons = {
    person: <LuUser className={className} />,
    lock: <LuLockKeyhole className={className} />,
    shield: <LuShield className={className} />,
    devices: <LuMonitorSmartphone className={className} />,
    warning: <LuTriangleAlert className={className} />,
  };
  return icons[name] || null;
}

function DeleteModal({ open, onClose, onConfirm, isPending }) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useFocusTrap(open, containerRef);

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Delete account confirmation"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm bg-white border border-[#D4D4D8] shadow-xl rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#FEF2F2] flex items-center justify-center border border-[#EF4444]/30 rounded-lg shrink-0">
            <LuTriangleAlert className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold tracking-[-0.02em] text-[#0A0A0A]">Delete account?</h3>
            <p className="text-sm text-[#525252]">This cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-[#525252] mb-4 leading-relaxed">
          All your links, analytics, and account data will be permanently removed.
        </p>

        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A] mb-1.5 block">
          Type <span className="text-[#EF4444]">DELETE</span> to confirm
        </label>
        <input
          ref={inputRef}
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] focus:outline-none focus:border-[#EF4444] focus-visible:ring-[3px] focus-visible:ring-[#EF4444]/12 bg-white placeholder:text-[#71717A] transition-all mb-4"
          placeholder="DELETE"
          aria-describedby="delete-confirmation-hint"
        />
        <p id="delete-confirmation-hint" className="sr-only">
          Type DELETE to confirm account deletion
        </p>

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
      </motion.div>
    </div>
  );
}

function SignOutAllModal({ open, onClose, onConfirm, isPending }) {
  const cancelRef = useRef(null);
  const containerRef = useRef(null);

  useFocusTrap(open, containerRef);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => cancelRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sign out of all sessions confirmation"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm bg-white border border-[#D4D4D8] shadow-xl rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#FEF2F2] flex items-center justify-center border border-[#EF4444]/30 rounded-lg shrink-0">
            <LuLogOut className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold tracking-[-0.02em] text-[#0A0A0A]">Sign out everywhere?</h3>
            <p className="text-sm text-[#525252]">This signs you out of every device.</p>
          </div>
        </div>

        <p className="text-sm text-[#525252] mb-4 leading-relaxed">
          You&apos;ll be signed out on every device, including this one. You can sign back in anytime with your password or Google.
        </p>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="medium"
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Signing out everywhere…" : "Sign out everywhere"}
          </Button>
          <Button variant="secondary" size="medium" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <LuEyeOff className="w-5 h-5" />
  ) : (
    <LuEye className="w-5 h-5" />
  );
}

function SuccessAnimation({ show }) {
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl z-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center"
      >
        <LuCheck className="w-8 h-8 text-white" />
      </motion.div>
    </motion.div>
  );
}

const Settings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { name, email, created_at, gender, password_changed_at, has_password, has_google } = useUserInfo();
  const { setUserInfo, removeUserInfo } = useUserActions();
  const { logout, setAccessToken } = useAuthActions();

  const { activeSection, scrollToSection, registerSection } = useScrollSpy("profile");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState("input");
  const emailInputRef = useRef(null);

  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (res) => {
      const serverName = res?.data?.user?.name ?? editName;
      setUserInfo({ name: serverName, email, created_at, gender, password_changed_at, has_password, has_google });
      setIsEditingProfile(false);
      setIsEmailEditing(false);
      setEmailStep("input");
      setEmailOtp("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      toast.success("Profile updated!", "Your profile has been updated successfully.");
    },
    onError: (err) => {
      toast.error("Update failed", err.response?.data?.message || "Could not update profile.");
    },
  });

  const requestEmailChangeMutation = useMutation({
    mutationFn: requestEmailChange,
    onSuccess: () => {
      setEmailStep("verify");
      toast.info("Verification sent", "Please check your new email for a verification code.");
    },
    onError: (err) => {
      toast.error("Request failed", err.response?.data?.message || "Could not request email change.");
    },
  });

  const verifyEmailChangeMutation = useMutation({
    mutationFn: verifyEmailChange,
    onSuccess: (res) => {
      const updatedUser = res?.data?.user;
      setUserInfo({ 
        name, 
        email: updatedUser?.email || editEmail, 
        created_at, 
        gender, 
        password_changed_at, 
        has_password, 
        has_google 
      });
      setIsEditingProfile(false);
      setIsEmailEditing(false);
      setEmailStep("input");
      setEmailOtp("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      toast.success("Email updated!", "Your email has been changed successfully.");
    },
    onError: (err) => {
      toast.error("Verification failed", err.response?.data?.message || "Invalid or expired code.");
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: setPassword,
    onSuccess: (res) => {
      const newToken = res?.data?.accessToken;
      if (newToken) setAccessToken(newToken);
      setIsPasswordFormOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setUserInfo({ name, email, created_at, gender, password_changed_at: new Date().toISOString(), has_password: true, has_google });
      toast.success("Password set!", "Your password has been created. You can now log in with email and password.");
    },
    onError: (err) => {
      toast.error("Failed to set password", err.response?.data?.message || "Could not set password.");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (res) => {
      const newToken = res?.data?.accessToken;
      if (newToken) setAccessToken(newToken);
      setIsPasswordFormOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setUserInfo({ name, email, created_at, gender, password_changed_at: new Date().toISOString(), has_password, has_google });
      toast.success("Password changed!", "Your password has been updated successfully.");
    },
    onError: (err) => {
      toast.error("Password change failed", err.response?.data?.message || "Could not change password.");
    },
  });

  const linkGoogleMutation = useMutation({
    mutationFn: linkGoogleAccount,
    onSuccess: () => {
      setUserInfo({ name, email, created_at, gender, password_changed_at, has_password, has_google: true });
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

  const queryClient = useQueryClient();
  const [revokingId, setRevokingId] = useState(null);
  const [showSignOutAll, setShowSignOutAll] = useState(false);

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["SESSIONS"],
    queryFn: getSessions,
  });
  const sessions = sessionsData?.data?.sessions ?? [];

  const revokeSessionMutation = useMutation({
    mutationFn: ({ id }) => revokeSession(id),
    onMutate: ({ id }) => setRevokingId(id),
    onSuccess: (res) => {
      setRevokingId(null);
      if (res?.data?.ended_current) {
        logout();
        removeUserInfo();
        queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
        toast.info("Signed out", "You signed out of this session.");
        navigate("/login");
      } else {
        toast.success("Session ended", "That device has been signed out.");
        refetchSessions();
      }
    },
    onError: (err) => {
      setRevokingId(null);
      toast.error("Could not end session", err.response?.data?.message || "Please try again.");
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      toast.info("Signed out everywhere", "You've been signed out of every device.");
      navigate("/login");
    },
    onError: (err) => {
      toast.error("Could not sign out everywhere", err.response?.data?.message || "Please try again.");
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

  const handleEmailChangeRequest = (e) => {
    e.preventDefault();
    if (!editEmail.trim()) {
      toast.warning("Email required", "Please enter your new email address.");
      return;
    }
    if (editEmail === email) {
      toast.warning("Same email", "New email must be different from current email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      toast.warning("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (canLoginWithGoogle && !canLoginWithPassword) {
      toast.error(
        "Account lockout risk",
        "You don't have a password set. Changing your email will permanently lock you out of your account. Please set a password first."
      );
      return;
    } else if (canLoginWithGoogle && canLoginWithPassword) {
      toast.warning(
        "Google sign-in will be affected",
        "Changing your email will break Google sign-in. You can still log in with your password, but you'll need to re-link Google."
      );
    }
    requestEmailChangeMutation.mutate({ newEmail: editEmail });
  };

  const handleEmailVerification = (e) => {
    e.preventDefault();
    if (!emailOtp.trim()) {
      toast.warning("Code required", "Please enter the verification code.");
      return;
    }
    verifyEmailChangeMutation.mutate({ otp: emailOtp });
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setIsEmailEditing(false);
    setEmailStep("input");
    setEmailOtp("");
    setEditName(name);
    setEditEmail(email);
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
      className="text-[#0A0A0A] flex flex-col flex-1 font-body pb-0 sm:pb-12"
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
      />
      <SignOutAllModal
        key={showSignOutAll ? "open" : "closed"}
        open={showSignOutAll}
        onClose={() => setShowSignOutAll(false)}
        onConfirm={() => revokeAllSessionsMutation.mutate()}
        isPending={revokeAllSessionsMutation.isPending}
      />        <main className="flex-1 w-full mx-auto px-4 sm:px-6 mt-4 sm:mt-12">
          <PageHeader
            title="Settings"
            subtitle="Manage your account, security, and preferences."
            className="mb-5 sm:mb-10"
          />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <nav className="hidden lg:flex flex-col w-48 shrink-0 sticky top-24 self-start">
            <div className="border-l border-[#D4D4D8] flex flex-col gap-0.5">
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
                        ? "border-[#6366F1] text-[#0A0A0A] bg-[#F3F4F6] font-semibold"
                        : "border-transparent text-[#6B6B6B] hover:text-[#0A0A0A] hover:border-[#C1C1C9]"
                      }
                    `}
                  >
                    <SectionIcon
                      name={sec.icon}
                      className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                        isActive ? "text-[#6366F1]" : "text-[#9C9C9C] group-hover:text-[#0A0A0A]"
                      }`}
                    />
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-10">
            <div className="lg:hidden border-b border-[#D4D4D8] pb-4">
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
                          ? "border-[#6366F1] bg-[#6366F1] text-white rounded-md"
                          : "border-[#D4D4D8] bg-white text-[#6B6B6B] hover:border-[#C1C1C9] hover:text-[#0A0A0A] rounded-md"
                        }
                      `}
                    >
                      <SectionIcon
                        name={sec.icon}
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-[#9C9C9C]"
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
              ref={registerSection("profile")}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 24 }}
            >
              <div className="bg-white border border-[#D4D4D8] rounded-xl overflow-hidden relative">
                <SuccessAnimation show={showSuccess} />
                <div className="relative h-16 sm:h-24 bg-gradient-to-r from-[#0A0A0A] to-[#1F1F1F]">
                  <div className="absolute -bottom-8 sm:-bottom-12 left-6 z-10">
                    <Avatar
                      seed={name}
                      className="w-16 h-16 sm:w-24 sm:h-24 text-xl sm:text-3xl border-4 border-white shadow-lg"
                    />
                  </div>
                </div>

                <div className="px-4 sm:px-6 pb-4 pt-12 sm:pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                    <div className="flex-1 min-w-0 sm:ml-28 lg:ml-32">
                      {isEditingProfile ? (
                        <form onSubmit={handleProfileSave} className="flex flex-col gap-4 max-w-sm">
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A] mb-1 block">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 bg-white transition-all"
                              placeholder="Your name"
                              autoFocus
                              aria-describedby="name-hint"
                            />
                            <p id="name-hint" className="text-xs text-[#71717A] mt-1">
                              2-50 characters
                            </p>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A] mb-1 block">
                              Email Address
                            </label>
                            {isEmailEditing ? (
                              <>
                                {emailStep === "input" ? (
                                  <div className="space-y-3">
                                    {canLoginWithGoogle && !canLoginWithPassword && (
                                      <div className="flex items-start gap-2 p-3 bg-[#FEE2E2] border border-[#EF4444]/30 rounded-lg">
                                        <LuTriangleAlert className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                                        <p className="text-xs text-[#991B1B] leading-relaxed">
                                          <strong>Critical:</strong> You&apos;re signed in only with Google and don&apos;t have a password. Changing your email will <strong>permanently lock you out</strong> of your account. Please set a password first in the Security section.
                                        </p>
                                      </div>
                                    )}
                                    {canLoginWithGoogle && canLoginWithPassword && (
                                      <div className="flex items-start gap-2 p-3 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg">
                                        <LuTriangleAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                                        <p className="text-xs text-[#92400E] leading-relaxed">
                                          <strong>Warning:</strong> Changing your email will break Google sign-in. Your Google account is linked to <strong>{email}</strong>. You can still log in with your password after changing email, but you&apos;ll need to re-link Google.
                                        </p>
                                      </div>
                                    )}
                                    <input
                                      ref={emailInputRef}
                                      type="email"
                                      value={editEmail}
                                      onChange={(e) => setEditEmail(e.target.value)}
                                      className="w-full px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 bg-white transition-all"
                                      placeholder="new@example.com"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="primary"
                                        size="small"
                                        className="flex-1"
                                        onClick={handleEmailChangeRequest}
                                        disabled={requestEmailChangeMutation.isPending}
                                      >
                                        {requestEmailChangeMutation.isPending ? "Sending…" : "Send Code"}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="small"
                                        onClick={() => {
                                          setIsEmailEditing(false);
                                          setEditEmail(email);
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <input
                                      type="text"
                                      value={emailOtp}
                                      onChange={(e) => setEmailOtp(e.target.value)}
                                      className="w-full px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 bg-white transition-all font-mono text-center text-lg tracking-widest"
                                      placeholder="000000"
                                      autoFocus
                                      maxLength={6}
                                    />
                                    <p className="text-xs text-[#71717A]">
                                      Code sent to {editEmail}
                                    </p>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="primary"
                                        size="small"
                                        className="flex-1"
                                        onClick={handleEmailVerification}
                                        disabled={verifyEmailChangeMutation.isPending}
                                      >
                                        {verifyEmailChangeMutation.isPending ? "Verifying…" : "Verify"}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="small"
                                        onClick={() => setEmailStep("input")}
                                      >
                                        Back
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="email"
                                  value={email}
                                  disabled
                                  className="flex-1 px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#525252] bg-[#F9FAFB] cursor-not-allowed"
                                />
                                {!canLoginWithGoogle || canLoginWithPassword ? (
                                  <button
                                    type="button"
                                    onClick={() => setIsEmailEditing(true)}
                                    className="text-xs text-[#6366F1] hover:text-[#4F46E5] font-medium transition-colors whitespace-nowrap cursor-pointer"
                                  >
                                    Change
                                  </button>
                                ) : (
                                  <span className="text-xs text-[#71717A]" title="Set a password first to change email">
                                    Set password to change
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {!isEmailEditing && (
                              <Button type="submit" variant="primary" size="small" disabled={updateProfileMutation.isPending}>
                                {updateProfileMutation.isPending ? "Saving…" : "Save"}
                              </Button>
                            )}
                            <Button type="button" variant="secondary" size="small" onClick={cancelProfileEdit}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h2 className="text-lg sm:text-2xl font-display font-bold tracking-[-0.03em] text-[#0A0A0A]">
                            {name}
                          </h2>
                          <p className="text-sm text-[#525252] mt-0.5">{email}</p>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F4F5] border border-[#D4D4D8] rounded-full text-xs font-medium text-[#71717A]">
                              <LuCalendarDays className="w-3 h-3 shrink-0" />
                              <span className="whitespace-nowrap">Member since {memberYear}</span>
                            </span>
                            {canLoginWithPassword && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F4F5] border border-[#D4D4D8] rounded-full text-xs font-medium text-[#71717A]">
                                <LuLock className="w-3 h-3 shrink-0" />
                                <span className="whitespace-nowrap">Email & Password</span>
                              </span>
                            )}
                            {canLoginWithGoogle && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F4F5] border border-[#D4D4D8] rounded-full text-xs font-medium text-[#71717A]">
                                <GoogleLogo className="w-3 h-3 shrink-0" />
                                <span className="whitespace-nowrap">Google</span>
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditingProfile && (
                      <Button
                        variant="secondary"
                        size="medium"
                        className="w-full sm:w-auto sm:shrink-0"
                        onClick={() => { setIsEditingProfile(true); setEditName(name); setEditEmail(email); }}
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
              ref={registerSection("signin")}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
              className="pt-6 sm:pt-8 border-t border-[#D4D4D8]"
            >                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F3F4F6] flex items-center justify-center border border-[#D4D4D8] rounded-lg shrink-0">
                  <SectionIcon name="lock" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A0A0A]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold tracking-[-0.02em] text-[#0A0A0A]">Sign-in Methods</h2>
                  <p className="text-xs text-[#525252]">Manage how you sign in to your account.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-white border border-[#D4D4D8] rounded-xl hover:border-[#C1C1C9] hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F3F4F6] flex items-center justify-center border border-[#D4D4D8] rounded-lg shrink-0">
                      <LuMail className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#0A0A0A]">Email & Password</h3>
                      <p className="text-xs text-[#525252] mt-0.5">
                        {canLoginWithPassword
                          ? "Sign in with your email and password."
                          : "Not enabled yet — set one up in the Security section."}
                      </p>
                    </div>
                  </div>
                  {canLoginWithPassword ? (
                    <Chip status="active" className="shrink-0 self-start sm:self-auto">Enabled</Chip>
                  ) : (
                    <Chip status="default" className="shrink-0 self-start sm:self-auto">Not enabled</Chip>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-white border border-[#D4D4D8] rounded-xl hover:border-[#C1C1C9] hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F3F4F6] flex items-center justify-center border border-[#D4D4D8] rounded-lg shrink-0">
                      <GoogleLogo className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#0A0A0A]">Google Account</h3>
                      <p className="text-xs text-[#525252] mt-0.5">
                        {canLoginWithGoogle
                          ? "Your Google account is linked."
                          : "Link your Google account to sign in with Google."}
                      </p>
                    </div>
                  </div>
                  {canLoginWithGoogle ? (
                    <Chip status="active" className="shrink-0 self-start sm:self-auto">Linked</Chip>
                  ) : (
                    <button
                      type="button"
                      onClick={() => loginWithGoogle()}
                      disabled={linkGoogleMutation.isPending}
                      className="w-full sm:w-auto sm:shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0A0A0A] bg-[#F3F4F6] border border-[#D4D4D8] rounded-md hover:border-[#C1C1C9] hover:bg-[#E9E9EE] transition-all duration-200 cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label={linkGoogleMutation.isPending ? "Linking Google account" : "Link Google account"}
                    >
                      <GoogleLogo className="w-4 h-4" />
                      {linkGoogleMutation.isPending ? "Linking…" : "Link Google"}
                    </button>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section
              id="security"
              ref={registerSection("security")}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, type: "spring", stiffness: 300, damping: 24 }}
              className="pt-6 sm:pt-8 border-t border-[#D4D4D8]"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F3F4F6] flex items-center justify-center border border-[#D4D4D8] rounded-lg shrink-0">
                  <SectionIcon name="shield" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A0A0A]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold tracking-[-0.02em] text-[#0A0A0A]">Security</h2>
                  <p className="text-xs text-[#525252]">Update your password.</p>
                </div>
              </div>

              <div className="bg-white border border-[#D4D4D8] rounded-xl p-4 sm:p-5 hover:border-[#C1C1C9] hover:shadow-sm transition-all duration-200 relative">
                <SuccessAnimation show={showSuccess && !isPasswordFormOpen} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0A0A0A]">
                      {has_password ? "Password" : "Set a Password"}
                    </h3>
                    <p className="text-xs text-[#525252] mt-0.5">
                      {has_password
                        ? (password_changed_at
                          ? `Last changed ${formatDate(password_changed_at)}`
                          : "Update your password to keep your account secure.")
                        : "Create a password to secure your account."}
                    </p>
                  </div>
                  {!isPasswordFormOpen && (
                    <Button
                      variant={has_password ? "secondary" : "primary"}
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
                    className="flex flex-col gap-4 pt-4 border-t border-[#E5E5EA]"
                  >
                    {has_password && (
                      <div>
                        <label className="text-[11px] font-semibold text-[#71717A] uppercase tracking-[0.12em] mb-1 block">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 pr-12 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 bg-white transition-all"
                            placeholder="Enter current password"
                            autoFocus
                            aria-describedby="current-password-visibility"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#0A0A0A] focus:outline-none cursor-pointer p-1"
                            tabIndex={-1}
                            aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                            id="current-password-visibility"
                          >
                            <EyeIcon open={showCurrentPassword} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold text-[#71717A] uppercase tracking-[0.12em] mb-1 block">
                        {has_password ? "New Password" : "Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 pr-12 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 bg-white transition-all"
                          placeholder={has_password ? "Enter new password" : "Enter a password"}
                          autoFocus={!has_password}
                          aria-describedby="new-password-visibility"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#0A0A0A] focus:outline-none cursor-pointer p-1"
                          tabIndex={-1}
                          aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                          id="new-password-visibility"
                        >
                          <EyeIcon open={showNewPassword} />
                        </button>
                      </div>
                      <PasswordStrength password={newPassword} />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#71717A] uppercase tracking-[0.12em] mb-1 block">
                        {has_password ? "Confirm New Password" : "Confirm Password"}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-[#D4D4D8] rounded-md text-sm text-[#0A0A0A] focus:outline-none focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 bg-white transition-all"
                        placeholder={has_password ? "Confirm new password" : "Confirm password"}
                        aria-describedby="confirm-password-hint"
                      />
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p id="confirm-password-hint" className="text-xs text-[#EF4444] mt-1">
                          Passwords do not match
                        </p>
                      )}
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
              id="sessions"
              ref={registerSection("sessions")}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, type: "spring", stiffness: 300, damping: 24 }}
              className="pt-6 sm:pt-8 border-t border-[#D4D4D8]"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F3F4F6] flex items-center justify-center border border-[#D4D4D8] rounded-lg shrink-0">
                  <SectionIcon name="devices" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0A0A0A]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold tracking-[-0.02em] text-[#0A0A0A]">Sessions</h2>
                  <p className="text-xs text-[#525252]">
                    Devices currently signed in to your account. Sign out of any device you don't recognize.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {sessionsLoading &&
                  [0, 1].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 sm:p-5 bg-white border border-[#D4D4D8] rounded-xl animate-pulse"
                    >
                      <div className="w-10 h-10 bg-[#F3F4F6] border border-[#D4D4D8] rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-[#F3F4F6] w-1/3 rounded" />
                        <div className="h-3 bg-[#F3F4F6] w-1/2 rounded" />
                      </div>
                    </div>
                  ))}

                {!sessionsLoading && sessionsError && (
                  <div className="bg-white border border-[#D4D4D8] rounded-xl p-6 text-center">
                    <p className="text-sm text-[#525252]">
                      Couldn't load your sessions.{" "}
                      <button
                        type="button"
                        onClick={() => refetchSessions()}
                        className="text-[#6366F1] hover:text-[#4F46E5] font-medium transition-colors cursor-pointer"
                      >
                        Try again
                      </button>
                    </p>
                  </div>
                )}

                {!sessionsLoading && !sessionsError && sessions.length === 0 && (
                  <div className="bg-white border border-[#D4D4D8] rounded-xl p-6 text-center">
                    <p className="text-sm text-[#525252]">No active sessions found.</p>
                  </div>
                )}

                {!sessionsLoading &&
                  sessions.map((s) => (
                    <div
                      key={s.session_id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-white border rounded-xl transition-all duration-200 ${
                        s.is_current
                          ? "border-[#6366F1]/40"
                          : "border-[#D4D4D8] hover:border-[#C1C1C9] hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-[#F3F4F6] flex items-center justify-center border border-[#D4D4D8] rounded-lg shrink-0">
                          <DeviceIcon type={s.device_type} className="w-4 h-4 text-[#0A0A0A]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-[#0A0A0A] truncate">
                              {sessionDeviceLabel(s)}
                            </h3>
                            {s.is_current && (
                              <Chip status="active" size="sm" className="shrink-0">This device</Chip>
                            )}
                          </div>
                          <p className="text-xs text-[#525252] mt-0.5 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 min-w-0">
                              <LuMapPin className="w-3 h-3 shrink-0 text-[#9C9C9C]" />
                              <span className="truncate">{sessionLocation(s)}</span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="whitespace-nowrap">Started {formatDateTime(s.created_at)}</span>
                          </p>
                          {(s.browser || s.os) && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <BrowserIcon name={s.browser} className="w-3 h-3" />
                              <OsIcon name={s.os} className="w-3 h-3" />
                              <span className="text-[10px] text-[#9C9C9C]">
                                {[s.browser, s.os].filter(Boolean).join(" · ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => revokeSessionMutation.mutate({ id: s.session_id })}
                        disabled={revokeSessionMutation.isPending && revokingId === s.session_id}
                        className="w-full sm:w-auto sm:shrink-0 inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-[#6B6B6B] bg-white border border-[#D4D4D8] rounded-md hover:border-[#EF4444]/40 hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {revokeSessionMutation.isPending && revokingId === s.session_id ? (
                          <LuLoaderCircle className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LuLogOut className="w-3.5 h-3.5" />
                        )}
                        {s.is_current ? "Log out" : "Sign out"}
                      </button>
                    </div>
                  ))}

                {!sessionsLoading && sessions.length > 0 && (
                  <span className="relative inline-flex group self-start w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowSignOutAll(true)}
                      disabled={revokeAllSessionsMutation.isPending}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-[#FEF2F2] border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444] hover:border-[#EF4444] hover:text-white hover:shadow-[0_4px_12px_rgba(239,68,68,0.35)]"
                    >
                      <LuLogOut className="w-4 h-4" />
                      Log out all sessions
                    </button>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-[#0A0A0A] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 z-[9999]"
                    >
                      Signs you out of every device, including this one.
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0A0A0A]" />
                    </span>
                  </span>
                )}
              </div>
            </motion.section>

            <motion.section
              id="danger"
              ref={registerSection("danger")}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, type: "spring", stiffness: 300, damping: 24 }}
              className="pt-6 sm:pt-8 border-t border-[#D4D4D8]"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#FEF2F2] flex items-center justify-center border border-[#EF4444]/30 rounded-lg shrink-0">
                  <SectionIcon name="warning" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EF4444]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold tracking-[-0.02em] text-[#0A0A0A]">Danger Zone</h2>
                  <p className="text-xs text-[#525252]">Irreversible actions.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 bg-[#FEF2F2] border border-[#EF4444]/30 rounded-xl hover:border-[#EF4444]/60 hover:shadow-sm transition-all duration-200">
                <div>
                  <h3 className="text-sm font-semibold text-[#0A0A0A]">Delete Account</h3>
                  <p className="text-xs text-[#525252] mt-0.5">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="medium"
                  className="w-full sm:w-auto sm:shrink-0"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Delete your account permanently"
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
