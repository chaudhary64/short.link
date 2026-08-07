import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { motion } from "motion/react";
import PasswordStrength from "../components/ui/PasswordStrength";
import { SignUpUser, GoogleLoginUser } from "../api/auth";
import { convertGuestLink } from "../api/links";
import Button from "../components/ui/Button";
import { useMutation } from "@tanstack/react-query";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useUserActions } from "../features/user/useUserActions";
import { useToast } from "../features/toast/useToast.jsx";
import { useGoogleLogin } from "@react-oauth/google";

const EyeIcon = () => (
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
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
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
    />
  </svg>
);

const Signup = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuthActions();
  const { setUserInfo } = useUserActions();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");

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

  const signupMutation = useMutation({
    mutationFn: SignUpUser,
    onSuccess: () => {
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    },
    onError: (err) => {
      toast.error(
        "Signup failed",
        err.response?.data?.message ||
          "Please check your details and try again.",
      );
    },
  });

  const googleSignupMutation = useMutation({
    mutationFn: GoogleLoginUser,
    onSuccess: async ({ data }) => {
      toast.success("Welcome!", "You have successfully signed in with Google.");
      setAccessToken(data.accessToken);
      setUserInfo(data.user);

      await tryConvertGuestLink();

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
      googleSignupMutation.mutate({ token: tokenResponse.access_token });
    },
    onError: () => {
      toast.error(
        "Google Login Failed",
        "Could not complete the login process.",
      );
    },
  });

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      toast.warning(
        "Passwords mismatch",
        "Please make sure your passwords match.",
      );
      return;
    }
    if (password.length < 8) {
      toast.warning(
        "Password too short",
        "Password must be at least 8 characters.",
      );
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation.mutate({
      name,
      email,
      password,
      gender: gender || "unknown",
    });
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
          <p className="g-auth-kicker">Account Creation</p>
          <h1 className="g-auth-title">Create Account</h1>
          <p className="g-auth-sub">
            Get started for free. No credit card required.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => loginWithGoogle()}
            disabled={
              googleSignupMutation.isPending || signupMutation.isPending
            }
            className="g-btn g-btn-line w-full justify-center"
          >
            {googleSignupMutation.isPending ? (
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
            {googleSignupMutation.isPending
              ? "Connecting…"
              : "Continue with Google"}
          </button>
        </div>

        <div className="g-auth-sep">Or with email</div>

        {}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="g-form gap-4">
            <div className="g-field">
              <label htmlFor="signup-email" className="g-flabel">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={
                  signupMutation.isPending || googleSignupMutation.isPending
                }
                placeholder="name@example.com"
                className="g-input"
              />
            </div>

            <div className="g-field">
              <label htmlFor="signup-password" className="g-flabel">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={
                    signupMutation.isPending || googleSignupMutation.isPending
                  }
                  placeholder="Create a strong password"
                  className="g-input pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--g-muted)] hover:text-[var(--g-ink)] transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="g-field">
              <label htmlFor="signup-confirm" className="g-flabel">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={
                    signupMutation.isPending || googleSignupMutation.isPending
                  }
                  placeholder="Confirm your password"
                  className="g-input pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--g-muted)] hover:text-[var(--g-ink)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full justify-center mt-4"
              disabled={
                signupMutation.isPending || googleSignupMutation.isPending
              }
            >
              Next
            </Button>
          </form>
        )}

        {}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="g-form gap-4">
            <div className="g-field">
              <label htmlFor="signup-name" className="g-flabel">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={
                  signupMutation.isPending || googleSignupMutation.isPending
                }
                placeholder="Alex Doe"
                className="g-input"
              />
            </div>

            <div className="g-field">
              <label htmlFor="signup-gender" className="g-flabel">
                Gender (Optional)
              </label>
              <select
                id="signup-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={
                  signupMutation.isPending || googleSignupMutation.isPending
                }
                className="g-input appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select your gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="unknown">Prefer not to say</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="secondary"
                size="large"
                className="w-1/3 justify-center"
                onClick={handleBack}
                disabled={
                  signupMutation.isPending || googleSignupMutation.isPending
                }
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-2/3 justify-center"
                disabled={
                  signupMutation.isPending || googleSignupMutation.isPending
                }
              >
                {signupMutation.isPending && (
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
                {signupMutation.isPending ? "Sending code…" : "Create Account"}
              </Button>
            </div>
          </form>
        )}

        <p className="g-auth-switch">
          Already have an account?
          <Link to="/login" className="g-auth-link">
            Log in
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
