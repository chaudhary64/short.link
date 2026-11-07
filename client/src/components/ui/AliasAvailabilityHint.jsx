import { LuCheck, LuLoaderCircle, LuTriangleAlert, LuX } from "react-icons/lu";

const AliasAvailabilityHint = ({ status, className = "" }) => {
  if (status === "idle") return null;

  const content = {
    checking: {
      icon: <LuLoaderCircle className="w-3 h-3 animate-spin" />,
      text: "Checking…",
      cls: "text-[var(--ink-3)]",
    },
    available: {
      icon: <LuCheck className="w-3 h-3" />,
      text: "Available",
      cls: "text-[var(--success)]",
    },
    taken: {
      icon: <LuX className="w-3 h-3" />,
      text: "Taken",
      cls: "text-[var(--danger)]",
    },
    error: {
      icon: <LuTriangleAlert className="w-3 h-3" />,
      text: "Check failed",
      cls: "text-[var(--warning)]",
    },
  }[status];

  return (
    <p
      className={`flex items-center gap-1.5 text-xs font-semibold tracking-wide ${content.cls} ${className}`}
      role="status"
    >
      {content.icon}
      <span>{content.text}</span>
    </p>
  );
};

export default AliasAvailabilityHint;
