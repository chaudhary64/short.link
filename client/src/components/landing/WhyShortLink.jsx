import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";
import { useAuthToken } from "../../features/auth/useAuthActions";
import {
  LuActivity,
  LuArrowDown,
  LuArrowRight,
  LuEyeOff,
  LuMapPin,
  LuShield,
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
    title: "Private by design",
    body: "Your links get the full picture; your visitors stay anonymous. We log clicks and devices, never personal identity.",
    proof: "clicks, not identities",
    icon: <LuEyeOff className="w-5 h-5" />,
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
          subtitle="The details that make short.link dependable — speed, transparency, and ownership you can trust."
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
              className={`group rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 border ${
                fact.featured
                  ? "md:col-span-2 lg:col-span-2 border-[#6366F1]/40 bg-[#101018] hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                  : "border-[#D4D4D8] bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              }`}
            >
              {fact.featured ? (
                <div className="flex flex-col gap-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white flex items-center justify-center shadow-lg shadow-[#6366F1]/25">
                      {fact.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold tracking-[-0.01em] text-white">
                        {fact.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1.5 leading-relaxed max-w-xl">
                        {fact.body}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-2">
                      <span className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                        <span className="font-mono text-xs text-white">short.link/launch</span>
                      </span>

                      <LuArrowDown className="w-3.5 h-3.5 text-gray-500 shrink-0 self-center sm:hidden" />
                      <LuArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0 hidden sm:block" />

                      <span className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-[#6366F1]/15 border border-[#6366F1]/40 px-3 py-2">
                        <LuZap className="w-3.5 h-3.5 text-[#818CF8] shrink-0" />
                        <span className="font-mono text-xs text-white">redis cache · ~100ms</span>
                      </span>

                      <LuArrowDown className="w-3.5 h-3.5 text-gray-500 shrink-0 self-center sm:hidden" />
                      <LuArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0 hidden sm:block" />

                      <span className="inline-flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 px-3 py-2">
                        <span className="font-mono text-[11px] font-semibold text-[#10B981] shrink-0">302</span>
                        <span className="font-mono text-xs text-gray-300 truncate">destination</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-3 font-mono">
                      single cache hop · no database round-trip
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-300 bg-gray-50 border border-[#D4D4D8] text-[#0A0A0A] group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#6366F1]">
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
                </>
              )}
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
