import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation } from "@tanstack/react-query";
import { createLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";

const features = [
  {
    icon: (
      <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Lightning Fast",
    description: "Experience incredibly fast redirects and a snappy interface built for speed and efficiency.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Detailed Analytics",
    description: "Track engagement in real-time. Monitor clicks, geographic data, and referrers to optimize your campaigns.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    title: "Always Up",
    description: "Built on reliable infrastructure so your links work perfectly 24/7 without interruption.",
  },
];

const stats = [
  { label: "99.9% Uptime" },
  { label: "Instant Redirects" },
  { label: "Detailed Analytics" },
  { label: "Free Forever" },
];

const Home = () => {
  const token = useAuthToken();
  const isAuthenticated = token ? true : false;
  const toast = useToast();
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: createLink,
    onSuccess: (res) => {
      const link = res.data?.link;
      setCreatedLink(link);
      toast.success("Link shortened!", "Your short link is ready to use.");
    },
    onError: (err) => {
      toast.error(
        "Failed to shorten",
        err.response?.data?.message || "Please check your URL and try again.",
      );
    },
  });

  const handleSubmit = (formData) => {
    const data = Object.fromEntries(formData);
    mutation.mutate(data);
  };

  const handleCopy = async () => {
    if (!createdLink?.short_code) return;
    try {
      await navigator.clipboard.writeText(
        import.meta.env.VITE_API_BASE_URL + "/" + createdLink.short_code
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", "Could not copy to clipboard.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-1 bg-[#fafafa] text-gray-900 font-sans"
    >
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
                     bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_70%,transparent_100%)]"
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* Decorative emerald squares */}
          <div className="absolute top-16 right-16 w-2 h-2 bg-[#10b981] opacity-20 hidden sm:block" />
          <div className="absolute top-20 right-20 w-4 h-4 bg-[#10b981] opacity-10 hidden sm:block" />
          <div className="absolute bottom-24 left-12 w-3 h-3 bg-[#10b981] opacity-15 hidden md:block" />

          <div className="text-center max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-6"
            >
              URL Shortener
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 24 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[0.95] mb-6">
              Simplify your
              <br />
              <span className="relative inline-block">
                links.
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[#10b981]/15 -z-0 rounded-none" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 24 }}
              className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed"
            >
              Paste your long URL below and we&rsquo;ll make it short, trackable,
              and ready to share in seconds.
            </motion.p>
          </div>

          {/* ── URL Input ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 24 }}
            className="mt-12 max-w-2xl mx-auto px-4 sm:px-0">
            <form
              action={handleSubmit}
              className="relative"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    className={`w-full bg-white border-2 text-gray-900 placeholder-gray-400 text-base px-5 py-4 outline-none transition-all duration-200
                      ${
                        mutation.isPending
                          ? "border-[#10b981]/40 bg-[#10b981]/5"
                          : "border-gray-200 focus:border-[#10b981]"
                      }
                      ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
                    placeholder={
                      isAuthenticated
                        ? "https://example.com/your-very-long-url"
                        : "Please log in to shorten URLs"
                    }
                    disabled={!isAuthenticated || mutation.isPending}
                    name="url"
                    autoComplete="url"
                  />
                </div>
                <Button
                  size="large"
                  className={`w-full sm:w-auto !px-8 transition-all duration-200 ${
                    !isAuthenticated || mutation.isPending
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!isAuthenticated || mutation.isPending}
                  type="submit"
                  tooltip={
                    !isAuthenticated
                      ? "Please log in to shorten URLs"
                      : "Shorten your URL"
                  }
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
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
                      Shortening&hellip;
                    </span>
                  ) : (
                    "Shorten"
                  )}
                </Button>
              </div>
            </form>

            <p className="text-center text-xs sm:text-sm text-gray-400 mt-4">
              Free account &middot; Instant redirects
            </p>

            {/* ── Inline Result ── */}
            {createdLink && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="mt-6 bg-white border-2 border-[#10b981]/30 p-5 text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[#10b981]/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Your link is ready!</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-3">
                  <span className="text-sm font-mono text-gray-900 truncate flex-1">
                    {import.meta.env.VITE_API_BASE_URL}/{createdLink.short_code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setCreatedLink(null)}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  + Shorten another URL
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#10b981] shrink-0" />
                <span className="text-sm text-gray-500 whitespace-nowrap">{stat.label}</span>
                {i < stats.length - 1 && (
                  <span className="hidden sm:block w-px h-4 bg-gray-200 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-[#10b981]" />
            <span className="w-2 h-2 bg-[#10b981]/60" />
            <span className="w-2 h-2 bg-[#10b981]/20" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Built for speed and clarity
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Everything you need from a link shortener, nothing you don&rsquo;t.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group hover:-translate-y-0.5 hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-11 h-11 bg-[#10b981]/10 mb-5 transition-colors duration-200 group-hover:bg-[#10b981]/20">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA Section (unauthenticated only) ── */}
      {!isAuthenticated && (
        <section className="border-t border-gray-200 bg-white relative overflow-hidden">
          {/* Subtle decorative squares */}
          <div className="absolute top-8 left-12 w-2 h-2 bg-[#10b981]/15 hidden sm:block" />
          <div className="absolute bottom-8 right-12 w-3 h-3 bg-[#10b981]/10 hidden sm:block" />

          <div className="relative max-w-3xl mx-auto px-6 py-20 sm:py-24 text-center">
            <div className="flex justify-center mb-6">
              <div className="grid grid-cols-2 gap-1">
                <span className="w-2 h-2 bg-[#10b981]" />
                <span className="w-2 h-2 bg-[#10b981]/60" />
                <span className="w-2 h-2 bg-[#10b981]/60" />
                <span className="w-2 h-2 bg-[#10b981]" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Ready to simplify your links?
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Create a free account to unlock analytics, custom slugs, and more.
            </p>

            <Button
              as={Link}
              to="/signup"
              variant="primary"
              size="large"
              className="!px-10 group"
            >
              Create Free Account
              <svg
                className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Button>

            <p className="text-xs text-gray-400 mt-4">
              No credit card required &middot; Free forever
            </p>
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default Home;
