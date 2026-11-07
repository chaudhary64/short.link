import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import Button from "../components/ui/Button";
import Collapse from "../components/ui/Collapse";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation } from "@tanstack/react-query";
import { createGuestLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";
import { shortLinkUrl } from "../config/urls";
import {
  LuActivity,
  LuArrowRight,
  LuChartNoAxesColumn,
  LuCheck,
  LuCopy,
  LuEyeOff,
  LuFingerprint,
  LuLink,
  LuListChecks,
  LuLoaderCircle,
  LuMapPin,
  LuPlus,
  LuQrCode,
  LuShield,
} from "react-icons/lu";

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

const capabilities = [
  {
    icon: LuLink,
    title: "One-hop redirects",
    body: "A short link resolves in a single 302 over HTTPS, with Redis in front of the database so repeat visits stay instant.",
    proof: "302 · HTTPS · cached",
  },
  {
    icon: LuChartNoAxesColumn,
    title: "Analytics that answer questions",
    body: "Clicks, unique visitors, countries, devices, browsers and operating systems — for every link, over any range.",
    proof: "clicks · visitors · countries",
  },
  {
    icon: LuQrCode,
    title: "QR codes, included",
    body: "Every link gets a QR code you can download as a PNG and put on print, packaging or a shop window.",
    proof: "PNG · scannable",
  },
  {
    icon: LuListChecks,
    title: "Control after you share",
    body: "Change the destination, pause a link for a season, or delete it. The short code never has to change.",
    proof: "edit · pause · delete",
  },
];

const steps = [
  {
    title: "Paste your URL",
    body: "Drop any long address into the field above. No account needed to try it.",
    mono: "https://example.com/page?utm=spring",
  },
  {
    title: "Get a short link",
    body: "You get a compact, unique short\u200b.link in seconds, ready to copy.",
    mono: "short\u200b.link/launch",
  },
  {
    title: "Share it anywhere",
    body: "Copy the link, grab the QR code, or drop it into a bio, an email or a campaign.",
    mono: "copied to clipboard",
  },
  {
    title: "Watch the clicks",
    body: "Clicks, visitors and geography accumulate in your dashboard as people arrive.",
    mono: "clicks · uniques · countries",
  },
];

const facts = [
  {
    title: "Analytics never slow clicks",
    body: "Clicks are recorded in the background, so tracking never delays a redirect.",
    proof: "fire-and-forget",
    icon: LuActivity,
  },
  {
    title: "Every click, logged in detail",
    body: "Country, city, device, browser and operating system captured on every account link — wherever the visitor's browser and connection reveal them.",
    proof: "country · city · device · browser · os",
    icon: LuMapPin,
  },
  {
    title: "Ownership enforced",
    body: "You can only edit or delete your own links — every request checks ownership.",
    proof: "your links only",
    icon: LuShield,
  },
  {
    title: "Private by design",
    body: "Your links get the full picture; your visitors stay anonymous. We log clicks and devices, never personal identity.",
    proof: "clicks, not identities",
    icon: LuEyeOff,
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
        <div className="m-wrap m-hero-grid">
          <div>
            <p className="m-eyebrow">URL shortener · analytics</p>
            <h1 className="m-h1">
              Make every
              <br />
              link <em>count.</em>
            </h1>
            <p className="m-lede">
              {isAuthenticated
                ? "Create, manage and track your links — all from your dashboard."
                : "Paste any long URL and get a clean, trackable short link in seconds — with real-time analytics, QR codes, and nothing to pay to start."}
            </p>

            {!isAuthenticated ? (
              <>
                <form action={handleSubmit} className="m-form">
                  <label className="m-form-label" htmlFor="land-url">
                    Paste a long URL
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
                </form>

                <div className="m-trust">
                  <span>Free to start</span>
                  <span>No card required</span>
                  <span>Guest links last 24h</span>
                  <Link to="/signup" className="m-note">
                    Sign up for permanent links
                    <LuArrowRight className="w-3 h-3" />
                  </Link>
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

          <aside className="m-card" aria-label="What a short link carries">
            <div className="m-card-head">
              <span className="m-card-title">Inside every link</span>
              <span className="m-card-badge">short.link</span>
            </div>
            <dl className="m-card-body">
              <div className="m-row">
                <dt>Destination</dt>
                <dd>The long URL you paste — editable later.</dd>
              </div>
              <div className="m-row">
                <dt>Short code</dt>
                <dd>
                  A unique code, shown as <code>yourlink</code>.
                </dd>
              </div>
              <div className="m-row">
                <dt>Status</dt>
                <dd>Active or paused, whenever you need.</dd>
              </div>
              <div className="m-row">
                <dt>QR code</dt>
                <dd>A PNG you can print, for every link.</dd>
              </div>
              <div className="m-row">
                <dt>Analytics</dt>
                <dd>Clicks, visitors and countries, recorded per click.</dd>
              </div>
            </dl>
            <div className="m-card-foot">
              <LuFingerprint className="w-3.5 h-3.5" aria-hidden />
              No sample numbers — your own data appears once you create a link.
            </div>
          </aside>
        </div>
      </section>

      <section className="m-section" id="product">
        <div className="m-wrap">
          <div className="m-section-head">
            <div>
              <p className="m-eyebrow">Capabilities</p>
              <h2 className="m-h2">Everything a short link should be.</h2>
            </div>
            <p className="m-sub">
              The essentials, done properly — fast redirects, honest analytics
              and full control over where a link points.
            </p>
          </div>

          <div className="m-grid-4">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <article className="m-feature" key={item.title}>
                  <span className="m-ico">
                    <Icon className="w-4 h-4" aria-hidden />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <span className="m-feature-proof">{item.proof}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="m-section" id="how">
        <div className="m-wrap">
          <div className="m-section-head">
            <div>
              <p className="m-eyebrow">How it works</p>
              <h2 className="m-h2">From long URL to insight.</h2>
            </div>
            <p className="m-sub">
              No setup, no learning curve. Paste, shorten, share, and watch the
              numbers arrive.
            </p>
          </div>

          <ol className="m-steps">
            {steps.map((step, index) => (
              <li className="m-step" key={step.title}>
                <span className="m-step-idx">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <code>{step.mono}</code>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="m-section">
        <div className="m-wrap m-split">
          <div>
            <p className="m-eyebrow">Why short.link</p>
            <h2 className="m-h2">A shortener that respects your links.</h2>
            <p className="m-sub">
              The details that make short.link dependable — speed,
              transparency, and ownership you can trust.
            </p>
            {!isAuthenticated && (
              <p className="m-aside">
                Try it without an account — guest links live for 24 hours.
                Sign up to keep yours.
              </p>
            )}
          </div>

          <div className="m-facts">
            {facts.map((fact) => {
              const Icon = fact.icon;
              return (
                <article className="m-fact" key={fact.title}>
                  <span className="m-fact-ico">
                    <Icon className="w-4 h-4" aria-hidden />
                  </span>
                  <div>
                    <h3>{fact.title}</h3>
                    <p>{fact.body}</p>
                    <span className="m-fact-proof">{fact.proof}</span>
                  </div>
                </article>
              );
            })}
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
            <div>
              <p className="m-eyebrow m-eyebrow-invert">Ready when you are</p>
              <h2>Make every link count.</h2>
              <p>
                A free account unlocks analytics, QR codes and unlimited links
                that never expire.
              </p>
            </div>
            <div className="m-actions">
              <Button as={Link} to="/signup" size="large" className="m-cta-btn">
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
