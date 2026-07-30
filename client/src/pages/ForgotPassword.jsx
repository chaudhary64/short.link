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
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 relative overflow-hidden bg-slate-50"
    >
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 350, damping: 28 }}
        className="relative z-10 w-full max-w-[420px] mx-auto bg-white p-6 sm:p-10 sm:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] sm:border sm:border-gray-200/60"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.25 }}
          className="mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-1">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500">
            Enter your email to receive a password reset link.
          </p>
        </motion.div>

        {!isSubmitted ? (
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                required
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={forgotPasswordMutation.isPending}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 bg-white placeholder-gray-400 transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full mt-2 py-2.5 flex items-center justify-center gap-2"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              If an account with <span className="font-semibold text-gray-900">{submittedEmail}</span> exists, we've sent a password reset link to it. Please check your inbox.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
            >
              Try another email
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-bold text-gray-900 hover:underline focus:outline-none"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;
