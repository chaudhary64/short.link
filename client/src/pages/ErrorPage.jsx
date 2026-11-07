import { Link, useRouteError } from "react-router";
import "../styles/marketing.css";
import Logo from "../components/ui/Logo";

const ErrorPage = () => {
  const error = useRouteError();
  const message =
    error instanceof Error ? error.message : "Something went wrong on this page.";

  return (
    <div className="err-shell">
      <Link to="/" className="m-brand err-brand" aria-label="short.link — home">
        <Logo className="m-brand-logo" />
        short.link
      </Link>

      <div className="err-wrap err-wrap--plain">
        <p className="m-eyebrow">Unexpected error</p>
        <p className="err-code" aria-hidden>
          !
        </p>
        <h1 className="err-title">This page hit a problem.</h1>
        <p className="err-body">
          {message} Reloading usually clears it; if it keeps happening, the
          dashboard and your links are still available.
        </p>
        <div className="err-actions">
          <button
            type="button"
            className="m-btn"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
          <Link to="/" className="m-btn m-btn-ghost">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
