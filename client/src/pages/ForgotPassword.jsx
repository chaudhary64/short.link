import { Link } from "react-router";
import { motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
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
      toast.success("Link Sent!", "If an account exists, a reset link has been sent to your email.");
    },
    onError: (err) => {
      toast.error("Error", err.response?.data?.message || "An error occurred while sending the reset link.");
    }
  });

  const handleSubmit = (formData) => {
    const data = Object.fromEntries(formData);
    setSubmittedEmail(data.email);
    forgotPasswordMutation.mutate(data);
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
          <p className="g-auth-kicker">Password Recovery</p>
          <h1 className="g-auth-title">Reset Password</h1>
          <p className="g-auth-sub">Enter your email to receive a password reset link.</p>
        </div>

        {!isSubmitted ? (
          <form action={handleSubmit} className="g-form gap-4">
            <div className="g-field">
              <label htmlFor="forgot-email" className="g-flabel">
                Email Address
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
                className="g-input"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full justify-center mt-4"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {forgotPasswordMutation.isPending ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="text-center pt-2">
            <div className="w-12 h-12 border-2 border-[var(--g-ink)] flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-[var(--g-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="g-auth-sub mb-6 leading-relaxed">
              If an account with <span className="font-semibold text-[var(--g-ink)]">{submittedEmail}</span> exists, we&apos;ve sent a password reset link to it. Please check your inbox.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
            >
              Try Another Email
            </Button>
          </div>
        )}

        <p className="g-auth-switch">
          Remember your password?
          <Link to="/login" className="g-auth-link">Log in</Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;
