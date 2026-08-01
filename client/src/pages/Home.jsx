import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Button from "../components/ui/Button";
import HowItWorks from "../components/landing/HowItWorks";
import AnalyticsPreview from "../components/landing/AnalyticsPreview";
import CoreFeatures from "../components/landing/CoreFeatures";
import ValueProps from "../components/landing/ValueProps";
import WhyShortLink from "../components/landing/WhyShortLink";
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
      "Absolutely. Every link you create comes with built-in analytics. You can track total clicks, unique visitors, and geographic data to understand your audience and optimize your campaigns effectively.",
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

  const location = useLocation();

  // Scroll to an in-page anchor (e.g. the footer's /#faq link)
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

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
        import.meta.env.VITE_API_BASE_URL + "/" + createdLink.short_code,
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
      className="flex-1 text-[#0A0A0A] font-body relative overflow-hidden"
    >
      {/* ── Hero Section ── */}
      <section className="relative">
        <div className="relative mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 300,
                damping: 24,
              }}
              className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9C9C9C] mb-6"
            >
              URL Shortener
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 300,
                damping: 24,
              }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[0.95] mb-6"
            >
              Simplify your
              <br />
              <span className="relative inline-block">
                links.
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[#0A0A0A]/10 z-0" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.25,
                type: "spring",
                stiffness: 300,
                damping: 24,
              }}
              className="text-lg sm:text-xl text-[#6B6B6B] max-w-xl mx-auto leading-relaxed"
            >
              Paste your long URL below and we&rsquo;ll make it short,
              trackable, and ready to share in seconds.
            </motion.p>
          </div>

          {/* ── URL Input ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 24,
            }}
            className="mt-12 max-w-2xl mx-auto px-4 sm:px-0"
          >
            <form action={handleSubmit} className="relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    className={`w-full bg-white border text-[#0A0A0A] placeholder:text-[#9C9C9C] text-base px-4 py-3.5 rounded-md outline-none transition-all duration-200
                      ${
                        mutation.isPending
                          ? "border-[#6366F1]/40 bg-[#6366F1]/5"
                          : "border-[#D4D4D8] focus:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12"
                      }`}
                    placeholder="https://example.com/your-very-long-url"
                    disabled={mutation.isPending}
                    name="url"
                    autoComplete="url"
                  />
                </div>
                <Button
                  size="large"
                  className={`w-full sm:w-auto px-8! transition-all duration-200 ${
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

            <p className="text-center text-xs sm:text-sm text-[#9C9C9C] mt-4">
              {isAuthenticated
                ? "Free account · Instant redirects"
                : "Free to try · Links expire in 24 hours · "}
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="text-[#6366F1] font-medium hover:text-[#4F46E5] transition-colors duration-200"
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
                className="mt-6 bg-white border border-[#10B981]/30 rounded-xl p-5 text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[#10B981]/10 flex items-center justify-center rounded-lg shrink-0">
                    <svg
                      className="w-4 h-4 text-[#10B981]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#0A0A0A]">
                    Your link is ready!
                  </span>
                </div>

                {/* Guest link notices */}
                {createdLinkIsGuest && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs text-[#B45309] font-medium">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Expires in 24 hours
                    </span>
                    {!alreadyHadLink && (
                      <Link
                        to="/signup"
                        className="inline-flex items-center gap-1 text-xs text-[#6366F1] font-medium hover:text-[#4F46E5] transition-colors duration-200"
                      >
                        Create account for permanent links
                        <svg
                          className="w-3 h-3"
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
                      </Link>
                    )}
                  </div>
                )}

                {alreadyHadLink && (
                  <p className="text-xs text-[#9C9C9C] mb-3">
                    You can only create one guest link.{" "}
                    <Link
                      to="/signup"
                      className="text-[#6366F1] font-medium hover:text-[#4F46E5] transition-colors duration-200"
                    >
                      Sign up for unlimited links
                    </Link>
                    .
                  </p>
                )}

                <div className="flex items-center gap-2 bg-[#F6F6F9] border border-[#D4D4D8] rounded-md p-3">
                  <span className="text-sm font-mono text-[#0A0A0A] truncate flex-1">
                    {import.meta.env.VITE_API_BASE_URL}/{createdLink.short_code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 px-3 py-1.5 bg-[#6366F1] text-white text-xs font-medium hover:bg-[#4F46E5] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Guest CTA */}
                {createdLinkIsGuest && (
                  <div className="mt-4 pt-3 border-t border-[#E5E5EA]">
                    <p className="text-xs text-[#9C9C9C] mb-2">
                      Want analytics, custom slugs, and permanent links?
                    </p>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors duration-200"
                    >
                      Create a free account
                      <svg
                        className="w-4 h-4"
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
                  className="mt-3 text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
                >
                  + Shorten another URL
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Value Props ── */}
      <ValueProps />

      <HowItWorks />

      <AnalyticsPreview />

      {/* ── Philosophy ── */}
      <section className="mx-auto px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0" />
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9C9C9C]">
              How we think about links
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[1.05] mb-6">
            A link is just a link.
            <br />
            <span className="text-[#9C9C9C]">How you use it</span>
            <br />
            makes all the difference.
          </h2>

          <div className="w-12 h-px bg-[#D4D4D8] mt-8 mb-8" />

          <p className="text-base sm:text-lg text-[#6B6B6B] leading-relaxed max-w-xl">
            We built short.link to do one thing, exceptionally well. No bloated
            dashboards, no pricing tiers, no features you&rsquo;ll never use.
            Just fast, reliable links that work everywhere.
          </p>
        </motion.div>
      </section>

      {/* ── Core Features ── */}
      <CoreFeatures />

      {/* ── Why short.link ── */}
      <WhyShortLink />

      {/* ── FAQ Section ── */}
      <section id="faq" ref={faqRef}>
        <div className="max-w-3xl mx-auto px-6 pt-20 sm:pt-28 pb-12 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9C9C9C]">
                FAQ
              </span>
            </div>
            <h2 className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A]">
              Frequently asked questions
            </h2>
            <p className="text-[15px] text-[#6B6B6B] mt-3 max-w-lg mx-auto">
              Everything you need to know about short.link, answered.
            </p>
          </motion.div>

          <div className="divide-y divide-[#D4D4D8]">
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
                    className="faq-ripple w-full flex items-start justify-between gap-3 py-4 sm:py-5 text-left cursor-pointer transition-colors duration-200 hover:bg-[#F6F6F9] mx-auto px-4 rounded-lg"
                  >
                    <span className="text-base sm:text-lg font-medium text-[#0A0A0A] transition-colors duration-200 group-hover:text-[#6366F1]">
                      Q{index + 1}) {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="shrink-0 w-6 h-6 flex items-center justify-center text-[#9C9C9C]"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
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
                          <p className="text-[#6B6B6B] leading-relaxed text-sm sm:text-base">
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

      {/* ── Final CTA Section (unauthenticated only) ── */}
      {!isAuthenticated && (
        <section className="relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-3xl mx-auto px-6 pt-10 sm:pt-16 pb-20 sm:pb-24 text-center"
          >
            <h2 className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A] mb-4">
              Ready to simplify your links?
            </h2>
            <p className="text-[15px] text-[#6B6B6B] mb-8 max-w-md mx-auto">
              Create a free account to unlock analytics, custom slugs, QR codes, and more.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                as={Link}
                to="/signup"
                variant="primary"
                size="large"
                className="w-full sm:w-auto px-10! group"
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
              <Button
                as={Link}
                to="/login"
                variant="secondary"
                size="large"
                className="w-full sm:w-auto px-8!"
              >
                Sign in
              </Button>
            </div>

            <p className="text-xs text-[#9C9C9C] mt-5">
              No credit card required · Free forever · Set up in seconds
            </p>
          </motion.div>
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
            className="fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center bg-[#6366F1] text-white shadow-lg hover:bg-[#4F46E5] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer rounded-full sm:hidden"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
