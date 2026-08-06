import { Link } from "react-router";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import { useAuthToken } from "../features/auth/useAuthActions";

const NotFound = () => {
  const isAuthenticated = useAuthToken();

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
          <span className="g-kicker">SHORT.LINK · 2026</span>
        </div>

        <div className="g-404-grid">
          <div className="g-404-cell">
            <div className="g-404-giant">404</div>
          </div>

          <div className="g-404-cell">
            <span className="g-kicker">ROUTE MISSING</span>
            <p className="g-sub" style={{ marginTop: 10 }}>
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="g-404-cell">
            <span className="g-kicker">WHERE TO?</span>
            <div className="flex flex-wrap gap-2.5 mt-3">
              <Button as={Link} variant="primary" to="/">
                Go Home
              </Button>
              {isAuthenticated && (
                <Button as={Link} variant="secondary" to="/dashboard">
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
