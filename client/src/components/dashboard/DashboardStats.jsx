import useCountUp from "../../hooks/useCountUp";

const DashboardStats = ({
  totalLinks,
  totalViews,
  linksDelta,
  viewsDelta,
  activeCount,
  links = [],
}) => {
  const linksValue = useCountUp(totalLinks).toLocaleString();
  const viewsValue = useCountUp(totalViews).toLocaleString();
  const activeValue = useCountUp(activeCount).toLocaleString();

  const latestLink = links.length
    ? [...links].sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      )[0]
    : null;
  const avgViewsPerLink =
    totalLinks > 0 ? Math.round(totalViews / totalLinks) : 0;
  const disabledCount = Math.max(0, totalLinks - activeCount);
  const activeShare = totalLinks > 0 ? (activeCount / totalLinks) * 100 : 0;

  return (
    <section className="g-stats">
      <div className="g-cell">
        <span className="g-cell-label">Links</span>
        <span className="g-cell-num">{linksValue}</span>
        <span className={`g-cell-delta ${linksDelta.tone === "positive" ? "on" : ""}`}>
          {linksDelta.tone === "positive" ? "▲ " : "· "}
          {linksDelta.text.toUpperCase()}
        </span>
        <span className="g-cell-note">
          {latestLink?.short_code ? (
            <>
              LATEST: <span className="g-code">{latestLink.short_code}</span>
            </>
          ) : (
            `${totalLinks} TOTAL`
          )}
        </span>
      </div>

      <div className="g-cell">
        <span className="g-cell-label">Views</span>
        <span className="g-cell-num">{viewsValue}</span>
        <span className={`g-cell-delta ${viewsDelta.tone === "positive" ? "on" : ""}`}>
          {viewsDelta.tone === "positive" ? "▲ " : "· "}
          {viewsDelta.text.toUpperCase()}
        </span>
        <span className="g-cell-note">
          ~{avgViewsPerLink.toLocaleString()} PER LINK
        </span>
      </div>

      <div className="g-cell">
        <span className="g-cell-label">Active</span>
        <span className="g-cell-num g-red">{activeValue}</span>
        <span className="g-cell-delta">
          <span className="g-sq g-sq-red" aria-hidden />
          {disabledCount > 0 ? (
            <>
              {disabledCount} PAUSED · {Math.round(activeShare)}% LIVE
            </>
          ) : (
            <>ALL {totalLinks} LINKS LIVE</>
          )}
        </span>
        <span className="g-cell-note">
          <span className="g-sq g-sq-yellow" aria-hidden />
          {Math.round(activeShare)}% SHARE
        </span>
      </div>
    </section>
  );
};

export default DashboardStats;
