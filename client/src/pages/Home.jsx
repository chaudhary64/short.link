import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Button from "../components/ui/Button";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation } from "@tanstack/react-query";
import { createLink, createGuestLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";

const faqData = [
  {
    question: "What is a URL shortener and how does it work?",
    answer:
      "A URL shortener takes a long web address and creates a compact, shareable link. When someone clicks your short link, they get instantly redirected to the original URL — all in milliseconds. It's that simple.",
  },
  {
    question: "Is short.link free to use?",
    answer:
      "Yes! short.link is completely free forever. There are no hidden charges, no credit card required, and no usage limits on link creation. We believe link management should be accessible to everyone.",
  },
  {
    question: "Can I track clicks and analytics on my links?",
    answer:
      "Absolutely. Every link you create comes with built-in analytics. You can track total clicks, referrer sources, and geographic data to understand your audience and optimize your campaigns effectively.",
  },
  {
    question: "How long do my shortened links stay active?",
    answer:
      "Your links stay active indefinitely as long as your account remains active. There are no expiration dates or inactivity timeouts. You're in full control — you can enable, disable, or delete any link at any time. (Guest links created without an account expire after 24 hours — sign up to keep them forever.)",
  },
  {
    question: "Can I customize my shortened URLs?",
    answer:
      "Yes! When you create a link, you can set a custom short code instead of using a random one. This makes your links brand-friendly and memorable — perfect for marketing campaigns, social media bios, and printed materials.",
  },
  {
    question: "How do I manage or delete my links?",
    answer:
      "Your dashboard gives you full control over every link you've created. From there you can edit the destination URL, toggle a link on or off, copy the short code, or permanently delete links you no longer need.",
  },
];

const capabilities = [
  {
    title: "Redirects in milliseconds",
    description:
      "Every visitor lands on their destination before they finish blinking. No delays, no redirect chains, no friction — just a single, instant hop from link to content.",
  },
  {
    title: "Insights that matter",
    description:
      "See which links perform, where your traffic originates, and what your audience engages with. Clean, readable analytics that inform your next move.",
  },
  {
    title: "Full control, always",
    description:
      "Edit destinations, disable broken links, or delete old ones from a single dashboard. Your links stay yours — managed exactly the way you want.",
  },
];

const Home = () => {
  const token = useAuthToken();
  const isAuthenticated = token ? true : false;
  const toast = useToast();
  const [createdLink, setCreatedLink] = useState(null);
  const [createdLinkIsGuest, setCreatedLinkIsGuest] = useState(false);
  const [alreadyHadLink, setAlreadyHadLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!faqRef.current) return;
      const faqTop = faqRef.current.getBoundingClientRect().top;
      setShowBackToTop(faqTop < window.innerHeight * -0.5);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isAuthenticated) {
        return createLink(data);
      }
      return createGuestLink(data);
    },
    onSuccess: (res) => {
      const link = res.data?.link;
      const isGuest = res.data?.link?.guest === true;
      setCreatedLink(link);
      setCreatedLinkIsGuest(isGuest);
      setAlreadyHadLink(res.data?.alreadyExists === true);

      if (isGuest) {
        // Store guest data in localStorage so it can be picked up on signup
        try {
          localStorage.setItem(
            "guest_link",
            JSON.stringify({
              short_code: link.short_code,
              fingerprint: res.data?.fingerprint,
            }),
          );
        } catch {
          // localStorage unavailable — non-critical
        }

        if (res.data?.alreadyExists) {
          toast.info(
            "Already have a guest link",
            "You can only create one. Create a free account for unlimited links.",
          );
        } else {
          toast.success(
            "Link shortened!",
            "Your link is ready — it expires in 24 hours.",
          );
        }
      } else {
        toast.success("Link shortened!", "Your short link is ready to use.");
      }
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
    setCreatedLink(null);
    setCreatedLinkIsGuest(false);
    setAlreadyHadLink(false);
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
      className="flex-1 bg-[#fafafa] text-gray-900 font-sans relative overflow-hidden"
    >
      {/* ── Global Grid Pattern ── */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
                   bg-[size:5px_5px] pointer-events-none [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_70%,transparent_100%)]"
      />

      {/* ── Hero Section ── */}
      <section className="relative">
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
                      }`}
                    placeholder="https://example.com/your-very-long-url"
                    disabled={mutation.isPending}
                    name="url"
                    autoComplete="url"
                  />
                </div>
                <Button
                  size="large"
                  className={`w-full sm:w-auto !px-8 transition-all duration-200 ${
                    mutation.isPending ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={mutation.isPending}
                  type="submit"
                  tooltip="Shorten your URL"
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
              {isAuthenticated
                ? "Free account &middot; Instant redirects"
                : "Free to try &middot; Links expire in 24 hours &middot; "}
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="text-[#10b981] font-medium hover:underline transition-all duration-200"
                >
                  Sign up for permanent links
                </Link>
              )}
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

                {/* Guest link notices */}
                {createdLinkIsGuest && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Expires in 24 hours
                    </span>
                    {!alreadyHadLink && (
                      <Link
                        to="/signup"
                        className="inline-flex items-center gap-1 text-xs text-[#10b981] font-medium hover:underline transition-all duration-200"
                      >
                        Create account for permanent links
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}

                {alreadyHadLink && (
                  <p className="text-xs text-gray-400 mb-3">
                    You can only create one guest link.{" "}
                    <Link
                      to="/signup"
                      className="text-[#10b981] font-medium hover:underline transition-all duration-200"
                    >
                      Sign up for unlimited links
                    </Link>
                    .
                  </p>
                )}

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

                {/* Guest CTA */}
                {createdLinkIsGuest && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">
                      Want analytics, custom slugs, and permanent links?
                    </p>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10b981] hover:text-[#059669] transition-colors duration-200"
                    >
                      Create a free account
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => {
                    setCreatedLink(null);
                    setCreatedLinkIsGuest(false);
                    setAlreadyHadLink(false);
                    // Don't clear localStorage — the guest link data stays so
                    // signup can still pick it up. It will be cleared after conversion.
                  }}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  + Shorten another URL
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 bg-[#10b981] shrink-0" />
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-400">
              How we think about links
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6">
            A link is just a link.
            <br />
            <span className="text-gray-300">How you use it</span>
            <br />
            makes all the difference.
          </h2>

          <div className="w-12 h-px bg-[#10b981]/40 mt-8 mb-8" />

          <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl">
            We built short.link to do one thing, exceptionally well. No bloated
            dashboards, no pricing tiers, no features you&rsquo;ll never use. Just
            fast, reliable links that work everywhere.
          </p>
        </motion.div>
      </section>

      {/* ── Capabilities ── */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {capabilities.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-500 ease-out"
              >
                <span className="block text-5xl font-bold text-gray-200 mb-4 leading-none select-none transition-colors duration-300 group-hover:text-[#10b981]/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-gray-700">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section ref={faqRef}>
        <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-2 h-2 bg-[#10b981]" />
              <span className="w-2 h-2 bg-[#10b981]/60" />
              <span className="w-2 h-2 bg-[#10b981]/20" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Frequently asked questions
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Everything you need to know about short.link, answered.
            </p>
          </motion.div>

          <div className="divide-y divide-gray-100">
            {faqData.map((item, index) => {
              const isOpen = openFaq === index;
              const faqId = `faq-${index}`;
              const contentId = `faq-content-${index}`;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="group"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    id={faqId}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    className="faq-ripple w-full flex items-start justify-between gap-3 py-4 sm:py-5 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-50/50 mx-auto px-4"
                  >
                    <span className="text-base sm:text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[#10b981]">
                      Q{index + 1}) {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        id={contentId}
                        role="region"
                        aria-labelledby={faqId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 mx-auto px-4">
                          <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          
        </div>
      </section>

      {/* ── CTA Section (unauthenticated only) ── */}
      {!isAuthenticated && (
        <section className="relative overflow-hidden">
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

      {/* ── Back to Top ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center bg-gray-900 text-white shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer sm:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
