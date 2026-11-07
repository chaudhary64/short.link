import { Link } from "react-router";
import { useAuthToken } from "../features/auth/useAuthActions";
import "../styles/marketing.css";

const NotFound = () => {
  const isAuthenticated = Boolean(useAuthToken());

  return (
    <div className="err-wrap">
      <p className="m-eyebrow">Error 404</p>
      <p className="err-code" aria-hidden>
        4<span>0</span>4
      </p>
      <h1 className="err-title">This page doesn&apos;t exist.</h1>
      <p className="err-body">
        The address may be mistyped, or the page was moved. Nothing is broken —
        your links and analytics are untouched.
      </p>
      <div className="err-actions">
        <Link to="/" className="m-btn">
          Go home
        </Link>
        {isAuthenticated ? (
          <Link to="/dashboard" className="m-btn m-btn-ghost">
            Open dashboard
          </Link>
        ) : (
          <Link to="/login" className="m-btn m-btn-ghost">
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFound;
