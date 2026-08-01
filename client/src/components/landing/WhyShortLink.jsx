import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";
import { useAuthToken } from "../../features/auth/useAuthActions";
import {
  LuActivity,
  LuGlobe,
  LuInfinity,
  LuMapPin,
  LuQrCode,
  LuShield,
  LuTimer,
  LuZap,
} from "react-icons/lu";

const facts = [
  {
    title: "One hop. Zero waiting.",
    body: "Every redirect resolves straight from a Redis cache — a single hop, no database round-trip between click and destination.",
    proof: "launch → 302 → destination",
    icon: <LuZap className="w-5 h-5" />,
    featured: true,
  },
  {
    title: "Guest links: 24 hours",
    body: "Shorten without an account — your link lives for exactly 24 hours, then expires. Sign up to keep it forever.",
    proof: "auto-expires",
    icon: <LuTimer className="w-5 h-5" />,
  },
  {
    title: "Analytics never slow clicks",
    body: "Clicks are recorded in the background, so tracking never delays a redirect.",
    proof: "fire-and-forget",
    icon: <LuActivity className="w-5 h-5" />,
  },
  {
    title: "Every click, fully logged",
    body: "Country, city, device, browser, and operating system captured on every single click.",
    proof: "country · city · device · browser · os",
    icon: <LuMapPin className="w-5 h-5" />,
  },
  {
    title: "Ownership enforced",
    body: "You can only edit or delete your own links — every request checks ownership.",
    proof: "your links only",
    icon: <LuShield className="w-5 h-5" />,
  },
  {
    title: "HTTPS on every redirect",
    body: "Every redirect is served as a 302 over HTTPS — never a plain HTTP hop.",
    proof: "302 · always HTTPS",
    icon: <LuGlobe className="w-5 h-5" />,
  },
  {
    title: "QR codes included",
    body: "Every link ships with a scannable QR code, ready to print or share.",
    proof: "scan anywhere",
    icon: <LuQrCode className="w-5 h-5" />,
  },
  {
    title: "Free forever",
    body: "No credit card, no trials, no surprise pricing — every feature, every account.",
    proof: "$0 · no card required",
    icon: <LuInfinity className="w-5 h-5" />,
  },
];

const WhyShortLink = () => {
  const isAuthenticated = useAuthToken();

  return (
    <section className="relative">
      <div className="mx-auto px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Why short.link"
          title="A shortener that respects your links."
          subtitle="Most link tools bury the basics behind pricing tiers. short.link keeps the essentials fast, open, and free."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {facts.map((fact, index) => (
            <motion.div
              key={fact.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`group bg-white border rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${
                fact.featured
                  ? "md:col-span-2 lg:col-span-2 border-[#6366F1]/25 bg-[#6366F1]/5"
                  : "border-[#D4D4D8]"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                  fact.featured
                    ? "bg-[#6366F1] text-white"
                    : "bg-gray-50 border border-[#D4D4D8] text-[#0A0A0A] group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#6366F1]"
                }`}
              >
                {fact.icon}
              </div>
              <h3 className="text-base font-semibold text-[#0A0A0A] mt-4">
                {fact.title}
              </h3>
              <p className="text-sm text-[#6B6B6B] mt-2 leading-relaxed max-w-lg">
                {fact.body}
              </p>
              <span className="inline-block mt-4 font-mono text-[11px] text-[#6B6B6B] bg-white border border-[#E5E5EA] rounded-md px-2.5 py-1.5 whitespace-nowrap">
                {fact.proof}
              </span>
            </motion.div>
          ))}
        </div>

        {!isAuthenticated && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 text-center text-sm text-[#6B6B6B]"
          >
            Try it without an account — guest links live for 24 hours.{" "}
            <span className="font-medium text-[#0A0A0A]">
              Sign up to keep yours forever.
            </span>
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default WhyShortLink;
