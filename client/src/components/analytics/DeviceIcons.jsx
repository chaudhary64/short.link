import { LuCpu, LuGlobe, LuMonitor, LuSmartphone, LuTablet } from "react-icons/lu";

const BrowserIcon = ({ className = "w-3.5 h-3.5" }) => (
  <LuGlobe className={className} />
);

const DeviceIcon = ({ type, className = "w-3.5 h-3.5" }) => {
  if (type === "mobile") return <LuSmartphone className={className} />;
  if (type === "tablet") return <LuTablet className={className} />;
  return <LuMonitor className={className} />;
};

const OsIcon = ({ className = "w-3.5 h-3.5" }) => (
  <LuCpu className={className} />
);

export { BrowserIcon, DeviceIcon, OsIcon };
