import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "../../utils/motion";

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
      variants={staggerContainer(0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`relative mb-10 ${centered ? "text-center" : ""} ${className}`}
    >
      <motion.p variants={fadeUp} className="g-kicker">
        {eyebrow}
      </motion.p>
      <motion.h2 variants={fadeUp} className="g-h2">
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className={`g-h2-sub ${centered ? "mx-auto" : ""}`}
        >
          {subtitle}
        </motion.p>
      )}
      <span className="g-mark g-sec-mark" aria-hidden="true" />
    </motion.div>
  );
};

export default SectionHeading;
