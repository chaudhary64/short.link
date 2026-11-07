import { Link, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { LuEye, LuEyeOff, LuLoaderCircle } from "react-icons/lu";
import PasswordStrength from "../components/ui/PasswordStrength";
import { SignUpUser, GoogleLoginUser } from "../api/auth";
import { convertGuestLink } from "../api/links";
import Button from "../components/ui/Button";
import GoogleIcon from "../components/ui/GoogleIcon";
import SearchableSelect from "../components/ui/SearchableSelect";
import { useMutation } from "@tanstack/react-query";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useUserActions } from "../features/user/useUserActions";
import { useToast } from "../features/toast/useToast.jsx";
import { useGoogleLogin } from "@react-oauth/google";

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

  const emailRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    if (step === 1) {
      emailRef.current?.focus();
    } else {
      nameRef.current?.focus();
    }
  }, [step]);

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

  const pending =
    signupMutation.isPending || googleSignupMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="auth-card"
    >
      <header className="auth-head">
        <div className="auth-steps">
          <span className="auth-step" data-on={step === 1} />
          <span className="auth-step" data-on={step === 2} />
          <span>Step {step} of 2</span>
        </div>
        <h1 className="auth-title">
          {step === 1 ? "Create your account" : "Name your account"}
        </h1>
        <p className="auth-sub">
          {step === 1
            ? "Free to use, no credit card. A guest link on this device comes with you."
            : "This is the name attached to the links and reports you create."}
        </p>
      </header>

      {step === 1 && (
        <form onSubmit={handleNextStep} className="auth-form" noValidate>
          <div className="g-field">
            <label htmlFor="signup-email" className="g-flabel">
              Email address
            </label>
            <input
              id="signup-email"
              ref={emailRef}
              type="email"
              required
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              placeholder="name@example.com"
              className="g-input"
            />
          </div>

          <div className="g-field">
            <label htmlFor="signup-password" className="g-flabel">
              Password
            </label>
            <div className="auth-control">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                placeholder="At least 8 characters"
                className="g-input"
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
            <PasswordStrength password={password} />
          </div>

          <div className="g-field">
            <label htmlFor="signup-confirm" className="g-flabel">
              Confirm password
            </label>
            <div className="auth-control">
              <input
                id="signup-confirm"
                type={showConfirmPassword ? "text" : "password"}
                required
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={pending}
                placeholder="Repeat your password"
                className="g-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showConfirmPassword}
                className="auth-eye"
              >
                {showConfirmPassword ? (
                  <LuEyeOff className="w-4 h-4" aria-hidden />
                ) : (
                  <LuEye className="w-4 h-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            className="auth-submit"
            disabled={pending}
          >
            Continue
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="g-field">
            <label htmlFor="signup-name" className="g-flabel">
              Full name
            </label>
            <input
              id="signup-name"
              ref={nameRef}
              type="text"
              required
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              placeholder="Alex Doe"
              className="g-input"
            />
          </div>

          <div className="g-field">
            <SearchableSelect
              label="Gender (optional)"
              value={gender}
              onChange={setGender}
              disabled={pending}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "non-binary", label: "Non-binary" },
                { value: "unknown", label: "Prefer not to say" },
              ]}
              placeholder="Select your gender"
              searchPlaceholder="Search gender…"
              emptyText="No gender matches"
            />
          </div>

          <div className="auth-actions">
            <Button
              type="button"
              variant="secondary"
              size="large"
              onClick={handleBack}
              disabled={pending}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={pending}
            >
              {signupMutation.isPending && (
                <LuLoaderCircle className="animate-spin w-4 h-4" aria-hidden />
              )}
              {signupMutation.isPending ? "Sending code…" : "Create account"}
            </Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <>
          <div className="auth-or">or</div>

          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={pending}
            className="auth-social"
          >
            {googleSignupMutation.isPending ? (
              <LuLoaderCircle className="animate-spin w-4 h-4" aria-hidden />
            ) : (
              <GoogleIcon />
            )}
            {googleSignupMutation.isPending
              ? "Connecting…"
              : "Continue with Google"}
          </button>
        </>
      )}

      <p className="auth-switch">
        Already have an account?
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};

export default Signup;
