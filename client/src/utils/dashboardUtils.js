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
      ? "None created this week"
      : `+${linksCreatedThisWeek} created this week`;

  const viewsDeltaDescription =
    viewsThisWeek === 0
      ? "None from this week's links"
      : `+${viewsThisWeek.toLocaleString()} from this week`;

  const activeLinksDescription =
    disabledCount === 0 ? "All links active" : `${disabledCount} disabled`;

  return {
    totalViews,
    activeCount,
    linksDeltaDescription,
    viewsDeltaDescription,
    activeLinksDescription,
  };
};
