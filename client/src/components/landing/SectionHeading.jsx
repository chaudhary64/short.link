import { motion } from "motion/react";
import { blurUp, staggerContainer } from "../../utils/motion";

const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
}) => {
  const centered = align === "center";

  return (
    <motion.div
      variants={staggerContainer(0.12)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`mb-12 sm:mb-16 ${centered ? "text-center" : ""} ${className}`}
    >
      <motion.div
        variants={blurUp}
        className={`flex items-center gap-2 mb-5 ${
          centered ? "justify-center" : ""
        }`}
      >
        <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0" />
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9C9C9C]">
          {eyebrow}
        </span>
      </motion.div>

      <motion.h2
        variants={blurUp}
        className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[1.1]"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          variants={blurUp}
          className={`text-[15px] text-[#6B6B6B] mt-4 leading-relaxed max-w-xl ${
            centered ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
