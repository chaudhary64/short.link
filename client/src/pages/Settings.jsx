import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import { updateUser, deleteUser, changePassword, setPassword } from "../api/auth";
import { useUserInfo, useUserActions } from "../features/user/useUserActions";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useToast } from "../features/toast/useToast.jsx";

const Settings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { name, email, created_at, gender, has_password } = useUserInfo();
  const { setUserInfo, removeUserInfo } = useUserActions();
  const { logout } = useAuthActions();

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(name);

  // Password state
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (res) => {
      const serverName = res?.data?.user?.name ?? editName;
      setUserInfo({ name: serverName, email, created_at, gender, has_password });
      setIsEditingProfile(false);
      toast.success("Profile updated!", "Your profile has been updated successfully.");
    },
    onError: (err) => {
      toast.error("Update failed", err.response?.data?.message || "Could not update profile.");
    },
  });

  // Set password mutation (for Google users without a password)
  const setPasswordMutation = useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      setIsPasswordFormOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setUserInfo({ name, email, created_at, gender, has_password: true });
      toast.success("Password set!", "Your password has been created. You can now log in with email and password.");
    },
    onError: (err) => {
      toast.error("Failed to set password", err.response?.data?.message || "Could not set password.");
    },
  });

  // Change password mutation (for users who already have a password)
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

  // Delete account mutation
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

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  return (
    <div className="bg-[#fafafa] text-gray-900 flex flex-col flex-1 font-sans pb-20">
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 mt-10 flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences and security.</p>
        </div>

        {/* Profile Section */}
        <Card className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center border border-gray-200">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-500">Update your personal information.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar seed={name} className="w-20 h-20 text-2xl border-4 border-white shadow-sm shrink-0" />

            <div className="flex-1 w-full">
              {isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" variant="primary" size="medium" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="secondary" size="medium" onClick={() => { setIsEditingProfile(false); setEditName(name); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Display Name</label>
                    <p className="text-sm text-gray-900 font-medium">{name}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
                    <p className="text-sm text-gray-900 font-medium">{email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Member Since</label>
                      <p className="text-sm text-gray-900 font-medium">
                        {created_at ? new Date(created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 border border-gray-200 rounded-none px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                      {gender && gender !== "unknown" ? "Email Account" : "Account"}
                    </span>
                  </div>
                  <Button variant="secondary" size="medium" className="self-start" onClick={() => { setIsEditingProfile(true); setEditName(name); }}>
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Password Section */}
        <Card className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center border border-gray-200">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {has_password ? "Password" : "Set Password"}
              </h2>
              <p className="text-sm text-gray-500">
                {has_password
                  ? "Update your password to keep your account secure."
                  : "Create a password to also log in with email and password."}
              </p>
            </div>
          </div>

          {isPasswordFormOpen ? (
            <form
              onSubmit={has_password ? handlePasswordChange : handleSetPassword}
              className="flex flex-col gap-4"
            >
              {/* Current Password field — only shown when user already has a password */}
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
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all"
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                      {showCurrentPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
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
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all"
                    placeholder={has_password ? "Enter new password" : "Enter a password"}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
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
                  className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all"
                  placeholder={has_password ? "Confirm new password" : "Confirm password"}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  disabled={changePasswordMutation.isPending || setPasswordMutation.isPending}
                >
                  {has_password
                    ? (changePasswordMutation.isPending ? "Changing..." : "Change Password")
                    : (setPasswordMutation.isPending ? "Setting..." : "Set Password")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="medium"
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
          ) : (
            <div className="flex flex-col gap-2">
              {!has_password && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  You signed up with Google and don't have a password yet. Set one to also log in with email and password.
                </p>
              )}
              <Button variant="secondary" size="medium" className="self-start" onClick={() => setIsPasswordFormOpen(true)}>
                {has_password ? "Change Password" : "Set Password"}
              </Button>
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="flex flex-col gap-6 border-red-200">
          <div className="flex items-center gap-3 border-b border-red-100 pb-4">
            <div className="w-10 h-10 bg-red-50 flex items-center justify-center border border-red-200">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
              <p className="text-sm text-gray-500">Irreversible account actions.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50/50 border border-red-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              {!showDeleteConfirm ? (
                <Button variant="destructive" size="medium" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Account
                </Button>
              ) : (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <p className="text-xs text-gray-500">
                    Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="px-3 py-2 border border-red-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white placeholder-gray-400 transition-all"
                    placeholder="Type DELETE"
                  />
                  <div className="flex gap-2">
                    <Button variant="destructive" size="small" onClick={handleDeleteAccount} disabled={deleteAccountMutation.isPending || deleteConfirmText !== "DELETE"}>
                      {deleteAccountMutation.isPending ? "Deleting..." : "Confirm Delete"}
                    </Button>
                    <Button variant="secondary" size="small" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

      </main>
    </div>
  );
};

export default Settings;
