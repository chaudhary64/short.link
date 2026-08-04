import { motion } from "motion/react";
import { useAuthToken } from "../../features/auth/useAuthActions";
import { blurUp, fadeUp, staggerContainer } from "../../utils/motion";
import {
  LuActivity,
  LuEyeOff,
  LuMapPin,
  LuShield,
} from "react-icons/lu";

const facts = [
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
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-12 lg:gap-16 items-start">
          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={blurUp} className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0" />
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9C9C9C]">
                Why short.link
              </span>
            </motion.div>
            <motion.h2
              variants={blurUp}
              className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[1.1]"
            >
              A shortener that respects your links.
            </motion.h2>
            <motion.p
              variants={blurUp}
              className="text-[15px] text-[#6B6B6B] mt-4 leading-relaxed max-w-xl"
            >
              The details that make short.link dependable — speed,
              transparency, and ownership you can trust.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="bg-white border border-[#D4D4D8] rounded-xl overflow-hidden divide-y divide-[#E5E5EA]"
          >
            {facts.map((fact) => (
              <motion.div
                key={fact.title}
                variants={fadeUp}
                className="group flex items-start gap-4 px-5 sm:px-6 py-5 sm:py-6 transition-colors duration-200 hover:bg-[#F6F6F9]"
              >
                <div className="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center transition-colors duration-300 bg-gray-50 border border-[#D4D4D8] text-[#0A0A0A] group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-[#6366F1]">
                  {fact.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#0A0A0A]">
                    {fact.title}
                  </h3>
                  <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">
                    {fact.body}
                  </p>
                  <span className="inline-block mt-2.5 font-mono text-[11px] text-[#6B6B6B] bg-white border border-[#E5E5EA] rounded-md px-2.5 py-1.5 lg:hidden">
                    {fact.proof}
                  </span>
                </div>

                <span className="hidden lg:inline-block shrink-0 mt-0.5 font-mono text-[11px] text-[#6B6B6B] bg-white border border-[#E5E5EA] rounded-md px-2.5 py-1.5 whitespace-nowrap">
                  {fact.proof}
                </span>
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
            className="mt-12 text-center text-sm text-[#6B6B6B]"
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
