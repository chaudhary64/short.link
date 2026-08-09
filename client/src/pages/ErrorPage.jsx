import { Link, useRouteError } from "react-router";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import { currentYear } from "../utils/format";

const ErrorPage = () => {
  const error = useRouteError();
  const message =
    error instanceof Error ? error.message : "Something went wrong on this page.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-24"
    >
      <div className="w-full max-w-[860px]">
        <div className="g-404-kickers">
          <span className="g-kicker">ERROR</span>
          <span className="g-kicker">SHORT.LINK · {currentYear()}</span>
        </div>

        <div className="g-404-grid">
          <div className="g-404-cell">
            <div className="g-404-giant">!</div>
          </div>

          <div className="g-404-cell">
            <span className="g-kicker">SOMETHING WENT WRONG</span>
            <p className="g-sub" style={{ marginTop: 10 }}>
              {message}
            </p>
          </div>

          <div className="g-404-cell">
            <span className="g-kicker">WHERE TO?</span>
            <div className="flex flex-wrap gap-2.5 mt-3">
              <Button as={Link} variant="primary" to="/">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorPage;
