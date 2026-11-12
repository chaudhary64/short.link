import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import ModalSheet from "../components/ui/ModalSheet";
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
  LuCheck,
  LuEye,
  LuEyeOff,
  LuInfo,
  LuKeyRound,
  LuLoaderCircle,
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
import ApiKeysPanel from "../components/settings/ApiKeysPanel";
import { useTheme } from "../features/theme/ThemeProvider";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : null;

const SECTIONS = [
  { id: "profile", label: "Profile", icon: "person" },
  { id: "signin", label: "Sign-in Methods", icon: "lock" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "developer", label: "API Keys", icon: "key" },
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
    key: <LuKeyRound className={className} />,
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

  if (!open) return null;

  const confirmed = confirmText === "DELETE";

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      ariaLabel="Delete account confirmation"
      header={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--surface)] flex items-center justify-center border border-[var(--danger)] shrink-0">
            <LuTriangleAlert className="w-5 h-5 text-[var(--danger)]" />
          </div>
          <div>
            <h3 className="g-modal-title">Delete account?</h3>
            <p className="g-modal-sub">This cannot be undone.</p>
          </div>
        </div>
      }
      footer={
        <>
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
        </>
      }
    >
      <p className="g-modal-sub leading-relaxed">
        All your links, analytics, and account data will be permanently removed.
      </p>

      <div className="g-field">
        <label htmlFor="delete-confirm" className="g-flabel">
          Type <span className="text-[var(--danger)]">DELETE</span> to confirm
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
    </ModalSheet>
  );
}

