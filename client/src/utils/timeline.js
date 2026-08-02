import { formatDate } from "./format";

const DAY = 24 * 60 * 60 * 1000;

const DEVICE_OPTIONS = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "tablet", label: "Tablet" },
];

const timeAgo = (isoStr) => {
  if (!isoStr) return "";
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(isoStr);
};

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const dayKeyLabel = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, new Date(now.getTime() - DAY))) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const deviceAccent = (type) => {
  if (type === "mobile") return "bg-[#10B981]";
  if (type === "tablet") return "bg-[#F59E0B]";
  if (type === "desktop") return "bg-[#6366F1]";
  return "bg-[#D4D4D8]";
};

export { DEVICE_OPTIONS, dayKeyLabel, deviceAccent, timeAgo };
