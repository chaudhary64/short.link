import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import Button from "../components/ui/Button";
import Collapse from "../components/ui/Collapse";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation } from "@tanstack/react-query";
import { createGuestLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";
import { shortLinkUrl } from "../config/urls";
import FeatureStill from "../components/marketing/FeatureStill";
import HowItWorks from "../components/marketing/HowItWorks";
import useOnceInView from "../components/marketing/useOnceInView";
import {
  LuArrowRight,
  LuCheck,
  LuCopy,
  LuLoaderCircle,
  LuPlus,
} from "react-icons/lu";

// Seven questions, in the order the objections arrive: what it is, what it
// costs, whether the tracking is real, whether links survive, whether a link
// can be changed, QR codes, and what happens to a guest link.
const faqData = [
  {
    question: "What is a URL shortener and how does it work?",
    answer:
      "A URL shortener takes a long web address and creates a compact, shareable link. When someone clicks your short link, they're redirected to the original URL with a single 302 hop served over HTTPS — backed by a Redis cache, so repeat visits resolve instantly.",
  },
  {
    question: "Is short\u200b.link free to use?",
    answer:
      "Yes! short\u200b.link is free to use — no hidden charges and no credit card required, and accounts can create unlimited links. We believe link management should be accessible to everyone.",
  },
  {
    question: "Can I track clicks and analytics on my links?",
    answer:
      "Absolutely. Every link you create comes with built-in analytics. Each click is logged with country, city, device, browser, and operating system — and tracking is fire-and-forget, so it never slows down your redirects.",
  },
  {
    question: "How long do my links stay active?",
    answer:
      "Links on an account stay active indefinitely — there are no expiration dates or inactivity timeouts, and you can enable, disable or delete any link at any time. Without an account you can create one guest link per device, and it expires after exactly 24 hours.",
  },
  {
    question: "Can I change, pause or delete a link?",
    answer:
      "Yes. Open any link in your dashboard to edit its destination — the short code stays the same, so anything you have already shared keeps working. Every link also has an on/off toggle, so you can pause one for a season without losing its click history, and links you no longer need can be deleted permanently.",
  },
  {
    question: "Do my links come with QR codes?",
    answer:
      "Yes. Every link you create gets an instant QR code you can download as a PNG right from your dashboard — print it on posters, menus, or product packaging and scan it anywhere.",
  },
  {
    question: "What happens to my guest link when I sign up?",
    answer:
      "Your guest link follows you. When you create a free account on the same device — as long as the link hasn't already expired — it's converted into a permanent account link automatically: same short code, same click history, and it no longer expires.",
  },
];

const capabilities = [
  {
    visual: "redirect",
    title: "One-hop redirects",
    body: "A short link resolves in a single 302 over HTTPS, with Redis in front of the database so repeat visits stay instant.",
    proof: "302 · HTTPS · cached",
  },
  {
    visual: "analytics",
    title: "Analytics that answer questions",
    body: "Clicks, unique visitors, countries, devices, browsers and operating systems — for every link, over any range.",
    proof: "clicks · visitors · countries",
  },
  {
    visual: "qr",
    title: "QR codes, included",
    body: "Every link gets a QR code you can download as a PNG and put on print, packaging or a shop window.",
    proof: "PNG · scannable",
  },
  {
    visual: "control",
    title: "Control after you share",
    body: "Change the destination, pause a link for a season, or delete it. The short code never has to change.",
    proof: "edit · pause · delete",
  },
];


/**
 * In-page navigation for the landing page.
 *
 * Native scrolling only: the previous Lenis instance never moved the page when
 * asked to scroll (anchor links and the logo-to-`/` reset both did nothing),
 * and native `scrollIntoView` is both smaller and correct.
 */
const scrollToSection = (target, { immediate = false } = {}) => {
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;

  // Honour the section's scroll-margin (it clears the sticky nav) and scroll the
  // window directly, so the target is a number we can verify afterwards.
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const top = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - margin,
  );
  const from = window.scrollY;
  if (immediate) {
    window.scrollTo({ top, behavior: "auto" });
    return;
  }
  window.scrollTo({ top, behavior: "smooth" });

  // Browsers drop smooth scrolling in background tabs and when the animation is
  // otherwise unavailable, which silently left the page where it was. If the
  // position never moved, land immediately instead of doing nothing.
  if (Math.abs(from - top) < 2) return;
  window.setTimeout(() => {
    if (Math.abs(window.scrollY - from) < 2) {
      window.scrollTo({ top, behavior: "auto" });
    }
  }, 200);
};

