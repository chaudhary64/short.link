import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import { LoginUser, GoogleLoginUser } from "../api/auth";
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

  const loginMutation = useMutation({
    mutationFn: LoginUser,
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken);
      setUserInfo(data.user);
      toast.success("Welcome back!", "You have successfully logged in.");
      navigate("/");
    },
    onError: (err) => {
      if (err.response?.status === 403) {
        toast.info(
          "Verify your email",
          "Please verify your email to continue — you can resend the code if needed.",
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
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken);
      setUserInfo(data.user);
      toast.success("Welcome!", "You have successfully logged in with Google.");
      navigate("/");
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="g-auth-wrap"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        className="g-auth-card"
      >
        <span className="g-mark" aria-hidden="true"></span>

        <div className="mb-7">
          <p className="g-auth-kicker">Account Access</p>
          <h1 className="g-auth-title">Welcome Back</h1>
          <p className="g-auth-sub">Log in to your account to continue.</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => loginWithGoogle()}
            disabled={googleLoginMutation.isPending || loginMutation.isPending}
            className="g-btn g-btn-line w-full justify-center"
          >
            {googleLoginMutation.isPending ? (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoginMutation.isPending
              ? "Connecting…"
              : "Continue with Google"}
          </button>
        </div>

        <div className="g-auth-sep">Or email &amp; password</div>

        <form action={handleSubmit} className="g-form gap-4">
          <div className="g-field">
            <label htmlFor="login-email" className="g-flabel">
              Email Address
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
              disabled={
                loginMutation.isPending || googleLoginMutation.isPending
              }
              placeholder="name@example.com"
              className={`g-input ${touched.email && errors.email ? "g-input-err" : ""}`}
            />
            {touched.email && errors.email && (
              <p className="g-field-err">
                <span className="g-sq g-sq-red" aria-hidden="true"></span>
                {errors.email}
              </p>
            )}
          </div>

          <div className="g-field">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="g-flabel">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="g-auth-link"
                style={{ fontSize: "9.5px" }}
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
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
                disabled={
                  loginMutation.isPending || googleLoginMutation.isPending
                }
                placeholder="••••••••"
                className={`g-input pr-8 ${touched.password && errors.password ? "g-input-err" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--g-muted)] hover:text-[var(--g-ink)] transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="g-field-err">
                <span className="g-sq g-sq-red" aria-hidden="true"></span>
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full justify-center mt-4"
            disabled={loginMutation.isPending || googleLoginMutation.isPending}
          >
            {loginMutation.isPending && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loginMutation.isPending ? "Signing In…" : "Sign In"}
          </Button>
        </form>

        <p className="g-auth-switch">
          Don&apos;t have an account?
          <Link to="/signup" className="g-auth-link">
            Sign up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
