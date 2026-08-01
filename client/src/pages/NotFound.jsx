import { Link } from "react-router";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import Nav from "../components/layout/Nav";
import Footer from "../components/layout/Footer";

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: "blur(6px)" }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="min-h-screen text-gray-900 flex flex-col font-body"
    >
      <Nav isAuthenticated={false} />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 w-full mx-auto">
        <div className="text-center max-w-lg">
          <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-4">
            Error 404
          </p>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tight text-gray-900 leading-none mb-4">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-3">
            Page not found
          </h2>
          <p className="text-base text-gray-500 mb-10 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Double-check the URL or head back home.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button as={Link} variant="primary" size="large" to="/">
              Go Home
            </Button>
            <Button as={Link} variant="secondary" size="large" to="/dashboard">
              Dashboard
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
};

export default NotFound;
