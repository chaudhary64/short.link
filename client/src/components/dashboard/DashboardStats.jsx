import { LuArrowUp } from "react-icons/lu";
import useCountUp from "../../hooks/useCountUp";

const PILL_STYLES = {
  positive: "bg-[#ECFDF5] text-[#047857] border-[#10B981]/25",
  warning: "bg-[#FFFBEB] text-[#B45309] border-[#F59E0B]/25",
  neutral: "bg-[#F3F4F6] text-[#6B6B6B] border-[#D4D4D8]",
};

const cardCls =
  "bg-white border border-[#D4D4D8] rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]";

const activeCardCls =
  "bg-white border border-[#D4D4D8] rounded-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)]";

const labelCls =
  "min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]";

const activeLabelCls =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C9C9C]";

const valueCls =
  "text-3xl font-display font-bold text-[#0A0A0A] tabular-nums tracking-[-0.03em] leading-none";

const DeltaPill = ({ delta }) => {
  if (!delta) return null;
  const tone = PILL_STYLES[delta.tone] ?? PILL_STYLES.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums whitespace-nowrap ${tone}`}
    >
      {delta.tone === "positive" && <LuArrowUp className="w-3 h-3" />}
      {delta.text}
    </span>
  );
};

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
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      )[0]
    : null;
  const avgViewsPerLink =
    totalLinks > 0 ? Math.round(totalViews / totalLinks) : 0;
  const disabledCount = Math.max(0, totalLinks - activeCount);
  const activeShare = totalLinks > 0 ? (activeCount / totalLinks) * 100 : 0;
  const disabledShare =
    totalLinks > 0 ? (disabledCount / totalLinks) * 100 : 0;

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className={cardCls}>
        <div className="flex items-start justify-between gap-2">
          <span className={labelCls}>Links</span>
          <DeltaPill delta={linksDelta} />
        </div>
        <p className={valueCls}>{linksValue}</p>
        {latestLink?.short_code ? (
          <p className="text-xs text-[#6B6B6B] truncate">
            Latest:{" "}
            <span className="font-mono font-semibold text-[#0A0A0A]">
              {latestLink.short_code}
            </span>
          </p>
        ) : (
          <p className="text-xs text-[#6B6B6B]">{totalLinks} total</p>
        )}
      </div>

      <div className={cardCls}>
        <div className="flex items-start justify-between gap-2">
          <span className={labelCls}>Views</span>
          <DeltaPill delta={viewsDelta} />
        </div>
        <p className={valueCls}>{viewsValue}</p>
        <p className="text-xs text-[#6B6B6B] truncate">
          ~{avgViewsPerLink.toLocaleString()} per link
        </p>
      </div>

      <div className={activeCardCls}>
        <p className={activeLabelCls}>Active</p>
        <div className="flex items-baseline justify-between gap-3">
          <p className={valueCls}>{activeValue}</p>
          <span className="text-[11px] text-[#9C9C9C] whitespace-nowrap min-w-0 truncate">
            of {totalLinks} live
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-2.5">
          <div className="flex h-2 rounded-full overflow-hidden bg-[#F3F4F6]">
            <div
              className="h-full bg-[rgb(var(--status-active-rgb))]"
              style={{ width: `${activeShare}%` }}
            />
            {disabledShare > 0 && (
              <div
                className="h-full bg-[#3F3F46]"
                style={{ width: `${disabledShare}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#6B6B6B]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--status-active-rgb))] shrink-0" />
              {activeCount} live
            </span>
            {disabledCount > 0 && (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#B45309]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F3F46] shrink-0" />
                {disabledCount} off
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardStats;
