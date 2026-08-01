import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { getAnalytics } from "../../api/analytics";
import { BarMeter } from "../analytics/charts";
import { flagEmoji } from "../../utils/format";
import { useAuthToken } from "../../features/auth/useAuthActions";
import {
  LuArrowRight,
  LuClock,
  LuLink,
  LuMonitor,
  LuMousePointerClick,
  LuSmartphone,
  LuTablet,
} from "react-icons/lu";

const timeAgo = (isoStr) => {
  if (!isoStr) return "—";
  const seconds = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const DeviceIcon = ({ type, className = "w-3.5 h-3.5" }) => {
  if (type === "mobile") return <LuSmartphone className={className} />;
  if (type === "tablet") return <LuTablet className={className} />;
  return <LuMonitor className={className} />;
};

const InsightsCard = ({ title, icon, right, children }) => (
  <div className="bg-white border border-[#D4D4D8] rounded-xl flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#D4D4D8]">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]">
        {icon}
        {title}
      </span>
      {right}
    </div>
    <div className="p-5 flex-1">{children}</div>
  </div>
);

const ViewAllLink = ({ to }) => (
  <Link
    to={to}
    className="text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors inline-flex items-center gap-1"
  >
    View all
    <LuArrowRight className="w-3 h-3" />
  </Link>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <span className="w-10 h-10 bg-gray-50 text-[#9C9C9C] border border-[#D4D4D8] rounded-lg flex items-center justify-center mb-3">
      <LuMousePointerClick className="w-5 h-5" />
    </span>
    <p className="text-sm font-medium text-[#0A0A0A] mb-1">{message}</p>
    <p className="text-xs text-[#9C9C9C]">
      Clicks will appear here once your links get traffic.
    </p>
  </div>
);

const SkeletonRows = ({ rows = 4 }) => (
  <div className="animate-pulse flex flex-col gap-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-[#D4D4D8] w-24 rounded" />
          <div className="h-3 bg-[#F3F4F6] w-8 rounded" />
        </div>
        <div className="h-1.5 bg-[#F3F4F6] rounded-full" />
      </div>
    ))}
  </div>
);

const DashboardInsights = () => {
  const accessToken = useAuthToken();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["DASHBOARD_INSIGHTS"],
    queryFn: () => getAnalytics({}),
    enabled: !!accessToken,
    staleTime: 30_000,
    retry: 1,
  });

  const a = data?.data;
  const topLinks = (a?.topLinks ?? []).slice(0, 5);
  const timeline = (a?.timeline ?? []).slice(0, 6);
  const maxClicks = Math.max(...topLinks.map((l) => l.clicks ?? 0), 1);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Top links preview */}
      <InsightsCard
        title="Top links"
        icon={<LuLink className="w-3.5 h-3.5" />}
        right={<ViewAllLink to="/analytics" />}
      >
        {isLoading && <SkeletonRows rows={5} />}

        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-medium text-[#0A0A0A] mb-1">
              Couldn't load insights
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && topLinks.length === 0 && (
          <EmptyState message="No clicks yet" />
        )}

        {!isLoading && !isError && topLinks.length > 0 && (
          <div className="flex flex-col gap-4 max-h-64 overflow-y-auto overscroll-contain pr-1">
            {topLinks.map((l, i) => (
              <BarMeter
                key={l.id}
                label={
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                        i === 0
                          ? "bg-[#6366F1]/10 text-[#4F46E5]"
                          : "bg-[#F3F4F6] text-[#6B6B6B]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="font-mono text-xs font-medium text-[#0A0A0A] truncate">
                      {l.short_code}
                    </span>
                  </span>
                }
                value={l.clicks}
                pct={(l.clicks / maxClicks) * 100}
                right={
                  <span className="font-medium text-[#0A0A0A] tabular-nums">
                    {l.clicks.toLocaleString()}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </InsightsCard>

      {/* Recent activity feed */}
      <InsightsCard
        title="Recent activity"
        icon={<LuClock className="w-3.5 h-3.5" />}
        right={<ViewAllLink to="/analytics" />}
      >
        {isLoading && (
          <div className="animate-pulse flex flex-col divide-y divide-[#E5E5EA]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 bg-[#F3F4F6] border border-[#E5E5EA] rounded-full shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-3 bg-[#D4D4D8] w-28 rounded" />
                  <div className="h-3 bg-[#F3F4F6] w-20 rounded" />
                </div>
                <div className="h-3 bg-[#F3F4F6] w-10 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-medium text-[#0A0A0A] mb-1">
              Couldn't load activity
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs font-medium text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && timeline.length === 0 && (
          <EmptyState message="No recent activity" />
        )}

        {!isLoading && !isError && timeline.length > 0 && (
          <div className="flex flex-col -mx-5 max-h-64 overflow-y-auto overscroll-contain">
            {timeline.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-[#F6F6F9]"
              >
                <span className="w-8 h-8 flex items-center justify-center text-sm shrink-0 bg-gray-50 border border-[#E5E5EA] rounded-full">
                  {flagEmoji(t.country)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-medium text-[#0A0A0A] truncate">
                    {t.short_code}
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-[#9C9C9C] min-w-0">
                    <DeviceIcon type={t.device_type} />
                    <span className="capitalize truncate min-w-0">
                      {t.browser || "Unknown browser"}
                    </span>
                  </p>
                </div>
                <span className="text-[11px] text-[#9C9C9C] shrink-0 tabular-nums">
                  {timeAgo(t.clicked_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </InsightsCard>
    </section>
  );
};

export default DashboardInsights;
