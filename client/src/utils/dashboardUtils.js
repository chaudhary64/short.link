export const calculateDashboardStats = (links) => {
  const totalViews = links.reduce((sum, link) => sum + (link.views ?? 0), 0);
  const activeCount = links.filter((link) => link.status === "active").length;
  const disabledCount = links.length - activeCount;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const linksCreatedThisWeek = links.filter(
    (link) => link.created_at && new Date(link.created_at) >= oneWeekAgo,
  ).length;

  const viewsThisWeek = links
    .filter(
      (link) => link.created_at && new Date(link.created_at) >= oneWeekAgo,
    )
    .reduce((sum, link) => sum + (link.views ?? 0), 0);

  const linksDelta =
    linksCreatedThisWeek === 0
      ? { text: "No new links this week", tone: "neutral" }
      : { text: `+${linksCreatedThisWeek} new this week`, tone: "positive" };

  const viewsDelta =
    viewsThisWeek === 0
      ? { text: "No views this week", tone: "neutral" }
      : {
          text: `+${viewsThisWeek.toLocaleString()} views this week`,
          tone: "positive",
        };

  const activeDescription =
    disabledCount === 0
      ? { text: "All links active", tone: "success" }
      : {
          text: `${disabledCount} ${disabledCount === 1 ? "link" : "links"} disabled`,
          tone: "warning",
        };

  return {
    totalViews,
    activeCount,
    linksDelta,
    viewsDelta,
    activeDescription,
  };
};

export const getFavicon = (url) => {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
};

export const formatRelativeTime = (iso) => {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};