const Home = () => {
  const isAuthenticated = Boolean(useAuthToken());
  const toast = useToast();
  const [createdLink, setCreatedLink] = useState(null);
  const [createdLinkIsGuest, setCreatedLinkIsGuest] = useState(false);
  const [alreadyHadLink, setAlreadyHadLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const location = useLocation();
  const faqRef = useRef(null);
  // The feature stills play once, when they are actually on screen.
  const [featuresRef, featuresLive] = useOnceInView();

  useEffect(() => {
    const id = location.hash.slice(1);
    const el = id ? document.getElementById(id) : null;

    if (!el) {
      // Landing on the home page without a (valid) hash — including clicking a
      // link to "/" while already here at /#faq — must return to the top.
      // ScrollToTop only watches pathname, which does not change in that case.
      scrollToSection(0, { immediate: true });
      return;
    }

    scrollToSection(el);
  }, [location.key, location.hash]);

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
        shortLinkUrl(createdLink.short_code),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", "Could not copy to clipboard.");
    }
  };

  return (
    <div className="m-page">
      <section className="m-hero">
        <div className="m-wrap m-hero-center">
          <div className="m-hero-copy">
            <h1 className="m-h1">
              Long links are ugly.
              <br />
              Make them <em>short.</em>
            </h1>
            <p className="m-lede">
              {isAuthenticated
                ? "Create, manage and track your links — all from your dashboard."
                : "Paste any URL and get a short, trackable link in seconds — free, with click analytics and QR codes."}
            </p>

            {!isAuthenticated ? (
              <>
                <form action={handleSubmit} className="m-form">
                  {/* The placeholder and the button already name the action, so
                      the label is for screen readers only — the field still
                      needs an accessible name. */}
                  <label className="sr-only" htmlFor="land-url">
                    Long URL to shorten
                  </label>
                  <div className="m-form-row">
                    <input
                      id="land-url"
                      className="m-input"
                      placeholder="https://example.com/page?utm=spring"
                      disabled={mutation.isPending}
                      name="url"
                      autoComplete="url"
                      type="url"
                      required
                    />
                    <Button
                      size="large"
                      type="submit"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <span className="m-inline">
                          <LuLoaderCircle className="w-4 h-4 animate-spin" />
                          Shortening…
                        </span>
                      ) : (
                        <span className="m-inline">
                          Shorten link
                          <LuArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                  <p className="m-muted m-form-note">
                    Change the destination later — the link stays the same.
                  </p>
                </form>

                <div className="m-trust">
                  <span>Free to start</span>
                  <span>No card required</span>
                </div>

                {createdLink && (
                  <div className="m-result" role="status">
                    <div className="m-result-head">
                      <span className="m-result-title">
                        <span className="m-pip" aria-hidden />
                        Link ready
                      </span>
                      {createdLinkIsGuest && (
                        <span className="badge" data-tone="paused">
                          Expires in 24 hours
                        </span>
                      )}
                    </div>

                    <div className="m-result-code">
                      <code>{shortLinkUrl(createdLink.short_code)}</code>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="m-icon-btn"
                        aria-label="Copy short link"
                      >
                        {copied ? (
                          <LuCheck className="w-4 h-4" />
                        ) : (
                          <LuCopy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="m-result-foot">
                      {createdLinkIsGuest && !alreadyHadLink && (
                        <Link to="/signup" className="m-note">
                          Create a free account to keep it
                          <LuArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      {alreadyHadLink && (
                        <span className="m-muted">
                          One guest link per device.{" "}
                          <Link to="/signup" className="m-note">
                            Sign up for unlimited links
                          </Link>
                        </span>
                      )}
                      <button
                        type="button"
                        className="m-text-btn"
                        onClick={() => {
                          setCreatedLink(null);
                          setCreatedLinkIsGuest(false);
                          setAlreadyHadLink(false);
                        }}
                      >
                        Shorten another URL
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="m-actions">
                <Button as={Link} to="/dashboard" size="large">
                  <span className="m-inline">
                    Open dashboard
                    <LuArrowRight className="w-4 h-4" />
                  </span>
                </Button>
                <Button as={Link} to="/analytics" variant="secondary" size="large">
                  View analytics
                </Button>
              </div>
            )}
          </div>

        </div>
      </section>

      <HowItWorks />

      <section className="m-section" id="product">
        <div className="m-wrap">
          <div className="m-section-head">
            <div>
              <p className="m-eyebrow">Features</p>
              <h2 className="m-h2">Everything a short link should be.</h2>
            </div>
            <p className="m-sub">
              The essentials, done properly — fast redirects, honest analytics
              and full control over where a link points.
            </p>
          </div>

          <div
            className={`m-grid-4${featuresLive ? " is-live" : ""}`}
            ref={featuresRef}
          >
            {capabilities.map((item) => (
              <article className="m-feature" key={item.title}>
                <FeatureStill kind={item.visual} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="m-feature-proof">{item.proof}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="m-section" id="faq" ref={faqRef}>
        <div className="m-wrap m-faq">
          <div>
            <p className="m-eyebrow">FAQ</p>
            <h2 className="m-h2">Questions, answered.</h2>
            <p className="m-sub">
              Everything you need to know about short.link and how links,
              analytics and accounts work.
            </p>
          </div>

          <div className="m-faq-list">
            {faqData.map((item, index) => {
              const isOpen = openFaq === index;
              const faqId = `faq-${index}`;
              const contentId = `faq-content-${index}`;

              return (
                <div
                  key={item.question}
                  className={`m-faq-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    id={faqId}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    className="m-faq-q"
                  >
                    <span className="m-faq-num">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.question}</span>
                    <span className="m-faq-toggle" aria-hidden>
                      <LuPlus className="w-4 h-4" />
                    </span>
                  </button>
                  <Collapse
                    open={isOpen}
                    id={contentId}
                    role="region"
                    aria-labelledby={faqId}
                  >
                    <div className="m-faq-a">
                      <p>{item.answer}</p>
                    </div>
                  </Collapse>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="m-cta">
          <div className="m-wrap m-cta-inner">
            <p className="m-eyebrow">Ready when you are</p>
            <h2>Long links are ugly. Make them short.</h2>
            <p className="m-cta-sub">
              A free account unlocks analytics, QR codes and unlimited links
              that never expire.
            </p>
            <div className="m-cta-actions">
              <Button as={Link} to="/signup" size="large">
                <span className="m-inline">
                  Create free account
                  <LuArrowRight className="w-4 h-4" />
                </span>
              </Button>
              <Link to="/login" className="m-cta-link">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
