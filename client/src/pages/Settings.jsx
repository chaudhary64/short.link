import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import PasswordStrength from "../components/ui/PasswordStrength";
import { useScrollSpy } from "../hooks/useScrollSpy";
import Avatar from "../components/ui/Avatar";
import {
  updateUser,
  deleteUser,
  changePassword,
  setPassword,
  linkGoogleAccount,
  requestEmailChange,
  verifyEmailChange,
  getSessions,
  revokeSession,
  revokeAllSessions,
} from "../api/auth";
import {
  BrowserIcon,
  DeviceIcon,
  OsIcon,
} from "../components/analytics/DeviceIcons";
import { formatDateTime } from "../utils/format";
import { useUserInfo, useUserActions } from "../features/user/useUserActions";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useToast } from "../features/toast/useToast.jsx";
import { POLL_INTERVAL_MS, REFETCH_ON_WINDOW_FOCUS } from "../config/polling";
import { useGoogleLogin } from "@react-oauth/google";
import {
  LuCalendarDays,
  LuCheck,
  LuEye,
  LuEyeOff,
  LuInfo,
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
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const confirmed = confirmText === "DELETE";

  return (
    <div className="g-modal-overlay">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Delete account confirmation"
        className="g-modal"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f5f3ee] flex items-center justify-center border-2 border-[#d62828] shrink-0">
            <LuTriangleAlert className="w-5 h-5 text-[#d62828]" />
          </div>
          <div>
            <h3 className="g-modal-title">Delete account?</h3>
            <p className="g-modal-sub">This cannot be undone.</p>
          </div>
        </div>

        <p className="g-modal-sub leading-relaxed">
          All your links, analytics, and account data will be permanently
          removed.
        </p>

        <div className="g-field">
          <label htmlFor="delete-confirm" className="g-flabel">
            Type <span className="text-[#d62828]">DELETE</span> to confirm
          </label>
          <input
            ref={inputRef}
            id="delete-confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="g-input"
            placeholder="DELETE"
            aria-describedby="delete-confirmation-hint"
          />
          <p id="delete-confirmation-hint" className="sr-only">
            Type DELETE to confirm account deletion
          </p>
        </div>

        <div className="g-modal-actions">
          <Button
            variant="destructive"
            size="medium"
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

function SignOutAllModal({ open, onClose, onConfirm, isPending }) {
  const containerRef = useRef(null);

  useFocusTrap(open, containerRef);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const buttons = containerRef.current.querySelectorAll("button");
    buttons[buttons.length - 1]?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="g-modal-overlay">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sign out of all sessions confirmation"
        className="g-modal"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f5f3ee] flex items-center justify-center border-2 border-[#d62828] shrink-0">
            <LuLogOut className="w-5 h-5 text-[#d62828]" />
          </div>
          <div>
            <h3 className="g-modal-title">Sign out everywhere?</h3>
            <p className="g-modal-sub">This signs you out of every device.</p>
          </div>
        </div>

        <p className="g-modal-sub leading-relaxed">
          You&apos;ll be signed out on every device, including this one. You can
          sign back in anytime with your password or Google.
        </p>

        <div className="g-modal-actions">
          <Button
            variant="destructive"
            size="medium"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Signing out everywhere…" : "Sign out everywhere"}
          </Button>
          <Button
            variant="secondary"
            size="medium"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
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
      className="absolute inset-0 flex items-center justify-center bg-[#f5f3ee]/90 z-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-16 h-16 bg-[#1e7d4f] flex items-center justify-center"
      >
        <LuCheck className="w-8 h-8 text-white" />
      </motion.div>
    </motion.div>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div className="g-sec-head">
      <h2 className="g-sec-title">
        <span className="g-sq g-sq-red" aria-hidden />
        {title}
      </h2>
      <p className="g-sec-sub">{subtitle}</p>
    </div>
  );
}

const StatusChip = ({ on, children, className = "" }) => (
  <span className={`g-chip ${on ? "" : "opacity-70"} ${className}`}>
    <span className={`g-sq ${on ? "g-sq-red" : ""}`} aria-hidden />
    {children}
  </span>
);

const Settings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    name,
    email,
    created_at,
    gender,
    password_changed_at,
    has_password,
    has_google,
  } = useUserInfo();
  const { setUserInfo, removeUserInfo } = useUserActions();
  const { logout, setAccessToken } = useAuthActions();

  const { activeSection, scrollToSection, registerSection } =
    useScrollSpy("profile");

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
      setUserInfo({
        name: serverName,
        email,
        created_at,
        gender,
        password_changed_at,
        has_password,
        has_google,
      });
      setIsEditingProfile(false);
      setIsEmailEditing(false);
      setEmailStep("input");
      setEmailOtp("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      toast.success(
        "Profile updated!",
        "Your profile has been updated successfully.",
      );
    },
    onError: (err) => {
      toast.error(
        "Update failed",
        err.response?.data?.message || "Could not update profile.",
      );
    },
  });

  const requestEmailChangeMutation = useMutation({
    mutationFn: requestEmailChange,
    onSuccess: () => {
      setEmailStep("verify");
      toast.info(
        "Verification sent",
        "Please check your new email for a verification code.",
      );
    },
    onError: (err) => {
      toast.error(
        "Request failed",
        err.response?.data?.message || "Could not request email change.",
      );
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
        has_google,
      });
      setIsEditingProfile(false);
      setIsEmailEditing(false);
      setEmailStep("input");
      setEmailOtp("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      toast.success(
        "Email updated!",
        "Your email has been changed successfully.",
      );
    },
    onError: (err) => {
      toast.error(
        "Verification failed",
        err.response?.data?.message || "Invalid or expired code.",
      );
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
      setUserInfo({
        name,
        email,
        created_at,
        gender,
        password_changed_at: new Date().toISOString(),
        has_password: true,
        has_google,
      });
      toast.success(
        "Password set!",
        "Your password has been created. You can now log in with email and password.",
      );
    },
    onError: (err) => {
      toast.error(
        "Failed to set password",
        err.response?.data?.message || "Could not set password.",
      );
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
      setUserInfo({
        name,
        email,
        created_at,
        gender,
        password_changed_at: new Date().toISOString(),
        has_password,
        has_google,
      });
      toast.success(
        "Password changed!",
        "Your password has been updated successfully.",
      );
    },
    onError: (err) => {
      toast.error(
        "Password change failed",
        err.response?.data?.message || "Could not change password.",
      );
    },
  });

  const linkGoogleMutation = useMutation({
    mutationFn: linkGoogleAccount,
    onSuccess: () => {
      setUserInfo({
        name,
        email,
        created_at,
        gender,
        password_changed_at,
        has_password,
        has_google: true,
      });
      toast.success(
        "Google linked!",
        "Your Google account has been linked successfully. You can now sign in with Google.",
      );
    },
    onError: (err) => {
      toast.error(
        "Link failed",
        err.response?.data?.message || "Could not link Google account.",
      );
    },
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      linkGoogleMutation.mutate({ token: tokenResponse.access_token });
    },
    onError: () => {
      toast.error("Google Error", "Failed to authenticate with Google.");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      logout();
      removeUserInfo();
      toast.info(
        "Account deleted",
        "Your account has been permanently deleted.",
      );
      navigate("/");
    },
    onError: (err) => {
      toast.error(
        "Deletion failed",
        err.response?.data?.message || "Could not delete account.",
      );
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
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
  });
  const sessions = sessionsData?.data?.sessions ?? [];

  useEffect(() => {
    if (sessionsLoading || sessionsError || !sessionsData) return;
    const list = sessionsData?.data?.sessions ?? [];
    if (list.length === 0 || !list.some((s) => s.is_current)) {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      toast.info(
        "Signed out",
        "This session was ended on another device. Please sign in again.",
      );
      navigate("/login");
    }
  }, [
    sessionsData,
    sessionsLoading,
    sessionsError,
    logout,
    removeUserInfo,
    queryClient,
    toast,
    navigate,
  ]);

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
      toast.error(
        "Could not end session",
        err.response?.data?.message || "Please try again.",
      );
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      toast.info(
        "Signed out everywhere",
        "You've been signed out of every device.",
      );
      navigate("/login");
    },
    onError: (err) => {
      toast.error(
        "Could not sign out everywhere",
        err.response?.data?.message || "Please try again.",
      );
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
      toast.warning(
        "Same email",
        "New email must be different from current email.",
      );
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      toast.warning("Invalid email", "Please enter a valid email address.");
      return;
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
      toast.warning(
        "Same password",
        "New password must be different from current password.",
      );
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const canLoginWithPassword = has_password;
  const canLoginWithGoogle = has_google;
  const memberYear = created_at ? new Date(created_at).getFullYear() : "—";

  const sectionTab = (sec) => {
    const isActive = activeSection === sec.id;
    return (
      <button
        key={sec.id}
        type="button"
        onClick={() => scrollToSection(sec.id)}
        aria-pressed={isActive}
        className={`g-tab2 justify-start w-full ${isActive ? "on" : ""}`}
      >
        <SectionIcon
          name={sec.icon}
          className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-[#8a8578]"}`}
        />
        {sec.label}
      </button>
    );
  };

  return (
    <div className="g-page">
      <DeleteModal
        key={`delete-${showDeleteConfirm ? "open" : "closed"}`}
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteAccountMutation.mutate();
          setShowDeleteConfirm(false);
        }}
        isPending={deleteAccountMutation.isPending}
      />
      <SignOutAllModal
        key={`signout-${showSignOutAll ? "open" : "closed"}`}
        open={showSignOutAll}
        onClose={() => setShowSignOutAll(false)}
        onConfirm={() => revokeAllSessionsMutation.mutate()}
        isPending={revokeAllSessionsMutation.isPending}
      />
      <main className="flex w-full flex-1 flex-col gap-7 pt-8 pb-[60px]">
        <PageHeader
          kicker="ACCOUNT · SECURITY · PREFERENCES"
          title="Settings"
          subtitle="Manage your account, security, and preferences."
        />

        <div className="flex flex-col lg:flex-row gap-7">
          <nav className="hidden lg:flex flex-col w-52 shrink-0 sticky top-[72px] self-start gap-1.5">
            <span className="g-kicker2 mb-1">Sections</span>
            {SECTIONS.map(sectionTab)}
          </nav>

          <div className="flex-1 min-w-0 flex flex-col gap-7">
            <div className="lg:hidden flex flex-col gap-2">
              <span className="g-kicker2">Sections</span>
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.map(sectionTab)}
              </div>
            </div>

            <section
              id="profile"
              ref={registerSection("profile")}
              className="g-panel relative"
            >
              <AnimatePresence>
                <SuccessAnimation show={showSuccess} />
              </AnimatePresence>
              <div className="relative flex flex-wrap items-start gap-4 border-b-2 border-[#141414] px-5 sm:px-6 py-6 sm:py-8">
                <Avatar
                  seed={name}
                  className="w-16 h-16 sm:w-24 sm:h-24 text-xl sm:text-3xl border-2 border-[#141414] !rounded-none [&_img]:!rounded-none shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {isEditingProfile ? (
                    <form
                      onSubmit={handleProfileSave}
                      className="flex flex-col gap-4 max-w-md"
                    >
                      <div className="g-field">
                        <label className="g-flabel" htmlFor="edit-name">
                          Display Name
                        </label>
                        <input
                          id="edit-name"
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="g-input"
                          placeholder="Your name"
                          autoFocus
                          aria-describedby="name-hint"
                        />
                        <p
                          id="name-hint"
                          className="text-xs text-[#8a8578] mt-1"
                        >
                          2-50 characters
                        </p>
                      </div>

                      <div className="g-field">
                        <span className="g-flabel">Email Address</span>
                        {isEmailEditing ? (
                          <>
                            {emailStep === "input" ? (
                              <div className="flex flex-col gap-3">
                                {canLoginWithGoogle && (
                                  <div className="flex items-start gap-2 p-3 border border-[#1d4ed8]/40 bg-[#e9e6dd]">
                                    <LuInfo className="w-4 h-4 text-[#1d4ed8] shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#141414] leading-relaxed">
                                      <strong>Note:</strong> Changing your email
                                      won&apos;t affect Google sign-in — you can
                                      keep signing in with Google.
                                    </p>
                                  </div>
                                )}
                                <input
                                  ref={emailInputRef}
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="g-input"
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
                                    disabled={
                                      requestEmailChangeMutation.isPending
                                    }
                                  >
                                    {requestEmailChangeMutation.isPending
                                      ? "Sending…"
                                      : "Send Code"}
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
                              <div className="flex flex-col gap-3">
                                <input
                                  type="text"
                                  value={emailOtp}
                                  onChange={(e) => setEmailOtp(e.target.value)}
                                  className="g-input font-mono text-center text-lg tracking-widest"
                                  placeholder="000000"
                                  autoFocus
                                  maxLength={6}
                                />
                                <p className="text-xs text-[#8a8578]">
                                  Code sent to {editEmail}
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="primary"
                                    size="small"
                                    className="flex-1"
                                    onClick={handleEmailVerification}
                                    disabled={
                                      verifyEmailChangeMutation.isPending
                                    }
                                  >
                                    {verifyEmailChangeMutation.isPending
                                      ? "Verifying…"
                                      : "Verify"}
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
                              className="g-input flex-1 text-[#8a8578] cursor-not-allowed"
                            />
                            <button
                              type="button"
                              onClick={() => setIsEmailEditing(true)}
                              className="g-tab-clear whitespace-nowrap"
                            >
                              CHANGE
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!isEmailEditing && (
                          <Button
                            type="submit"
                            variant="primary"
                            size="small"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending
                              ? "Saving…"
                              : "Save"}
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={cancelProfileEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.04em] text-[#141414] leading-none uppercase">
                        {name}
                      </h2>
                      <p className="text-sm text-[#8a8578] mt-1.5 break-words">{email}</p>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
                        <span className="g-chip">
                          <LuCalendarDays className="w-3 h-3 shrink-0" />
                          Member since {memberYear}
                        </span>
                        {canLoginWithPassword && (
                          <span className="g-chip">
                            <LuLock className="w-3 h-3 shrink-0" />
                            Email & Password
                          </span>
                        )}
                        {canLoginWithGoogle && (
                          <span className="g-chip">
                            <GoogleLogo className="w-3 h-3 shrink-0" />
                            Google
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
                    className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0"
                    onClick={() => {
                      setIsEditingProfile(true);
                      setEditName(name);
                      setEditEmail(email);
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </section>

            <section
              id="signin"
              ref={registerSection("signin")}
              className="flex flex-col gap-4"
            >
              <SectionHeading
                title="Sign-in Methods"
                subtitle="Manage how you sign in to your account."
              />
              <div className="flex flex-col gap-4">
                <div className="g-panel">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#e9e6dd] flex items-center justify-center border border-[#8a8578] shrink-0">
                        <LuMail className="w-4 h-4 sm:w-5 sm:h-5 text-[#141414]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#141414] uppercase tracking-wide">
                          Email & Password
                        </h3>
                        <p className="text-xs text-[#8a8578] mt-0.5">
                          {canLoginWithPassword
                            ? "Sign in with your email and password."
                            : "Not enabled yet — set one up in the Security section."}
                        </p>
                      </div>
                    </div>
                    {canLoginWithPassword ? (
                      <StatusChip on>Enabled</StatusChip>
                    ) : (
                      <StatusChip>Not enabled</StatusChip>
                    )}
                  </div>
                </div>

                <div className="g-panel">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#e9e6dd] flex items-center justify-center border border-[#8a8578] shrink-0">
                        <GoogleLogo className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#141414] uppercase tracking-wide">
                          Google Account
                        </h3>
                        <p className="text-xs text-[#8a8578] mt-0.5">
                          {canLoginWithGoogle
                            ? "Your Google account is linked."
                            : "Link your Google account to sign in with Google."}
                        </p>
                      </div>
                    </div>
                    {canLoginWithGoogle ? (
                      <StatusChip on>Linked</StatusChip>
                    ) : (
                      <button
                        type="button"
                        onClick={() => loginWithGoogle()}
                        disabled={linkGoogleMutation.isPending}
                        className="g-btn g-btn-line g-btn-sm shrink-0"
                        aria-label={
                          linkGoogleMutation.isPending
                            ? "Linking Google account"
                            : "Link Google account"
                        }
                      >
                        <GoogleLogo className="w-4 h-4" />
                        {linkGoogleMutation.isPending
                          ? "Linking…"
                          : "Link Google"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section
              id="security"
              ref={registerSection("security")}
              className="flex flex-col gap-4"
            >
              <SectionHeading
                title="Security"
                subtitle="Update your password."
              />
              <div className="g-panel relative">
                <SuccessAnimation show={showSuccess && !isPasswordFormOpen} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
                  <div>
                    <h3 className="text-sm font-bold text-[#141414] uppercase tracking-wide">
                      {has_password ? "Password" : "Set a Password"}
                    </h3>
                    <p className="text-xs text-[#8a8578] mt-0.5">
                      {has_password
                        ? password_changed_at
                          ? `Last changed ${formatDate(password_changed_at)}`
                          : "Update your password to keep your account secure."
                        : "Create a password to secure your account."}
                    </p>
                  </div>
                  {!isPasswordFormOpen && (
                    <Button
                      variant={has_password ? "secondary" : "primary"}
                      size="small"
                      className="shrink-0"
                      onClick={() => setIsPasswordFormOpen(true)}
                    >
                      {has_password ? "Change" : "Set Password"}
                    </Button>
                  )}
                </div>

                {isPasswordFormOpen && (
                  <form
                    onSubmit={
                      has_password ? handlePasswordChange : handleSetPassword
                    }
                    className="flex flex-col gap-4 pt-4 px-4 sm:px-5 pb-5 border-t-2 border-[#141414]"
                  >
                    {has_password && (
                      <div className="g-field">
                        <label className="g-flabel" htmlFor="current-password">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="g-input pr-12"
                            placeholder="Enter current password"
                            autoFocus
                            aria-describedby="current-password-visibility"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8a8578] hover:text-[#141414] focus:outline-none cursor-pointer p-1"
                            tabIndex={-1}
                            aria-label={
                              showCurrentPassword
                                ? "Hide current password"
                                : "Show current password"
                            }
                            id="current-password-visibility"
                          >
                            <EyeIcon open={showCurrentPassword} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="g-field">
                      <label className="g-flabel" htmlFor="new-password">
                        {has_password ? "New Password" : "Password"}
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="g-input pr-12"
                          placeholder={
                            has_password
                              ? "Enter new password"
                              : "Enter a password"
                          }
                          autoFocus={!has_password}
                          aria-describedby="new-password-visibility"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8a8578] hover:text-[#141414] focus:outline-none cursor-pointer p-1"
                          tabIndex={-1}
                          aria-label={
                            showNewPassword
                              ? "Hide new password"
                              : "Show new password"
                          }
                          id="new-password-visibility"
                        >
                          <EyeIcon open={showNewPassword} />
                        </button>
                      </div>
                      <PasswordStrength password={newPassword} />
                    </div>

                    <div className="g-field">
                      <label className="g-flabel" htmlFor="confirm-password">
                        {has_password
                          ? "Confirm New Password"
                          : "Confirm Password"}
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="g-input"
                        placeholder={
                          has_password
                            ? "Confirm new password"
                            : "Confirm password"
                        }
                        aria-describedby="confirm-password-hint"
                      />
                      {newPassword &&
                        confirmPassword &&
                        newPassword !== confirmPassword && (
                          <p
                            id="confirm-password-hint"
                            className="text-xs text-[#d62828] mt-1"
                          >
                            Passwords do not match
                          </p>
                        )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        size="small"
                        disabled={
                          changePasswordMutation.isPending ||
                          setPasswordMutation.isPending
                        }
                      >
                        {has_password
                          ? changePasswordMutation.isPending
                            ? "Changing…"
                            : "Change Password"
                          : setPasswordMutation.isPending
                            ? "Setting…"
                            : "Set Password"}
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
            </section>

            <section
              id="sessions"
              ref={registerSection("sessions")}
              className="flex flex-col gap-4"
            >
              <SectionHeading
                title="Sessions"
                subtitle="Devices currently signed in to your account. Sign out of any device you don't recognize."
              />
              <div className="g-panel flex flex-col">
                <div className="flex flex-col max-h-[420px] overflow-y-auto overscroll-contain">
                  {sessionsLoading &&
                    [0, 1].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 sm:p-5 animate-pulse border-b border-[#141414]/15 last:border-b-0"
                      >
                        <div className="w-10 h-10 bg-[#e4e1d8] border border-[#8a8578] shrink-0" />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="h-3.5 bg-[#e4e1d8] w-1/3" />
                          <div className="h-3 bg-[#e4e1d8] w-1/2" />
                        </div>
                      </div>
                    ))}

                  {!sessionsLoading && sessionsError && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-[#8a8578]">
                        Couldn't load your sessions.{" "}
                        <button
                          type="button"
                          onClick={() => refetchSessions()}
                          className="g-tab-clear"
                        >
                          TRY AGAIN
                        </button>
                      </p>
                    </div>
                  )}

                  {!sessionsLoading &&
                    !sessionsError &&
                    sessions.length === 0 && (
                      <div className="p-6 text-center">
                        <p className="text-sm text-[#8a8578]">
                          No active sessions found.
                        </p>
                      </div>
                    )}

                  {!sessionsLoading &&
                    sessions.map((s) => (
                      <div
                        key={s.session_id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 border-b border-[#141414]/15 last:border-b-0 ${
                          s.is_current ? "bg-[#e9e6dd]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-[#f5f3ee] flex items-center justify-center border border-[#8a8578] shrink-0">
                            <DeviceIcon
                              type={s.device_type}
                              className="w-4 h-4 text-[#141414]"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-[#141414] truncate uppercase tracking-wide">
                                {sessionDeviceLabel(s)}
                              </h3>
                              {s.is_current && (
                                <StatusChip on className="shrink-0">
                                  This device
                                </StatusChip>
                              )}
                            </div>
                            <p className="text-xs text-[#8a8578] mt-0.5 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                              <span className="inline-flex items-center gap-1 min-w-0">
                                <LuMapPin className="w-3 h-3 shrink-0 text-[#8a8578]" />
                                <span className="truncate">
                                  {sessionLocation(s)}
                                </span>
                              </span>
                              <span aria-hidden="true" className="hidden sm:inline">
                                ·
                              </span>
                              <span className="whitespace-nowrap">
                                Started {formatDateTime(s.created_at)}
                              </span>
                            </p>
                            {(s.browser || s.os) && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <BrowserIcon
                                  name={s.browser}
                                  className="w-3 h-3"
                                />
                                <OsIcon name={s.os} className="w-3 h-3" />
                                <span className="text-[10px] text-[#8a8578]">
                                  {[s.browser, s.os]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            revokeSessionMutation.mutate({ id: s.session_id })
                          }
                          disabled={
                            revokeSessionMutation.isPending &&
                            revokingId === s.session_id
                          }
                          className="g-op g-op-danger shrink-0 self-start sm:self-auto w-full sm:w-auto justify-center"
                        >
                          {revokeSessionMutation.isPending &&
                          revokingId === s.session_id ? (
                            <LuLoaderCircle className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <LuLogOut className="w-3.5 h-3.5" />
                          )}
                          {s.is_current ? "Log out" : "Sign out"}
                        </button>
                      </div>
                    ))}
                </div>

                {!sessionsLoading && sessions.length > 0 && (
                  <div className="p-4 sm:p-5 border-t-2 border-[#141414]">
                    <span className="relative inline-flex group">
                      <button
                        type="button"
                        onClick={() => setShowSignOutAll(true)}
                        disabled={revokeAllSessionsMutation.isPending}
                        className="g-btn g-btn-red g-btn-sm"
                      >
                        <LuLogOut className="w-4 h-4" />
                        Log out all sessions
                      </button>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-[#141414] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f5f3ee] opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 z-50 max-sm:left-0 max-sm:translate-x-0 max-sm:whitespace-normal max-sm:max-w-[calc(100vw-2rem)]"
                      >
                        Signs you out of every device, including this one.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#141414] max-sm:left-2 max-sm:translate-x-0" />
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </section>

            <section
              id="danger"
              ref={registerSection("danger")}
              className="flex flex-col gap-4"
            >
              <SectionHeading
                title="Danger Zone"
                subtitle="Irreversible actions."
              />
              <div className="g-panel border-[#d62828]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5">
                  <div>
                    <h3 className="text-sm font-bold text-[#141414] uppercase tracking-wide">
                      Delete Account
                    </h3>
                    <p className="text-xs text-[#8a8578] mt-0.5">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="medium"
                    className="shrink-0"
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="Delete your account permanently"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
