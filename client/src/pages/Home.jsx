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
  LuCheck,
  LuCopy,
  LuEyeOff,
  LuLoaderCircle,
  LuMapPin,
  LuPlus,
  LuShield,
} from "react-icons/lu";
import QRCode from "react-qr-code";

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

// Where a short link actually gets used. Every line describes the mechanic —
// what the code opens and what can change afterwards — never a result claim.
const useCases = [
  {
    place: "Table menus",
    body: "The code on the table opens the menu page. Change the destination when the menu changes and the printed code keeps working.",
  },
  {
    place: "Posters & flyers",
    body: "A code printed on the flyer opens the page, video or form in the reader's browser.",
  },
  {
    place: "Packaging",
    body: "The pack opens instructions, ingredients or support — the detail that did not fit on the label.",
  },
  {
    place: "Campaign emails",
    body: "The short link sits in the message body in place of the full URL and opens the same page.",
  },
  {
    place: "Social bios",
    body: "One short link in the bio field opens the destination, wherever the profile is read.",
  },
  {
    place: "Event signage",
    body: "The code on a badge or booth graphic opens the schedule, venue details or a sign-up form.",
  },
];

// The four feature stills. Each is a fragment of the interface itself — a
// redirect hop, a chart, a scannable code, a destination with its toggle —
// drawn in markup so it stays sharp and follows the theme.
const FeatureVisual = ({ kind }) => {
  if (kind === "redirect") {
    return (
      <div className="m-vig" aria-hidden="true">
        <div className="m-vig-row">
          <span className="m-vig-pill">example.com/page?utm=spring</span>
          <span className="m-vig-arrow">↓ 302</span>
          <span className="m-vig-pill m-vig-pill--strong">short.link/launch</span>
        </div>
        <div className="m-vig-tags">
          <span className="m-vig-tag">https</span>
          <span className="m-vig-tag">cached</span>
        </div>
      </div>
    );
  }

  if (kind === "analytics") {
    return (
      <div className="m-vig" aria-hidden="true">
        <div className="m-vig-bars">
          {[34, 58, 42, 71, 52, 86, 64].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="m-vig-tags">
          <span className="m-vig-tag">clicks</span>
          <span className="m-vig-tag">visitors</span>
          <span className="m-vig-tag">countries</span>
        </div>
      </div>
    );
  }

  if (kind === "qr") {
    return (
      <div className="m-vig m-vig--center" aria-hidden="true">
        <span className="m-vig-qr">
          <QRCode
            value="https://short.link/launch"
            size={58}
            level="M"
            fgColor="#141414"
            bgColor="#ffffff"
          />
        </span>
        <span className="m-vig-tag">PNG · scannable</span>
      </div>
    );
  }

  return (
    <div className="m-vig" aria-hidden="true">
      <div className="m-vig-field">
        <span className="m-vig-field-url">short.link/launch</span>
        <span className="m-vig-toggle" />
      </div>
      <div className="m-vig-tags">
        <span className="m-vig-tag">edit</span>
        <span className="m-vig-tag">pause</span>
        <span className="m-vig-tag">delete</span>
      </div>
    </div>
  );
};

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
        <div className="m-wrap m-hero-center">
          <div className="m-hero-copy">
            <p className="m-eyebrow">Free link shortener with analytics</p>
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

        </div>
      </section>

      <section className="m-section" id="use-cases">
        <div className="m-wrap">
          <div className="m-section-head">
            <div>
              <p className="m-eyebrow">Who it's for</p>
              <h2 className="m-h2">One code, every place you share it.</h2>
            </div>
            <p className="m-sub">
              The same short link works in print, in a message and on a screen —
              and the destination can change after it has been printed.
            </p>
          </div>

          <div className="m-usecases">
            {useCases.map((item, index) => (
              <article className="m-usecase" key={item.place}>
                <span className="m-usecase-idx">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{item.place}</h3>
                <p>{item.body}</p>
              </article>
            ))}
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

          <div className="m-grid-4">
            {capabilities.map((item) => (
              <article className="m-feature" key={item.title}>
                <FeatureVisual kind={item.visual} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="m-feature-proof">{item.proof}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="m-section">
        <div className="m-wrap m-split">
          <div>
            <p className="m-eyebrow">How it's built</p>
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
