import { Link, useNavigate, useSearchParams, Navigate } from "react-router";
import { useState, useRef } from "react";
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

  // Convert the guest link after successful verification
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
        "A new verification code has been sent to your email.",
      );
      otpRefs.current[0]?.focus();
    },
    onError: (err) => {
      // Account already verified (e.g. verified in another tab) — the code
      // flow is done, so send the user to log in instead of a dead end.
      if (/already verified/i.test(err.response?.data?.message || "")) {
        toast.info("Already verified", "Your email is verified — please log in.");
        navigate("/login");
        return;
      }
      toast.error(
        "Resend failed",
        err.response?.data?.message || "Could not resend the code. Please try again.",
      );
    },
  });

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

  // No email in the URL (e.g. someone landed here directly) — send them back
  // to sign up so the flow can restart.
  if (!email) {
    return <Navigate to="/signup" replace />;
  }

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
          className="mb-6"
        >
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-1">
            Verify your email
          </h2>
          <p className="text-sm text-gray-500">
            Enter the code we emailed you to activate your account.
          </p>
        </motion.div>

        <form onSubmit={handleVerifyOtp} className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-5">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">
            Check your inbox
          </h3>
          <p className="text-sm text-gray-500 text-center mb-1">
            We sent a 6-digit code to
          </p>
          <p className="text-sm font-semibold text-gray-900 text-center mb-6 break-all">
            {email}
          </p>

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
                disabled={verifyOtpMutation.isPending || isConvertingLink || resendMutation.isPending}
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
            disabled={
              verifyOtpMutation.isPending ||
              isConvertingLink ||
              otpDigits.join("").length < OTP_LENGTH
            }
          >
            {verifyOtpMutation.isPending && (
              <svg
                className="animate-spin h-4 w-4 text-white"
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
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify Account"}
          </Button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendMutation.isPending || verifyOtpMutation.isPending}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resendMutation.isPending
              ? "Sending..."
              : "Didn't receive it? Resend code"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Wrong email?{" "}
          <Link
            to="/signup"
            className="font-bold text-gray-900 hover:underline focus:outline-none"
          >
            Go back to sign up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Verify;
