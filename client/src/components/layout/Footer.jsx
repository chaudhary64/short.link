import { Link } from "react-router";
import { LuArrowUp } from "react-icons/lu";
import { currentYear } from "../../utils/format";

const columns = [
  {
    heading: "App",
    links: [
      { label: "Home", to: "/" },
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
      { label: "Forgot password", to: "/forgot-password" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="g-foot">
      <div className="flex w-full flex-col gap-10 border-t-2 border-t-[#141414] pt-16 pb-12">
        <div className="g-foot-main">
          <div className="g-foot-brand">
            <Link to="/" className="g-foot-wordmark" aria-label="short.link — home">
              short.link
            </Link>
            <p className="g-foot-tag">
              FAST · TRACKABLE · FREE — ALL MEASUREMENTS IN LINKS
            </p>
          </div>

          <div className="g-foot-cols">
            {columns.map((col) => (
              <div key={col.heading} className="g-foot-col">
                <p className="g-foot-col-head">{col.heading.toUpperCase()}</p>
                {col.links.map((link) => (
                  <Link key={link.to} to={link.to} className="g-foot-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

        </div>

        <div className="g-foot-bar">
          <span>© {currentYear()} short.link · ALL RIGHTS RESERVED</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="g-top-btn"
          >
            <LuArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
