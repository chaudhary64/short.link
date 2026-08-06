import {
  LuCheck,
  LuLoaderCircle,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";

const AliasAvailabilityHint = ({ status, className = "" }) => {
  if (status === "idle") return null;

  const content = {
    checking: {
      icon: <LuLoaderCircle className="w-3 h-3 animate-spin" />,
      text: "Checking availability…",
      cls: "text-[#6b6b6b]",
    },
    available: {
      icon: <LuCheck className="w-3 h-3" />,
      text: "Alias is available",
      cls: "text-[#1e7d4f]",
    },
    taken: {
      icon: <LuX className="w-3 h-3" />,
      text: "Alias is already taken",
      cls: "text-[#d62828]",
    },
    error: {
      icon: <LuTriangleAlert className="w-3 h-3" />,
      text: "Couldn't check availability",
      cls: "text-[#b45309]",
    },
  }[status];

  return (
    <p
      className={`flex items-center gap-1.5 text-xs mt-1.5 font-semibold tracking-wide ${content.cls} ${className}`}
      role="status"
    >
      {content.icon}
      <span>{content.text}</span>
    </p>
  );
};

export default AliasAvailabilityHint;
