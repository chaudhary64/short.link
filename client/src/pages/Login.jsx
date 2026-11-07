import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { LuEye, LuEyeOff, LuLoaderCircle } from "react-icons/lu";
import Button from "../components/ui/Button";
import GoogleIcon from "../components/ui/GoogleIcon";
import { LoginUser, GoogleLoginUser } from "../api/auth";
import { convertGuestLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useUserActions } from "../features/user/useUserActions";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { setAccessToken } = useAuthActions();
  const { setUserInfo } = useUserActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const tryConvertGuestLink = async () => {
    try {
      const guestDataRaw = localStorage.getItem("guest_link");
      if (!guestDataRaw) return;

      const { short_code, fingerprint } = JSON.parse(guestDataRaw);
      if (!short_code || !fingerprint) {
        localStorage.removeItem("guest_link");
        return;
      }

      await convertGuestLink({ shortCode: short_code, fingerprint });
      toast.success(
        "Link converted!",
        "Your temporary link is now permanent. See it in your dashboard.",
      );
      localStorage.removeItem("guest_link");
    } catch (err) {
      const isExpired =
        err?.response?.status === 404 || err instanceof SyntaxError;
      if (isExpired) {
        localStorage.removeItem("guest_link");
        toast.info(
          "Guest link expired",
          "Your temporary link has expired. Create a new one from the dashboard.",
        );
      } else {
        toast.warning(
          "Couldn't convert link",
          "Your temporary link is safe — it will be converted automatically on your next sign-in.",
        );
      }
    }
  };

  const loginMutation = useMutation({
    mutationFn: LoginUser,
    onSuccess: async ({ data }) => {
      setAccessToken(data.accessToken);
      setUserInfo(data.user);
      toast.success("Welcome back!", "You have successfully logged in.");
      await tryConvertGuestLink();
      navigate("/dashboard");
    },
    onError: (err) => {
      if (err.response?.status === 403) {
        toast.info(
          "Verify your email",
          "Please verify your email to continue — check your spam folder for the code, or resend it.",
        );
        navigate(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      toast.error(
        "Login failed",
        err.response?.data?.message ||
          "Please check your credentials and try again.",
      );
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: GoogleLoginUser,
    onSuccess: async ({ data }) => {
      setAccessToken(data.accessToken);
      setUserInfo(data.user);
      toast.success("Welcome!", "You have successfully logged in with Google.");
      await tryConvertGuestLink();
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(
        "Google Login failed",
        err.response?.data?.message || "An error occurred during Google Login.",
      );
    },
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleLoginMutation.mutate({ token: tokenResponse.access_token });
    },
    onError: () => {
      toast.error(
        "Google Login Failed",
        "Could not complete the login process.",
      );
    },
  });

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters";
    return e;
  };

  const handleSubmit = (formData) => {
    const data = Object.fromEntries(formData);
    const e = validate();
    setErrors(e);
    setTouched({ email: true, password: true });
    if (Object.keys(e).length > 0) return;
    loginMutation.mutate(data);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const e = validate();
    setErrors(e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="auth-card"
    >
      <header className="auth-head">
        <p className="auth-kicker">Sign in</p>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">
          Sign in to your links, analytics and QR codes.
        </p>
      </header>

      <form action={handleSubmit} className="auth-form" noValidate>
        <div className="g-field">
          <label htmlFor="login-email" className="g-flabel">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            required
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) {
                const ev = validate();
                setErrors(ev);
              }
            }}
            onBlur={() => handleBlur("email")}
            disabled={loginMutation.isPending || googleLoginMutation.isPending}
            placeholder="name@example.com"
            autoComplete="email"
            aria-invalid={Boolean(touched.email && errors.email)}
            aria-describedby={
              touched.email && errors.email ? "login-email-err" : undefined
            }
            className={`g-input ${touched.email && errors.email ? "g-input-err" : ""}`}
          />
          {touched.email && errors.email && (
            <p id="login-email-err" className="g-field-err" role="alert">
              <span className="g-sq g-sq-red" aria-hidden="true"></span>
              {errors.email}
            </p>
          )}
        </div>

        <div className="g-field">
          <div className="auth-row">
            <label htmlFor="login-password" className="g-flabel">
              Password
            </label>
            <Link to="/forgot-password" className="auth-link auth-link-sm">
              Forgot password?
            </Link>
          </div>
          <div className="auth-control">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  const ev = validate();
                  setErrors(ev);
                }
              }}
              onBlur={() => handleBlur("password")}
              disabled={loginMutation.isPending || googleLoginMutation.isPending}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={Boolean(touched.password && errors.password)}
              aria-describedby={
                touched.password && errors.password
                  ? "login-password-err"
                  : undefined
              }
              className={`g-input ${touched.password && errors.password ? "g-input-err" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="auth-eye"
            >
              {showPassword ? (
                <LuEyeOff className="w-4 h-4" aria-hidden />
              ) : (
                <LuEye className="w-4 h-4" aria-hidden />
              )}
            </button>
          </div>
          {touched.password && errors.password && (
            <p id="login-password-err" className="g-field-err" role="alert">
              <span className="g-sq g-sq-red" aria-hidden="true"></span>
              {errors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          className="auth-submit"
          disabled={loginMutation.isPending || googleLoginMutation.isPending}
        >
          {loginMutation.isPending && (
            <LuLoaderCircle className="animate-spin w-4 h-4" aria-hidden />
          )}
          {loginMutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="auth-or">or</div>

      <button
        type="button"
        onClick={() => loginWithGoogle()}
        disabled={googleLoginMutation.isPending || loginMutation.isPending}
        className="auth-social"
      >
        {googleLoginMutation.isPending ? (
          <LuLoaderCircle className="animate-spin w-4 h-4" aria-hidden />
        ) : (
          <GoogleIcon />
        )}
        {googleLoginMutation.isPending
          ? "Connecting…"
          : "Continue with Google"}
      </button>

      <p className="auth-switch">
        New to short.link?
        <Link to="/signup" className="auth-link">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
};

export default Login;
