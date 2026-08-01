import { motion } from "motion/react";

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-12 sm:mb-16 ${centered ? "text-center" : ""} ${className}`}
    >
      <div
        className={`flex items-center gap-2 mb-5 ${
          centered ? "justify-center" : ""
        }`}
      >
        <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0" />
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9C9C9C]">
          {eyebrow}
        </span>
      </div>

      <h2 className="text-[28px] sm:text-[32px] font-display font-bold tracking-[-0.03em] text-[#0A0A0A] leading-[1.1]">
        {title}
      </h2>

      {subtitle && (
        <p
          className={`text-[15px] text-[#6B6B6B] mt-4 leading-relaxed max-w-xl ${
            centered ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
