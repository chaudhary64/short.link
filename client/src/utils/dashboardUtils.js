export const calculateDashboardStats = (links) => {
  const totalViews = links.reduce((sum, link) => sum + (link.views ?? 0), 0);
  const activeCount = links.filter((link) => link.status === "active").length;
  const disabledCount = links.length - activeCount;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const linksCreatedThisWeek = links.filter(
    (link) => link.created_at && new Date(link.created_at) >= oneWeekAgo
  ).length;

  const viewsThisWeek = links
    .filter((link) => link.created_at && new Date(link.created_at) >= oneWeekAgo)
    .reduce((sum, link) => sum + (link.views ?? 0), 0);

  const linksDeltaDescription =
    linksCreatedThisWeek === 0
      ? "No new links this week"
      : `+${linksCreatedThisWeek} new this week`;

  const viewsDeltaDescription =
    viewsThisWeek === 0
      ? "No views this week"
      : `+${viewsThisWeek.toLocaleString()} views this week`;

  const activeLinksDescription =
    disabledCount === 0
      ? "All links active"
      : `${disabledCount} ${disabledCount === 1 ? "link" : "links"} disabled`;

  return {
    totalViews,
    activeCount,
    linksDeltaDescription,
    viewsDeltaDescription,
    activeLinksDescription,
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
