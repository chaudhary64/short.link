import { Link } from "react-router";
import { motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { LuCheck, LuLoaderCircle } from "react-icons/lu";
import Button from "../components/ui/Button";
import { ForgotPasswordUser } from "../api/auth";
import { useToast } from "../features/toast/useToast.jsx";
import { useState } from "react";

const ForgotPassword = () => {
  const toast = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: ForgotPasswordUser,
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success(
        "Link Sent!",
        "If an account exists, a reset link has been sent to your email — check your spam folder if you don't see it.",
      );
    },
    onError: (err) => {
      toast.error(
        "Error",
        err.response?.data?.message ||
          "An error occurred while sending the reset link.",
      );
    },
  });

  const handleSubmit = (formData) => {
    const data = Object.fromEntries(formData);
    setSubmittedEmail(data.email);
    forgotPasswordMutation.mutate(data);
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
        <p className="auth-kicker">Password recovery</p>
        <h1 className="auth-title">
          {isSubmitted ? "Check your inbox" : "Reset your password"}
        </h1>
        <p className="auth-sub">
          {isSubmitted
            ? "The reset link works once and expires shortly."
            : "Enter the email on your account and we'll send a reset link."}
        </p>
      </header>

      {!isSubmitted ? (
        <form action={handleSubmit} className="auth-form">
          <div className="g-field">
            <label htmlFor="forgot-email" className="g-flabel">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={forgotPasswordMutation.isPending}
              placeholder="name@example.com"
              autoComplete="email"
              className="g-input"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            className="auth-submit"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending && (
              <LuLoaderCircle className="animate-spin w-4 h-4" aria-hidden />
            )}
            {forgotPasswordMutation.isPending
              ? "Sending…"
              : "Send reset link"}
          </Button>
        </form>
      ) : (
        <div className="auth-done">
          <span className="auth-done-mark">
            <LuCheck className="w-5 h-5" aria-hidden />
          </span>
          <p className="auth-sub">
            If an account with{" "}
            <strong className="auth-strong">{submittedEmail}</strong> exists,
            we&apos;ve sent a password reset link to it. Check your inbox — and
            your spam folder.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="auth-submit"
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
          >
            Try another email
          </Button>
        </div>
      )}

      <p className="auth-switch">
        Remember your password?
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};

export default ForgotPassword;
