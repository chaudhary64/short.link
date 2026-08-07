import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const Collapse = ({ open, children, className = "", ...rest }) => {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          {...rest}
          initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={
            reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }
          }
          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{
            duration: reduceMotion ? 0.12 : 0.22,
            ease: "easeInOut",
          }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Collapse;
