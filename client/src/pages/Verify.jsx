import { Link, useNavigate, useSearchParams, Navigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
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
          <p className="g-auth-kicker">Email Verification</p>
          <h1 className="g-auth-title">Verify Your Email</h1>
          <p className="g-auth-sub">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-[var(--g-ink)]">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="flex flex-col items-center">
          <div
            className="flex gap-2 mb-2 w-full justify-center"
            onPaste={handleOtpPaste}
          >
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
                disabled={
                  verifyOtpMutation.isPending ||
                  isConvertingLink ||
                  resendMutation.isPending
                }
                aria-label={`Digit ${i + 1}`}
                className="g-otp"
              />
            ))}
          </div>

          <p
            className="g-auth-sub mb-2"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Code expires in 10 minutes
          </p>

          <p className="text-xs text-[#8a8578] mb-6 text-center">
            Didn&apos;t receive it? Check your spam folder.
          </p>

          <Button
            type="submit"
            variant="primary"
            size="large"
            className="w-full justify-center mb-3"
            disabled={
              verifyOtpMutation.isPending ||
              isConvertingLink ||
              otpDigits.join("").length < OTP_LENGTH
            }
          >
            {verifyOtpMutation.isPending && (
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {verifyOtpMutation.isPending ? "Verifying…" : "Verify Account"}
          </Button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendMutation.isPending || verifyOtpMutation.isPending}
            className="g-auth-link disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resendMutation.isPending
              ? "Sending…"
              : "Didn't receive it? Resend code"}
          </button>
        </form>

        <p className="g-auth-switch">
          Wrong email?
          <Link to="/signup" className="g-auth-link">
            Go back to sign up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Verify;
