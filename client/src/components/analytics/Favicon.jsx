import { useState } from "react";
import { LuGlobe } from "react-icons/lu";

const Favicon = ({ url, className = "w-3.5 h-3.5", alt = "" }) => {
  const [failedUrl, setFailedUrl] = useState(null);

  let host;
  try {
    host = url ? new URL(url).hostname : null;
  } catch {
    host = null;
  }

  const failed = failedUrl === url;

  if (!host || failed) {
    return <LuGlobe className={className} aria-hidden="true" />;
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${host}&sz=32`}
      alt={alt || host}
      title={host}
      loading="lazy"
      onError={() => setFailedUrl(url)}
      className={`object-contain shrink-0 inline-block align-middle rounded-[3px] ${className}`}
    />
  );
};

export default Favicon;
