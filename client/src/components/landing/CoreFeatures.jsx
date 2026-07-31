import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";

const features = [
  {
    title: "Lightning-fast redirects",
    description:
      "Every click resolves in a single hop, served through a Redis-backed cache — no redirect chains, no waiting.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Link analytics",
    description:
      "Total clicks, unique visitors, and geographic data for every link, updated live in your dashboard.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Link management",
    description:
      "Edit destinations, toggle links on or off, and delete the ones you no longer need — all from one screen.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="7" cy="18" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Secure HTTPS redirects",
    description:
      "All redirects are served over HTTPS, so every link you share stays safe no matter where it lands on the web.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <rect x="4" y="10" width="16" height="11" rx="0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 018 0v3" />
        <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Custom aliases",
    description:
      "Choose a memorable short code instead of a random one — perfect for campaigns, social bios, and print.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    title: "QR codes",
    description:
      "Every link comes with an instant QR code, ready to scan from any phone — download it in one click.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 14h4v4h-4zM14 18h1M18 14h1" />
      </svg>
    ),
  },
];

const CoreFeatures = () => {
  return (
    <section className="relative">
      <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Core features"
          title="Everything a short link should be."
          subtitle="The essentials, done well — nothing more, nothing less."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: index * 0.06,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group bg-white border border-gray-200 p-6 hover:border-[#10b981]/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-11 h-11 bg-[#10b981]/10 text-[#10b981] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#10b981]/15">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mt-4">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
