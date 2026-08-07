import {
  FaAndroid,
  FaApple,
  FaChrome,
  FaEdge,
  FaFirefox,
  FaLinux,
  FaOpera,
  FaSafari,
  FaWindows,
} from "react-icons/fa6";
import {
  LuCpu,
  LuGlobe,
  LuMonitor,
  LuSmartphone,
  LuTablet,
} from "react-icons/lu";

const BROWSER_COLORS = {
  Chrome: "#4285F4",
  Safari: "#0F7FC0",
  Firefox: "#FF7139",
  Edge: "#0078D7",
  Opera: "#FF1B2D",
};

const OS_COLORS = {
  Windows: "#00A4EF",
  Android: "#3DDC84",
  iOS: "#9CA3AF",
  macOS: "#A2AAAD",
  Linux: "#F59E0B",
};

const hidden = { "aria-hidden": "true" };

const withColor = (className, hex) => ({
  className,
  style: { color: hex },
  ...hidden,
});

const BrowserIcon = ({ name, className = "w-3.5 h-3.5" }) => {
  const n = (name || "").toLowerCase();
  if (n.includes("chrome"))
    return <FaChrome {...withColor(className, BROWSER_COLORS.Chrome)} />;
  if (n.includes("safari"))
    return <FaSafari {...withColor(className, BROWSER_COLORS.Safari)} />;
  if (n.includes("firefox"))
    return <FaFirefox {...withColor(className, BROWSER_COLORS.Firefox)} />;
  if (n.includes("edge"))
    return <FaEdge {...withColor(className, BROWSER_COLORS.Edge)} />;
  if (n.includes("opera"))
    return <FaOpera {...withColor(className, BROWSER_COLORS.Opera)} />;
  return <LuGlobe className={className} {...hidden} />;
};

const OsIcon = ({ name, className = "w-3.5 h-3.5" }) => {
  const n = (name || "").toLowerCase();
  if (n.includes("windows"))
    return <FaWindows {...withColor(className, OS_COLORS.Windows)} />;
  if (n.includes("android"))
    return <FaAndroid {...withColor(className, OS_COLORS.Android)} />;
  if (n.includes("ios") || n.includes("iphone"))
    return <FaApple {...withColor(className, OS_COLORS.iOS)} />;
  if (n.includes("mac"))
    return <FaApple {...withColor(className, OS_COLORS.macOS)} />;
  if (n.includes("linux") || n.includes("ubuntu"))
    return <FaLinux {...withColor(className, OS_COLORS.Linux)} />;
  return <LuCpu className={className} {...hidden} />;
};

const DeviceIcon = ({ type, className = "w-3.5 h-3.5" }) => {
  if (type === "mobile")
    return <LuSmartphone className={className} {...hidden} />;
  if (type === "tablet") return <LuTablet className={className} {...hidden} />;
  return <LuMonitor className={className} {...hidden} />;
};

export { BrowserIcon, DeviceIcon, OsIcon };
