import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LuCheck,
  LuLoaderCircle,
  LuLogOut,
  LuMonitor,
  LuMoon,
  LuSettings,
  LuSun,
} from "react-icons/lu";
import Avatar from "../ui/Avatar";
import Menu from "../ui/Menu";
import { LogoutUser } from "../../api/auth";
import { useAuthActions } from "../../features/auth/useAuthActions";
import { useUserInfo, useUserActions } from "../../features/user/useUserActions";
import { useTheme } from "../../features/theme/ThemeProvider";
import { useToast } from "../../features/toast/useToast.jsx";

const THEMES = [
  { value: "light", label: "Light", icon: LuSun },
  { value: "system", label: "System", icon: LuMonitor },
  { value: "dark", label: "Dark", icon: LuMoon },
];

const AccountMenu = () => {
  const user = useUserInfo();
  const [open, setOpen] = useState(false);
  const { logout } = useAuthActions();
  const { removeUserInfo } = useUserActions();
  const { preference, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: LogoutUser,
    onSuccess: () => {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      queryClient.clear();
      toast.info("Signed out", "Your session ended on this device.");
      navigate("/login");
    },
    onError: () => {
      logout();
      removeUserInfo();
      queryClient.removeQueries({ queryKey: ["REFRESH_TOKEN"] });
      queryClient.clear();
      toast.warning(
        "Signed out locally",
        "The server could not be reached to end the session.",
      );
      navigate("/login");
    },
  });

  return (
    <div className="relative">
      <button
        type="button"
        id="account-menu-trigger"
        className="side-user"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar seed={user.name} className="w-7 h-7 shrink-0" />
        <span className="min-w-0 text-left">
          <span className="side-user-name">{user.name || "Account"}</span>
          <span className="side-user-mail">{user.email}</span>
        </span>
      </button>

      <Menu
        open={open}
        onClose={() => setOpen(false)}
        labelledBy="account-menu-trigger"
        minWidth={240}
      >
        <div className="menu-head">
          <Avatar seed={user.name} className="w-9 h-9 shrink-0" />
          <div className="min-w-0">
            <p className="menu-name truncate">{user.name}</p>
            <p className="menu-mail truncate">{user.email}</p>
          </div>
        </div>

        <span className="menu-label">Appearance</span>
        {THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="menuitemradio"
            aria-checked={preference === value}
            className="menu-item"
            onClick={() => setTheme(value)}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
            {label}
            {preference === value && (
              <LuCheck className="w-3.5 h-3.5 ml-auto" aria-hidden />
            )}
          </button>
        ))}

        <div className="menu-sep" />

        <Link
          to="/settings"
          role="menuitem"
          className="menu-item"
          onClick={() => setOpen(false)}
        >
          <LuSettings className="w-3.5 h-3.5 shrink-0" aria-hidden />
          Settings
        </Link>

        <button
          type="button"
          role="menuitem"
          data-danger="true"
          className="menu-item"
          disabled={mutation.isPending}
          onClick={() => {
            setOpen(false);
            mutation.mutate();
          }}
        >
          {mutation.isPending ? (
            <LuLoaderCircle className="w-3.5 h-3.5 shrink-0 animate-spin" />
          ) : (
            <LuLogOut className="w-3.5 h-3.5 shrink-0" aria-hidden />
          )}
          {mutation.isPending ? "Signing out…" : "Sign out"}
        </button>
      </Menu>
    </div>
  );
};

export default AccountMenu;
