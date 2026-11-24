import { LuArrowRight } from "react-icons/lu";

/**
 * "How it works" — four stations on one rail, in the order a link travels:
 * paste, shorten, share, measure. The rail is the sequence (so the numbers
 * are real, not decoration), and each station begins with a pin on it.
 *
 * Static: this is a map of the product, not a demo of it.
 */

const STEPS = [
  {
    title: "Paste your URL",
    body: "Drop any long address into the field at the top. No account needed to try it.",
    proof: "https://example.com/page?utm=spring",
  },
  {
    title: "Take the short link",
    body: "A unique short.link appears in seconds, ready to copy or scan.",
    proof: "short.link/x7k2",
  },
  {
    title: "Share it anywhere",
    body: "Put it in a bio, an email or a campaign — or download its QR code for print.",
    proof: "link · QR · PNG",
  },
  {
    title: "Watch the clicks",
    body: "Clicks, visitors, countries, devices and browsers collect in your dashboard.",
    proof: "clicks · visitors · countries",
  },
];

const HowItWorks = () => (
  <section className="m-section" id="how" aria-labelledby="how-title">
    <div className="m-wrap">
      <div className="m-section-head">
        <div>
          <p className="m-eyebrow">How it works</p>
          <h2 className="m-h2" id="how-title">
            From a long link to live clicks.
          </h2>
        </div>
        <p className="m-sub">
          Paste a URL, take the short link, share it. Every visit after that
          lands in your analytics — no setup between the four steps.
        </p>
      </div>

      <ol className="m-how-track">
        {STEPS.map((step, index) => (
          <li className="m-how-step" key={step.title}>
            <p className="m-how-no">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="m-how-title">{step.title}</h3>
            <p className="m-how-body">{step.body}</p>
            <p className="m-how-proof">{step.proof}</p>
          </li>
        ))}
      </ol>

      <a className="m-how-link" href="#product">
        See everything a short link does
        <LuArrowRight aria-hidden="true" />
      </a>
    </div>
  </section>
);

export default HowItWorks;
