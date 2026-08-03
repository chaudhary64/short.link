const formatTime = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatShort = (isoStr) => {
  if (!isoStr) return "—";
  const [y, m, d] = isoStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const sanitizeShortCode = (value) =>
  value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 21);

const shortLinkHost = () => {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  try {
    return new URL(base).host || "short.link";
  } catch {
    return base
      ? base.replace(/^https?:\/\//, "").replace(/\/+$/, "")
      : "short.link";
  }
};

const formatDateTime = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatFullTimestamp = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatModified = (createdAt, updatedAt) => {
  if (!createdAt || !updatedAt) return "—";
  const diff = new Date(updatedAt).getTime() - new Date(createdAt).getTime();
  if (Number.isNaN(diff) || diff < 5000) return "—";
  return formatFullTimestamp(updatedAt);
};

export {
  formatTime,
  formatDate,
  formatShort,
  formatDateTime,
  formatFullTimestamp,
  formatModified,
  sanitizeShortCode,
  shortLinkHost,
};
