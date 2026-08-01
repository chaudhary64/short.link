import { Fragment } from "react";
import { motion } from "motion/react";
import SectionHeading from "./SectionHeading";

const nodes = [
  {
    title: "Browser",
    sub: "React SPA · Vite",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z" />
      </svg>
    ),
  },
  {
    title: "Express API",
    sub: "REST · JWT auth",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <rect x="3" y="4" width="18" height="7" rx="0" />
        <rect x="3" y="13" width="18" height="7" rx="0" />
        <path strokeLinecap="round" d="M7 7.5h.01M7 16.5h.01" />
      </svg>
    ),
  },
  {
    title: "PostgreSQL",
    sub: "Links & users · Drizzle ORM",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      </svg>
    ),
  },
  {
    title: "Redis",
    sub: "Redirect cache · guest TTL",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h5v5H4zM10 5h5v5h-5zM16 5h4v5h-4zM7 11h5v5H7zM13 11h5v5h-5zM10 17h4v2h-4z" />
      </svg>
    ),
  },
];

const arrows = ["HTTPS", "JSON", "SQL"];

const Arrow = ({ label }) => (
  <div className="flex items-center justify-center gap-1.5 shrink-0 py-1">
    <span className="hidden md:block w-8 h-px border-t-2 border-dashed border-[#E8E8EC]" />
    <svg
      className="w-4 h-4 text-[#9C9C9C] hidden md:block"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
    <svg
      className="w-4 h-4 text-[#9C9C9C] md:hidden"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
    <span className="hidden md:block w-8 h-px border-t-2 border-dashed border-[#E8E8EC]" />
    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] px-1">
      {label}
    </span>
  </div>
);

const ArchitectureOverview = () => {
  return (
    <section className="relative">
      <div className="mx-auto px-6 py-20 sm:py-28">
        <SectionHeading
          eyebrow="Architecture"
          title="How a click becomes a redirect."
          subtitle="A simple, three-layer flow — the browser talks to the API, the API owns the data, and Redis keeps the hottest redirects fast."
        />

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-0">
          {nodes.map((node, index) => (
            <Fragment key={node.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex-1 w-full bg-white border border-[#E8E8EC] rounded-xl p-5 flex items-center gap-4 hover:border-[#D9D9DE] transition-colors duration-300"
              >
                <span className="w-11 h-11 bg-gray-50 border border-[#E8E8EC] rounded-lg text-[#0A0A0A] flex items-center justify-center shrink-0">
                  {node.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0A0A0A]">{node.title}</p>
                  <p className="text-xs text-[#9C9C9C] truncate">{node.sub}</p>
                </div>
              </motion.div>

              {index < nodes.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  className="relative flex justify-center"
                >
                  <Arrow label={arrows[index]} />
                </motion.div>
              )}
            </Fragment>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-xs text-[#9C9C9C] mt-6 text-center leading-relaxed"
        >
          Every redirect is served straight from the Redis cache — PostgreSQL stays the
          source of truth for your links.
        </motion.p>
      </div>
    </section>
  );
};

export default ArchitectureOverview;
