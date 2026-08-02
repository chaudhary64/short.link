import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Button from "../components/ui/Button";
import HowItWorks from "../components/landing/HowItWorks";
import CoreFeatures from "../components/landing/CoreFeatures";
import WhyShortLink from "../components/landing/WhyShortLink";
import HeroVisual from "../components/landing/HeroVisual";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation } from "@tanstack/react-query";
import { createLink, createGuestLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";
import useLenis from "../hooks/useLenis";
import {
  LuArrowRight,
  LuCheck,
  LuCopy,
  LuLoaderCircle,
} from "react-icons/lu";

const faqData = [
  {
    question: "What is a URL shortener and how does it work?",
    answer:
      "A URL shortener takes a long web address and creates a compact, shareable link. When someone clicks your short link, they're redirected to the original URL with a single 302 hop served over HTTPS — resolved from a Redis cache, so it happens instantly.",
  },
  {
    question: "Is short.link free to use?",
    answer:
      "Yes! short.link is completely free forever. There are no hidden charges, no credit card required, and no usage limits on link creation. We believe link management should be accessible to everyone.",
  },
  {
    question: "Can I track clicks and analytics on my links?",
    answer:
      "Absolutely. Every link you create comes with built-in analytics. Each click is logged with country, city, device, browser, and operating system — and tracking is fire-and-forget, so it never slows down your redirects.",
  },
  {
    question: "How long do my shortened links stay active?",
    answer:
      "Your links stay active indefinitely as long as your account remains active. There are no expiration dates or inactivity timeouts. You're in full control — you can enable, disable, or delete any link at any time. (Guest links created without an account expire after exactly 24 hours — sign up to keep them forever.)",
  },
  {
    question: "How do I manage or delete my links?",
    answer:
      "Your dashboard gives you full control over every link you've created. From there you can edit the destination URL, toggle a link on or off, copy the short code, or permanently delete links you no longer need.",
  },
  {
    question: "Can I change where a short link points after creating it?",
    answer:
      "Yes. Open any link in your dashboard and edit its destination URL whenever you like — the short code stays the same, so everyone using it keeps reaching your latest destination with no broken links.",
  },
  {
    question: "Can I pause a link without deleting it?",
    answer:
      "Absolutely. Every link has an on/off toggle in your dashboard. Pause a link for a seasonal campaign or a temporary landing page, and turn it back on whenever you're ready — your analytics history stays intact.",
  },
  {
    question: "Do my links come with QR codes?",
    answer:
      "Yes. Every link you create gets an instant QR code you can download as a PNG or SVG right from your dashboard — print it on posters, menus, or product packaging and scan it anywhere.",
  },
  {
    question: "How many guest links can I create without an account?",
    answer:
      "Without an account you can create one guest link per device, and it lives for exactly 24 hours. Create a free account to get unlimited links that never expire, plus analytics, QR codes, and full link management.",
  },
  {
    question: "What happens to my guest link when I sign up?",
    answer:
      "Your guest link follows you. When you create a free account on the same device — as long as the link hasn't already expired — it's converted into a permanent account link automatically: same short code, same click history, and it no longer expires.",
  },
];

const trustBullets = ["Free forever", "Instant redirects", "Built-in analytics"];

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

  const scrollToSection = useLenis();

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
    scrollToSection(0);
  };

  const location = useLocation();

  // Scroll to an in-page anchor (e.g. the footer's /#faq link)
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) scrollToSection(el);
    }
  }, [location.hash, scrollToSection]);

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
        <div className="relative mx-auto px-6 pt-20 pb-20 sm:pt-28 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-start">
            {/* Left: headline + working shortener */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
                className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B6B6B] bg-white border border-[#D4D4D8] rounded-full px-3 py-1.5 mb-6"
              >
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                <span className="whitespace-nowrap">
                  Free forever · No card required
                </span>
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 24 }}
                className="text-5xl sm:text-6xl font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[0.95] mb-6"
              >
                Make every
                <br />
                <span className="relative inline-block">
                  link count.
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[#0A0A0A]/10 z-0" />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 24 }}
                className="text-lg text-[#6B6B6B] max-w-lg leading-relaxed"
              >
                Paste any long URL and get a clean, trackable short link in
                seconds — with real-time analytics, QR codes, and zero cost.
              </motion.p>

              {/* ── URL Input ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 24 }}
                className="mt-8"
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
                          <LuLoaderCircle className="w-4 h-4 animate-spin" />
                          Shortening&hellip;
                        </span>
                      ) : (
                        "Shorten"
                      )}
                    </Button>
                  </div>
                </form>

                {/* Trust bullets */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">
                  {trustBullets.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 text-[13px] text-[#6B6B6B]"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center">
                        <LuCheck className="w-2.5 h-2.5" />
                      </span>
                      {b}
                    </span>
                  ))}
                  {!isAuthenticated && (
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors duration-200"
                    >
                      Sign up for permanent links
                      <LuArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

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
                        <LuCheck className="w-4 h-4 text-[#10B981]" />
                      </div>
                      <span className="text-sm font-semibold text-[#0A0A0A]">
                        Your link is ready!
                      </span>
                    </div>

                    {/* Guest link notices */}
                    {createdLinkIsGuest && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                        <span className="inline-flex items-center gap-1 text-xs text-[#B45309] font-medium">
                          Expires in 24 hours
                        </span>
                        {!alreadyHadLink && (
                          <Link
                            to="/signup"
                            className="inline-flex items-center gap-1 text-xs text-[#6366F1] font-medium hover:text-[#4F46E5] transition-colors duration-200"
                          >
                            Create account for permanent links
                            <LuArrowRight className="w-3 h-3" />
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
                            <LuCheck className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <LuCopy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    {/* Guest CTA */}
                    {createdLinkIsGuest && (
                      <div className="mt-4 pt-3 border-t border-[#E5E5EA]">
                        <p className="text-xs text-[#9C9C9C] mb-2">
                          Want analytics, QR codes, and permanent links?
                        </p>
                        <Link
                          to="/signup"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors duration-200"
                        >
                          Create a free account
                          <LuArrowRight className="w-4 h-4" />
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

            {/* Right: floating short-link stack */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 28 }}
              className="relative lg:px-6"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Core Features (includes analytics) ── */}
      <CoreFeatures />

      <HowItWorks />

      <WhyShortLink />

      {/* ── FAQ Section ── */}
      <section id="faq" ref={faqRef} className="scroll-mt-14">
        <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
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
            className="relative max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center"
          >
            <h2 className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A] mb-4">
              Ready to make every link count?
            </h2>
            <p className="text-[15px] text-[#6B6B6B] mb-8 max-w-md mx-auto">
              Create a free account to unlock analytics, QR codes, and more.
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
                <LuArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
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
              <span className="whitespace-nowrap">No credit card required</span>
              <span aria-hidden="true"> · </span>
              <span className="whitespace-nowrap">Free forever</span>
              <span aria-hidden="true"> · </span>
              <span className="whitespace-nowrap">Set up in seconds</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
