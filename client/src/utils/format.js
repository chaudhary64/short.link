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

const currentYear = () => new Date().getFullYear();

const formatDateTime = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export {
  formatDate,
  formatShort,
  formatDateTime,
  sanitizeShortCode,
  currentYear,
};
