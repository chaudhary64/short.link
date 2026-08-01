import { useState } from "react";

// Renders a real flag image instead of a flag emoji.
// Windows/Chrome does not render flag emoji glyphs (they show as blank or
// letter pairs), so we load the flag from flagcdn.com's ISO-3166 catalog.
const CountryFlag = ({ code, className = "w-4 h-4", alt = "" }) => {
  // Store the code that failed to load, not a boolean — when the `code` prop
  // changes the comparison fails naturally, so the fallback resets without
  // needing an effect (and a swapped prop never keeps a stale failure).
  const [failedCode, setFailedCode] = useState(null);

  const failed = failedCode === code;

  if (failed || !code || code.length !== 2) {
    return (
      <span
        className={`inline-flex items-center justify-center text-sm leading-none ${className}`}
        aria-hidden="true"
      >
        🌐
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={alt || code}
      title={code.toUpperCase()}
      loading="lazy"
      onError={() => setFailedCode(code)}
      className={`object-cover rounded-[2px] shrink-0 inline-block align-middle ${className}`}
    />
  );
};

export default CountryFlag;
