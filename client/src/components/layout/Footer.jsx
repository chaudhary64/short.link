import { motion } from "motion/react";
import { Link } from "react-router";
import { fadeUp, staggerContainer } from "../../utils/motion";
import { LuArrowRight, LuArrowUp } from "react-icons/lu";

const columns = [
  {
    heading: "App",
    links: [
      { label: "Shorten a link", to: "/" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Analytics", to: "/analytics" },
      { label: "FAQ", to: "/#faq" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign up", to: "/signup" },
      { label: "Sign in", to: "/login" },
      { label: "Forgot password", to: "/forgot-password" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative w-full border-t border-[#D4D4D8] bg-[#FAFAFA] px-4 sm:px-6 pt-16 sm:pt-20 pb-10 sm:pb-12 mt-auto overflow-hidden">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="relative mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12"
      >
        <motion.div variants={fadeUp}>
          <Link
            to="/"
            aria-label="short.link — back to home"
            className="group block rounded-lg focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12"
          >
            <span className="block font-display font-bold tracking-[-0.045em] text-[#0A0A0A] text-[clamp(2rem,7vw,6.5rem)] leading-[0.9] select-none transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
              short.link
              <span
                aria-hidden="true"
                className="inline-block w-[0.13em] h-[0.13em] bg-[#10B981] ml-[0.05em] transition-transform duration-300 group-hover:scale-125 motion-reduce:transition-none"
              />
            </span>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 gap-14 sm:gap-20 shrink-0"
        >
          {columns.map((col) => (
            <div key={col.heading} className="min-w-40">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-4">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors duration-150"
                    >
                      {link.label}
                      <LuArrowRight className="w-3 h-3 shrink-0 -ml-1 -translate-x-1 opacity-0 text-[#6366F1] transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        className="relative mx-auto mt-14 sm:mt-16 pt-6 border-t border-[#D4D4D8] flex flex-col sm:flex-row justify-between items-center gap-3"
      >
        <p className="text-xs text-[#9C9C9C]">
          &copy; {new Date().getFullYear()} short.link. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          <p className="text-xs text-[#9C9C9C] font-mono">
            Fast · Trackable · Free
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="inline-flex items-center justify-center w-8 h-8 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-full transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/12 cursor-pointer"
          >
            <LuArrowUp className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
