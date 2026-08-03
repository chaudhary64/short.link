import useAliasAvailability from "../../hooks/useAliasAvailability";
import {
  LuCheck,
  LuLoaderCircle,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";

const AliasAvailabilityHint = ({ alias, className = "" }) => {
  const status = useAliasAvailability(alias);

  if (status === "idle") return null;

  const content = {
    checking: {
      icon: <LuLoaderCircle className="w-3 h-3 animate-spin" />,
      text: "Checking availability…",
      cls: "text-[#6B6B6B]",
    },
    available: {
      icon: <LuCheck className="w-3 h-3" />,
      text: "Alias is available",
      cls: "text-[#047857]",
    },
    taken: {
      icon: <LuX className="w-3 h-3" />,
      text: "Alias is already taken",
      cls: "text-[#EF4444]",
    },
    error: {
      icon: <LuTriangleAlert className="w-3 h-3" />,
      text: "Couldn't check availability",
      cls: "text-[#B45309]",
    },
  }[status];

  return (
    <p
      className={`flex items-center gap-1.5 text-xs mt-1.5 ${content.cls} ${className}`}
      role="status"
    >
      {content.icon}
      <span>{content.text}</span>
    </p>
  );
};

export default AliasAvailabilityHint;
