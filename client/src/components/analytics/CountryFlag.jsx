import { useState } from "react";

// Renders a real flag image instead of a flag emoji.
// Windows/Chrome does not render flag emoji glyphs (they show as blank or
// letter pairs), so we load the flag from flagcdn.com's ISO-3166 catalog.
const CountryFlag = ({ code, className = "w-4 h-4", alt = "" }) => {
  const [failed, setFailed] = useState(false);

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
      onError={() => setFailed(true)}
      className={`object-cover rounded-[2px] shrink-0 inline-block align-middle ${className}`}
    />
  );
};

export default CountryFlag;
