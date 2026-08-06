import { motion } from "motion/react";

const PageHeader = ({
  kicker,
  title,
  subtitle,
  children,
  className = "",
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.2, ease: "easeOut" }}
      className={`g-band ${className}`}
    >
      <div className="g-head">
        <div className="min-w-0 flex-1">
          {kicker && <div className="g-kicker">{kicker}</div>}
          <h1 className="g-h1">{title}</h1>
          {subtitle && <p className="g-sub">{subtitle}</p>}
        </div>
        {children}
      </div>
    </motion.section>
  );
};

export default PageHeader;