function SignOutAllModal({ open, onClose, onConfirm, isPending }) {
  if (!open) return null;

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      ariaLabel="Sign out of all sessions confirmation"
      header={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--surface)] flex items-center justify-center border border-[var(--danger)] shrink-0">
            <LuLogOut className="w-5 h-5 text-[var(--danger)]" />
          </div>
          <div>
            <h3 className="g-modal-title">Sign out everywhere?</h3>
            <p className="g-modal-sub">This signs you out of every device.</p>
          </div>
        </div>
      }
      footer={
        <>
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
        </>
      }
    >
      <p className="g-modal-sub leading-relaxed">
        You&apos;ll be signed out on every device, including this one. You can
        sign back in anytime with your password or Google.
      </p>
    </ModalSheet>
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
      className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]/90 z-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-16 h-16 bg-[var(--success)] flex items-center justify-center"
      >
        <LuCheck className="w-8 h-8 text-white" />
      </motion.div>
    </motion.div>
  );
}


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
  const { preference: themePreference, setTheme } = useTheme();

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
        "Please check your new email for a verification code — check your spam folder if you don't see it.",
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

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "system", label: "System" },
    { value: "dark", label: "Dark" },
  ];

  return (
    <div className="page">
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

      <header className="page-head">
        <div>
          <div className="page-eyebrow">Account</div>
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">
            Profile, sign-in methods, security and sessions for {email}.
          </p>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <span className="side-group" style={{ paddingLeft: 8 }}>
            Sections
          </span>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className="side-link"
              aria-current={
                activeSection === section.id ? "true" : undefined
              }
              onClick={() => scrollToSection(section.id)}
            >
              <SectionIcon name={section.icon} className="icon w-4 h-4" />
              {section.label}
            </button>
          ))}
        </nav>

        <div className="settings-sections">
          {/* ── Profile ─────────────────────────────────────────────── */}
          <section
            id="profile"
            ref={registerSection("profile")}
            className="panel"
          >
            <div className="panel-head">
              <h2 className="panel-title">Profile</h2>
              <span className="panel-sub">Your name and email address</span>
              {!isEditingProfile && (
                <button
                  type="button"
                  className="ui-btn ui-btn--secondary ui-btn--sm"
                  style={{ marginLeft: "auto" }}
                  onClick={() => {
                    setIsEditingProfile(true);
                    setEditName(name);
                    setEditEmail(email);
                  }}
                >
                  Edit profile
                </button>
              )}
            </div>

            <div className="panel-body">
              {!isEditingProfile ? (
                <div className="profile-block">
                  <Avatar seed={name} className="w-14 h-14 shrink-0" />
                  <div style={{ minWidth: 0 }}>
                    <h3 className="profile-name">{name}</h3>
                    <p className="profile-mail">{email}</p>
                    <div className="profile-meta">
                      <span className="badge badge--plain">
                        Member since {memberYear}
                      </span>
                      {canLoginWithPassword && (
                        <span className="badge" data-tone="active">
                          Email &amp; password
                        </span>
                      )}
                      {canLoginWithGoogle && (
                        <span className="badge" data-tone="info">
                          Google
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleProfileSave}
                  className="g-form"
                  style={{ maxWidth: 420 }}
                >
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="edit-name">
                      Display name
                    </label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="ui-input"
                      placeholder="Your name"
                      autoFocus
                      aria-describedby="name-hint"
                    />
                    <p id="name-hint" className="metric-meta">
                      Between 2 and 50 characters.
                    </p>
                  </div>

                  <div className="ui-field">
                    <span className="ui-label">Email address</span>
                    {isEmailEditing ? (
                      <>
                        {emailStep === "input" ? (
                          <div className="stack-sm">
                            {canLoginWithGoogle && (
                              <p className="inline-note">
                                <LuInfo className="w-3.5 h-3.5 shrink-0" />
                                Changing your email does not affect Google
                                sign-in.
                              </p>
                            )}
                            <input
                              ref={emailInputRef}
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="ui-input"
                              placeholder="new@example.com"
                              autoFocus
                            />
                            <div className="row-actions" style={{ justifyContent: "flex-start" }}>
                              <Button
                                type="button"
                                variant="primary"
                                size="small"
                                onClick={handleEmailChangeRequest}
                                disabled={requestEmailChangeMutation.isPending}
                              >
                                {requestEmailChangeMutation.isPending
                                  ? "Sending…"
                                  : "Send code"}
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
                          <div className="stack-sm">
                            <input
                              type="text"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value)}
                              className="ui-input otp-input"
                              placeholder="000000"
                              autoFocus
                              maxLength={6}
                              inputMode="numeric"
                              aria-label="Six digit verification code"
                            />
                            <p className="metric-meta">
                              Code sent to {editEmail}. Check your spam folder
                              if it does not arrive.
                            </p>
                            <div className="row-actions" style={{ justifyContent: "flex-start" }}>
                              <Button
                                type="button"
                                variant="primary"
                                size="small"
                                onClick={handleEmailVerification}
                                disabled={verifyEmailChangeMutation.isPending}
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
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="ui-input"
                          style={{ color: "var(--ink-4)" }}
                        />
                        <button
                          type="button"
                          className="ui-btn ui-btn--secondary ui-btn--sm"
                          onClick={() => setIsEmailEditing(true)}
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {!isEmailEditing && (
                      <Button
                        type="submit"
                        variant="primary"
                        size="small"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving…" : "Save"}
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
              )}
            </div>
          </section>

          {/* ── Sign-in methods ─────────────────────────────────────── */}
          <section
            id="signin"
            ref={registerSection("signin")}
            className="panel"
          >
            <div className="panel-head">
              <h2 className="panel-title">Sign-in methods</h2>
              <span className="panel-sub">How you access this account</span>
            </div>

            <div className="settings-row">
              <span className="settings-row-icon">
                <LuMail className="w-4 h-4" />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="settings-row-title">Email &amp; password</p>
                <p className="settings-row-desc">
                  {canLoginWithPassword
                    ? "Sign in with your email and password."
                    : "Not enabled yet — set one up in Security."}
                </p>
              </div>
              {canLoginWithPassword ? (
                <span className="badge" data-tone="active">
                  Enabled
                </span>
              ) : (
                <span className="badge" data-tone="paused">
                  Not enabled
                </span>
              )}
            </div>

            <div className="settings-row">
              <span className="settings-row-icon">
                <GoogleLogo className="w-4 h-4" />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="settings-row-title">Google account</p>
                <p className="settings-row-desc">
                  {canLoginWithGoogle
                    ? "Your Google account is linked."
                    : "Link Google to sign in without a password."}
                </p>
              </div>
              {canLoginWithGoogle ? (
                <span className="badge" data-tone="active">
                  Linked
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  disabled={linkGoogleMutation.isPending}
                  className="ui-btn ui-btn--secondary ui-btn--sm"
                >
                  <GoogleLogo className="w-3.5 h-3.5" />
                  {linkGoogleMutation.isPending ? "Linking…" : "Link Google"}
                </button>
              )}
            </div>
          </section>

          {/* ── Appearance ──────────────────────────────────────────── */}
          <section id="appearance" className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Appearance</h2>
              <span className="panel-sub">Theme for this browser</span>
            </div>
            <div className="settings-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="settings-row-title">Colour theme</p>
                <p className="settings-row-desc">
                  System follows your operating system preference.
                </p>
              </div>
              <div className="segmented" role="group" aria-label="Colour theme">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={themePreference === option.value}
                    onClick={() => setTheme(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Security ────────────────────────────────────────────── */}
          <section
            id="security"
            ref={registerSection("security")}
            className="panel"
          >
            <div className="panel-head">
              <h2 className="panel-title">Security</h2>
              <span className="panel-sub">Password and access</span>
            </div>

            <div className="settings-row">
              <span className="settings-row-icon">
                <LuShield className="w-4 h-4" />
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="settings-row-title">
                  {has_password ? "Password" : "Set a password"}
                </p>
                <p className="settings-row-desc">
                  {has_password
                    ? password_changed_at
                      ? `Last changed ${formatDate(password_changed_at)}`
                      : "Update your password to keep the account secure."
                    : "Create a password to secure your account."}
                </p>
              </div>
              {!isPasswordFormOpen && (
                <button
                  type="button"
                  className="ui-btn ui-btn--secondary ui-btn--sm"
                  onClick={() => setIsPasswordFormOpen(true)}
                >
                  {has_password ? "Change" : "Set password"}
                </button>
              )}
            </div>

            {isPasswordFormOpen && (
              <form
                onSubmit={
                  has_password ? handlePasswordChange : handleSetPassword
                }
                className="g-form"
                style={{
                  padding: "16px",
                  borderTop: "1px solid var(--line)",
                  background: "var(--surface-2)",
                }}
              >
                {has_password && (
                  <div className="ui-field">
                    <label className="ui-label" htmlFor="current-password">
                      Current password
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="ui-input"
                        style={{ paddingRight: 40 }}
                        placeholder="Enter current password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="icon-btn"
                        style={{
                          position: "absolute",
                          right: 4,
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                        tabIndex={-1}
                        aria-label={
                          showCurrentPassword
                            ? "Hide current password"
                            : "Show current password"
                        }
                      >
                        <EyeIcon open={showCurrentPassword} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="ui-field">
                  <label className="ui-label" htmlFor="new-password">
                    {has_password ? "New password" : "Password"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="ui-input"
                      style={{ paddingRight: 40 }}
                      placeholder={
                        has_password ? "Enter new password" : "Enter a password"
                      }
                      autoFocus={!has_password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="icon-btn"
                      style={{
                        position: "absolute",
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                      tabIndex={-1}
                      aria-label={
                        showNewPassword ? "Hide new password" : "Show new password"
                      }
                    >
                      <EyeIcon open={showNewPassword} />
                    </button>
                  </div>
                  <PasswordStrength password={newPassword} />
                </div>

                <div className="ui-field">
                  <label className="ui-label" htmlFor="confirm-password">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="ui-input"
                    placeholder="Confirm password"
                  />
                  {newPassword &&
                    confirmPassword &&
                    newPassword !== confirmPassword && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "var(--text-xs)",
                          color: "var(--danger)",
                        }}
                      >
                        Passwords do not match
                      </p>
                    )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
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
                        : "Change password"
                      : setPasswordMutation.isPending
                        ? "Setting…"
                        : "Set password"}
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
          </section>

          {/* ── API keys ────────────────────────────────────────────── */}
          <section
            id="developer"
            ref={registerSection("developer")}
            className="panel"
          >
            <ApiKeysPanel />
          </section>

          {/* ── Sessions ────────────────────────────────────────────── */}
          <section
            id="sessions"
            ref={registerSection("sessions")}
            className="panel"
          >
            <div className="panel-head">
              <h2 className="panel-title">Sessions</h2>
              <span className="panel-sub">Devices signed in to this account</span>
              {sessions.length > 0 && (
                <button
                  type="button"
                  className="ui-btn ui-btn--secondary ui-btn--sm"
                  style={{ marginLeft: "auto" }}
                  onClick={() => setShowSignOutAll(true)}
                  disabled={revokeAllSessionsMutation.isPending}
                >
                  <LuLogOut className="w-3.5 h-3.5" />
                  Sign out all
                </button>
              )}
            </div>

            {sessionsLoading &&
              [0, 1].map((i) => (
                <div key={i} className="settings-row">
                  <div className="skeleton" style={{ width: 34, height: 34 }} />
                  <div style={{ flex: 1, display: "grid", gap: 6 }}>
                    <div className="skeleton" style={{ width: "35%", height: 11 }} />
                    <div className="skeleton" style={{ width: "55%", height: 10 }} />
                  </div>
                </div>
              ))}

            {!sessionsLoading && sessionsError && (
              <div className="settings-row">
                <p className="settings-row-desc">
                  Could not load sessions.{" "}
                  <button
                    type="button"
                    className="g-tab-clear"
                    onClick={() => refetchSessions()}
                  >
                    Try again
                  </button>
                </p>
              </div>
            )}

            {!sessionsLoading && !sessionsError && sessions.length === 0 && (
              <div className="settings-row">
                <p className="settings-row-desc">No active sessions found.</p>
              </div>
            )}

            {!sessionsLoading &&
              sessions.map((s) => (
                <div key={s.session_id} className="settings-row">
                  <span className="settings-row-icon">
                    <DeviceIcon type={s.device_type} className="w-4 h-4" />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="settings-row-title">
                      {sessionDeviceLabel(s)}
                      {s.is_current && (
                        <span
                          className="badge"
                          data-tone="active"
                          style={{ marginLeft: 8 }}
                        >
                          This device
                        </span>
                      )}
                    </p>
                    <p className="settings-row-desc">
                      <LuMapPin className="w-3 h-3" />
                      {sessionLocation(s)}
                      <span aria-hidden>·</span>
                      Started {formatDateTime(s.created_at)}
                    </p>
                    {(s.browser || s.os) && (
                      <p className="settings-row-meta">
                        <BrowserIcon name={s.browser} className="w-3 h-3" />
                        <OsIcon name={s.os} className="w-3 h-3" />
                        {[s.browser, s.os].filter(Boolean).join(" · ")}
                      </p>
                    )}
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
                    className="ui-btn ui-btn--secondary ui-btn--sm"
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
          </section>

          {/* ── Danger zone ─────────────────────────────────────────── */}
          <section
            id="danger"
            ref={registerSection("danger")}
            className="panel"
            style={{ borderColor: "color-mix(in srgb, var(--danger) 35%, var(--line))" }}
          >
            <div className="panel-head">
              <h2 className="panel-title" style={{ color: "var(--danger)" }}>
                Danger zone
              </h2>
              <span className="panel-sub">Irreversible actions</span>
            </div>
            <div className="settings-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="settings-row-title">Delete account</p>
                <p className="settings-row-desc">
                  Permanently remove your account, links and analytics. This
                  cannot be undone.
                </p>
              </div>
              <button
                type="button"
                className="ui-btn ui-btn--danger ui-btn--sm"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Delete your account permanently"
              >
                Delete account
              </button>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        <SuccessAnimation show={showSuccess} />
      </AnimatePresence>
    </div>
  );
};

export default Settings;
