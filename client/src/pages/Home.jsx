import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import Button from "../components/ui/Button";
import Collapse from "../components/ui/Collapse";
import { useAuthToken } from "../features/auth/useAuthActions";
import { useMutation } from "@tanstack/react-query";
import { createGuestLink } from "../api/links";
import { useToast } from "../features/toast/useToast.jsx";
import { shortLinkUrl } from "../config/urls";
import { motion } from "motion/react";
import FeatureStill from "../components/marketing/FeatureStill";
import HowItWorks from "../components/marketing/HowItWorks";
import useLenis from "../components/marketing/useLenis";
import { group, lift, rise, useReveal } from "../components/marketing/reveal";
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
      "A URL shortener takes a long web address and creates a compact, shareable link. Clicking your short link sends the visitor straight to the original page in a single redirect over a secure, encrypted connection — never a chain of them. The destination is also kept in a fast cache, so repeat clicks resolve almost instantly.",
  },
  {
    question: "Is short\u200b.link free to use?",
    answer:
      "Yes! short\u200b.link is free, not a trial: no card and no monthly link cap. Accounts can create unlimited links.",
  },
  {
    question: "Can I track clicks and analytics on my links?",
    answer:
      "Absolutely. Every link you create comes with built-in analytics. Each click is logged with country, city, device, browser, and operating system — and the logging happens quietly in the background, so it never slows down your redirects.",
  },
  {
    question: "How long do my links stay active?",
    answer:
      "Links on an account stay active indefinitely. There are no expiration dates or inactivity timeouts, and you can enable, disable or delete any link at any time. Without an account you can create one guest link per device, and it expires after exactly 24 hours.",
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
    body: "A short link resolves in one 302 over HTTPS, with no interstitial. Repeat clicks are served from a fast cache.",
    proof: "302 · HTTPS · cached",
  },
  {
    visual: "analytics",
    title: "Analytics that answer questions",
    body: "Clicks, unique visitors, countries, devices, browsers and operating systems, for every link and any date range.",
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
    title: "Your code, your destination",
    body: "Pick a readable short code like /spring-drop. Change where the link points, pause it, or delete it later without changing the code.",
    proof: "custom code · edit · pause",
  },
];


/**
 * In-page navigation for the landing page.
 *
 * Native scrolling only: the previous Lenis instance never moved the page when
 * asked to scroll (anchor links and the logo-to-`/` reset both did nothing),
 * and native `scrollIntoView` is both smaller and correct.
 */
