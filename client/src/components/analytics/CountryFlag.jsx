import { useState } from "react";

const CountryFlag = ({ code, className = "w-4 h-4", alt = "" }) => {
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
