import { Link, useNavigate } from "react-router";
import { useState, useRef } from "react";
import { motion } from "motion/react";
import PasswordStrength from "../components/ui/PasswordStrength";
import { SignUpUser, GoogleLoginUser, VerifyOtp } from "../api/auth";
import { convertGuestLink } from "../api/links";
import Button from "../components/ui/Button";
import { useMutation } from "@tanstack/react-query";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useUserActions } from "../features/user/useUserActions";
import { useToast } from "../features/toast/useToast.jsx";
import { useGoogleLogin } from "@react-oauth/google";

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const OTP_LENGTH = 6;

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
  const [isConvertingLink, setIsConvertingLink] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);

  // Shared: try to convert a guest link after successful authentication
  const tryConvertGuestLink = async () => {
    try {
      const guestDataRaw = localStorage.getItem("guest_link");
      if (!guestDataRaw) return;

      setIsConvertingLink(true);
      const { short_code, fingerprint } = JSON.parse(guestDataRaw);
      if (short_code && fingerprint) {
        await convertGuestLink({ shortCode: short_code, fingerprint });
        toast.success(
          "Link converted!",
          "Your temporary link is now permanent. See it in your dashboard.",
        );
      }
    } catch {
      toast.info(
        "Guest link expired",
        "Your temporary link has expired. Create a new one from the dashboard.",
      );
    } finally {
      setIsConvertingLink(false);
      localStorage.removeItem("guest_link");
    }
  };

  const signupMutation = useMutation({
    mutationFn: SignUpUser,
    onSuccess: () => {
      setStep(3);
    },
    onError: (err) => {
      toast.error("Signup failed", err.response?.data?.message || "Please check your details and try again.");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: VerifyOtp,
    onSuccess: async ({ data }) => {
      toast.success("Welcome!", "Your account has been verified.");
      setAccessToken(data.accessToken);
      setUserInfo(data.user);

      await tryConvertGuestLink();

      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error("Verification failed", err.response?.data?.message || "Invalid or expired code.");
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
      toast.error("Google Login failed", err.response?.data?.message || "An error occurred during Google Login.");
    }
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleSignupMutation.mutate({ token: tokenResponse.access_token });
    },
    onError: () => {
      toast.error("Google Login Failed", "Could not complete the login process.");
    }
  });

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      toast.warning("Passwords mismatch", "Please make sure your passwords match.");
      return;
    }
    if (password.length < 8) {
      toast.warning("Password too short", "Password must be at least 8 characters.");
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation.mutate({ name, email, password, gender: gender || "unknown" });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otpDigits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length < OTP_LENGTH) {
      toast.warning("Incomplete code", "Please enter all 6 digits.");
      return;
    }
    verifyOtpMutation.mutate({ email, otp });
  };

  const handleResendOtp = () => {
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    signupMutation.mutate({ name, email, password, gender: gender || "unknown" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 relative overflow-hidden"
    >

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 350, damping: 28 }}
        className="relative z-10 w-full max-w-[420px] mx-auto bg-white/70 backdrop-blur-xl p-6 sm:p-10 sm:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] sm:border sm:border-gray-200/60"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.25 }}
          className="mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-1">
            Create an account
          </h2>
          <p className="text-sm text-gray-500">
            Get started for free. No credit card required.
          </p>
        </motion.div>

        {step !== 3 && (
          <>
            <div className="flex flex-col gap-2 mb-6">
              <button
                onClick={() => loginWithGoogle()}
                disabled={googleSignupMutation.isPending || signupMutation.isPending}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {googleSignupMutation.isPending ? (
                  <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {googleSignupMutation.isPending ? "Connecting..." : "Continue with Google"}
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                Or with email
              </span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
          </>
        )}

        {/* Step 1 — Email & Password */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={signupMutation.isPending || googleSignupMutation.isPending}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={signupMutation.isPending || googleSignupMutation.isPending}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={signupMutation.isPending || googleSignupMutation.isPending}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full mt-2 py-2.5 flex items-center justify-center gap-2"
              disabled={signupMutation.isPending || googleSignupMutation.isPending}
            >
              Next
            </Button>
          </form>
        )}

        {/* Step 2 — Name & Gender */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={signupMutation.isPending || googleSignupMutation.isPending}
                placeholder="Alex Doe"
                className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={signupMutation.isPending || googleSignupMutation.isPending}
                className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto' }}
              >
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="unknown">Prefer not to say</option>
              </select>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="secondary"
                size="large"
                className="w-1/3 py-2.5"
                onClick={handleBack}
                disabled={signupMutation.isPending || googleSignupMutation.isPending}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-2/3 py-2.5 flex items-center justify-center gap-2"
                disabled={signupMutation.isPending || googleSignupMutation.isPending}
              >
                {signupMutation.isPending && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {signupMutation.isPending ? "Sending code..." : "Create Account"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3 — OTP Verification */}
        {step === 3 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Check your inbox</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-semibold text-gray-900 text-center mb-6 break-all">{email}</p>

            <div className="flex gap-2 mb-2 w-full justify-center" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={verifyOtpMutation.isPending || isConvertingLink}
                  className="w-11 h-12 text-center text-xl font-bold border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              ))}
            </div>

            <p className="text-xs text-gray-400 mb-6">Code expires in 10 minutes</p>

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full py-2.5 flex items-center justify-center gap-2 mb-3"
              disabled={verifyOtpMutation.isPending || isConvertingLink || otpDigits.join("").length < OTP_LENGTH}
            >
              {verifyOtpMutation.isPending && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {verifyOtpMutation.isPending ? "Verifying..." : "Verify Account"}
            </Button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={signupMutation.isPending || verifyOtpMutation.isPending}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {signupMutation.isPending ? "Sending..." : "Didn't receive it? Resend code"}
            </button>
          </form>
        )}

        {step !== 3 && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-gray-900 hover:underline focus:outline-none"
            >
              Log in
            </Link>
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Signup;