const scrollToSection = (target, { immediate = false, lenis = null } = {}) => {
  if (typeof target === "number") {
    if (lenis) {
      lenis.scrollTo(target, { immediate });
      return;
    }
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

  // While Lenis runs it owns the scroll position, so it does the travelling.
  // A computed number, not the element: offsets and scroll margins are this
  // helper's job, and Lenis would apply its own on top.
  if (lenis) {
    lenis.scrollTo(top, { immediate });
    return;
  }

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

/**
 * Accept a bare host ("example.com/spring") as well as a full URL, and return
 * null when the result isn't a usable web address. Anything with another
 * scheme fails the host check or the parse, so no protocol case is needed.
 */
const normalizeUrl = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
};

const GUEST_LINK_KEY = "guest_link";
const GUEST_LINK_TTL_MS = 24 * 60 * 60 * 1000;

/** A stored guest link is only worth mentioning while it is still alive. */
const readLiveGuestLink = () => {
  try {
    const { expires_at: expiresAt } =
      JSON.parse(localStorage.getItem(GUEST_LINK_KEY)) ?? {};
    return expiresAt > Date.now();
  } catch {
    return false;
  }
};

const Home = () => {
  const isAuthenticated = Boolean(useAuthToken());
  const toast = useToast();
  const [createdLink, setCreatedLink] = useState(null);
  const [createdLinkIsGuest, setCreatedLinkIsGuest] = useState(false);
  const [alreadyHadLink, setAlreadyHadLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const [hasGuestLink, setHasGuestLink] = useState(readLiveGuestLink);
  const [openFaq, setOpenFaq] = useState(null);
  const urlRef = useRef(null);
  const lenis = useLenis();
  const reveal = useReveal();

  const location = useLocation();
  const faqRef = useRef(null);

  useEffect(() => {
    const id = location.hash.slice(1);
    const el = id ? document.getElementById(id) : null;

    if (!el) {
      // Landing on the home page without a (valid) hash — including clicking a
      // link to "/" while already here at /#faq — must return to the top.
      // ScrollToTop only watches pathname, which does not change in that case.
      scrollToSection(0, { immediate: true, lenis: lenis.current });
      return;
    }

    scrollToSection(el, { lenis: lenis.current });
  }, [location.key, location.hash, lenis]);

  useEffect(() => {
    if (formError) urlRef.current?.focus({ preventScroll: true });
  }, [formError]);

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
            GUEST_LINK_KEY,
            JSON.stringify({
              short_code: link.short_code,
              fingerprint: res.data?.fingerprint,
              expires_at: Date.now() + GUEST_LINK_TTL_MS,
            }),
          );
          setHasGuestLink(true);
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
    // The field carries the failure: an inline message next to the input the
    // visitor just typed in, rather than a toast in the corner while the input
    // keeps looking valid. Focus is returned in the effect below, because the
    // input is still disabled while the mutation settles.
    onError: (err) => {
      setFormError(
        err.response
          ? err.response.data?.message ||
            "That link couldn't be shortened. Check the address and try again."
          : "We couldn't reach the server. Check your connection and try again.",
      );
    },
  });

  const handleSubmit = (formData) => {
    const raw = String(formData.get("url") ?? "").trim();
    const url = normalizeUrl(raw);

    if (!url) {
      setFormError(
        raw
          ? "That doesn't look like a web address. Try something like example.com/spring."
          : "Paste a link to shorten.",
      );
      return;
    }

    setFormError("");
    setCreatedLink(null);
    setCreatedLinkIsGuest(false);
    setAlreadyHadLink(false);
    mutation.mutate({ url });
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
                ? "Create, manage and track your links from your dashboard."
                : "Paste a URL and get a short, trackable link. No account needed for your first one."}
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
                      ref={urlRef}
                      className="m-input"
                      placeholder="example.com/spring"
                      disabled={mutation.isPending}
                      name="url"
                      autoComplete="url"
                      type="text"
                      inputMode="url"
                      autoCapitalize="off"
                      spellCheck={false}
                      maxLength={2048}
                      aria-invalid={formError ? "true" : undefined}
                      aria-describedby={
                        formError ? "land-url-error" : undefined
                      }
                      onChange={() => formError && setFormError("")}
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
                  {formError && (
                    <p className="m-form-error" id="land-url-error" role="alert">
                      {formError}
                    </p>
                  )}
                  <p className="m-muted m-form-note">
                    No account needed. Guest links last 24 hours; account links
                    don't expire.
                  </p>
                </form>

                <div className="m-trust">
                  <span>Free, not a trial</span>
                  <span>Unlimited links with an account</span>
                  <span>No card required</span>
                </div>

                {hasGuestLink && !createdLink && (
                  <p className="m-muted m-form-note">
                    You already have a guest link on this device.{" "}
                    <Link to="/signup" className="m-note">
                      Create an account
                    </Link>{" "}
                    for unlimited links.
                  </p>
                )}

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

      <section
        className="m-facts-band"
        aria-label="What you get with short.link"
      >
        <div className="m-wrap">
          <dl className="m-facts">
            <div className="m-fact">
              <dt>Guest link</dt>
              <dd>
                Sign up on the same device before it expires and your guest
                link becomes permanent.
              </dd>
            </div>
            <div className="m-fact">
              <dt>No expiry</dt>
              <dd>
                Account links stay live until you pause or delete them. There
                is no inactivity timeout.
              </dd>
            </div>
            <div className="m-fact">
              <dt>Editable</dt>
              <dd>
                Change the destination after you share or print it. The short
                code stays the same.
              </dd>
            </div>
            <div className="m-fact">
              <dt>Custom code</dt>
              <dd>
                Choose a readable short code like /spring-drop instead of a
                random string.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <HowItWorks />

      <section className="m-section" id="product">
        <div className="m-wrap">
          <motion.div className="m-section-head" variants={group} {...reveal}>
            <div>
              <motion.p className="m-eyebrow" variants={rise}>
                Features
              </motion.p>
              <motion.h2 className="m-h2" variants={rise}>
                Change the destination. Keep the code.
              </motion.h2>
            </div>
            <motion.p className="m-sub" variants={rise}>
              One-hop redirects, per-click analytics, QR codes, a custom short
              code, and a destination you can point somewhere else tomorrow.
            </motion.p>
          </motion.div>

          <motion.div className="m-grid-4" variants={group} {...reveal}>
            {capabilities.map((item) => (
              <motion.article
                className="m-feature"
                key={item.title}
                variants={lift}
              >
                <FeatureStill kind={item.visual} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="m-feature-proof">{item.proof}</span>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        className="m-section"
        id="developers"
        aria-labelledby="dev-title"
      >
        <div className="m-wrap">
          <div className="m-section-head">
            <div>
              <h2 className="m-h2" id="dev-title">
                Your links, from code or an AI assistant.
              </h2>
            </div>
            <p className="m-sub">
              The dashboard is optional. Create a scoped key, then use the same
              links and analytics from your own code or an MCP client.
            </p>
          </div>

          <div className="m-dev-grid">
            <article className="m-dev-card">
              <span className="m-dev-kicker">API</span>
              <h3>
                Read-only or read-write. Revoke any key without touching the
                rest.
              </h3>
              <p>
                Call the same links and analytics endpoints the dashboard uses.
                Give a script exactly the access it needs.
              </p>
              <span className="m-feature-proof">scopes: read · write</span>
            </article>

            <article className="m-dev-card">
              <span className="m-dev-kicker">MCP</span>
              <h3>Shorten from Claude, Cursor, or another MCP client.</h3>
              <p>
                Point the client at the <code className="m-dev-path">/mcp</code>{" "}
                endpoint with an API key. It can create links, list them, read
                analytics, or repoint a destination without leaving the chat.
              </p>
              <span className="m-feature-proof">
                create_short_link · get_analytics · update_destination
              </span>
            </article>
          </div>

          <p className="m-dev-note">
            API keys and MCP access are included with every account. Keys live
            in Settings.{" "}
            <Link to="/signup" className="m-note">
              Create a free account to get one
            </Link>
            .
          </p>
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
            <h2>
              Short links
              <br />
              that keep working.
            </h2>
            <p className="m-cta-sub">
              Keep your links, remove the 24-hour expiry, and get the
              dashboard: unlimited links, analytics, QR downloads, custom short
              codes, API keys and MCP. No card.
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
