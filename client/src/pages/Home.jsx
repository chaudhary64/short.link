import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import Collapse from "../components/ui/Collapse";
import HowItWorks from "../components/landing/HowItWorks";
import CoreFeatures from "../components/landing/CoreFeatures";
import WhyShortLink from "../components/landing/WhyShortLink";
import HeroVisual from "../components/landing/HeroVisual";
import SectionHeading from "../components/landing/SectionHeading";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation } from "@tanstack/react-query";
import { createGuestLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";
import useLenis from "../hooks/useLenis";
import { fadeUp, staggerContainer } from "../utils/motion";
import {
  LuArrowRight,
  LuCheck,
  LuCopy,
  LuLoaderCircle,
  LuPlus,
} from "react-icons/lu";

const faqData = [
  {
    question: "What is a URL shortener and how does it work?",
    answer:
      "A URL shortener takes a long web address and creates a compact, shareable link. When someone clicks your short link, they're redirected to the original URL with a single 302 hop served over HTTPS — backed by a Redis cache, so repeat visits resolve instantly.",
  },
  {
    question: "Is short.link free to use?",
    answer:
      "Yes! short.link is free to use — no hidden charges and no credit card required, and accounts can create unlimited links. We believe link management should be accessible to everyone.",
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
      "Yes. Every link you create gets an instant QR code you can download as a PNG right from your dashboard — print it on posters, menus, or product packaging and scan it anywhere.",
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

const trustBullets = [
  "Free to start",
  "Instant redirects",
  "Built-in analytics",
];

const heroStats = [
  { label: "Price", value: "$0", delta: "Free to start", on: true },
  { label: "Redirect", value: "302", delta: "HTTPS · one hop", on: false },
  {
    label: "Guest links",
    value: "24H",
    delta: "Becomes permanent on signup",
    on: false,
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

  const scrollToSection = useLenis();

  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) scrollToSection(el);
    }
  }, [location.hash, scrollToSection]);

  const mutation = useMutation({
    mutationFn: createGuestLink,
    onSuccess: (res) => {
      const link = res.data?.link;
      const isGuest = res.data?.link?.guest === true;
      setCreatedLink(link);
      setCreatedLinkIsGuest(isGuest);
      setAlreadyHadLink(res.data?.alreadyExists === true);

      if (isGuest) {
        try {
          localStorage.setItem(
            "guest_link",
            JSON.stringify({
              short_code: link.short_code,
              fingerprint: res.data?.fingerprint,
            }),
          );
        } catch {
          void 0;
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="g-page flex-1"
    >
      <section className="g-sec" style={{ paddingTop: 26 }}>
        <div className="g-hero-grid">
          <div className="g-hero-left">
            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              animate="visible"
            >
              <motion.p variants={fadeUp} className="g-kicker">
                {isAuthenticated
                  ? "Welcome back"
                  : "Free to start · No card required"}
              </motion.p>
              <motion.h1 variants={fadeUp} className="g-h1">
                Make every link count.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="g-sub"
                style={{ marginTop: 10 }}
              >
                {isAuthenticated
                  ? "Create, manage, and track your links — all from your dashboard."
                  : "Paste any long URL and get a clean, trackable short link in seconds — with real-time analytics, QR codes, and no cost to start."}
              </motion.p>
            </motion.div>

            {!isAuthenticated && (
              <motion.div
                variants={staggerContainer(0.1, 0.15)}
                initial="hidden"
                animate="visible"
                className="g-hero-form"
              >
                <motion.form variants={fadeUp} action={handleSubmit}>
                  <label className="g-flabel" htmlFor="land-url">
                    Target URL
                  </label>
                  <div className="g-hero-form-row">
                    <input
                      id="land-url"
                      className="g-input"
                      placeholder="https://example.com"
                      disabled={mutation.isPending}
                      name="url"
                      autoComplete="url"
                      type="url"
                    />
                    <Button
                      size="large"
                      className={
                        mutation.isPending
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }
                      disabled={mutation.isPending}
                      type="submit"
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
                </motion.form>

                <motion.div variants={fadeUp} className="g-trust">
                  {trustBullets.map((b) => (
                    <span key={b} className="g-trust-item">
                      <span className="g-trust-sq" aria-hidden="true" />
                      {b}
                    </span>
                  ))}
                  <Link
                    to="/signup"
                    className="g-trust-item"
                    style={{ color: "var(--g-blue)" }}
                  >
                    Sign up for permanent links
                    <LuArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>

                {createdLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="g-result"
                  >
                    <span className="g-mark" aria-hidden="true" />
                    <div className="flex items-center gap-3">
                      <span className="g-sq g-sq-red" aria-hidden="true" />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Link placed
                      </span>
                    </div>

                    {createdLinkIsGuest && (
                      <div
                        className="flex flex-wrap items-center gap-x-4 gap-y-1"
                        style={{ marginTop: 10 }}
                      >
                        <span
                          className="g-trust-item"
                          style={{ color: "var(--g-yellow)" }}
                        >
                          <span
                            className="g-sq g-sq-yellow"
                            aria-hidden="true"
                          />
                          Expires in 24 hours
                        </span>
                        {!alreadyHadLink && (
                          <Link
                            to="/signup"
                            className="g-trust-item"
                            style={{ color: "var(--g-blue)" }}
                          >
                            Create account for permanent links
                            <LuArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    )}

                    {alreadyHadLink && (
                      <p className="g-feat-note" style={{ marginTop: 10 }}>
                        You can only create one guest link.{" "}
                        <Link to="/signup" style={{ color: "var(--g-blue)" }}>
                          Sign up for unlimited links
                        </Link>
                        .
                      </p>
                    )}

                    <div className="g-result-code">
                      <span className="mono">
                        {import.meta.env.VITE_API_BASE_URL}/
                        {createdLink.short_code}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="g-spec-copy"
                        aria-label="Copy short link"
                      >
                        {copied ? (
                          <LuCheck className="w-3.5 h-3.5" />
                        ) : (
                          <LuCopy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="g-result-actions">
                      {createdLinkIsGuest && (
                        <span className="g-trust-item">
                          <span className="g-sq g-sq-red" aria-hidden="true" />
                          <Link
                            to="/signup"
                            style={{ color: "var(--g-blue)", fontWeight: 800 }}
                          >
                            Create a free account
                            <LuArrowRight
                              className="w-3 h-3"
                              style={{ marginLeft: 4 }}
                            />
                          </Link>
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setCreatedLink(null);
                          setCreatedLinkIsGuest(false);
                          setAlreadyHadLink(false);
                        }}
                        className="g-trust-item"
                        style={{ cursor: "pointer", color: "var(--g-ink)" }}
                      >
                        Shorten another URL
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {isAuthenticated && (
              <motion.div
                variants={staggerContainer(0.1, 0.15)}
                initial="hidden"
                animate="visible"
                className="g-hero-form"
              >
                <motion.div
                  variants={fadeUp}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <Button
                    as={Link}
                    to="/dashboard"
                    size="large"
                    className="group"
                  >
                    Go to Dashboard
                    <LuArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    as={Link}
                    to="/analytics"
                    variant="secondary"
                    size="large"
                  >
                    View Analytics
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>

          <div className="g-hero-right">
            <HeroVisual />
          </div>
        </div>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="g-stats g-hero-stats"
        >
          {heroStats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="g-cell">
              <span className="g-mark" aria-hidden="true" />
              <span className="g-cell-label">{s.label}</span>
              <span className={`g-cell-num ${s.on ? "g-red" : ""}`}>
                {s.value}
              </span>
              <span className={`g-cell-delta ${s.on ? "on" : ""}`}>
                {s.on ? "▲" : "·"} {s.delta}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <CoreFeatures />

      <HowItWorks />

      <WhyShortLink />

      <section id="faq" ref={faqRef} className="g-sec scroll-mt-14">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          subtitle="Everything you need to know about short.link, answered."
        />
        <div className="g-faq">
          {faqData.map((item, index) => {
            const isOpen = openFaq === index;
            const faqId = `faq-${index}`;
            const contentId = `faq-content-${index}`;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: index * 0.03,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className={`g-faq-row ${isOpen ? "open" : ""}`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  id={faqId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="g-faq-q"
                >
                  <span className="g-faq-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="g-faq-question">{item.question}</span>
                  <span className="g-faq-toggle" aria-hidden="true">
                    <LuPlus className="w-3.5 h-3.5" />
                  </span>
                </button>
                <Collapse
                  open={isOpen}
                  id={contentId}
                  role="region"
                  aria-labelledby={faqId}
                >
                  <div className="g-faq-a">
                    <p>{item.answer}</p>
                  </div>
                </Collapse>
              </motion.div>
            );
          })}
        </div>
      </section>

      {!isAuthenticated && (
        <section className="g-cta">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center"
          >
            <p className="g-cta-kicker">READY WHEN YOU ARE</p>
            <h2 className="g-cta-title">Make every link count.</h2>
            <p className="g-cta-sub">
              Create a free account to unlock analytics, QR codes, and more.
            </p>
            <div className="g-cta-actions justify-center">
              <Button as={Link} to="/signup" size="large" className="group">
                Create Free Account
                <LuArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button as={Link} to="/login" variant="secondary" size="large">
                Sign in
              </Button>
            </div>
            <p className="g-cta-meta">
              <span className="whitespace-nowrap">No credit card required</span>
              <span aria-hidden="true"> · </span>
              <span className="whitespace-nowrap">Free to start</span>
              <span aria-hidden="true"> · </span>
              <span className="whitespace-nowrap">Set up in seconds</span>
            </p>
          </motion.div>
        </section>
      )}
    </motion.div>
  );
};

export default Home;
