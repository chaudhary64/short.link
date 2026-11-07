import { Outlet } from "react-router";
import { LuChartNoAxesColumn, LuLink, LuQrCode } from "react-icons/lu";
import Nav from "../layout/Nav";
import Footer from "../layout/Footer";
import "../../styles/marketing.css";

/* Every claim below is taken from the capabilities the product actually ships. */
const POINTS = [
  {
    icon: LuLink,
    proof: "302 · HTTPS",
    title: "One-hop redirects",
    body: "A short link resolves in a single 302, with Redis in front of the database.",
  },
  {
    icon: LuChartNoAxesColumn,
    proof: "clicks · countries",
    title: "Analytics per link",
    body: "Clicks, unique visitors, countries, devices and browsers for every link.",
  },
  {
    icon: LuQrCode,
    proof: "PNG",
    title: "QR codes included",
    body: "Every link gets a QR code you can download and put on print or packaging.",
  },
];

const AuthLayout = () => (
  <div className="m-shell">
    <Nav />

    <main className="m-main auth-main">
      <div className="m-wrap auth-wrap">
        <div className="auth-body">
          <aside className="auth-aside">
            <div className="auth-aside-copy">
              <h2 className="auth-aside-title">Every link, accounted for.</h2>
              <p className="auth-aside-sub">
                Create a short link, share it anywhere, and see where the clicks
                come from.
              </p>
            </div>

            <ul className="auth-points">
              {POINTS.map(({ icon: Icon, proof, title, body }) => (
                <li key={title} className="auth-point">
                  <Icon className="auth-point-icon w-4 h-4" aria-hidden />
                  <div className="auth-point-text">
                    <p className="auth-point-title">{title}</p>
                    <p className="auth-point-body">{body}</p>
                  </div>
                  <span className="auth-point-proof">{proof}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="auth-panel">
            <Outlet />
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default AuthLayout;
