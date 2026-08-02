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
  return new Date(`${isoStr}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export { formatTime, formatDate, formatShort };
