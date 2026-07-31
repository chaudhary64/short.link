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
        <span className="w-1.5 h-1.5 bg-[#10b981] shrink-0" />
        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-400">
          {eyebrow}
        </span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-[1.1]">
        {title}
      </h2>

      {subtitle && (
        <p
          className={`text-gray-500 mt-4 leading-relaxed max-w-xl ${
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
