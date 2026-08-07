import { motion } from "motion/react";
import { useAuthToken } from "../../features/auth/useAuthActions";
import { fadeUp, staggerContainer } from "../../utils/motion";
import { LuActivity, LuEyeOff, LuMapPin, LuShield } from "react-icons/lu";

const facts = [
  {
    title: "Analytics never slow clicks",
    body: "Clicks are recorded in the background, so tracking never delays a redirect.",
    proof: "fire-and-forget",
    icon: <LuActivity className="w-4 h-4" />,
  },
  {
    title: "Every click, logged in detail",
    body: "Country, city, device, browser, and operating system captured on every account link — wherever the visitor's browser and connection reveal them.",
    proof: "country · city · device · browser · os",
    icon: <LuMapPin className="w-4 h-4" />,
  },
  {
    title: "Ownership enforced",
    body: "You can only edit or delete your own links — every request checks ownership.",
    proof: "your links only",
    icon: <LuShield className="w-4 h-4" />,
  },
  {
    title: "Private by design",
    body: "Your links get the full picture; your visitors stay anonymous. We log clicks and devices, never personal identity.",
    proof: "clicks, not identities",
    icon: <LuEyeOff className="w-4 h-4" />,
  },
];

const WhyShortLink = () => {
  const isAuthenticated = useAuthToken();

  return (
    <section className="g-sec">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-10 lg:gap-16 items-start">
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative"
        >
          <motion.p variants={fadeUp} className="g-kicker">
            Why short.link
          </motion.p>
          <motion.h2 variants={fadeUp} className="g-h2">
            A shortener that respects your links.
          </motion.h2>
          <motion.p variants={fadeUp} className="g-h2-sub">
            The details that make short.link dependable — speed, transparency,
            and ownership you can trust.
          </motion.p>
          <span className="g-mark g-sec-mark" aria-hidden="true" />
        </motion.div>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="g-facts"
        >
          {facts.map((fact) => (
            <motion.div key={fact.title} variants={fadeUp} className="g-fact">
              <span className="g-fact-ico">{fact.icon}</span>
              <div className="g-fact-body">
                <h3 className="g-fact-title">{fact.title}</h3>
                <p className="g-fact-desc">{fact.body}</p>
              </div>
              <span className="g-fact-proof">{fact.proof}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {!isAuthenticated && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-12 text-center text-sm text-[var(--g-muted)]"
        >
          Try it without an account — guest links live for 24 hours.{" "}
          <span className="font-bold text-[var(--g-ink)]">
            Sign up to keep yours forever.
          </span>
        </motion.p>
      )}
    </section>
  );
};

export default WhyShortLink;
