import { motion } from "motion/react";
import { Link } from "react-router";
import Logo from "../ui/Logo";
import { fadeUp, staggerContainer } from "../../utils/motion";

const columns = [
  {
    heading: "Product",
    links: [
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
      { label: "Settings", to: "/settings" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#D4D4D8] bg-[#FAFAFA] px-4 sm:px-6 pt-20 sm:pt-28 pb-10 sm:pb-12 mt-auto">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="mx-auto flex flex-col md:flex-row justify-between gap-10"
      >
        <motion.div variants={fadeUp} className="max-w-xs">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <h3 className="font-display text-lg font-bold tracking-[-0.03em] text-[#0A0A0A] m-0">
              short.link
            </h3>
          </div>
          <p className="text-sm text-[#6B6B6B] mt-3 leading-relaxed">
            Fast, trackable links for everyone — free forever, no card required.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 gap-8 sm:gap-16"
        >
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-3">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors duration-150"
                    >
                      {link.label}
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
        className="mx-auto mt-10 pt-6 border-t border-[#D4D4D8] flex flex-col sm:flex-row justify-between items-center gap-2"
      >
        <p className="text-xs text-[#9C9C9C]">
          &copy; {new Date().getFullYear()} short.link. All rights reserved.
        </p>
        <p className="text-xs text-[#9C9C9C]">Fast · Trackable · Free</p>
      </motion.div>
    </footer>
  );
};

export default Footer;
