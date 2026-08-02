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

const dayLabel = (isoStr) => {
  const d = new Date(isoStr);
  const now = new Date();
  if (isSameDay(d, now)) return "Today";
  if (isSameDay(d, new Date(now.getTime() - DAY))) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const hourLabel = (h) =>
  new Date(2000, 0, 1, h).toLocaleTimeString("en-US", { hour: "numeric" });

const dayStats = (items) => {
  const hours = Array(24).fill(0);
  const linkCounts = new Map();
  const countries = new Set();
  for (const t of items) {
    const d = new Date(t.clicked_at);
    hours[d.getHours()] += 1;
    linkCounts.set(t.short_code, (linkCounts.get(t.short_code) ?? 0) + 1);
    if (t.country) countries.add(t.country);
  }
  let peakHour = 0;
  hours.forEach((v, h) => {
    if (v > hours[peakHour]) peakHour = h;
  });
  const topLink =
    [...linkCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  return {
    hours,
    max: Math.max(1, ...hours),
    peakHour,
    topLink,
    countryCount: countries.size,
  };
};

const deviceAccent = (type) => {
  if (type === "mobile") return "bg-[#10B981]";
  if (type === "tablet") return "bg-[#F59E0B]";
  if (type === "desktop") return "bg-[#6366F1]";
  return "bg-[#D4D4D8]";
};

export {
  DEVICE_OPTIONS,
  dayLabel,
  dayStats,
  deviceAccent,
  hourLabel,
  timeAgo,
};
