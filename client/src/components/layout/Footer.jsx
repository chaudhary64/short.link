import { Link } from "react-router";
import Logo from "../ui/Logo";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Analytics", to: "/analytics" },
      { label: "Sign up", to: "/signup" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "FAQ", to: "/#faq" },
      { label: "Sign in", to: "/login" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#D4D4D8] bg-[#FAFAFA] px-4 sm:px-6 py-10 sm:py-12 mt-auto">
      <div className="mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <h3 className="font-display text-lg font-bold tracking-[-0.03em] text-[#0A0A0A] m-0">
              short.link
            </h3>
          </div>
          <p className="text-sm text-[#6B6B6B] mt-3 leading-relaxed">
            Fast, trackable links for everyone — free forever, no card required.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:gap-16">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C] mb-3">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 pt-6 border-t border-[#D4D4D8] flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-xs text-[#9C9C9C]">
          &copy; {new Date().getFullYear()} short.link. All rights reserved.
        </p>
        <p className="text-xs text-[#9C9C9C]">Fast · Trackable · Free</p>
      </div>
    </footer>
  );
};

export default Footer;
