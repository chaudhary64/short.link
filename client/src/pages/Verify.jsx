import { Link, useNavigate, useSearchParams, Navigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { LuLoaderCircle, LuRotateCw } from "react-icons/lu";
import Button from "../components/ui/Button";
import { VerifyOtp, resendVerificationCode } from "../api/auth";
import { convertGuestLink } from "../api/links";
import { useMutation } from "@tanstack/react-query";
import { useAuthActions } from "../features/auth/useAuthActions";
import { useUserActions } from "../features/user/useUserActions";
import { useToast } from "../features/toast/useToast.jsx";

const OTP_LENGTH = 6;

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = (searchParams.get("email") || "").trim();

  const { setAccessToken } = useAuthActions();
  const { setUserInfo } = useUserActions();
  const toast = useToast();

  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);
  const [isConvertingLink, setIsConvertingLink] = useState(false);

  useEffect(() => {
    otpRefs.current[0]?.focus();
  }, []);

  const tryConvertGuestLink = async () => {
    try {
      const guestDataRaw = localStorage.getItem("guest_link");
      if (!guestDataRaw) return;

      setIsConvertingLink(true);
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
    } finally {
      setIsConvertingLink(false);
    }
  };

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
      toast.error(
        "Verification failed",
        err.response?.data?.message || "Invalid or expired code.",
      );
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerificationCode,
    onSuccess: () => {
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      toast.info(
        "Code resent",
        "A new verification code has been sent to your email — check your spam folder if you don't see it.",
      );
      otpRefs.current[0]?.focus();
    },
    onError: (err) => {
      if (/already verified/i.test(err.response?.data?.message || "")) {
        toast.info(
          "Already verified",
          "Your email is verified — please log in.",
        );
        navigate("/login");
        return;
      }
      toast.error(
        "Resend failed",
        err.response?.data?.message ||
          "Could not resend the code. Please try again.",
      );
    },
  });

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
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
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otpDigits];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
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
    resendMutation.mutate({ email });
  };

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  const busy =
    verifyOtpMutation.isPending || isConvertingLink || resendMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="auth-card"
    >
      <header className="auth-head">
        <p className="auth-kicker">Email verification</p>
        <h1 className="auth-title">Check your email</h1>
        <p className="auth-sub">
          We sent a six-digit code to{" "}
          <strong className="auth-strong">{email}</strong>.
        </p>
      </header>

      <form onSubmit={handleVerifyOtp} className="auth-form">
        <div className="auth-otp" onPaste={handleOtpPaste}>
          {otpDigits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (otpRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              disabled={busy}
              aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
              className="g-otp"
            />
          ))}
        </div>

        <p className="auth-note">
          The code expires in 10 minutes. Check your spam folder if it
          hasn&apos;t arrived.
        </p>

        <Button
          type="submit"
          variant="primary"
          size="large"
          className="auth-submit"
          disabled={busy}
        >
          {verifyOtpMutation.isPending && (
            <LuLoaderCircle className="animate-spin w-4 h-4" aria-hidden />
          )}
          {verifyOtpMutation.isPending ? "Verifying…" : "Verify account"}
        </Button>
      </form>

      <div className="auth-or">or</div>

      <button
        type="button"
        onClick={handleResendOtp}
        disabled={busy}
        className="auth-social"
      >
        {resendMutation.isPending ? (
          <LuLoaderCircle className="animate-spin w-4 h-4" aria-hidden />
        ) : (
          <LuRotateCw className="w-4 h-4" aria-hidden />
        )}
        {resendMutation.isPending ? "Sending…" : "Send a new code"}
      </button>

      <p className="auth-switch">
        Wrong email?
        <Link to="/signup" className="auth-link">
          Start over
        </Link>
      </p>
    </motion.div>
  );
};

export default Verify;
